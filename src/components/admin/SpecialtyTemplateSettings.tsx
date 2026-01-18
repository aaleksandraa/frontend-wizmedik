import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { settingsAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Loader2, Check } from 'lucide-react';

const templates = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Tradicionalni prikaz sa kategorijama i podkategorijama u grid formatu',
    preview: '/previews/specialty-classic.png'
  },
  {
    id: 'grid',
    name: 'Grid',
    description: 'Sve specijalnosti u uniformnom grid prikazu sa ikonama',
    preview: '/previews/specialty-grid.png'
  },
  {
    id: 'list',
    name: 'List',
    description: 'Lista sa hijerarhijskim prikazom kategorija i podkategorija',
    preview: '/previews/specialty-list.png'
  },
  {
    id: 'cards',
    name: 'Cards',
    description: 'Kartice sa grupiranim podspecijalnostima',
    preview: '/previews/specialty-cards.png'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Moderni dizajn sa gradijentima i animacijama',
    preview: '/previews/specialty-modern.png'
  }
];

export function SpecialtyTemplateSettings() {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [showStats, setShowStats] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCurrentTemplate();
  }, []);

  const fetchCurrentTemplate = async () => {
    try {
      const response = await settingsAPI.getSpecialtyTemplate();
      setSelectedTemplate(response.data.template || 'classic');
      setShowStats(response.data.show_stats !== false);
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateSpecialtyTemplate(selectedTemplate, showStats);
      toast.success('Postavke su uspješno sačuvane!');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Greška pri čuvanju postavki');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template stranice Specijalnosti</CardTitle>
          <CardDescription>
            Odaberite kako će biti prikazana stranica sa svim specijalnostima
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id}>
                  <Label
                    htmlFor={template.id}
                    className={`flex flex-col cursor-pointer rounded-lg border-2 p-4 hover:border-primary transition-colors ${
                      selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <RadioGroupItem value={template.id} id={template.id} />
                      {selectedTemplate === template.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    {/* Preview placeholder */}
                    <div className="mt-4 aspect-video bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                      Preview
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {/* Stats Toggle */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-stats" className="text-base">
                  Prikaži statistiku
                </Label>
                <p className="text-sm text-muted-foreground">
                  Prikaži broj specijalista, prosječnu ocjenu i 24/7 zakazivanje na stranici specijalnosti
                </p>
              </div>
              <Switch
                id="show-stats"
                checked={showStats}
                onCheckedChange={setShowStats}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                'Sačuvaj promjene'
              )}
            </Button>
            <Button variant="outline" onClick={fetchCurrentTemplate} disabled={saving}>
              Poništi
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pregled template-a</CardTitle>
          <CardDescription>
            Posjetite stranicu Specijalnosti da vidite kako izgleda odabrani template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.open('/specijalnosti', '_blank')}>
            Otvori stranicu Specijalnosti
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
