import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { medicinesAPI, rfzoAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Pill, SlidersHorizontal } from 'lucide-react';

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

type RfzoListItem = {
  id: number;
  code: string;
  naziv: string | null;
  pojasnjenje: string | null;
};

type FilterDraft = {
  atc_sifra: string;
  lista_id: string;
  cijena_min: string;
  cijena_max: string;
  participacija_min: string;
  participacija_max: string;
  procenat_participacije_min: string;
  procenat_participacije_max: string;
  ima_indikacije: 'all' | 'yes' | 'no';
};

const defaultFilters: FilterDraft = {
  atc_sifra: '',
  lista_id: 'all',
  cijena_min: '',
  cijena_max: '',
  participacija_min: '',
  participacija_max: '',
  procenat_participacije_min: '',
  procenat_participacije_max: '',
  ima_indikacije: 'all',
};

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const formatPrice = (value: string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return 'Nije dostupno';
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return `${parsed.toFixed(2)} KM`;
};

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
  const [filters, setFilters] = useState<FilterDraft>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterDraft>(defaultFilters);
  const [items, setItems] = useState<LijekListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rfzoLists, setRfzoLists] = useState<RfzoListItem[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const loadRfzoLists = async () => {
      try {
        const response = await rfzoAPI.getAll();
        setRfzoLists(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (err) {
        setRfzoLists([]);
      }
    };

    loadRfzoLists();
  }, []);

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

        if (appliedFilters.atc_sifra.trim()) {
          params.atc_sifra = appliedFilters.atc_sifra.trim();
        }

        if (appliedFilters.lista_id !== 'all') {
          params.lista_id = appliedFilters.lista_id;
        }

        if (appliedFilters.cijena_min !== '') {
          params.cijena_min = appliedFilters.cijena_min;
        }

        if (appliedFilters.cijena_max !== '') {
          params.cijena_max = appliedFilters.cijena_max;
        }

        if (appliedFilters.participacija_min !== '') {
          params.participacija_min = appliedFilters.participacija_min;
        }

        if (appliedFilters.participacija_max !== '') {
          params.participacija_max = appliedFilters.participacija_max;
        }

        if (appliedFilters.procenat_participacije_min !== '') {
          params.procenat_participacije_min = appliedFilters.procenat_participacije_min;
        }

        if (appliedFilters.procenat_participacije_max !== '') {
          params.procenat_participacije_max = appliedFilters.procenat_participacije_max;
        }

        if (appliedFilters.ima_indikacije === 'yes') {
          params.ima_indikacije = true;
        } else if (appliedFilters.ima_indikacije === 'no') {
          params.ima_indikacije = false;
        }

        const response = await medicinesAPI.getAll({
          ...params,
        });

        const payload: PaginatedData<LijekListItem> = response.data?.data;

        setItems(payload?.data || []);
        setLastPage(payload?.last_page || 1);
        setTotal(payload?.total || 0);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Ne mo\u017eemo u\u010ditati lijekove trenutno.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, query, appliedFilters]);

  const onSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
    setAppliedFilters({ ...filters });
  };

  const onClearFilters = () => {
    setSearchInput('');
    setQuery('');
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const activeFilters = useMemo(() => {
    const result: string[] = [];
    if (query) result.push(`Upit: ${query}`);
    if (appliedFilters.atc_sifra) result.push(`ATC: ${appliedFilters.atc_sifra}`);
    if (appliedFilters.lista_id !== 'all') result.push(`Lista: ${appliedFilters.lista_id}`);
    if (appliedFilters.cijena_min || appliedFilters.cijena_max) {
      result.push(`Cijena: ${appliedFilters.cijena_min || '0'} - ${appliedFilters.cijena_max || 'inf'}`);
    }
    if (appliedFilters.participacija_min || appliedFilters.participacija_max) {
      result.push(`Participacija: ${appliedFilters.participacija_min || '0'} - ${appliedFilters.participacija_max || 'inf'}`);
    }
    if (appliedFilters.procenat_participacije_min || appliedFilters.procenat_participacije_max) {
      result.push(`% participacije: ${appliedFilters.procenat_participacije_min || '0'} - ${appliedFilters.procenat_participacije_max || '100'}`);
    }
    if (appliedFilters.ima_indikacije === 'yes') result.push('Ima indikacije');
    if (appliedFilters.ima_indikacije === 'no') result.push('Nema indikacije');
    return result;
  }, [query, appliedFilters]);

  const canonicalUrl = `${SITE_URL}/lijekovi`;

  const seoTitle = useMemo(() => {
    if (query) {
      return `${query} - doplata preko Fonda Republike Srpske | wizMedik`;
    }

    return 'Spisak lijekova i doplata preko Fonda Republike Srpske | wizMedik';
  }, [query]);

  const seoDescription = useMemo(() => {
    if (query) {
      return `Rezultati za ${query}: provjerite da li je lijek preko Fonda Republike Srpske i tacan iznos doplate osiguranika.`;
    }

    return 'Spisak lijekova sa aktuelnom cijenom i tacnim iznosom doplate ako je lijek preko Fonda Republike Srpske (RFZO lista).';
  }, [query]);

  const itemListSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Spisak lijekova i doplata preko Fonda Republike Srpske',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: items.length,
      itemListElement: items.slice(0, 24).map((item, index) => {
        const medicineName = item.naziv || item.naziv_lijeka || `Lijek ${item.lijek_id}`;
        const medicineUrl = `${SITE_URL}/lijekovi/${item.slug}`;

        const additionalProperty: Array<Record<string, string>> = [
          {
            '@type': 'PropertyValue',
            name: 'Status preko fonda',
            value: hasFundCoverage(item.aktuelna_lista_id) ? 'Da' : 'Ne',
          },
          {
            '@type': 'PropertyValue',
            name: 'Doplata',
            value: formatCopay(item.aktuelni_iznos_participacije),
          },
        ];

        if (item.atc_sifra) {
          additionalProperty.push({
            '@type': 'PropertyValue',
            name: 'ATC \u0161ifra',
            value: item.atc_sifra,
          });
        }

        if (item.doza) {
          additionalProperty.push({
            '@type': 'PropertyValue',
            name: 'Doza',
            value: item.doza,
          });
        }

        if (item.pakovanje) {
          additionalProperty.push({
            '@type': 'PropertyValue',
            name: 'Pakovanje',
            value: item.pakovanje,
          });
        }

        return {
          '@type': 'ListItem',
          position: index + 1,
          url: medicineUrl,
          item: {
            '@type': 'Product',
            name: medicineName,
            sku: String(item.lijek_id),
            url: medicineUrl,
            category: item.aktuelna_lista_id ? `Lista RFZO ${item.aktuelna_lista_id}` : 'Nije na listi fonda',
            additionalProperty,
          },
        };
      }),
    };
  }, [items]);

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
          name: 'Koliko se tacno doplacuje ako je lijek preko fonda?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Doplata je tacan iznos participacije koji placa osiguranik. Ako je iznos 0.00 KM, prikazuje se kao Bez doplate.',
          },
        },
        {
          '@type': 'Question',
          name: 'Kako dobijamo aktuelnu cijenu i indikacije?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Za svaki lijek uzima se samo najnoviji period va\u017eenja. Iz tog perioda preuzimamo jednu cijenu i sve aktuelne indikacije.',
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Spisak lijekova</h1>
            </div>
            <p className="text-gray-600 max-w-3xl">
              Provjerite da li je lijek preko Fonda Republike Srpske i tačdno koliko se doplaćuje.
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
                <Button type="button" variant="outline" onClick={() => setShowAdvancedFilters((prev) => !prev)}>
                  <span className="inline-flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filteri
                  </span>
                </Button>
                <Button type="button" variant="outline" onClick={onClearFilters}>
                  Reset
                </Button>
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  <Input
                    placeholder="ATC \u0161ifra (npr. A02BC)"
                    value={filters.atc_sifra}
                    onChange={(event) => setFilters((prev) => ({ ...prev, atc_sifra: event.target.value }))}
                  />
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={filters.lista_id}
                    onChange={(event) => setFilters((prev) => ({ ...prev, lista_id: event.target.value }))}
                  >
                    <option value="all">Sve RFZO liste</option>
                    {rfzoLists.map((item) => (
                      <option key={item.id} value={item.code}>
                        {item.code} {item.naziv ? `- ${item.naziv}` : ''}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Cijena od"
                    value={filters.cijena_min}
                    onChange={(event) => setFilters((prev) => ({ ...prev, cijena_min: event.target.value }))}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Cijena do"
                    value={filters.cijena_max}
                    onChange={(event) => setFilters((prev) => ({ ...prev, cijena_max: event.target.value }))}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Participacija od"
                    value={filters.participacija_min}
                    onChange={(event) => setFilters((prev) => ({ ...prev, participacija_min: event.target.value }))}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Participacija do"
                    value={filters.participacija_max}
                    onChange={(event) => setFilters((prev) => ({ ...prev, participacija_max: event.target.value }))}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="% participacije od"
                    value={filters.procenat_participacije_min}
                    onChange={(event) => setFilters((prev) => ({ ...prev, procenat_participacije_min: event.target.value }))}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="% participacije do"
                    value={filters.procenat_participacije_max}
                    onChange={(event) => setFilters((prev) => ({ ...prev, procenat_participacije_max: event.target.value }))}
                  />
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={filters.ima_indikacije}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        ima_indikacije: event.target.value as FilterDraft['ima_indikacije'],
                      }))
                    }
                  >
                    <option value="all">Indikacije: sve</option>
                    <option value="yes">Samo sa indikacijama</option>
                    <option value="no">Samo bez indikacija</option>
                  </select>
                </div>
              )}
            </form>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Ukupno rezultata: <span className="font-semibold text-gray-900">{total}</span>
              </p>
              {activeFilters.length > 0 ? (
                <Badge variant="secondary">{activeFilters.length} aktivnih filtera</Badge>
              ) : (
                <Badge variant="outline">Bez filtera</Badge>
              )}
            </div>

            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {activeFilters.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            )}

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
                              <Badge variant="outline">ID {item.lijek_id}</Badge>
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

                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                            <div>
                              <span className="text-gray-500">ATC:</span>{' '}
                              <span className="font-medium">{item.atc_sifra || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Lista:</span>{' '}
                              <span className="font-medium">{item.aktuelna_lista_id || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Pakovanje:</span>{' '}
                              <span className="font-medium">{item.pakovanje || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Doza:</span>{' '}
                              <span className="font-medium">{item.doza || '-'}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t text-sm">
                            <p>
                              <span className="text-gray-500">Aktuelna cijena:</span>{' '}
                              <span className="font-semibold text-gray-900">{formatPrice(item.aktuelna_cijena)}</span>
                            </p>
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
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
