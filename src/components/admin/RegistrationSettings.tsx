import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, UserPlus, Building2, DollarSign, CheckCircle, Clock, Settings as SettingsIcon, List, FlaskConical, Droplet } from 'lucide-react';
import { RegistrationRequests } from './RegistrationRequests';
import axios from 'axios';

interface RegistrationSettings {
  doctor_registration_enabled: boolean;
  doctor_registration_free: boolean;
  doctor_registration_price: number;
  doctor_auto_approve: boolean;
  clinic_registration_enabled: boolean;
  clinic_registration_free: boolean;
  clinic_registration_price: number;
  clinic_auto_approve: boolean;
  laboratory_registration_enabled: boolean;
  laboratory_registration_free: boolean;
  laboratory_registration_price: number;
  laboratory_auto_approve: boolean;
  spa_registration_enabled: boolean;
  spa_registration_free: boolean;
  spa_registration_price: number;
  spa_auto_approve: boolean;
  max_verification_attempts: number;
  verification_expiry_days: number;
}

export function RegistrationSettings() {
  const [settings, setSettings] = useState<RegistrationSettings>({
    doctor_registration_enabled: true,
    doctor_registration_free: true,
    doctor_registration_price: 0,
    doctor_auto_approve: false,
    clinic_registration_enabled: true,
    clinic_registration_free: true,
    clinic_registration_price: 0,
    clinic_auto_approve: false,
    laboratory_registration_enabled: true,
    laboratory_registration_free: true,
    laboratory_registration_price: 0,
    laboratory_auto_approve: false,
    spa_registration_enabled: true,
    spa_registration_free: true,
    spa_registration_price: 0,
    spa_auto_approve: false,
    max_verification_attempts: 3,
    verification_expiry_days: 7,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${API_URL}/admin/registration-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati postavke registracije',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await axios.put(`${API_URL}/admin/registration-settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Uspješno sačuvano',
        description: 'Postavke registracije su ažurirane',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće sačuvati postavke',
        variant: 'destructive',
      });
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Upravljanje Registracijom</h2>
        <p className="text-gray-600 mt-1">Postavke i zahtjevi za registraciju doktora, klinika, laboratorija i banja</p>
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

      {/* Doctor Registration Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <CardTitle>Registracija Doktora</CardTitle>
          </div>
          <CardDescription>Postavke za registraciju novih doktora na platformi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="doctor-enabled">Omogući registraciju doktora</Label>
              <p className="text-sm text-gray-500">Dozvoli novim doktorima da se registruju</p>
            </div>
            <Switch
              id="doctor-enabled"
              checked={settings.doctor_registration_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, doctor_registration_enabled: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="doctor-free">Besplatna registracija</Label>
              <p className="text-sm text-gray-500">Registracija bez naknade</p>
            </div>
            <Switch
              id="doctor-free"
              checked={settings.doctor_registration_free}
              onCheckedChange={(checked) => setSettings({ ...settings, doctor_registration_free: checked })}
              disabled={!settings.doctor_registration_enabled}
            />
          </div>

          {!settings.doctor_registration_free && (
            <div className="space-y-2">
              <Label htmlFor="doctor-price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cijena registracije (BAM)
              </Label>
              <Input
                id="doctor-price"
                type="number"
                min="0"
                step="0.01"
                value={settings.doctor_registration_price}
                onChange={(e) => setSettings({ ...settings, doctor_registration_price: parseFloat(e.target.value) || 0 })}
                disabled={!settings.doctor_registration_enabled}
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="doctor-auto-approve" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Automatsko odobravanje
              </Label>
              <p className="text-sm text-gray-500">
                {settings.doctor_registration_free 
                  ? 'Automatski odobri besplatne registracije nakon verifikacije emaila'
                  : 'Automatski odobri nakon verifikacije emaila i plaćanja'}
              </p>
            </div>
            <Switch
              id="doctor-auto-approve"
              checked={settings.doctor_auto_approve}
              onCheckedChange={(checked) => setSettings({ ...settings, doctor_auto_approve: checked })}
              disabled={!settings.doctor_registration_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clinic Registration Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle>Registracija Klinika</CardTitle>
          </div>
          <CardDescription>Postavke za registraciju novih klinika na platformi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="clinic-enabled">Omogući registraciju klinika</Label>
              <p className="text-sm text-gray-500">Dozvoli novim klinikama da se registruju</p>
            </div>
            <Switch
              id="clinic-enabled"
              checked={settings.clinic_registration_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, clinic_registration_enabled: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="clinic-free">Besplatna registracija</Label>
              <p className="text-sm text-gray-500">Registracija bez naknade</p>
            </div>
            <Switch
              id="clinic-free"
              checked={settings.clinic_registration_free}
              onCheckedChange={(checked) => setSettings({ ...settings, clinic_registration_free: checked })}
              disabled={!settings.clinic_registration_enabled}
            />
          </div>

          {!settings.clinic_registration_free && (
            <div className="space-y-2">
              <Label htmlFor="clinic-price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cijena registracije (BAM)
              </Label>
              <Input
                id="clinic-price"
                type="number"
                min="0"
                step="0.01"
                value={settings.clinic_registration_price}
                onChange={(e) => setSettings({ ...settings, clinic_registration_price: parseFloat(e.target.value) || 0 })}
                disabled={!settings.clinic_registration_enabled}
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="clinic-auto-approve" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Automatsko odobravanje
              </Label>
              <p className="text-sm text-gray-500">
                {settings.clinic_registration_free 
                  ? 'Automatski odobri besplatne registracije nakon verifikacije emaila'
                  : 'Automatski odobri nakon verifikacije emaila i plaćanja'}
              </p>
            </div>
            <Switch
              id="clinic-auto-approve"
              checked={settings.clinic_auto_approve}
              onCheckedChange={(checked) => setSettings({ ...settings, clinic_auto_approve: checked })}
              disabled={!settings.clinic_registration_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Laboratory Registration Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            <CardTitle>Registracija Laboratorija</CardTitle>
          </div>
          <CardDescription>Postavke za registraciju novih laboratorija na platformi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="laboratory-enabled">Omogući registraciju laboratorija</Label>
              <p className="text-sm text-gray-500">Dozvoli novim laboratorijama da se registruju</p>
            </div>
            <Switch
              id="laboratory-enabled"
              checked={settings.laboratory_registration_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, laboratory_registration_enabled: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="laboratory-free">Besplatna registracija</Label>
              <p className="text-sm text-gray-500">Registracija bez naknade</p>
            </div>
            <Switch
              id="laboratory-free"
              checked={settings.laboratory_registration_free}
              onCheckedChange={(checked) => setSettings({ ...settings, laboratory_registration_free: checked })}
              disabled={!settings.laboratory_registration_enabled}
            />
          </div>

          {!settings.laboratory_registration_free && (
            <div className="space-y-2">
              <Label htmlFor="laboratory-price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cijena registracije (BAM)
              </Label>
              <Input
                id="laboratory-price"
                type="number"
                min="0"
                step="0.01"
                value={settings.laboratory_registration_price}
                onChange={(e) => setSettings({ ...settings, laboratory_registration_price: parseFloat(e.target.value) || 0 })}
                disabled={!settings.laboratory_registration_enabled}
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="laboratory-auto-approve" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Automatsko odobravanje
              </Label>
              <p className="text-sm text-gray-500">
                {settings.laboratory_registration_free 
                  ? 'Automatski odobri besplatne registracije nakon verifikacije emaila'
                  : 'Automatski odobri nakon verifikacije emaila i plaćanja'}
              </p>
            </div>
            <Switch
              id="laboratory-auto-approve"
              checked={settings.laboratory_auto_approve}
              onCheckedChange={(checked) => setSettings({ ...settings, laboratory_auto_approve: checked })}
              disabled={!settings.laboratory_registration_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Spa/Banja Registration Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-primary" />
            <CardTitle>Registracija Banja i Rehabilitacionih Centara</CardTitle>
          </div>
          <CardDescription>Postavke za registraciju novih banja i rehabilitacionih centara na platformi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="spa-enabled">Omogući registraciju banja</Label>
              <p className="text-sm text-gray-500">Dozvoli novim banjama da se registruju</p>
            </div>
            <Switch
              id="spa-enabled"
              checked={settings.spa_registration_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, spa_registration_enabled: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="spa-free">Besplatna registracija</Label>
              <p className="text-sm text-gray-500">Registracija bez naknade</p>
            </div>
            <Switch
              id="spa-free"
              checked={settings.spa_registration_free}
              onCheckedChange={(checked) => setSettings({ ...settings, spa_registration_free: checked })}
              disabled={!settings.spa_registration_enabled}
            />
          </div>

          {!settings.spa_registration_free && (
            <div className="space-y-2">
              <Label htmlFor="spa-price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cijena registracije (BAM)
              </Label>
              <Input
                id="spa-price"
                type="number"
                min="0"
                step="0.01"
                value={settings.spa_registration_price}
                onChange={(e) => setSettings({ ...settings, spa_registration_price: parseFloat(e.target.value) || 0 })}
                disabled={!settings.spa_registration_enabled}
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="spa-auto-approve" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Automatsko odobravanje
              </Label>
              <p className="text-sm text-gray-500">
                {settings.spa_registration_free 
                  ? 'Automatski odobri besplatne registracije nakon verifikacije emaila'
                  : 'Automatski odobri nakon verifikacije emaila i plaćanja'}
              </p>
            </div>
            <Switch
              id="spa-auto-approve"
              checked={settings.spa_auto_approve}
              onCheckedChange={(checked) => setSettings({ ...settings, spa_auto_approve: checked })}
              disabled={!settings.spa_registration_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle>Sigurnosne Postavke</CardTitle>
          </div>
          <CardDescription>Postavke za verifikaciju i sigurnost registracije</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max-attempts">Maksimalan broj pokušaja verifikacije</Label>
            <Input
              id="max-attempts"
              type="number"
              min="1"
              max="10"
              value={settings.max_verification_attempts}
              onChange={(e) => setSettings({ ...settings, max_verification_attempts: parseInt(e.target.value) || 3 })}
            />
            <p className="text-sm text-gray-500">Broj pokušaja prije blokiranja verifikacije</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry-days">Rok važenja verifikacionog linka (dani)</Label>
            <Input
              id="expiry-days"
              type="number"
              min="1"
              max="30"
              value={settings.verification_expiry_days}
              onChange={(e) => setSettings({ ...settings, verification_expiry_days: parseInt(e.target.value) || 7 })}
            />
            <p className="text-sm text-gray-500">Broj dana prije isteka verifikacionog linka</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Čuvanje...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Sačuvaj Postavke
            </>
          )}
        </Button>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
