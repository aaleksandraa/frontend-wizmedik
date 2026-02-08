import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home,
  Heart,
  Brain,
  Users,
  Shield,
  Activity,
  Clock,
  Stethoscope,
  Bed,
  Utensils,
  Smile,
  HandHeart,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Star,
  Phone
} from 'lucide-react';

// Tipovi domova
const tipoviDomova = [
  {
    id: 'stariji',
    naziv: 'Dom za starije osobe',
    ikona: Users,
    boja: 'bg-cyan-100 text-cyan-700',
    opis: 'Ustanove namijenjene osobama starije životne dobi koje su relativno samostalne, ali im je potrebna određena podrška u svakodnevnom životu.',
    zaKoga: [
      'Osobe starije od 65 godina',
      'Relativno samostalne osobe koje mogu obavljati osnovne aktivnosti',
      'Osobe kojima je potrebno društvo i socijalna interakcija',
      'Osobe koje žive same i žele sigurnije okruženje'
    ],
    usluge: [
      'Smještaj u jednokrevetnim ili dvokrevetnim sobama',
      'Tri obroka dnevno prilagođena potrebama',
      'Pomoć pri uzimanju lijekova',
      'Organizovane društvene aktivnosti',
      'Praćenje zdravstvenog stanja',
      'Čišćenje i pranje rublja'
    ],
    prosjecnaCijena: '800 - 1.200 KM mjesečno'
  },
  {
    id: 'njega',
    naziv: 'Dom sa pojačanom njegom',
    ikona: Heart,
    boja: 'bg-purple-100 text-purple-700',
    opis: 'Ustanove koje pružaju intenzivniju njegu osobama kojima je potrebna svakodnevna pomoć u obavljanju osnovnih životnih aktivnosti.',
    zaKoga: [
      'Osobe sa smanjenom pokretljivošću',
      'Osobe koje trebaju pomoć pri kupanju, oblačenju, hranjenju',
      'Osobe sa hroničnim bolestima koje zahtijevaju redovnu njegu',
      'Osobe u oporavku nakon bolesti ili operacije'
    ],
    usluge: [
      'Sve usluge doma za starije +',
      '24-satna dostupnost medicinskog osoblja',
      'Pomoć pri svim aktivnostima dnevnog života',
      'Fizioterapija i rehabilitacija',
      'Specijalizirana medicinska njega',
      'Praćenje vitalnih funkcija'
    ],
    prosjecnaCijena: '1.200 - 1.800 KM mjesečno'
  },
  {
    id: 'demencija',
    naziv: 'Specijalizirani dom za demenciju',
    ikona: Brain,
    boja: 'bg-teal-100 text-teal-700',
    opis: 'Ustanove specijalizirane za njegu osoba sa demencijom, Alzheimerovom bolešću i drugim kognitivnim poremećajima.',
    zaKoga: [
      'Osobe sa dijagnozom demencije',
      'Osobe sa Alzheimerovom bolešću',
      'Osobe sa vaskularnom demencijom',
      'Osobe sa drugim kognitivnim poremećajima'
    ],
    usluge: [
      'Sigurno okruženje koje sprječava lutanje',
      'Osoblje obučeno za rad sa demencijom',
      'Strukturirane dnevne aktivnosti za stimulaciju pamćenja',
      'Terapija reminiscencijom',
      'Individualizirani pristup svakom štićeniku',
      'Podrška porodicama'
    ],
    prosjecnaCijena: '1.500 - 2.500 KM mjesečno'
  },
  {
    id: 'palijativa',
    naziv: 'Palijativna njega',
    ikona: HandHeart,
    boja: 'bg-rose-100 text-rose-700',
    opis: 'Specijalizirana njega za osobe sa terminalnim bolestima, fokusirana na kvalitet života i kontrolu simptoma.',
    zaKoga: [
      'Osobe sa terminalnim bolestima',
      'Osobe u završnoj fazi hroničnih bolesti',
      'Osobe kojima je potrebna kontrola bola',
      'Osobe i porodice kojima je potrebna emocionalna podrška'
    ],
    usluge: [
      'Kontrola bola i simptoma',
      '24-satna medicinska njega',
      'Psihološka podrška pacijentu i porodici',
      'Duhovna podrška',
      'Koordinacija sa ljekarima i bolnicama',
      'Podrška u žalovanju za porodicu'
    ],
    prosjecnaCijena: '1.800 - 3.000 KM mjesečno'
  }
];

// Nivoi njege
const nivoiNjege = [
  {
    id: 'osnovna',
    naziv: 'Osnovna njega (Nivo I)',
    ikona: Shield,
    boja: 'bg-green-500',
    opis: 'Minimalna podrška za relativno samostalne osobe koje trebaju nadzor i pomoć u određenim aktivnostima.',
    karakteristike: [
      'Osoba je uglavnom samostalna u kretanju',
      'Može sama jesti, ali treba podsjetnik za lijekove',
      'Potreban nadzor, ali ne stalna pomoć',
      'Može komunicirati i izraziti svoje potrebe',
      'Mentalno je stabilna ili ima blage kognitivne promjene'
    ],
    ukljucuje: [
      'Smještaj i pansion (3 obroka)',
      'Nadzor i praćenje zdravlja',
      'Pomoć pri uzimanju lijekova',
      'Organizovane aktivnosti',
      'Čišćenje sobe i pranje rublja',
      'Pristup medicinskom osoblju po potrebi'
    ],
    omjerOsoblja: '1 njegovatelj na 8-10 štićenika',
    prosjecnaCijena: '800 - 1.000 KM'
  },
  {
    id: 'pojacana',
    naziv: 'Pojačana njega (Nivo II)',
    ikona: Heart,
    boja: 'bg-yellow-500',
    opis: 'Intenzivnija podrška za osobe kojima je potrebna redovna pomoć u svakodnevnim aktivnostima.',
    karakteristike: [
      'Smanjena pokretljivost - koristi pomagala ili invalidska kolica',
      'Treba pomoć pri kupanju i oblačenju',
      'Može trebati pomoć pri hranjenju',
      'Ima hronične bolesti koje zahtijevaju praćenje',
      'Može imati umjerene kognitivne promjene'
    ],
    ukljucuje: [
      'Sve iz osnovne njege +',
      'Pomoć pri kupanju i ličnoj higijeni',
      'Pomoć pri oblačenju',
      'Pomoć pri kretanju i transferima',
      'Redovno praćenje vitalnih funkcija',
      'Fizioterapija po potrebi',
      'Prilagođena ishrana'
    ],
    omjerOsoblja: '1 njegovatelj na 5-6 štićenika',
    prosjecnaCijena: '1.200 - 1.500 KM'
  },
  {
    id: 'intenzivna',
    naziv: 'Intenzivna njega (Nivo III)',
    ikona: Activity,
    boja: 'bg-orange-500',
    opis: 'Visok nivo njege za osobe koje su potpuno ovisne o pomoći drugih u svim aktivnostima.',
    karakteristike: [
      'Potpuno nepokretna osoba ili minimalna pokretljivost',
      'Potrebna pomoć u svim aktivnostima dnevnog života',
      'Može imati dekubituse ili rizik od njih',
      'Inkontinencija',
      'Može trebati hranjenje putem sonde',
      'Teže kognitivne promjene ili demencija'
    ],
    ukljucuje: [
      'Sve iz pojačane njege +',
      '24-satna medicinska njega',
      'Prevencija i tretman dekubitusa',
      'Njega inkontinencije',
      'Specijalizirana ishrana',
      'Intenzivna fizioterapija',
      'Stalni medicinski nadzor'
    ],
    omjerOsoblja: '1 njegovatelj na 3-4 štićenika',
    prosjecnaCijena: '1.500 - 2.000 KM'
  },
  {
    id: 'specijalizirana',
    naziv: 'Specijalizirana njega (Nivo IV)',
    ikona: Stethoscope,
    boja: 'bg-red-500',
    opis: 'Najviši nivo njege za osobe sa kompleksnim medicinskim potrebama ili u terminalnoj fazi bolesti.',
    karakteristike: [
      'Kompleksna medicinska stanja',
      'Potreba za stalnim medicinskim nadzorom',
      'Terminalna faza bolesti',
      'Potreba za kontrolom bola',
      'Uznapredovala demencija sa bihevioralnim simptomima',
      'Potreba za specijaliziranom opremom'
    ],
    ukljucuje: [
      'Sve iz intenzivne njege +',
      'Stalni nadzor ljekara',
      'Palijativna njega',
      'Kontrola bola',
      'Specijalizirana medicinska oprema',
      'Psihološka podrška',
      'Koordinacija sa bolnicama'
    ],
    omjerOsoblja: '1 njegovatelj na 2-3 štićenika',
    prosjecnaCijena: '2.000 - 3.000+ KM'
  }
];


// Programi njege
const programiNjege = [
  {
    id: 'demencija-program',
    naziv: 'Program njege za demenciju',
    ikona: Brain,
    boja: 'bg-teal-100 text-teal-700',
    opis: 'Specijalizirani program za osobe sa demencijom i Alzheimerovom bolešću koji se fokusira na održavanje kognitivnih funkcija i kvaliteta života.',
    ciljnaGrupa: 'Osobe sa dijagnozom demencije, Alzheimerove bolesti ili drugih kognitivnih poremećaja',
    komponente: [
      {
        naziv: 'Sigurno okruženje',
        opis: 'Prostori dizajnirani da sprječavaju lutanje, sa jasnim oznakama i sigurnosnim sistemima.'
      },
      {
        naziv: 'Kognitivna stimulacija',
        opis: 'Aktivnosti koje stimuliraju pamćenje - puzzle, igre, muzikoterapija, reminiscencija.'
      },
      {
        naziv: 'Strukturirani dnevni raspored',
        opis: 'Predvidljiva rutina koja smanjuje anksioznost i konfuziju.'
      },
      {
        naziv: 'Individualizirani pristup',
        opis: 'Plan njege prilagođen fazi bolesti i ličnoj historiji štićenika.'
      },
      {
        naziv: 'Obučeno osoblje',
        opis: 'Njegovatelji sa specijaliziranom obukom za rad sa osobama sa demencijom.'
      },
      {
        naziv: 'Podrška porodicama',
        opis: 'Edukacija i savjetovanje za članove porodice.'
      }
    ],
    napomena: 'Rani stadiji demencije mogu se zbrinjavati u standardnim domovima, dok uznapredovali stadiji zahtijevaju specijalizirane ustanove.'
  },
  {
    id: 'rehabilitacija',
    naziv: 'Program rehabilitacije',
    ikona: Activity,
    boja: 'bg-cyan-100 text-cyan-700',
    opis: 'Program usmjeren na oporavak funkcionalnih sposobnosti nakon bolesti, operacije ili povrede.',
    ciljnaGrupa: 'Osobe u oporavku nakon moždanog udara, operacija kuka/koljena, fraktura, ili dugotrajne hospitalizacije',
    komponente: [
      {
        naziv: 'Fizioterapija',
        opis: 'Individualni program vježbi za vraćanje snage, pokretljivosti i ravnoteže.'
      },
      {
        naziv: 'Radna terapija',
        opis: 'Vježbanje svakodnevnih aktivnosti - oblačenje, hranjenje, lična higijena.'
      },
      {
        naziv: 'Logopedska terapija',
        opis: 'Za osobe sa poremećajima govora ili gutanja (nakon moždanog udara).'
      },
      {
        naziv: 'Praćenje napretka',
        opis: 'Redovna evaluacija i prilagodba programa prema napretku.'
      },
      {
        naziv: 'Priprema za povratak kući',
        opis: 'Obuka za samostalan život i savjeti za prilagodbu doma.'
      }
    ],
    napomena: 'Trajanje programa zavisi od stanja - obično 2-8 sedmica. Cilj je povratak kući ili prelazak na niži nivo njege.'
  },
  {
    id: 'palijativna-program',
    naziv: 'Program palijativne njege',
    ikona: HandHeart,
    boja: 'bg-rose-100 text-rose-700',
    opis: 'Holistički pristup njezi osoba sa terminalnim bolestima, fokusiran na kvalitet života i kontrolu simptoma.',
    ciljnaGrupa: 'Osobe sa terminalnim bolestima (rak, zatajenje organa, uznapredovale neurološke bolesti)',
    komponente: [
      {
        naziv: 'Kontrola bola',
        opis: 'Farmakološke i nefarmakološke metode za upravljanje bolom.'
      },
      {
        naziv: 'Kontrola simptoma',
        opis: 'Upravljanje mučninom, otežanim disanjem, anksioznošću i drugim simptomima.'
      },
      {
        naziv: 'Psihološka podrška',
        opis: 'Savjetovanje za pacijenta u suočavanju sa bolešću.'
      },
      {
        naziv: 'Podrška porodici',
        opis: 'Savjetovanje, edukacija i pomoć porodici tokom bolesti i nakon gubitka.'
      },
      {
        naziv: 'Duhovna njega',
        opis: 'Podrška u skladu sa vjerskim i duhovnim potrebama pacijenta.'
      },
      {
        naziv: 'Koordinacija njege',
        opis: 'Saradnja sa ljekarima, bolnicama i drugim pružaocima usluga.'
      }
    ],
    napomena: 'Palijativna njega nije isto što i hospis - može se pružati paralelno sa kurativnim liječenjem.'
  },
  {
    id: 'respiratorna',
    naziv: 'Program respiratorne njege',
    ikona: Activity,
    boja: 'bg-cyan-100 text-cyan-700',
    opis: 'Specijalizirana njega za osobe sa hroničnim respiratornim oboljenjima ili potrebom za respiratornom podrškom.',
    ciljnaGrupa: 'Osobe sa KOPB-om, nakon dugotrajne mehaničke ventilacije, sa traheostomom',
    komponente: [
      {
        naziv: 'Respiratorna fizioterapija',
        opis: 'Vježbe disanja, posturalna drenaža, tehnike čišćenja dišnih puteva.'
      },
      {
        naziv: 'Njega traheostome',
        opis: 'Za pacijente sa traheostomom - čišćenje, zamjena kanile, aspiracija.'
      },
      {
        naziv: 'Oksigenoterapija',
        opis: 'Primjena kiseonika prema potrebi i praćenje saturacije.'
      },
      {
        naziv: 'Odvikavanje od ventilatora',
        opis: 'Postupni program za pacijente koji prelaze sa mehaničke ventilacije.'
      },
      {
        naziv: 'Edukacija',
        opis: 'Obuka pacijenta i porodice za upravljanje respiratornim stanjem.'
      }
    ],
    napomena: 'Zahtijeva osoblje sa specijaliziranom obukom i odgovarajuću opremu.'
  },
  {
    id: 'mentalno-zdravlje',
    naziv: 'Program za mentalno zdravlje',
    ikona: Smile,
    boja: 'bg-purple-100 text-purple-700',
    opis: 'Podrška osobama sa psihijatrijskim oboljenjima u stabilnoj fazi koje trebaju strukturirano okruženje.',
    ciljnaGrupa: 'Starije osobe sa depresijom, anksioznošću, bipolarnim poremećajem ili shizofrenijom u stabilnoj fazi',
    komponente: [
      {
        naziv: 'Praćenje mentalnog stanja',
        opis: 'Redovna procjena raspoloženja, ponašanja i kognitivnih funkcija.'
      },
      {
        naziv: 'Upravljanje lijekovima',
        opis: 'Striktno praćenje psihijatrijske terapije i nuspojava.'
      },
      {
        naziv: 'Terapijske aktivnosti',
        opis: 'Grupna terapija, art terapija, relaksacione tehnike.'
      },
      {
        naziv: 'Strukturirani dnevni raspored',
        opis: 'Predvidljiva rutina koja pruža sigurnost i stabilnost.'
      },
      {
        naziv: 'Saradnja sa psihijatrom',
        opis: 'Redovne kontrole i prilagodba terapije.'
      }
    ],
    napomena: 'Nije zamjena za psihijatrijsku bolnicu - namijenjen osobama u stabilnoj fazi bolesti.'
  },
  {
    id: 'kratkorocni',
    naziv: 'Kratkoročni boravak (Respite Care)',
    ikona: Clock,
    boja: 'bg-amber-100 text-amber-700',
    opis: 'Privremeni smještaj koji omogućava porodicama predah od svakodnevne njege.',
    ciljnaGrupa: 'Osobe čiji njegovatelji trebaju odmor, ili osobe u oporavku koje trebaju privremenu njegu',
    komponente: [
      {
        naziv: 'Fleksibilno trajanje',
        opis: 'Od nekoliko dana do nekoliko sedmica, prema potrebi porodice.'
      },
      {
        naziv: 'Kompletna njega',
        opis: 'Isti nivo njege kao za stalne štićenike.'
      },
      {
        naziv: 'Brzi prijem',
        opis: 'Mogućnost brzog prijema u hitnim situacijama.'
      },
      {
        naziv: 'Kontinuitet njege',
        opis: 'Praćenje postojećeg plana njege i terapije.'
      }
    ],
    napomena: 'Odlična opcija za porodice koje brinu o starijim članovima kod kuće i trebaju povremeni predah.'
  }
];

// Medicinske usluge
const medicinskeusluge = [
  {
    naziv: '24-satna dostupnost medicinskih sestara',
    opis: 'Medicinske sestre su dostupne non-stop za praćenje zdravlja, davanje lijekova i reagovanje na hitne situacije.',
    vaznost: 'Osnovna sigurnosna mjera u svakom domu'
  },
  {
    naziv: 'Redovne posjete ljekara',
    opis: 'Ljekar opće prakse dolazi u dom redovno (obično 1-2 puta sedmično) za preglede i praćenje zdravlja.',
    vaznost: 'Omogućava kontinuirano praćenje bez odlaska u ambulantu'
  },
  {
    naziv: 'Fizioterapija',
    opis: 'Fizioterapeut provodi individualne i grupne vježbe za održavanje pokretljivosti i snage.',
    vaznost: 'Ključna za prevenciju pada i održavanje samostalnosti'
  },
  {
    naziv: 'Radna terapija',
    opis: 'Radni terapeut pomaže u održavanju sposobnosti za svakodnevne aktivnosti.',
    vaznost: 'Pomaže štićenicima da ostanu što samostalniji'
  },
  {
    naziv: 'Njega rana',
    opis: 'Specijalizirana njega za prevenciju i liječenje dekubitusa i drugih rana.',
    vaznost: 'Kritična za nepokretne pacijente'
  },
  {
    naziv: 'Upravljanje lijekovima',
    opis: 'Pravilno čuvanje, priprema i davanje lijekova prema propisanoj terapiji.',
    vaznost: 'Sprječava greške u uzimanju lijekova'
  }
];


export default function CareHomesVodic() {
  const [activeTab, setActiveTab] = useState('tipovi');

  // SEO Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Vodič za domove za starije i bolesne osobe - Tipovi, nivoi njege i programi",
    "description": "Kompletan vodič o domovima za starije osobe u BiH. Saznajte razlike između tipova domova, nivoa njege i specijaliziranih programa.",
    "url": window.location.href,
    "author": {
      "@type": "Organization",
      "name": "WizMedik"
    },
    "publisher": {
      "@type": "Organization",
      "name": "WizMedik"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Koja je razlika između doma za starije i doma sa pojačanom njegom?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dom za starije je namijenjen relativno samostalnim osobama koje trebaju nadzor i društvo, dok dom sa pojačanom njegom pruža intenzivniju njegu osobama kojima je potrebna svakodnevna pomoć pri kupanju, oblačenju i drugim aktivnostima."
        }
      },
      {
        "@type": "Question",
        "name": "Koliko košta smještaj u domu za starije u BiH?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cijene variraju od 800 KM za osnovnu njegu do 3000+ KM za specijaliziranu njegu. Prosječna cijena za pojačanu njegu je 1200-1500 KM mjesečno. Cijena zavisi od nivoa njege, lokacije i tipa sobe."
        }
      },
      {
        "@type": "Question",
        "name": "Šta uključuje osnovna njega u domu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Osnovna njega uključuje smještaj, tri obroka dnevno, nadzor, pomoć pri uzimanju lijekova, organizovane aktivnosti, čišćenje sobe i pranje rublja. Namijenjena je relativno samostalnim osobama."
        }
      },
      {
        "@type": "Question",
        "name": "Da li domovi primaju osobe sa demencijom?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Da, postoje specijalizirani domovi i odjeli za osobe sa demencijom. Oni imaju sigurno okruženje, obučeno osoblje i programe kognitivne stimulacije. Rani stadiji mogu se zbrinjavati u standardnim domovima."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Vodič za domove za starije - Tipovi domova, nivoi njege i programi | WizMedik</title>
        <meta name="description" content="Kompletan vodič o domovima za starije i bolesne osobe u BiH. Saznajte razlike između tipova domova, nivoa njege (osnovna, pojačana, intenzivna), specijaliziranih programa za demenciju, rehabilitaciju i palijativnu njegu." />
        <meta name="keywords" content="dom za starije, starački dom, njega starijih, demencija njega, palijativna njega, rehabilitacija, nivo njege, dom za bolesne, gerontološki centar" />
        
        <meta property="og:title" content="Vodič za domove za starije - Tipovi, nivoi njege i programi" />
        <meta property="og:description" content="Sve što trebate znati o domovima za starije osobe - tipovi domova, nivoi njege, specijalizirani programi i cijene." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        
        <link rel="canonical" href={`${window.location.origin}/domovi-njega/vodic`} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
        {/* Hero */}
        <header className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Breadcrumb - hidden on mobile */}
            <nav aria-label="Breadcrumb" className="mb-6 hidden md:block">
              <ol className="flex items-center gap-2 text-sm text-white/80">
                <li><Link to="/" className="hover:text-white">Početna</Link></li>
                <ChevronRight className="h-4 w-4" />
                <li><Link to="/domovi-njega" className="hover:text-white">Domovi za njegu</Link></li>
                <ChevronRight className="h-4 w-4" />
                <li className="text-white font-medium">Vodič</li>
              </ol>
            </nav>

            <div className="text-center">
              {/* Icon above title on mobile */}
              <Home className="h-12 w-12 mx-auto mb-4 md:hidden" />
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <Home className="h-12 w-12 hidden md:block" />
                <h1 className="text-3xl md:text-5xl font-bold">
                  Vodič za domove za starije
                </h1>
              </div>
              <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
                Sve što trebate znati o tipovima domova, nivoima njege i specijaliziranim programima
              </p>
            </div>
          </div>
        </header>

        {/* Important Notice */}
        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <Card className="bg-cyan-50 border-cyan-200">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-6 w-6 text-cyan-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-cyan-800">Kako koristiti ovaj vodič</p>
                <p className="text-sm text-cyan-700">
                  Ovaj vodič će vam pomoći da razumijete različite opcije njege i odaberete pravu ustanovu za vaše potrebe. 
                  Preporučujemo da posjetite više domova prije donošenja odluke i razgovarate sa osobljem o specifičnim potrebama.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="tipovi" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Tipovi domova</span>
                <span className="sm:hidden">Tipovi</span>
              </TabsTrigger>
              <TabsTrigger value="nivoi" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Nivoi njege</span>
                <span className="sm:hidden">Nivoi</span>
              </TabsTrigger>
              <TabsTrigger value="programi" className="gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Programi</span>
                <span className="sm:hidden">Programi</span>
              </TabsTrigger>
              <TabsTrigger value="usluge" className="gap-2">
                <Stethoscope className="h-4 w-4" />
                <span className="hidden sm:inline">Med. usluge</span>
                <span className="sm:hidden">Usluge</span>
              </TabsTrigger>
            </TabsList>

            {/* Tipovi domova */}
            <TabsContent value="tipovi">
              <section aria-labelledby="tipovi-heading">
                <h2 id="tipovi-heading" className="text-2xl font-bold mb-6">
                  Tipovi domova za starije i bolesne osobe
                </h2>
                <p className="text-muted-foreground mb-8">
                  Domovi se razlikuju prema vrsti njege koju pružaju i ciljnoj grupi korisnika. 
                  Odabir pravog tipa doma zavisi od zdravstvenog stanja, nivoa samostalnosti i specifičnih potreba osobe.
                </p>
                
                <div className="grid gap-6">
                  {tipoviDomova.map((tip) => {
                    const Icon = tip.ikona;
                    return (
                      <Card key={tip.id} className="overflow-hidden">
                        <CardHeader className={`${tip.boja} py-4`}>
                          <CardTitle className="flex items-center gap-3">
                            <Icon className="h-6 w-6" />
                            {tip.naziv}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-muted-foreground mb-6">{tip.opis}</p>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                Za koga je namijenjen:
                              </h4>
                              <ul className="space-y-2">
                                {tip.zaKoga.map((item, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Heart className="h-4 w-4 text-primary" />
                                Usluge koje se pružaju:
                              </h4>
                              <ul className="space-y-2">
                                {tip.usluge.map((usluga, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    {usluga}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium">
                              Prosječna cijena: <span className="text-primary">{tip.prosjecnaCijena}</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            </TabsContent>

            {/* Nivoi njege */}
            <TabsContent value="nivoi">
              <section aria-labelledby="nivoi-heading">
                <h2 id="nivoi-heading" className="text-2xl font-bold mb-6">
                  Nivoi njege - Šta uključuje svaki nivo
                </h2>
                <p className="text-muted-foreground mb-8">
                  Nivo njege određuje intenzitet podrške koju osoba prima. Procjena nivoa vrši se na osnovu 
                  funkcionalnog statusa - sposobnosti za obavljanje svakodnevnih aktivnosti (ADL).
                </p>
                
                <div className="space-y-6">
                  {nivoiNjege.map((nivo) => {
                    const Icon = nivo.ikona;
                    return (
                      <Card key={nivo.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${nivo.boja} text-white`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            {nivo.naziv}
                            <Badge variant="outline" className="ml-auto">
                              {nivo.prosjecnaCijena}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-6">{nivo.opis}</p>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-amber-50 rounded-lg p-4">
                              <h4 className="font-semibold mb-3 text-amber-800">Karakteristike osobe na ovom nivou:</h4>
                              <ul className="space-y-2">
                                {nivo.karakteristike.map((kar, i) => (
                                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                                    <span>•</span>
                                    {kar}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4">
                              <h4 className="font-semibold mb-3 text-green-800">Šta uključuje ovaj nivo:</h4>
                              <ul className="space-y-2">
                                {nivo.ukljucuje.map((uk, i) => (
                                  <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    {uk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Omjer osoblja: {nivo.omjerOsoblja}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            </TabsContent>

            {/* Programi njege */}
            <TabsContent value="programi">
              <section aria-labelledby="programi-heading">
                <h2 id="programi-heading" className="text-2xl font-bold mb-6">
                  Specijalizirani programi njege
                </h2>
                <p className="text-muted-foreground mb-8">
                  Pored standardne njege, mnogi domovi nude specijalizirane programe za specifična stanja i potrebe.
                  Ovi programi zahtijevaju dodatno obučeno osoblje i prilagođene prostore.
                </p>
                
                <div className="space-y-6">
                  {programiNjege.map((program) => {
                    const Icon = program.ikona;
                    return (
                      <Card key={program.id}>
                        <CardHeader className={`${program.boja} py-4`}>
                          <CardTitle className="flex items-center gap-3">
                            <Icon className="h-6 w-6" />
                            {program.naziv}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-muted-foreground mb-4">{program.opis}</p>
                          
                          <div className="bg-cyan-50 rounded-lg p-3 mb-6">
                            <p className="text-sm text-cyan-800">
                              <strong>Ciljna grupa:</strong> {program.ciljnaGrupa}
                            </p>
                          </div>
                          
                          <h4 className="font-semibold mb-4">Komponente programa:</h4>
                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {program.komponente.map((komp, i) => (
                              <div key={i} className="bg-muted/50 rounded-lg p-3">
                                <h5 className="font-medium text-sm mb-1">{komp.naziv}</h5>
                                <p className="text-xs text-muted-foreground">{komp.opis}</p>
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-sm text-amber-800 flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              {program.napomena}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            </TabsContent>

            {/* Medicinske usluge */}
            <TabsContent value="usluge">
              <section aria-labelledby="usluge-heading">
                <h2 id="usluge-heading" className="text-2xl font-bold mb-6">
                  Medicinske usluge u domovima
                </h2>
                <p className="text-muted-foreground mb-8">
                  Kvalitetni domovi nude niz medicinskih usluga koje osiguravaju zdravlje i sigurnost štićenika.
                  Dostupnost usluga varira između domova - uvijek provjerite šta je uključeno u cijenu.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {medicinskeusluge.map((usluga, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Stethoscope className="h-5 w-5 text-primary" />
                          {usluga.naziv}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{usluga.opis}</p>
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-xs text-green-700">
                            <strong>Važnost:</strong> {usluga.vaznost}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Checklist */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Kontrolna lista - Šta pitati pri posjeti domu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">O osoblju:</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>☐ Koliko je medicinskih sestara na smjeni?</li>
                          <li>☐ Da li je ljekar dostupan 24/7?</li>
                          <li>☐ Kakva je obuka osoblja za demenciju?</li>
                          <li>☐ Koliki je omjer osoblja i štićenika?</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">O uslugama:</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>☐ Šta je uključeno u osnovnu cijenu?</li>
                          <li>☐ Koje usluge se dodatno naplaćuju?</li>
                          <li>☐ Da li nude fizioterapiju?</li>
                          <li>☐ Kako se upravlja lijekovima?</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">O smještaju:</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>☐ Kakve su sobe (jednokrevetne/dvokrevetne)?</li>
                          <li>☐ Da li ima privatno kupatilo?</li>
                          <li>☐ Mogu li donijeti vlastiti namještaj?</li>
                          <li>☐ Kakva je sigurnost objekta?</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">O životu u domu:</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>☐ Kakve aktivnosti se organizuju?</li>
                          <li>☐ Kakva je ishrana i da li se prilagođava?</li>
                          <li>☐ Kakva su pravila posjeta?</li>
                          <li>☐ Mogu li izlaziti iz doma?</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
          </Tabs>
        </main>

        {/* FAQ Section */}
        <section className="bg-white py-16 border-t" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4">
            <h2 id="faq-heading" className="text-3xl font-bold text-center mb-8">
              Često postavljana pitanja
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-left font-medium">
                  Koja je razlika između doma za starije i doma sa pojačanom njegom?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Dom za starije je namijenjen relativno samostalnim osobama koje trebaju nadzor, društvo i pomoć u određenim 
                  aktivnostima (npr. uzimanje lijekova). Dom sa pojačanom njegom pruža intenzivniju njegu osobama kojima je 
                  potrebna svakodnevna pomoć pri kupanju, oblačenju, hranjenju i drugim aktivnostima dnevnog života. 
                  Pojačana njega uključuje više medicinskog osoblja i individualiziranu njegu.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-left font-medium">
                  Kako se određuje nivo njege koji je potreban?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Nivo njege se određuje procjenom funkcionalnog statusa osobe - sposobnosti za obavljanje aktivnosti 
                  dnevnog života (ADL): kupanje, oblačenje, hranjenje, kretanje, korištenje toaleta. Procjenu obično vrši 
                  medicinska sestra ili ljekar pri prijemu. Nivo se može mijenjati tokom boravka ako se stanje promijeni.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-left font-medium">
                  Da li mogu posjetiti dom prije donošenja odluke?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Da, i to se toplo preporučuje! Većina domova nudi mogućnost obilaska. Preporučujemo da posjetite dom u 
                  vrijeme kada su aktivnosti u toku, da vidite kako osoblje komunicira sa štićenicima, da razgovarate sa 
                  drugim porodicama ako je moguće, i da postavite sva pitanja koja imate. Neki domovi nude i probni boravak.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-left font-medium">
                  Šta ako se zdravstveno stanje pogorša tokom boravka?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Ako se stanje pogorša, dom će prilagoditi nivo njege. Ako dom ne može pružiti potrebnu njegu (npr. 
                  potrebna je specijalizirana oprema), pomoći će u pronalasku odgovarajuće ustanove. Važno je unaprijed 
                  pitati dom kakve su njihove mogućnosti za eskalaciju njege i kakva je procedura u hitnim slučajevima.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5">
                <AccordionTrigger className="text-left font-medium">
                  Da li zdravstveno osiguranje pokriva troškove doma?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  U BiH, zdravstveno osiguranje obično ne pokriva troškove smještaja u privatnim domovima. Centri za 
                  socijalni rad mogu odobriti subvenciju za osobe bez sredstava. Neki domovi imaju ugovore sa fondovima 
                  zdravstvenog osiguranja za određene medicinske usluge. Preporučujemo da se raspitate u lokalnom centru 
                  za socijalni rad o mogućnostima pomoći.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6">
                <AccordionTrigger className="text-left font-medium">
                  Mogu li članovi porodice posjećivati u bilo koje vrijeme?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Pravila posjeta variraju između domova. Većina domova ima određeno vrijeme posjeta (npr. 10-12h i 16-19h), 
                  ali mnogi dozvoljavaju fleksibilnije posjete uz prethodni dogovor. Neki domovi dozvoljavaju i noćenje 
                  članova porodice u posebnim okolnostima. Uvijek provjerite pravila posjeta prije prijema.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Pronađite pravi dom za vaše potrebe</h2>
            <p className="text-lg opacity-90 mb-6">
              Pretražite verificirane domove za starije i bolesne osobe u Bosni i Hercegovini.
            </p>
            <Link to="/domovi-njega">
              <Button size="lg" variant="secondary" className="gap-2">
                <Home className="h-5 w-5" />
                Pregledaj domove
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
