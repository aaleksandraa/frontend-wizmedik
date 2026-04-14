import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { medicinesAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Pill } from 'lucide-react';

type LijekListItem = {
  id: number;
  lijek_id: number;
  slug: string;
  naziv: string | null;
  naziv_lijeka: string | null;
  brend: string | null;
  proizvodjac: string | null;
  atc_sifra: string | null;
  inn: string | null;
  oblik: string | null;
  doza: string | null;
  pakovanje: string | null;
  aktuelna_cijena: string | null;
  aktuelni_procenat_participacije: string | null;
  aktuelni_iznos_participacije: string | null;
  aktuelna_lista_id: string | null;
  aktuelni_broj_indikacija: number | null;
};

type PaginatedData<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
};

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_SEO_TITLE = 'Lista lijekova Fonda Republike Srpske - provjerite doplatu | WizMedik';
const DEFAULT_SEO_DESCRIPTION =
  'Provjerite da li je lijek na listi Fonda Republike Srpske i koliki je iznos doplate. Pregled lijekova, cijena i participacije za lijekove na recept u RS.';
const LISTING_FALLBACK_MESSAGE =
  'Lista lijekova Fonda Republike Srpske je trenutno u fazi osvježavanja podataka. Pokušajte ponovo za nekoliko minuta.';
const SEARCH_SUGGESTIONS: string[] = [
  'lista lijekova fond republike srpske',
  'lijekovi na recept RS',
  'doplata za lijekove republika srpska',
  'participacija lijekova RS',
  'cijene lijekova fond RS',
];

const formatCopay = (value: string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return 'Nije dostupno';
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  if (Math.abs(parsed) < 0.000001) {
    return 'Bez doplate';
  }

  return `${parsed.toFixed(2)} KM`;
};

const hasFundCoverage = (listaId: string | null | undefined): boolean => {
  return !!(listaId && listaId.trim() !== '');
};

export default function Lijekovi() {
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<LijekListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = {
          search: query || undefined,
          page,
          per_page: 24,
        };

        const response = await medicinesAPI.getAll({
          ...params,
        });

        const payload: PaginatedData<LijekListItem> = response.data?.data;

        setItems(payload?.data || []);
        setLastPage(payload?.last_page || 1);
        setTotal(payload?.total || 0);
      } catch (err: any) {
        console.error('Lijekovi listing fetch failed', err);
        setError(LISTING_FALLBACK_MESSAGE);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, query]);

  const onSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  };

  const canonicalUrl = `${SITE_URL}/lijekovi`;

  const seoTitle = useMemo(() => {
    if (query) {
      return `${query} - lista lijekova Fonda Republike Srpske | WizMedik`;
    }

    return DEFAULT_SEO_TITLE;
  }, [query]);

  const seoDescription = useMemo(() => {
    if (query) {
      return `Pretraga za "${query}" u listi lijekova Fonda Republike Srpske. Provjerite da li je lijek pokriven osiguranjem i koliki je iznos doplate u apoteci.`;
    }

    return DEFAULT_SEO_DESCRIPTION;
  }, [query]);

  const itemListSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: seoTitle,
      url: canonicalUrl,
      description: seoDescription,
      mainEntity: {
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: items.length,
        itemListElement: items.slice(0, 24).map((item, index) => {
          const medicineName = item.naziv || item.naziv_lijeka || `Lijek ${item.lijek_id}`;
          const medicineUrl = `${SITE_URL}/lijekovi/${item.slug}`;
          const detailParts = [
            hasFundCoverage(item.aktuelna_lista_id) ? `Lista RFZO ${item.aktuelna_lista_id}` : 'Nije na listi fonda',
            `Doplata ${formatCopay(item.aktuelni_iznos_participacije)}`,
          ];

          if (item.doza) {
            detailParts.push(`Doza ${item.doza}`);
          }

          if (item.pakovanje) {
            detailParts.push(`Pakovanje ${item.pakovanje}`);
          }

          return {
            '@type': 'ListItem',
            position: index + 1,
            name: medicineName,
            url: medicineUrl,
            description: detailParts.join('. '),
          };
        }),
      },
    };
  }, [items, canonicalUrl, seoDescription, seoTitle]);

  const faqSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Kako provjeriti da li je lijek preko fonda?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ako lijek ima oznaku RFZO liste (npr. A, A1, B), tretira se kao lijek preko Fonda Republike Srpske za aktuelni period.',
          },
        },
        {
          '@type': 'Question',
          name: 'Koliko se tačno doplaćuje ako je lijek preko fonda?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Doplata je tačan iznos participacije koji plaća osiguranik. Ako je iznos 0.00 KM, prikazuje se kao Bez doplate.',
          },
        },
        {
          '@type': 'Question',
          name: 'Kako dobijamo aktuelnu cijenu?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Za svaki lijek uzima se samo najnoviji period va\u017eenja. Iz tog perioda preuzimamo jednu aktuelnu cijenu.',
          },
        },
      ],
    };
  }, []);

  const breadcrumbSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Po\u010detna',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Lijekovi',
          item: canonicalUrl,
        },
      ],
    };
  }, [canonicalUrl]);

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="spisak lijekova, doplata fond republike srpske, fond republike srpske lijekovi, RFZO lista, cijena lijeka, ATC \u0161ifra, INN"
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:locale" content="bs_BA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />

        <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center gap-3 mb-3">
              <Pill className="h-8 w-8 text-emerald-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Lista lijekova Fonda Republike Srpske</h1>
            </div>
            <p className="text-gray-600 max-w-3xl">
              Provjerite da li je lijek preko Fonda Republike Srpske i tačno koliko se doplaćuje.
            </p>

            <form onSubmit={onSearchSubmit} className="mt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="Pretraga po nazivu, proizvođaču, ATC šifri ili INN-u"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                  />
                </div>
                <Button type="submit">{'Pretra\u017ei'}</Button>
              </div>
            </form>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Ukupno rezultata: <span className="font-semibold text-gray-900">{total}</span>
              </p>
            </div>

            {loading ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">{'U\u010ditavanje lijekova...'}</CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="py-12 text-center text-red-600">{error}</CardContent>
              </Card>
            ) : items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  Nema lijekova za zadani filter.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <Link key={item.id} to={`/lijekovi/${item.slug}`}>
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="font-semibold text-gray-900 leading-tight">
                              {item.naziv || item.naziv_lijeka || 'Naziv nije unesen'}
                            </h2>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              {hasFundCoverage(item.aktuelna_lista_id) ? (
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                  Preko fonda
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Nije preko fonda</Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600">
                            {`Proizvo\u0111a\u010d: ${item.proizvodjac || item.brend || 'nije unesen'}`}
                          </p>

                          <div className="space-y-2 text-sm text-gray-700">
                            <p>
                              <span className="text-gray-500">Lista:</span>{' '}
                              <span className="font-medium">{item.aktuelna_lista_id || '-'}</span>
                            </p>
                            <p>
                              <span className="text-gray-500">Pakovanje:</span>{' '}
                              <span className="font-medium">{item.pakovanje || '-'}</span>
                            </p>
                            <p>
                              <span className="text-gray-500">Doza:</span>{' '}
                              <span className="font-medium">{item.doza || '-'}</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t text-sm">
                            <p>
                              <span className="text-gray-500">Doplata:</span>{' '}
                              <span className="font-semibold text-gray-900">
                                {formatCopay(item.aktuelni_iznos_participacije)}
                              </span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1}
                  >
                    Prethodna
                  </Button>
                  <span className="text-sm text-gray-600">
                    Stranica {page} / {lastPage}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}
                    disabled={page >= lastPage}
                  >
                    {'Sljede\u0107a'}
                  </Button>
                </div>
              </>
            )}

            <Card className="mt-10">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Spisak lijekova i tačan iznos doplate preko Fonda Republike Srpske
                </h2>
                <div className="space-y-3 text-gray-700 text-sm md:text-base">
                  <p>
                    Aktuelna cijena je cijena iz najnovijeg perioda važenja za lijek. Doplata je iznos koji plaća
                    osiguranik.
                  </p>
                  <p>
                    Ako je doplata 0.00 KM, prikazujemo <strong>Bez doplate</strong>.
                  </p>
                  <p>
                    Ako lijek ima oznaku RFZO liste (npr. A, A1, B), prikazuje se kao{' '}
                    <strong>Preko fonda Republike Srpske</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Pretrage koje korisnici često traže</h2>
                <ul className="seo-searches space-y-2 text-sm md:text-base">
                  {SEARCH_SUGGESTIONS.map((item) => (
                    <li key={item}>
                      <Link to="/lijekovi" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}


