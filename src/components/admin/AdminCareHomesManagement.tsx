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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Home as HomeIcon, Mail, MapPin, Phone, Plus, Search, Shield, Trash2, Edit } from 'lucide-react';

interface TaxonomyOption {
  id: number;
  naziv: string;
  slug?: string;
  kategorija?: string;
}

interface CareHome {
  id: number;
  naziv: string;
  grad: string;
  regija?: string | null;
  adresa: string;
  telefon?: string | null;
  email?: string | null;
  aktivan: boolean;
  verifikovan: boolean;
  user?: {
    id: number;
    email: string;
  } | null;
}

interface FilterOptions {
  tipovi_domova: TaxonomyOption[];
  nivoi_njege: TaxonomyOption[];
  programi_njege: TaxonomyOption[];
  medicinske_usluge: TaxonomyOption[];
  smjestaj_uslovi: TaxonomyOption[];
}

interface CareHomeFormState {
  naziv: string;
  grad: string;
  regija: string;
  adresa: string;
  telefon: string;
  email: string;
  website: string;
  opis: string;
  detaljni_opis: string;
  tip_doma_id: string;
  nivo_njege_id: string;
  nurses_availability: '24_7' | 'shifts' | 'on_demand';
  doctor_availability: 'permanent' | 'periodic' | 'on_call';
  pricing_mode: 'public' | 'on_request';
  price_from: string;
  has_physiotherapist: boolean;
  has_physiatrist: boolean;
  emergency_protocol: boolean;
  controlled_entry: boolean;
  video_surveillance: boolean;
  online_upit: boolean;
  programi_njege: number[];
  medicinske_usluge: number[];
  smjestaj_uslovi: number[];
  aktivan: boolean;
  verifikovan: boolean;
  account_email: string;
}

const emptyForm: CareHomeFormState = {
  naziv: '',
  grad: '',
  regija: '',
  adresa: '',
  telefon: '',
  email: '',
  website: '',
  opis: '',
  detaljni_opis: '',
  tip_doma_id: '',
  nivo_njege_id: '',
  nurses_availability: 'shifts',
  doctor_availability: 'on_call',
  pricing_mode: 'on_request',
  price_from: '',
  has_physiotherapist: false,
  has_physiatrist: false,
  emergency_protocol: false,
  controlled_entry: false,
  video_surveillance: false,
  online_upit: true,
  programi_njege: [],
  medicinske_usluge: [],
  smjestaj_uslovi: [],
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

export function AdminCareHomesManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [homes, setHomes] = useState<CareHome[]>([]);
  const [options, setOptions] = useState<FilterOptions>({
    tipovi_domova: [],
    nivoi_njege: [],
    programi_njege: [],
    medicinske_usluge: [],
    smjestaj_uslovi: [],
  });
  const [editingHome, setEditingHome] = useState<CareHome | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CareHomeFormState>(emptyForm);
  const [sendingInviteId, setSendingInviteId] = useState<number | null>(null);

  const filteredHomes = useMemo(() => {
    if (!searchTerm.trim()) return homes;
    const q = searchTerm.toLowerCase();

    return homes.filter((home) =>
      home.naziv?.toLowerCase().includes(q) ||
      home.grad?.toLowerCase().includes(q) ||
      home.regija?.toLowerCase().includes(q) ||
      home.email?.toLowerCase().includes(q) ||
      home.telefon?.toLowerCase().includes(q) ||
      home.user?.email?.toLowerCase().includes(q)
    );
  }, [homes, searchTerm]);

  useEffect(() => {
    void Promise.all([fetchHomes(), fetchOptions()]);
  }, []);

  const fetchHomes = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCareHomes({ per_page: 100 });
      const payload = response?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setHomes(list);
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
      const response = await adminAPI.get('/domovi-njega/filter-options');
      const payload = response?.data?.data || {};
      setOptions({
        tipovi_domova: Array.isArray(payload?.tipovi_domova) ? payload.tipovi_domova : [],
        nivoi_njege: Array.isArray(payload?.nivoi_njege) ? payload.nivoi_njege : [],
        programi_njege: Array.isArray(payload?.programi_njege) ? payload.programi_njege : [],
        medicinske_usluge: Array.isArray(payload?.medicinske_usluge) ? payload.medicinske_usluge : [],
        smjestaj_uslovi: Array.isArray(payload?.smjestaj_uslovi) ? payload.smjestaj_uslovi : [],
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
    setEditingHome(null);
    setForm((prev) => ({
      ...emptyForm,
      tip_doma_id: options.tipovi_domova[0]?.id?.toString() || prev.tip_doma_id || '',
      nivo_njege_id: options.nivoi_njege[0]?.id?.toString() || prev.nivo_njege_id || '',
    }));
    setDialogOpen(true);
  };

  const openEditDialog = async (home: CareHome) => {
    try {
      const response = await adminAPI.getCareHome(home.id);
      const payload = response?.data;
      setEditingHome(home);
      setForm({
        naziv: payload?.naziv || home.naziv || '',
        grad: payload?.grad || home.grad || '',
        regija: payload?.regija || '',
        adresa: payload?.adresa || home.adresa || '',
        telefon: payload?.telefon || '',
        email: payload?.email || '',
        website: payload?.website || '',
        opis: payload?.opis || '',
        detaljni_opis: payload?.detaljni_opis || '',
        tip_doma_id: payload?.tip_doma_id?.toString() || '',
        nivo_njege_id: payload?.nivo_njege_id?.toString() || '',
        nurses_availability: payload?.nurses_availability || 'shifts',
        doctor_availability: payload?.doctor_availability || 'on_call',
        pricing_mode: payload?.pricing_mode || 'on_request',
        price_from: payload?.price_from?.toString() || '',
        has_physiotherapist: !!payload?.has_physiotherapist,
        has_physiatrist: !!payload?.has_physiatrist,
        emergency_protocol: !!payload?.emergency_protocol,
        controlled_entry: !!payload?.controlled_entry,
        video_surveillance: !!payload?.video_surveillance,
        online_upit: payload?.online_upit ?? true,
        programi_njege: Array.isArray(payload?.programi_njege) ? payload.programi_njege.map((item: TaxonomyOption) => item.id) : [],
        medicinske_usluge: Array.isArray(payload?.medicinsk_usluge) ? payload.medicinsk_usluge.map((item: TaxonomyOption) => item.id) : [],
        smjestaj_uslovi: Array.isArray(payload?.smjestaj_uslovi) ? payload.smjestaj_uslovi.map((item: TaxonomyOption) => item.id) : [],
        aktivan: payload?.aktivan ?? home.aktivan ?? true,
        verifikovan: payload?.verifikovan ?? home.verifikovan ?? true,
        account_email: payload?.user?.email || home.user?.email || '',
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
    setEditingHome(null);
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
      tip_doma_id: Number(form.tip_doma_id),
      nivo_njege_id: Number(form.nivo_njege_id),
      nurses_availability: form.nurses_availability,
      doctor_availability: form.doctor_availability,
      pricing_mode: form.pricing_mode,
      price_from: form.price_from.trim() ? Number(form.price_from) : null,
      has_physiotherapist: form.has_physiotherapist,
      has_physiatrist: form.has_physiatrist,
      emergency_protocol: form.emergency_protocol,
      controlled_entry: form.controlled_entry,
      video_surveillance: form.video_surveillance,
      online_upit: form.online_upit,
      programi_njege: form.programi_njege,
      medicinske_usluge: form.medicinske_usluge,
      smjestaj_uslovi: form.smjestaj_uslovi,
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
      if (editingHome) {
        await adminAPI.updateCareHome(editingHome.id, payload);
        toast({ title: 'Uspjeh', description: 'Dom je ažuriran.' });
      } else {
        await adminAPI.createCareHome(payload);
        toast({ title: 'Uspjeh', description: 'Novi dom je dodan.' });
      }

      closeDialog();
      fetchHomes();
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
    if (!confirm('Da li ste sigurni da želite obrisati ovaj dom?')) return;

    try {
      await adminAPI.deleteCareHome(id);
      toast({ title: 'Uspjeh', description: 'Dom je obrisan.' });
      fetchHomes();
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (home: CareHome) => {
    try {
      await adminAPI.updateCareHome(home.id, { aktivan: !home.aktivan });
      toast({
        title: 'Uspjeh',
        description: !home.aktivan ? 'Dom je aktiviran.' : 'Dom je deaktiviran.',
      });
      fetchHomes();
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleSendInvite = async (home: CareHome) => {
    if (!home.user?.email) {
      toast({
        title: 'Nedostaje pristupni email',
        description: 'Prvo sačuvajte pristupni email doma.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingInviteId(home.id);
      await adminAPI.sendCareHomeInvite(home.id);
      toast({
        title: 'Pozivnica poslana',
        description: `Email je poslan na ${home.user.email}.`,
      });
      fetchHomes();
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
          <HomeIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Domovi za njegu ({filteredHomes.length})</h2>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Novi dom
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
        {filteredHomes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nema domova za prikaz.
            </CardContent>
          </Card>
        ) : (
          filteredHomes.map((home) => (
            <Card key={home.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{home.naziv}</h3>
                      <Badge variant={home.verifikovan ? 'default' : 'outline'}>
                        {home.verifikovan ? 'Verifikovan' : 'Neverifikovan'}
                      </Badge>
                      <Badge variant={home.aktivan ? 'default' : 'secondary'}>
                        {home.aktivan ? 'Aktivan' : 'Neaktivan'}
                      </Badge>
                    </div>

                    <div className="grid gap-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {[home.grad, home.regija, home.adresa].filter(Boolean).join(', ')}
                      </p>
                      {home.telefon && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {home.telefon}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Javni email: {home.email || 'n/a'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        {home.user?.email ? `Pristup: ${home.user.email}` : 'Bez pristupa panelu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 mr-2">
                      <Label className="text-xs text-muted-foreground">Aktivan</Label>
                      <Switch checked={home.aktivan} onCheckedChange={() => handleToggleActive(home)} />
                    </div>
                    {home.user?.email && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSendInvite(home)}
                        disabled={sendingInviteId === home.id}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(home)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(home.id)}>
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHome ? 'Uredi dom za njegu' : 'Novi dom za njegu'}</DialogTitle>
            <DialogDescription>
              Admin može kreirati i verifikovati profil odmah, a pristupni nalog se dodaje kasnije kada ustanova preuzme panel.
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
              <div>
                <Label>Tip doma *</Label>
                <Select value={form.tip_doma_id} onValueChange={(value) => setForm((prev) => ({ ...prev, tip_doma_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberi tip doma" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.tipovi_domova.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.naziv}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nivo njege *</Label>
                <Select value={form.nivo_njege_id} onValueChange={(value) => setForm((prev) => ({ ...prev, nivo_njege_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberi nivo njege" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.nivoi_njege.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.naziv}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dostupnost sestara</Label>
                <Select
                  value={form.nurses_availability}
                  onValueChange={(value: CareHomeFormState['nurses_availability']) => setForm((prev) => ({ ...prev, nurses_availability: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24_7">24/7</SelectItem>
                    <SelectItem value="shifts">Smjene</SelectItem>
                    <SelectItem value="on_demand">Po potrebi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dostupnost doktora</Label>
                <Select
                  value={form.doctor_availability}
                  onValueChange={(value: CareHomeFormState['doctor_availability']) => setForm((prev) => ({ ...prev, doctor_availability: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Stalno</SelectItem>
                    <SelectItem value="periodic">Periodično</SelectItem>
                    <SelectItem value="on_call">Na poziv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Način cijena</Label>
                <Select
                  value={form.pricing_mode}
                  onValueChange={(value: CareHomeFormState['pricing_mode']) => setForm((prev) => ({ ...prev, pricing_mode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_request">Na upit</SelectItem>
                    <SelectItem value="public">Javno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cijena od</Label>
                <Input value={form.price_from} onChange={(e) => setForm((prev) => ({ ...prev, price_from: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Opis *</Label>
                <Textarea rows={3} value={form.opis} onChange={(e) => setForm((prev) => ({ ...prev, opis: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <Label>Detaljni opis</Label>
                <Textarea rows={4} value={form.detaljni_opis} onChange={(e) => setForm((prev) => ({ ...prev, detaljni_opis: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Switch checked={form.has_physiotherapist} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, has_physiotherapist: checked }))} />
                <Label>Fizioterapeut</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.has_physiatrist} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, has_physiatrist: checked }))} />
                <Label>Fizijatar</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.emergency_protocol} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, emergency_protocol: checked }))} />
                <Label>Hitni protokol</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.controlled_entry} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, controlled_entry: checked }))} />
                <Label>Kontrolisan ulaz</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.video_surveillance} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, video_surveillance: checked }))} />
                <Label>Video nadzor</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.online_upit} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, online_upit: checked }))} />
                <Label>Online upit</Label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Programi njege</h3>
                {options.programi_njege.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.programi_njege.includes(option.id)}
                      onCheckedChange={() =>
                        setForm((prev) => ({ ...prev, programi_njege: toggleArrayValue(prev.programi_njege, option.id) }))
                      }
                    />
                    <span>{option.naziv}</span>
                  </label>
                ))}
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Medicinske usluge</h3>
                {options.medicinske_usluge.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.medicinske_usluge.includes(option.id)}
                      onCheckedChange={() =>
                        setForm((prev) => ({ ...prev, medicinske_usluge: toggleArrayValue(prev.medicinske_usluge, option.id) }))
                      }
                    />
                    <span>{option.naziv}</span>
                  </label>
                ))}
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Smještajni uslovi</h3>
                {options.smjestaj_uslovi.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.smjestaj_uslovi.includes(option.id)}
                      onCheckedChange={() =>
                        setForm((prev) => ({ ...prev, smjestaj_uslovi: toggleArrayValue(prev.smjestaj_uslovi, option.id) }))
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
                    placeholder="Dodajte kada dom preuzima panel"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Lozinku ne postavlja admin. Nakon spremanja pristupnog emaila posaljite pozivnicu iz liste, a dom ce sam aktivirati pristup.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.verifikovan} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, verifikovan: checked }))} />
                <Label>Odmah verifikovan</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.aktivan} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, aktivan: checked }))} />
                <Label>Aktivan</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Spremanje...' : editingHome ? 'Sačuvaj izmjene' : 'Kreiraj dom'}
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
