import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Check, CreditCard, Eye, Palette } from 'lucide-react';
import { DoctorCard, DoctorCardSettings as CardSettings, DOCTOR_CARD_VARIANTS } from '@/components/DoctorCard';
import { clearCardSettingsCache } from '@/hooks/useCardSettings';

const COLOR_PRESETS = [
  { name: 'Primary', primary: '#0ea5e9', accent: '#10b981' },
  { name: 'Indigo', primary: '#6366f1', accent: '#8b5cf6' },
  { name: 'Rose', primary: '#f43f5e', accent: '#ec4899' },
  { name: 'Amber', primary: '#f59e0b', accent: '#eab308' },
  { name: 'Emerald', primary: '#10b981', accent: '#14b8a6' },
  { name: 'Slate', primary: '#475569', accent: '#64748b' },
];

const sampleDoctor = {
  id: 1,
  slug: 'sample',
  ime: 'Marko',
  prezime: 'Marković',
  specijalnost: 'Kardiolog',
  grad: 'Sarajevo',
  lokacija: 'Centar',
  telefon: '+387 33 123 456',
  ocjena: 4.8,
  broj_ocjena: 124,
  prihvata_online: true,
};

export function DoctorCardSettings() {
  const [settings, setSettings] = useState<CardSettings>({
    variant: 'classic',
    showRating: true,
    showLocation: true,
    showPhone: true,
    showSpecialty: true,
    showOnlineStatus: true,
    showBookButton: true,
    primaryColor: '#0ea5e9',
    accentColor: '#10b981',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminAPI.getDoctorCardSettings();
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Error loading doctor card settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await adminAPI.updateDoctorCardSettings(settings);
      clearCardSettingsCache();
      toast.success('Postavke kartice sačuvane');
    } catch (error) {
      toast.error('Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Učitavanje...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Izgled Kartice Doktora
          </h2>
          <p className="text-muted-foreground">Prilagodite kako se prikazuju doktori u rezultatima pretrage</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Čuvanje...' : 'Sačuvaj'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6">
          {/* Variant Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stil Kartice</CardTitle>
              <CardDescription>Odaberite osnovni izgled kartice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {DOCTOR_CARD_VARIANTS.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSettings(s => ({ ...s, variant: v.id }))}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                      settings.variant === v.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {settings.variant === v.id && (
                      <Badge className="bg-primary mb-2">
                        <Check className="h-3 w-3 mr-1" /> Aktivno
                      </Badge>
                    )}
                    <h4 className="font-medium text-sm">{v.name}</h4>
                    <p className="text-xs text-muted-foreground">{v.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vidljivost Polja
              </CardTitle>
              <CardDescription>Odaberite koja polja da se prikazuju</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'showRating', label: 'Ocjena' },
                { key: 'showLocation', label: 'Lokacija' },
                { key: 'showPhone', label: 'Telefon' },
                { key: 'showSpecialty', label: 'Specijalnost' },
                { key: 'showOnlineStatus', label: 'Online status' },
                { key: 'showBookButton', label: 'Dugme za rezervaciju' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    id={key}
                    checked={settings[key as keyof CardSettings] as boolean}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, [key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Color Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Boje
              </CardTitle>
              <CardDescription>Prilagodite boje kartice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Preset boje</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSettings(s => ({ 
                        ...s, 
                        primaryColor: preset.primary, 
                        accentColor: preset.accent 
                      }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        settings.primaryColor === preset.primary 
                          ? 'border-primary' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <div className="w-4 h-4 rounded-full -ml-1" style={{ backgroundColor: preset.accent }} />
                      </div>
                      <span className="text-sm">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primarna boja</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Akcentna boja</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      id="accentColor"
                      value={settings.accentColor}
                      onChange={(e) => setSettings(s => ({ ...s, accentColor: e.target.value }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => setSettings(s => ({ ...s, accentColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Pregled</CardTitle>
              <CardDescription>Ovako će izgledati kartica doktora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-6 rounded-lg">
                <DoctorCard doctor={sampleDoctor} settings={settings} />
              </div>
              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium mb-2">Sve varijante ({DOCTOR_CARD_VARIANTS.length}):</h4>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {DOCTOR_CARD_VARIANTS.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSettings(s => ({ ...s, variant: v.id }))}
                      className={`text-left p-2 rounded text-xs ${
                        settings.variant === v.id ? 'bg-primary text-white' : 'hover:bg-muted'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
