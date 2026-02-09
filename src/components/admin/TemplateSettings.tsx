import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

export function TemplateSettings() {
  // Custom 3 Hero Background Settings
  const [custom3HeroBgEnabled, setCustom3HeroBgEnabled] = useState(false);
  const [custom3HeroBgImage, setCustom3HeroBgImage] = useState<string | null>(null);
  const [custom3HeroBgOpacity, setCustom3HeroBgOpacity] = useState(20);
  const [uploadingCustom3Bg, setUploadingCustom3Bg] = useState(false);

  // Doctors Split View
  const [doctorsSplitViewEnabled, setDoctorsSplitViewEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/api/settings/templates');
      const data = response.data;

      setDoctorsSplitViewEnabled(data.doctors_split_view_enabled ?? true);
      setCustom3HeroBgEnabled(data.custom3_hero_bg_enabled ?? false);
      setCustom3HeroBgImage(data.custom3_hero_bg_image ?? null);
      setCustom3HeroBgOpacity(data.custom3_hero_bg_opacity ?? 20);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Greška pri učitavanju postavki');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings/templates', {
        doctors_split_view_enabled: doctorsSplitViewEnabled,
        custom3_hero_bg_enabled: custom3HeroBgEnabled,
        custom3_hero_bg_image: custom3HeroBgImage,
        custom3_hero_bg_opacity: custom3HeroBgOpacity,
      });
      toast.success('Postavke uspješno sačuvane');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Greška pri čuvanju postavki');
    } finally {
      setSaving(false);
    }
  };

  const handleCustom3BgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Molimo odaberite sliku');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Slika je prevelika. Maksimalna veličina je 5MB');
      return;
    }

    setUploadingCustom3Bg(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'custom3-hero-bg');

    try {
      const response = await api.post('/api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCustom3HeroBgImage(response.data.url);
      toast.success('Slika uspješno uploadovana');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Greška pri uploadu slike');
    } finally {
      setUploadingCustom3Bg(false);
    }
  };

  const removeCustom3BgImage = () => {
    setCustom3HeroBgImage(null);
    toast.success('Slika uklonjena');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Učitavam postavke...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-cyan-200 bg-cyan-50/50">
        <CardHeader>
          <CardTitle className="text-cyan-900">Podešavanja Početne Stranice</CardTitle>
          <CardDescription className="text-cyan-700">
            Početna stranica koristi Custom 3 Cyan dizajn. Ovdje možete prilagoditi dodatne opcije.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Doctors Split View */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors Split View</CardTitle>
          <CardDescription>
            Prikaži doktore u split view formatu sa filterima sa lijeve strane
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="doctors-split-view" className="flex-1">
              <div className="font-medium">Omogući Split View</div>
              <div className="text-sm text-muted-foreground">
                Kada je omogućeno, doktori će biti prikazani sa filterima sa lijeve strane
              </div>
            </Label>
            <Switch
              id="doctors-split-view"
              checked={doctorsSplitViewEnabled}
              onCheckedChange={setDoctorsSplitViewEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom 3 Hero Background */}
      <Card>
        <CardHeader>
          <CardTitle>Custom 3 Hero Background</CardTitle>
          <CardDescription>
            Dodajte pozadinsku sliku hero sekciji na početnoj stranici
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="custom3-hero-bg" className="flex-1">
              <div className="font-medium">Omogući pozadinsku sliku</div>
              <div className="text-sm text-muted-foreground">
                Prikaži pozadinsku sliku u hero sekciji
              </div>
            </Label>
            <Switch
              id="custom3-hero-bg"
              checked={custom3HeroBgEnabled}
              onCheckedChange={setCustom3HeroBgEnabled}
            />
          </div>

          {/* Image Upload and Settings - Only show when enabled */}
          {custom3HeroBgEnabled && (
            <>
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Pozadinska slika</Label>
                <div className="flex items-center gap-4">
                  {custom3HeroBgImage ? (
                    <div className="relative">
                      <img
                        src={custom3HeroBgImage}
                        alt="Hero background"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        onClick={removeCustom3BgImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustom3BgUpload}
                      className="hidden"
                      id="custom3-bg-upload"
                      disabled={uploadingCustom3Bg}
                    />
                    <label htmlFor="custom3-bg-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingCustom3Bg}
                        onClick={() => document.getElementById('custom3-bg-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {custom3HeroBgImage ? 'Promijeni sliku' : 'Upload sliku'}
                      </Button>
                    </label>
                    <p className="text-sm text-gray-400 mt-1">Preporučena veličina: 1920x1080px</p>
                  </div>
                </div>
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
                    className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-r from-cyan-500 to-cyan-500 flex items-center justify-center"
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
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-cyan-800 font-medium mb-2">💡 Savjeti za najbolji rezultat</p>
                <ul className="text-cyan-700 text-sm space-y-1">
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

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving ? 'Čuvam...' : 'Sačuvaj postavke'}
        </Button>
      </div>
    </div>
  );
}
