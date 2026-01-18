import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Cookie } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function CookiePolicy() {
  return (
    <>
      <Helmet>
        <title>Politika Kolačića - wizMedik</title>
        <meta name="description" content="Saznajte kako wizMedik koristi kolačiće i kako možete kontrolisati njihovu upotrebu." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Cookie className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">Politika Kolačića</h1>
            <p className="text-xl text-white/90">
              Posljednje ažurirano: {new Date().toLocaleDateString('bs-BA')}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6">Šta su kolačići?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Kolačići (cookies) su male tekstualne datoteke koje se čuvaju na vašem uređaju 
                (računar, tablet, telefon) kada posjetite našu web stranicu. Oni nam pomažu da 
                poboljšamo vaše iskustvo korištenja i pružimo vam bolje usluge.
              </p>

              <h2 className="text-3xl font-bold mb-6">Koje kolačiće koristimo?</h2>
              
              <h3 className="text-2xl font-semibold mb-4">1. Neophodni Kolačići</h3>
              <p className="text-muted-foreground mb-6">
                Ovi kolačići su neophodni za funkcionisanje web stranice i ne mogu se isključiti. 
                Oni omogućavaju osnovne funkcije kao što su navigacija i pristup sigurnim dijelovima sajta.
              </p>
              <ul className="list-disc pl-6 mb-8 text-muted-foreground space-y-2">
                <li>Autentifikacija korisnika</li>
                <li>Sigurnosne funkcije</li>
                <li>Pamćenje postavki</li>
              </ul>

              <h3 className="text-2xl font-semibold mb-4">2. Analitički Kolačići</h3>
              <p className="text-muted-foreground mb-6">
                Ovi kolačići nam pomažu da razumijemo kako posjetioci koriste našu stranicu, 
                što nam omogućava da poboljšamo funkcionalnost i sadržaj.
              </p>
              <ul className="list-disc pl-6 mb-8 text-muted-foreground space-y-2">
                <li>Google Analytics - praćenje posjeta i ponašanja korisnika</li>
                <li>Statistika korištenja funkcija</li>
                <li>Analiza performansi stranice</li>
              </ul>

              <h3 className="text-2xl font-semibold mb-4">3. Funkcionalni Kolačići</h3>
              <p className="text-muted-foreground mb-6">
                Ovi kolačići omogućavaju poboljšane funkcionalnosti i personalizaciju.
              </p>
              <ul className="list-disc pl-6 mb-8 text-muted-foreground space-y-2">
                <li>Pamćenje jezika i regiona</li>
                <li>Pamćenje preferencija</li>
                <li>Personalizovani sadržaj</li>
              </ul>

              <h3 className="text-2xl font-semibold mb-4">4. Marketing Kolačići</h3>
              <p className="text-muted-foreground mb-6">
                Ovi kolačići se koriste za praćenje posjetilaca kroz različite web stranice 
                kako bi se prikazale relevantne reklame.
              </p>
              <ul className="list-disc pl-6 mb-8 text-muted-foreground space-y-2">
                <li>Facebook Pixel</li>
                <li>Google Ads</li>
                <li>Retargeting kampanje</li>
              </ul>

              <h2 className="text-3xl font-bold mb-6">Kako kontrolisati kolačiće?</h2>
              <p className="text-muted-foreground mb-6">
                Možete kontrolisati i/ili obrisati kolačiće kako želite. Možete obrisati sve 
                kolačiće koji su već na vašem računaru i možete podesiti većinu browsera da 
                spriječe njihovo postavljanje.
              </p>

              <h3 className="text-2xl font-semibold mb-4">Postavke Browsera</h3>
              <ul className="list-disc pl-6 mb-8 text-muted-foreground space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
              </ul>

              <h3 className="text-2xl font-semibold mb-4">Naše Postavke</h3>
              <p className="text-muted-foreground mb-6">
                Možete upravljati kolačićima kroz naš Cookie Consent banner koji se pojavljuje 
                pri prvoj posjeti. Možete prihvatiti sve, odbiti opcione ili prilagoditi postavke.
              </p>

              <h2 className="text-3xl font-bold mb-6">Koliko dugo čuvamo kolačiće?</h2>
              <ul className="list-disc pl-6 mb-8 text-muted-foreground space-y-2">
                <li><strong>Session kolačići:</strong> Brišu se kada zatvorite browser</li>
                <li><strong>Persistent kolačići:</strong> Ostaju do 12 mjeseci</li>
                <li><strong>Analitički kolačići:</strong> Do 24 mjeseca</li>
              </ul>

              <h2 className="text-3xl font-bold mb-6">Kontakt</h2>
              <p className="text-muted-foreground mb-6">
                Ako imate pitanja o našoj politici kolačića, kontaktirajte nas:
              </p>
              <ul className="list-none mb-8 text-muted-foreground space-y-2">
                <li><strong>Email:</strong> privacy@wizmedik.ba</li>
                <li><strong>Telefon:</strong> +387 33 123 456</li>
                <li><strong>Adresa:</strong> Zmaja od Bosne 7, 71000 Sarajevo, BiH</li>
              </ul>

              <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg mt-12">
                <p className="text-muted-foreground">
                  <strong>Napomena:</strong> Ova politika kolačića je dio naše{' '}
                  <a href="/privacy-policy" className="text-primary hover:underline">
                    Politike Privatnosti
                  </a>
                  {' '}i{' '}
                  <a href="/terms-of-service" className="text-primary hover:underline">
                    Uslova Korištenja
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
