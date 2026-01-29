import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Lock, Save } from 'lucide-react';
import axios from 'axios';

interface AdminProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export function AdminProfileSettings() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    current_password: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${API_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(response.data.user);
      setProfileForm({
        name: response.data.user.name,
        email: response.data.user.email,
        current_password: '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.current_password) {
      toast({
        title: 'Greška',
        description: 'Unesite trenutnu lozinku za potvrdu izmjena',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.put(`${API_URL}/admin/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(response.data.user);
      setProfileForm({
        ...profileForm,
        current_password: '',
      });

      toast({
        title: 'Uspješno',
        description: 'Profil je uspješno ažuriran',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.message || 'Nije moguće ažurirati profil';
      toast({
        title: 'Greška',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast({
        title: 'Greška',
        description: 'Lozinke se ne poklapaju',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await axios.put(`${API_URL}/admin/password`, passwordForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });

      toast({
        title: 'Uspješno',
        description: 'Lozinka je uspješno promijenjena',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      const message = error.response?.data?.message || 'Nije moguće promijeniti lozinku';
      toast({
        title: 'Greška',
        description: message,
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
        <h2 className="text-2xl font-bold text-gray-900">Postavke Profila</h2>
        <p className="text-gray-600 mt-1">
          Upravljajte svojim admin nalogom
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Lock className="w-4 h-4" />
            Lozinka
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Izmjena Profila</CardTitle>
              <CardDescription>
                Ažurirajte svoje ime i email adresu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ime</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile_current_password">Trenutna Lozinka *</Label>
                  <Input
                    id="profile_current_password"
                    type="password"
                    value={profileForm.current_password}
                    onChange={(e) => setProfileForm({ ...profileForm, current_password: e.target.value })}
                    placeholder="Unesite trenutnu lozinku za potvrdu"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Unesite trenutnu lozinku da potvrdite izmjene
                  </p>
                </div>

                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Čuvanje...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sačuvaj Izmjene
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Promjena Lozinke</CardTitle>
              <CardDescription>
                Promijenite svoju lozinku za pristup admin panelu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password_current_password">Trenutna Lozinka</Label>
                  <Input
                    id="password_current_password"
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova Lozinka</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Minimalno 12 karaktera, mora sadržati velika i mala slova, brojeve i specijalne karaktere
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password_confirmation">Potvrdi Novu Lozinku</Label>
                  <Input
                    id="new_password_confirmation"
                    type="password"
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mijenjam...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Promijeni Lozinku
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
