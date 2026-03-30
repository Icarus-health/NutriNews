import type { BriefingItem } from '@/types/database';

// ═══════════════════════════════════════════════════════════════
// Tägliches Briefing: Wählt die wichtigsten 3-5 Artikel der
// letzten 24h aus und erstellt ein kompaktes Briefing-Format.
// ═══════════════════════════════════════════════════════════════

const BRIEFING_SYSTEM_PROMPT = `Du bist der Chefredakteur einer Fachnachrichtenplattform fuer Ernaehrungstherapeuten in Deutschland.

Deine Aufgabe: Erstelle aus einer Liste von Artikeln ein kompaktes Morgen-Briefing mit den 3-5 wichtigsten Meldungen.

AUSWAHLKRITERIEN (in dieser Reihenfolge):
1. Unmittelbare Praxisrelevanz fuer Ernaehrungstherapeuten
2. Neue Leitlinien oder Evidenz die Beratungsempfehlungen aendert
3. Berufspolitische Entscheidungen mit direkter Auswirkung
4. Wichtige Studienergebnisse mit hohem Evidenz-Level
5. Laienpresse-Meldungen die Patientenfragen ausloesen werden

EVIDENZ-GEWICHTUNG:
- Meta-Analysen und Systematische Reviews haben Vorrang
- RCTs vor Kohortenstudien vor Fallstudien
- Laienpresse nur wenn hohes Patientenfrage-Potenzial

Antworte IMMER als valides JSON-Array.`;

interface ArticleForBriefing {
  id: string;
  headline: string;
  snack_what: string;
  therapist_check: string;
  evidence_level: string;
  category_main: string;
  practice_relevance_score: number | null;
  source_name: string | null;
  source_url: string;
  source_type: string;
}

function buildBriefingPrompt(articles: ArticleForBriefing[]): string {
  const articleList = articles.map((a, i) =>
    `[${i + 1}] ID: ${a.id}
Headline: ${a.headline}
Was: ${a.snack_what}
Therapist-Check: ${a.therapist_check}
Evidenz: ${a.evidence_level}
Kategorie: ${a.category_main}
Praxisrelevanz: ${a.practice_relevance_score ?? 'k.A.'}/5
Quelle: ${a.source_name}
Quellentyp: ${a.source_type}`
  ).join('\n\n');

  return `Hier sind die Artikel der letzten 24 Stunden. Waehle die 3-5 wichtigsten aus und erstelle ein Briefing.

${articleList}

Antwortformat (JSON-Array mit 3-5 Eintraegen):
[
  {
    "news_card_id": "ID des Artikels",
    "headline": "Kurze, praegnante Ueberschrift (max 80 Zeichen)",
    "summary": "Ein Satz Einordnung: Warum ist das heute wichtig? (max 150 Zeichen)",
    "source_name": "Name der Quelle",
    "source_url": "URL",
    "evidence_level": "Evidenz-Level",
    "category_main": "Kategorie",
    "practice_relevance_score": 1-5
  }
]`;
}

function parseBriefingResult(content: string, articles: ArticleForBriefing[]): BriefingItem[] {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item: Record<string, unknown>) => item.headline && item.summary)
      .slice(0, 5)
      .map((item: Record<string, unknown>) => {
        // Try to match back to original article for reliable data
        const original = articles.find(a => a.id === item.news_card_id);
        return {
          headline: String(item.headline),
          summary: String(item.summary),
          source_name: String(item.source_name ?? original?.source_name ?? ''),
          source_url: String(item.source_url ?? original?.source_url ?? ''),
          evidence_level: String(item.evidence_level ?? original?.evidence_level ?? 'Expertenmeinung'),
          category_main: String(item.category_main ?? original?.category_main ?? ''),
          practice_relevance_score: Math.min(5, Math.max(1, Number(item.practice_relevance_score) || 3)),
          news_card_id: String(item.news_card_id ?? original?.id ?? ''),
        } as BriefingItem;
      });
  } catch {
    return [];
  }
}

// Fallback: wenn KI nicht verfügbar, nutze Ranking-Algorithmus
function fallbackBriefing(articles: ArticleForBriefing[]): BriefingItem[] {
  const evidenceRank: Record<string, number> = {
    'Meta-Analyse': 7,
    'Systematische Review': 6,
    'RCT': 5,
    'Kohortenstudie': 4,
    'Fallstudie': 3,
    'Expertenmeinung': 2,
    'Laienpresse/Trend': 1,
  };

  const scored = articles.map(a => ({
    ...a,
    score: (a.practice_relevance_score ?? 3) * 2 + (evidenceRank[a.evidence_level] ?? 2),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map(a => ({
    headline: a.headline,
    summary: a.therapist_check.slice(0, 150),
    source_name: a.source_name ?? '',
    source_url: a.source_url,
    evidence_level: a.evidence_level as BriefingItem['evidence_level'],
    category_main: a.category_main,
    practice_relevance_score: a.practice_relevance_score ?? 3,
    news_card_id: a.id,
  }));
}

const HF_MODELS = [
  'Qwen/Qwen2.5-72B-Instruct',
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
];

async function generateWithHuggingFace(articles: ArticleForBriefing[]): Promise<BriefingItem[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return [];

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
            { role: 'system', content: BRIEFING_SYSTEM_PROMPT },
            { role: 'user', content: buildBriefingPrompt(articles) },
          ],
          temperature: 0.2,
          max_tokens: 1500,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      const result = parseBriefingResult(content, articles);
      if (result.length > 0) return result;
    } catch {
      continue;
    }
  }

  return [];
}

async function generateWithOpenAI(articles: ArticleForBriefing[]): Promise<BriefingItem[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BRIEFING_SYSTEM_PROMPT },
      { role: 'user', content: buildBriefingPrompt(articles) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return [];

  return parseBriefingResult(content, articles);
}

export async function generateDailyBriefing(articles: ArticleForBriefing[]): Promise<BriefingItem[]> {
  if (articles.length === 0) return [];
  if (articles.length <= 5) return fallbackBriefing(articles);

  try {
    // Try HuggingFace first
    if (process.env.HUGGINGFACE_API_KEY) {
      const result = await generateWithHuggingFace(articles);
      if (result.length > 0) return result;
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      const result = await generateWithOpenAI(articles);
      if (result.length > 0) return result;
    }

    // Ultimate fallback: algorithmic ranking
    return fallbackBriefing(articles);
  } catch (error) {
    console.error('Briefing generation failed:', error);
    return fallbackBriefing(articles);
  }
}
