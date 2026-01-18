import { useState, useEffect } from 'react';
import { legalAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Cookie, Shield, FileText, Save, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LegalSettingsData {
  cookie: {
    enabled: boolean;
    text: string;
    accept_button: string;
    reject_button: string;
  };
  privacy_policy: {
    title: string;
    content: string;
  };
  terms_of_service: {
    title: string;
    content: string;
  };
}

export function LegalSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<LegalSettingsData>({
    cookie: { enabled: true, text: '', accept_button: 'Prihvati', reject_button: 'Odbij' },
    privacy_policy: { title: 'Politika privatnosti', content: '' },
    terms_of_service: { title: 'Uslovi korištenja', content: '' },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await legalAPI.getLegalSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching legal settings:', error);
      toast({ title: 'Greška', description: 'Nije moguće učitati postavke', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const saveCookieSettings = async () => {
    setSaving(true);
    try {
      await legalAPI.updateCookieSettings(settings.cookie);
      toast({ title: 'Uspjeh', description: 'Cookie postavke sačuvane' });
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće sačuvati postavke', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const savePrivacyPolicy = async () => {
    setSaving(true);
    try {
      await legalAPI.updatePrivacyPolicy(settings.privacy_policy);
      toast({ title: 'Uspjeh', description: 'Politika privatnosti sačuvana' });
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće sačuvati', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveTermsOfService = async () => {
    setSaving(true);
    try {
      await legalAPI.updateTermsOfService(settings.terms_of_service);
      toast({ title: 'Uspjeh', description: 'Uslovi korištenja sačuvani' });
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće sačuvati', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="cookie" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="cookie" className="gap-2">
          <Cookie className="h-4 w-4" />
          <span className="hidden sm:inline">Kolačići</span>
        </TabsTrigger>
        <TabsTrigger value="privacy" className="gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Privatnost</span>
        </TabsTrigger>
        <TabsTrigger value="terms" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Uslovi</span>
        </TabsTrigger>
      </TabsList>

      {/* Cookie Consent Tab */}
      <TabsContent value="cookie">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Cookie Consent Popup
            </CardTitle>
            <CardDescription>
              Postavke za popup obavještenje o kolačićima na dnu stranice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Omogući Cookie Popup</Label>
                <p className="text-sm text-muted-foreground">Prikaži obavještenje o kolačićima novim posjetiteljima</p>
              </div>
              <Switch
                checked={settings.cookie.enabled}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  cookie: { ...settings.cookie, enabled: checked }
                })}
              />
            </div>

            <div>
              <Label>Tekst obavještenja</Label>
              <Textarea
                value={settings.cookie.text}
                onChange={(e) => setSettings({
                  ...settings,
                  cookie: { ...settings.cookie, text: e.target.value }
                })}
                rows={4}
                placeholder="Koristimo kolačiće..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tekst dugmeta "Prihvati"</Label>
                <Input
                  value={settings.cookie.accept_button}
                  onChange={(e) => setSettings({
                    ...settings,
                    cookie: { ...settings.cookie, accept_button: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Tekst dugmeta "Odbij"</Label>
                <Input
                  value={settings.cookie.reject_button}
                  onChange={(e) => setSettings({
                    ...settings,
                    cookie: { ...settings.cookie, reject_button: e.target.value }
                  })}
                />
              </div>
            </div>

            <Button onClick={saveCookieSettings} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Čuvanje...' : 'Sačuvaj Cookie Postavke'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Privacy Policy Tab */}
      <TabsContent value="privacy">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Politika Privatnosti
                </CardTitle>
                <CardDescription>Sadržaj stranice politike privatnosti</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/politika-privatnosti" target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  Pregledaj
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Naslov stranice</Label>
              <Input
                value={settings.privacy_policy.title}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy_policy: { ...settings.privacy_policy, title: e.target.value }
                })}
              />
            </div>

            <div>
              <Label>Sadržaj (HTML)</Label>
              <Textarea
                value={settings.privacy_policy.content}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy_policy: { ...settings.privacy_policy, content: e.target.value }
                })}
                rows={15}
                placeholder="<h2>1. Uvod</h2><p>...</p>"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Možete koristiti HTML tagove: h2, h3, p, ul, li, a, strong, em
              </p>
            </div>

            <Button onClick={savePrivacyPolicy} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Čuvanje...' : 'Sačuvaj Politiku Privatnosti'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Terms of Service Tab */}
      <TabsContent value="terms">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uslovi Korištenja
                </CardTitle>
                <CardDescription>Sadržaj stranice uslova korištenja</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/uslovi-koristenja" target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  Pregledaj
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Naslov stranice</Label>
              <Input
                value={settings.terms_of_service.title}
                onChange={(e) => setSettings({
                  ...settings,
                  terms_of_service: { ...settings.terms_of_service, title: e.target.value }
                })}
              />
            </div>

            <div>
              <Label>Sadržaj (HTML)</Label>
              <Textarea
                value={settings.terms_of_service.content}
                onChange={(e) => setSettings({
                  ...settings,
                  terms_of_service: { ...settings.terms_of_service, content: e.target.value }
                })}
                rows={15}
                placeholder="<h2>1. Prihvatanje uslova</h2><p>...</p>"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Možete koristiti HTML tagove: h2, h3, p, ul, li, a, strong, em
              </p>
            </div>

            <Button onClick={saveTermsOfService} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Čuvanje...' : 'Sačuvaj Uslove Korištenja'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
