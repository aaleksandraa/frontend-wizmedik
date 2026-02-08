import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { 
  Droplets, 
  Activity, 
  Heart, 
  Brain, 
  Bone, 
  Wind, 
  Sparkles,
  Baby,
  Dumbbell,
  Stethoscope,
  Waves,
  Flame,
  Hand,
  Zap,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

// Indikacije - zdravstvena stanja
const indikacije = [
  {
    id: 'reumatoloska',
    naziv: 'Reumatološka stanja',
    ikona: Bone,
    boja: 'bg-red-100 text-red-700',
    opis: 'Banjsko liječenje je posebno efikasno kod reumatskih oboljenja zahvaljujući kombinaciji termomineralnih voda, peloidoterapije i fizikalne terapije.',
    stanja: [
      'Reumatoidni artritis',
      'Osteoartritis (artroza)',
      'Ankilozantni spondilitis',
      'Psorijatični artritis',
      'Degenerativna oboljenja zglobova',
      'Giht (van akutne faze)',
      'Fibromijalgija'
    ],
    terapije: ['Balneoterapija', 'Peloidoterapija', 'Hidroterapija', 'Kineziterapija'],
    napomena: 'Kontraindicirano u akutnoj fazi upale. Potrebna procjena reumatologa.'
  },
  {
    id: 'ortopedska',
    naziv: 'Ortopedska i lokomotorna stanja',
    ikona: Activity,
    boja: 'bg-cyan-100 text-cyan-700',
    opis: 'Rehabilitacija lokomotornog sistema kroz kombinaciju hidroterapije, kineziterapije i fizikalnih procedura pomaže u obnovi pokretljivosti i smanjenju bola.',
    stanja: [
      'Bolovi u leđima (lumbalni sindrom)',
      'Cervikalna spondiloza',
      'Lumbalna spondiloza',
      'Posttraumatska stanja',
      'Kontrakture zglobova',
      'Tendinitisi i burzitisi',
      'Skolioza i kifoza'
    ],
    terapije: ['Kineziterapija', 'Hidroterapija', 'Manualna terapija', 'Elektroterapija'],
    napomena: 'Individualni program se kreira na osnovu dijagnoze i funkcionalnog statusa.'
  },
  {
    id: 'postoperativna',
    naziv: 'Postoperativna rehabilitacija',
    ikona: Stethoscope,
    boja: 'bg-green-100 text-green-700',
    opis: 'Strukturirani programi rehabilitacije nakon ortopedskih operacija ubrzavaju oporavak i vraćanje pune funkcionalnosti.',
    stanja: [
      'Poslije ugradnje endoproteze kuka',
      'Poslije ugradnje endoproteze koljena',
      'Rekonstrukcija ligamenata (ACL, PCL)',
      'Operacije kralježnice',
      'Artroskopske operacije',
      'Operacije ramena (rotatorska manžeta)'
    ],
    terapije: ['Kineziterapija', 'Hidroterapija', 'Elektroterapija', 'Manualna terapija'],
    napomena: 'Početak rehabilitacije prema preporuci operatera. Obavezna medicinska dokumentacija.'
  },
  {
    id: 'neuroloska',
    naziv: 'Neurološka rehabilitacija',
    ikona: Brain,
    boja: 'bg-purple-100 text-purple-700',
    opis: 'Specijalizirani programi neurorehabilitacije pomažu u obnovi motoričkih funkcija i poboljšanju kvaliteta života.',
    stanja: [
      'Stanje poslije moždanog udara (CVI)',
      'Periferne neuropatije',
      'Parkinsonova bolest (rani stadiji)',
      'Multipla skleroza (remisija)',
      'Polineuropatije',
      'Pareze i paralize (rehabilitacija)'
    ],
    terapije: ['Kineziterapija', 'Hidroterapija', 'Radna terapija', 'Elektrostimulacija'],
    napomena: 'Individualna procjena neurologa. Program se prilagođava funkcionalnom statusu pacijenta.'
  },
  {
    id: 'sportske',
    naziv: 'Sportske povrede i funkcionalni oporavak',
    ikona: Dumbbell,
    boja: 'bg-orange-100 text-orange-700',
    opis: 'Programi rehabilitacije sportskih povreda fokusirani na brz i siguran povratak sportskim aktivnostima.',
    stanja: [
      'Povrede mišića (istegnuća, rupture)',
      'Povrede tetiva',
      'Povrede ligamenata',
      'Sportski prenaprezanje sindromi',
      'Stres frakture',
      'Vraćanje sportske kondicije'
    ],
    terapije: ['Kineziterapija', 'Krioterapija', 'Elektroterapija', 'Manualna terapija'],
    napomena: 'Program se kreira u saradnji sa sportskim ljekarom ili fizijatrom.'
  },
  {
    id: 'respiratorna',
    naziv: 'Respiratorna stanja',
    ikona: Wind,
    boja: 'bg-cyan-100 text-cyan-700',
    opis: 'Inhalacione terapije i respiratorna fizioterapija pomažu kod hroničnih respiratornih oboljenja.',
    stanja: [
      'Hronični bronhitis',
      'Bronhijalna astma (van napada)',
      'KOPB (hronična opstruktivna plućna bolest)',
      'Postinfektivni oporavak pluća',
      'Hronični sinusitis',
      'Alergijski rinitis'
    ],
    terapije: ['Inhalacije', 'Respiratorna fizioterapija', 'Haloterapija', 'Kineziterapija'],
    napomena: 'Kontraindicirano kod akutnih infekcija i teške respiratorne insuficijencije.'
  },
  {
    id: 'kardiovaskularna',
    naziv: 'Kardiovaskularna rehabilitacija',
    ikona: Heart,
    boja: 'bg-pink-100 text-pink-700',
    opis: 'Kontrolirani programi kardiovaskularne rehabilitacije pod nadzorom medicinskog osoblja.',
    stanja: [
      'Stanje poslije infarkta miokarda (stabilno)',
      'Stanje poslije bypass operacije',
      'Kontrolirana hipertenzija',
      'Periferna arterijska bolest',
      'Kardiovaskularna prevencija'
    ],
    terapije: ['Dozirana kineziterapija', 'Hidroterapija (kontrolirana)', 'Edukacija'],
    napomena: 'OBAVEZNA procjena kardiologa i EKG prije uključivanja. Stalni monitoring vitalnih funkcija.'
  },
  {
    id: 'dermatoloska',
    naziv: 'Dermatološka stanja',
    ikona: Sparkles,
    boja: 'bg-yellow-100 text-yellow-700',
    opis: 'Sumporne i mineralne vode imaju dokazano blagotvorno djelovanje na određena kožna oboljenja.',
    stanja: [
      'Psorijaza',
      'Atopijski dermatitis (ekcem)',
      'Hronične dermatoze',
      'Seboroični dermatitis',
      'Akne (hronične forme)',
      'Postinflamatorna hiperpigmentacija'
    ],
    terapije: ['Balneoterapija (sumporne vode)', 'Peloidoterapija', 'Fototerapija'],
    napomena: 'Efikasnost zavisi od tipa mineralne vode. Posebno efikasne sumporne i sulfatne vode.'
  },
  {
    id: 'ginekoloska',
    naziv: 'Ginekološke i urološke tegobe',
    ikona: Heart,
    boja: 'bg-rose-100 text-rose-700',
    opis: 'Suportivna terapija kod određenih hroničnih ginekoloških i uroloških stanja.',
    stanja: [
      'Hronični pelvični bolni sindrom',
      'Postoperativni oporavak (ginekološke operacije)',
      'Klimakterični sindrom',
      'Hronični prostatitis (van akutne faze)',
      'Inkontinencija (rehabilitacija)'
    ],
    terapije: ['Balneoterapija', 'Peloidoterapija', 'Kineziterapija karlice'],
    napomena: 'OBAVEZNO prema preporuci ginekologa/urologa. Kontraindicirano kod akutnih upala i maligniteta.'
  },
  {
    id: 'metabolicka',
    naziv: 'Metabolička stanja i kontrola težine',
    ikona: Activity,
    boja: 'bg-lime-100 text-lime-700',
    opis: 'Suportivni programi koji kombinuju fizičku aktivnost, edukaciju i fizikalnu terapiju.',
    stanja: [
      'Gojaznost (kao dio programa)',
      'Metabolički sindrom',
      'Dijabetes tip 2 (regulisan)',
      'Hiperlipidemija'
    ],
    terapije: ['Kineziterapija', 'Hidroterapija', 'Nutricionističko savjetovanje', 'Edukacija'],
    napomena: 'Ovo je SUPORTIVNI program, ne zamjena za medicinsko liječenje. Realna očekivanja su ključna.'
  },
  {
    id: 'hronicni-bol',
    naziv: 'Hronični bolni sindromi',
    ikona: Zap,
    boja: 'bg-amber-100 text-amber-700',
    opis: 'Multidisciplinarni pristup upravljanju hroničnim bolom kroz kombinaciju terapija.',
    stanja: [
      'Fibromijalgija',
      'Hronični bolni sindrom',
      'Miofascijalni bolni sindrom',
      'Stres-related tegobe',
      'Poremećaji spavanja (sekundarni)',
      'Sindrom hroničnog umora'
    ],
    terapije: ['Balneoterapija', 'Kineziterapija', 'Relaksacione tehnike', 'Hidroterapija'],
    napomena: 'Realna očekivanja - cilj je poboljšanje kvaliteta života, ne potpuno uklanjanje bola.'
  },
  {
    id: 'pedijatrijska',
    naziv: 'Pedijatrijska rehabilitacija',
    ikona: Baby,
    boja: 'bg-indigo-100 text-indigo-700',
    opis: 'Specijalizirani programi za djecu dostupni samo u ustanovama sa odgovarajućim kadrom i opremom.',
    stanja: [
      'Cerebralna paraliza',
      'Razvojni poremećaji motorike',
      'Skolioza kod djece',
      'Respiratorna oboljenja djece',
      'Posttraumatska rehabilitacija'
    ],
    terapije: ['Kineziterapija', 'Hidroterapija', 'Radna terapija', 'Senzorna integracija'],
    napomena: 'ISKLJUČIVO u ustanovama sa specijaliziranim pedijatrijskim programima i osobljem.'
  }
];


// Terapije - vrste tretmana
const terapije = [
  {
    id: 'balneo',
    kategorija: 'Vode / Balneo terapije',
    ikona: Droplets,
    boja: 'bg-cyan-500',
    tretmani: [
      {
        naziv: 'Balneoterapija',
        opis: 'Kupanje u mineralnoj ili termalnoj vodi. Djeluje protuupalno, analgetski i relaksirajuće. Temperatura i sastav vode prilagođavaju se indikaciji.',
        indikacije: ['Reumatska oboljenja', 'Dermatološka stanja', 'Hronični bol'],
        kontraindikacije: ['Akutne upale', 'Srčana insuficijencija', 'Nekontrolirana hipertenzija']
      },
      {
        naziv: 'Hidroterapija',
        opis: 'Terapija u vodi - vježbe u bazenu, plivanje, aqua aerobik. Voda smanjuje opterećenje zglobova i omogućava lakše izvođenje pokreta.',
        indikacije: ['Ortopedska rehabilitacija', 'Neurološka rehabilitacija', 'Sportske povrede'],
        kontraindikacije: ['Otvorene rane', 'Inkontinencija', 'Zarazne bolesti']
      },
      {
        naziv: 'Whirlpool / Podvodna masaža',
        opis: 'Masaža mlazevima vode pod pritiskom. Poboljšava cirkulaciju, opušta mišiće i smanjuje bol.',
        indikacije: ['Mišićna napetost', 'Cirkulatorni poremećaji', 'Stres'],
        kontraindikacije: ['Tromboflebitis', 'Kožne infekcije', 'Teška srčana oboljenja']
      },
      {
        naziv: 'Kontrastne kupke',
        opis: 'Naizmjenično uranjanje u toplu i hladnu vodu. Stimuliše cirkulaciju i jača imunitet.',
        indikacije: ['Cirkulatorni poremećaji', 'Oporavak sportista', 'Jačanje imuniteta'],
        kontraindikacije: ['Raynaudov sindrom', 'Teška srčana oboljenja', 'Nekontrolirana hipertenzija']
      }
    ]
  },
  {
    id: 'peloid',
    kategorija: 'Peloidne i termo procedure',
    ikona: Flame,
    boja: 'bg-amber-500',
    tretmani: [
      {
        naziv: 'Peloidoterapija',
        opis: 'Primjena ljekovitog blata (peloida) u obliku obloga ili kupki. Ima protuupalno, analgetsko i regenerativno djelovanje.',
        indikacije: ['Reumatska oboljenja', 'Dermatološka stanja', 'Ginekološke tegobe'],
        kontraindikacije: ['Akutne upale', 'Srčana oboljenja', 'Trudnoća']
      },
      {
        naziv: 'Parafinske obloge',
        opis: 'Aplikacija toplog parafina na bolna područja. Duboko zagrijava tkivo i poboljšava prokrvljenost.',
        indikacije: ['Artritis', 'Kontrakture', 'Hronični bol'],
        kontraindikacije: ['Poremećaji osjeta', 'Otvorene rane', 'Cirkulatorni poremećaji']
      },
      {
        naziv: 'Termoterapija',
        opis: 'Primjena topline u terapijske svrhe - infracrveno zračenje, topli oblozi, fango.',
        indikacije: ['Mišićni spazmi', 'Hronični bol', 'Degenerativna oboljenja'],
        kontraindikacije: ['Akutne upale', 'Maligna oboljenja', 'Poremećaji osjeta']
      },
      {
        naziv: 'Krioterapija',
        opis: 'Primjena hladnoće - ledeni oblozi, kriokomora. Smanjuje upalu, otok i bol.',
        indikacije: ['Akutne povrede', 'Sportske povrede', 'Upalna stanja'],
        kontraindikacije: ['Raynaudov sindrom', 'Krioglobulinemija', 'Alergija na hladnoću']
      }
    ]
  },
  {
    id: 'fizikalna',
    kategorija: 'Fizikalna medicina i rehabilitacija',
    ikona: Activity,
    boja: 'bg-green-500',
    tretmani: [
      {
        naziv: 'Kineziterapija',
        opis: 'Terapijske vježbe - aktivne, pasivne, potpomognute. Osnova svake rehabilitacije za vraćanje pokretljivosti i snage.',
        indikacije: ['Sva ortopedska stanja', 'Neurološka rehabilitacija', 'Postoperativni oporavak'],
        kontraindikacije: ['Akutna bol', 'Nestabilne frakture', 'Akutne upale']
      },
      {
        naziv: 'Elektroterapija',
        opis: 'Primjena električne struje u terapijske svrhe - TENS, interferentne struje, galvanske struje, elektrostimulacija.',
        indikacije: ['Hronični bol', 'Mišićna atrofija', 'Neurološka oštećenja'],
        kontraindikacije: ['Pacemaker', 'Trudnoća (abdomen)', 'Maligna oboljenja']
      },
      {
        naziv: 'Ultrazvuk terapija',
        opis: 'Primjena ultrazvučnih valova za dubinsko zagrijavanje tkiva i poboljšanje cirkulacije.',
        indikacije: ['Tendinitisi', 'Burzitisi', 'Ožiljci i adhezije'],
        kontraindikacije: ['Maligna oboljenja', 'Trudnoća', 'Metalne implantate (lokalno)']
      },
      {
        naziv: 'Magnetoterapija',
        opis: 'Primjena magnetnog polja niske frekvencije. Poboljšava cirkulaciju i ubrzava zarastanje.',
        indikacije: ['Frakture', 'Osteoporoza', 'Degenerativna oboljenja'],
        kontraindikacije: ['Pacemaker', 'Trudnoća', 'Epilepsija']
      },
      {
        naziv: 'Laser terapija',
        opis: 'Primjena niskoenergetskog lasera za smanjenje bola i ubrzanje zarastanja tkiva.',
        indikacije: ['Sportske povrede', 'Tendinopatije', 'Rane'],
        kontraindikacije: ['Direktno u oči', 'Maligna oboljenja', 'Fotoosjetljivost']
      },
      {
        naziv: 'Manualna terapija',
        opis: 'Ručne tehnike - mobilizacija zglobova, manipulacija, masaža dubokih tkiva.',
        indikacije: ['Blokade zglobova', 'Mišićna napetost', 'Cervikalni/lumbalni sindrom'],
        kontraindikacije: ['Osteoporoza', 'Upale', 'Nestabilnost zglobova']
      },
      {
        naziv: 'Radna terapija',
        opis: 'Rehabilitacija kroz svakodnevne aktivnosti. Cilj je vraćanje samostalnosti u dnevnim aktivnostima.',
        indikacije: ['Neurološka rehabilitacija', 'Postoperativni oporavak', 'Geriatrijska rehabilitacija'],
        kontraindikacije: ['Minimalne - prilagođava se stanju pacijenta']
      }
    ]
  },
  {
    id: 'respiratorne',
    kategorija: 'Respiratorne procedure',
    ikona: Wind,
    boja: 'bg-cyan-500',
    tretmani: [
      {
        naziv: 'Inhalacije',
        opis: 'Udisanje aerosola mineralne vode ili ljekovitih supstanci. Vlaži i čisti respiratorne puteve.',
        indikacije: ['Hronični bronhitis', 'Sinusitis', 'Astma (van napada)'],
        kontraindikacije: ['Akutne infekcije', 'Teška respiratorna insuficijencija']
      },
      {
        naziv: 'Haloterapija',
        opis: 'Boravak u sobi sa slanim aerosolom (slana soba). Ima antibakterijsko i mukolitičko djelovanje.',
        indikacije: ['Respiratorna oboljenja', 'Alergije', 'Kožna oboljenja'],
        kontraindikacije: ['Akutne infekcije', 'Teška srčana oboljenja']
      },
      {
        naziv: 'Respiratorna fizioterapija',
        opis: 'Vježbe disanja, posturalna drenaža, perkusija. Poboljšava ventilaciju i čisti dišne puteve.',
        indikacije: ['KOPB', 'Postoperativno (torakalne operacije)', 'Cistična fibroza'],
        kontraindikacije: ['Akutna respiratorna insuficijencija', 'Pneumotoraks']
      }
    ]
  },
  {
    id: 'dodatne',
    kategorija: 'Dodatne medicinske usluge',
    ikona: Stethoscope,
    boja: 'bg-purple-500',
    tretmani: [
      {
        naziv: 'Pregled fizijatra',
        opis: 'Specijalistički pregled i izrada individualnog plana rehabilitacije na osnovu dijagnoze i funkcionalnog statusa.',
        indikacije: ['Početak rehabilitacije', 'Evaluacija napretka', 'Prilagodba programa'],
        kontraindikacije: ['Nema']
      },
      {
        naziv: 'Funkcionalna procjena',
        opis: 'Testiranje pokretljivosti, snage, ravnoteže i funkcionalnih sposobnosti. Osnova za kreiranje programa.',
        indikacije: ['Svi pacijenti na rehabilitaciji'],
        kontraindikacije: ['Nema']
      },
      {
        naziv: 'Nutricionističko savjetovanje',
        opis: 'Individualni plan ishrane prilagođen zdravstvenom stanju i ciljevima rehabilitacije.',
        indikacije: ['Metabolička stanja', 'Gojaznost', 'Sportska rehabilitacija'],
        kontraindikacije: ['Nema']
      }
    ]
  },
  {
    id: 'wellness',
    kategorija: 'Wellness usluge',
    ikona: Sparkles,
    boja: 'bg-pink-500',
    tretmani: [
      {
        naziv: 'Masaže',
        opis: 'Medicinska ili relaks masaža. Opušta mišiće, poboljšava cirkulaciju i smanjuje stres.',
        indikacije: ['Mišićna napetost', 'Stres', 'Cirkulatorni poremećaji'],
        kontraindikacije: ['Tromboflebitis', 'Kožne infekcije', 'Akutne upale']
      },
      {
        naziv: 'Sauna',
        opis: 'Finska sauna, infracrvena sauna, parna kupka. Detoksikacija i relaksacija.',
        indikacije: ['Detoksikacija', 'Relaksacija', 'Mišićni oporavak'],
        kontraindikacije: ['Srčana oboljenja', 'Nekontrolirana hipertenzija', 'Trudnoća', 'Akutne bolesti']
      }
    ]
  }
];


export default function SpaIndikacije() {
  const [activeTab, setActiveTab] = useState<'indikacije' | 'terapije'>('indikacije');

  // SEO Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Indikacije i terapije u banjama - Vodič za banjsko liječenje",
    "description": "Kompletan vodič o zdravstvenim stanjima koja se liječe u banjama i vrstama terapija. Reumatološka, ortopedska, neurološka rehabilitacija i više.",
    "url": window.location.href,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": indikacije.map((ind, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "MedicalCondition",
          "name": ind.naziv,
          "description": ind.opis,
          "possibleTreatment": ind.terapije.map(t => ({
            "@type": "MedicalTherapy",
            "name": t
          }))
        }
      }))
    },
    "about": {
      "@type": "MedicalSpecialty",
      "name": "Fizikalna medicina i rehabilitacija"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Koja stanja se mogu liječiti u banjama?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "U banjama se liječe reumatološka stanja (artritis, artroza), ortopedska oboljenja (bolovi u leđima, spondiloza), neurološka stanja (poslije moždanog udara), respiratorna oboljenja, dermatološka stanja (psorijaza), te se provodi postoperativna i sportska rehabilitacija."
        }
      },
      {
        "@type": "Question",
        "name": "Šta je balneoterapija?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Balneoterapija je liječenje kupanjem u mineralnoj ili termalnoj vodi. Djeluje protuupalno, analgetski i relaksirajuće. Sastav i temperatura vode prilagođavaju se specifičnoj indikaciji pacijenta."
        }
      },
      {
        "@type": "Question",
        "name": "Koliko traje banjsko liječenje?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standardni program banjskog liječenja traje 10-21 dan, ovisno o indikaciji. Za hronična stanja preporučuje se ponavljanje tretmana 1-2 puta godišnje za održavanje efekata."
        }
      },
      {
        "@type": "Question",
        "name": "Da li mi treba uputnica za banjsko liječenje?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Za liječenje na teret zdravstvenog osiguranja potrebna je uputnica specijaliste i odobrenje fonda. Za privatno liječenje uputnica nije obavezna, ali se preporučuje konsultacija sa ljekarom radi odabira odgovarajućeg programa."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Indikacije i terapije u banjama - Vodič za banjsko liječenje | WizMedik</title>
        <meta name="description" content="Kompletan vodič o zdravstvenim stanjima koja se liječe u banjama BiH. Reumatološka, ortopedska, neurološka rehabilitacija, balneoterapija, hidroterapija i više." />
        <meta name="keywords" content="banjsko liječenje, balneoterapija, hidroterapija, rehabilitacija, reumatizam, artritis, fizikalna terapija, termalne vode, peloidoterapija, kineziterapija" />
        
        <meta property="og:title" content="Indikacije i terapije u banjama - Vodič za banjsko liječenje" />
        <meta property="og:description" content="Saznajte koja zdravstvena stanja se liječe u banjama i koje terapije su dostupne. Kompletan vodič za banjsko liječenje u BiH." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        
        <link rel="canonical" href={`${window.location.origin}/banje/indikacije-terapije`} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        {/* Hero */}
        <header className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Breadcrumb - hidden on mobile */}
            <nav aria-label="Breadcrumb" className="mb-6 hidden md:block">
              <ol className="flex items-center gap-2 text-sm text-white/80">
                <li><Link to="/" className="hover:text-white">Početna</Link></li>
                <ChevronRight className="h-4 w-4" />
                <li><Link to="/banje" className="hover:text-white">Banje</Link></li>
                <ChevronRight className="h-4 w-4" />
                <li className="text-white font-medium">Indikacije i terapije</li>
              </ol>
            </nav>

            <div className="text-center">
              {/* Icon above title on mobile */}
              <Waves className="h-12 w-12 mx-auto mb-4 md:hidden" />
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <Waves className="h-12 w-12 hidden md:block" />
                <h1 className="text-3xl md:text-5xl font-bold">
                  Indikacije i terapije u banjama
                </h1>
              </div>
              <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
                Kompletan vodič o zdravstvenim stanjima koja se liječe u banjama i vrstama dostupnih terapija
              </p>
            </div>
          </div>
        </header>

        {/* Important Notice */}
        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Važna napomena</p>
                <p className="text-sm text-amber-700">
                  Informacije na ovoj stranici su edukativnog karaktera i ne zamjenjuju medicinsku konsultaciju. 
                  Prije početka bilo kakvog liječenja, obavezno se posavjetujte sa svojim ljekarom koji će procijeniti 
                  da li je banjsko liječenje prikladno za vaše stanje.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={activeTab === 'indikacije' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('indikacije')}
              className="gap-2"
            >
              <Stethoscope className="h-5 w-5" />
              Zdravstvena stanja
            </Button>
            <Button
              variant={activeTab === 'terapije' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('terapije')}
              className="gap-2"
            >
              <Droplets className="h-5 w-5" />
              Vrste terapija
            </Button>
          </div>

          {/* Indikacije Tab */}
          {activeTab === 'indikacije' && (
            <section aria-labelledby="indikacije-heading">
              <h2 id="indikacije-heading" className="text-2xl font-bold mb-6 text-center">
                Zdravstvena stanja koja se liječe u banjama
              </h2>
              
              <div className="grid gap-6">
                {indikacije.map((ind) => {
                  const Icon = ind.ikona;
                  return (
                    <Card key={ind.id} className="overflow-hidden">
                      <CardHeader className={`${ind.boja} py-4`}>
                        <CardTitle className="flex items-center gap-3">
                          <Icon className="h-6 w-6" />
                          {ind.naziv}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground mb-4">{ind.opis}</p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Stanja koja se liječe:
                            </h4>
                            <ul className="space-y-1">
                              {ind.stanja.map((stanje, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {stanje}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Droplets className="h-4 w-4" style={{ color: '#0891b2' }} />
                              Preporučene terapije:
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {ind.terapije.map((terapija, i) => (
                                <Badge key={i} variant="secondary">{terapija}</Badge>
                              ))}
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-sm text-amber-800 flex items-start gap-2">
                                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                {ind.napomena}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Terapije Tab */}
          {activeTab === 'terapije' && (
            <section aria-labelledby="terapije-heading">
              <h2 id="terapije-heading" className="text-2xl font-bold mb-6 text-center">
                Vrste terapija dostupnih u banjama
              </h2>
              
              <div className="space-y-8">
                {terapije.map((kategorija) => {
                  const Icon = kategorija.ikona;
                  return (
                    <Card key={kategorija.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${kategorija.boja} text-white`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          {kategorija.kategorija}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="multiple" className="w-full">
                          {kategorija.tretmani.map((tretman, index) => (
                            <AccordionItem key={index} value={`${kategorija.id}-${index}`}>
                              <AccordionTrigger className="text-left font-medium">
                                {tretman.naziv}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <p className="text-muted-foreground">{tretman.opis}</p>
                                  
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-green-50 rounded-lg p-3">
                                      <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Indikacije
                                      </h5>
                                      <ul className="text-sm text-green-700 space-y-1">
                                        {tretman.indikacije.map((ind, i) => (
                                          <li key={i}>• {ind}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <div className="bg-red-50 rounded-lg p-3">
                                      <h5 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Kontraindikacije
                                      </h5>
                                      <ul className="text-sm text-red-700 space-y-1">
                                        {tretman.kontraindikacije.map((kontra, i) => (
                                          <li key={i}>• {kontra}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* FAQ Section */}
        <section className="bg-white py-16 border-t" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4">
            <h2 id="faq-heading" className="text-3xl font-bold text-center mb-8">
              Često postavljana pitanja o banjskom liječenju
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-left font-medium">
                  Koja stanja se mogu liječiti u banjama?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  U banjama se uspješno liječe reumatološka stanja (artritis, artroza, reumatizam), ortopedska oboljenja 
                  (bolovi u leđima, spondiloza, posttraumatska stanja), neurološka stanja (rehabilitacija poslije moždanog udara), 
                  respiratorna oboljenja (hronični bronhitis, astma), dermatološka stanja (psorijaza, ekcemi), te se provodi 
                  postoperativna i sportska rehabilitacija.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-left font-medium">
                  Šta je balneoterapija i kako djeluje?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Balneoterapija je liječenje kupanjem u mineralnoj ili termalnoj vodi. Minerali iz vode (sumpor, magnezij, kalcij) 
                  apsorbiraju se kroz kožu i djeluju protuupalno, analgetski i relaksirajuće. Temperatura vode (obično 34-38°C) 
                  poboljšava cirkulaciju i opušta mišiće. Efikasnost zavisi od sastava vode i prilagođava se specifičnoj indikaciji.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-left font-medium">
                  Koliko traje banjsko liječenje i koliko često treba ići?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Standardni program banjskog liječenja traje 10-21 dan, ovisno o indikaciji i težini stanja. Za hronična stanja 
                  (reumatizam, artritis) preporučuje se ponavljanje tretmana 1-2 puta godišnje za održavanje terapijskih efekata. 
                  Akutna stanja mogu zahtijevati kraće, intenzivnije programe.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-left font-medium">
                  Da li mi treba uputnica za banjsko liječenje?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Za liječenje na teret zdravstvenog osiguranja potrebna je uputnica specijaliste (fizijatra, reumatologa, neurologa) 
                  i odobrenje zavoda zdravstvenog osiguranja. Za privatno liječenje uputnica nije obavezna, ali se preporučuje 
                  konsultacija sa ljekarom radi odabira odgovarajućeg programa i isključivanja kontraindikacija.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5">
                <AccordionTrigger className="text-left font-medium">
                  Koje su kontraindikacije za banjsko liječenje?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Opće kontraindikacije uključuju: akutne upalne procese, maligna oboljenja, teška srčana oboljenja, 
                  nekontroliranu hipertenziju, akutne infekcije, trudnoću (za većinu procedura), epilepsiju (za neke procedure), 
                  i teška psihijatrijska stanja. Specifične kontraindikacije zavise od vrste terapije i procjenjuju se individualno.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6">
                <AccordionTrigger className="text-left font-medium">
                  Šta je peloidoterapija?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Peloidoterapija je liječenje ljekovitim blatom (peloidom). Peloid se zagrijava i nanosi na bolna područja u obliku 
                  obloga ili se koristi za kupke. Ima protuupalno, analgetsko i regenerativno djelovanje. Posebno je efikasan kod 
                  reumatskih oboljenja, dermatoloških stanja i ginekoloških tegoba. Kontraindiciran je kod akutnih upala i srčanih oboljenja.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Pronađite pravu banju za vaše stanje</h2>
            <p className="text-lg opacity-90 mb-6">
              Pretražite banje u Bosni i Hercegovini i pronađite ustanovu koja nudi terapije za vaše zdravstveno stanje.
            </p>
            <Link to="/banje">
              <Button size="lg" variant="secondary" className="gap-2">
                <Waves className="h-5 w-5" />
                Pregledaj banje
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
