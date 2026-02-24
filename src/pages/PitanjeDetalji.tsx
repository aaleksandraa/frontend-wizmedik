import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { pitanjaAPI, doctorsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/Navbar';
import { 
  MessageSquare, Eye, Calendar, ThumbsUp, CheckCircle2, 
  User, Stethoscope, MapPin, Clock, Send 
} from 'lucide-react';
import DOMPurify from 'dompurify';

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;

export default function PitanjeDetalji() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [pitanje, setPitanje] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [odgovor, setOdgovor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      loadPitanje();
    }
  }, [slug]);

  useEffect(() => {
    if (user?.role === 'doctor') {
      loadDoctorProfile();
    }
  }, [user]);

  const loadDoctorProfile = async () => {
    try {
      const response = await doctorsAPI.getMyProfile();
      setDoctorProfile(response.data);
    } catch (error) {
      console.error('Greška pri učitavanju profila doktora:', error);
    }
  };

  const loadPitanje = async () => {
    setLoading(true);
    try {
      const response = await pitanjaAPI.getPitanje(slug!);
      setPitanje(response.data);
    } catch (error) {
      console.error('Greška pri učitavanju pitanja:', error);
      toast.error('Greška pri učitavanju pitanja');
    } finally {
      setLoading(false);
    }
  };

  const handleOdgovori = async () => {
    if (!odgovor.trim() || odgovor.length < 20) {
      toast.error('Odgovor mora imati najmanje 20 karaktera');
      return;
    }

    setSubmitting(true);
    try {
      await pitanjaAPI.odgovoriNaPitanje(pitanje.id, odgovor);
      toast.success('Odgovor je uspješno postavljen!');
      setOdgovor('');
      loadPitanje();
    } catch (error: any) {
      console.error('Greška pri postavljanju odgovora:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Greška pri postavljanju odgovora');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLajk = async (odgovorId: number) => {
    try {
      await pitanjaAPI.lajkujOdgovor(odgovorId);
      toast.success('Hvala na ocjeni!');
      loadPitanje();
    } catch (error) {
      console.error('Greška pri lajkovanju:', error);
    }
  };

  const MJESECI = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'];
  
  const formatDatum = (datum: string) => {
    const date = new Date(datum);
    return `${MJESECI[date.getMonth()]}, ${date.getFullYear()}.`;
  };

  const isDoctor = user?.role === 'doctor';
  
  // Check if doctor has the specialty matching the question
  const hasMatchingSpecialty = isDoctor && doctorProfile?.specijalnosti?.some(
    (spec: any) => spec.id === pitanje?.specijalnost_id
  );
  const canonicalUrl = `${SITE_URL}/pitanja/${slug || ''}`;
  const seoTitle = pitanje ? `${pitanje.naslov} | Medicinska pitanja | WizMedik` : 'Medicinsko pitanje | WizMedik';

  const plainQuestionText = useMemo(() => {
    const content = pitanje?.sadrzaj || '';
    return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [pitanje?.sadrzaj]);

  const seoDescription = plainQuestionText
    ? plainQuestionText.slice(0, 160)
    : 'Javno medicinsko pitanje i odgovori verifikovanih doktora.';

  const qaSchema = useMemo(() => {
    if (!pitanje) return null;

    const answers = Array.isArray(pitanje.odgovori) ? pitanje.odgovori : [];
    const accepted = answers.find((odg: any) => odg.je_prihvacen);
    const questionAuthorName = (pitanje.ime_korisnika || '').trim() || 'Anonimni korisnik';
    const suggestedAnswers = answers.map((odg: any, index: number) => {
      const doctorIme = odg.doktor?.user?.ime || odg.doktor?.ime || '';
      const doctorPrezime = odg.doktor?.user?.prezime || odg.doktor?.prezime || '';
      const doctorName = `${doctorIme} ${doctorPrezime}`.trim();
      const answerAnchor = odg.id ? `odgovor-${odg.id}` : `odgovor-${index + 1}`;

      return {
        '@type': 'Answer',
        text: (odg.sadrzaj || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        dateCreated: odg.created_at,
        upvoteCount: odg.broj_lajkova || 0,
        url: `${canonicalUrl}#${answerAnchor}`,
        author: {
          '@type': 'Person',
          name: doctorName ? `Dr. ${doctorName}` : 'Doktor wizMedik',
          url: odg.doktor?.slug ? `${SITE_URL}/doktor/${odg.doktor.slug}` : `${SITE_URL}/doktori`,
        },
      };
    });

    const questionEntity: Record<string, any> = {
      '@type': 'Question',
      name: pitanje.naslov,
      text: plainQuestionText,
      dateCreated: pitanje.created_at,
      answerCount: answers.length,
      url: canonicalUrl,
      about: pitanje.specijalnost?.naziv || undefined,
      author: {
        '@type': 'Person',
        name: questionAuthorName,
      },
      suggestedAnswer: suggestedAnswers,
    };

    if (accepted) {
      const acceptedDoctorIme = accepted.doktor?.user?.ime || accepted.doktor?.ime || '';
      const acceptedDoctorPrezime = accepted.doktor?.user?.prezime || accepted.doktor?.prezime || '';
      const acceptedDoctorName = `${acceptedDoctorIme} ${acceptedDoctorPrezime}`.trim();
      const acceptedIndex = answers.findIndex((odg: any) => odg === accepted);
      const acceptedAnchor = accepted.id
        ? `odgovor-${accepted.id}`
        : `odgovor-${acceptedIndex >= 0 ? acceptedIndex + 1 : 1}`;

      questionEntity.acceptedAnswer = {
        '@type': 'Answer',
        text: (accepted.sadrzaj || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        dateCreated: accepted.created_at,
        upvoteCount: accepted.broj_lajkova || 0,
        url: `${canonicalUrl}#${acceptedAnchor}`,
        author: {
          '@type': 'Person',
          name: acceptedDoctorName ? `Dr. ${acceptedDoctorName}` : 'Doktor wizMedik',
          url: accepted.doktor?.slug ? `${SITE_URL}/doktor/${accepted.doktor.slug}` : `${SITE_URL}/doktori`,
        },
      };
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      mainEntity: questionEntity,
    };
  }, [canonicalUrl, plainQuestionText, pitanje]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Učitavanje...</p>
      </div>
    );
  }

  if (!pitanje) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Pitanje nije pronađeno</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="keywords" content={pitanje.tagovi?.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        {qaSchema && (
          <script type="application/ld+json">{JSON.stringify(qaSchema)}</script>
        )}
      </Helmet>

      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Početna</Link>
          {' / '}
          <Link to="/pitanja" className="hover:text-primary">Pitanja</Link>
          {' / '}
          <span>{pitanje.naslov}</span>
        </div>

        {/* Pitanje */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 mb-4">
              <CardTitle className="text-2xl">{pitanje.naslov}</CardTitle>
              {pitanje.je_odgovoreno && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Odgovoreno
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {pitanje.ime_korisnika}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDatum(pitanje.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {pitanje.broj_pregleda} pregleda
              </div>
              <Badge variant="outline">{pitanje.specijalnost?.naziv}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-4">
              <p 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(pitanje.sadrzaj, {
                    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
                    ALLOWED_ATTR: []
                  })
                }}
              />
            </div>
            
            {pitanje.tagovi && pitanje.tagovi.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {pitanje.tagovi.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Odgovori */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Odgovori ({pitanje.odgovori?.length || 0})
          </h2>

          {pitanje.odgovori && pitanje.odgovori.length > 0 ? (
            <div className="space-y-4">
              {pitanje.odgovori.map((odg: any) => (
                <Card key={odg.id} className={odg.je_prihvacen ? 'border-green-500 border-2' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={odg.doktor?.slika_url} />
                        <AvatarFallback>
                          {odg.doktor?.user?.ime?.[0]}{odg.doktor?.user?.prezime?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link 
                              to={`/doktor/${odg.doktor?.slug}`}
                              className="font-semibold hover:text-primary"
                            >
                              Dr. {odg.doktor?.user?.ime} {odg.doktor?.user?.prezime}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                              {odg.doktor?.specijalnosti?.map((spec: any) => (
                                <Badge key={spec.id} variant="outline" className="text-xs">
                                  <Stethoscope className="h-3 w-3 mr-1" />
                                  {spec.naziv}
                                </Badge>
                              ))}
                              {odg.doktor?.grad && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {odg.doktor.grad.naziv}
                                </span>
                              )}
                            </div>
                          </div>
                          {odg.je_prihvacen && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Najbolji odgovor
                            </Badge>
                          )}
                        </div>

                        <div className="prose max-w-none my-4">
                          <p 
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ 
                              __html: DOMPurify.sanitize(odg.sadrzaj, {
                                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
                                ALLOWED_ATTR: []
                              })
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDatum(odg.created_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLajk(odg.id)}
                            className="gap-1"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            {odg.broj_lajkova}
                          </Button>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/doktor/${odg.doktor?.slug}`}>
                              Otvori Profil
                            </Link>
                          </Button>
                          <Button asChild size="sm">
                            <Link to={`/doktor/${odg.doktor?.slug}#booking`}>
                              Rezerviši Termin
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Još nema odgovora na ovo pitanje</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Forma za odgovor (samo za doktore sa odgovarajućom specijalnosti) */}
        {isDoctor && hasMatchingSpecialty && (
          <Card>
            <CardHeader>
              <CardTitle>Vaš Odgovor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  rows={6}
                  placeholder="Napišite svoj stručni odgovor..."
                  value={odgovor}
                  onChange={(e) => setOdgovor(e.target.value)}
                />
                <Button
                  onClick={handleOdgovori}
                  disabled={submitting || odgovor.length < 20}
                  size="lg"
                >
                  {submitting ? 'Postavljanje...' : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Postavi Odgovor
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
