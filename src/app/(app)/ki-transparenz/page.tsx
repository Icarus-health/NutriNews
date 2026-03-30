import Link from 'next/link';
import { ArrowLeft, Bot, ShieldCheck, Eye, Database, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'KI-Transparenzhinweis – NutriNews',
};

export default function KITransparenzPage() {
  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-[13px] text-forest-600 dark:text-forest-400 font-semibold mb-4 hover:text-forest-700 dark:hover:text-forest-300 transition-colors"
      >
        <ArrowLeft size={14} />
        Zurück
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">KI-Transparenzhinweis</h1>
      <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6">
        Wie NutriNews Künstliche Intelligenz einsetzt — offen und nachvollziehbar.
      </p>

      <div className="space-y-4">
        {/* Was macht die KI? */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="font-bold text-[15px] text-slate-900 dark:text-slate-100">Was macht die KI?</h2>
          </div>
          <div className="space-y-2 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              NutriNews nutzt KI-Sprachmodelle, um Fachartikel aus RSS-Feeds automatisiert zu verarbeiten.
              Die KI übernimmt folgende Aufgaben:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Zusammenfassung</strong> — Quellartikel werden in strukturierte Snack-Felder (Was? Ergebnis? Konsequenz?) komprimiert</li>
              <li><strong>Evidenz-Einordnung</strong> — Bewertung des Studiendesigns und der Evidenzqualität</li>
              <li><strong>Kategorisierung</strong> — Zuordnung zu einer von 20 Fachkategorien</li>
              <li><strong>Praxisrelevanz-Score</strong> — Einschätzung der praktischen Relevanz (1-5)</li>
              <li><strong>Therapist-Check</strong> — Fachliche Einordnung für Ernährungstherapeuten</li>
              <li><strong>Handlungsempfehlung</strong> — Was ändert sich morgen in der Beratung?</li>
              <li><strong>Patientenfrage</strong> — Welche Frage werden Patienten stellen?</li>
              <li><strong>Laienpresse-Faktencheck</strong> — Gegenüberstellung Medien vs. Fachperspektive</li>
              <li><strong>Berufspolitik-Bewertung</strong> — Handlungsbedarf-Einschätzung bei Regulierung</li>
              <li><strong>Internationale Einordnung</strong> — Übertragbarkeit auf den deutschen Kontext</li>
            </ul>
          </div>
        </div>

        {/* Welche KI-Systeme? */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center">
              <Database size={16} className="text-forest-600 dark:text-forest-400" />
            </div>
            <h2 className="font-bold text-[15px] text-slate-900 dark:text-slate-100">Welche KI-Systeme?</h2>
          </div>
          <div className="space-y-3 text-[13px] text-slate-600 dark:text-slate-400">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Primär: Hugging Face (Open-Source)</p>
              <p>Modelle wie Qwen2.5-72B-Instruct und Mixtral-8x7B. Open-Source-Modelle mit nachvollziehbarer Architektur. Kostenfreie Serverless-API.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Fallback: OpenAI GPT-4o-mini</p>
              <p>Wird nur verwendet, wenn alle Open-Source-Modelle nicht verfügbar sind. Proprietäres Modell von OpenAI Inc.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Tägliches Briefing</p>
              <p>Die Auswahl der Briefing-Artikel erfolgt KI-gestützt (priorisiert nach Evidenz und Praxisrelevanz). Bei KI-Ausfall greift ein algorithmischer Fallback-Mechanismus.</p>
            </div>
          </div>
        </div>

        {/* Was die KI NICHT macht */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="font-bold text-[15px] text-slate-900 dark:text-slate-100">Was die KI NICHT macht</h2>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-[13px] text-slate-600 dark:text-slate-400 ml-1">
            <li>Die KI hat <strong>keinen Zugriff</strong> auf Ihre Profildaten, Nutzungsverhalten oder Community-Beiträge</li>
            <li>Es findet <strong>kein Profiling</strong> oder personalisierte KI-Analyse Ihres Verhaltens statt</li>
            <li>Die KI <strong>erfindet keine Studien</strong> oder Daten hinzu — sie fasst ausschließlich den Quellartikel zusammen</li>
            <li>Die KI trifft <strong>keine Therapieentscheidungen</strong> und gibt keine Patientenempfehlungen</li>
            <li>Community-Inhalte (Kommentare, Fragen, Antworten) werden <strong>nicht</strong> KI-generiert</li>
          </ul>
        </div>

        {/* Qualitätssicherung */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="font-bold text-[15px] text-slate-900 dark:text-slate-100">Qualitätssicherung</h2>
          </div>
          <div className="space-y-2 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>Mehrere Mechanismen sichern die Qualität der KI-Inhalte:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Admin-Review</strong> — KI-kuratierte Artikel werden als Entwurf gespeichert und müssen vor der Veröffentlichung redaktionell geprüft werden</li>
              <li><strong>KI-Label</strong> — Jeder KI-zusammengefasste Artikel ist mit &ldquo;KI-zusammengefasst&rdquo; gekennzeichnet</li>
              <li><strong>Quellenangabe</strong> — Jeder Artikel enthält einen Link zur Originalquelle</li>
              <li><strong>Community-Verifikation</strong> — Fachkollegen können Artikel als korrekt, praxisrelevant oder korrekturbedürftig markieren</li>
              <li><strong>Flag-System</strong> — Ab 3 Warnmeldungen erhält ein Artikel einen Überprüfungshinweis</li>
            </ul>
          </div>
        </div>

        {/* Erkennbarkeit */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <Eye size={16} className="text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="font-bold text-[15px] text-slate-900 dark:text-slate-100">Erkennbarkeit</h2>
          </div>
          <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
            KI-kuratierte Inhalte sind auf NutriNews stets erkennbar an:
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-2.5">
              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">
                KI-zusammengefasst
              </span>
              <span className="text-[12px] text-slate-500 dark:text-slate-400">— Label auf der Artikelrückseite</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-2.5">
              <span className="text-[12px] text-forest-600 dark:text-forest-400 font-semibold">Quelle →</span>
              <span className="text-[12px] text-slate-500 dark:text-slate-400">— Link zum Originalartikel auf jeder Karte</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-6 text-center">
        Stand: März 2026 &middot; Bei Fragen: info@icarus-health.de
      </p>
    </div>
  );
}
