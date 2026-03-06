import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Save,
  UserPlus,
  Building2,
  DollarSign,
  CheckCircle,
  Clock,
  Settings as SettingsIcon,
  List,
  FlaskConical,
  Droplet,
  Home,
  Pill,
} from 'lucide-react';
import { RegistrationRequests } from './RegistrationRequests';
import axios from 'axios';

interface RegistrationSettingsState {
  doctor_registration_enabled: boolean;
  doctor_registration_free: boolean;
  doctor_registration_price: number;
  doctor_auto_approve: boolean;
  doctor_registration_message: string;

  clinic_registration_enabled: boolean;
  clinic_registration_free: boolean;
  clinic_registration_price: number;
  clinic_auto_approve: boolean;
  clinic_registration_message: string;

  laboratory_registration_enabled: boolean;
  laboratory_registration_free: boolean;
  laboratory_registration_price: number;
  laboratory_auto_approve: boolean;
  laboratory_registration_message: string;

  spa_registration_enabled: boolean;
  spa_registration_free: boolean;
  spa_registration_price: number;
  spa_auto_approve: boolean;
  spa_registration_message: string;

  care_home_registration_enabled: boolean;
  care_home_registration_free: boolean;
  care_home_registration_price: number;
  care_home_auto_approve: boolean;
  care_home_registration_message: string;

  pharmacy_registration_enabled: boolean;
  pharmacy_registration_free: boolean;
  pharmacy_registration_price: number;
  pharmacy_auto_approve: boolean;
  pharmacy_registration_message: string;

  registration_admin_email: string;
  registration_auto_approve: boolean;
  registration_require_documents: boolean;
  registration_max_attempts: number;
  registration_expiry_days: number;
}

type RegistrationTypeConfig = {
  key: 'doctor' | 'clinic' | 'laboratory' | 'spa' | 'care_home' | 'pharmacy';
  title: string;
  description: string;
  enabledLabel: string;
  enabledDescription: string;
  icon: any;
  enabledKey: keyof RegistrationSettingsState;
  freeKey: keyof RegistrationSettingsState;
  priceKey: keyof RegistrationSettingsState;
  autoApproveKey: keyof RegistrationSettingsState;
  messageKey: keyof RegistrationSettingsState;
};

const defaultSettings: RegistrationSettingsState = {
  doctor_registration_enabled: true,
  doctor_registration_free: true,
  doctor_registration_price: 0,
  doctor_auto_approve: false,
  doctor_registration_message: '',

  clinic_registration_enabled: true,
  clinic_registration_free: true,
  clinic_registration_price: 0,
  clinic_auto_approve: false,
  clinic_registration_message: '',

  laboratory_registration_enabled: true,
  laboratory_registration_free: true,
  laboratory_registration_price: 0,
  laboratory_auto_approve: false,
  laboratory_registration_message: '',

  spa_registration_enabled: true,
  spa_registration_free: true,
  spa_registration_price: 0,
  spa_auto_approve: false,
  spa_registration_message: '',

  care_home_registration_enabled: true,
  care_home_registration_free: true,
  care_home_registration_price: 0,
  care_home_auto_approve: false,
  care_home_registration_message: '',

  pharmacy_registration_enabled: true,
  pharmacy_registration_free: true,
  pharmacy_registration_price: 0,
  pharmacy_auto_approve: false,
  pharmacy_registration_message: '',

  registration_admin_email: '',
  registration_auto_approve: false,
  registration_require_documents: false,
  registration_max_attempts: 3,
  registration_expiry_days: 7,
};

const registrationTypes: RegistrationTypeConfig[] = [
  {
    key: 'doctor',
    title: 'Registracija doktora',
    description: 'Postavke za registraciju novih doktora na platformi.',
    enabledLabel: 'Omoguci registraciju doktora',
    enabledDescription: 'Dozvoli novim doktorima da se registruju.',
    icon: UserPlus,
    enabledKey: 'doctor_registration_enabled',
    freeKey: 'doctor_registration_free',
    priceKey: 'doctor_registration_price',
    autoApproveKey: 'doctor_auto_approve',
    messageKey: 'doctor_registration_message',
  },
  {
    key: 'clinic',
    title: 'Registracija klinika',
    description: 'Postavke za registraciju novih klinika na platformi.',
    enabledLabel: 'Omoguci registraciju klinika',
    enabledDescription: 'Dozvoli novim klinikama da se registruju.',
    icon: Building2,
    enabledKey: 'clinic_registration_enabled',
    freeKey: 'clinic_registration_free',
    priceKey: 'clinic_registration_price',
    autoApproveKey: 'clinic_auto_approve',
    messageKey: 'clinic_registration_message',
  },
  {
    key: 'laboratory',
    title: 'Registracija laboratorija',
    description: 'Postavke za registraciju novih laboratorija na platformi.',
    enabledLabel: 'Omoguci registraciju laboratorija',
    enabledDescription: 'Dozvoli novim laboratorijama da se registruju.',
    icon: FlaskConical,
    enabledKey: 'laboratory_registration_enabled',
    freeKey: 'laboratory_registration_free',
    priceKey: 'laboratory_registration_price',
    autoApproveKey: 'laboratory_auto_approve',
    messageKey: 'laboratory_registration_message',
  },
  {
    key: 'spa',
    title: 'Registracija banja',
    description: 'Postavke za registraciju novih banja i rehabilitacionih centara.',
    enabledLabel: 'Omoguci registraciju banja',
    enabledDescription: 'Dozvoli novim banjama da se registruju.',
    icon: Droplet,
    enabledKey: 'spa_registration_enabled',
    freeKey: 'spa_registration_free',
    priceKey: 'spa_registration_price',
    autoApproveKey: 'spa_auto_approve',
    messageKey: 'spa_registration_message',
  },
  {
    key: 'care_home',
    title: 'Registracija domova za njegu',
    description: 'Postavke za registraciju novih domova za njegu.',
    enabledLabel: 'Omoguci registraciju domova',
    enabledDescription: 'Dozvoli novim domovima za njegu da se registruju.',
    icon: Home,
    enabledKey: 'care_home_registration_enabled',
    freeKey: 'care_home_registration_free',
    priceKey: 'care_home_registration_price',
    autoApproveKey: 'care_home_auto_approve',
    messageKey: 'care_home_registration_message',
  },
  {
    key: 'pharmacy',
    title: 'Registracija apoteka',
    description: 'Postavke za registraciju novih apoteka i njihovih poslovnica.',
    enabledLabel: 'Omoguci registraciju apoteka',
    enabledDescription: 'Dozvoli novim apotekama da se registruju.',
    icon: Pill,
    enabledKey: 'pharmacy_registration_enabled',
    freeKey: 'pharmacy_registration_free',
    priceKey: 'pharmacy_registration_price',
    autoApproveKey: 'pharmacy_auto_approve',
    messageKey: 'pharmacy_registration_message',
  },
];

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function RegistrationSettings() {
  const [settings, setSettings] = useState<RegistrationSettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${getApiUrl()}/admin/registration-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSettings((prev) => ({
        ...prev,
        ...response.data,
      }));
    } catch (error) {
      toast({
        title: 'Greska',
        description: 'Nije moguce ucitati postavke registracije.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof RegistrationSettingsState>(
    key: K,
    value: RegistrationSettingsState[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${getApiUrl()}/admin/registration-settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: 'Uspjesno sacuvano',
        description: 'Postavke registracije su azurirane.',
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error?.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join('\n')
          : 'Nije moguce sacuvati postavke.');
      toast({
        title: 'Greska',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const cards = useMemo(() => registrationTypes, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Upravljanje registracijom</h2>
        <p className="text-gray-600 mt-1">
          Postavke i zahtjevi za registraciju svih tipova profila.
        </p>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests" className="gap-2">
            <List className="w-4 h-4" />
            Zahtjevi
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            Postavke
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <RegistrationRequests />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <CardTitle>Globalne postavke registracije</CardTitle>
              </div>
              <CardDescription>
                Opcije koje vaze za sve tipove profila.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registration-auto-approve" className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Automatsko odobravanje novih profila
                  </Label>
                  <p className="text-sm text-gray-500">
                    Ako je ukljuceno, novi profili se odobravaju nakon verifikacije emaila
                    (uz ukljucen auto-approve i za konkretan tip profila).
                  </p>
                </div>
                <Switch
                  id="registration-auto-approve"
                  checked={settings.registration_auto_approve}
                  onCheckedChange={(checked) => updateSetting('registration_auto_approve', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registration-require-documents">Trazi dokumente pri registraciji</Label>
                  <p className="text-sm text-gray-500">
                    Ukljucite ako registracija mora imati dodatne dokumente.
                  </p>
                </div>
                <Switch
                  id="registration-require-documents"
                  checked={settings.registration_require_documents}
                  onCheckedChange={(checked) => updateSetting('registration_require_documents', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="registration-admin-email">Admin email za obavijesti</Label>
                <Input
                  id="registration-admin-email"
                  type="email"
                  value={settings.registration_admin_email}
                  onChange={(e) => updateSetting('registration_admin_email', e.target.value)}
                  placeholder="admin@wizmedik.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration-max-attempts">Maksimalan broj pokusaja verifikacije</Label>
                  <Input
                    id="registration-max-attempts"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.registration_max_attempts}
                    onChange={(e) =>
                      updateSetting('registration_max_attempts', Math.max(1, parseInt(e.target.value || '1', 10)))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration-expiry-days">Rok vazenja verifikacije (dani)</Label>
                  <Input
                    id="registration-expiry-days"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.registration_expiry_days}
                    onChange={(e) =>
                      updateSetting('registration_expiry_days', Math.max(1, parseInt(e.target.value || '1', 10)))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {cards.map((config) => {
            const Icon = config.icon;
            const enabled = settings[config.enabledKey] as boolean;
            const free = settings[config.freeKey] as boolean;
            const price = settings[config.priceKey] as number;
            const autoApprove = settings[config.autoApproveKey] as boolean;
            const message = settings[config.messageKey] as string;

            return (
              <Card key={config.key}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <CardTitle>{config.title}</CardTitle>
                  </div>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{config.enabledLabel}</Label>
                      <p className="text-sm text-gray-500">{config.enabledDescription}</p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => updateSetting(config.enabledKey, checked as any)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Besplatna registracija</Label>
                      <p className="text-sm text-gray-500">Registracija bez naknade.</p>
                    </div>
                    <Switch
                      checked={free}
                      onCheckedChange={(checked) => updateSetting(config.freeKey, checked as any)}
                      disabled={!enabled}
                    />
                  </div>

                  {!free && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Cijena registracije (BAM)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) =>
                          updateSetting(config.priceKey, (parseFloat(e.target.value || '0') || 0) as any)
                        }
                        disabled={!enabled}
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Automatsko odobravanje za ovaj tip
                      </Label>
                      <p className="text-sm text-gray-500">
                        Radi samo ako je ukljuceno globalno automatsko odobravanje.
                      </p>
                    </div>
                    <Switch
                      checked={autoApprove}
                      onCheckedChange={(checked) => updateSetting(config.autoApproveKey, checked as any)}
                      disabled={!enabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Poruka na registraciji ({config.title.toLowerCase()})</Label>
                    <Textarea
                      value={message}
                      onChange={(e) => updateSetting(config.messageKey, e.target.value as any)}
                      rows={3}
                      placeholder="Opciona informativna poruka za korisnike."
                      disabled={!enabled}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cuvanje...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sacuvaj postavke
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

