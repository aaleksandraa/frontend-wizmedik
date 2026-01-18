import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Trash2, FileText, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

export default function GdprSettings() {
  const [password, setPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [retentionPolicy, setRetentionPolicy] = useState<any>(null);

  // Export user data
  const handleExportData = async () => {
    if (!password) {
      toast.error('Molimo unesite password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/gdpr/export', { password });
      
      // Download as JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Podaci uspješno eksportovani!');
      setPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška prilikom eksportovanja podataka.');
    } finally {
      setLoading(false);
    }
  };

  // Delete all user data
  const handleDeleteData = async () => {
    if (!password) {
      toast.error('Molimo unesite password.');
      return;
    }

    if (deleteConfirmation !== 'DELETE MY DATA') {
      toast.error('Molimo unesite tačnu potvrdu.');
      return;
    }

    if (!confirm('Da li ste SIGURNI da želite obrisati SVE svoje podatke? Ova akcija je NEPOVRATNA!')) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/gdpr/delete', {
        password,
        confirmation: deleteConfirmation,
      });

      toast.success('Svi vaši podaci su obrisani. Vaš nalog je zatvoren.');
      
      // Logout and redirect
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška prilikom brisanja podataka.');
    } finally {
      setLoading(false);
    }
  };

  // Load retention policy
  const loadRetentionPolicy = async () => {
    try {
      const response = await api.get('/gdpr/retention-policy');
      setRetentionPolicy(response.data);
    } catch (error) {
      toast.error('Greška prilikom učitavanja politike.');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GDPR & Privatnost</h1>
        <p className="text-muted-foreground">
          Upravljajte svojim podacima u skladu sa GDPR propisima
        </p>
      </div>

      {/* Data Export */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Eksportuj Moje Podatke
          </CardTitle>
          <CardDescription>
            Preuzmite kopiju svih vaših podataka u JSON formatu (GDPR Pravo na Prenosivost Podataka)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="export-password">Potvrdite Password</Label>
            <Input
              id="export-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Unesite vaš password"
            />
          </div>
          <Button onClick={handleExportData} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Eksportuj Podatke
          </Button>
        </CardContent>
      </Card>

      {/* Data Retention Policy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Politika Čuvanja Podataka
          </CardTitle>
          <CardDescription>
            Saznajte koliko dugo čuvamo vaše podatke
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!retentionPolicy ? (
            <Button onClick={loadRetentionPolicy} variant="outline">
              Prikaži Politiku
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Korisnički Podaci</h4>
                  <p className="text-sm text-muted-foreground">
                    {retentionPolicy.policy.user_data.description}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Retention: {retentionPolicy.policy.user_data.retention_period}
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Termini</h4>
                  <p className="text-sm text-muted-foreground">
                    {retentionPolicy.policy.appointments.description}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Retention: {retentionPolicy.policy.appointments.retention_period}
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold">Logovi</h4>
                  <p className="text-sm text-muted-foreground">
                    {retentionPolicy.policy.logs.description}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Security: {retentionPolicy.policy.logs.security_logs} | 
                    Audit: {retentionPolicy.policy.logs.audit_logs}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Vaša Prava
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>✓ {retentionPolicy.rights.right_to_access}</li>
                  <li>✓ {retentionPolicy.rights.right_to_rectification}</li>
                  <li>✓ {retentionPolicy.rights.right_to_erasure}</li>
                  <li>✓ {retentionPolicy.rights.right_to_data_portability}</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Deletion */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Obriši Sve Moje Podatke
          </CardTitle>
          <CardDescription>
            Trajno obrišite sve svoje podatke i zatvorite nalog (GDPR Pravo na Zaborav)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>UPOZORENJE:</strong> Ova akcija je NEPOVRATNA. Svi vaši podaci će biti trajno obrisani ili anonimizirani.
              Medicinski zapisi će biti anonimizirani u skladu sa zakonom (čuvaju se 7 godina).
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="delete-password">Potvrdite Password</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Unesite vaš password"
            />
          </div>

          <div>
            <Label htmlFor="delete-confirmation">
              Unesite "DELETE MY DATA" za potvrdu
            </Label>
            <Input
              id="delete-confirmation"
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE MY DATA"
            />
          </div>

          <Button 
            onClick={handleDeleteData} 
            disabled={loading || deleteConfirmation !== 'DELETE MY DATA'}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Obriši Sve Moje Podatke
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
