import { useState, useEffect } from 'react';
import { settingsAPI } from '@/services/api';
import { adminAPI } from '@/services/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Building2, Save, Eye } from 'lucide-react';
import { clearCardSettingsCache } from '@/hooks/useCardSettings';
import { ClinicCard } from '@/components/ClinicCard';
import { ClinicListingCard } from '@/components/ClinicListingCard';

const VARIANTS = [
  { id: 'wizmedik', name: 'wizMedik', desc: 'Moderna kartica, isti stil kao doktori' },
  { id: 'modern', name: 'Moderni', desc: 'Velika slika sa naslovom preko nje' },
  { id: 'compact', name: 'Kompaktni', desc: 'Minimalan horizontalni prikaz' },
  { id: 'horizontal', name: 'Horizontalni', desc: 'Široka kartica' },
  { id: 'minimal', name: 'Minimalni', desc: 'Samo tekst' },
  { id: 'gradient', name: 'Gradijent', desc: 'Šareni dizajn' },
];

const defaultSettings = {
  variant: 'wizmedik',
  showImage: true,
  showDescription: true,
  showAddress: true,
  showPhone: true,
  showEmail: true,
  showWebsite: true,
  showWorkingHours: true,
  showDoctorsCount: true,
  showDistance: true,
  primaryColor: '#0891b2',
  accentColor: '#8b5cf6',
};

export function ClinicCardSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getClinicCardSettings();
      if (response.data) {
        setSettings({ ...defaultSettings, ...response.data });
      }
    } catch (error) {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateClinicCardSettings(settings);
      clearCardSettingsCache();
      toast.success('Postavke sačuvane');
    } catch (error) {
      toast.error('Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  };

  const sampleClinic = {
    id: 1,
    slug: 'poliklinika-medica',
    naziv: 'Poliklinika Medica',
    opis: 'Moderna poliklinika sa najsavremenijom opremom i stručnim timom ljekara.',
    adresa: 'Titova 15',
    grad: 'Sarajevo',
    telefon: '+387 33 123 456',
    email: 'info@medica.ba',
    website: 'https://medica.ba',
    slike: [],
    radno_vrijeme: Object.fromEntries(
      ['ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota', 'nedjelja'].map((day) => [
        day,
        { open: '08:00', close: '20:00' },
      ])
    ),
    doktori: [{}, {}, {}],
    specijalnosti: [{ id: 1, naziv: 'Kardiologija' }, { id: 2, naziv: 'Interna medicina' }],
    ocjena: 4.8,
    broj_ocjena: 126,
    distance: 2.5,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Izgled kartica klinika
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Variant Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Odaberi varijantu</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {VARIANTS.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSettings({ ...settings, variant: v.id })}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    settings.variant === v.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility Toggles */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Prikaži/Sakrij elemente</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'showImage', label: 'Slika' },
                { key: 'showDescription', label: 'Opis' },
                { key: 'showAddress', label: 'Adresa' },
                { key: 'showPhone', label: 'Telefon' },
                { key: 'showEmail', label: 'Email' },
                { key: 'showWebsite', label: 'Web stranica' },
                { key: 'showWorkingHours', label: 'Radno vrijeme' },
                { key: 'showDoctorsCount', label: 'Broj doktora' },
                { key: 'showDistance', label: 'Udaljenost' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor={item.key} className="cursor-pointer">{item.label}</Label>
                  <Switch
                    id={item.key}
                    checked={(settings as any)[item.key]}
                    onCheckedChange={(v) => setSettings({ ...settings, [item.key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Boje (za Gradijent varijantu)</Label>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Label>Primarna:</Label>
                <Input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>Akcentna:</Label>
                <Input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Čuvanje...' : 'Sačuvaj postavke'}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Pregled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            {settings.variant === 'wizmedik' ? (
              <ClinicListingCard clinic={sampleClinic} settings={settings} />
            ) : (
              <ClinicCard clinic={sampleClinic} variant={settings.variant} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
