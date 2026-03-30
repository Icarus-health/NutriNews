import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Impressum – NutriNews',
};

export default function ImpressumPage() {
  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-[13px] text-forest-600 dark:text-forest-400 font-semibold mb-4 hover:text-forest-700 dark:hover:text-forest-300 transition-colors"
      >
        <ArrowLeft size={14} />
        Zurück
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Impressum</h1>

      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Angaben gemäß § 5 TMG</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Icarus Health GmbH<br />
            [Straße und Hausnummer]<br />
            [PLZ Ort]<br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Vertreten durch</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Geschäftsführer: Sören Kube
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Kontakt</h2>
          <p className="text-slate-600 dark:text-slate-400">
            E-Mail: info@icarus-health.de<br />
            Telefon: [Telefonnummer]
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Registereintrag</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Registergericht: [Amtsgericht]<br />
            Registernummer: [HRB-Nummer]
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Umsatzsteuer-ID</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
            [USt-IdNr.]
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Sören Kube<br />
            [Adresse wie oben]
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Haftungsausschluss</h2>

          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4">Haftung für Inhalte</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
            Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1
            TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind
            wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
            oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>

          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4">Haftung für Links</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb
            können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets
            der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>

          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4">Medizinischer Haftungsausschluss</h3>
          <p className="text-slate-600 dark:text-slate-400">
            NutriNews dient ausschließlich der fachlichen Information für Ernährungstherapeuten und ersetzt keine individuelle
            medizinische oder ernährungstherapeutische Beratung. Die bereitgestellten Inhalte sind als Fachinformation zu
            verstehen und nicht als Therapieempfehlung für Patienten. Für therapeutische Entscheidungen ist stets die
            individuelle fachliche Beurteilung durch den behandelnden Therapeuten maßgeblich.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Urheberrecht</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
            Die KI-generierten Zusammenfassungen basieren auf öffentlich zugänglichen Quellen und dienen der Fachinformation.
            Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
            Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
            bzw. Erstellers.
          </p>
        </section>

        <p className="text-[11px] text-slate-400 mt-8">
          Stand: März 2026 &middot; Platzhalter [in eckigen Klammern] müssen vor der Veröffentlichung ersetzt werden.
        </p>
      </div>
    </div>
  );
}
