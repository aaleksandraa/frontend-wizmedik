import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { pitanjaAPI, specialtiesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const pitanjeSchema = z.object({
  naslov: z.string()
    .min(10, 'Naslov mora imati najmanje 10 karaktera')
    .max(200, 'Naslov može imati maksimalno 200 karaktera'),
  sadrzaj: z.string()
    .min(20, 'Pitanje mora imati najmanje 20 karaktera')
    .max(5000, 'Pitanje može imati maksimalno 5000 karaktera'),
  ime_korisnika: z.string()
    .min(2, 'Ime mora imati najmanje 2 karaktera')
    .max(100, 'Ime može imati maksimalno 100 karaktera'),
  email_korisnika: z.string()
    .email('Unesite validnu email adresu')
    .optional()
    .or(z.literal('')),
  specijalnost_id: z.string().min(1, 'Molimo odaberite specijalnost'),
  captcha_verified: z.boolean().refine(val => val === true, {
    message: 'Molimo potvrdite da niste robot'
  }),
});

type PitanjeFormData = z.infer<typeof pitanjeSchema>;

export default function PostaviPitanje() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [tagovi, setTagovi] = useState<string[]>([]);
  const [noviTag, setNoviTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [slike, setSlike] = useState<File[]>([]);
  const [captchaQuestion, setCaptchaQuestion] = useState({ a: 0, b: 0 });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PitanjeFormData>({
    resolver: zodResolver(pitanjeSchema),
    defaultValues: {
      captcha_verified: false,
    },
  });

  const selectedSpecijalnost = watch('specijalnost_id');

  useEffect(() => {
    loadSpecijalnosti();
    setCaptchaQuestion({ a: Math.floor(Math.random() * 10) + 1, b: Math.floor(Math.random() * 10) + 1 });
  }, []);

  useEffect(() => {
    const specijalnostParam = searchParams.get('specijalnost');
    if (specijalnostParam && specijalnosti.length > 0) {
      const found = specijalnosti.find(s => 
        s.naziv.toLowerCase().replace(/\s+/g, '-') === specijalnostParam ||
        s.slug === specijalnostParam
      );
      if (found) {
        setValue('specijalnost_id', found.id.toString());
      }
    }
  }, [searchParams, specijalnosti, setValue]);

  const loadSpecijalnosti = async () => {
    try {
      const response = await specialtiesAPI.getAll();
      setSpecijalnosti(response.data);
    } catch (error) {
      console.error('Greška pri učitavanju specijalnosti:', error);
      toast.error('Greška pri učitavanju specijalnosti');
    }
  };

  const hierarchicalSpecijalnosti = useMemo(() => {
    const parents = specijalnosti.filter((s: any) => !s.parent_id);
    const children = specijalnosti.filter((s: any) => s.parent_id);
    return parents.map((parent: any) => ({
      ...parent,
      children: children.filter((c: any) => c.parent_id === parent.id)
    }));
  }, [specijalnosti]);

  const dodajTag = () => {
    if (noviTag.trim() && tagovi.length < 5 && !tagovi.includes(noviTag.trim())) {
      setTagovi([...tagovi, noviTag.trim()]);
      setNoviTag('');
    }
  };

  const ukloniTag = (tag: string) => {
    setTagovi(tagovi.filter(t => t !== tag));
  };

  const handleCaptchaVerify = () => {
    setCaptchaVerified(true);
    setValue('captcha_verified', true);
    toast.success('Verifikacija uspješna');
  };

  const onSubmit = async (data: PitanjeFormData) => {
    setIsSubmitting(true);

    try {
      const response = await pitanjaAPI.postaviPitanje({
        naslov: data.naslov,
        sadrzaj: data.sadrzaj,
        ime_korisnika: data.ime_korisnika,
        email_korisnika: data.email_korisnika || undefined,
        specijalnost_id: parseInt(data.specijalnost_id),
        tagovi: tagovi.length > 0 ? tagovi : undefined,
        captcha_token: 'dummy_token', // U produkciji, koristiti pravi token
      });

      toast.success('Pitanje je uspješno postavljeno!');
      navigate(`/pitanja/${response.data.pitanje.slug}`);
    } catch (error: any) {
      console.error('Greška pri postavljanju pitanja:', error);
      
      if (error.response?.status === 429) {
        toast.error('Dostigli ste maksimalan broj pitanja za danas');
      } else if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err: any) => {
          toast.error(err[0]);
        });
      } else {
        toast.error('Greška pri postavljanju pitanja');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Postavi Pitanje - WizMedik</title>
        <meta name="description" content="Postavite medicinsko pitanje i dobijte odgovor od stručnih doktora u Bosni i Hercegovini" />
        <meta name="keywords" content="medicinsko pitanje, zdravstveni savjet, doktor online, besplatno pitanje" />
      </Helmet>

      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Postavi Pitanje
          </h1>
          <p className="text-muted-foreground">
            Postavite svoje medicinsko pitanje i dobijte odgovor od stručnih doktora
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Besplatno</h3>
                  <p className="text-sm text-muted-foreground">
                    Postavljanje pitanja je potpuno besplatno
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Stručni Odgovori</h3>
                  <p className="text-sm text-muted-foreground">
                    Odgovaraju samo verifikovani doktori
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Javno Pitanje</h3>
                  <p className="text-sm text-muted-foreground">
                    Pitanje će biti vidljivo svima
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vaše Pitanje</CardTitle>
            <CardDescription>
              Popunite formu ispod. Pitanje će biti vidljivo javno.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Ime */}
              <div className="space-y-2">
                <Label htmlFor="ime_korisnika">Vaše Ime *</Label>
                <Input
                  id="ime_korisnika"
                  placeholder="npr. Amina K."
                  {...register('ime_korisnika')}
                />
                {errors.ime_korisnika && (
                  <p className="text-sm text-destructive">{errors.ime_korisnika.message}</p>
                )}
              </div>

              {/* Email (opciono) */}
              <div className="space-y-2">
                <Label htmlFor="email_korisnika">Email (opciono)</Label>
                <Input
                  id="email_korisnika"
                  type="email"
                  placeholder="vasa@email.com"
                  {...register('email_korisnika')}
                />
                <p className="text-xs text-muted-foreground">
                  Email neće biti javno prikazan.
                </p>
                {errors.email_korisnika && (
                  <p className="text-sm text-destructive">{errors.email_korisnika.message}</p>
                )}
              </div>

              {/* Specijalnost */}
              <div className="space-y-2">
                <Label htmlFor="specijalnost_id">Medicinska Specijalnost *</Label>
                <Select
                  value={selectedSpecijalnost}
                  onValueChange={(value) => setValue('specijalnost_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberite specijalnost" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {hierarchicalSpecijalnosti.map((parent: any) => (
                      <div key={parent.id}>
                        <SelectItem value={parent.id.toString()} className="font-semibold">
                          {parent.naziv}
                        </SelectItem>
                        {parent.children?.map((child: any) => (
                          <SelectItem key={child.id} value={child.id.toString()} className="pl-6 text-sm">
                            └ {child.naziv}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specijalnost_id && (
                  <p className="text-sm text-destructive">{errors.specijalnost_id.message}</p>
                )}
              </div>

              {/* Naslov */}
              <div className="space-y-2">
                <Label htmlFor="naslov">Naslov Pitanja *</Label>
                <Input
                  id="naslov"
                  placeholder="npr. Bol u grudima nakon fizičke aktivnosti"
                  {...register('naslov')}
                />
                {errors.naslov && (
                  <p className="text-sm text-destructive">{errors.naslov.message}</p>
                )}
              </div>

              {/* Sadržaj */}
              <div className="space-y-2">
                <Label htmlFor="sadrzaj">Detaljan Opis Pitanja *</Label>
                <Textarea
                  id="sadrzaj"
                  rows={8}
                  placeholder="Opišite detaljno svoje pitanje, simptome, trajanje problema, itd."
                  {...register('sadrzaj')}
                />
                {errors.sadrzaj && (
                  <p className="text-sm text-destructive">{errors.sadrzaj.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slike">Slike/Nalazi (opciono, max 3)</Label>
                <Input
                  id="slike"
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 3) {
                      toast.error('Možete uploadovati maksimalno 3 fajla');
                      e.target.value = '';
                      return;
                    }
                    setSlike(files);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Slike/nalazi će biti vidljivi samo doktorima. Maksimalno 3 fajla.
                </p>
              </div>

              {/* Tagovi */}
              <div className="space-y-2">
                <Label>Tagovi (opciono, max 5)</Label>
                <div className="flex gap-2">
                  <Input
                    value={noviTag}
                    onChange={(e) => setNoviTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), dodajTag())}
                    placeholder="npr. dijabetes, hipertenzija"
                    disabled={tagovi.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={dodajTag}
                    disabled={tagovi.length >= 5 || !noviTag.trim()}
                  >
                    Dodaj
                  </Button>
                </div>
                {tagovi.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tagovi.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => ukloniTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* CAPTCHA */}
              <div className="space-y-2">
                <Label>Verifikacija *</Label>
                <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                  {!captchaVerified ? (
                    <>
                      <p className="text-sm font-medium">Riješite zadatak:</p>
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-mono bg-white p-3 rounded border">
                          {captchaQuestion.a} + {captchaQuestion.b} = ?
                        </div>
                        <Input
                          type="number"
                          placeholder="Rezultat"
                          className="w-24"
                          id="captcha-input"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('captcha-input') as HTMLInputElement;
                            if (input.value === String(captchaQuestion.a + captchaQuestion.b)) {
                              handleCaptchaVerify();
                            } else {
                              toast.error('Netačan odgovor');
                              input.value = '';
                              setCaptchaQuestion({ a: Math.floor(Math.random() * 10) + 1, b: Math.floor(Math.random() * 10) + 1 });
                            }
                          }}
                        >
                          Provjeri
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Verifikovano</span>
                    </div>
                  )}
                </div>
                {errors.captcha_verified && (
                  <p className="text-sm text-destructive">{errors.captcha_verified.message}</p>
                )}
              </div>

              {/* Napomena */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Važna Napomena:</h4>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Pitanje će biti javno vidljivo sa vašim imenom</li>
                  <li>Odgovor će dati samo doktor sa odgovarajućom specijalnosti</li>
                  <li>Ovo nije zamjena za liječnički pregled</li>
                  <li>U hitnim slučajevima pozovite 124</li>
                </ul>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Postavljanje...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Postavi Pitanje
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
