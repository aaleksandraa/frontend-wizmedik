import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { citiesAPI, pharmaciesAPI } from '@/services/api';
import { Loader2, Pill, Plus, Trash2, Upload } from 'lucide-react';

const dayLabels: Record<number, string> = {
  1: 'Ponedjeljak',
  2: 'Utorak',
  3: 'Srijeda',
  4: 'Cetvrtak',
  5: 'Petak',
  6: 'Subota',
  7: 'Nedjelja',
};

const defaultHours = () =>
  [1, 2, 3, 4, 5, 6, 7].map((day) => ({
    day_of_week: day,
    open_time: day === 7 ? null : '08:00',
    close_time: day === 7 ? null : '16:00',
    closed: day === 7,
  }));

const num = (value: string) => {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatDateTimeEU = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const dutyTypeLabels: Record<string, string> = {
  night: 'Nocno',
  holiday: 'Praznik',
  weekend: 'Vikend',
  continuous: 'Kontinuirano',
};

const dutyStatusLabels: Record<string, string> = {
  draft: 'Nacrt',
  confirmed: 'Potvrdjeno',
  cancelled: 'Otkazano',
};

const normalizeTimeInput = (value?: string | null, fallback = '08:00') => {
  if (!value) return fallback;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return fallback;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const toTimeOrNull = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [firm, setFirm] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [branchDraft, setBranchDraft] = useState<any>(null);
  const [hoursDraft, setHoursDraft] = useState<any[]>(defaultHours());
  const [dutyShifts, setDutyShifts] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  const [newBranch, setNewBranch] = useState({
    naziv: '',
    adresa: '',
    grad_id: '',
    grad_naziv: '',
    latitude: '',
    longitude: '',
    telefon: '',
    email: '',
    kratki_opis: '',
    is_24h: false,
    ima_dostavu: false,
    ima_parking: false,
    pristup_invalidima: false,
  });

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [discountForm, setDiscountForm] = useState({
    poslovnica_id: '',
    tip: 'svi',
    discount_percent: '',
    discount_amount: '',
    uslovi: '',
    is_active: true,
  });
  const [promotionForm, setPromotionForm] = useState({
    poslovnica_id: '',
    naslov: '',
    opis: '',
    promo_code: '',
    is_active: true,
  });
  const [offerForm, setOfferForm] = useState({
    poslovnica_id: '',
    offer_type: 'percent_discount',
    title: '',
    description: '',
    target_group: 'svi',
    discount_percent: '',
    discount_amount: '',
    service_name: '',
    is_active: true,
  });
  const [dutyForm, setDutyForm] = useState({
    grad_id: '',
    starts_at: '',
    ends_at: '',
    tip: 'night',
    status: 'draft',
    is_nonstop: false,
  });

  const selectedBranch = useMemo(
    () => branches.find((item) => item.id === selectedBranchId) || null,
    [branches, selectedBranchId]
  );
  const selectedBranchGallery = selectedBranch?.galerija_slike || [];
  const galleryLimitReached = selectedBranchGallery.length >= 5;

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [profileRes, citiesRes, discountsRes, promotionsRes, offersRes] = await Promise.all([
        pharmaciesAPI.getProfile(),
        citiesAPI.getAll(),
        pharmaciesAPI.getDiscounts(),
        pharmaciesAPI.getPromotions(),
        pharmaciesAPI.getSpecialOffers(),
      ]);
      const loadedBranches = profileRes.data?.branches || [];
      setFirm(profileRes.data?.firma || null);
      setBranches(loadedBranches);
      setCities(citiesRes.data?.data || citiesRes.data || []);
      setDiscounts(discountsRes.data || []);
      setPromotions(promotionsRes.data || []);
      setOffers(offersRes.data || []);
      setSelectedBranchId((current) => current || loadedBranches[0]?.id || null);
    } catch (error: any) {
      toast({
        title: 'Greska',
        description: error.response?.data?.message || 'Nije moguce ucitati podatke.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'pharmacy_owner' || user?.role === 'admin') {
      loadDashboard();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!selectedBranch) return;
    setBranchDraft({
      ...selectedBranch,
      grad_id: selectedBranch.grad_id || '',
      latitude: selectedBranch.latitude ?? '',
      longitude: selectedBranch.longitude ?? '',
    });
    const map = new Map<number, any>();
    (selectedBranch.radno_vrijeme || []).forEach((item: any) => map.set(item.day_of_week, item));
    setHoursDraft(
      [1, 2, 3, 4, 5, 6, 7].map((day) => {
        const existing = map.get(day);
        if (!existing) {
          return defaultHours()[day - 1];
        }

        return {
          ...existing,
          open_time: existing.open_time ? normalizeTimeInput(existing.open_time, '08:00') : null,
          close_time: existing.close_time ? normalizeTimeInput(existing.close_time, '16:00') : null,
          closed: Boolean(existing.closed),
        };
      })
    );
    pharmaciesAPI
      .getDutyShifts(selectedBranch.id)
      .then((res) => setDutyShifts(res.data || []))
      .catch(() => setDutyShifts([]));
  }, [selectedBranch]);

  const saveFirm = async () => {
    if (!firm) return;
    setSaving(true);
    try {
      await pharmaciesAPI.updateProfile(firm);
      toast({ title: 'Uspjeh', description: 'Profil firme je sacuvan.' });
      await loadDashboard();
    } catch (error: any) {
      toast({ title: 'Greska', description: error.response?.data?.message || 'Snimanje nije uspjelo.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const createBranch = async () => {
    if (!newBranch.naziv || !newBranch.adresa) return;
    try {
      await pharmaciesAPI.createBranch({
        ...newBranch,
        grad_id: newBranch.grad_id ? Number(newBranch.grad_id) : null,
        latitude: num(newBranch.latitude),
        longitude: num(newBranch.longitude),
      });
      toast({ title: 'Uspjeh', description: 'Poslovnica je dodana.' });
      setNewBranch({
        naziv: '',
        adresa: '',
        grad_id: '',
        grad_naziv: '',
        latitude: '',
        longitude: '',
        telefon: '',
        email: '',
        kratki_opis: '',
        is_24h: false,
        ima_dostavu: false,
        ima_parking: false,
        pristup_invalidima: false,
      });
      await loadDashboard();
    } catch (error: any) {
      toast({ title: 'Greska', description: error.response?.data?.message || 'Dodavanje nije uspjelo.', variant: 'destructive' });
    }
  };

  const saveBranch = async () => {
    if (!selectedBranch || !branchDraft) return;
    try {
      await pharmaciesAPI.updateBranch(selectedBranch.id, {
        ...branchDraft,
        grad_id: branchDraft.grad_id ? Number(branchDraft.grad_id) : null,
        latitude: num(String(branchDraft.latitude ?? '')),
        longitude: num(String(branchDraft.longitude ?? '')),
      });
      toast({ title: 'Uspjeh', description: 'Poslovnica je sacuvana.' });
      await loadDashboard();
    } catch (error: any) {
      toast({ title: 'Greska', description: error.response?.data?.message || 'Snimanje nije uspjelo.', variant: 'destructive' });
    }
  };

  const deleteBranch = async () => {
    if (!selectedBranch || !window.confirm('Obrisati poslovnicu?')) return;
    await pharmaciesAPI.deleteBranch(selectedBranch.id);
    toast({ title: 'Uspjeh', description: 'Poslovnica je obrisana.' });
    await loadDashboard();
  };

  const saveHours = async () => {
    if (!selectedBranch) return;
    await pharmaciesAPI.updateHours(
      selectedBranch.id,
      hoursDraft.map((item) => ({
        ...item,
        open_time: item.closed ? null : toTimeOrNull(item.open_time),
        close_time: item.closed ? null : toTimeOrNull(item.close_time),
        closed: Boolean(item.closed),
      }))
    );
    toast({ title: 'Uspjeh', description: 'Radno vrijeme je sacuvano.' });
    await loadDashboard();
  };

  const saveProfileImage = async () => {
    if (!selectedBranch || !profileFile) return;
    const formData = new FormData();
    formData.append('image', profileFile);
    await pharmaciesAPI.uploadProfileImage(selectedBranch.id, formData);
    setProfileFile(null);
    toast({ title: 'Uspjeh', description: 'Profilna slika je sacuvana.' });
    await loadDashboard();
  };

  const addGalleryImage = async () => {
    if (!selectedBranch || !galleryFile || galleryLimitReached) return;
    const formData = new FormData();
    formData.append('files[]', galleryFile);
    await pharmaciesAPI.uploadGalleryImages(selectedBranch.id, formData);
    setGalleryFile(null);
    toast({ title: 'Uspjeh', description: 'Slika je dodana u galeriju.' });
    await loadDashboard();
  };

  const removeGalleryImage = async (index: number) => {
    if (!selectedBranch) return;
    await pharmaciesAPI.deleteGalleryImage(selectedBranch.id, index);
    toast({ title: 'Uspjeh', description: 'Slika je uklonjena.' });
    await loadDashboard();
  };

  const addDutyShift = async () => {
    if (!selectedBranch || !dutyForm.grad_id || !dutyForm.starts_at || !dutyForm.ends_at) return;
    await pharmaciesAPI.createDutyShift(selectedBranch.id, {
      ...dutyForm,
      grad_id: Number(dutyForm.grad_id),
    });
    setDutyForm({ grad_id: '', starts_at: '', ends_at: '', tip: 'night', status: 'draft', is_nonstop: false });
    const res = await pharmaciesAPI.getDutyShifts(selectedBranch.id);
    setDutyShifts(res.data || []);
  };

  const deleteDutyShift = async (id: number) => {
    if (!selectedBranch) return;
    await pharmaciesAPI.deleteDutyShift(selectedBranch.id, id);
    setDutyShifts((prev) => prev.filter((item) => item.id !== id));
  };

  const submitDiscount = async () => {
    await pharmaciesAPI.createDiscount({
      ...discountForm,
      poslovnica_id: discountForm.poslovnica_id ? Number(discountForm.poslovnica_id) : null,
      discount_percent: num(discountForm.discount_percent),
      discount_amount: num(discountForm.discount_amount),
    });
    setDiscounts((await pharmaciesAPI.getDiscounts()).data || []);
    setDiscountForm({ poslovnica_id: '', tip: 'svi', discount_percent: '', discount_amount: '', uslovi: '', is_active: true });
  };

  const submitPromotion = async () => {
    await pharmaciesAPI.createPromotion({
      ...promotionForm,
      poslovnica_id: promotionForm.poslovnica_id ? Number(promotionForm.poslovnica_id) : null,
    });
    setPromotions((await pharmaciesAPI.getPromotions()).data || []);
    setPromotionForm({ poslovnica_id: '', naslov: '', opis: '', promo_code: '', is_active: true });
  };

  const submitOffer = async () => {
    await pharmaciesAPI.createSpecialOffer({
      ...offerForm,
      poslovnica_id: offerForm.poslovnica_id ? Number(offerForm.poslovnica_id) : null,
      discount_percent: num(offerForm.discount_percent),
      discount_amount: num(offerForm.discount_amount),
    });
    setOffers((await pharmaciesAPI.getSpecialOffers()).data || []);
    setOfferForm({
      poslovnica_id: '',
      offer_type: 'percent_discount',
      title: '',
      description: '',
      target_group: 'svi',
      discount_percent: '',
      discount_amount: '',
      service_name: '',
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4 max-w-7xl space-y-4">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Pill className="w-6 h-6 text-red-600" />Apoteka Dashboard</h1>
          <Tabs defaultValue="firma" className="space-y-4">
            <TabsList className="grid grid-cols-3 md:w-[520px]">
              <TabsTrigger value="firma">Firma</TabsTrigger>
              <TabsTrigger value="poslovnice">Poslovnice</TabsTrigger>
              <TabsTrigger value="ponude">Ponude</TabsTrigger>
            </TabsList>

            <TabsContent value="firma">
              <Card><CardHeader><CardTitle>Profil firme</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-3">
                <div><Label>Naziv brenda</Label><Input value={firm?.naziv_brenda || ''} onChange={(e) => setFirm((p: any) => ({ ...p, naziv_brenda: e.target.value }))} /></div>
                <div><Label>Pravni naziv</Label><Input value={firm?.pravni_naziv || ''} onChange={(e) => setFirm((p: any) => ({ ...p, pravni_naziv: e.target.value }))} /></div>
                <div><Label>JIB</Label><Input value={firm?.jib || ''} onChange={(e) => setFirm((p: any) => ({ ...p, jib: e.target.value }))} /></div>
                <div><Label>Broj licence</Label><Input value={firm?.broj_licence || ''} onChange={(e) => setFirm((p: any) => ({ ...p, broj_licence: e.target.value }))} /></div>
                <div><Label>Telefon</Label><Input value={firm?.telefon || ''} onChange={(e) => setFirm((p: any) => ({ ...p, telefon: e.target.value }))} /></div>
                <div><Label>Email</Label><Input value={firm?.email || ''} onChange={(e) => setFirm((p: any) => ({ ...p, email: e.target.value }))} /></div>
                <div className="md:col-span-2"><Label>Opis</Label><Textarea rows={4} value={firm?.opis || ''} onChange={(e) => setFirm((p: any) => ({ ...p, opis: e.target.value }))} /></div>
                <div className="md:col-span-2 flex justify-end"><Button onClick={saveFirm} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Sacuvaj</Button></div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="poslovnice" className="space-y-4">
              <div className="grid lg:grid-cols-[300px,1fr] gap-4">
                <Card><CardHeader><CardTitle>Poslovnice ({branches.length})</CardTitle></CardHeader><CardContent className="space-y-2">
                  {branches.map((branch) => <button key={branch.id} type="button" onClick={() => setSelectedBranchId(branch.id)} className={`w-full text-left border rounded-lg p-2 ${selectedBranchId === branch.id ? 'border-primary bg-primary/5' : ''}`}><p className="font-medium">{branch.naziv}</p><p className="text-xs text-gray-500">{branch.adresa}</p>{branch.status ? <Badge variant={branch.status.open_now ? 'default' : 'secondary'}>{branch.status.status_label}</Badge> : null}</button>)}
                </CardContent></Card>
                <div className="space-y-4">
                  <Card><CardHeader><CardTitle>Dodaj poslovnicu</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-2">
                    <div><Label>Naziv</Label><Input value={newBranch.naziv} onChange={(e) => setNewBranch((p) => ({ ...p, naziv: e.target.value }))} /></div>
                    <div><Label>Grad</Label><select className="w-full border rounded-md px-3 py-2 bg-white" value={newBranch.grad_id} onChange={(e) => setNewBranch((p) => ({ ...p, grad_id: e.target.value, grad_naziv: cities.find((c) => c.id === Number(e.target.value))?.naziv || '' }))}><option value="">Odaberite grad</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.naziv}</option>)}</select></div>
                    <div className="md:col-span-2"><Label>Adresa</Label><Input value={newBranch.adresa} onChange={(e) => setNewBranch((p) => ({ ...p, adresa: e.target.value }))} /></div>
                    <div><Label>Latitude</Label><Input value={newBranch.latitude} onChange={(e) => setNewBranch((p) => ({ ...p, latitude: e.target.value }))} /></div>
                    <div><Label>Longitude</Label><Input value={newBranch.longitude} onChange={(e) => setNewBranch((p) => ({ ...p, longitude: e.target.value }))} /></div>
                    <div className="md:col-span-2 flex justify-end"><Button onClick={createBranch}><Plus className="w-4 h-4 mr-1" />Dodaj</Button></div>
                  </CardContent></Card>
                  {selectedBranch && branchDraft ? <Card><CardHeader><CardTitle>Uredi poslovnicu</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-2">
                      <div><Label>Naziv</Label><Input value={branchDraft.naziv || ''} onChange={(e) => setBranchDraft((p: any) => ({ ...p, naziv: e.target.value }))} /></div>
                      <div><Label>Grad</Label><select className="w-full border rounded-md px-3 py-2 bg-white" value={branchDraft.grad_id || ''} onChange={(e) => setBranchDraft((p: any) => ({ ...p, grad_id: e.target.value, grad_naziv: cities.find((c) => c.id === Number(e.target.value))?.naziv || '' }))}><option value="">Odaberite grad</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.naziv}</option>)}</select></div>
                      <div className="md:col-span-2"><Label>Adresa</Label><Input value={branchDraft.adresa || ''} onChange={(e) => setBranchDraft((p: any) => ({ ...p, adresa: e.target.value }))} /></div>
                      <div><Label>Latitude</Label><Input value={String(branchDraft.latitude ?? '')} onChange={(e) => setBranchDraft((p: any) => ({ ...p, latitude: e.target.value }))} /></div>
                      <div><Label>Longitude</Label><Input value={String(branchDraft.longitude ?? '')} onChange={(e) => setBranchDraft((p: any) => ({ ...p, longitude: e.target.value }))} /></div>
                    </div>
                    <div className="flex gap-2 justify-end"><Button variant="outline" onClick={deleteBranch}><Trash2 className="w-4 h-4 mr-1" />Obrisi</Button><Button onClick={saveBranch}>Sacuvaj</Button></div>
                    <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
                      <div className="space-y-2">
                        <Label>Profilna slika (upload fajla)</Label>
                        <Input type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} />
                        {profileFile ? <p className="text-xs text-gray-500">Odabrano: {profileFile.name}</p> : null}
                        <Button onClick={saveProfileImage} disabled={!profileFile}>
                          <Upload className="w-4 h-4 mr-1" />
                          Sacuvaj sliku
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Galerija (upload fajla, max 5 slika)</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={galleryLimitReached}
                          onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
                        />
                        {galleryFile ? <p className="text-xs text-gray-500">Odabrano: {galleryFile.name}</p> : null}
                        <Button onClick={addGalleryImage} disabled={!galleryFile || galleryLimitReached}>
                          <Upload className="w-4 h-4 mr-1" />
                          Dodaj u galeriju
                        </Button>
                        <p className="text-xs text-gray-500">Ukupno slika: {selectedBranchGallery.length}/5</p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <p className="text-sm font-medium">Pregled galerije</p>
                        {selectedBranchGallery.length ? (
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {selectedBranchGallery.map((image: string, idx: number) => (
                              <div key={`${image}-${idx}`} className="relative">
                                <img src={image} alt={`Galerija ${idx + 1}`} className="w-full h-20 object-cover rounded border" />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded p-1"
                                  onClick={() => removeGalleryImage(idx)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed p-3 text-sm text-gray-500">
                            Galerija je prazna. Dodajte fotografije da budu vidljive na profilu apoteke.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <Label>Radno vrijeme (evropski format HH:mm, 24h)</Label>
                      {hoursDraft.map((h, i) => (
                        <div key={h.day_of_week} className="grid grid-cols-[120px,1fr,1fr,auto] gap-2 items-center">
                          <span className="text-sm">{dayLabels[h.day_of_week]}</span>
                          <Input
                            type="time"
                            step={60}
                            disabled={h.closed}
                            value={normalizeTimeInput(h.open_time, '08:00')}
                            onChange={(e) =>
                              setHoursDraft((prev) =>
                                prev.map((x, j) => (j === i ? { ...x, open_time: e.target.value } : x))
                              )
                            }
                          />
                          <Input
                            type="time"
                            step={60}
                            disabled={h.closed}
                            value={normalizeTimeInput(h.close_time, '16:00')}
                            onChange={(e) =>
                              setHoursDraft((prev) =>
                                prev.map((x, j) => (j === i ? { ...x, close_time: e.target.value } : x))
                              )
                            }
                          />
                          <label className="text-xs flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={h.closed}
                              onChange={(e) =>
                                setHoursDraft((prev) =>
                                  prev.map((x, j) =>
                                    j === i
                                      ? {
                                          ...x,
                                          closed: e.target.checked,
                                          open_time: e.target.checked ? null : normalizeTimeInput(x.open_time, '08:00'),
                                          close_time: e.target.checked ? null : normalizeTimeInput(x.close_time, '16:00'),
                                        }
                                      : x
                                  )
                                )
                              }
                            />
                            Zatvoreno
                          </label>
                        </div>
                      ))}
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={saveHours}>Sacuvaj radno vrijeme</Button>
                      </div>
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <Label>Dodaj dezurstvo</Label>
                      <p className="text-xs text-gray-500">Unos je lokalno vrijeme, a prikaz ispod je evropski format: dd.MM.yyyy HH:mm.</p>
                      <div className="grid md:grid-cols-3 gap-2">
                        <select className="w-full border rounded-md px-3 py-2 bg-white" value={dutyForm.grad_id} onChange={(e) => setDutyForm((p) => ({ ...p, grad_id: e.target.value }))}><option value="">Grad</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.naziv}</option>)}</select>
                        <Input type="datetime-local" value={dutyForm.starts_at} onChange={(e) => setDutyForm((p) => ({ ...p, starts_at: e.target.value }))} />
                        <Input type="datetime-local" value={dutyForm.ends_at} onChange={(e) => setDutyForm((p) => ({ ...p, ends_at: e.target.value }))} />
                      </div>
                      <div className="flex justify-end"><Button variant="outline" onClick={addDutyShift}>Dodaj dezurstvo</Button></div>
                      <div className="space-y-2">
                        {dutyShifts.length ? dutyShifts.map((shift) => (
                          <div key={shift.id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">
                                {(cities.find((city) => city.id === shift.grad_id)?.naziv || 'Nepoznat grad')} | {dutyTypeLabels[shift.tip] || shift.tip}
                                {shift.is_nonstop ? ' | Nonstop' : ''}
                              </p>
                              <p className="text-xs text-gray-600">Od: {formatDateTimeEU(shift.starts_at)} | Do: {formatDateTimeEU(shift.ends_at)}</p>
                              <p className="text-xs text-gray-500">Status: {dutyStatusLabels[shift.status] || shift.status}</p>
                            </div>
                            <Button size="sm" variant="destructive" onClick={() => deleteDutyShift(shift.id)}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        )) : (
                          <div className="rounded-lg border border-dashed p-3 text-sm text-gray-500">
                            Nema unesenih dezurstava za ovu poslovnicu.
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent></Card> : null}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ponude">
              <div className="grid xl:grid-cols-3 gap-4">
                <Card><CardHeader><CardTitle>Popusti</CardTitle></CardHeader><CardContent className="space-y-2">
                  <select className="w-full border rounded-md px-3 py-2 bg-white" value={discountForm.poslovnica_id} onChange={(e) => setDiscountForm((p) => ({ ...p, poslovnica_id: e.target.value }))}><option value="">Sve poslovnice</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.naziv}</option>)}</select>
                  <select className="w-full border rounded-md px-3 py-2 bg-white" value={discountForm.tip} onChange={(e) => setDiscountForm((p) => ({ ...p, tip: e.target.value }))}><option value="svi">Svi</option><option value="penzioneri">Penzioneri</option><option value="studenti">Studenti</option><option value="porodicni">Porodicni</option></select>
                  <Input type="number" placeholder="% popusta" value={discountForm.discount_percent} onChange={(e) => setDiscountForm((p) => ({ ...p, discount_percent: e.target.value }))} />
                  <Input type="number" placeholder="Iznos popusta" value={discountForm.discount_amount} onChange={(e) => setDiscountForm((p) => ({ ...p, discount_amount: e.target.value }))} />
                  <Textarea rows={2} placeholder="Uslovi" value={discountForm.uslovi} onChange={(e) => setDiscountForm((p) => ({ ...p, uslovi: e.target.value }))} />
                  <Button className="w-full" onClick={submitDiscount}>Sacuvaj</Button>
                  {discounts.map((item) => <div key={item.id} className="border rounded p-2 text-xs flex justify-between"><span>{item.tip}</span><Button size="sm" variant="destructive" onClick={async () => { await pharmaciesAPI.deleteDiscount(item.id); setDiscounts((prev) => prev.filter((x) => x.id !== item.id)); }}><Trash2 className="w-3 h-3" /></Button></div>)}
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Akcije</CardTitle></CardHeader><CardContent className="space-y-2">
                  <select className="w-full border rounded-md px-3 py-2 bg-white" value={promotionForm.poslovnica_id} onChange={(e) => setPromotionForm((p) => ({ ...p, poslovnica_id: e.target.value }))}><option value="">Sve poslovnice</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.naziv}</option>)}</select>
                  <Input placeholder="Naslov" value={promotionForm.naslov} onChange={(e) => setPromotionForm((p) => ({ ...p, naslov: e.target.value }))} />
                  <Input placeholder="Promo kod" value={promotionForm.promo_code} onChange={(e) => setPromotionForm((p) => ({ ...p, promo_code: e.target.value }))} />
                  <Textarea rows={2} placeholder="Opis" value={promotionForm.opis} onChange={(e) => setPromotionForm((p) => ({ ...p, opis: e.target.value }))} />
                  <Button className="w-full" onClick={submitPromotion}>Sacuvaj</Button>
                  {promotions.map((item) => <div key={item.id} className="border rounded p-2 text-xs flex justify-between"><span>{item.naslov}</span><Button size="sm" variant="destructive" onClick={async () => { await pharmaciesAPI.deletePromotion(item.id); setPromotions((prev) => prev.filter((x) => x.id !== item.id)); }}><Trash2 className="w-3 h-3" /></Button></div>)}
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Posebne ponude</CardTitle></CardHeader><CardContent className="space-y-2">
                  <select className="w-full border rounded-md px-3 py-2 bg-white" value={offerForm.poslovnica_id} onChange={(e) => setOfferForm((p) => ({ ...p, poslovnica_id: e.target.value }))}><option value="">Sve poslovnice</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.naziv}</option>)}</select>
                  <Input placeholder="Naslov" value={offerForm.title} onChange={(e) => setOfferForm((p) => ({ ...p, title: e.target.value }))} />
                  <select className="w-full border rounded-md px-3 py-2 bg-white" value={offerForm.offer_type} onChange={(e) => setOfferForm((p) => ({ ...p, offer_type: e.target.value }))}><option value="percent_discount">Percent</option><option value="fixed_discount">Fixed</option><option value="full_assortment_discount">Full assortment</option><option value="free_service">Free service</option><option value="free_item">Free item</option></select>
                  <Input type="number" placeholder="% popusta" value={offerForm.discount_percent} onChange={(e) => setOfferForm((p) => ({ ...p, discount_percent: e.target.value }))} />
                  <Input type="number" placeholder="Iznos popusta" value={offerForm.discount_amount} onChange={(e) => setOfferForm((p) => ({ ...p, discount_amount: e.target.value }))} />
                  <Textarea rows={2} placeholder="Opis" value={offerForm.description} onChange={(e) => setOfferForm((p) => ({ ...p, description: e.target.value }))} />
                  <Button className="w-full" onClick={submitOffer}>Sacuvaj</Button>
                  {offers.map((item) => <div key={item.id} className="border rounded p-2 text-xs flex justify-between"><span>{item.title}</span><Button size="sm" variant="destructive" onClick={async () => { await pharmaciesAPI.deleteSpecialOffer(item.id); setOffers((prev) => prev.filter((x) => x.id !== item.id)); }}><Trash2 className="w-3 h-3" /></Button></div>)}
                </CardContent></Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
