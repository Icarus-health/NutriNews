import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Nutzungsbedingungen – NutriNews',
};

export default function NutzungsbedingungenPage() {
  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-[13px] text-forest-600 dark:text-forest-400 font-semibold mb-4 hover:text-forest-700 dark:hover:text-forest-300 transition-colors"
      >
        <ArrowLeft size={14} />
        Zurück
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Nutzungsbedingungen</h1>

      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">1. Geltungsbereich</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Diese Nutzungsbedingungen gelten für die Nutzung der Plattform NutriNews, betrieben von der
            Icarus Health GmbH. Mit der Registrierung und Nutzung akzeptieren Sie diese Bedingungen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">2. Zielgruppe und Zweck</h2>
          <p className="text-slate-600 dark:text-slate-400">
            NutriNews richtet sich ausschließlich an <strong>Ernährungstherapeuten, Diätassistenten,
            Oecotrophologen und vergleichbare Fachkräfte</strong> im deutschsprachigen Raum. Die Plattform
            dient der Fachinformation und dem kollegialen Austausch. Sie ist keine Patientenplattform und
            ersetzt keine individuelle Therapieplanung.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">3. Inhalte und Evidenz</h2>

          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4">3.1 KI-kuratierte Inhalte</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Artikel werden mithilfe Künstlicher Intelligenz zusammengefasst und eingeordnet. Diese Zusammenfassungen
            sind als Orientierungshilfe zu verstehen und ersetzen nicht das Lesen der Originalquelle.
            KI-kuratierte Inhalte sind entsprechend gekennzeichnet.
          </p>

          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4">3.2 Evidenz-Einordnung</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Die auf NutriNews dargestellten Evidenz-Level, Praxisrelevanz-Scores und Handlungsempfehlungen werden
            algorithmisch ermittelt und dienen der fachlichen Orientierung. Sie stellen keine abschließende
            wissenschaftliche Bewertung dar. Die kritische Bewertung der Evidenz obliegt stets dem nutzenden Fachpersonal.
          </p>

          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4">3.3 Community-Inhalte</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Beiträge in Fachgruppen und Schnellfragen werden von Nutzern erstellt und geben deren persönliche
            Fachmeinung wieder. NutriNews übernimmt keine Haftung für die Richtigkeit nutzergenerierter Inhalte.
            Das Community-Verifikationssystem (praxisrelevant/korrekt/Korrektur nötig/zweifelhaft) dient der
            kollegialen Qualitätssicherung.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">4. Verhaltensregeln</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Nutzer verpflichten sich zu fachlich fundiertem, respektvollem Austausch. Untersagt sind:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
            <li>Veröffentlichung von Patientendaten oder personenbezogenen Gesundheitsinformationen</li>
            <li>Werbung für Produkte oder Dienstleistungen ohne Kennzeichnung</li>
            <li>Verbreitung von medizinischer Fehlinformation</li>
            <li>Beleidigende, diskriminierende oder rechtswidrige Inhalte</li>
            <li>Nutzung durch nicht-fachliche Personen (Patienten, Laien)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">5. Flagging und Moderation</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Artikel, die von mindestens 3 Nutzern als &ldquo;Korrektur nötig&rdquo; oder &ldquo;Quelle zweifelhaft&rdquo;
            markiert werden, erhalten einen Warnhinweis. Ab 10 positiven Bewertungen als &ldquo;praxisrelevant&rdquo;
            erhalten Artikel ein Empfehlungs-Badge. Wir behalten uns vor, Inhalte bei Verstoß gegen diese
            Bedingungen zu entfernen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">6. Haftungsbeschränkung</h2>
          <p className="text-slate-600 dark:text-slate-400">
            NutriNews stellt Fachinformationen bereit, übernimmt jedoch keine Haftung für therapeutische
            Entscheidungen, die auf Basis der Plattforminhalte getroffen werden. Die fachliche Verantwortung
            liegt beim behandelnden Therapeuten. Insbesondere haftet NutriNews nicht für:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
            <li>Ungenauigkeiten in KI-generierten Zusammenfassungen</li>
            <li>Fehlerhafte Evidenz-Einordnungen</li>
            <li>Inhalte nutzergenerierter Community-Beiträge</li>
            <li>Inhalte externer verlinkter Quellen</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">7. Geistiges Eigentum</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Die Plattform und ihre originären Inhalte sind urheberrechtlich geschützt. Quellartikel werden nur
            zusammengefasst referenziert; die Originalinhalte verbleiben bei den jeweiligen Verlagen und Autoren.
            Links zu Originalquellen sind stets angegeben.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">8. Änderungen</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Wir behalten uns vor, diese Nutzungsbedingungen zu ändern. Über wesentliche Änderungen werden
            registrierte Nutzer per E-Mail informiert. Die weitere Nutzung nach Inkrafttreten der Änderungen
            gilt als Zustimmung.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">9. Anwendbares Recht</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist der Sitz der Icarus Health GmbH.
          </p>
        </section>

        <p className="text-[11px] text-slate-400 mt-8">
          Stand: März 2026
        </p>
      </div>
    </div>
  );
}
