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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Building2, Edit, Mail, MapPin, Phone, Pill, Plus, Search, Trash2 } from 'lucide-react';

type PharmacyStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

interface PharmacyWorkingHour {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
}

interface PharmacyOwner {
  id: number;
  name?: string;
  ime?: string;
  prezime?: string;
  email: string;
}

interface PharmacyBranch {
  id: number;
  naziv: string;
  grad_naziv?: string;
  adresa?: string;
  postanski_broj?: string;
  latitude?: number | null;
  longitude?: number | null;
  telefon?: string;
  email?: string;
  google_maps_link?: string;
  radno_vrijeme?: PharmacyWorkingHour[];
  is_24h?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
}

interface PharmacyFirm {
  id: number;
  naziv_brenda: string;
  pravni_naziv?: string | null;
  broj_licence?: string | null;
  telefon?: string | null;
  email?: string | null;
  website?: string | null;
  opis?: string | null;
  status: PharmacyStatus;
  is_active: boolean;
  poslovnice_count: number;
  owner?: PharmacyOwner | null;
  glavna_poslovnica?: PharmacyBranch | null;
}

interface PharmacyFormState {
  naziv_brenda: string;
  pravni_naziv: string;
  broj_licence: string;
  telefon: string;
  email: string;
  website: string;
  opis: string;
  status: PharmacyStatus;
  is_active: boolean;

  branch_naziv: string;
  grad: string;
  adresa: string;
  postanski_broj: string;
  latitude: string;
  longitude: string;
  google_maps_link: string;
  is_24h: boolean;
  is_verified: boolean;
  radno_vrijeme: PharmacyWorkingHour[];

  account_email: string;
}

const dayLabels: Record<number, string> = {
  1: 'Ponedjeljak',
  2: 'Utorak',
  3: 'Srijeda',
  4: 'Cetvrtak',
  5: 'Petak',
  6: 'Subota',
  7: 'Nedjelja',
};

const defaultWorkingHour = (day: number): PharmacyWorkingHour => ({
  day_of_week: day,
  open_time: day === 7 ? null : '08:00',
  close_time: day === 7 ? null : day === 6 ? '14:00' : '20:00',
  closed: day === 7,
});

const defaultWorkingHours = (): PharmacyWorkingHour[] =>
  [1, 2, 3, 4, 5, 6, 7].map((day) => defaultWorkingHour(day));

const normalizeTimeInput = (value: string | null | undefined, fallback: string): string => {
  if (!value) return fallback;
  return value.slice(0, 5);
};

const timeInputValue = (
  value: string | null | undefined,
  fallback: string,
  closed: boolean
): string => {
  if (closed && !value) return '';
  return normalizeTimeInput(value, fallback);
};

const normalizeWorkingHours = (hours?: PharmacyWorkingHour[] | null): PharmacyWorkingHour[] => {
  const byDay = new Map<number, PharmacyWorkingHour>();
  (hours || []).forEach((item) => byDay.set(item.day_of_week, item));

  return [1, 2, 3, 4, 5, 6, 7].map((day) => {
    const defaults = defaultWorkingHour(day);
    const existing = byDay.get(day);

    return {
      day_of_week: day,
      open_time: existing?.open_time ? normalizeTimeInput(existing.open_time, defaults.open_time || '08:00') : defaults.open_time,
      close_time: existing?.close_time ? normalizeTimeInput(existing.close_time, defaults.close_time || '16:00') : defaults.close_time,
      closed: existing ? Boolean(existing.closed) : defaults.closed,
    };
  });
};

const createEmptyForm = (): PharmacyFormState => ({
  naziv_brenda: '',
  pravni_naziv: '',
  broj_licence: '',
  telefon: '',
  email: '',
  website: '',
  opis: '',
  status: 'verified',
  is_active: true,

  branch_naziv: '',
  grad: '',
  adresa: '',
  postanski_broj: '',
  latitude: '',
  longitude: '',
  google_maps_link: '',
  is_24h: false,
  is_verified: true,
  radno_vrijeme: defaultWorkingHours(),

  account_email: '',
});

const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors as Record<string, string[]>;
    return Object.values(errors).flat().join('\n');
  }
  return error?.response?.data?.message || error?.message || 'Došlo je do greške';
};

const statusLabel: Record<PharmacyStatus, string> = {
  pending: 'Pending',
  verified: 'Verifikovana',
  rejected: 'Odbijena',
  suspended: 'Suspendovana',
};

const statusVariant: Record<PharmacyStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  verified: 'default',
  rejected: 'destructive',
  suspended: 'secondary',
};

const formatOwnerName = (owner?: PharmacyOwner | null): string => {
  if (!owner) return 'Nema vlasnika';
  const name = `${owner.ime || ''} ${owner.prezime || ''}`.trim();
  return name || owner.name || owner.email || 'N/A';
};

export function AdminPharmaciesManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [firms, setFirms] = useState<PharmacyFirm[]>([]);
  const [editingFirm, setEditingFirm] = useState<PharmacyFirm | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PharmacyFormState>(() => createEmptyForm());
  const [sendingInviteId, setSendingInviteId] = useState<number | null>(null);

  const filteredFirms = useMemo(() => {
    if (!searchTerm.trim()) return firms;
    const q = searchTerm.toLowerCase();
    return firms.filter((firm) => {
      return (
        firm.naziv_brenda?.toLowerCase().includes(q) ||
        firm.email?.toLowerCase().includes(q) ||
        firm.telefon?.toLowerCase().includes(q) ||
        firm.owner?.email?.toLowerCase().includes(q) ||
        firm.glavna_poslovnica?.naziv?.toLowerCase().includes(q) ||
        firm.glavna_poslovnica?.grad_naziv?.toLowerCase().includes(q) ||
        firm.glavna_poslovnica?.adresa?.toLowerCase().includes(q)
      );
    });
  }, [firms, searchTerm]);

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPharmacies({ per_page: 100 });
      const payload = response?.data;
      let list: any[] = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (Array.isArray(payload?.data)) {
        list = payload.data;
      } else if (Array.isArray(payload?.data?.data)) {
        list = payload.data.data;
      }
      setFirms(Array.isArray(list) ? list : []);
    } catch (error) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingFirm(null);
    setForm(createEmptyForm());
    setDialogOpen(true);
  };

  const openEditDialog = (firm: PharmacyFirm) => {
    const branch = firm.glavna_poslovnica || null;
    setEditingFirm(firm);
    setForm({
      naziv_brenda: firm.naziv_brenda || '',
      pravni_naziv: firm.pravni_naziv || '',
      broj_licence: firm.broj_licence || '',
      telefon: firm.telefon || '',
      email: firm.email || '',
      website: firm.website || '',
      opis: firm.opis || '',
      status: firm.status || 'verified',
      is_active: !!firm.is_active,

      branch_naziv: branch?.naziv || '',
      grad: branch?.grad_naziv || '',
      adresa: branch?.adresa || '',
      postanski_broj: branch?.postanski_broj || '',
      latitude: branch?.latitude?.toString() || '',
      longitude: branch?.longitude?.toString() || '',
      google_maps_link: branch?.google_maps_link || '',
      is_24h: !!branch?.is_24h,
      is_verified: branch?.is_verified ?? firm.status === 'verified',
      radno_vrijeme: normalizeWorkingHours(branch?.radno_vrijeme),

      account_email: firm.owner?.email || '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingFirm(null);
    setForm(createEmptyForm());
  };

  const updateWorkingHour = (day: number, updates: Partial<PharmacyWorkingHour>) => {
    setForm((prev) => ({
      ...prev,
      radno_vrijeme: prev.radno_vrijeme.map((item) =>
        item.day_of_week === day ? { ...item, ...updates } : item
      ),
    }));
  };

  const toggleWorkingDayClosed = (day: number, closed: boolean) => {
    const defaults = defaultWorkingHour(day);

    setForm((prev) => ({
      ...prev,
      radno_vrijeme: prev.radno_vrijeme.map((item) =>
        item.day_of_week === day
          ? {
              ...item,
              closed,
              open_time: closed ? null : normalizeTimeInput(item.open_time, defaults.open_time || '08:00'),
              close_time: closed ? null : normalizeTimeInput(item.close_time, defaults.close_time || '16:00'),
            }
          : item
      ),
    }));
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {
      naziv_brenda: form.naziv_brenda.trim(),
      pravni_naziv: form.pravni_naziv.trim() || null,
      broj_licence: form.broj_licence.trim() || null,
      telefon: form.telefon.trim(),
      email: form.email.trim() || null,
      website: form.website.trim() || null,
      opis: form.opis.trim() || null,
      status: form.status,
      is_active: form.is_active,

      branch_naziv: form.branch_naziv.trim() || null,
      grad: form.grad.trim(),
      adresa: form.adresa.trim(),
      postanski_broj: form.postanski_broj.trim() || null,
      latitude: form.latitude.trim() ? Number(form.latitude) : null,
      longitude: form.longitude.trim() ? Number(form.longitude) : null,
      google_maps_link: form.google_maps_link.trim() || null,
      is_24h: form.is_24h,
      is_verified: form.is_verified,
      radno_vrijeme: form.radno_vrijeme.map((item) => ({
        day_of_week: item.day_of_week,
        open_time: item.closed ? null : (item.open_time?.trim() ? item.open_time.slice(0, 5) : null),
        close_time: item.closed ? null : (item.close_time?.trim() ? item.close_time.slice(0, 5) : null),
        closed: Boolean(item.closed),
      })),

      account_email: form.account_email.trim() || null,
    };

    return payload;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingFirm) {
        await adminAPI.updatePharmacy(editingFirm.id, payload);
        toast({ title: 'Uspjeh', description: 'Apoteka je ažurirana.' });
      } else {
        await adminAPI.createPharmacy(payload);
        toast({ title: 'Uspjeh', description: 'Nova apoteka je dodana.' });
      }
      closeDialog();
      fetchFirms();
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
    if (!confirm('Da li ste sigurni da želite obrisati ovu apoteku?')) return;
    try {
      await adminAPI.deletePharmacy(id);
      toast({ title: 'Uspjeh', description: 'Apoteka je obrisana.' });
      fetchFirms();
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (firm: PharmacyFirm) => {
    try {
      await adminAPI.updatePharmacy(firm.id, {
        is_active: !firm.is_active,
      });
      toast({
        title: 'Uspjeh',
        description: !firm.is_active ? 'Apoteka je aktivirana.' : 'Apoteka je deaktivirana.',
      });
      fetchFirms();
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleSendInvite = async (firm: PharmacyFirm) => {
    if (!firm.owner?.email) {
      toast({
        title: 'Nedostaje pristupni email',
        description: 'Prvo sačuvajte pristupni email apoteke.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingInviteId(firm.id);
      await adminAPI.sendPharmacyInvite(firm.id);
      toast({
        title: 'Pozivnica poslana',
        description: `Email je poslan na ${firm.owner.email}.`,
      });
      fetchFirms();
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
          <Pill className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Apoteke ({filteredFirms.length})</h2>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Nova apoteka
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
        {filteredFirms.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nema apoteka za prikaz.
            </CardContent>
          </Card>
        ) : (
          filteredFirms.map((firm) => (
            <Card key={firm.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{firm.naziv_brenda}</h3>
                      <Badge variant={statusVariant[firm.status] || 'outline'}>
                        {statusLabel[firm.status] || firm.status}
                      </Badge>
                      <Badge variant={firm.is_active ? 'default' : 'secondary'}>
                        {firm.is_active ? 'Aktivna' : 'Neaktivna'}
                      </Badge>
                    </div>

                    <div className="grid gap-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Vlasnik: {formatOwnerName(firm.owner)} ({firm.owner?.email || 'n/a'})
                      </p>
                      {firm.telefon && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {firm.telefon}
                        </p>
                      )}
                      {firm.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          Javni email: {firm.email}
                        </p>
                      )}
                      {(firm.glavna_poslovnica?.grad_naziv || firm.glavna_poslovnica?.adresa) && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {[firm.glavna_poslovnica?.grad_naziv, firm.glavna_poslovnica?.adresa].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 mr-2">
                      <Label className="text-xs text-muted-foreground">Aktivna</Label>
                      <Switch
                        checked={firm.is_active}
                        onCheckedChange={() => handleToggleActive(firm)}
                      />
                    </div>
                    {firm.owner?.email && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSendInvite(firm)}
                        disabled={sendingInviteId === firm.id}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(firm)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(firm.id)}>
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
            <DialogTitle>{editingFirm ? 'Uredi apoteku' : 'Nova apoteka'}</DialogTitle>
            <DialogDescription>
              {editingFirm
                ? 'Ažurirajte podatke apoteke i po potrebi promijenite login email.'
                : 'Kreirajte apoteku sa vlasničkim login nalogom.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Podaci o apoteci</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Naziv brenda *</Label>
                    <Input
                      value={form.naziv_brenda}
                      onChange={(e) => setForm((prev) => ({ ...prev, naziv_brenda: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Pravni naziv</Label>
                    <Input
                      value={form.pravni_naziv}
                      onChange={(e) => setForm((prev) => ({ ...prev, pravni_naziv: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Broj licence</Label>
                    <Input
                      value={form.broj_licence}
                      onChange={(e) => setForm((prev) => ({ ...prev, broj_licence: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value: PharmacyStatus) => setForm((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verifikovana</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Odbijena</SelectItem>
                        <SelectItem value="suspended">Suspendovana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Telefon *</Label>
                    <Input
                      value={form.telefon}
                      onChange={(e) => setForm((prev) => ({ ...prev, telefon: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Javni email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Website</Label>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Opis</Label>
                    <Textarea
                      rows={3}
                      value={form.opis}
                      onChange={(e) => setForm((prev) => ({ ...prev, opis: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Korisnički pristup</h3>

                <div className="space-y-4">
                  <div>
                    <Label>Login email</Label>
                    <Input
                      type="email"
                      value={form.account_email}
                      onChange={(e) => setForm((prev) => ({ ...prev, account_email: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Promjena ovog polja omogućava dodjelu pristupa drugom korisniku.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lozinku ne postavlja admin. Nakon spremanja login emaila pošaljite pozivnicu iz liste, a vlasnik apoteke će sam postaviti lozinku.
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <Label>Aktivna apoteka</Label>
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Glavna poslovnica</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Naziv poslovnice</Label>
                  <Input
                    value={form.branch_naziv}
                    onChange={(e) => setForm((prev) => ({ ...prev, branch_naziv: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Grad *</Label>
                  <Input
                    value={form.grad}
                    onChange={(e) => setForm((prev) => ({ ...prev, grad: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Poštanski broj</Label>
                  <Input
                    value={form.postanski_broj}
                    onChange={(e) => setForm((prev) => ({ ...prev, postanski_broj: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Adresa *</Label>
                  <Input
                    value={form.adresa}
                    onChange={(e) => setForm((prev) => ({ ...prev, adresa: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Google Maps link</Label>
                  <Input
                    value={form.google_maps_link}
                    onChange={(e) => setForm((prev) => ({ ...prev, google_maps_link: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Latitude</Label>
                  <Input
                    value={form.latitude}
                    onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    value={form.longitude}
                    onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded border px-3 py-2">
                  <Label>Radi 24h</Label>
                  <Switch
                    checked={form.is_24h}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_24h: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded border px-3 py-2">
                  <Label>Poslovnica verifikovana</Label>
                  <Switch
                    checked={form.is_verified}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_verified: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-dashed p-4">
                <div>
                  <h4 className="font-medium">Radno vrijeme</h4>
                  <p className="text-sm text-muted-foreground">
                    Postavite sedmično radno vrijeme glavne poslovnice. Ovo se prikazuje na javnom profilu apoteke.
                  </p>
                </div>

                <div className="space-y-3">
                  {form.radno_vrijeme.map((hour) => {
                    const defaults = defaultWorkingHour(hour.day_of_week);

                    return (
                      <div
                        key={hour.day_of_week}
                        className="grid grid-cols-1 md:grid-cols-[140px,1fr,1fr,auto] gap-3 items-center rounded-md border p-3"
                      >
                        <Label className="font-medium">{dayLabels[hour.day_of_week]}</Label>
                        <Input
                          type="time"
                          disabled={hour.closed}
                          value={timeInputValue(hour.open_time, defaults.open_time || '08:00', hour.closed)}
                          onChange={(e) => updateWorkingHour(hour.day_of_week, { open_time: e.target.value })}
                        />
                        <Input
                          type="time"
                          disabled={hour.closed}
                          value={timeInputValue(
                            hour.close_time,
                            defaults.close_time || (hour.day_of_week === 6 ? '14:00' : '20:00'),
                            hour.closed
                          )}
                          onChange={(e) => updateWorkingHour(hour.day_of_week, { close_time: e.target.value })}
                        />
                        <div className="flex items-center justify-between md:justify-end gap-2">
                          <Label className="text-sm">Zatvoreno</Label>
                          <Switch
                            checked={hour.closed}
                            onCheckedChange={(checked) => toggleWorkingDayClosed(hour.day_of_week, checked)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Otkaži
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Spremanje...' : editingFirm ? 'Sačuvaj izmjene' : 'Dodaj apoteku'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
