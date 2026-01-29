import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Type, Save } from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { adminAPI } from '@/services/adminApi';

export function BlogTypographySettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    h1_size: '28',
    h2_size: '24',
    h3_size: '20',
    p_size: '19',
    p_line_height: '34',
    p_color: '#555',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getBlogTypography();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching blog typography:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsAPI.updateBlogTypography(settings);
      toast({
        title: 'Uspjeh',
        description: 'Blog tipografija ažurirana',
      });
      
      // Trigger custom event to update blog styles
      window.dispatchEvent(new CustomEvent('blogTypographyUpdated', { detail: settings }));
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Greška pri ažuriranju',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Tipografija Blog Postova
        </CardTitle>
        <CardDescription>
          Podesite veličine fontova za naslove i paragraf tekst. Promjene će se primeniti na sve blog postove i editor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Headings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Naslovi</h3>
            
            <div className="space-y-2">
              <Label htmlFor="h1_size">H1 Veličina (px)</Label>
              <Input
                id="h1_size"
                type="number"
                min="12"
                max="72"
                value={settings.h1_size}
                onChange={(e) => setSettings({ ...settings, h1_size: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Preporučeno: 24-32px</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="h2_size">H2 Veličina (px)</Label>
              <Input
                id="h2_size"
                type="number"
                min="12"
                max="60"
                value={settings.h2_size}
                onChange={(e) => setSettings({ ...settings, h2_size: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Preporučeno: 20-28px</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="h3_size">H3 Veličina (px)</Label>
              <Input
                id="h3_size"
                type="number"
                min="12"
                max="48"
                value={settings.h3_size}
                onChange={(e) => setSettings({ ...settings, h3_size: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Preporučeno: 18-24px</p>
            </div>
          </div>

          {/* Paragraph */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Paragraf Tekst</h3>
            
            <div className="space-y-2">
              <Label htmlFor="p_size">Veličina Fonta (px)</Label>
              <Input
                id="p_size"
                type="number"
                min="12"
                max="32"
                value={settings.p_size}
                onChange={(e) => setSettings({ ...settings, p_size: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Preporučeno: 16-20px</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p_line_height">Line Height (px)</Label>
              <Input
                id="p_line_height"
                type="number"
                min="16"
                max="60"
                value={settings.p_line_height}
                onChange={(e) => setSettings({ ...settings, p_line_height: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Preporučeno: 24-40px</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p_color">Boja Teksta</Label>
              <div className="flex gap-2">
                <Input
                  id="p_color"
                  type="text"
                  value={settings.p_color}
                  onChange={(e) => setSettings({ ...settings, p_color: e.target.value })}
                  placeholder="#555"
                />
                <Input
                  type="color"
                  value={settings.p_color}
                  onChange={(e) => setSettings({ ...settings, p_color: e.target.value })}
                  className="w-16"
                />
              </div>
              <p className="text-xs text-muted-foreground">Hex kod boje (npr. #555)</p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-6 bg-muted/30">
          <h4 className="text-sm font-semibold mb-4 text-muted-foreground">Pregled</h4>
          <div className="space-y-4 bg-white p-6 rounded-lg">
            <h1 style={{ fontSize: `${settings.h1_size}px`, fontWeight: 700, lineHeight: 1.3 }}>
              Ovo je H1 naslov
            </h1>
            <h2 style={{ fontSize: `${settings.h2_size}px`, fontWeight: 700, lineHeight: 1.4 }}>
              Ovo je H2 naslov
            </h2>
            <h3 style={{ fontSize: `${settings.h3_size}px`, fontWeight: 600, lineHeight: 1.4 }}>
              Ovo je H3 naslov
            </h3>
            <p style={{ 
              fontSize: `${settings.p_size}px`, 
              lineHeight: `${settings.p_line_height}px`,
              color: settings.p_color 
            }}>
              Ovo je primjer paragrafa teksta. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Čuvanje...' : 'Sačuvaj Postavke'}
        </Button>
      </CardContent>
    </Card>
  );
}
