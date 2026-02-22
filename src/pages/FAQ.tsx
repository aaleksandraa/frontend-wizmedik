import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function FAQ() {
  const faqCategories = [
    {
      category: 'Za Pacijente',
      icon: '👤',
      questions: [
        {
          q: 'Kako zakazati termin kod doktora?',
          a: 'Jednostavno pronađite doktora kroz pretragu, odaberite slobodan termin u kalendaru i potvrdite zakazivanje. Dobićete email potvrdu sa svim detaljima.'
        },
        {
          q: 'Da li je zakazivanje besplatno?',
          a: 'Da, zakazivanje termina preko wizMedik platforme je potpuno besplatno za pacijente. Plaćate samo pregled kod doktora.'
        },
        {
          q: 'Mogu li otkazati ili pomjeriti termin?',
          a: 'Da, možete otkazati ili pomjeriti termin do 24 sata prije zakazanog vremena kroz vaš profil ili link u email potvrdi.'
        },
        {
          q: 'Kako mogu ostaviti recenziju?',
          a: 'Nakon obavljenog pregleda, dobićete email sa linkom za ostavljanje recenzije. Također možete ostaviti recenziju kroz vaš profil.'
        },
        {
          q: 'Da li trebam kreirati nalog?',
          a: 'Ne morate, ali preporučujemo. Sa nalogom možete pratiti sve svoje termine, recenzije i imati brži pristup zakazivanju.'
        }
      ]
    },
    {
      category: 'Za Doktore',
      icon: '👨‍⚕️',
      questions: [
        {
          q: 'Koliko košta registracija?',
          a: 'Imamo besplatni plan sa osnovnim funkcijama i premium planove od 49 KM mjesečno sa naprednim opcijama.'
        },
        {
          q: 'Kako funkcioniše zakazivanje?',
          a: 'Vi definirate svoje radno vrijeme i trajanje termina. Pacijenti biraju slobodne termine, a vi dobijate notifikaciju za svako zakazivanje.'
        },
        {
          q: 'Mogu li upravljati sa više lokacija?',
          a: 'Da, sa Professional i Enterprise planovima možete dodati više lokacija i upravljati terminima za svaku posebno.'
        },
        {
          q: 'Kako se vrši plaćanje?',
          a: 'Plaćanje se vrši mjesečno putem kreditne kartice ili bankovnog transfera. Možete otkazati bilo kada.'
        },
        {
          q: 'Da li postoji podrška?',
          a: 'Da, nudimo email podršku za sve korisnike i prioritetnu podršku za premium članove.'
        }
      ]
    },
    {
      category: 'Za Klinike',
      icon: '🏥',
      questions: [
        {
          q: 'Koliko doktora mogu dodati?',
          a: 'Zavisi od plana - Starter do 5, Business do 20, Enterprise neograničeno.'
        },
        {
          q: 'Mogu li upravljati sa više lokacija?',
          a: 'Da, Business plan podržava do 3 lokacije, Enterprise neograničeno.'
        },
        {
          q: 'Kako funkcionišu izvještaji?',
          a: 'Dobijate detaljne izvještaje o terminima, prihodima, performansama doktora i zadovoljstvu pacijenata.'
        },
        {
          q: 'Da li mogu prilagoditi profil klinike?',
          a: 'Da, možete dodati logo, slike, opis, usluge i sve relevantne informacije.'
        },
        {
          q: 'Šta je uključeno u Enterprise planu?',
          a: 'Sve funkcije plus dedicirani account manager, custom integracije, white-label opcija i SLA garancija.'
        }
      ]
    },
    {
      category: 'Tehnička Podrška',
      icon: '🔧',
      questions: [
        {
          q: 'Koje browsere podržavate?',
          a: 'Podržavamo sve moderne browsere - Chrome, Firefox, Safari, Edge (najnovije verzije).'
        },
        {
          q: 'Da li postoji mobilna aplikacija?',
          a: 'Trenutno nemamo native aplikaciju, ali naš sajt je potpuno responsive i radi odlično na mobilnim uređajima.'
        },
        {
          q: 'Kako su zaštićeni moji podaci?',
          a: 'Koristimo enterprise-grade sigurnost sa SSL enkripcijom, GDPR compliance i redovne sigurnosne provjere.'
        },
        {
          q: 'Šta ako zaboravim lozinku?',
          a: 'Kliknite na "Zaboravili ste lozinku?" na login stranici i slijedite instrukcije za resetovanje.'
        },
        {
          q: 'Kako mogu kontaktirati podršku?',
          a: 'Možete nas kontaktirati putem email-a info@wizmedik.com ili kontakt forme na sajtu.'
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Često Postavljana Pitanja - wizMedik</title>
        <meta name="description" content="Pronađite odgovore na najčešća pitanja o wizMedik platformi. Pomoć za pacijente, doktore i klinike." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">Često Postavljana Pitanja</h1>
            <p className="text-xl text-white/90">
              Pronađite odgovore na najčešća pitanja
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="space-y-12">
              {faqCategories.map((category, i) => (
                <Card key={i}>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl">{category.icon}</span>
                      <h2 className="text-3xl font-bold">{category.category}</h2>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, j) => (
                        <AccordionItem key={j} value={`item-${i}-${j}`}>
                          <AccordionTrigger className="text-left text-lg font-semibold">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact CTA */}
            <Card className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Niste pronašli odgovor?</h3>
                <p className="text-muted-foreground mb-6">
                  Kontaktirajte nas i rado ćemo vam pomoći
                </p>
                <a href="/contact">
                  <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                    Kontaktirajte Nas
                  </button>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
