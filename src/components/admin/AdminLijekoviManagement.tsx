import { FormEvent, useEffect, useRef, useState } from 'react';
import { adminAPI } from '@/services/adminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Pill, RefreshCw, Search, Upload } from 'lucide-react';

interface Medicine {
  id: number;
  lijek_id: number;
  naziv?: string | null;
  naziv_lijeka?: string | null;
  atc_sifra?: string | null;
  inn?: string | null;
  brend?: string | null;
  aktuelna_cijena?: string | number | null;
  aktuelni_procenat_participacije?: string | number | null;
  aktuelni_iznos_participacije?: string | number | null;
  aktuelna_lista_id?: string | null;
  aktuelni_broj_indikacija?: number | null;
  opis?: string | null;
  jidl?: string | null;
  proizvodjac?: string | null;
  nosilac_dozvole?: string | null;
  broj_dozvole?: string | null;
  tip_lijeka?: string | null;
  podtip_lijeka?: string | null;
  rezim_izdavanja?: string | null;
  lista_rfzo_pojasnjenje?: string | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface RfzoList {
  id: number;
  code: string;
  naziv?: string | null;
  pojasnjenje?: string | null;
  sort_order: number;
  is_active: boolean;
}

interface AuditData {
  conflicting_price_periods_count: number;
  duplicate_indications_count: number;
  missing_business_fields_count: number;
}

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors as Record<string, string[]>;
    return Object.values(errors).flat().join('\n');
  }
  return error?.response?.data?.message || error?.message || 'Doslo je do greske.';
};

const normalizeNullable = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const formatMoney = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return 'n/a';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return `${numeric.toFixed(2)} KM`;
};

export function AdminLijekoviManagement() {
  const { toast } = useToast();
  const xmlFileRef = useRef<HTMLInputElement | null>(null);
  const registarFileRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [importingXml, setImportingXml] = useState(false);
  const [importingRegistar, setImportingRegistar] = useState(false);
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  const [truncateRegistar, setTruncateRegistar] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [rfzoLists, setRfzoLists] = useState<RfzoList[]>([]);
  const [rfzoCode, setRfzoCode] = useState('');
  const [rfzoName, setRfzoName] = useState('');
  const [rfzoText, setRfzoText] = useState('');
  const [rfzoEditingId, setRfzoEditingId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, [page, searchTerm]);

  useEffect(() => {
    fetchRfzoLists();
    runAudit();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getMedicines({ page, per_page: 20, search: searchTerm || undefined });
      const payload = response?.data?.data || response?.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setMedicines(list);
      setMeta({
        current_page: Number(payload?.current_page || 1),
        last_page: Number(payload?.last_page || 1),
        per_page: Number(payload?.per_page || 20),
        total: Number(payload?.total || list.length || 0),
      });
    } catch (error: any) {
      toast({ title: 'Greska', description: getErrorMessage(error), variant: 'destructive' });
      setMedicines([]);
      setMeta(defaultMeta);
    } finally {
      setLoading(false);
    }
  };

  const fetchRfzoLists = async () => {
    try {
      const response = await adminAPI.getRfzoLists();
      setRfzoLists(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error: any) {
      toast({ title: 'RFZO liste', description: getErrorMessage(error), variant: 'destructive' });
    }
  };

  const runAudit = async () => {
    setAuditLoading(true);
    try {
      const response = await adminAPI.getMedicinesAudit({ limit: 25 });
      setAuditData(response?.data?.data || null);
    } catch (error: any) {
      toast({ title: 'Audit', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setAuditLoading(false);
    }
  };

  const onSearch = (event?: FormEvent) => {
    event?.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const onImportXml = async (file: File | null) => {
    if (!file) return;
    setImportingXml(true);
    try {
      const fd = new FormData();
      fd.append('xml_file', file);
      await adminAPI.importMedicinesXml(fd);
      toast({ title: 'Uspjeh', description: 'RFZO XML import zavrsen.' });
      await fetchMedicines();
      await runAudit();
    } catch (error: any) {
      toast({ title: 'Greska', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setImportingXml(false);
      if (xmlFileRef.current) xmlFileRef.current.value = '';
    }
  };

  const onImportRegistar = async (file: File | null) => {
    if (!file) return;
    setImportingRegistar(true);
    try {
      const fd = new FormData();
      fd.append('registar_file', file);
      fd.append('truncate', String(truncateRegistar));
      fd.append('allow_overwrite', String(allowOverwrite));
      const response = await adminAPI.importMedicinesRegistry(fd);
      const summary = response?.data?.summary || {};
      toast({
        title: 'Registar import',
        description: `Matched: ${summary.rows_matched ?? 0}, unmatched: ${summary.rows_unmatched ?? 0}.`,
      });
      await fetchMedicines();
      await runAudit();
    } catch (error: any) {
      toast({ title: 'Greska', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setImportingRegistar(false);
      if (registarFileRef.current) registarFileRef.current.value = '';
    }
  };

  const onSaveRfzo = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        code: rfzoCode.trim().toUpperCase(),
        naziv: normalizeNullable(rfzoName),
        pojasnjenje: normalizeNullable(rfzoText),
      };

      if (rfzoEditingId) {
        await adminAPI.updateRfzoList(rfzoEditingId, payload);
      } else {
        await adminAPI.createRfzoList(payload);
      }

      setRfzoCode('');
      setRfzoName('');
      setRfzoText('');
      setRfzoEditingId(null);
      await fetchRfzoLists();
      toast({ title: 'Uspjeh', description: rfzoEditingId ? 'RFZO lista je azurirana.' : 'RFZO lista je dodana.' });
    } catch (error: any) {
      toast({ title: 'Greska', description: getErrorMessage(error), variant: 'destructive' });
    }
  };

  const startEditRfzo = (item: RfzoList) => {
    setRfzoEditingId(item.id);
    setRfzoCode(item.code || '');
    setRfzoName(item.naziv || '');
    setRfzoText(item.pojasnjenje || '');
  };

  const deleteRfzo = async (id: number) => {
    if (!confirm('Obrisati RFZO listu?')) return;
    try {
      await adminAPI.deleteRfzoList(id);
      if (rfzoEditingId === id) {
        setRfzoEditingId(null);
        setRfzoCode('');
        setRfzoName('');
        setRfzoText('');
      }
      await fetchRfzoLists();
      toast({ title: 'Uspjeh', description: 'RFZO lista je obrisana.' });
    } catch (error: any) {
      toast({ title: 'Greska', description: getErrorMessage(error), variant: 'destructive' });
    }
  };

  const openEdit = (medicine: Medicine) => {
    setEditing(medicine);
    setDialogOpen(true);
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await adminAPI.updateMedicine(editing.id, {
        opis: normalizeNullable(editing.opis || ''),
        inn: normalizeNullable(editing.inn || ''),
        jidl: normalizeNullable(editing.jidl || ''),
        proizvodjac: normalizeNullable(editing.proizvodjac || ''),
        nosilac_dozvole: normalizeNullable(editing.nosilac_dozvole || ''),
        broj_dozvole: normalizeNullable(editing.broj_dozvole || ''),
        tip_lijeka: normalizeNullable(editing.tip_lijeka || ''),
        podtip_lijeka: normalizeNullable(editing.podtip_lijeka || ''),
        rezim_izdavanja: normalizeNullable(editing.rezim_izdavanja || ''),
        lista_rfzo_pojasnjenje: normalizeNullable(editing.lista_rfzo_pojasnjenje || ''),
      });
      setDialogOpen(false);
      setEditing(null);
      await fetchMedicines();
      toast({ title: 'Uspjeh', description: 'Lijek je azuriran.' });
    } catch (error: any) {
      toast({ title: 'Greska', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Lijekovi ({meta.total})</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input ref={xmlFileRef} type="file" accept=".xml" className="hidden" onChange={(e) => onImportXml(e.target.files?.[0] || null)} />
          <input ref={registarFileRef} type="file" accept=".csv,.xml" className="hidden" onChange={(e) => onImportRegistar(e.target.files?.[0] || null)} />
          <Button variant="outline" onClick={() => xmlFileRef.current?.click()} disabled={importingXml} className="gap-2"><Upload className="h-4 w-4" />RFZO XML</Button>
          <Button variant="outline" onClick={() => registarFileRef.current?.click()} disabled={importingRegistar} className="gap-2"><Upload className="h-4 w-4" />Registar</Button>
          <Button variant="outline" onClick={fetchMedicines} className="gap-2"><RefreshCw className="h-4 w-4" />Osvjezi</Button>
        </div>
      </div>

      <Card><CardContent className="p-4 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={truncateRegistar} onChange={(e) => setTruncateRegistar(e.target.checked)} />truncate registar snapshot</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={allowOverwrite} onChange={(e) => setAllowOverwrite(e.target.checked)} />allow overwrite</label>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Audit kvaliteta</h3>
          <Button size="sm" variant="outline" onClick={runAudit} disabled={auditLoading}>Pokreni</Button>
        </div>
        {auditData && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Konfliktne cijene: {auditData.conflicting_price_periods_count}</Badge>
            <Badge variant="secondary">Duple indikacije: {auditData.duplicate_indications_count}</Badge>
            <Badge variant="secondary">Missing polja: {auditData.missing_business_fields_count}</Badge>
          </div>
        )}
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-medium">RFZO liste</h3>
        <form onSubmit={onSaveRfzo} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input placeholder="Kod (A, A1...)" value={rfzoCode} onChange={(e) => setRfzoCode(e.target.value)} required />
          <Input placeholder="Naziv" value={rfzoName} onChange={(e) => setRfzoName(e.target.value)} />
          <Input placeholder="Pojasnjenje" value={rfzoText} onChange={(e) => setRfzoText(e.target.value)} className="md:col-span-2" />
          <Button type="submit">{rfzoEditingId ? 'Sacuvaj' : 'Dodaj'}</Button>
          {rfzoEditingId && <Button type="button" variant="outline" onClick={() => { setRfzoEditingId(null); setRfzoCode(''); setRfzoName(''); setRfzoText(''); }}>Otkazi</Button>}
        </form>
        <div className="space-y-2">
          {rfzoLists.map((list) => (
            <div key={list.id} className="flex items-center justify-between rounded border p-2">
              <div className="flex items-center gap-2">
                <Badge variant={list.is_active ? 'default' : 'secondary'}>{list.code}</Badge>
                <span className="text-sm">{list.naziv || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => startEditRfzo(list)}><Edit className="h-4 w-4" /></Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => deleteRfzo(list.id)}>X</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent></Card>

      <form className="flex items-center gap-2" onSubmit={onSearch}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Pretraga..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <Button type="submit">Pretrazi</Button>
      </form>

      <Card><CardContent className="p-0">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">Ucitavanje lijekova...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Lijek ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Naziv</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">ATC / INN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Aktuelno</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td className="px-4 py-3 text-sm font-medium">{medicine.lijek_id}</td>
                    <td className="px-4 py-3 text-sm">{medicine.naziv || medicine.naziv_lijeka || '-'}</td>
                    <td className="px-4 py-3 text-sm">{medicine.atc_sifra || '-'} / {medicine.inn || '-'}</td>
                    <td className="px-4 py-3 text-sm">Cijena {formatMoney(medicine.aktuelna_cijena)} | Doplata {formatMoney(medicine.aktuelni_iznos_participacije)}</td>
                    <td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => openEdit(medicine)}><Edit className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent></Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Stranica {meta.current_page} / {meta.last_page}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={meta.current_page <= 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>Prethodna</Button>
          <Button variant="outline" size="sm" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}>Sljedeca</Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uredi lijek</DialogTitle>
            <DialogDescription>Lijek ID: {editing?.lijek_id}</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label>INN</Label><Input value={editing?.inn || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, inn: e.target.value } : prev)} /></div>
              <div><Label>JIDL</Label><Input value={editing?.jidl || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, jidl: e.target.value } : prev)} /></div>
              <div><Label>Proizvodjac</Label><Input value={editing?.proizvodjac || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, proizvodjac: e.target.value } : prev)} /></div>
              <div><Label>Nosilac dozvole</Label><Input value={editing?.nosilac_dozvole || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, nosilac_dozvole: e.target.value } : prev)} /></div>
              <div><Label>Broj dozvole</Label><Input value={editing?.broj_dozvole || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, broj_dozvole: e.target.value } : prev)} /></div>
              <div><Label>Tip lijeka</Label><Input value={editing?.tip_lijeka || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, tip_lijeka: e.target.value } : prev)} /></div>
              <div><Label>Podtip lijeka</Label><Input value={editing?.podtip_lijeka || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, podtip_lijeka: e.target.value } : prev)} /></div>
              <div><Label>Rezim izdavanja</Label><Input value={editing?.rezim_izdavanja || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, rezim_izdavanja: e.target.value } : prev)} /></div>
            </div>
            <div><Label>Opis</Label><Textarea rows={3} value={editing?.opis || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, opis: e.target.value } : prev)} /></div>
            <div><Label>RFZO pojasnjenje</Label><Textarea rows={3} value={editing?.lista_rfzo_pojasnjenje || ''} onChange={(e) => setEditing((prev) => prev ? { ...prev, lista_rfzo_pojasnjenje: e.target.value } : prev)} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Otkazi</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Cuvanje...' : 'Sacuvaj'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
