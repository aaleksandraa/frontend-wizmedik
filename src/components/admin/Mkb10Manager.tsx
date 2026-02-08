import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Plus, Edit, Trash2, Upload, Download, Search, Loader2,
  FileText, FolderOpen, ChevronRight, RefreshCw
} from 'lucide-react';
import { adminAPI } from '@/services/adminApi';

interface Kategorija {
  id: number;
  kod_od: string;
  kod_do: string;
  naziv: string;
  opis?: string;
  boja?: string;
  ikona?: string;
  redoslijed: number;
  aktivan: boolean;
  dijagnoze_count: number;
  podkategorije_count: number;
}

interface Podkategorija {
  id: number;
  kategorija_id: number;
  kod_od: string;
  kod_do: string;
  naziv: string;
  opis?: string;
  redoslijed: number;
  aktivan: boolean;
  dijagnoze_count: number;
}

interface Dijagnoza {
  id: number;
  kategorija_id: number;
  podkategorija_id?: number;
  kod: string;
  naziv: string;
  naziv_lat?: string;
  opis?: string;
  aktivan: boolean;
  kategorija?: { id: number; kod_od: string; naziv: string };
  podkategorija?: { id: number; kod_od: string; naziv: string };
}

export default function Mkb10Manager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('kategorije');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data
  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [podkategorije, setPodkategorije] = useState<Podkategorija[]>([]);
  const [dijagnoze, setDijagnoze] = useState<Dijagnoza[]>([]);
  const [selectedKategorija, setSelectedKategorija] = useState<number | null>(null);
  const [selectedPodkategorija, setSelectedPodkategorija] = useState<number | null>(null);

  // Settings
  const [showCategoryNameInTabs, setShowCategoryNameInTabs] = useState(true);

  // Dialogs
  const [kategorijaDialog, setKategorijaDialog] = useState(false);
  const [podkategorijaDialog, setPodkategorijaDialog] = useState(false);
  const [dijagnozaDialog, setDijagnozaDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);

  // Edit data
  const [editingKategorija, setEditingKategorija] = useState<Kategorija | null>(null);
  const [editingPodkategorija, setEditingPodkategorija] = useState<Podkategorija | null>(null);
  const [editingDijagnoza, setEditingDijagnoza] = useState<Dijagnoza | null>(null);

  // Form data
  const [kategorijaForm, setKategorijaForm] = useState({
    kod_od: '', kod_do: '', naziv: '', opis: '', boja: '#0891b2', ikona: '', redoslijed: 0
  });
  const [podkategorijaForm, setPodkategorijaForm] = useState({
    kategorija_id: 0, kod_od: '', kod_do: '', naziv: '', opis: '', redoslijed: 0
  });
  const [dijagnozaForm, setDijagnozaForm] = useState({
    kategorija_id: 0, podkategorija_id: null as number | null, kod: '', naziv: '', naziv_lat: '', opis: ''
  });

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadKategorije();
  }, []);

  useEffect(() => {
    if (selectedKategorija) {
      loadPodkategorije(selectedKategorija);
      loadDijagnoze();
    }
  }, [selectedKategorija]);

  useEffect(() => {
    if (activeTab === 'dijagnoze') {
      loadDijagnoze();
    }
  }, [activeTab, currentPage, searchTerm, selectedKategorija, selectedPodkategorija]);

  const loadKategorije = async () => {
    try {
      setLoading(true);
      const [katRes, settingsRes] = await Promise.all([
        adminAPI.get('/admin/mkb10/kategorije'),
        adminAPI.get('/admin/mkb10/settings'),
      ]);
      if (katRes.data.success) {
        setKategorije(katRes.data.data);
      }
      if (settingsRes.data.success) {
        setShowCategoryNameInTabs(settingsRes.data.data.show_category_name_in_tabs);
      }
    } catch (error) {
      toast({ title: 'Greška', description: 'Greška pri učitavanju kategorija', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadPodkategorije = async (kategorijaId: number) => {
    try {
      const res = await adminAPI.get(`/admin/mkb10/kategorije/${kategorijaId}/podkategorije`);
      if (res.data.success) {
        setPodkategorije(res.data.data);
      }
    } catch (error) {
      console.error('Greška pri učitavanju podkategorija:', error);
    }
  };

  const loadDijagnoze = async () => {
    try {
      const params: any = { page: currentPage, per_page: 50 };
      if (selectedKategorija) params.kategorija_id = selectedKategorija;
      if (selectedPodkategorija) params.podkategorija_id = selectedPodkategorija;
      if (searchTerm) params.search = searchTerm;

      const res = await adminAPI.get('/admin/mkb10/dijagnoze', { params });
      if (res.data.success) {
        setDijagnoze(res.data.data.data || []);
        setTotalPages(res.data.data.last_page || 1);
      }
    } catch (error) {
      console.error('Greška pri učitavanju dijagnoza:', error);
    }
  };

  // KATEGORIJE CRUD
  const openKategorijaDialog = (kat?: Kategorija) => {
    if (kat) {
      setEditingKategorija(kat);
      setKategorijaForm({
        kod_od: kat.kod_od, kod_do: kat.kod_do, naziv: kat.naziv,
        opis: kat.opis || '', boja: kat.boja || '#0891b2',
        ikona: kat.ikona || '', redoslijed: kat.redoslijed
      });
    } else {
      setEditingKategorija(null);
      setKategorijaForm({ kod_od: '', kod_do: '', naziv: '', opis: '', boja: '#0891b2', ikona: '', redoslijed: kategorije.length });
    }
    setKategorijaDialog(true);
  };

  const saveKategorija = async () => {
    setSaving(true);
    try {
      if (editingKategorija) {
        await adminAPI.put(`/admin/mkb10/kategorije/${editingKategorija.id}`, kategorijaForm);
        toast({ title: 'Uspjeh', description: 'Kategorija ažurirana' });
      } else {
        await adminAPI.post('/admin/mkb10/kategorije', kategorijaForm);
        toast({ title: 'Uspjeh', description: 'Kategorija kreirana' });
      }
      setKategorijaDialog(false);
      loadKategorije();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Greška pri čuvanju', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteKategorija = async (id: number) => {
    if (!confirm('Da li ste sigurni? Ovo će obrisati i sve podkategorije i dijagnoze!')) return;
    try {
      await adminAPI.delete(`/admin/mkb10/kategorije/${id}`);
      toast({ title: 'Uspjeh', description: 'Kategorija obrisana' });
      loadKategorije();
    } catch (error) {
      toast({ title: 'Greška', description: 'Greška pri brisanju', variant: 'destructive' });
    }
  };

  // PODKATEGORIJE CRUD
  const openPodkategorijaDialog = (pod?: Podkategorija) => {
    if (pod) {
      setEditingPodkategorija(pod);
      setPodkategorijaForm({
        kategorija_id: pod.kategorija_id, kod_od: pod.kod_od, kod_do: pod.kod_do,
        naziv: pod.naziv, opis: pod.opis || '', redoslijed: pod.redoslijed
      });
    } else {
      setEditingPodkategorija(null);
      setPodkategorijaForm({
        kategorija_id: selectedKategorija || 0, kod_od: '', kod_do: '',
        naziv: '', opis: '', redoslijed: podkategorije.length
      });
    }
    setPodkategorijaDialog(true);
  };

  const savePodkategorija = async () => {
    setSaving(true);
    try {
      if (editingPodkategorija) {
        await adminAPI.put(`/admin/mkb10/podkategorije/${editingPodkategorija.id}`, podkategorijaForm);
        toast({ title: 'Uspjeh', description: 'Podkategorija ažurirana' });
      } else {
        await adminAPI.post('/admin/mkb10/podkategorije', podkategorijaForm);
        toast({ title: 'Uspjeh', description: 'Podkategorija kreirana' });
      }
      setPodkategorijaDialog(false);
      if (selectedKategorija) loadPodkategorije(selectedKategorija);
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Greška pri čuvanju', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deletePodkategorija = async (id: number) => {
    if (!confirm('Da li ste sigurni?')) return;
    try {
      await adminAPI.delete(`/admin/mkb10/podkategorije/${id}`);
      toast({ title: 'Uspjeh', description: 'Podkategorija obrisana' });
      if (selectedKategorija) loadPodkategorije(selectedKategorija);
    } catch (error) {
      toast({ title: 'Greška', description: 'Greška pri brisanju', variant: 'destructive' });
    }
  };

  // DIJAGNOZE CRUD
  const openDijagnozaDialog = (dij?: Dijagnoza) => {
    if (dij) {
      setEditingDijagnoza(dij);
      setDijagnozaForm({
        kategorija_id: dij.kategorija_id, podkategorija_id: dij.podkategorija_id || null,
        kod: dij.kod, naziv: dij.naziv, naziv_lat: dij.naziv_lat || '', opis: dij.opis || ''
      });
    } else {
      setEditingDijagnoza(null);
      setDijagnozaForm({
        kategorija_id: selectedKategorija || 0, podkategorija_id: selectedPodkategorija,
        kod: '', naziv: '', naziv_lat: '', opis: ''
      });
    }
    setDijagnozaDialog(true);
  };

  const saveDijagnoza = async () => {
    setSaving(true);
    try {
      if (editingDijagnoza) {
        await adminAPI.put(`/admin/mkb10/dijagnoze/${editingDijagnoza.id}`, dijagnozaForm);
        toast({ title: 'Uspjeh', description: 'Dijagnoza ažurirana' });
      } else {
        await adminAPI.post('/admin/mkb10/dijagnoze', dijagnozaForm);
        toast({ title: 'Uspjeh', description: 'Dijagnoza kreirana' });
      }
      setDijagnozaDialog(false);
      loadDijagnoze();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Greška pri čuvanju', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteDijagnoza = async (id: number) => {
    if (!confirm('Da li ste sigurni?')) return;
    try {
      await adminAPI.delete(`/admin/mkb10/dijagnoze/${id}`);
      toast({ title: 'Uspjeh', description: 'Dijagnoza obrisana' });
      loadDijagnoze();
    } catch (error) {
      toast({ title: 'Greška', description: 'Greška pri brisanju', variant: 'destructive' });
    }
  };

  // IMPORT
  const handleImport = async (type: 'kategorije' | 'dijagnoze', file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (selectedKategorija) formData.append('kategorija_id', selectedKategorija.toString());

    try {
      setSaving(true);
      const res = await adminAPI.post(`/admin/mkb10/import/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast({
        title: 'Import završen',
        description: res.data.message,
      });
      setImportDialog(false);
      loadKategorije();
      if (selectedKategorija) loadDijagnoze();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Greška pri importu', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // SETTINGS
  const toggleShowCategoryName = async () => {
    try {
      const newValue = !showCategoryNameInTabs;
      await adminAPI.put('/admin/mkb10/settings', { show_category_name_in_tabs: newValue });
      setShowCategoryNameInTabs(newValue);
      toast({ title: 'Uspjeh', description: 'Postavka ažurirana' });
    } catch (error) {
      toast({ title: 'Greška', description: 'Greška pri ažuriranju postavke', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MKB-10 Šifarnik bolesti</h2>
          <p className="text-muted-foreground">Upravljanje kategorijama i dijagnozama</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 mr-4 border-r pr-4">
            <Switch
              checked={showCategoryNameInTabs}
              onCheckedChange={toggleShowCategoryName}
              id="show-name"
            />
            <Label htmlFor="show-name" className="text-sm cursor-pointer">
              Prikaži naziv u tabovima
            </Label>
          </div>
          <Button variant="outline" onClick={() => setImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
          <Button variant="outline" onClick={() => window.open('/mkb10', '_blank')}>
            <FileText className="h-4 w-4 mr-2" /> Pregled
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kategorije">Kategorije ({kategorije.length})</TabsTrigger>
          <TabsTrigger value="podkategorije">Podkategorije</TabsTrigger>
          <TabsTrigger value="dijagnoze">Dijagnoze</TabsTrigger>
        </TabsList>

        {/* KATEGORIJE TAB */}
        <TabsContent value="kategorije">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Kategorije MKB-10</CardTitle>
              <Button onClick={() => openKategorijaDialog()}>
                <Plus className="h-4 w-4 mr-2" /> Nova kategorija
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kod</TableHead>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Boja</TableHead>
                    <TableHead>Dijagnoze</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kategorije.map((kat) => (
                    <TableRow key={kat.id}>
                      <TableCell className="font-mono font-bold">{kat.kod_od}-{kat.kod_do}</TableCell>
                      <TableCell className="max-w-md truncate">{kat.naziv}</TableCell>
                      <TableCell>
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: kat.boja || '#ccc' }} />
                      </TableCell>
                      <TableCell>{kat.dijagnoze_count}</TableCell>
                      <TableCell>
                        <Badge variant={kat.aktivan ? 'default' : 'secondary'}>
                          {kat.aktivan ? 'Aktivan' : 'Neaktivan'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedKategorija(kat.id); setActiveTab('podkategorije'); }}>
                          <FolderOpen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openKategorijaDialog(kat)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteKategorija(kat.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PODKATEGORIJE TAB */}
        <TabsContent value="podkategorije">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Podkategorije</CardTitle>
                <CardDescription>
                  <Select value={selectedKategorija?.toString() || ''} onValueChange={(v) => setSelectedKategorija(parseInt(v))}>
                    <SelectTrigger className="w-80 mt-2">
                      <SelectValue placeholder="Odaberite kategoriju" />
                    </SelectTrigger>
                    <SelectContent>
                      {kategorije.map((kat) => (
                        <SelectItem key={kat.id} value={kat.id.toString()}>
                          {kat.kod_od}-{kat.kod_do}: {kat.naziv}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardDescription>
              </div>
              <Button onClick={() => openPodkategorijaDialog()} disabled={!selectedKategorija}>
                <Plus className="h-4 w-4 mr-2" /> Nova podkategorija
              </Button>
            </CardHeader>
            <CardContent>
              {selectedKategorija ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kod</TableHead>
                      <TableHead>Naziv</TableHead>
                      <TableHead>Dijagnoze</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {podkategorije.map((pod) => (
                      <TableRow key={pod.id}>
                        <TableCell className="font-mono">{pod.kod_od}-{pod.kod_do}</TableCell>
                        <TableCell className="max-w-md truncate">{pod.naziv}</TableCell>
                        <TableCell>{pod.dijagnoze_count}</TableCell>
                        <TableCell>
                          <Badge variant={pod.aktivan ? 'default' : 'secondary'}>
                            {pod.aktivan ? 'Aktivan' : 'Neaktivan'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedPodkategorija(pod.id); setActiveTab('dijagnoze'); }}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openPodkategorijaDialog(pod)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deletePodkategorija(pod.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">Odaberite kategoriju</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIJAGNOZE TAB */}
        <TabsContent value="dijagnoze">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dijagnoze</CardTitle>
                <Button onClick={() => openDijagnozaDialog()} disabled={!selectedKategorija}>
                  <Plus className="h-4 w-4 mr-2" /> Nova dijagnoza
                </Button>
              </div>
              <div className="flex gap-4 mt-4">
                <Select value={selectedKategorija?.toString() || 'all'} onValueChange={(v) => { setSelectedKategorija(v === 'all' ? null : parseInt(v)); setSelectedPodkategorija(null); }}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Kategorija" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve kategorije</SelectItem>
                    {kategorije.map((kat) => (
                      <SelectItem key={kat.id} value={kat.id.toString()}>
                        {kat.kod_od}-{kat.kod_do}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pretraži po kodu ili nazivu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={loadDijagnoze}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kod</TableHead>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Latinski</TableHead>
                    <TableHead>Kategorija</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dijagnoze.map((dij) => (
                    <TableRow key={dij.id}>
                      <TableCell className="font-mono font-bold">{dij.kod}</TableCell>
                      <TableCell className="max-w-xs truncate">{dij.naziv}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground italic">{dij.naziv_lat}</TableCell>
                      <TableCell>{dij.kategorija?.kod_od}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDijagnozaDialog(dij)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteDijagnoza(dij.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prethodna</Button>
                  <span className="py-2 px-4">{currentPage} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Sljedeća</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* KATEGORIJA DIALOG */}
      <Dialog open={kategorijaDialog} onOpenChange={setKategorijaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingKategorija ? 'Uredi kategoriju' : 'Nova kategorija'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kod od</Label>
                <Input value={kategorijaForm.kod_od} onChange={(e) => setKategorijaForm({ ...kategorijaForm, kod_od: e.target.value.toUpperCase() })} placeholder="A00" />
              </div>
              <div>
                <Label>Kod do</Label>
                <Input value={kategorijaForm.kod_do} onChange={(e) => setKategorijaForm({ ...kategorijaForm, kod_do: e.target.value.toUpperCase() })} placeholder="B99" />
              </div>
            </div>
            <div>
              <Label>Naziv</Label>
              <Input value={kategorijaForm.naziv} onChange={(e) => setKategorijaForm({ ...kategorijaForm, naziv: e.target.value })} />
            </div>
            <div>
              <Label>Opis</Label>
              <Textarea value={kategorijaForm.opis} onChange={(e) => setKategorijaForm({ ...kategorijaForm, opis: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Boja</Label>
                <Input type="color" value={kategorijaForm.boja} onChange={(e) => setKategorijaForm({ ...kategorijaForm, boja: e.target.value })} />
              </div>
              <div>
                <Label>Redoslijed</Label>
                <Input type="number" value={kategorijaForm.redoslijed} onChange={(e) => setKategorijaForm({ ...kategorijaForm, redoslijed: parseInt(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKategorijaDialog(false)}>Otkaži</Button>
            <Button onClick={saveKategorija} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sačuvaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PODKATEGORIJA DIALOG */}
      <Dialog open={podkategorijaDialog} onOpenChange={setPodkategorijaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPodkategorija ? 'Uredi podkategoriju' : 'Nova podkategorija'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kategorija</Label>
              <Select value={podkategorijaForm.kategorija_id.toString()} onValueChange={(v) => setPodkategorijaForm({ ...podkategorijaForm, kategorija_id: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {kategorije.map((kat) => (
                    <SelectItem key={kat.id} value={kat.id.toString()}>{kat.kod_od}-{kat.kod_do}: {kat.naziv}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kod od</Label>
                <Input value={podkategorijaForm.kod_od} onChange={(e) => setPodkategorijaForm({ ...podkategorijaForm, kod_od: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label>Kod do</Label>
                <Input value={podkategorijaForm.kod_do} onChange={(e) => setPodkategorijaForm({ ...podkategorijaForm, kod_do: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <div>
              <Label>Naziv</Label>
              <Input value={podkategorijaForm.naziv} onChange={(e) => setPodkategorijaForm({ ...podkategorijaForm, naziv: e.target.value })} />
            </div>
            <div>
              <Label>Opis</Label>
              <Textarea value={podkategorijaForm.opis} onChange={(e) => setPodkategorijaForm({ ...podkategorijaForm, opis: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPodkategorijaDialog(false)}>Otkaži</Button>
            <Button onClick={savePodkategorija} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sačuvaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIJAGNOZA DIALOG */}
      <Dialog open={dijagnozaDialog} onOpenChange={setDijagnozaDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDijagnoza ? 'Uredi dijagnozu' : 'Nova dijagnoza'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kategorija</Label>
                <Select value={dijagnozaForm.kategorija_id.toString()} onValueChange={(v) => setDijagnozaForm({ ...dijagnozaForm, kategorija_id: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {kategorije.map((kat) => (
                      <SelectItem key={kat.id} value={kat.id.toString()}>{kat.kod_od}-{kat.kod_do}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kod dijagnoze</Label>
                <Input value={dijagnozaForm.kod} onChange={(e) => setDijagnozaForm({ ...dijagnozaForm, kod: e.target.value.toUpperCase() })} placeholder="A00.0" />
              </div>
            </div>
            <div>
              <Label>Naziv</Label>
              <Input value={dijagnozaForm.naziv} onChange={(e) => setDijagnozaForm({ ...dijagnozaForm, naziv: e.target.value })} />
            </div>
            <div>
              <Label>Latinski naziv</Label>
              <Input value={dijagnozaForm.naziv_lat} onChange={(e) => setDijagnozaForm({ ...dijagnozaForm, naziv_lat: e.target.value })} />
            </div>
            <div>
              <Label>Opis</Label>
              <Textarea value={dijagnozaForm.opis} onChange={(e) => setDijagnozaForm({ ...dijagnozaForm, opis: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDijagnozaDialog(false)}>Otkaži</Button>
            <Button onClick={saveDijagnoza} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sačuvaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMPORT DIALOG */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import MKB-10 podataka</DialogTitle>
            <DialogDescription>
              Podržani formati: CSV (separator ;) ili JSON
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Import kategorija</Label>
              <p className="text-sm text-muted-foreground mb-2">CSV format: kod_od;kod_do;naziv;opis</p>
              <Input
                type="file"
                accept=".csv,.json,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport('kategorije', file);
                }}
              />
            </div>
            <div>
              <Label>Import dijagnoza</Label>
              <p className="text-sm text-muted-foreground mb-2">CSV format: kod;naziv;naziv_lat;opis</p>
              <Input
                type="file"
                accept=".csv,.json,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport('dijagnoze', file);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialog(false)}>Zatvori</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
