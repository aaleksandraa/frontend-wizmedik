import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Check, Copy, ExternalLink, Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { calendarSyncAPI } from "@/services/api";

interface CalendarSyncSettingsData {
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
  const [settings, setSettings] = useState<CalendarSyncSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [googleUrl, setGoogleUrl] = useState("");
  const [outlookUrl, setOutlookUrl] = useState("");

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await calendarSyncAPI.getSettings();
      setSettings(response.data);
      setGoogleUrl(response.data.google_calendar_url || "");
      setOutlookUrl(response.data.outlook_calendar_url || "");
    } catch (error) {
      console.error("Error loading calendar settings:", error);
      toast.error("Greska pri ucitavanju postavki kalendara");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    setSaving(true);
    try {
      await calendarSyncAPI.updateSettings({ enabled });
      setSettings((prev) => (prev ? { ...prev, enabled } : null));
      toast.success(enabled ? "Sinhronizacija je ukljucena" : "Sinhronizacija je iskljucena");
    } catch (error) {
      console.error("Error toggling sync:", error);
      toast.error("Greska pri azuriranju postavki");
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
      toast.success("URL-ovi su sacuvani");
      await loadSettings();
    } catch (error) {
      console.error("Error saving URLs:", error);
      toast.error("Greska pri cuvanju URL-ova");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateToken = async () => {
    const shouldContinue = window.confirm(
      "Da li ste sigurni? Stari URL vise nece raditi i moracete azurirati kalendare."
    );

    if (!shouldContinue) {
      return;
    }

    setSaving(true);
    try {
      const response = await calendarSyncAPI.regenerateToken();
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              token: response.data.token,
              ical_url: response.data.ical_url,
              enabled: Boolean(response.data.enabled),
            }
          : null
      );
      toast.success("Token je regenerisan. Azurirajte URL u svojim kalendarima.");
    } catch (error) {
      console.error("Error regenerating token:", error);
      toast.error("Greska pri regenerisanju tokena");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!settings?.enabled) {
      toast.error("Prvo ukljucite sinhronizaciju kalendara");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("URL je kopiran");
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard error:", error);
      toast.error("Greska pri kopiranju");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Ucitavanje...</div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">Greska pri ucitavanju postavki</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sinhronizacija Kalendara
              </CardTitle>
              <CardDescription>
                Sinhronizujte termine sa Google Calendar, Apple Calendar i Outlook.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={settings.enabled} onCheckedChange={handleToggleSync} disabled={saving} />
              <Badge variant={settings.enabled ? "default" : "secondary"}>
                {settings.enabled ? "Ukljuceno" : "Iskljuceno"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!settings.enabled && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Sinhronizacija je iskljucena. iCal URL ce vracati 404 dok je ova opcija ugasena.
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-base font-semibold">iCal Feed URL</Label>
            <p className="text-sm text-muted-foreground">
              Kopirajte ovaj URL i dodajte ga kao subscribed calendar.
            </p>
            <div className="flex gap-2">
              <Input value={settings.ical_url} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => void copyToClipboard(settings.ical_url)}
                disabled={!settings.enabled}
                title={settings.enabled ? "Kopiraj URL" : "Ukljucite sinhronizaciju"}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(settings.ical_url, "_blank")}
                disabled={!settings.enabled}
                title={settings.enabled ? "Testiraj URL" : "Ukljucite sinhronizaciju"}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => void handleRegenerateToken()}
                disabled={saving}
                title="Regenerisi token"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {settings.last_synced && (
            <div className="text-sm text-muted-foreground">
              Posljednja sinhronizacija: {new Date(settings.last_synced).toLocaleString("bs-BA")}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google Calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">{settings.instructions.google}</div>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Otvorite Google Calendar.</li>
              <li>Kliknite plus pored "Drugi kalendari".</li>
              <li>Izaberite "Sa URL-a".</li>
              <li>Zalijepite iCal URL.</li>
              <li>Kliknite "Dodaj kalendar".</li>
            </ol>
            <Button variant="outline" size="sm" className="w-full" onClick={() => window.open("https://calendar.google.com", "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Otvori Google Calendar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Apple Calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">{settings.instructions.apple}</div>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Otvorite Settings.</li>
              <li>Idite na Calendar.</li>
              <li>Accounts, pa Add Account.</li>
              <li>Other, pa Add Subscribed Calendar.</li>
              <li>Zalijepite iCal URL.</li>
            </ol>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <Info className="h-3 w-3 inline mr-1" />
              URL mozete testirati i direktno u browseru.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outlook Calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">{settings.instructions.outlook}</div>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Otvorite Outlook Calendar.</li>
              <li>Kliknite "Add calendar".</li>
              <li>Izaberite "Subscribe from web".</li>
              <li>Zalijepite iCal URL.</li>
              <li>Potvrdite import.</li>
            </ol>
            <Button variant="outline" size="sm" className="w-full" onClick={() => window.open("https://outlook.live.com/calendar", "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Otvori Outlook Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sacuvaj URL-ove kalendara (opciono)</CardTitle>
          <CardDescription>Mozete sacuvati URL-ove svojih kalendara radi evidencije.</CardDescription>
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
          <Button onClick={() => void handleSaveUrls()} disabled={saving}>
            Sacuvaj URL-ove
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-cyan-900 dark:text-cyan-100">Kako radi sinhronizacija?</p>
              <ul className="space-y-1 text-cyan-800 dark:text-cyan-200">
                <li>- Termini se citaju preko privatnog iCal linka.</li>
                <li>- Google i Outlook povlace izmjene periodicno (nije instant).</li>
                <li>- Token regeneracija odmah invalidira stari link.</li>
                <li>- Ako je sync iskljucen, URL vraca 404.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

