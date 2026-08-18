import { useEffect, useState } from 'react';
import { settingsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Megaphone, Save } from 'lucide-react';
import { useAdSenseSettings } from '@/contexts/AdSenseContext';

export function AdSenseSettings() {
  const { toast } = useToast();
  const { refreshSettings } = useAdSenseSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [client, setClient] = useState('ca-pub-1407310093643341');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.getAdSenseSettings();
      setEnabled(Boolean(data?.enabled));
      setClient(data?.client || 'ca-pub-1407310093643341');
    } catch (error) {
      console.error('Error fetching AdSense settings:', error);
      toast({ title: 'Greška', description: 'Nije moguće učitati AdSense postavke', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateAdSenseSettings({ enabled });
      await refreshSettings();
      toast({
        title: 'Uspjeh',
        description: enabled ? 'AdSense oglasi su uključeni' : 'AdSense oglasi su isključeni',
      });
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće sačuvati postavke', variant: 'destructive' });
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Google AdSense oglasi
        </CardTitle>
        <CardDescription>
          Uključite ili isključite AdSense oglase ispod profila doktora, klinika, apoteka i lijekova.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor="adsense-enabled" className="text-base font-medium">
              Prikaži oglase ispod profila
            </Label>
            <p className="text-sm text-muted-foreground">
              Oglasi se prikazuju samo kada je opcija uključena i korisnik prihvati marketing kolačiće.
            </p>
          </div>
          <Switch id="adsense-enabled" checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Publisher ID:</strong> {client}
          </p>
          <p>
            <strong>Lokacije:</strong> profili doktora, klinika, apoteka i lijekova (ispod sadržaja, prije futera).
          </p>
          <p>
            <strong>Napomena:</strong> ads.txt i meta oznaka za verifikaciju su već postavljeni na sajtu.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Čuvanje...' : 'Sačuvaj postavke'}
        </Button>
      </CardContent>
    </Card>
  );
}
