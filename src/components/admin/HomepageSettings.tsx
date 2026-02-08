import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { settingsAPI } from '@/services/api';
import { Palette, Layout, Search, Users, Building2, FileText, BarChart3, Megaphone, GripVertical, Eye, EyeOff } from 'lucide-react';

interface HomepageSettingsData {
  // Colors
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  // Hero
  hero_enabled: boolean;
  hero_title: string;
  hero_subtitle: string;
  hero_background_type: string;
  hero_background_value: string;
  hero_cta_text: string;
  hero_cta_link: string;
  // Search
  search_enabled: boolean;
  search_title: string;
  search_show_specialty: boolean;
  search_show_city: boolean;
  search_show_name: boolean;
  // Doctors
  doctors_enabled: boolean;
  doctors_title: string;
  doctors_subtitle: string;
  doctors_count: number;
  doctors_display: string;
  doctors_layout: string;
  doctors_show_view_all: boolean;
  // Clinics
  clinics_enabled: boolean;
  clinics_title: string;
  clinics_subtitle: string;
  clinics_count: number;
  clinics_display: string;
  clinics_layout: string;
  clinics_show_view_all: boolean;
  // Blog
  blog_enabled: boolean;
  blog_title: string;
  blog_subtitle: string;
  blog_count: number;
  blog_display: string;
  blog_layout: string;
  blog_show_view_all: boolean;
  // Specialties
  specialties_enabled: boolean;
  specialties_title: string;
  specialties_subtitle: string;
  specialties_count: number;
  specialties_layout: string;
  // Stats
  stats_enabled: boolean;
  stats_title: string;
  stats_show_doctors: boolean;
  stats_show_clinics: boolean;
  stats_show_patients: boolean;
  stats_show_appointments: boolean;
  // CTA
  cta_enabled: boolean;
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
  cta_button_link: string;
  cta_background_type: string;
  cta_background_value: string;
  // Order
  sections_order: string[];
}

const defaultSettings: HomepageSettingsData = {
  primary_color: '#0891b2',
  secondary_color: '#8b5cf6',
  accent_color: '#10b981',
  background_color: '#ffffff',
  text_color: '#1f2937',
  hero_enabled: true,
  hero_title: 'Pronađite najboljeg doktora',
  hero_subtitle: '',
  hero_background_type: 'gradient',
  hero_background_value: '',
  hero_cta_text: 'Pretraži doktore',
  hero_cta_link: '/doktori',
  search_enabled: true,
  search_title: 'Pretraži',
  search_show_specialty: true,
  search_show_city: true,
  search_show_name: true,
  doctors_enabled: true,
  doctors_title: 'Naši doktori',
  doctors_subtitle: '',
  doctors_count: 6,
  doctors_display: 'featured',
  doctors_layout: 'grid',
  doctors_show_view_all: true,
  clinics_enabled: true,
  clinics_title: 'Klinike',
  clinics_subtitle: '',
  clinics_count: 4,
  clinics_display: 'featured',
  clinics_layout: 'grid',
  clinics_show_view_all: true,
  blog_enabled: true,
  blog_title: 'Blog',
  blog_subtitle: '',
  blog_count: 3,
  blog_display: 'latest',
  blog_layout: 'grid',
  blog_show_view_all: true,
  specialties_enabled: true,
  specialties_title: 'Specijalnosti',
  specialties_subtitle: '',
  specialties_count: 8,
  specialties_layout: 'grid',
  stats_enabled: true,
  stats_title: '',
  stats_show_doctors: true,
  stats_show_clinics: true,
  stats_show_patients: true,
  stats_show_appointments: true,
  cta_enabled: true,
  cta_title: 'Pridružite se',
  cta_subtitle: '',
  cta_button_text: 'Registrujte se',
  cta_button_link: '/registracija',
  cta_background_type: 'gradient',
  cta_background_value: '',
  sections_order: ['hero', 'search', 'doctors', 'clinics', 'specialties', 'blog', 'stats', 'cta'],
};

export default function HomepageSettings() {
  const [settings, setSettings] = useState<HomepageSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.getHomepageSettings();
      setSettings({ ...defaultSettings, ...data });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateHomepageSettings(settings);
      toast({ title: 'Uspjeh', description: 'Postavke sačuvane' });
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Greška pri čuvanju', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<HomepageSettingsData>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
      <div className="flex-1">
        <Label className="text-sm">{label}</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
      </div>
    </div>
  );

  const SectionToggle = ({ label, enabled, onToggle, icon: Icon }: { label: string; enabled: boolean; onToggle: () => void; icon: any }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {enabled ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center">Učitavanje...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Podešavanja početne stranice</h2>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Čuvanje...' : 'Sačuvaj promjene'}</Button>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="colors"><Palette className="w-4 h-4 mr-1" />Boje</TabsTrigger>
          <TabsTrigger value="hero"><Layout className="w-4 h-4 mr-1" />Hero</TabsTrigger>
          <TabsTrigger value="search"><Search className="w-4 h-4 mr-1" />Pretraga</TabsTrigger>
          <TabsTrigger value="doctors"><Users className="w-4 h-4 mr-1" />Doktori</TabsTrigger>
          <TabsTrigger value="clinics"><Building2 className="w-4 h-4 mr-1" />Klinike</TabsTrigger>
          <TabsTrigger value="blog"><FileText className="w-4 h-4 mr-1" />Blog</TabsTrigger>
          <TabsTrigger value="stats"><BarChart3 className="w-4 h-4 mr-1" />Statistika</TabsTrigger>
          <TabsTrigger value="cta"><Megaphone className="w-4 h-4 mr-1" />CTA</TabsTrigger>
        </TabsList>

        {/* COLORS TAB */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Globalne boje</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ColorInput label="Primarna boja" value={settings.primary_color} onChange={(v) => updateSettings({ primary_color: v })} />
              <ColorInput label="Sekundarna boja" value={settings.secondary_color} onChange={(v) => updateSettings({ secondary_color: v })} />
              <ColorInput label="Akcentna boja" value={settings.accent_color} onChange={(v) => updateSettings({ accent_color: v })} />
              <ColorInput label="Pozadinska boja" value={settings.background_color} onChange={(v) => updateSettings({ background_color: v })} />
              <ColorInput label="Boja teksta" value={settings.text_color} onChange={(v) => updateSettings({ text_color: v })} />
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Pregled sekcija</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SectionToggle label="Hero sekcija" enabled={settings.hero_enabled} onToggle={() => updateSettings({ hero_enabled: !settings.hero_enabled })} icon={Layout} />
              <SectionToggle label="Pretraga" enabled={settings.search_enabled} onToggle={() => updateSettings({ search_enabled: !settings.search_enabled })} icon={Search} />
              <SectionToggle label="Doktori" enabled={settings.doctors_enabled} onToggle={() => updateSettings({ doctors_enabled: !settings.doctors_enabled })} icon={Users} />
              <SectionToggle label="Klinike" enabled={settings.clinics_enabled} onToggle={() => updateSettings({ clinics_enabled: !settings.clinics_enabled })} icon={Building2} />
              <SectionToggle label="Specijalnosti" enabled={settings.specialties_enabled} onToggle={() => updateSettings({ specialties_enabled: !settings.specialties_enabled })} icon={Layout} />
              <SectionToggle label="Blog" enabled={settings.blog_enabled} onToggle={() => updateSettings({ blog_enabled: !settings.blog_enabled })} icon={FileText} />
              <SectionToggle label="Statistika" enabled={settings.stats_enabled} onToggle={() => updateSettings({ stats_enabled: !settings.stats_enabled })} icon={BarChart3} />
              <SectionToggle label="CTA" enabled={settings.cta_enabled} onToggle={() => updateSettings({ cta_enabled: !settings.cta_enabled })} icon={Megaphone} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* HERO TAB */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Hero sekcija
                <Switch checked={settings.hero_enabled} onCheckedChange={(v) => updateSettings({ hero_enabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Naslov</Label>
                <Input value={settings.hero_title} onChange={(e) => updateSettings({ hero_title: e.target.value })} placeholder="Pronađite najboljeg doktora" />
              </div>
              <div>
                <Label>Podnaslov</Label>
                <Textarea value={settings.hero_subtitle || ''} onChange={(e) => updateSettings({ hero_subtitle: e.target.value })} placeholder="Opcionalni podnaslov..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tip pozadine</Label>
                  <Select value={settings.hero_background_type} onValueChange={(v) => updateSettings({ hero_background_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradijent</SelectItem>
                      <SelectItem value="image">Slika</SelectItem>
                      <SelectItem value="color">Boja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vrijednost pozadine</Label>
                  <Input value={settings.hero_background_value || ''} onChange={(e) => updateSettings({ hero_background_value: e.target.value })} placeholder={settings.hero_background_type === 'image' ? 'URL slike' : 'CSS vrijednost'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tekst dugmeta</Label>
                  <Input value={settings.hero_cta_text} onChange={(e) => updateSettings({ hero_cta_text: e.target.value })} />
                </div>
                <div>
                  <Label>Link dugmeta</Label>
                  <Input value={settings.hero_cta_link} onChange={(e) => updateSettings({ hero_cta_link: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEARCH TAB */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pretraga
                <Switch checked={settings.search_enabled} onCheckedChange={(v) => updateSettings({ search_enabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Naslov sekcije</Label>
                <Input value={settings.search_title} onChange={(e) => updateSettings({ search_title: e.target.value })} />
              </div>
              <div className="space-y-3">
                <Label>Prikaži polja</Label>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Specijalnost</span>
                  <Switch checked={settings.search_show_specialty} onCheckedChange={(v) => updateSettings({ search_show_specialty: v })} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Grad</span>
                  <Switch checked={settings.search_show_city} onCheckedChange={(v) => updateSettings({ search_show_city: v })} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Ime doktora</span>
                  <Switch checked={settings.search_show_name} onCheckedChange={(v) => updateSettings({ search_show_name: v })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* DOCTORS TAB */}
        <TabsContent value="doctors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sekcija doktora
                <Switch checked={settings.doctors_enabled} onCheckedChange={(v) => updateSettings({ doctors_enabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Naslov</Label>
                <Input value={settings.doctors_title} onChange={(e) => updateSettings({ doctors_title: e.target.value })} />
              </div>
              <div>
                <Label>Podnaslov</Label>
                <Textarea value={settings.doctors_subtitle || ''} onChange={(e) => updateSettings({ doctors_subtitle: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Broj doktora</Label>
                  <Input type="number" min={1} max={20} value={settings.doctors_count} onChange={(e) => updateSettings({ doctors_count: parseInt(e.target.value) || 6 })} />
                </div>
                <div>
                  <Label>Prikaz</Label>
                  <Select value={settings.doctors_display} onValueChange={(v) => updateSettings({ doctors_display: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Istaknuti</SelectItem>
                      <SelectItem value="latest">Najnoviji</SelectItem>
                      <SelectItem value="random">Nasumično</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Layout</Label>
                  <Select value={settings.doctors_layout} onValueChange={(v) => updateSettings({ doctors_layout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Switch checked={settings.doctors_show_view_all} onCheckedChange={(v) => updateSettings({ doctors_show_view_all: v })} />
                    <Label>Prikaži "Vidi sve"</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLINICS TAB */}
        <TabsContent value="clinics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sekcija klinika
                <Switch checked={settings.clinics_enabled} onCheckedChange={(v) => updateSettings({ clinics_enabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Naslov</Label>
                <Input value={settings.clinics_title} onChange={(e) => updateSettings({ clinics_title: e.target.value })} />
              </div>
              <div>
                <Label>Podnaslov</Label>
                <Textarea value={settings.clinics_subtitle || ''} onChange={(e) => updateSettings({ clinics_subtitle: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Broj klinika</Label>
                  <Input type="number" min={1} max={20} value={settings.clinics_count} onChange={(e) => updateSettings({ clinics_count: parseInt(e.target.value) || 4 })} />
                </div>
                <div>
                  <Label>Prikaz</Label>
                  <Select value={settings.clinics_display} onValueChange={(v) => updateSettings({ clinics_display: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Istaknute</SelectItem>
                      <SelectItem value="latest">Najnovije</SelectItem>
                      <SelectItem value="random">Nasumično</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Layout</Label>
                  <Select value={settings.clinics_layout} onValueChange={(v) => updateSettings({ clinics_layout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Switch checked={settings.clinics_show_view_all} onCheckedChange={(v) => updateSettings({ clinics_show_view_all: v })} />
                    <Label>Prikaži "Vidi sve"</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BLOG TAB */}
        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Blog sekcija
                <Switch checked={settings.blog_enabled} onCheckedChange={(v) => updateSettings({ blog_enabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Naslov</Label>
                <Input value={settings.blog_title} onChange={(e) => updateSettings({ blog_title: e.target.value })} />
              </div>
              <div>
                <Label>Podnaslov</Label>
                <Textarea value={settings.blog_subtitle || ''} onChange={(e) => updateSettings({ blog_subtitle: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Broj članaka</Label>
                  <Input type="number" min={1} max={12} value={settings.blog_count} onChange={(e) => updateSettings({ blog_count: parseInt(e.target.value) || 3 })} />
                </div>
                <div>
                  <Label>Prikaz</Label>
                  <Select value={settings.blog_display} onValueChange={(v) => updateSettings({ blog_display: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Istaknuti</SelectItem>
                      <SelectItem value="latest">Najnoviji</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Layout</Label>
                  <Select value={settings.blog_layout} onValueChange={(v) => updateSettings({ blog_layout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">Lista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Switch checked={settings.blog_show_view_all} onCheckedChange={(v) => updateSettings({ blog_show_view_all: v })} />
                    <Label>Prikaži "Vidi sve"</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Specijalnosti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Omogući sekciju</Label>
                <Switch checked={settings.specialties_enabled} onCheckedChange={(v) => updateSettings({ specialties_enabled: v })} />
              </div>
              <div>
                <Label>Naslov</Label>
                <Input value={settings.specialties_title} onChange={(e) => updateSettings({ specialties_title: e.target.value })} />
              </div>
              <div>
                <Label>Podnaslov</Label>
                <Textarea value={settings.specialties_subtitle || ''} onChange={(e) => updateSettings({ specialties_subtitle: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Broj specijalnosti</Label>
                  <Input type="number" min={1} max={20} value={settings.specialties_count} onChange={(e) => updateSettings({ specialties_count: parseInt(e.target.value) || 8 })} />
                </div>
                <div>
                  <Label>Layout</Label>
                  <Select value={settings.specialties_layout} onValueChange={(v) => updateSettings({ specialties_layout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">Lista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* STATS TAB */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Statistika
                <Switch checked={settings.stats_enabled} onCheckedChange={(v) => updateSettings({ stats_enabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Naslov (opcionalno)</Label>
                <Input value={settings.stats_title || ''} onChange={(e) => updateSettings({ stats_title: e.target.value })} placeholder="Naši rezultati" />
              </div>
              <div className="space-y-3">
                <Label>Prikaži statistike</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Broj doktora</span>
                    <Switch checked={settings.stats_show_doctors} onCheckedChange={(v) => updateSettings({ stats_show_doctors: v })} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Broj klinika</span>
                    <Switch checked={settings.stats_show_clinics} onCheckedChange={(v) => updateSettings({ stats_show_clinics: v })} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Broj pacijenata</span>
                    <Switch checked={settings.stats_show_patients} onCheckedChange={(v) => updateSettings({ stats_show_patients: v })} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Broj termina</span>
                    <Switch checked={settings.stats_show_appointments} onCheckedChange={(v) => updateSettings({ stats_show_appointments: v })} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA TAB */}
        <TabsContent value="cta">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Call to Action
                <Switch checked={settings.cta_enabled} onCheckedChange={(v) => updateSettings({ cta_enabled: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Naslov</Label>
                <Input value={settings.cta_title} onChange={(e) => updateSettings({ cta_title: e.target.value })} />
              </div>
              <div>
                <Label>Podnaslov</Label>
                <Textarea value={settings.cta_subtitle || ''} onChange={(e) => updateSettings({ cta_subtitle: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tekst dugmeta</Label>
                  <Input value={settings.cta_button_text} onChange={(e) => updateSettings({ cta_button_text: e.target.value })} />
                </div>
                <div>
                  <Label>Link dugmeta</Label>
                  <Input value={settings.cta_button_link} onChange={(e) => updateSettings({ cta_button_link: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tip pozadine</Label>
                  <Select value={settings.cta_background_type} onValueChange={(v) => updateSettings({ cta_background_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradijent</SelectItem>
                      <SelectItem value="image">Slika</SelectItem>
                      <SelectItem value="color">Boja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vrijednost pozadine</Label>
                  <Input value={settings.cta_background_value || ''} onChange={(e) => updateSettings({ cta_background_value: e.target.value })} placeholder={settings.cta_background_type === 'image' ? 'URL slike' : 'CSS vrijednost'} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
