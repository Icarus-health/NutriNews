'use server';

import Anthropic from '@anthropic-ai/sdk';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isLocale } from '@/lib/i18n/config';
import { TRANSLATABLE_FIELDS as FIELDS, type CardTranslation } from '@/lib/translate-fields';

const LANG_NAMES: Record<string, string> = { en: 'English' };

const anthropic = new Anthropic();

function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

function serviceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function pickFields(row: Record<string, unknown>): CardTranslation {
  const out: CardTranslation = {};
  for (const f of FIELDS) {
    const v = row[f];
    if (typeof v === 'string' && v.trim()) out[f] = v;
  }
  return out;
}

/**
 * Returns the cached translation for a card, generating + caching it on a miss.
 * Returns null for German (no translation needed) or unsupported locales.
 */
export async function getCardTranslation(cardId: string, lang: string): Promise<CardTranslation | null> {
  if (!isLocale(lang) || lang === 'de') return null;
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const supabase = anonClient();

  // 1) Cache hit?
  const { data: cached } = await supabase
    .from('news_card_translations')
    .select('*')
    .eq('news_card_id', cardId)
    .eq('lang', lang)
    .maybeSingle();
  if (cached) return pickFields(cached);

  // 2) Load the (published) source card's German fields.
  const { data: card } = await supabase
    .from('news_cards')
    .select(FIELDS.join(','))
    .eq('id', cardId)
    .eq('status', 'published')
    .maybeSingle();
  if (!card) return null;

  const source = pickFields(card as unknown as Record<string, unknown>);
  if (Object.keys(source).length === 0) return null;

  // 3) Translate via Claude.
  let translated: CardTranslation;
  try {
    translated = await translateFields(source, lang);
  } catch (err) {
    console.error('translateFields failed:', err instanceof Error ? err.message : err);
    return null;
  }

  // 4) Cache (best effort, via service role to bypass RLS writes).
  try {
    await serviceClient()
      .from('news_card_translations')
      .upsert({ news_card_id: cardId, lang, ...translated }, { onConflict: 'news_card_id,lang' });
  } catch { /* non-blocking */ }

  return translated;
}

/**
 * Batch-Variante: Übersetzungen für viele Karten mit minimalen API-Kosten.
 * (a) ein DB-Read für alle Cache-Treffer, (b) fehlende Karten gebündelt in
 * wenigen Claude-Calls (statt 1 Call pro Karte), (c) ein Batch-Upsert.
 * Gibt eine Map news_card_id → Übersetzung zurück (nur erfolgreiche Einträge).
 */
export async function getCardTranslations(
  cardIds: string[],
  lang: string,
): Promise<Record<string, CardTranslation>> {
  if (!isLocale(lang) || lang === 'de') return {};
  if (!process.env.ANTHROPIC_API_KEY) return {};

  const ids = [...new Set(cardIds)].slice(0, 30);
  if (ids.length === 0) return {};

  const supabase = anonClient();
  const result: Record<string, CardTranslation> = {};

  // 1) Cache-Treffer in einer Query
  const { data: cachedRows } = await supabase
    .from('news_card_translations')
    .select('*')
    .in('news_card_id', ids)
    .eq('lang', lang);
  for (const row of cachedRows ?? []) {
    result[(row as { news_card_id: string }).news_card_id] = pickFields(row);
  }

  const missing = ids.filter(id => !result[id]);
  if (missing.length === 0) return result;

  // 2) Quellkarten (deutsch) für die Cache-Misses laden
  const { data: cards } = await supabase
    .from('news_cards')
    .select(['id', ...FIELDS].join(','))
    .in('id', missing)
    .eq('status', 'published');
  const sources = (cards ?? [])
    .map(c => {
      const row = c as unknown as Record<string, unknown>;
      return { id: row.id as string, fields: pickFields(row) };
    })
    .filter(s => Object.keys(s.fields).length > 0);
  if (sources.length === 0) return result;

  // 3) Gebündelt übersetzen — Chunks à 8 Karten halten die Antwort unter max_tokens
  const translated: { id: string; fields: CardTranslation }[] = [];
  const CHUNK = 8;
  for (let i = 0; i < sources.length; i += CHUNK) {
    const chunk = sources.slice(i, i + CHUNK);
    try {
      translated.push(...await translateFieldsBatch(chunk, lang));
    } catch (err) {
      console.error('translateFieldsBatch failed:', err instanceof Error ? err.message : err);
      // Teilausfall: bereits übersetzte Chunks behalten, Rest bleibt deutsch
      break;
    }
  }
  if (translated.length === 0) return result;

  // 4) Cache als ein Batch-Upsert (best effort, Service-Role wegen RLS)
  try {
    await serviceClient()
      .from('news_card_translations')
      .upsert(
        translated.map(tr => ({ news_card_id: tr.id, lang, ...tr.fields })),
        { onConflict: 'news_card_id,lang' },
      );
  } catch { /* non-blocking */ }

  for (const tr of translated) result[tr.id] = tr.fields;
  return result;
}

async function translateFieldsBatch(
  sources: { id: string; fields: CardTranslation }[],
  lang: string,
): Promise<{ id: string; fields: CardTranslation }[]> {
  const target = LANG_NAMES[lang] ?? lang;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    temperature: 0,
    system: `You translate German clinical-nutrition news cards into ${target} for nutrition professionals. Translate accurately and idiomatically. Keep all numbers, units, dosages, study names, abbreviations (RCT, DGE, EFSA, LDL, GLP-1, ...) and proper nouns unchanged. Preserve any leading emoji and the structured pattern "MEDIEN: ... → FACH: ..." (translate the labels to "CLAIM: ... → EXPERT: ..."). The input is a JSON array; each object has an "id" plus text fields. Return ONLY a JSON array with the same objects: identical "id" values, identical keys, all text values translated.`,
    messages: [{ role: 'user', content: JSON.stringify(sources.map(s => ({ id: s.id, ...s.fields }))) }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('non-text response');
  const match = block.text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('no JSON array in response');
  const parsed = JSON.parse(match[0]) as Record<string, unknown>[];
  const byId = new Map(parsed.map(p => [p.id as string, p]));

  return sources.map(source => {
    const p = byId.get(source.id) ?? {};
    const out: CardTranslation = {};
    for (const f of FIELDS) {
      if (f in source.fields) {
        const v = p[f];
        // Fehlende/leere Felder fallen auf das deutsche Original zurück
        out[f] = (typeof v === 'string' && v.trim()) ? v : source.fields[f]!;
      }
    }
    return { id: source.id, fields: out };
  });
}

async function translateFields(source: CardTranslation, lang: string): Promise<CardTranslation> {
  const target = LANG_NAMES[lang] ?? lang;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    temperature: 0,
    system: `You translate German clinical-nutrition news cards into ${target} for nutrition professionals. Translate accurately and idiomatically. Keep all numbers, units, dosages, study names, abbreviations (RCT, DGE, EFSA, LDL, GLP-1, ...) and proper nouns unchanged. Preserve any leading emoji and the structured pattern "MEDIEN: ... → FACH: ..." (translate the labels to "CLAIM: ... → EXPERT: ..."). Return ONLY a JSON object with exactly the same keys as the input; do not add or drop keys.`,
    messages: [{ role: 'user', content: JSON.stringify(source) }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('non-text response');
  const match = block.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('no JSON in response');
  const parsed = JSON.parse(match[0]) as Record<string, unknown>;

  const out: CardTranslation = {};
  for (const f of FIELDS) {
    if (f in source) {
      const v = parsed[f];
      // Fall back to the German source if a field came back empty.
      out[f] = (typeof v === 'string' && v.trim()) ? v : source[f]!;
    }
  }
  return out;
}
