'use server';

import Anthropic from '@anthropic-ai/sdk';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isLocale } from '@/lib/i18n/config';
import { TRANSLATABLE_FIELDS as FIELDS, type CardTranslation } from '@/lib/translate-fields';

const LANG_NAMES: Record<string, string> = { en: 'English' };

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

async function translateFields(source: CardTranslation, lang: string): Promise<CardTranslation> {
  const anthropic = new Anthropic();
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
