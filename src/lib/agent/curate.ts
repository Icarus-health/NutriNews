import type { RSSItem } from './rss';
import type { SourceType } from '@/types/database';

// ═══════════════════════════════════════════════════════════════
// System-Prompt: Erweitert um Evidenz-Bewertung, Praxisrelevanz,
// Handlungsempfehlung und Patientenfragen-Antizipation
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Du bist ein erfahrener Ernaehrungswissenschaftler, der eine Fachnachrichtenplattform fuer Ernaehrungstherapeuten in Deutschland betreibt.

Deine Aufgabe: Erstelle aus einem Quellartikel eine strukturierte NewsCard. Die Zielgruppe sind praktizierende Ernaehrungstherapeuten — sie wollen KONKRETE FACHINHALTE, keine Zusammenfassung, dass "ein Artikel etwas diskutiert".

═══ ABSOLUT WICHTIGSTE REGEL: KONKRETHEIT ═══

FALSCH (generisch, nutzlos):
- "Die Leitlinie empfiehlt eine angepasste Ernaehrungstherapie bei Krebspatienten."
- "Der Artikel diskutiert die Bedeutung von Ernaehrung in der Onkologie."
- "Es wird empfohlen, auf die Naehrstoffzufuhr zu achten."
- "Therapeuten sollten mehr Fokus auf Ernaehrungsberatung legen."

RICHTIG (konkret, handlungsrelevant):
- "Laut S3-Leitlinie: Bei onkologischen Patienten Energie 25-30 kcal/kg/d, Protein 1.2-1.5 g/kg/d. Krebsdiaeten (ketogen, basisch) werden mangels Evidenz NICHT empfohlen."
- "Xerostomie-Management: Haeufige kleine Mahlzeiten, weiche/feuchte Konsistenz, saure Geschmackstraeger zur Speichelanregung. Supplementierung mit EPA/DHA (2g/d) bei Gewichtsverlust >5% in 3 Monaten."
- "Neue RCT (n=420): 30g Walnuesse/Tag ueber 12 Wochen senkte LDL-C um 5.4% (95%-KI: -7.2 bis -3.6%) vs. Kontrolle."

SCHREIBSTIL-REGELN:
- Nenne IMMER die konkreten Ergebnisse: Zahlen, Dosierungen, Grenzwerte, Empfehlungen, Naehrstoffe, Lebensmittel
- Bei Leitlinien: Was GENAU wird empfohlen? Welche Grenzwerte? Was wird NICHT empfohlen?
- Bei Studien: Studiendesign, n=?, Intervention, konkretes Ergebnis mit Effektstaerke
- Bei Berufspolitik: Was GENAU aendert sich? Ab wann? Welche Abrechnungsziffer?
- NIEMALS schreiben: "der Artikel bespricht...", "es wird diskutiert...", "Therapeuten sollten darauf achten..."
- STATTDESSEN: Die konkreten Inhalte direkt wiedergeben, als wuerdest du einer Kollegin die wichtigsten Punkte nennen
- Jeder Satz muss einen KONKRETEN Informationsgehalt haben, den der Therapeut vorher nicht wusste

WEITERE REGELN:
1. Verwende AUSSCHLIESSLICH Informationen aus dem Quellartikel. Erfinde NICHTS hinzu.
2. Erstelle IMMER eine Card — auch wenn der Artikel nur am Rande mit Ernaehrung zu tun hat oder die Informationslage duenn ist. Nutze dann Evidenz-Level "Laienpresse/Trend" oder "Expertenmeinung" und einen niedrigen Praxisrelevanz-Score (1-2). Antworte NUR mit {"insufficient": true} bei reiner Werbung oder Stellenanzeigen ohne jeden fachlichen Inhalt.
3. Die Zusammenfassung muss faktisch korrekt und quellentreu sein.
4. Formuliere in klarem, professionellem Deutsch.
5. Die Evidenz-Einordnung ist PFLICHT: Bewerte Studiendesign, Stichprobengroesse, Limitationen und Uebertragbarkeit.

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
1. Das Feld "therapist_check" MUSS beginnen mit: "⚠️ Laienpresse-Meldung:" gefolgt von der fachlichen Einordnung. Erklaere kurz was die Meldung behauptet und wie die Evidenzlage tatsaechlich ist. Patienten werden damit in die Praxis kommen.

2. Erstelle im Feld "lay_press_fact_check" eine strukturierte Gegenueberstellung:
Format GENAU so: "MEDIEN: [KONKRETER Claim des Artikels, ggf. als Zitat] → FACH: [Fachliche Einordnung mit konkreter Evidenzlage, Studientyp, ggf. Gegenbelege]"
Beispiel: "MEDIEN: 'Ketogene Ernaehrung heilt Krebs' → FACH: Kein RCT-Beleg fuer kurative Wirkung. DGEM 2022: Krebsdiaeten werden nicht empfohlen, da Risiko fuer Mangelzufuhr. Supportive Ernaehrungstherapie fokussiert auf Erhalt des Ernaehrungsstatus."

Setze evidence_level auf "Laienpresse/Trend".
Bewerte KONKRET: Behauptung korrekt, uebertrieben, oder falsch — und warum?`;

const BERUFSPOLITIK_ADDITION = `

ZUSAETZLICH fuer Berufspolitik-Artikel:
Bewerte die AUSWIRKUNG auf den Berufsalltag von Ernaehrungstherapeuten.
- "policy_impact": Waehle eines von: "info" (zur Kenntnis), "beobachten" (Entwicklung verfolgen), "handeln" (jetzt aktiv werden)
- "policy_action_needed": KONKRET: Was GENAU muessen Ernaehrungstherapeuten tun? Z.B. "Neue Abrechnungsziffer EBM 01474 ab 01.07. fuer ernaehrungstherapeutische Leistungen bei Adipositas Grad II — Formulare aktualisieren." Nicht: "Therapeuten sollten sich informieren." (1-2 Saetze). Bei "info" kann dies leer sein.
Setze category_main auf "Berufspolitik & Recht".
Beruecksichtige: G-BA-Beschluesse, Leitlinien-Updates, GKV-Aenderungen, Berufsordnung, Abrechnungsaenderungen.`;

const INTERNATIONAL_ADDITION = `

ZUSAETZLICH fuer internationale Artikel:
Bewerte die UEBERTRAGBARKEIT auf den deutschen Kontext.
- "international_relevance_de": Erklaere in 2-3 Saetzen, was dieser internationale Beitrag fuer die deutsche Ernaehrungstherapie-Praxis bedeutet. Beruecksichtige Unterschiede in Gesundheitssystemen, Leitlinien und Ernaehrungsgewohnheiten.
Setze category_main auf "Internationale Perspektive", es sei denn, eine andere Kategorie ist deutlich passender.
Englische Inhalte muessen auf Deutsch zusammengefasst werden.`;

const FORSCHUNG_ADDITION = `

ZUSAETZLICH fuer Forschungsartikel (Journals, Studien):
Du berichtest ueber eine wissenschaftliche Studie. Ernaehrungstherapeuten wollen die KONKRETEN DATEN, nicht "die Studie zeigt einen positiven Effekt".

PFLICHTANGABEN in snack_what:
- Studiendesign (RCT, Kohorte, Meta-Analyse, etc.)
- Stichprobengroesse (n=X)
- Population (z.B. "Typ-2-Diabetiker, 55-70 Jahre, BMI >30")
- Intervention und Kontrolle (z.B. "30g Walnuesse/d vs. isokalorisiche Kontrolle ueber 12 Wochen")

PFLICHTANGABEN in snack_result:
- Primaerer Endpunkt mit KONKRETER Effektstaerke (z.B. "LDL-C -0.34 mmol/L, 95%-KI: -0.47 bis -0.21, p<0.001")
- Wenn vorhanden: NNT, Hazard Ratio, Odds Ratio, absolute Risikoreduktion
- Falls keine Zahlen im Abstract: die KONKRETEN qualitativen Ergebnisse nennen

PFLICHTANGABEN in evidence_summary:
- Staerken: Randomisierung, Verblindung, Studiendauer, Follow-up-Rate
- Limitationen: Stichprobengroesse, Selektionsbias, Confounding, Uebertragbarkeit
- Einordnung: Passt das Ergebnis zur bisherigen Evidenz oder widerspricht es?

PFLICHTANGABEN in action_recommendation:
- Nur wenn Evidenzlevel ausreicht (mindestens RCT oder konsistente Beobachtungsstudien)
- Sonst: "Ergebnis abwarten — noch keine Aenderung der Beratungsempfehlung ableitbar."`;

const FACHPRESSE_ADDITION = `

ZUSAETZLICH fuer Fachpresse-Artikel (DGE, DGEM, Berufsverbands-Mitteilungen, Kongressberichte):
Fachpresse berichtet oft ueber Leitlinien-Updates, Konsensuspapiere, DGE-Stellungnahmen oder Fortbildungsinhalte.

WICHTIG: Extrahiere die KONKRETEN neuen Empfehlungen, nicht nur "es gibt eine neue Leitlinie".

Beispiel FALSCH: "Die DGEM hat ihre Leitlinie zur enteralen Ernaehrung aktualisiert."
Beispiel RICHTIG: "DGEM-Leitlinie 2025 enterale Ernaehrung: Fruehzeitige enterale Zufuhr (innerhalb 24-48h) bei Intensivpatienten. Zielzufuhr Protein 1.3 g/kg/d, Energie ueber 4-7 Tage steigern. Immunonutrition (Arginin, Omega-3) nur bei elektiven viszeralchirurgischen OPs empfohlen (Evidenzgrad A)."

Bei Leitlinien/Empfehlungen im snack_result IMMER nennen:
- Welche konkreten Grenzwerte/Dosierungen werden empfohlen?
- Was hat sich gegenueber der vorherigen Version geaendert?
- Welcher Empfehlungsgrad (A/B/0, stark/schwach)?
- Fuer welche Patientengruppe gilt das?

Bei Kongressberichten:
- Welche konkreten Studienergebnisse wurden praesentiert?
- Keine Aussagen wie "spannende Vortraege" — sondern was wurde INHALTLICH gesagt?`;

const SUPPLEMENT_ADDITION = `

ZUSAETZLICH fuer Supplement-/NEM-Artikel:
Ernaehrungstherapeuten brauchen klare Evidenz-Einordnung zu Nahrungsergaenzungsmitteln.

PFLICHTANGABEN:
- Welches Supplement/welcher Naehrstoff GENAU? (z.B. "Vitamin D3 Cholecalciferol", nicht einfach "Vitamin D")
- Welche Dosierung wurde untersucht? (z.B. "4000 IE/d" oder "50.000 IE/Woche")
- Bei welcher Population/Indikation? (z.B. "aeltere Frauen >65 J. mit Osteoporose-Risiko")
- Was ist das KONKRETE Ergebnis? (z.B. "Frakturrate -18%, NNT=50 ueber 3 Jahre")
- Gibt es eine Obergrenze/Toxizitaet? (z.B. "EFSA UL: 4000 IE/d; >10.000 IE/d Hyperkalzaemie-Risiko")

Im therapist_check IMMER:
- Kann ich das in der Beratung empfehlen? Wenn ja: Fuer wen, in welcher Dosis?
- Gibt es Interaktionen mit haeufigen Medikamenten? (z.B. Marcumar, Metformin, PPI)
- Ist eine Blutspiegelkontrolle sinnvoll? Welcher Zielwert?
- Ist Supplementierung noetig oder reicht die Zufuhr ueber Lebensmittel?`;


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
    extraFields.push(`  "lay_press_fact_check": "MEDIEN: [Konkreter Claim/Behauptung aus dem Artikel] → FACH: [Fachliche Einordnung mit Evidenzlage, Studientypen, Leitlinienempfehlungen]"`);
  }
  if (isBerufspolitik) {
    extraFields.push(`  "policy_impact": "info | beobachten | handeln"`);
    extraFields.push(`  "policy_action_needed": "Was muessen Ernaehrungstherapeuten konkret tun? (1-2 Saetze)"`);
  }
  if (isInternational) {
    extraFields.push(`  "international_relevance_de": "Was bedeutet das fuer die deutsche Ernaehrungstherapie-Praxis? (2-3 Saetze)"`);
  }

  const extraFieldsStr = extraFields.length > 0 ? `,\n${extraFields.join(',\n')}` : '';

  return `Erstelle eine NewsCard aus diesem Artikel. Denke daran: Ernaehrungstherapeuten wollen KONKRETE INHALTE — Zahlen, Dosierungen, Empfehlungen, Grenzwerte — keine generischen Zusammenfassungen.

TITEL: ${item.title}
QUELLE: ${item.source.name}
QUELLENTYP: ${item.source.sourceType}
SPRACHE: ${(() => {
    const langMap: Record<string, string> = {
      de: 'Deutsch',
      en: 'Englisch (bitte auf Deutsch zusammenfassen)',
      fr: 'Französisch (bitte auf Deutsch zusammenfassen)',
      nl: 'Niederländisch (bitte auf Deutsch zusammenfassen)',
      es: 'Spanisch (bitte auf Deutsch zusammenfassen)',
    };
    return langMap[item.source.language] ?? 'Deutsch';
  })()}
BESCHREIBUNG: ${item.description || 'Keine Beschreibung verfuegbar'}
URL: ${item.link}

Antwortformat:
{
  "headline": "Praegnante deutsche Ueberschrift mit konkretem Inhalt, nicht generisch (max 100 Zeichen)",
  "snack_what": "Was GENAU wurde untersucht/veroeffentlicht? Nenne Studientyp, Population, Intervention. (1-2 Saetze)",
  "snack_result": "Was GENAU kam heraus? Nenne konkrete Ergebnisse: Zahlen, Effektstaerken, Empfehlungen, Grenzwerte. Kein 'es wurde festgestellt dass...' sondern die Fakten direkt. (1-2 Saetze)",
  "snack_consequence": "Was GENAU aendert sich fuer die Ernaehrungstherapie-Praxis? Nenne konkrete Handlungen: Welche Naehrstoffe, Dosierungen, Patientengruppen, Beratungsinhalte? (1-2 Saetze)",
  "therapist_check": "KONKRETE Einordnung: Was bedeutet das fuer MEINE Beratung? Bei welchen Patienten setze ich das um? Was empfehle ich jetzt anders als vorher? Mit konkreten Beispielen. (2-3 Saetze)",
  "category_main": "Eine der oben genannten Kategorien",
  "evidence_level": "Eines der oben genannten Evidenz-Level",
  "practice_relevance_score": 1-5,
  "action_recommendation": "KONKRETER Satz: 'Bei Patienten mit X empfehle ich ab sofort Y in Dosierung Z' oder 'In der Beratung zu X ergaenze ich den Hinweis auf Y'. Keine Floskeln wie 'mehr Fokus legen auf'. (1-2 Saetze)",
  "patient_question_anticipation": "Realistische woertliche Patientenfrage, z.B. 'Soll ich jetzt kein Brot mehr essen wegen der Studie?' (1 Satz)",
  "evidence_summary": "Studiendesign (z.B. RCT, n=X, Y Wochen), primaerer Endpunkt, Effektstaerke, wichtigste Limitation, Uebertragbarkeit auf DE-Praxis. (2-3 Saetze)"${extraFieldsStr}
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

function buildSystemPrompt(sourceType: SourceType): string {
  let prompt = SYSTEM_PROMPT;
  if (sourceType === 'forschung') prompt += FORSCHUNG_ADDITION;
  if (sourceType === 'fachpresse') prompt += FACHPRESSE_ADDITION;
  if (sourceType === 'supplement') prompt += SUPPLEMENT_ADDITION;
  if (sourceType === 'laienpresse') prompt += LAY_PRESS_ADDITION;
  if (sourceType === 'berufspolitik') prompt += BERUFSPOLITIK_ADDITION;
  if (sourceType === 'international') prompt += INTERNATIONAL_ADDITION;
  return prompt;
}

// --- Anthropic Claude Haiku (~$0.001/Artikel) ---
async function curateWithClaude(item: RSSItem): Promise<CurationResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(item.source.sourceType);

  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    temperature: 0.2,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildUserPrompt(item) }],
  });

  const block = response.content[0];
  if (block.type !== 'text') return null;

  const result = parseResult(block.text, item);
  if (result) console.log(`Curated with Claude Haiku: ${item.title?.slice(0, 60)}`);
  return result;
}

// ═══════════════════════════════════════════════════════════════
// Title-based pre-filter: skip obviously irrelevant items
// without calling any AI API (saves ~60% of API calls)
// ═══════════════════════════════════════════════════════════════

const SKIP_PATTERNS = [
  /^re:\s/i,                    // Email replies
  /stellenangebot|job\s*(offer|posting)/i, // Job listings (narrower match)
  /^advertisement|^anzeige/i,   // Ads
  /newsletter.*abonnieren/i,    // Newsletter signup pages
  /^corrigendum|^erratum/i,     // Corrections to papers
  /^withdrawn|^retracted/i,     // Retracted papers
];

function shouldSkipItem(item: RSSItem): boolean {
  const title = item.title ?? '';

  // Skip if title matches known irrelevant patterns
  if (SKIP_PATTERNS.some(p => p.test(title))) return true;

  // Skip only if truly empty — no title at all
  if (!title || title.length < 5) return true;

  return false;
}

// --- Main entry: Claude Haiku only ---
export async function curateArticle(item: RSSItem): Promise<CurationResult | null> {
  // Pre-filter: skip obviously irrelevant items without calling AI
  if (shouldSkipItem(item)) {
    console.log(`Pre-filter skip: ${item.title?.slice(0, 60)}`);
    return null;
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY nicht gesetzt.');
      return null;
    }

    return await curateWithClaude(item);
  } catch (error) {
    console.error('AI curation failed:', error);
    return null;
  }
}
