import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '@/services/adminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, MapPin, Phone, Plus, Search, Shield, Sparkles, Trash2, Edit } from 'lucide-react';

interface TaxonomyOption {
  id: number;
  naziv: string;
  slug?: string;
}

interface Spa {
  id: number;
  naziv: string;
  grad: string;
  regija?: string | null;
  adresa: string;
  telefon?: string | null;
  email?: string | null;
  opis?: string | null;
  aktivan: boolean;
  verifikovan: boolean;
  user?: {
    id: number;
    email: string;
  } | null;
  vrste?: TaxonomyOption[];
  indikacije?: TaxonomyOption[];
  terapije?: TaxonomyOption[];
}

interface SpaFilterOptions {
  vrste: TaxonomyOption[];
  indikacije: TaxonomyOption[];
  terapije: TaxonomyOption[];
}

interface SpaFormState {
  naziv: string;
  grad: string;
  regija: string;
  adresa: string;
  telefon: string;
  email: string;
  website: string;
  opis: string;
  detaljni_opis: string;
  medicinski_nadzor: boolean;
  fizijatar_prisutan: boolean;
  ima_smjestaj: boolean;
  broj_kreveta: string;
  online_rezervacija: boolean;
  online_upit: boolean;
  vrste: number[];
  indikacije: number[];
  terapije: number[];
  aktivan: boolean;
  verifikovan: boolean;
  account_email: string;
}

const emptyForm: SpaFormState = {
  naziv: '',
  grad: '',
  regija: '',
  adresa: '',
  telefon: '',
  email: '',
  website: '',
  opis: '',
  detaljni_opis: '',
  medicinski_nadzor: false,
  fizijatar_prisutan: false,
  ima_smjestaj: false,
  broj_kreveta: '',
  online_rezervacija: false,
  online_upit: true,
  vrste: [],
  indikacije: [],
  terapije: [],
  aktivan: true,
  verifikovan: true,
  account_email: '',
};

const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors as Record<string, string[]>;
    return Object.values(errors).flat().join('\n');
  }

  return error?.response?.data?.message || error?.message || 'Došlo je do greške';
};

const toggleArrayValue = (values: number[], id: number): number[] =>
  values.includes(id) ? values.filter((value) => value !== id) : [...values, id];

export function AdminSpasManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [spas, setSpas] = useState<Spa[]>([]);
  const [options, setOptions] = useState<SpaFilterOptions>({
    vrste: [],
    indikacije: [],
    terapije: [],
  });
  const [editingSpa, setEditingSpa] = useState<Spa | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<SpaFormState>(emptyForm);
  const [sendingInviteId, setSendingInviteId] = useState<number | null>(null);

  const filteredSpas = useMemo(() => {
    if (!searchTerm.trim()) return spas;
    const q = searchTerm.toLowerCase();

    return spas.filter((spa) =>
      spa.naziv?.toLowerCase().includes(q) ||
      spa.grad?.toLowerCase().includes(q) ||
      spa.regija?.toLowerCase().includes(q) ||
      spa.email?.toLowerCase().includes(q) ||
      spa.telefon?.toLowerCase().includes(q) ||
      spa.user?.email?.toLowerCase().includes(q)
    );
  }, [spas, searchTerm]);

  useEffect(() => {
    void Promise.all([fetchSpas(), fetchOptions()]);
  }, []);

  const fetchSpas = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSpas({ per_page: 100 });
      const payload = response?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setSpas(list);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await adminAPI.get('/banje/filter-options');
      const payload = response?.data?.data || {};
      setOptions({
        vrste: Array.isArray(payload?.vrste) ? payload.vrste : [],
        indikacije: Array.isArray(payload?.indikacije) ? payload.indikacije : [],
        terapije: Array.isArray(payload?.terapije) ? payload.terapije : [],
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setEditingSpa(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = async (spa: Spa) => {
    try {
      const response = await adminAPI.getSpa(spa.id);
      const payload = response?.data;
      setEditingSpa(spa);
      setForm({
        naziv: payload?.naziv || spa.naziv || '',
        grad: payload?.grad || spa.grad || '',
        regija: payload?.regija || '',
        adresa: payload?.adresa || spa.adresa || '',
        telefon: payload?.telefon || '',
        email: payload?.email || '',
        website: payload?.website || '',
        opis: payload?.opis || '',
        detaljni_opis: payload?.detaljni_opis || '',
        medicinski_nadzor: !!payload?.medicinski_nadzor,
        fizijatar_prisutan: !!payload?.fizijatar_prisutan,
        ima_smjestaj: !!payload?.ima_smjestaj,
        broj_kreveta: payload?.broj_kreveta?.toString() || '',
        online_rezervacija: !!payload?.online_rezervacija,
        online_upit: payload?.online_upit ?? true,
        vrste: Array.isArray(payload?.vrste) ? payload.vrste.map((item: TaxonomyOption) => item.id) : [],
        indikacije: Array.isArray(payload?.indikacije) ? payload.indikacije.map((item: TaxonomyOption) => item.id) : [],
        terapije: Array.isArray(payload?.terapije) ? payload.terapije.map((item: TaxonomyOption) => item.id) : [],
        aktivan: payload?.aktivan ?? spa.aktivan ?? true,
        verifikovan: payload?.verifikovan ?? spa.verifikovan ?? true,
        account_email: payload?.user?.email || spa.user?.email || '',
      });
      setDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingSpa(null);
    setForm(emptyForm);
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {
      naziv: form.naziv.trim(),
      grad: form.grad.trim(),
      regija: form.regija.trim() || null,
      adresa: form.adresa.trim(),
      telefon: form.telefon.trim() || null,
      email: form.email.trim() || null,
      website: form.website.trim() || null,
      opis: form.opis.trim(),
      detaljni_opis: form.detaljni_opis.trim() || null,
      medicinski_nadzor: form.medicinski_nadzor,
      fizijatar_prisutan: form.fizijatar_prisutan,
      ima_smjestaj: form.ima_smjestaj,
      broj_kreveta: form.broj_kreveta.trim() ? Number(form.broj_kreveta) : null,
      online_rezervacija: form.online_rezervacija,
      online_upit: form.online_upit,
      vrste: form.vrste,
      indikacije: form.indikacije,
      terapije: form.terapije,
      aktivan: form.aktivan,
      verifikovan: form.verifikovan,
      account_email: form.account_email.trim() || null,
    };

    return payload;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = buildPayload();
      if (editingSpa) {
        await adminAPI.updateSpa(editingSpa.id, payload);
        toast({ title: 'Uspjeh', description: 'Banja je ažurirana.' });
      } else {
        await adminAPI.createSpa(payload);
        toast({ title: 'Uspjeh', description: 'Nova banja je dodana.' });
      }

      closeDialog();
      fetchSpas();
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovu banju?')) return;

    try {
      await adminAPI.deleteSpa(id);
      toast({ title: 'Uspjeh', description: 'Banja je obrisana.' });
      fetchSpas();
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (spa: Spa) => {
    try {
      await adminAPI.updateSpa(spa.id, { aktivan: !spa.aktivan });
      toast({
        title: 'Uspjeh',
        description: !spa.aktivan ? 'Banja je aktivirana.' : 'Banja je deaktivirana.',
      });
      fetchSpas();
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleSendInvite = async (spa: Spa) => {
    if (!spa.user?.email) {
      toast({
        title: 'Nedostaje pristupni email',
        description: 'Prvo sačuvajte pristupni email banje.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingInviteId(spa.id);
      await adminAPI.sendSpaInvite(spa.id);
      toast({
        title: 'Pozivnica poslana',
        description: `Email je poslan na ${spa.user.email}.`,
      });
      fetchSpas();
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setSendingInviteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Banje ({filteredSpas.length})</h2>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Nova banja
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Pretraži po nazivu, gradu, email-u..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredSpas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nema banja za prikaz.
            </CardContent>
          </Card>
        ) : (
          filteredSpas.map((spa) => (
            <Card key={spa.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{spa.naziv}</h3>
                      <Badge variant={spa.verifikovan ? 'default' : 'outline'}>
                        {spa.verifikovan ? 'Verifikovana' : 'Neverifikovana'}
                      </Badge>
                      <Badge variant={spa.aktivan ? 'default' : 'secondary'}>
                        {spa.aktivan ? 'Aktivna' : 'Neaktivna'}
                      </Badge>
                    </div>

                    <div className="grid gap-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {[spa.grad, spa.regija, spa.adresa].filter(Boolean).join(', ')}
                      </p>
                      {spa.telefon && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {spa.telefon}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Javni email: {spa.email || 'n/a'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        {spa.user?.email ? `Pristup: ${spa.user.email}` : 'Bez pristupa panelu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 mr-2">
                      <Label className="text-xs text-muted-foreground">Aktivna</Label>
                      <Switch checked={spa.aktivan} onCheckedChange={() => handleToggleActive(spa)} />
                    </div>
                    {spa.user?.email && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSendInvite(spa)}
                        disabled={sendingInviteId === spa.id}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(spa)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(spa.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSpa ? 'Uredi banju' : 'Nova banja'}</DialogTitle>
            <DialogDescription>
              Profil može biti odmah vidljiv i verifikovan, a pristup panelu dodajete tek kada ustanova preuzme nalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Naziv *</Label>
                <Input value={form.naziv} onChange={(e) => setForm((prev) => ({ ...prev, naziv: e.target.value }))} required />
              </div>
              <div>
                <Label>Grad *</Label>
                <Input value={form.grad} onChange={(e) => setForm((prev) => ({ ...prev, grad: e.target.value }))} required />
              </div>
              <div>
                <Label>Regija</Label>
                <Input value={form.regija} onChange={(e) => setForm((prev) => ({ ...prev, regija: e.target.value }))} />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input value={form.telefon} onChange={(e) => setForm((prev) => ({ ...prev, telefon: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Adresa *</Label>
                <Input value={form.adresa} onChange={(e) => setForm((prev) => ({ ...prev, adresa: e.target.value }))} required />
              </div>
              <div>
                <Label>Javni email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Kratki opis / uvod</Label>
                <Textarea rows={3} value={form.opis} onChange={(e) => setForm((prev) => ({ ...prev, opis: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <Label>Detaljni opis</Label>
                <Textarea rows={4} value={form.detaljni_opis} onChange={(e) => setForm((prev) => ({ ...prev, detaljni_opis: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Switch checked={form.medicinski_nadzor} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, medicinski_nadzor: checked }))} />
                <Label>Medicinski nadzor</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.fizijatar_prisutan} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, fizijatar_prisutan: checked }))} />
                <Label>Fizijatar prisutan</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.ima_smjestaj} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, ima_smjestaj: checked }))} />
                <Label>Ima smještaj</Label>
              </div>
              <div>
                <Label>Broj kreveta</Label>
                <Input value={form.broj_kreveta} onChange={(e) => setForm((prev) => ({ ...prev, broj_kreveta: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.online_rezervacija} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, online_rezervacija: checked }))} />
                <Label>Online rezervacija</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.online_upit} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, online_upit: checked }))} />
                <Label>Online upit</Label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Vrste</h3>
                {options.vrste.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.vrste.includes(option.id)}
                      onCheckedChange={() =>
                        setForm((prev) => ({ ...prev, vrste: toggleArrayValue(prev.vrste, option.id) }))
                      }
                    />
                    <span>{option.naziv}</span>
                  </label>
                ))}
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Indikacije</h3>
                {options.indikacije.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.indikacije.includes(option.id)}
                      onCheckedChange={() =>
                        setForm((prev) => ({ ...prev, indikacije: toggleArrayValue(prev.indikacije, option.id) }))
                      }
                    />
                    <span>{option.naziv}</span>
                  </label>
                ))}
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Terapije</h3>
                {options.terapije.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.terapije.includes(option.id)}
                      onCheckedChange={() =>
                        setForm((prev) => ({ ...prev, terapije: toggleArrayValue(prev.terapije, option.id) }))
                      }
                    />
                    <span>{option.naziv}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <h3 className="font-medium">Pristup panelu</h3>
              <div>
                <div>
                  <Label>Pristupni email</Label>
                  <Input
                    type="email"
                    value={form.account_email}
                    onChange={(e) => setForm((prev) => ({ ...prev, account_email: e.target.value }))}
                    placeholder="Dodajte kada banja preuzima panel"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Lozinku ne postavlja admin. Nakon spremanja pristupnog emaila posaljite pozivnicu iz liste, a banja ce sama aktivirati pristup.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.verifikovan} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, verifikovan: checked }))} />
                <Label>Odmah verifikovana</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.aktivan} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, aktivan: checked }))} />
                <Label>Aktivna</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Spremanje...' : editingSpa ? 'Sačuvaj izmjene' : 'Kreiraj banju'}
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Otkaži
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
