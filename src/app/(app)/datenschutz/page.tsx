import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Datenschutzerklärung – NutriNews',
};

export default function DatenschutzPage() {
  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-[13px] text-forest-600 dark:text-forest-400 font-semibold mb-4 hover:text-forest-700 dark:hover:text-forest-300 transition-colors"
      >
        <ArrowLeft size={14} />
        Zurück
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Datenschutzerklärung</h1>

      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">1. Verantwortlicher</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Verantwortlich für die Datenverarbeitung auf dieser Plattform ist:<br />
            Icarus Health GmbH, vertreten durch Sören Kube<br />
            E-Mail: datenschutz@icarus-health.de
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">2. Welche Daten wir erheben</h2>

          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4">2.1 Registrierung und Profil</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Bei der Registrierung erheben wir: E-Mail-Adresse, Name (optional), Arbeitsumfeld/Setting (optional),
            bevorzugte Kategorien. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>

          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4">2.2 Nutzungsdaten</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Bei der Nutzung der Plattform verarbeiten wir: Likes, Kommentare, Lesezeichen, Community-Beiträge,
            Fachgruppenmitgliedschaften, Schnellfragen und -antworten, Card-Verifikationen.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
          </p>

          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4">2.3 Lokale Speicherung (Browser)</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Folgende Daten werden ausschließlich lokal in Ihrem Browser (localStorage) gespeichert und
            <strong> nicht</strong> an unsere Server übertragen:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
            <li>Darstellungs-Einstellungen (Hell/Dunkel-Modus, Textgröße)</li>
            <li>Lesehistorie (welche Artikel Sie gelesen haben)</li>
            <li>Suchverlauf (letzte 5 Suchbegriffe)</li>
            <li>Später-Lesen-Warteschlange</li>
            <li>Offline-Lesezeichen (nicht eingeloggte Nutzer)</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            Diese Daten können Sie jederzeit über Ihre Browser-Einstellungen löschen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">3. KI-gestützte Verarbeitung</h2>
          <p className="text-slate-600 dark:text-slate-400">
            NutriNews verwendet Künstliche Intelligenz zur Zusammenfassung und Einordnung von Fachartikeln.
            Details hierzu finden Sie in unserem{' '}
            <Link href="/ki-transparenz" className="text-forest-600 dark:text-forest-400 underline">
              KI-Transparenzhinweis
            </Link>.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            <strong>Wichtig:</strong> Ihre personenbezogenen Daten (Profil, Nutzungsverhalten) werden
            <strong> nicht</strong> an die KI-Systeme übermittelt. Die KI verarbeitet ausschließlich öffentlich
            zugängliche Quellartikel. Es findet kein Profiling im Sinne der DSGVO statt.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">4. Hosting und Auftragsverarbeitung</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Die Plattform wird gehostet bei:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
            <li><strong>Vercel Inc.</strong> (Hosting, CDN) — Standort: EU/USA, Angemessenheitsbeschluss/SCCs</li>
            <li><strong>Supabase Inc.</strong> (Datenbank, Authentifizierung) — Standort: EU (Frankfurt), Auftragsverarbeitungsvertrag vorhanden</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            Für die KI-Kuratierung werden folgende Dienste genutzt (nur Quellartikel, keine Nutzerdaten):
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
            <li><strong>Hugging Face Inc.</strong> (primärer KI-Anbieter)</li>
            <li><strong>OpenAI Inc.</strong> (Fallback-KI-Anbieter)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">5. Cookies</h2>
          <p className="text-slate-600 dark:text-slate-400">
            NutriNews verwendet ausschließlich <strong>technisch notwendige Cookies</strong> für die Authentifizierung
            (Supabase Auth Session). Es werden keine Tracking-, Werbe- oder Analyse-Cookies eingesetzt.
            Für die Authentifizierungscookies ist keine gesonderte Einwilligung erforderlich (§ 25 Abs. 2 TDDDG).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">6. Ihre Rechte</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Sie haben folgende Rechte gemäß DSGVO:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
            <li><strong>Auskunft</strong> (Art. 15) — Welche Daten wir über Sie speichern</li>
            <li><strong>Berichtigung</strong> (Art. 16) — Korrektur unrichtiger Daten</li>
            <li><strong>Löschung</strong> (Art. 17) — Löschung Ihrer Daten (&ldquo;Recht auf Vergessenwerden&rdquo;)</li>
            <li><strong>Einschränkung</strong> (Art. 18) — Einschränkung der Verarbeitung</li>
            <li><strong>Datenübertragbarkeit</strong> (Art. 20) — Export Ihrer Daten</li>
            <li><strong>Widerspruch</strong> (Art. 21) — Widerspruch gegen Verarbeitung</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            Zur Ausübung Ihrer Rechte wenden Sie sich an: datenschutz@icarus-health.de
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">7. Beschwerderecht</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
            Zuständig ist die Aufsichtsbehörde des Bundeslandes, in dem unser Unternehmenssitz liegt.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">8. Speicherdauer</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Ihre Profildaten werden gespeichert, solange Ihr Konto besteht. Bei Kontolöschung werden alle
            personenbezogenen Daten innerhalb von 30 Tagen gelöscht. Anonymisierte Community-Beiträge können
            bestehen bleiben. Lokale Browserdaten werden von Ihnen selbst kontrolliert.
          </p>
        </section>

        <p className="text-[11px] text-slate-400 mt-8">
          Stand: März 2026 &middot; Platzhalter [in eckigen Klammern] müssen vor der Veröffentlichung ersetzt werden.
        </p>
      </div>
    </div>
  );
}
