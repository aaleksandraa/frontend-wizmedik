import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { medicinesAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pill } from 'lucide-react';

type LijekIndikacija = {
  oznaka: string | null;
  naziv: string | null;
};

type LijekDetalji = {
  id: number;
  lijek_id: number;
  slug: string;
  naziv: string | null;
  naziv_lijeka: string | null;
  opis: string | null;
  atc_sifra: string | null;
  inn: string | null;
  proizvodjac: string | null;
  farmaceutski_oblik: string | null;
  oblik: string | null;
  vrsta_lijeka: string | null;
  tip_lijeka: string | null;
  brend: string | null;
  doza: string | null;
  pakovanje: string | null;
  lista_rfzo_pojasnjenje: string | null;
  aktuelni_fond: {
    verzija_od: string | null;
    verzija_do: string | null;
    lista_id: string | null;
    lista_pojasnjenje: string | null;
    cijena: string | null;
    procenat_participacije: string | null;
    iznos_participacije: string | null;
    indikacije: LijekIndikacija[];
  };
};

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const formatPrice = (value: string | null | undefined): string => {
  if (!value) {
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

  if (parsed === 0) {
    return 'BEZ DOPLATE';
  }

  return `${parsed.toFixed(2)} KM`;
};

const formatDateEu = (value: string | null | undefined): string => {
  if (!value) {
    return 'Nije uneseno';
  }

  const normalized = value.trim();
  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}.`;
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return date.toLocaleDateString('bs-BA');
};

const hasValue = (value: string | null | undefined): boolean => {
  return !!(value && value.trim() !== '');
};

const isFundCovered = (listaId: string | null | undefined): boolean => {
  return hasValue(listaId);
};

const valueOrFallback = (value: string | null | undefined): string => {
  return value && value.trim() !== '' ? value : 'Nije uneseno';
};

export default function LijekProfil() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<LijekDetalji | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setError('Nedostaje slug lijeka.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await medicinesAPI.getBySlug(slug);
        setData(response.data?.data || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Ne mo\u017eemo u\u010ditati profil lijeka.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const osnovniPodaci = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      { label: 'INN', value: data.inn },
      { label: 'Farmaceutski oblik', value: data.farmaceutski_oblik || data.oblik },
      { label: 'Vrsta lijeka', value: data.vrsta_lijeka || data.tip_lijeka },
      { label: 'Proizvo\u0111a\u010d', value: data.proizvodjac || data.brend },
      { label: 'Doza', value: data.doza },
      { label: 'Pakovanje', value: data.pakovanje },
    ].filter((item) => hasValue(item.value));
  }, [data]);

  const medicineName = useMemo(() => {
    if (!data) {
      return 'Profil lijeka';
    }

    return data.naziv || data.naziv_lijeka || 'Profil lijeka';
  }, [data]);

  const canonicalUrl = useMemo(() => {
    if (!data?.slug) {
      return `${SITE_URL}/lijekovi`;
    }

    return `${SITE_URL}/lijekovi/${data.slug}`;
  }, [data?.slug]);

  const prekoFonda = useMemo(() => {
    return isFundCovered(data?.aktuelni_fond?.lista_id);
  }, [data?.aktuelni_fond?.lista_id]);

  const aktuelnaCijenaLabel = useMemo(() => {
    return formatPrice(data?.aktuelni_fond?.cijena);
  }, [data?.aktuelni_fond?.cijena]);

  const doplataLabel = useMemo(() => {
    return formatCopay(data?.aktuelni_fond?.iznos_participacije);
  }, [data?.aktuelni_fond?.iznos_participacije]);

  const periodVazenja = useMemo(() => {
    const od = data?.aktuelni_fond?.verzija_od;
    const doDatuma = data?.aktuelni_fond?.verzija_do;

    if (!od && !doDatuma) {
      return null;
    }

    if (od && doDatuma) {
      return `${formatDateEu(od)} - ${formatDateEu(doDatuma)}`;
    }

    if (od) {
      return `${formatDateEu(od)} - aktuelno`;
    }

    return `do ${formatDateEu(doDatuma)}`;
  }, [data?.aktuelni_fond?.verzija_od, data?.aktuelni_fond?.verzija_do]);

  const listaPojasnjenje = useMemo(() => {
    const value = data?.aktuelni_fond?.lista_pojasnjenje || data?.lista_rfzo_pojasnjenje || null;
    return hasValue(value) ? value.trim() : null;
  }, [data?.aktuelni_fond?.lista_pojasnjenje, data?.lista_rfzo_pojasnjenje]);

  const seoTitle = useMemo(() => {
    if (!data) {
      return 'Profil lijeka | wizMedik';
    }

    return `${medicineName} - cijena, doplata i status fonda | wizMedik`;
  }, [data, medicineName]);

  const seoDescription = useMemo(() => {
    if (!data) {
      return 'Profil lijeka sa cijenom, doplatom, statusom preko fonda i aktuelnim indikacijama.';
    }

    const listaText = hasValue(data.aktuelni_fond?.lista_id)
      ? `Lista ${data.aktuelni_fond?.lista_id}`
      : 'nije na listi fonda';
    const fondStatusText = prekoFonda ? `preko fonda (${listaText})` : 'nije preko fonda';

    return `${medicineName}: aktuelna cijena ${aktuelnaCijenaLabel}, doplata ${doplataLabel}. Status fonda: ${fondStatusText}.`;
  }, [data, medicineName, prekoFonda, aktuelnaCijenaLabel, doplataLabel]);

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
          item: `${SITE_URL}/lijekovi`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: medicineName,
          item: canonicalUrl,
        },
      ],
    };
  }, [medicineName, canonicalUrl]);

  const productSchema = useMemo(() => {
    if (!data) {
      return null;
    }

    const additionalProperty: Array<Record<string, string>> = [
      {
        '@type': 'PropertyValue',
        name: 'Status preko fonda',
        value: prekoFonda ? 'Da' : 'Ne',
      },
      {
        '@type': 'PropertyValue',
        name: 'Doplata',
        value: doplataLabel,
      },
    ];

    if (hasValue(data.atc_sifra)) {
      additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'ATC \u0161ifra',
        value: data.atc_sifra as string,
      });
    }

    if (hasValue(data.inn)) {
      additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'INN',
        value: data.inn as string,
      });
    }

    if (hasValue(data.doza)) {
      additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'Doza',
        value: data.doza as string,
      });
    }

    if (hasValue(data.pakovanje)) {
      additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'Pakovanje',
        value: data.pakovanje as string,
      });
    }

    const schema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: medicineName,
      sku: String(data.lijek_id),
      url: canonicalUrl,
      description: hasValue(data.opis) ? data.opis : seoDescription,
      additionalProperty,
    };

    const proizvodjac = data.proizvodjac || data.brend;
    if (hasValue(proizvodjac)) {
      schema.brand = {
        '@type': 'Brand',
        name: proizvodjac,
      };
    }

    const cijenaRaw = data.aktuelni_fond?.cijena;
    const cijenaParsed = cijenaRaw !== null && cijenaRaw !== undefined && cijenaRaw !== '' ? Number(cijenaRaw) : NaN;
    if (!Number.isNaN(cijenaParsed)) {
      schema.offers = {
        '@type': 'Offer',
        price: cijenaParsed.toFixed(2),
        priceCurrency: 'BAM',
        url: canonicalUrl,
      };
    }

    return schema;
  }, [data, medicineName, canonicalUrl, seoDescription, prekoFonda, doplataLabel]);

  const faqSchema = useMemo(() => {
    if (!data) {
      return null;
    }

    const listaInfo = hasValue(data.aktuelni_fond?.lista_id) ? `na listi ${data.aktuelni_fond?.lista_id}` : 'nije na listi fonda';
    const fondAnswer = prekoFonda
      ? `${medicineName} je trenutno preko fonda i nalazi se ${listaInfo}.`
      : `${medicineName} trenutno ${listaInfo}.`;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `Da li je ${medicineName} preko fonda?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: fondAnswer,
          },
        },
        {
          '@type': 'Question',
          name: `Kolika je doplata za ${medicineName}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Aktuelna doplata za ${medicineName} je ${doplataLabel}.`,
          },
        },
      ],
    };
  }, [data, medicineName, prekoFonda, doplataLabel]);

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="lijek, cijena lijeka, doplata, preko fonda, RFZO lista, indikacije, ATC \u0161ifra, INN"
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:locale" content="bs_BA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {productSchema && <script type="application/ld+json">{JSON.stringify(productSchema)}</script>}
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Link to="/lijekovi">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Nazad na spisak lijekova
              </Button>
            </Link>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">{'U\u010ditavanje profila lijeka...'}</CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center text-red-600">{error}</CardContent>
            </Card>
          ) : !data ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">{'Lijek nije prona\u0111en.'}</CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Pill className="h-7 w-7 text-emerald-600" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                          {data.naziv || data.naziv_lijeka || 'Naziv lijeka nije unesen'}
                        </h1>
                      </div>
                      {hasValue(data.opis) && <p className="text-gray-600">{data.opis}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Lijek ID: {data.lijek_id}</Badge>
                      {hasValue(data.atc_sifra) && <Badge variant="outline">ATC: {data.atc_sifra}</Badge>}
                      {hasValue(data.aktuelni_fond?.lista_id || null) && (
                        <Badge variant="secondary">Lista RFZO: {data.aktuelni_fond?.lista_id}</Badge>
                      )}
                      {prekoFonda ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Preko fonda</Badge>
                      ) : (
                        <Badge variant="secondary">Nije preko fonda</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {osnovniPodaci.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Osnovni podaci</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {osnovniPodaci.map((item) => (
                      <div key={item.label}>
                        <p className="text-xs uppercase text-gray-500">{item.label}</p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Aktuelni fond podaci</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`grid sm:grid-cols-2 ${periodVazenja ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Aktuelna cijena</p>
                      <p className="font-semibold text-lg">{aktuelnaCijenaLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Doplata</p>
                      <p className="font-semibold text-lg">{doplataLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Status preko fonda</p>
                      <p className="font-semibold text-lg">{prekoFonda ? 'DA' : 'NE'}</p>
                    </div>
                    {periodVazenja && (
                      <div>
                        <p className="text-xs uppercase text-gray-500">{'Period va\u017eenja'}</p>
                        <p className="font-medium">{periodVazenja}</p>
                      </div>
                    )}
                  </div>

                  {listaPojasnjenje && (
                    <div className="border-t pt-4">
                      <p className="text-xs uppercase text-gray-500 mb-1">{'Lista RFZO poja\u0161njenje'}</p>
                      <p className="text-gray-700">{listaPojasnjenje}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aktuelne indikacije</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.aktuelni_fond?.indikacije?.length ? (
                    <div className="space-y-2">
                      {data.aktuelni_fond.indikacije.map((indikacija, index) => (
                        <div key={`${indikacija.oznaka || 'indikacija'}-${index}`} className="border rounded-md p-3">
                          <p className="font-semibold text-gray-900">
                            {valueOrFallback(indikacija.oznaka)} - {valueOrFallback(indikacija.naziv)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Nema aktuelnih indikacija za prikaz.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
