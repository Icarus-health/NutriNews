import type { RSSItem } from './rss';
import type { SourceType } from '@/types/database';

// ═══════════════════════════════════════════════════════════════
// System-Prompt: Erweitert um Evidenz-Bewertung, Praxisrelevanz,
// Handlungsempfehlung und Patientenfragen-Antizipation
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Du bist ein erfahrener Ernaehrungswissenschaftler, der eine Fachnachrichtenplattform fuer Ernaehrungstherapeuten in Deutschland betreibt.

Deine Aufgabe: Erstelle aus einem Quellartikel eine strukturierte NewsCard mit besonderem Fokus auf EVIDENZ-BEWERTUNG.

WICHTIGE REGELN:
1. Verwende AUSSCHLIESSLICH Informationen aus dem Quellartikel. Erfinde NICHTS hinzu.
2. Antworte NUR mit {"insufficient": true} wenn der Artikel KOMPLETT irrelevant fuer Ernaehrungstherapeuten ist (z.B. reine Werbung, Stellenanzeige, oder voellig themenfremder Inhalt). Bei Laienpresse, Berufspolitik und allgemeinen Ernaehrungsnachrichten: IMMER eine Card erstellen, auch wenn die Informationslage duenn ist — gerade diese Artikel sind wertvoll fuer die Berufsgruppe.
3. Die Zusammenfassung muss faktisch korrekt und quellentreu sein.
4. Formuliere in klarem, professionellem Deutsch.
5. Der Therapist-Check soll die praktische Relevanz fuer Ernaehrungstherapeuten hervorheben.
6. Die Evidenz-Einordnung ist PFLICHT: Bewerte Studiendesign, Stichprobengroesse, Limitationen und Uebertragbarkeit auf deutsche Ernaehrungstherapie-Praxis.

EVIDENZ-LEVEL (waehle basierend auf der Studienart im Artikel):
- "Meta-Analyse" - Zusammenfassung mehrerer Studien
- "Systematische Review" - Systematische Uebersichtsarbeit
- "RCT" - Randomisierte kontrollierte Studie
- "Kohortenstudie" - Beobachtungsstudie mit Kohorte
- "Fallstudie" - Einzelfallbericht oder Fallserie
- "Expertenmeinung" - Expertenaussage, Leitlinie, Empfehlung
- "Laienpresse/Trend" - Allgemeine Nachrichten, Trends, Politik

KATEGORIEN (waehle die passendste):
Kuenstliche Ernaehrung, Onkologische Ernaehrung, Geriatrie & Sarkopenie, Nieren & Leber, GLP-1 & Adipositastherapie, Diabetologie & Ernaehrung, Gastroenterologie, Supplements & NEM, Kardiovaskulaer, Psychiatrie & Ernaehrung, Paediatrische Ernaehrung, Nachhaltigkeit & Ernaehrung, Sport & klinische Ernaehrung, Mikronaehrstoffe klinisch, Adipositas & Gewichtsmanagement, Berufspolitik & Recht, Fortbildung & Lehre, Laienpresse & Patientenfragen, Internationale Perspektive, Medikament-Naehrstoff-Interaktionen

PRAXISRELEVANZ-SCORE (1-5):
1 = Theoretisch interessant, kein unmittelbarer Praxisbezug
2 = Hintergrundinformation, nuetzlich fuer Fachwissen
3 = Relevant fuer bestimmte Patientengruppen
4 = Direkt anwendbar in der Beratung bei haeufigen Fragestellungen
5 = Aendert morgen meine Beratungsempfehlung, sofort handlungsrelevant

Antworte IMMER als valides JSON.`;

const LAY_PRESS_ADDITION = `

ZUSAETZLICH fuer Laienpresse-Artikel:
Erstelle eine fachliche Gegenueberstellung im Feld "lay_press_fact_check".
Format: "MEDIEN: [Was behauptet wird] → FACH: [Fachliche Einordnung mit Evidenzlage]"
Setze evidence_level auf "Laienpresse/Trend".
Bewerte: Ist die Medienmeldung korrekt, uebertrieben, irreführend oder falsch?`;

const BERUFSPOLITIK_ADDITION = `

ZUSAETZLICH fuer Berufspolitik-Artikel:
Bewerte die AUSWIRKUNG auf den Berufsalltag von Ernaehrungstherapeuten.
- "policy_impact": Waehle eines von: "info" (zur Kenntnis), "beobachten" (Entwicklung verfolgen), "handeln" (jetzt aktiv werden)
- "policy_action_needed": Was muessen Ernaehrungstherapeuten konkret tun? (1-2 Saetze). Bei "info" kann dies leer sein.
Setze category_main auf "Berufspolitik & Recht".
Beruecksichtige: G-BA-Beschluesse, Leitlinien-Updates, GKV-Aenderungen, Berufsordnung, Abrechnungsaenderungen.`;

const INTERNATIONAL_ADDITION = `

ZUSAETZLICH fuer internationale Artikel:
Bewerte die UEBERTRAGBARKEIT auf den deutschen Kontext.
- "international_relevance_de": Erklaere in 2-3 Saetzen, was dieser internationale Beitrag fuer die deutsche Ernaehrungstherapie-Praxis bedeutet. Beruecksichtige Unterschiede in Gesundheitssystemen, Leitlinien und Ernaehrungsgewohnheiten.
Setze category_main auf "Internationale Perspektive", es sei denn, eine andere Kategorie ist deutlich passender.
Englische Inhalte muessen auf Deutsch zusammengefasst werden.`;

interface CurationResult {
  headline: string;
  snack_what: string;
  snack_result: string;
  snack_consequence: string;
  therapist_check: string;
  category_main: string;
  evidence_level: string;
  read_time_sec: number;
  // Sprint 1: Erweiterte Felder
  practice_relevance_score: number;
  action_recommendation: string;
  patient_question_anticipation: string;
  evidence_summary: string;
  lay_press_fact_check: string | null;
  // Sprint 5: Berufspolitik & International
  policy_impact: string | null;
  policy_action_needed: string | null;
  international_relevance_de: string | null;
}

function buildUserPrompt(item: RSSItem): string {
  const isLayPress = item.source.sourceType === 'laienpresse';
  const isBerufspolitik = item.source.sourceType === 'berufspolitik';
  const isInternational = item.source.sourceType === 'international';

  const extraFields: string[] = [];
  if (isLayPress) {
    extraFields.push(`  "lay_press_fact_check": "MEDIEN: [Claim der Meldung] → FACH: [Fachliche Einordnung mit Evidenzlage] (2-3 Saetze)"`);
  }
  if (isBerufspolitik) {
    extraFields.push(`  "policy_impact": "info | beobachten | handeln"`);
    extraFields.push(`  "policy_action_needed": "Was muessen Ernaehrungstherapeuten konkret tun? (1-2 Saetze)"`);
  }
  if (isInternational) {
    extraFields.push(`  "international_relevance_de": "Was bedeutet das fuer die deutsche Ernaehrungstherapie-Praxis? (2-3 Saetze)"`);
  }

  const extraFieldsStr = extraFields.length > 0 ? `,\n${extraFields.join(',\n')}` : '';

  return `Erstelle eine NewsCard aus diesem Artikel:

TITEL: ${item.title}
QUELLE: ${item.source.name}
QUELLENTYP: ${item.source.sourceType}
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
  "evidence_level": "Eines der oben genannten Evidenz-Level",
  "practice_relevance_score": 1-5,
  "action_recommendation": "Was tue ich morgen in der Beratung konkret anders? (1-2 Saetze)",
  "patient_question_anticipation": "Welche Frage werden Patienten dazu stellen? (1 Satz)",
  "evidence_summary": "Kurze Evidenz-Einordnung: Studiendesign, Staerken, Limitationen, Uebertragbarkeit (2-3 Saetze)"${extraFieldsStr}
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

    const totalText = [parsed.snack_what, parsed.snack_result, parsed.snack_consequence, parsed.therapist_check, parsed.evidence_summary].filter(Boolean).join(' ');
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
      practice_relevance_score: Math.min(5, Math.max(1, Number(parsed.practice_relevance_score) || 3)),
      action_recommendation: parsed.action_recommendation || '',
      patient_question_anticipation: parsed.patient_question_anticipation || '',
      evidence_summary: parsed.evidence_summary || '',
      lay_press_fact_check: parsed.lay_press_fact_check || null,
      policy_impact: ['info', 'beobachten', 'handeln'].includes(parsed.policy_impact) ? parsed.policy_impact : null,
      policy_action_needed: parsed.policy_action_needed || null,
      international_relevance_de: parsed.international_relevance_de || null,
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
function buildSystemPrompt(sourceType: SourceType): string {
  let prompt = SYSTEM_PROMPT;
  if (sourceType === 'laienpresse') prompt += LAY_PRESS_ADDITION;
  if (sourceType === 'berufspolitik') prompt += BERUFSPOLITIK_ADDITION;
  if (sourceType === 'international') prompt += INTERNATIONAL_ADDITION;
  return prompt;
}

async function curateWithHuggingFace(item: RSSItem): Promise<CurationResult | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(item.source.sourceType);

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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: buildUserPrompt(item) },
          ],
          temperature: 0.3,
          max_tokens: 1200,
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

  const systemPrompt = buildSystemPrompt(item.source.sourceType);

  // Dynamic import to avoid requiring openai package when using HF
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserPrompt(item) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 900,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;

  return parseResult(content, item);
}

// --- Anthropic Claude Provider (fallback, paid but reliable) ---
async function curateWithClaude(item: RSSItem): Promise<CurationResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(item.source.sourceType);

  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 900,
    temperature: 0.3,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildUserPrompt(item) }],
  });

  const block = response.content[0];
  if (block.type !== 'text') return null;

  const result = parseResult(block.text, item);
  if (result) console.log(`Curated with Claude (fallback): ${item.title?.slice(0, 60)}`);
  return result;
}

// ═══════════════════════════════════════════════════════════════
// Title-based pre-filter: skip obviously irrelevant items
// without calling any AI API (saves ~60% of API calls)
// ═══════════════════════════════════════════════════════════════

const SKIP_PATTERNS = [
  /^re:\s/i,                    // Email replies
  /podcast|webinar|anmeldung/i, // Event announcements
  /stellenangebot|job/i,        // Job listings
  /^advertisement|^anzeige/i,   // Ads
  /newsletter.*abonnieren/i,    // Newsletter signup pages
  /^corrigendum|^erratum/i,     // Corrections to papers
  /^withdrawn|^retracted/i,     // Retracted papers
];

const MIN_DESCRIPTION_LENGTH = 40; // Skip items with barely any content

function shouldSkipItem(item: RSSItem): boolean {
  const title = item.title ?? '';
  const desc = item.description ?? '';

  // Skip if title matches known irrelevant patterns
  if (SKIP_PATTERNS.some(p => p.test(title) || p.test(desc))) return true;

  // Skip if no meaningful content to curate
  if (!title && desc.length < MIN_DESCRIPTION_LENGTH) return true;
  if (title.length < 10) return true;

  return false;
}

// --- Main entry: HuggingFace first (free), Claude as fallback ---
export async function curateArticle(item: RSSItem): Promise<CurationResult | null> {
  // Pre-filter: skip obviously irrelevant items without calling AI
  if (shouldSkipItem(item)) {
    console.log(`Pre-filter skip: ${item.title?.slice(0, 60)}`);
    return null;
  }

  try {
    // 1. Try Hugging Face FIRST (free, no cost)
    if (process.env.HUGGINGFACE_API_KEY) {
      const result = await curateWithHuggingFace(item);
      if (result) return result;
    }

    // 2. Fallback to Claude (paid, but with prompt caching = cheap)
    if (process.env.ANTHROPIC_API_KEY) {
      const result = await curateWithClaude(item);
      if (result) return result;
    }

    // 3. Final fallback to OpenAI (paid)
    if (process.env.OPENAI_API_KEY) {
      const result = await curateWithOpenAI(item);
      if (result) return result;
    }

    console.error('No AI provider configured. Set HUGGINGFACE_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY.');
    return null;
  } catch (error) {
    console.error('AI curation failed:', error);
    return null;
  }
}
