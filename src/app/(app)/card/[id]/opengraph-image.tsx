import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'NutriNews Artikel';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Simple category → color mapping (no local imports in edge runtime)
const CATEGORY_COLORS: Record<string, string> = {
  'GLP-1 & Adipositastherapie': '#059669',
  'Onkologische Ernährung': '#7c3aed',
  'Pädiatrische Ernährung': '#d97706',
  'Enterale & Parenterale Ernährung': '#0284c7',
  'Nahrungsmittelallergien': '#dc2626',
  'Mikronährstoffe & Supplemente': '#0891b2',
  'Darmgesundheit': '#65a30d',
  'Sport & Leistungsernährung': '#ea580c',
  'Geriatrische Ernährung': '#9333ea',
  'Psychiatrie & Ernährung': '#db2777',
  'Nierenerkrankungen & Ernährung': '#2563eb',
  'Leber & Gallenwege': '#ca8a04',
  'Berufspolitik & Recht': '#475569',
  'Prävention & Public Health': '#16a34a',
};

const EVIDENCE_EMOJI: Record<string, string> = {
  'Randomisierte Studie': '🔬',
  'Systematischer Review': '📚',
  'Beobachtungsstudie': '🔍',
  'Expertenmeinung': '💡',
  'Fallbericht': '📋',
  'Leitlinie': '📌',
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: card } = await supabase
    .from('news_cards')
    .select('headline, category_main, evidence_level, source_name, kernbotschaft, practice_relevance_score')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  const accentColor = card ? (CATEGORY_COLORS[card.category_main] ?? '#16803c') : '#16803c';
  const evidenceEmoji = card ? (EVIDENCE_EMOJI[card.evidence_level ?? ''] ?? '📄') : '📄';

  if (!card) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #1a3a1a 0%, #0f2a20 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'system-ui',
          }}
        >
          <span style={{ color: 'white', fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em' }}>
            NutriNews
          </span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const score = card.practice_relevance_score ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'system-ui', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Accent bar at top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 8,
          background: accentColor,
          display: 'flex',
        }} />

        {/* Left color stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 6,
          background: accentColor,
          display: 'flex',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', padding: '60px 72px', flex: 1 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
            <div style={{
              background: accentColor,
              color: 'white', borderRadius: 50, padding: '8px 18px',
              fontSize: 20, fontWeight: 700, letterSpacing: '0.02em',
            }}>
              {card.category_main}
            </div>
            <div style={{
              background: '#f1f5f9', color: '#475569', borderRadius: 50, padding: '8px 16px',
              fontSize: 20, fontWeight: 600,
            }}>
              {evidenceEmoji} {card.evidence_level ?? 'Expertenmeinung'}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Relevance dots */}
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: i <= score ? accentColor : '#e2e8f0',
                }} />
              ))}
            </div>
          </div>

          {/* Headline */}
          <div style={{
            fontSize: card.headline.length > 80 ? 44 : card.headline.length > 50 ? 52 : 60,
            fontWeight: 800, color: '#0f172a', lineHeight: 1.15,
            letterSpacing: '-0.025em', flex: 1,
            display: 'flex', alignItems: 'center',
          }}>
            {card.headline}
          </div>

          {/* Kernbotschaft or source */}
          {(card.kernbotschaft || card.source_name) && (
            <div style={{
              fontSize: 24, color: '#475569', lineHeight: 1.4,
              fontWeight: 500, marginTop: 28,
              borderTop: '2px solid #e2e8f0', paddingTop: 24,
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <span style={{ color: accentColor, fontWeight: 700, fontSize: 24 }}>→</span>
              <span style={{ flex: 1 }}>
                {(card.kernbotschaft ?? card.source_name ?? '').slice(0, 140)}
                {(card.kernbotschaft ?? card.source_name ?? '').length > 140 ? '…' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 72px', background: '#f8fafc',
          borderTop: '2px solid #e2e8f0',
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: accentColor, letterSpacing: '-0.02em' }}>
            NutriNews
          </span>
          <span style={{ fontSize: 18, color: '#94a3b8' }}>
            Evidenzbasierte Ernährungsmedizin
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
