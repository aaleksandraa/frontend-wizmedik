import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { uploadAPI } from '@/services/api';
import { adminAPI } from '@/services/adminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Check, Layout, Palette, Home, Image, Upload, X, Map } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
}

const GRADIENT_PRESETS = [
  { name: 'Primary', value: 'from-primary via-primary/90 to-primary/80', preview: 'bg-gradient-to-br from-[#0ea5e9] via-[#0ea5e9]/90 to-[#0ea5e9]/80' },
  { name: 'Ocean', value: 'from-blue-600 via-blue-500 to-cyan-400', preview: 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400' },
  { name: 'Sunset', value: 'from-orange-500 via-pink-500 to-purple-600', preview: 'bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600' },
  { name: 'Forest', value: 'from-green-600 via-emerald-500 to-teal-400', preview: 'bg-gradient-to-br from-green-600 via-emerald-500 to-teal-400' },
  { name: 'Royal', value: 'from-purple-600 via-violet-500 to-indigo-400', preview: 'bg-gradient-to-br from-purple-600 via-violet-500 to-indigo-400' },
  { name: 'Rose', value: 'from-rose-500 via-pink-500 to-fuchsia-400', preview: 'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-400' },
  { name: 'Slate', value: 'from-slate-700 via-slate-600 to-slate-500', preview: 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500' },
  { name: 'Teal', value: 'from-teal-600 via-teal-500 to-cyan-400', preview: 'bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-400' },
];

export function TemplateSettings() {
  const [doctorTemplate, setDoctorTemplate] = useState('classic');
  const [clinicTemplate, setClinicTemplate] = useState('classic');
  const [homepageTemplate, setHomepageTemplate] = useState('classic');
  const [navbarStyle, setNavbarStyle] = useState<'auto' | 'default' | 'colored'>('auto');
  const [doctorsSplitViewEnabled, setDoctorsSplitViewEnabled] = useState(true);
  const [modernCoverType, setModernCoverType] = useState<'gradient' | 'image'>('gradient');
  const [modernCoverValue, setModernCoverValue] = useState('from-primary via-primary/90 to-primary/80');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [custom3HeroBgEnabled, setCustom3HeroBgEnabled] = useState(false);
  const [custom3HeroBgImage, setCustom3HeroBgImage] = useState<string | null>(null);
  const [custom3HeroBgOpacity, setCustom3HeroBgOpacity] = useState(20);
  const [uploadingCustom3Bg, setUploadingCustom3Bg] = useState(false);
  const custom3BgInputRef = useRef<HTMLInputElement>(null);
  const [doctorTemplates, setDoctorTemplates] = useState<Template[]>([]);
  const [clinicTemplates, setClinicTemplates] = useState<Template[]>([]);
  const [homepageTemplates, setHomepageTemplates] = useState<Template[]>([
    { id: 'clean', name: 'Clean', description: 'Čist i moderan dizajn sa teal bojama, tab pretraga i blog sekcijom' },
    { id: 'custom', name: 'Custom', description: 'Prilagođeni dizajn - podesi u "Početna" tabu' },
    { id: 'custom2-cyan', name: 'Custom 2 Cyan', description: 'ZocDoc stil sa svijetlo plavom/cyan bojom' },
    { id: 'custom2-yellow', name: 'Custom 2 Yellow', description: 'ZocDoc stil sa žutom bojom' },
    { id: 'custom3-cyan', name: 'Custom 3 Cyan', description: 'Minimalistički centrisani dizajn sa cyan bojom' },
    { id: 'pro', name: 'Pro', description: 'Profesionalni dizajn sa ljepšim klinikama i mobile responsive' },
    { id: 'medical', name: 'Medical', description: 'Kompletan medicinski portal sa svim sekcijama' },
    { id: 'modern', name: 'Modern', description: 'Moderan dizajn sa teal bojama i video sekcijom' },
    { id: 'classic', name: 'Classic', description: 'Originalni dizajn sa svim sekcijama' },
    { id: 'zocdoc', name: 'ZocDoc', description: 'Moderan dizajn sa zelenim tonovima' },
    { id: 'warm', name: 'Topli', description: 'Elegantan dizajn sa žuto-bež nijansama' },
    { id: 'ocean', name: 'Ocean', description: 'Svjež dizajn sa plavim nijansama' },
    { id: 'lime', name: 'Lime', description: 'Prirodan dizajn zeleno-žute nijanse' },
    { id: 'teal', name: 'Teal', description: 'Plavo-zeleni moderni dizajn' },
    { id: 'rose', name: 'Rose', description: 'Nježan dizajn sa ružičastim tonovima' },
    { id: 'sunset', name: 'Sunset', description: 'Topao dizajn sa narandžastim nijansama' },
    { id: 'minimal', name: 'Minimal', description: 'Ultra jednostavan, čist dizajn' },
    { id: 'bold', name: 'Bold', description: 'Tamni, moderan dizajn sa gradijentima' },
    { id: 'cards', name: 'Cards', description: 'Dashboard stil sa karticama' },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
    console.log('TemplateSettings loaded - doctorsSplitViewEnabled:', doctorsSplitViewEnabled);
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await adminAPI.getTemplates();
      setDoctorTemplate(response.data.doctor_profile_template);
      setClinicTemplate(response.data.clinic_profile_template);
      setHomepageTemplate(response.data.homepage_template || 'classic');
      setNavbarStyle(response.data.navbar_style || 'auto');
      setDoctorsSplitViewEnabled(response.data.doctors_split_view_enabled !== false);
      setModernCoverType(response.data.modern_cover_type || 'gradient');
      setModernCoverValue(response.data.modern_cover_value || 'from-primary via-primary/90 to-primary/80');
      setCustom3HeroBgEnabled(response.data.custom3_hero_bg_enabled || false);
      setCustom3HeroBgImage(response.data.custom3_hero_bg_image || null);
      setCustom3HeroBgOpacity(response.data.custom3_hero_bg_opacity || 20);
      setDoctorTemplates(response.data.available_templates.doctor);
      setClinicTemplates(response.data.available_templates.clinic);
      if (response.data.available_templates.homepage) {
        setHomepageTemplates(response.data.available_templates.homepage);
      }
    } catch (error) {
      toast.error('Greška pri učitavanju template postavki');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplates = async () => {
    setSaving(true);
    try {
      await adminAPI.updateTemplates({
        doctor_profile_template: doctorTemplate,
        clinic_profile_template: clinicTemplate,
        homepage_template: homepageTemplate,
        navbar_style: navbarStyle,
        doctors_split_view_enabled: doctorsSplitViewEnabled,
        modern_cover_type: modernCoverType,
        modern_cover_value: modernCoverValue,
        custom3_hero_bg_enabled: custom3HeroBgEnabled,
        custom3_hero_bg_image: custom3HeroBgImage,
        custom3_hero_bg_opacity: custom3HeroBgOpacity,
      });
      toast.success('Template postavke sačuvane');
    } catch (error) {
      toast.error('Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'covers');
      setModernCoverType('image');
      setModernCoverValue(response.data.url);
      toast.success('Slika uspješno uploadovana');
    } catch (error) {
      toast.error('Greška pri uploadu slike');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCustom3BgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCustom3Bg(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'backgrounds');
      setCustom3HeroBgImage(response.data.url);
      setCustom3HeroBgEnabled(true);
      toast.success('Pozadinska slika uspješno uploadovana');
    } catch (error) {
      toast.error('Greška pri uploadu slike');
    } finally {
      setUploadingCustom3Bg(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Učitavanje...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Template Postavke
          </h2>
          <p className="text-muted-foreground">Odaberite izgled profila doktora i klinike</p>
        </div>
        <Button onClick={saveTemplates} disabled={saving}>
          {saving ? 'Čuvanje...' : 'Sačuvaj Promjene'}
        </Button>
      </div>

      {/* Doctor Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Profil Doktora
          </CardTitle>
          <CardDescription>Odaberite template za prikaz profila doktora</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {doctorTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => setDoctorTemplate(t.id)}
                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                  doctorTemplate === t.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {doctorTemplate === t.id && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary">
                      <Check className="h-3 w-3 mr-1" />
                      Aktivno
                    </Badge>
                  </div>
                )}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <TemplatePreview type={t.id} />
                </div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modern Cover Settings */}
      {doctorTemplate === 'modern' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Pozadina Modern Profila
            </CardTitle>
            <CardDescription>Prilagodite izgled cover sekcije na Modern template-u</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button
                variant={modernCoverType === 'gradient' ? 'default' : 'outline'}
                onClick={() => setModernCoverType('gradient')}
              >
                <Palette className="h-4 w-4 mr-2" />
                Gradient
              </Button>
              <Button
                variant={modernCoverType === 'image' ? 'default' : 'outline'}
                onClick={() => setModernCoverType('image')}
              >
                <Image className="h-4 w-4 mr-2" />
                Slika
              </Button>
            </div>

            {modernCoverType === 'gradient' && (
              <div className="space-y-4">
                <Label>Odaberite gradient</Label>
                <div className="grid grid-cols-4 gap-3">
                  {GRADIENT_PRESETS.map((preset) => (
                    <div
                      key={preset.name}
                      onClick={() => setModernCoverValue(preset.value)}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        modernCoverValue === preset.value ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`h-16 ${preset.preview}`} />
                      <div className="p-2 text-center text-sm font-medium bg-white">{preset.name}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Label>Ili unesite custom gradient klase</Label>
                  <Input
                    value={modernCoverValue}
                    onChange={(e) => setModernCoverValue(e.target.value)}
                    placeholder="from-blue-500 via-purple-500 to-pink-500"
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {modernCoverType === 'image' && (
              <div className="space-y-4">
                <Label>Cover slika</Label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />
                {modernCoverValue && modernCoverType === 'image' ? (
                  <div className="relative">
                    <img
                      src={modernCoverValue}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setModernCoverValue('');
                        setModernCoverType('gradient');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Kliknite za upload slike</p>
                    <p className="text-sm text-gray-400 mt-1">Preporučena veličina: 1920x400px</p>
                  </div>
                )}
                {uploadingCover && <p className="text-sm text-muted-foreground">Uploadujem...</p>}
              </div>
            )}

            {/* Preview */}
            <div className="mt-6">
              <Label>Pregled</Label>
              <div 
                className={`mt-2 h-32 rounded-lg flex items-center justify-center text-white font-semibold ${
                  modernCoverType === 'gradient' ? `bg-gradient-to-br ${modernCoverValue}` : ''
                }`}
                style={modernCoverType === 'image' && modernCoverValue ? {
                  backgroundImage: `url(${modernCoverValue})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                <span className="bg-black/30 px-4 py-2 rounded">Dr. Ime Prezime</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinic Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Profil Klinike
          </CardTitle>
          <CardDescription>Odaberite template za prikaz profila klinike</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinicTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => setClinicTemplate(t.id)}
                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                  clinicTemplate === t.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {clinicTemplate === t.id && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary">
                      <Check className="h-3 w-3 mr-1" />
                      Aktivno
                    </Badge>
                  </div>
                )}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <TemplatePreview type={t.id} />
                </div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Homepage Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Početna Stranica
          </CardTitle>
          <CardDescription>Odaberite template za početnu stranicu</CardDescription>
        </CardHeader>
        <CardContent>
          {homepageTemplate === 'custom' && (
            <div className="mb-6 p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <p className="text-violet-800 font-medium">✨ Custom template je aktivan</p>
              <p className="text-violet-600 text-sm mt-1">
                Idite na tab <strong>"Početna"</strong> da prilagodite boje, sekcije, naslove i ostale opcije vaše početne stranice.
              </p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {homepageTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => setHomepageTemplate(t.id)}
                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                  homepageTemplate === t.id 
                    ? t.id === 'custom' ? 'border-violet-500 bg-violet-50' : 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {homepageTemplate === t.id && (
                  <div className="absolute top-2 right-2">
                    <Badge className={t.id === 'custom' ? 'bg-violet-500' : 'bg-primary'}>
                      <Check className="h-3 w-3 mr-1" />
                      Aktivno
                    </Badge>
                  </div>
                )}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <HomepageTemplatePreview type={t.id} />
                </div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navbar Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Stil Navigacije (Navbar)
          </CardTitle>
          <CardDescription>Odaberite kako će navbar izgledati u odnosu na template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div
              onClick={() => setNavbarStyle('auto')}
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                navbarStyle === 'auto' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {navbarStyle === 'auto' && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary">
                    <Check className="h-3 w-3 mr-1" />
                    Aktivno
                  </Badge>
                </div>
              )}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex flex-col">
                <div className="h-1/4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-t-lg" />
                <div className="flex-1 bg-white rounded-b-lg" />
              </div>
              <h3 className="font-semibold">Automatski</h3>
              <p className="text-sm text-muted-foreground">Navbar preuzima boje od template-a</p>
            </div>

            <div
              onClick={() => setNavbarStyle('colored')}
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                navbarStyle === 'colored' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {navbarStyle === 'colored' && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary">
                    <Check className="h-3 w-3 mr-1" />
                    Aktivno
                  </Badge>
                </div>
              )}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex flex-col">
                <div className="h-1/4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-lg" />
                <div className="flex-1 bg-white rounded-b-lg" />
              </div>
              <h3 className="font-semibold">Uvijek Obojen</h3>
              <p className="text-sm text-muted-foreground">Navbar uvijek koristi boje template-a</p>
            </div>

            <div
              onClick={() => setNavbarStyle('default')}
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                navbarStyle === 'default' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {navbarStyle === 'default' && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary">
                    <Check className="h-3 w-3 mr-1" />
                    Aktivno
                  </Badge>
                </div>
              )}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex flex-col">
                <div className="h-1/4 bg-white border-b border-gray-200 rounded-t-lg" />
                <div className="flex-1 bg-white rounded-b-lg" />
              </div>
              <h3 className="font-semibold">Standardni</h3>
              <p className="text-sm text-muted-foreground">Bijeli navbar bez obzira na template</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium mb-2">ℹ️ Kako radi?</p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li><strong>Automatski:</strong> Ako template ima definisane boje (npr. Custom 2 Yellow), navbar će biti obojen. Inače bijeli.</li>
              <li><strong>Uvijek Obojen:</strong> Navbar će uvijek koristiti boje template-a ako su dostupne.</li>
              <li><strong>Standardni:</strong> Navbar će uvijek biti bijeli, bez obzira na template.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Split View Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Doktori - Split View (Lista + Mapa)
          </CardTitle>
          <CardDescription>Omogućite ili onemogućite split view opciju na stranici doktora</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="split-view-toggle" className="text-base font-medium cursor-pointer">
                Prikaži "Lista + Mapa" tab
              </Label>
              <p className="text-sm text-muted-foreground">
                Omogućava korisnicima da vide listu doktora lijevo i interaktivnu mapu desno
              </p>
            </div>
            <Switch
              id="split-view-toggle"
              checked={doctorsSplitViewEnabled}
              onCheckedChange={setDoctorsSplitViewEnabled}
            />
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium mb-2">ℹ️ O Split View-u</p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Lijevo (40%):</strong> Scrollable lista doktora sa osnovnim informacijama</li>
              <li>• <strong>Desno (60%):</strong> Interaktivna Leaflet mapa sa pinovima</li>
              <li>• <strong>Interakcija:</strong> Klik na doktora centrira mapu, klik na pin otvara popup</li>
              <li>• <strong>Besplatno:</strong> Koristi OpenStreetMap (Leaflet), bez API key-a</li>
            </ul>
          </div>

          {!doctorsSplitViewEnabled && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 font-medium">⚠️ Split View je onemogućen</p>
              <p className="text-amber-700 text-sm mt-1">
                Korisnici neće vidjeti "Lista + Mapa" tab na stranici doktora. Dostupne će biti samo "Lista" i "Mapa" opcije.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom 3 Cyan Hero Background */}
      {homepageTemplate === 'custom3-cyan' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Custom 3 Cyan - Hero Pozadina
            </CardTitle>
            <CardDescription>Dodajte blagu pozadinsku sliku u hero sekciju Custom 3 Cyan template-a</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="custom3-bg-toggle" className="text-base font-medium cursor-pointer">
                  Omogući pozadinsku sliku
                </Label>
                <p className="text-sm text-muted-foreground">
                  Prikazuje blagu pozadinsku sliku iza hero sekcije
                </p>
              </div>
              <Switch
                id="custom3-bg-toggle"
                checked={custom3HeroBgEnabled}
                onCheckedChange={setCustom3HeroBgEnabled}
              />
            </div>

            {custom3HeroBgEnabled && (
              <>
                {/* Image Upload */}
                <div className="space-y-4">
                  <Label>Pozadinska slika</Label>
                  <input
                    ref={custom3BgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustom3BgUpload}
                    className="hidden"
                  />
                  {custom3HeroBgImage ? (
                    <div className="relative">
                      <img
                        src={custom3HeroBgImage}
                        alt="Hero background preview"
                        className="w-full h-48 object-cover rounded-lg"
                        style={{ opacity: custom3HeroBgOpacity / 100 }}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCustom3HeroBgImage(null);
                          setCustom3HeroBgEnabled(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => custom3BgInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    >
                      <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Kliknite za upload pozadinske slike</p>
                      <p className="text-sm text-gray-400 mt-1">Preporučena veličina: 1920x1080px</p>
                    </div>
                  )}
                  {uploadingCustom3Bg && <p className="text-sm text-muted-foreground">Uploadujem...</p>}
                </div>

                {/* Opacity Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="opacity-slider">Opacity (Prozirnost)</Label>
                    <span className="text-sm font-medium text-muted-foreground">{custom3HeroBgOpacity}%</span>
                  </div>
                  <input
                    id="opacity-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={custom3HeroBgOpacity}
                    onChange={(e) => setCustom3HeroBgOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Potpuno prozirno</span>
                    <span>Blago vidljivo</span>
                    <span>Potpuno vidljivo</span>
                  </div>
                </div>

                {/* Preview */}
                {custom3HeroBgImage && (
                  <div className="space-y-2">
                    <Label>Pregled</Label>
                    <div 
                      className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center"
                    >
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${custom3HeroBgImage})`,
                          opacity: custom3HeroBgOpacity / 100
                        }}
                      />
                      <div className="relative z-10 text-white text-center px-4">
                        <h3 className="text-2xl font-bold mb-2">Pronađite ljekara, kliniku...</h3>
                        <p className="text-white/90">Pregled kako će izgledati hero sekcija</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium mb-2">💡 Savjeti za najbolji rezultat</p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Koristite slike sa blagim, neutralnim tonovima</li>
                    <li>• Preporučeni opacity: 15-30% za suptilan efekat</li>
                    <li>• Izbjegavajte slike sa puno detalja ili kontrasta</li>
                    <li>• Najbolje funkcionišu apstraktni paterni ili gradijenti</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TemplatePreview({ type }: { type: string }) {
  const previews: Record<string, React.ReactNode> = {
    classic: (
      <div className="w-full h-full p-2 flex flex-col gap-1">
        <div className="h-3 bg-gray-300 rounded w-1/2" />
        <div className="flex-1 flex gap-2">
          <div className="w-1/3 bg-gray-300 rounded" />
          <div className="flex-1 space-y-1">
            <div className="h-2 bg-gray-300 rounded" />
            <div className="h-2 bg-gray-300 rounded w-3/4" />
          </div>
        </div>
      </div>
    ),
    modern: (
      <div className="w-full h-full flex flex-col">
        <div className="h-1/2 bg-primary/30 rounded-t flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-full" />
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div className="h-2 bg-gray-300 rounded" />
          <div className="h-2 bg-gray-300 rounded w-2/3" />
        </div>
      </div>
    ),
    card: (
      <div className="w-full h-full p-2">
        <div className="h-full bg-gray-300 rounded-lg flex flex-col p-2">
          <div className="flex gap-2 items-center mb-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full" />
            <div className="h-2 bg-gray-400 rounded flex-1" />
          </div>
          <div className="flex-1 grid grid-cols-3 gap-1">
            <div className="bg-gray-400 rounded" />
            <div className="bg-gray-400 rounded" />
            <div className="bg-gray-400 rounded" />
          </div>
        </div>
      </div>
    ),
    minimal: (
      <div className="w-full h-full p-3 flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 bg-gray-300 rounded-full" />
        <div className="h-2 bg-gray-300 rounded w-2/3" />
        <div className="h-1 bg-gray-300 rounded w-1/2" />
      </div>
    ),
    corporate: (
      <div className="w-full h-full flex flex-col">
        <div className="h-1/3 bg-slate-700 rounded-t" />
        <div className="flex-1 p-2 space-y-1">
          <div className="h-2 bg-gray-300 rounded" />
          <div className="grid grid-cols-2 gap-1 flex-1">
            <div className="bg-gray-200 rounded" />
            <div className="bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ),
  };

  return previews[type] || previews.classic;
}

function HomepageTemplatePreview({ type }: { type: string }) {
  const previews: Record<string, React.ReactNode> = {
    soft: (
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="h-2/5 flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded" />
          <div className="w-16 h-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
            <div className="grid grid-cols-3 gap-[2px] w-full h-full p-[2px]">
              <div className="bg-purple-100 rounded-sm" />
              <div className="bg-pink-100 rounded-sm" />
              <div className="bg-rose-100 rounded-sm" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-1 space-y-1">
          <div className="grid grid-cols-4 gap-1 h-1/4">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-gradient-to-br from-pink-100 to-rose-100 rounded flex items-center justify-center text-[10px]">{['👶','📅','❤️','🧠'][i]}</div>)}
          </div>
          <div className="grid grid-cols-3 gap-1 h-1/3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded"><div className="h-1/2 bg-gradient-to-br from-purple-200 to-pink-200 rounded-t" /></div>)}
          </div>
        </div>
      </div>
    ),
    clean: (
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="h-2/5 flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-teal-600 rounded" />
          <div className="w-16 h-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
            <div className="grid grid-cols-3 gap-[2px] w-full h-full p-[2px]">
              <div className="bg-teal-100 rounded-sm" />
              <div className="bg-teal-100 rounded-sm" />
              <div className="bg-teal-100 rounded-sm" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-1 space-y-1">
          <div className="grid grid-cols-6 gap-[2px] h-1/4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded flex items-center justify-center"><div className="w-2 h-2 bg-teal-400 rounded" /></div>)}
          </div>
          <div className="grid grid-cols-3 gap-1 h-1/3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded"><div className="h-1/2 bg-teal-500 rounded-t" /></div>)}
          </div>
        </div>
      </div>
    ),
    custom: (
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-violet-100 to-cyan-100">
        <div className="h-1/3 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-t flex items-center justify-center">
          <div className="w-8 h-2 bg-white rounded" />
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div className="grid grid-cols-4 gap-1 h-1/2">
            <div className="bg-violet-200 rounded" />
            <div className="bg-cyan-200 rounded" />
            <div className="bg-violet-200 rounded" />
            <div className="bg-cyan-200 rounded" />
          </div>
          <div className="text-center text-[8px] text-violet-600 font-medium">Prilagođeno</div>
        </div>
      </div>
    ),
    'custom2-cyan': (
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="h-1/2 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-t flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-cyan-600 rounded" />
          <div className="w-16 h-3 bg-white rounded border border-cyan-200" />
        </div>
        <div className="flex-1 p-2">
          <div className="grid grid-cols-4 gap-1 h-full">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-cyan-100 rounded flex items-center justify-center"><div className="w-3 h-3 bg-cyan-500 rounded" /></div>)}
          </div>
        </div>
      </div>
    ),
    'custom2-yellow': (
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="h-1/2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-t flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-amber-500 rounded" />
          <div className="w-16 h-3 bg-white rounded border border-amber-200" />
        </div>
        <div className="flex-1 p-2">
          <div className="grid grid-cols-4 gap-1 h-full">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-amber-100 rounded flex items-center justify-center"><div className="w-3 h-3 bg-amber-500 rounded" /></div>)}
          </div>
        </div>
      </div>
    ),
    pro: (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="h-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-t flex items-center justify-center">
          <div className="w-12 h-3 bg-white rounded-lg" />
        </div>
        <div className="flex-1 p-1 space-y-1">
          <div className="grid grid-cols-4 gap-1 h-1/4">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-blue-50 rounded flex items-center justify-center"><div className="w-2 h-2 bg-blue-500 rounded" /></div>)}
          </div>
          <div className="grid grid-cols-3 gap-1 h-1/3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded overflow-hidden"><div className="h-1/2 bg-blue-400" /></div>)}
          </div>
          <div className="h-1/4 bg-blue-600 rounded" />
        </div>
      </div>
    ),
    medical: (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="h-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-t flex items-center justify-center">
          <div className="w-10 h-2 bg-white rounded" />
        </div>
        <div className="bg-white py-1 flex justify-center gap-1">
          {[...Array(4)].map((_, i) => <div key={i} className="w-4 h-3 bg-blue-100 rounded text-[6px] text-center text-blue-600">📊</div>)}
        </div>
        <div className="flex-1 p-1 space-y-1">
          <div className="grid grid-cols-4 gap-1 h-1/3">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-blue-50 rounded flex items-center justify-center"><div className="w-2 h-2 bg-blue-400 rounded" /></div>)}
          </div>
          <div className="grid grid-cols-3 gap-1 h-1/3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded" />)}
          </div>
          <div className="h-1/3 bg-gray-900 rounded flex items-center justify-center"><div className="w-3 h-3 bg-white/20 rounded-full" /></div>
        </div>
      </div>
    ),
    modern: (
      <div className="w-full h-full flex flex-col bg-slate-100">
        <div className="h-2/5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-t flex">
          <div className="w-1/2 flex items-center justify-center"><div className="w-8 h-2 bg-white rounded" /></div>
          <div className="w-1/2 flex items-center justify-center"><div className="w-8 h-8 bg-white rounded-lg" /></div>
        </div>
        <div className="flex-1 p-1 space-y-1">
          <div className="grid grid-cols-6 gap-1 h-1/4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded flex items-center justify-center"><div className="w-2 h-2 bg-emerald-400 rounded" /></div>)}
          </div>
          <div className="grid grid-cols-3 gap-1 h-1/3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded"><div className="h-1/2 bg-emerald-500 rounded-t" /></div>)}
          </div>
          <div className="h-1/4 bg-gray-900 rounded" />
        </div>
      </div>
    ),
    classic: (
      <div className="w-full h-full flex flex-col">
        <div className="h-1/3 bg-primary/40 rounded-t flex items-center justify-center">
          <div className="w-8 h-2 bg-white rounded" />
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div className="grid grid-cols-4 gap-1 h-1/2">
            <div className="bg-gray-300 rounded" />
            <div className="bg-gray-300 rounded" />
            <div className="bg-gray-300 rounded" />
            <div className="bg-gray-300 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-1 h-1/2">
            <div className="bg-gray-300 rounded" />
            <div className="bg-gray-300 rounded" />
            <div className="bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    ),
    zocdoc: (
      <div className="w-full h-full flex flex-col">
        <div className="h-1/2 bg-[#00856f]/30 rounded-t flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-[#00856f] rounded" />
          <div className="w-16 h-3 bg-white rounded border border-gray-200" />
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div className="grid grid-cols-4 gap-1 h-full">
            <div className="bg-[#f0f7f4] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#00856f]/50 rounded" />
            </div>
            <div className="bg-[#f0f7f4] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#00856f]/50 rounded" />
            </div>
            <div className="bg-[#f0f7f4] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#00856f]/50 rounded" />
            </div>
            <div className="bg-[#f0f7f4] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#00856f]/50 rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
    warm: (
      <div className="w-full h-full flex flex-col bg-[#FFFBF5]">
        <div className="h-1/2 bg-gradient-to-br from-[#FFF8E7] to-[#FEF3E2] rounded-t flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-[#C4941A] rounded" />
          <div className="w-16 h-3 bg-white rounded border border-[#E8DFD0]" />
        </div>
        <div className="flex-1 p-2">
          <div className="grid grid-cols-4 gap-1 h-full">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-[#FFF8E7] rounded flex items-center justify-center"><div className="w-3 h-3 bg-[#C4941A]/50 rounded" /></div>)}
          </div>
        </div>
      </div>
    ),
    ocean: (
      <div className="w-full h-full flex flex-col bg-[#F0F7FF]">
        <div className="h-1/2 bg-gradient-to-br from-[#E3F2FD] to-[#E8F4FD] rounded-t flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-[#2196F3] rounded" />
          <div className="w-16 h-3 bg-white rounded border border-[#E3F2FD]" />
        </div>
        <div className="flex-1 p-2">
          <div className="grid grid-cols-4 gap-1 h-full">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-[#E3F2FD] rounded flex items-center justify-center"><div className="w-3 h-3 bg-[#2196F3]/50 rounded" /></div>)}
          </div>
        </div>
      </div>
    ),
    lime: (
      <div className="w-full h-full flex flex-col bg-[#FAFFF5]">
        <div className="h-1/2 bg-gradient-to-br from-[#F0FFF0] to-[#E8F5E9] rounded-t flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-[#6B8E23] rounded" />
          <div className="w-16 h-3 bg-white rounded border border-[#E8F5E9]" />
        </div>
        <div className="flex-1 p-2">
          <div className="grid grid-cols-4 gap-1 h-full">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-[#F0FFF0] rounded flex items-center justify-center"><div className="w-3 h-3 bg-[#6B8E23]/50 rounded" /></div>)}
          </div>
        </div>
      </div>
    ),
    teal: (
      <div className="w-full h-full flex flex-col bg-[#F0FDFA]">
        <div className="h-1/2 bg-gradient-to-br from-[#E0F7FA] to-[#E0F2F1] rounded-t flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-[#00897B] rounded" />
          <div className="w-16 h-3 bg-white rounded border border-[#E0F2F1]" />
        </div>
        <div className="flex-1 p-2">
          <div className="grid grid-cols-4 gap-1 h-full">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-[#E0F2F1] rounded flex items-center justify-center"><div className="w-3 h-3 bg-[#00897B]/50 rounded" /></div>)}
          </div>
        </div>
      </div>
    ),
    rose: (
      <div className="w-full h-full flex flex-col bg-[#FFF5F5]">
        <div className="h-1/2 bg-gradient-to-br from-[#FFF0F0] to-[#FCE4EC] rounded-t flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-[#D81B60] rounded" />
          <div className="w-16 h-3 bg-white rounded border border-[#FCE4EC]" />
        </div>
        <div className="flex-1 p-2">
          <div className="grid grid-cols-4 gap-1 h-full">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-[#FCE4EC] rounded flex items-center justify-center"><div className="w-3 h-3 bg-[#D81B60]/50 rounded" /></div>)}
          </div>
        </div>
      </div>
    ),
    sunset: (
      <div className="w-full h-full flex flex-col bg-[#FFF8F0]">
        <div className="h-1/2 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] rounded-t flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-2 bg-[#E64A19] rounded" />
          <div className="w-16 h-3 bg-white rounded border border-[#FFE0B2]" />
        </div>
        <div className="flex-1 p-2">
          <div className="grid grid-cols-4 gap-1 h-full">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-[#FFF3E0] rounded flex items-center justify-center"><div className="w-3 h-3 bg-[#E64A19]/50 rounded" /></div>)}
          </div>
        </div>
      </div>
    ),
    minimal: (
      <div className="w-full h-full flex flex-col bg-white p-2">
        <div className="text-center py-3">
          <div className="w-16 h-2 bg-gray-800 rounded mx-auto mb-1" />
          <div className="w-20 h-1 bg-gray-300 rounded mx-auto" />
        </div>
        <div className="flex gap-1 justify-center mb-2">
          {[...Array(4)].map((_, i) => <div key={i} className="px-2 py-1 bg-gray-100 rounded-full"><div className="w-6 h-1 bg-gray-400 rounded" /></div>)}
        </div>
        <div className="flex-1 space-y-1">
          {[...Array(3)].map((_, i) => <div key={i} className="flex items-center gap-2 p-1 bg-gray-50 rounded"><div className="w-4 h-4 bg-gray-200 rounded-full" /><div className="flex-1 h-1 bg-gray-200 rounded" /></div>)}
        </div>
      </div>
    ),
    bold: (
      <div className="w-full h-full flex flex-col bg-gray-900">
        <div className="h-1/2 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded mx-auto mb-1" />
            <div className="w-10 h-1 bg-gray-600 rounded mx-auto" />
          </div>
        </div>
        <div className="flex-1 p-2">
          <div className="grid grid-cols-3 gap-1 h-full">
            <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded" />
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded" />
            <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded" />
          </div>
        </div>
      </div>
    ),
    cards: (
      <div className="w-full h-full bg-slate-100 p-1">
        <div className="bg-white rounded p-2 mb-1">
          <div className="w-10 h-1 bg-slate-800 rounded mb-1" />
          <div className="w-14 h-2 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-white rounded p-1 space-y-1">
            {[...Array(3)].map((_, i) => <div key={i} className="h-1 bg-slate-200 rounded" />)}
          </div>
          <div className="bg-white rounded p-1 space-y-1">
            {[...Array(2)].map((_, i) => <div key={i} className="h-1 bg-slate-200 rounded" />)}
          </div>
          <div className="bg-white rounded p-1 row-span-2 space-y-1">
            {[...Array(4)].map((_, i) => <div key={i} className="h-2 bg-slate-100 rounded" />)}
          </div>
          <div className="col-span-2 bg-slate-800 rounded p-1">
            <div className="grid grid-cols-3 gap-1 h-full">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-700 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return previews[type] || previews.classic;
}
