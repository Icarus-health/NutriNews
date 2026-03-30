import OpenAI from 'openai';
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

export async function curateArticle(item: RSSItem): Promise<CurationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set');
    return null;
  }

  const openai = new OpenAI({ apiKey });

  const userPrompt = `Erstelle eine NewsCard aus diesem Artikel:

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

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (parsed.insufficient) return null;

    // Validate required fields
    if (!parsed.headline || !parsed.snack_what) return null;

    const totalText = [parsed.snack_what, parsed.snack_result, parsed.snack_consequence, parsed.therapist_check].join(' ');
    const readTimeSec = Math.ceil(totalText.split(/\s+/).length / 3.5); // ~210 words/min reading speed

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
  } catch (error) {
    console.error('OpenAI curation failed:', error);
    return null;
  }
}
