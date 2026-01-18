import { useState, useEffect } from 'react';
import { adminAPI, specialtiesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, Trash2, Youtube, HelpCircle, Briefcase, Search, Save, X,
  Heart, Brain, Bone, Eye, Ear, Pill, Syringe, Activity, Stethoscope,
  Baby, Users, Microscope, Dna, Zap, Droplet, Wind, Thermometer,
  Scissors, Bandage, Shield, Smile, Footprints, Hand
} from 'lucide-react';

interface Specialty {
  id: number;
  naziv: string;
  slug?: string;
  icon_url?: string;
  parent_id?: number;
  opis?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  kljucne_rijeci?: string[];
  detaljan_opis?: string;
  prikazi_video_savjete?: boolean;
  youtube_linkovi?: Array<{ url: string; naslov: string; opis?: string }>;
  prikazi_faq?: boolean;
  faq?: Array<{ pitanje: string; odgovor: string }>;
  prikazi_usluge?: boolean;
  usluge?: Array<{ naziv: string; opis?: string }>;
  uvodni_tekst?: string;
  zakljucni_tekst?: string;
  og_image?: string;
}

interface Props {
  specialty: Specialty | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  allSpecialties: Specialty[];
}

// Predefined medical icons
const medicalIcons = [
  { name: 'Stethoscope', icon: Stethoscope, label: 'Stetoskop' },
  { name: 'Heart', icon: Heart, label: 'Srce' },
  { name: 'Brain', icon: Brain, label: 'Mozak' },
  { name: 'Bone', icon: Bone, label: 'Kost' },
  { name: 'Eye', icon: Eye, label: 'Oko' },
  { name: 'Ear', icon: Ear, label: 'Uho' },
  { name: 'Pill', icon: Pill, label: 'Pilula' },
  { name: 'Syringe', icon: Syringe, label: 'Špric' },
  { name: 'Activity', icon: Activity, label: 'Aktivnost' },
  { name: 'Baby', icon: Baby, label: 'Beba' },
  { name: 'Users', icon: Users, label: 'Ljudi' },
  { name: 'Microscope', icon: Microscope, label: 'Mikroskop' },
  { name: 'Dna', icon: Dna, label: 'DNK' },
  { name: 'Zap', icon: Zap, label: 'Struja' },
  { name: 'Droplet', icon: Droplet, label: 'Kap' },
  { name: 'Wind', icon: Wind, label: 'Disanje' },
  { name: 'Thermometer', icon: Thermometer, label: 'Termometar' },
  { name: 'Scissors', icon: Scissors, label: 'Makaze' },
  { name: 'Bandage', icon: Bandage, label: 'Zavoj' },
  { name: 'Shield', icon: Shield, label: 'Štit' },
  { name: 'Smile', icon: Smile, label: 'Osmijeh' },
  { name: 'Footprints', icon: Footprints, label: 'Stopala' },
  { name: 'Hand', icon: Hand, label: 'Ruka' },
];

export function SpecialtyEditor({ specialty, open, onClose, onSaved, allSpecialties }: Props) {
  const [form, setForm] = useState<Specialty>({
    id: 0,
    naziv: '',
    opis: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    kljucne_rijeci: [],
    detaljan_opis: '',
    prikazi_video_savjete: false,
    youtube_linkovi: [],
    prikazi_faq: false,
    faq: [],
    prikazi_usluge: false,
    usluge: [],
    uvodni_tekst: '',
    zakljucni_tekst: '',
    og_image: '',
  });
  const [keywordsInput, setKeywordsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [iconType, setIconType] = useState<'upload' | 'predefined'>('upload');
  const [selectedPredefinedIcon, setSelectedPredefinedIcon] = useState<string>('');

  useEffect(() => {
    // Only reset form when dialog opens with a new specialty
    if (open && specialty && specialty.id) {
      setForm({
        id: specialty.id,
        naziv: specialty.naziv || '',
        parent_id: specialty.parent_id,
        opis: specialty.opis || '',
        meta_title: specialty.meta_title || '',
        meta_description: specialty.meta_description || '',
        meta_keywords: specialty.meta_keywords || '',
        kljucne_rijeci: specialty.kljucne_rijeci || [],
        detaljan_opis: specialty.detaljan_opis || '',
        prikazi_video_savjete: specialty.prikazi_video_savjete || false,
        youtube_linkovi: specialty.youtube_linkovi || [],
        prikazi_faq: specialty.prikazi_faq || false,
        faq: specialty.faq || [],
        prikazi_usluge: specialty.prikazi_usluge || false,
        usluge: specialty.usluge || [],
        uvodni_tekst: specialty.uvodni_tekst || '',
        zakljucni_tekst: specialty.zakljucni_tekst || '',
        og_image: specialty.og_image || '',
      });
      
      setKeywordsInput('');
      setIconFile(null);
      setIconPreview('');
      // Detect icon type
      if (specialty.icon_url?.startsWith('icon:')) {
        setIconType('predefined');
        setSelectedPredefinedIcon(specialty.icon_url.replace('icon:', ''));
      } else {
        setIconType('upload');
        setSelectedPredefinedIcon('');
      }
    } else if (open && (!specialty || !specialty.id)) {
      setForm({
        id: 0,
        naziv: '',
        parent_id: specialty?.parent_id,
        opis: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        kljucne_rijeci: [],
        detaljan_opis: '',
        prikazi_video_savjete: false,
        youtube_linkovi: [],
        prikazi_faq: false,
        faq: [],
        prikazi_usluge: false,
        usluge: [],
        uvodni_tekst: '',
        zakljucni_tekst: '',
        og_image: '',
      });
      setKeywordsInput('');
    }
  }, [open, specialty?.id]); // Only re-run when dialog opens or specialty ID changes

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteIcon = async () => {
    if (!specialty?.id) {
      // If creating new, just clear local state
      setIconFile(null);
      setIconPreview('');
      setSelectedPredefinedIcon('');
      setForm({ ...form, icon_url: '' });
      return;
    }

    // If editing existing, send request to delete icon
    try {
      await adminAPI.updateSpecialty(specialty.id, { ...form, icon_url: '' });
      setIconFile(null);
      setIconPreview('');
      setSelectedPredefinedIcon('');
      setForm({ ...form, icon_url: '' });
      toast.success('Ikona obrisana');
      onSaved(); // Refresh the list
    } catch (error: any) {
      toast.error('Greška pri brisanju ikone');
    }
  };

  const handleSave = async () => {
    if (!form.naziv.trim()) {
      toast.error('Naziv je obavezan');
      return;
    }

    setSaving(true);
    try {
      if (specialty?.id) {
        // Always use FormData to ensure proper handling of all fields
        const formData = new FormData();
        
        // Add all form fields
        Object.keys(form).forEach(key => {
          const value = form[key as keyof Specialty];
          if (value !== null && value !== undefined) {
            if (Array.isArray(value) || (typeof value === 'object')) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Handle icon based on type
        if (iconType === 'predefined' && selectedPredefinedIcon) {
          formData.set('icon_url', `icon:${selectedPredefinedIcon}`);
        } else if (iconType === 'upload' && iconFile) {
          formData.append('icon', iconFile);
        } else if (!iconPreview && !specialty.icon_url) {
          // No icon selected, clear it
          formData.set('icon_url', '');
        }

        await adminAPI.updateSpecialty(specialty.id, formData);
        toast.success('Specijalnost ažurirana');
      } else {
        // For creating new specialty, also use FormData if there's an icon
        if (iconFile || (iconType === 'predefined' && selectedPredefinedIcon)) {
          const formData = new FormData();
          Object.keys(form).forEach(key => {
            const value = form[key as keyof Specialty];
            if (value !== null && value !== undefined) {
              if (Array.isArray(value) || (typeof value === 'object')) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, String(value));
              }
            }
          });
          
          if (iconType === 'predefined' && selectedPredefinedIcon) {
            formData.append('icon_url', `icon:${selectedPredefinedIcon}`);
          } else if (iconFile) {
            formData.append('icon', iconFile);
          }
          
          await adminAPI.createSpecialty(formData);
        } else {
          await adminAPI.createSpecialty(form);
        }
        toast.success('Specijalnost kreirana');
      }
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving specialty:', error);
      toast.error(error.response?.data?.message || 'Greška pri čuvanju');
    } finally {
      setSaving(false);
    }
  };

  const addYouTubeLink = () => {
    setForm({
      ...form,
      youtube_linkovi: [...(form.youtube_linkovi || []), { url: '', naslov: '', opis: '' }]
    });
  };

  const removeYouTubeLink = (index: number) => {
    setForm({
      ...form,
      youtube_linkovi: form.youtube_linkovi?.filter((_, i) => i !== index)
    });
  };

  const updateYouTubeLink = (index: number, field: string, value: string) => {
    const updated = [...(form.youtube_linkovi || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, youtube_linkovi: updated });
  };

  const addFAQ = () => {
    setForm({
      ...form,
      faq: [...(form.faq || []), { pitanje: '', odgovor: '' }]
    });
  };

  const removeFAQ = (index: number) => {
    setForm({
      ...form,
      faq: form.faq?.filter((_, i) => i !== index)
    });
  };

  const updateFAQ = (index: number, field: string, value: string) => {
    const updated = [...(form.faq || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, faq: updated });
  };

  const addUsluga = () => {
    setForm({
      ...form,
      usluge: [...(form.usluge || []), { naziv: '', opis: '' }]
    });
  };

  const removeUsluga = (index: number) => {
    setForm({
      ...form,
      usluge: form.usluge?.filter((_, i) => i !== index)
    });
  };

  const updateUsluga = (index: number, field: string, value: string) => {
    const updated = [...(form.usluge || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, usluge: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{specialty ? 'Uredi specijalnost' : 'Nova specijalnost'}</DialogTitle>
          <DialogDescription>
            {specialty ? 'Uredite podatke o specijalnosti' : 'Dodajte novu medicinsku specijalnost'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Osnovno</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="content">Sadržaj</TabsTrigger>
            <TabsTrigger value="media">Video & FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Naziv specijalnosti *</Label>
                <Input
                  value={form.naziv}
                  onChange={(e) => setForm({ ...form, naziv: e.target.value })}
                  placeholder="npr. Kardiologija"
                />
              </div>
              <div className="space-y-2">
                <Label>Glavna kategorija</Label>
                <Select
                  value={form.parent_id?.toString() || 'none'}
                  onValueChange={(v) => setForm({ ...form, parent_id: v === 'none' ? undefined : parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberi kategoriju" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Glavna kategorija</SelectItem>
                    {allSpecialties.filter(s => !s.parent_id && s.id !== specialty?.id).map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.naziv}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kratak opis</Label>
              <Textarea
                value={form.opis || ''}
                onChange={(e) => setForm({ ...form, opis: e.target.value })}
                placeholder="Kratak opis specijalnosti..."
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <Label>Ikona specijalnosti</Label>
              
              {/* Icon Type Selector */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={iconType === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIconType('upload')}
                >
                  Upload sliku
                </Button>
                <Button
                  type="button"
                  variant={iconType === 'predefined' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIconType('predefined')}
                >
                  Odaberi ikonu
                </Button>
              </div>

              {/* Upload Section */}
              {iconType === 'upload' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    {(iconPreview || (specialty?.icon_url && !specialty.icon_url.startsWith('icon:'))) && (
                      <div className="w-16 h-16 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                        <img 
                          src={iconPreview || specialty?.icon_url} 
                          alt="Icon preview" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Preporučena veličina: 64x64px. Podržani formati: JPG, PNG, SVG, WebP
                      </p>
                    </div>
                  </div>
                  {(iconPreview || specialty?.icon_url) && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteIcon}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Obriši ikonu
                    </Button>
                  )}
                </div>
              )}

              {/* Predefined Icons Section */}
              {iconType === 'predefined' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Odaberite ikonu iz galerije:
                  </p>
                  <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                    {medicalIcons.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setSelectedPredefinedIcon(item.name)}
                          className={`p-3 rounded-lg border-2 transition-all hover:border-primary hover:bg-primary/5 flex flex-col items-center gap-1 ${
                            selectedPredefinedIcon === item.name
                              ? 'border-primary bg-primary/10'
                              : 'border-border'
                          }`}
                          title={item.label}
                        >
                          <IconComponent className="w-6 h-6" />
                          <span className="text-xs truncate w-full text-center">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedPredefinedIcon && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {(() => {
                          const selected = medicalIcons.find(i => i.name === selectedPredefinedIcon);
                          if (selected) {
                            const IconComponent = selected.icon;
                            return <IconComponent className="w-6 h-6 text-primary" />;
                          }
                          return null;
                        })()}
                      </div>
                      <span className="text-sm font-medium flex-1">
                        Odabrano: {medicalIcons.find(i => i.name === selectedPredefinedIcon)?.label}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPredefinedIcon('')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  SEO Optimizacija
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title (max 70 karaktera)</Label>
                  <Input
                    value={form.meta_title || ''}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="npr. Kardiologija - Pronađite kardiologa | MediBIH"
                    maxLength={70}
                  />
                  <p className="text-xs text-muted-foreground">{(form.meta_title || '').length}/70</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description (max 160 karaktera)</Label>
                  <Textarea
                    value={form.meta_description || ''}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Opis koji će se prikazati u rezultatima pretrage..."
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">{(form.meta_description || '').length}/160</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Keywords</Label>
                  <Input
                    value={form.meta_keywords || ''}
                    onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                    placeholder="kardiologija, kardiolog, srce, pregled..."
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Ključne riječi za pretragu (tagovi/sinonimi)</Label>
                    <span className="text-xs text-muted-foreground">
                      {form.kljucne_rijeci?.length || 0} ključnih riječi
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dodajte sve moguće riječi koje korisnici mogu ukucati da pronađu ovu specijalnost. 
                    Ove riječi nisu vidljive javno, služe samo za pretragu. Npr: "ortoped", "kosti", "zglobovi" za Ortopediju.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={keywordsInput}
                        onChange={(e) => {
                          setKeywordsInput(e.target.value);
                        }}
                        placeholder="Unesite ključnu riječ..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            const newKeyword = keywordsInput.trim().toLowerCase();
                            if (newKeyword) {
                              setForm(prevForm => {
                                if (!prevForm.kljucne_rijeci?.includes(newKeyword)) {
                                  const updatedKeywords = [...(prevForm.kljucne_rijeci || []), newKeyword];
                                  return { ...prevForm, kljucne_rijeci: updatedKeywords };
                                }
                                return prevForm;
                              });
                              setKeywordsInput('');
                            }
                          }
                        }}
                      />
                      {keywordsInput.trim() && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-1">
                          Pritisnite Enter ↵
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="default"
                      size="icon"
                      onClick={() => {
                        const newKeyword = keywordsInput.trim().toLowerCase();
                        if (newKeyword) {
                          setForm(prevForm => {
                            if (!prevForm.kljucne_rijeci?.includes(newKeyword)) {
                              const updatedKeywords = [...(prevForm.kljucne_rijeci || []), newKeyword];
                              return { ...prevForm, kljucne_rijeci: updatedKeywords };
                            }
                            return prevForm;
                          });
                          setKeywordsInput('');
                        }
                      }}
                      disabled={!keywordsInput.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Bulk unos (odvojeno zarezom)</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="bulk-keywords-input"
                        placeholder="Unesite više ključnih riječi odvojenih zarezom, npr: srce, srcani, kardio, infarkt"
                        rows={2}
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            const target = e.target as HTMLTextAreaElement;
                            const words = target.value.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                            if (words.length > 0) {
                              setForm(prevForm => {
                                const existing = prevForm.kljucne_rijeci || [];
                                const newWords = words.filter(w => !existing.includes(w));
                                if (newWords.length > 0) {
                                  const updatedKeywords = [...existing, ...newWords];
                                  return { ...prevForm, kljucne_rijeci: updatedKeywords };
                                }
                                return prevForm;
                              });
                              target.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => {
                          const textarea = document.getElementById('bulk-keywords-input') as HTMLTextAreaElement;
                          if (textarea && textarea.value.trim()) {
                            const words = textarea.value.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                            if (words.length > 0) {
                              setForm(prevForm => {
                                const existing = prevForm.kljucne_rijeci || [];
                                const newWords = words.filter(w => !existing.includes(w));
                                if (newWords.length > 0) {
                                  const updatedKeywords = [...existing, ...newWords];
                                  return { ...prevForm, kljucne_rijeci: updatedKeywords };
                                }
                                return prevForm;
                              });
                              textarea.value = '';
                            }
                          }
                        }}
                      >
                        Dodaj sve
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pritisnite Enter ili kliknite "Dodaj sve" da dodate riječi
                    </p>
                  </div>
                  {form.kljucne_rijeci && form.kljucne_rijeci.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Trenutne ključne riječi:</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive h-6"
                          onClick={() => setForm({ ...form, kljucne_rijeci: [] })}
                        >
                          Obriši sve
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 border rounded-md bg-muted/30">
                        {form.kljucne_rijeci.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => setForm(prevForm => ({
                                ...prevForm,
                                kljucne_rijeci: prevForm.kljucne_rijeci?.filter((_, i) => i !== index)
                              }))}
                              className="hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input
                    value={form.og_image || ''}
                    onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Uvodni tekst (prikazuje se na vrhu stranice)</Label>
              <Textarea
                value={form.uvodni_tekst || ''}
                onChange={(e) => setForm({ ...form, uvodni_tekst: e.target.value })}
                placeholder="Uvodni tekst o specijalnosti..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Detaljan opis</Label>
              <Textarea
                value={form.detaljan_opis || ''}
                onChange={(e) => setForm({ ...form, detaljan_opis: e.target.value })}
                placeholder="Detaljan opis specijalnosti, usluga, tretmana..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Zaključni tekst (prikazuje se na dnu stranice)</Label>
              <Textarea
                value={form.zakljucni_tekst || ''}
                onChange={(e) => setForm({ ...form, zakljucni_tekst: e.target.value })}
                placeholder="Zaključni tekst, poziv na akciju..."
                rows={4}
              />
            </div>

            {/* Usluge */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Usluge
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.prikazi_usluge}
                      onCheckedChange={(v) => setForm({ ...form, prikazi_usluge: v })}
                    />
                    <Label>Prikaži</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.usluge?.map((usluga, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={usluga.naziv}
                        onChange={(e) => updateUsluga(index, 'naziv', e.target.value)}
                        placeholder="Naziv usluge"
                      />
                      <Input
                        value={usluga.opis || ''}
                        onChange={(e) => updateUsluga(index, 'opis', e.target.value)}
                        placeholder="Opis (opcionalno)"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeUsluga(index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addUsluga}>
                  <Plus className="w-4 h-4 mr-1" /> Dodaj uslugu
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-4">
            {/* YouTube */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    Video savjeti
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.prikazi_video_savjete}
                      onCheckedChange={(v) => setForm({ ...form, prikazi_video_savjete: v })}
                    />
                    <Label>Prikaži</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.youtube_linkovi?.map((video, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={video.url}
                        onChange={(e) => updateYouTubeLink(index, 'url', e.target.value)}
                        placeholder="YouTube URL"
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeYouTubeLink(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      value={video.naslov}
                      onChange={(e) => updateYouTubeLink(index, 'naslov', e.target.value)}
                      placeholder="Naslov videa"
                    />
                    <Input
                      value={video.opis || ''}
                      onChange={(e) => updateYouTubeLink(index, 'opis', e.target.value)}
                      placeholder="Opis (opcionalno)"
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addYouTubeLink}>
                  <Plus className="w-4 h-4 mr-1" /> Dodaj video
                </Button>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Često postavljana pitanja (FAQ)
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.prikazi_faq}
                      onCheckedChange={(v) => setForm({ ...form, prikazi_faq: v })}
                    />
                    <Label>Prikaži</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.faq?.map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={item.pitanje}
                        onChange={(e) => updateFAQ(index, 'pitanje', e.target.value)}
                        placeholder="Pitanje"
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeFAQ(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Textarea
                      value={item.odgovor}
                      onChange={(e) => updateFAQ(index, 'odgovor', e.target.value)}
                      placeholder="Odgovor"
                      rows={3}
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addFAQ}>
                  <Plus className="w-4 h-4 mr-1" /> Dodaj pitanje
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-1" /> Otkaži
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" /> {saving ? 'Čuvanje...' : 'Sačuvaj'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
