import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '@/services/adminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FlaskConical, Mail, MapPin, Phone, Plus, Search, Shield, Trash2, Edit } from 'lucide-react';
import { AdminImageGalleryField } from '@/components/admin/AdminImageGalleryField';
import { AdminSingleImageUploadField } from '@/components/admin/AdminSingleImageUploadField';
import { NamedWorkingHoursEditor } from '@/components/admin/NamedWorkingHoursEditor';
import {
  createDefaultNamedWorkingHours,
  NamedWorkingHours,
  normalizeNamedWorkingHours,
} from '@/components/admin/profileFormUtils';

interface Laboratory {
  id: number;
  naziv: string;
  email?: string | null;
  telefon?: string | null;
  telefon_2?: string | null;
  adresa: string;
  grad: string;
  postanski_broj?: string | null;
  opis?: string | null;
  kratak_opis?: string | null;
  website?: string | null;
  google_maps_link?: string | null;
  featured_slika?: string | null;
  profilna_slika?: string | null;
  galerija?: string[] | null;
  aktivan: boolean;
  verifikovan: boolean;
  online_rezultati?: boolean;
  prosjecno_vrijeme_rezultata?: string | null;
  user?: {
    id: number;
    email: string;
    name?: string;
    ime?: string;
    prezime?: string;
  } | null;
}

interface LaboratoryFormState {
  naziv: string;
  email: string;
  telefon: string;
  telefon_2: string;
  adresa: string;
  grad: string;
  postanski_broj: string;
  opis: string;
  kratak_opis: string;
  website: string;
  latitude: string;
  longitude: string;
  google_maps_link: string;
  online_rezultati: boolean;
  prosjecno_vrijeme_rezultata: string;
  napomena: string;
  featured_slika: string;
  profilna_slika: string;
  galerija: string[];
  radno_vrijeme: NamedWorkingHours;
  aktivan: boolean;
  verifikovan: boolean;
  account_email: string;
}

const createEmptyForm = (): LaboratoryFormState => ({
  naziv: '',
  email: '',
  telefon: '',
  telefon_2: '',
  adresa: '',
  grad: '',
  postanski_broj: '',
  opis: '',
  kratak_opis: '',
  website: '',
  latitude: '',
  longitude: '',
  google_maps_link: '',
  online_rezultati: false,
  prosjecno_vrijeme_rezultata: '',
  napomena: '',
  featured_slika: '',
  profilna_slika: '',
  galerija: [],
  radno_vrijeme: createDefaultNamedWorkingHours(),
  aktivan: true,
  verifikovan: true,
  account_email: '',
});

const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors as Record<string, string[]>;
    return Object.values(errors).flat().join('\n');
  }

  return error?.response?.data?.message || error?.message || 'Doslo je do greske';
};

export function AdminLaboratoriesManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [editingLaboratory, setEditingLaboratory] = useState<Laboratory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<LaboratoryFormState>(() => createEmptyForm());
  const [sendingInviteId, setSendingInviteId] = useState<number | null>(null);

  const filteredLaboratories = useMemo(() => {
    if (!searchTerm.trim()) return laboratories;
    const q = searchTerm.toLowerCase();

    return laboratories.filter((laboratory) =>
      laboratory.naziv?.toLowerCase().includes(q) ||
      laboratory.grad?.toLowerCase().includes(q) ||
      laboratory.adresa?.toLowerCase().includes(q) ||
      laboratory.email?.toLowerCase().includes(q) ||
      laboratory.telefon?.toLowerCase().includes(q) ||
      laboratory.user?.email?.toLowerCase().includes(q)
    );
  }, [laboratories, searchTerm]);

  useEffect(() => {
    fetchLaboratories();
  }, []);

  const fetchLaboratories = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getLaboratories({ per_page: 100 });
      const payload = response?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setLaboratories(list);
    } catch (error: any) {
      toast({
        title: 'Greska',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingLaboratory(null);
    setForm(createEmptyForm());
    setDialogOpen(true);
  };

  const openEditDialog = async (laboratory: Laboratory) => {
    try {
      const response = await adminAPI.getLaboratory(laboratory.id);
      const payload = response?.data;
      setEditingLaboratory(laboratory);
      setForm({
        naziv: payload?.naziv || laboratory.naziv || '',
        email: payload?.email || '',
        telefon: payload?.telefon || '',
        telefon_2: payload?.telefon_2 || '',
        adresa: payload?.adresa || laboratory.adresa || '',
        grad: payload?.grad || laboratory.grad || '',
        postanski_broj: payload?.postanski_broj || '',
        opis: payload?.opis || '',
        kratak_opis: payload?.kratak_opis || '',
        website: payload?.website || '',
        latitude: payload?.latitude?.toString() || '',
        longitude: payload?.longitude?.toString() || '',
        google_maps_link: payload?.google_maps_link || '',
        online_rezultati: !!payload?.online_rezultati,
        prosjecno_vrijeme_rezultata: payload?.prosjecno_vrijeme_rezultata || '',
        napomena: payload?.napomena || '',
        featured_slika: payload?.featured_slika || '',
        profilna_slika: payload?.profilna_slika || '',
        galerija: Array.isArray(payload?.galerija) ? payload.galerija : [],
        radno_vrijeme: normalizeNamedWorkingHours(payload?.radno_vrijeme),
        aktivan: payload?.aktivan ?? laboratory.aktivan ?? true,
        verifikovan: payload?.verifikovan ?? laboratory.verifikovan ?? true,
        account_email: payload?.user?.email || laboratory.user?.email || '',
      });
      setDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Greska',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingLaboratory(null);
    setForm(createEmptyForm());
  };

  const buildPayload = () => ({
    naziv: form.naziv.trim(),
    email: form.email.trim() || null,
    telefon: form.telefon.trim() || null,
    telefon_2: form.telefon_2.trim() || null,
    adresa: form.adresa.trim(),
    grad: form.grad.trim(),
    postanski_broj: form.postanski_broj.trim() || null,
    opis: form.opis.trim() || null,
    kratak_opis: form.kratak_opis.trim() || null,
    website: form.website.trim() || null,
    latitude: form.latitude.trim() ? Number(form.latitude) : null,
    longitude: form.longitude.trim() ? Number(form.longitude) : null,
    google_maps_link: form.google_maps_link.trim() || null,
    online_rezultati: form.online_rezultati,
    prosjecno_vrijeme_rezultata: form.prosjecno_vrijeme_rezultata.trim() || null,
    napomena: form.napomena.trim() || null,
    featured_slika: form.featured_slika.trim() || null,
    profilna_slika: form.profilna_slika.trim() || null,
    galerija: form.galerija,
    radno_vrijeme: form.radno_vrijeme,
    aktivan: form.aktivan,
    verifikovan: form.verifikovan,
    account_email: form.account_email.trim() || null,
  });

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = buildPayload();
      if (editingLaboratory) {
        await adminAPI.updateLaboratory(editingLaboratory.id, payload);
        toast({ title: 'Uspjeh', description: 'Laboratorija je azurirana.' });
      } else {
        await adminAPI.createLaboratory(payload);
        toast({ title: 'Uspjeh', description: 'Nova laboratorija je dodana.' });
      }

      closeDialog();
      fetchLaboratories();
    } catch (error: any) {
      toast({
        title: 'Greska',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Da li ste sigurni da zelite obrisati ovu laboratoriju?')) return;

    try {
      await adminAPI.deleteLaboratory(id);
      toast({ title: 'Uspjeh', description: 'Laboratorija je obrisana.' });
      fetchLaboratories();
    } catch (error: any) {
      toast({
        title: 'Greska',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (laboratory: Laboratory) => {
    try {
      await adminAPI.updateLaboratory(laboratory.id, {
        aktivan: !laboratory.aktivan,
      });
      toast({
        title: 'Uspjeh',
        description: !laboratory.aktivan ? 'Laboratorija je aktivirana.' : 'Laboratorija je deaktivirana.',
      });
      fetchLaboratories();
    } catch (error: any) {
      toast({
        title: 'Greska',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleSendInvite = async (laboratory: Laboratory) => {
    if (!laboratory.user?.email) {
      toast({
        title: 'Nedostaje pristupni email',
        description: 'Prvo sacuvajte pristupni email laboratorije.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingInviteId(laboratory.id);
      await adminAPI.sendLaboratoryInvite(laboratory.id);
      toast({
        title: 'Pozivnica poslana',
        description: `Email je poslan na ${laboratory.user.email}.`,
      });
      fetchLaboratories();
    } catch (error: any) {
      toast({
        title: 'Greska',
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
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Laboratorije ({filteredLaboratories.length})</h2>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Nova laboratorija
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Pretrazi po nazivu, gradu, email-u..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredLaboratories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nema laboratorija za prikaz.
            </CardContent>
          </Card>
        ) : (
          filteredLaboratories.map((laboratory) => (
            <Card key={laboratory.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{laboratory.naziv}</h3>
                      <Badge variant={laboratory.verifikovan ? 'default' : 'outline'}>
                        {laboratory.verifikovan ? 'Verifikovana' : 'Neverifikovana'}
                      </Badge>
                      <Badge variant={laboratory.aktivan ? 'default' : 'secondary'}>
                        {laboratory.aktivan ? 'Aktivna' : 'Neaktivna'}
                      </Badge>
                    </div>

                    <div className="grid gap-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {[laboratory.grad, laboratory.adresa].filter(Boolean).join(', ')}
                      </p>
                      {laboratory.telefon && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {laboratory.telefon}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Javni email: {laboratory.email || 'n/a'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        {laboratory.user?.email ? `Pristup: ${laboratory.user.email}` : 'Bez pristupa panelu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="mr-2 flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Aktivna</Label>
                      <Switch
                        checked={laboratory.aktivan}
                        onCheckedChange={() => handleToggleActive(laboratory)}
                      />
                    </div>
                    {laboratory.user?.email && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSendInvite(laboratory)}
                        disabled={sendingInviteId === laboratory.id}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(laboratory)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(laboratory.id)}>
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
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLaboratory ? 'Uredi laboratoriju' : 'Nova laboratorija'}</DialogTitle>
            <DialogDescription>
              Kreirajte javni profil odmah, a pristup panelu dodijelite kada laboratorija preuzme nalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Osnovni podaci</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Naziv *</Label>
                    <Input value={form.naziv} onChange={(e) => setForm((prev) => ({ ...prev, naziv: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Grad *</Label>
                    <Input value={form.grad} onChange={(e) => setForm((prev) => ({ ...prev, grad: e.target.value }))} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Adresa *</Label>
                    <Input value={form.adresa} onChange={(e) => setForm((prev) => ({ ...prev, adresa: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input value={form.telefon} onChange={(e) => setForm((prev) => ({ ...prev, telefon: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Dodatni telefon</Label>
                    <Input value={form.telefon_2} onChange={(e) => setForm((prev) => ({ ...prev, telefon_2: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Javni email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Postanski broj</Label>
                    <Input value={form.postanski_broj} onChange={(e) => setForm((prev) => ({ ...prev, postanski_broj: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Vrijeme rezultata</Label>
                    <Input
                      value={form.prosjecno_vrijeme_rezultata}
                      onChange={(e) => setForm((prev) => ({ ...prev, prosjecno_vrijeme_rezultata: e.target.value }))}
                      placeholder="npr. 24-48 sati"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Lokacija i pristup</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Latitude</Label>
                    <Input value={form.latitude} onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input value={form.longitude} onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Google Maps link</Label>
                    <Input
                      value={form.google_maps_link}
                      onChange={(e) => setForm((prev) => ({ ...prev, google_maps_link: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Pristupni email</Label>
                    <Input
                      type="email"
                      value={form.account_email}
                      onChange={(e) => setForm((prev) => ({ ...prev, account_email: e.target.value }))}
                      placeholder="Dodajte kada zelite ukljuciti panel"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Lozinku ne postavlja admin. Nakon spremanja pristupnog emaila posaljite pozivnicu iz liste.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <Label>Online rezultati</Label>
                    <Switch checked={form.online_rezultati} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, online_rezultati: checked }))} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <Label>Odmah verifikovana</Label>
                    <Switch checked={form.verifikovan} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, verifikovan: checked }))} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2 md:col-span-2">
                    <Label>Aktivna</Label>
                    <Switch checked={form.aktivan} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, aktivan: checked }))} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Opis profila</h3>
                <div>
                  <Label>Kratki opis</Label>
                  <Textarea rows={3} value={form.kratak_opis} onChange={(e) => setForm((prev) => ({ ...prev, kratak_opis: e.target.value }))} />
                </div>
                <div>
                  <Label>Opis</Label>
                  <Textarea rows={5} value={form.opis} onChange={(e) => setForm((prev) => ({ ...prev, opis: e.target.value }))} />
                </div>
                <div>
                  <Label>Napomena</Label>
                  <Textarea rows={3} value={form.napomena} onChange={(e) => setForm((prev) => ({ ...prev, napomena: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-4">
                <AdminSingleImageUploadField
                  label="Featured slika"
                  folder="laboratories"
                  value={form.featured_slika}
                  onChange={(value) => setForm((prev) => ({ ...prev, featured_slika: value }))}
                  description="Glavna vizualna slika laboratorije na javnom profilu."
                />
                <AdminSingleImageUploadField
                  label="Profilna slika"
                  folder="laboratories"
                  value={form.profilna_slika}
                  onChange={(value) => setForm((prev) => ({ ...prev, profilna_slika: value }))}
                  description="Slika koja moze sluziti kao prepoznatljiv thumbnail laboratorije."
                />
              </div>
            </div>

            <AdminImageGalleryField
              label="Galerija"
              folder="laboratories"
              images={form.galerija}
              onChange={(images) => setForm((prev) => ({ ...prev, galerija: images }))}
              description="Sve slike ostaju vezane za profil i nakon sto vlasnik preuzme nalog."
              maxImages={20}
            />

            <NamedWorkingHoursEditor
              value={form.radno_vrijeme}
              onChange={(value) => setForm((prev) => ({ ...prev, radno_vrijeme: value }))}
              description="Radno vrijeme se prikazuje na javnom profilu laboratorije."
            />

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Spremanje...' : editingLaboratory ? 'Sacuvaj izmjene' : 'Kreiraj laboratoriju'}
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Otkazi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
