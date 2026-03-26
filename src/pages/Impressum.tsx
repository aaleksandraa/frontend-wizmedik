import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function Impressum() {
  return (
    <>
      <Helmet>
        <title>Impressum | wizMedik</title>
        <meta
          name="description"
          content="Impressum platforme wizMedik: osnovni podaci, kontakt, odgovornost, autorska prava i zastita podataka."
        />
        <link rel="canonical" href="https://wizmedik.com/impressum" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Impressum</h1>
            </div>

            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-primary">
                  <h2>Osnovni podaci</h2>
                  <p><strong>Naziv platforme:</strong> WizMedik</p>
                  <p><strong>Vlasnik i operater:</strong> racunarsko programiranje Wizionar</p>
                  <p><strong>Sjediste:</strong> Modrica, Bosna i Hercegovina</p>
                  <p><strong>Adresa:</strong> Modrica, Bosna i Hercegovina</p>
                  <p><strong>JIB / ID broj:</strong> 4512696590007</p>

                  <h2>Kontakt</h2>
                  <p><strong>Email:</strong> info@wizmedik.com</p>
                  <p><strong>Web:</strong> https://wizmedik.com</p>

                  <h2>Odgovorno lice</h2>
                  <p>Za sadrzaj i upravljanje platformom odgovorno je: racunarsko programiranje Wizionar.</p>

                  <h2>Opis djelatnosti</h2>
                  <p>WizMedik je digitalna platforma koja omogucava:</p>
                  <ul>
                    <li>pretragu doktora, klinika i medicinskih ustanova</li>
                    <li>informisanje o zdravstvenim uslugama</li>
                    <li>online zakazivanje termina</li>
                    <li>edukativni sadrzaj iz oblasti zdravlja</li>
                  </ul>
                  <p>
                    Platforma ne pruza medicinske usluge direktno, vec sluzi kao posrednik izmedu korisnika i
                    zdravstvenih ustanova.
                  </p>

                  <h2>Odricanje od odgovornosti (Disclaimer)</h2>
                  <p>
                    Sadrzaj objavljen na WizMedik platformi ima iskljucivo informativni karakter i ne predstavlja
                    medicinski savjet.
                  </p>
                  <p>
                    Za tacnost medicinskih informacija odgovorni su autori (doktori i ustanove) koji objavljuju
                    sadrzaj.
                  </p>
                  <p>
                    Korisnici se uvijek trebaju konsultovati sa kvalifikovanim zdravstvenim radnikom prije donosenja
                    medicinskih odluka.
                  </p>

                  <h2>Odgovornost za sadrzaj trecih strana</h2>
                  <p>WizMedik ne snosi odgovornost za:</p>
                  <ul>
                    <li>sadrzaj profila doktora i ustanova</li>
                    <li>tacnost informacija koje unose trece strane</li>
                    <li>eventualne greske ili zastarjele podatke</li>
                  </ul>
                  <p>
                    Platforma zadrzava pravo izmjene ili uklanjanja sadrzaja koji nije u skladu sa pravilima.
                  </p>

                  <h2>Autorska prava</h2>
                  <p>
                    Svi sadrzaji na platformi (tekst, dizajn, logo, slike) su vlasnistvo WizMedik ili njihovih autora
                    i zasticeni su vazecim zakonima o autorskim pravima.
                  </p>
                  <p>
                    Zabranjeno je neovlasteno kopiranje, distribucija ili koristenje sadrzaja bez dozvole.
                  </p>

                  <h2>Zastita podataka</h2>
                  <p>WizMedik obradjuje licne podatke u skladu sa vazecim zakonima Bosne i Hercegovine.</p>
                  <p>
                    Detaljne informacije dostupne su u dokumentu:{' '}
                    <Link to="/politika-privatnosti">Politika privatnosti</Link>.
                  </p>

                  <h2>Tehnicka infrastruktura</h2>
                  <p>
                    Platforma koristi savremene tehnologije i sigurnosne standarde za zastitu podataka i stabilnost
                    sistema.
                  </p>

                  <h2>Nadleznost</h2>
                  <p>Za sve eventualne sporove nadlezan je sud u Bosni i Hercegovini.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
