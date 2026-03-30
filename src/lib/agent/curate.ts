import type { RSSItem } from './rss';

const SYSTEM_PROMPT = `Du bist ein erfahrener Ernaehrungswissenschaftler, der eine Fachnachrichtenplattform fuer Ernaehrungstherapeuten in Deutschland betreibt.

Deine Aufgabe: Erstelle aus einem Quellartikel eine strukturierte NewsCard.

WICHTIGE REGELN:
1. Verwende AUSSCHLIESSLICH Informationen aus dem Quellartikel. Erfinde NICHTS hinzu.
2. Wenn der Artikel nicht genug relevante Informationen enthaelt, antworte mit {"insufficient": true}.
3. Die Zusammenfassung muss faktisch korrekt und quellentreu sein.
4. Formuliere in klarem, professionellem Deutsch.
5. Der Therapist-Check soll die praktische Relevanz fuer Ernaehrungstherapeuten hervorheben.

EVIDENZ-LEVEL (waehle basierend auf der Studienart im Artikel):
- "Meta-Analyse" - Zusammenfassung mehrerer Studien
- "Systematische Review" - Systematische Uebersichtsarbeit
- "RCT" - Randomisierte kontrollierte Studie
- "Kohortenstudie" - Beobachtungsstudie mit Kohorte
- "Fallstudie" - Einzelfallbericht oder Fallserie
- "Expertenmeinung" - Expertenaussage, Leitlinie, Empfehlung
- "Laienpresse/Trend" - Allgemeine Nachrichten, Trends, Politik

KATEGORIEN (waehle die passendste):
Wissenschaft, Ernaehrungsmedizin, Klinik, Forschung, Politik, Medikation, Praxis, Paediatrie, Onkologie, Diabetologie, Gastroenterologie, Sportmedizin, Psychiatrie, Hepatologie, Nephrologie, Fettstoffwechsel, Ernaehrungspsychologie, Geriatrie, Trends

Antworte IMMER als valides JSON.`;

interface CurationResult {
  headline: string;
  snack_what: string;
  snack_result: string;
  snack_consequence: string;
  therapist_check: string;
  category_main: string;
  evidence_level: string;
  read_time_sec: number;
}

function buildUserPrompt(item: RSSItem): string {
  return `Erstelle eine NewsCard aus diesem Artikel:

TITEL: ${item.title}
QUELLE: ${item.source.name}
SPRACHE: ${item.source.language === 'en' ? 'Englisch (bitte auf Deutsch zusammenfassen)' : 'Deutsch'}
BESCHREIBUNG: ${item.description || 'Keine Beschreibung verfuegbar'}
URL: ${item.link}

Antwortformat:
{
  "headline": "Praegnante deutsche Ueberschrift (max 100 Zeichen)",
  "snack_what": "Was ist passiert/wurde untersucht? (1-2 Saetze)",
  "snack_result": "Was ist das Ergebnis? (1-2 Saetze)",
  "snack_consequence": "Was bedeutet das fuer die Praxis? (1-2 Saetze)",
  "therapist_check": "Praktische Einordnung fuer Ernaehrungstherapeuten (2-3 Saetze)",
  "category_main": "Eine der oben genannten Kategorien",
  "evidence_level": "Eines der oben genannten Evidenz-Level"
}

Oder falls der Artikel nicht relevant/ausreichend ist:
{"insufficient": true}`;
}

function parseResult(content: string, item: RSSItem): CurationResult | null {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.insufficient) return null;
    if (!parsed.headline || !parsed.snack_what) return null;

    const totalText = [parsed.snack_what, parsed.snack_result, parsed.snack_consequence, parsed.therapist_check].join(' ');
    const readTimeSec = Math.ceil(totalText.split(/\s+/).length / 3.5);

    return {
      headline: parsed.headline,
      snack_what: parsed.snack_what,
      snack_result: parsed.snack_result || '',
      snack_consequence: parsed.snack_consequence || '',
      therapist_check: parsed.therapist_check || '',
      category_main: parsed.category_main || item.source.defaultCategory,
      evidence_level: parsed.evidence_level || 'Expertenmeinung',
      read_time_sec: readTimeSec,
    };
  } catch {
    return null;
  }
}

// HF model priority: try larger models first, fall back to smaller ones
const HF_MODELS = [
  'Qwen/Qwen2.5-72B-Instruct',         // Excellent multilingual, free serverless
  'mistralai/Mixtral-8x7B-Instruct-v0.1', // Good at structured output
  'mistralai/Mistral-7B-Instruct-v0.3',   // Fallback
];

// --- Hugging Face Provider (free) ---
async function curateWithHuggingFace(item: RSSItem): Promise<CurationResult | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return null;

  for (const model of HF_MODELS) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(item) },
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`HF model ${model} failed (${res.status}): ${errText.slice(0, 200)}`);
        continue; // Try next model
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      const result = parseResult(content, item);
      if (result) {
        console.log(`Curated with HF model: ${model}`);
        return result;
      }
    } catch (err) {
      console.warn(`HF model ${model} error:`, err instanceof Error ? err.message : err);
      continue;
    }
  }

  return null;
}

// --- OpenAI Provider (paid, higher quality) ---
async function curateWithOpenAI(item: RSSItem): Promise<CurationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  // Dynamic import to avoid requiring openai package when using HF
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(item) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;

  return parseResult(content, item);
}

// --- Main entry: tries Hugging Face first, falls back to OpenAI ---
export async function curateArticle(item: RSSItem): Promise<CurationResult | null> {
  try {
    // Try Hugging Face first (free)
    if (process.env.HUGGINGFACE_API_KEY) {
      const result = await curateWithHuggingFace(item);
      if (result) return result;
    }

    // Fallback to OpenAI (paid)
    if (process.env.OPENAI_API_KEY) {
      const result = await curateWithOpenAI(item);
      if (result) return result;
    }

    console.error('No AI provider configured. Set HUGGINGFACE_API_KEY or OPENAI_API_KEY.');
    return null;
  } catch (error) {
    console.error('AI curation failed:', error);
    return null;
  }
}
