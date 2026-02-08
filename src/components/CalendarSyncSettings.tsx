import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Copy, RefreshCw, Check, ExternalLink, Info } from 'lucide-react';
import { calendarSyncAPI } from '@/services/api';
import { toast } from 'sonner';

interface CalendarSyncSettings {
  enabled: boolean;
  token: string;
  ical_url: string;
  google_calendar_url: string | null;
  outlook_calendar_url: string | null;
  last_synced: string | null;
  instructions: {
    google: string;
    apple: string;
    outlook: string;
  };
}

export function CalendarSyncSettings() {
  const [settings, setSettings] = useState<CalendarSyncSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [googleUrl, setGoogleUrl] = useState('');
  const [outlookUrl, setOutlookUrl] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await calendarSyncAPI.getSettings();
      setSettings(response.data);
      setGoogleUrl(response.data.google_calendar_url || '');
      setOutlookUrl(response.data.outlook_calendar_url || '');
    } catch (error) {
      console.error('Error loading calendar settings:', error);
      toast.error('Greška pri učitavanju postavki kalendara');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    setSaving(true);
    try {
      await calendarSyncAPI.updateSettings({ enabled });
      setSettings(prev => prev ? { ...prev, enabled } : null);
      toast.success(enabled ? 'Sinhronizacija kalendara uključena' : 'Sinhronizacija kalendara isključena');
    } catch (error) {
      console.error('Error toggling sync:', error);
      toast.error('Greška pri ažuriranju postavki');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUrls = async () => {
    setSaving(true);
    try {
      await calendarSyncAPI.updateSettings({
        google_calendar_url: googleUrl || null,
        outlook_calendar_url: outlookUrl || null,
      });
      toast.success('URL-ovi sačuvani');
      loadSettings();
    } catch (error) {
      console.error('Error saving URLs:', error);
      toast.error('Greška pri čuvanju URL-ova');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!confirm('Da li ste sigurni? Stari URL više neće raditi i moraćete ažurirati kalendare.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await calendarSyncAPI.regenerateToken();
      setSettings(prev => prev ? {
        ...prev,
        token: response.data.token,
        ical_url: response.data.ical_url
      } : null);
      toast.success('Token regenerisan. Ažurirajte URL u svojim kalendarima.');
    } catch (error) {
      console.error('Error regenerating token:', error);
      toast.error('Greška pri regenerisanju tokena');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('URL kopiran u clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Greška pri kopiranju');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Učitavanje...</div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">Greška pri učitavanju postavki</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sinhronizacija Kalendara
              </CardTitle>
              <CardDescription>
                Sinhronizujte svoje termine sa Google Calendar, iPhone/Apple Calendar ili Outlook
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.enabled}
                onCheckedChange={handleToggleSync}
                disabled={saving}
              />
              <Badge variant={settings.enabled ? "default" : "secondary"}>
                {settings.enabled ? 'Uključeno' : 'Isključeno'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* iCal URL */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">iCal Feed URL</Label>
            <p className="text-sm text-muted-foreground">
              Kopirajte ovaj URL i dodajte ga u svoj kalendar
            </p>
            <div className="flex gap-2">
              <Input
                value={settings.ical_url}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(settings.ical_url)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRegenerateToken}
                disabled={saving}
                title="Regeneriši token"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Last Synced */}
          {settings.last_synced && (
            <div className="text-sm text-muted-foreground">
              Posljednja sinhronizacija: {new Date(settings.last_synced).toLocaleString('bs-BA')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Google Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                <path fill="#fff" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
              </svg>
              Google Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {settings.instructions.google}
            </div>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Otvorite Google Calendar</li>
              <li>Kliknite "+" pored "Drugi kalendari"</li>
              <li>Odaberite "Sa URL-a"</li>
              <li>Zalijepite iCal URL</li>
              <li>Kliknite "Dodaj kalendar"</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://calendar.google.com', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Otvori Google Calendar
            </Button>
          </CardContent>
        </Card>

        {/* Apple Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              iPhone / Apple Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {settings.instructions.apple}
            </div>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Otvorite Settings</li>
              <li>Idite na Calendar</li>
              <li>Accounts → Add Account</li>
              <li>Other → Add Subscribed Calendar</li>
              <li>Zalijepite iCal URL</li>
            </ol>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <Info className="h-3 w-3 inline mr-1" />
              Također možete otvoriti URL u Safari browseru
            </div>
          </CardContent>
        </Card>

        {/* Outlook */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#0078D4" d="M7 4v16h10V4H7zm5 13c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
              </svg>
              Outlook Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {settings.instructions.outlook}
            </div>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Otvorite Outlook Calendar</li>
              <li>Kliknite "Dodaj kalendar"</li>
              <li>Odaberite "Sa interneta"</li>
              <li>Zalijepite iCal URL</li>
              <li>Kliknite "Uvezi"</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://outlook.live.com/calendar', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Otvori Outlook Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Optional: Save calendar URLs for reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sačuvaj URL-ove kalendara (opciono)</CardTitle>
          <CardDescription>
            Možete sačuvati URL-ove svojih kalendara za referencu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-url">Google Calendar URL</Label>
            <Input
              id="google-url"
              placeholder="https://calendar.google.com/..."
              value={googleUrl}
              onChange={(e) => setGoogleUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outlook-url">Outlook Calendar URL</Label>
            <Input
              id="outlook-url"
              placeholder="https://outlook.live.com/calendar/..."
              value={outlookUrl}
              onChange={(e) => setOutlookUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveUrls} disabled={saving}>
            Sačuvaj URL-ove
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-cyan-900 dark:text-cyan-100">
                Kako radi sinhronizacija?
              </p>
              <ul className="space-y-1 text-cyan-800 dark:text-cyan-200">
                <li>• Vaši termini se automatski sinhronizuju sa kalendarom</li>
                <li>• Kalendar se ažurira svaki put kada neko pristupi iCal URL-u</li>
                <li>• Promjene u terminima se odmah reflektuju u kalendaru</li>
                <li>• Podsjetnici se postavljaju 30 minuta prije termina</li>
                <li>• Otkazani termini se označavaju kao otkazani u kalendaru</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
