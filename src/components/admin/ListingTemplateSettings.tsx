import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { settingsAPI } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Sparkles, LayoutGrid } from 'lucide-react';

interface TemplateSettings {
  doctors: string;
  clinics: string;
  cities: string;
  laboratories: string;
}

export function ListingTemplateSettings() {
  const [templates, setTemplates] = useState<TemplateSettings>({
    doctors: 'default',
    clinics: 'default',
    cities: 'default',
    laboratories: 'default',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all([
        settingsAPI.getListingTemplate('doctors'),
        settingsAPI.getListingTemplate('clinics'),
        settingsAPI.getListingTemplate('cities'),
        settingsAPI.getListingTemplate('laboratories'),
      ]);

      setTemplates({
        doctors: responses[0].data.template,
        clinics: responses[1].data.template,
        cities: responses[2].data.template,
        laboratories: responses[3].data.template,
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Greška pri učitavanju template-a');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: keyof TemplateSettings, template: string) => {
    try {
      setSaving(type);
      await settingsAPI.updateListingTemplate({ type, template });
      setTemplates(prev => ({ ...prev, [type]: template }));
      toast.success('Template uspješno ažuriran');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Greška pri ažuriranju template-a');
    } finally {
      setSaving(null);
    }
  };

  const templateOptions = [
    { value: 'default', label: 'Default', description: 'Klasični prikaz' },
    { value: 'soft', label: 'Soft', description: 'Moderni dizajn sa purple/pink gradijentima' },
  ];

  const listingTypes = [
    { key: 'doctors' as keyof TemplateSettings, label: 'Doktori', icon: '👨‍⚕️' },
    { key: 'clinics' as keyof TemplateSettings, label: 'Klinike', icon: '🏥' },
    { key: 'cities' as keyof TemplateSettings, label: 'Gradovi', icon: '🏙️' },
    { key: 'laboratories' as keyof TemplateSettings, label: 'Laboratorije', icon: '🔬' },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Listing Template Postavke
          </CardTitle>
          <CardDescription>
            Izaberite template za prikaz listing stranica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          Listing Template Postavke
        </CardTitle>
        <CardDescription>
          Izaberite template za prikaz listing stranica. Soft template koristi moderne purple/pink gradijente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {listingTypes.map(({ key, label, icon }) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <Label className="text-base font-medium">{label}</Label>
                <p className="text-sm text-muted-foreground">
                  Trenutni: {templateOptions.find(t => t.value === templates[key])?.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={templates[key]}
                onValueChange={(value) => handleSave(key, value)}
                disabled={saving === key}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === 'soft' && <Sparkles className="h-4 w-4 text-purple-500 inline mr-2" />}
                      {option.label} - {option.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {saving === key && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                Soft Template
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Soft template koristi moderne purple/pink/rose gradijente, blur dekoracije, 
                hover animacije i zaobljene ivice za elegantan i moderan izgled.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
