import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { specialtiesAPI, uploadAPI } from "@/services/api";
import { adminAPI } from "@/services/adminApi";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Save, Trash2, Upload, ExternalLink } from "lucide-react";

interface Specialty {
  id: number;
  naziv: string;
  slug: string;
  children?: Specialty[];
}

interface ServicePage {
  id: number;
  specialty_id: number;
  naziv: string;
  slug: string;
  kratki_opis?: string;
  sadrzaj?: string;
  status: "draft" | "published";
  is_indexable: boolean;
  show_doctor_cta: boolean;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_image?: string;
  specialty?: {
    id: number;
    naziv: string;
    slug: string;
  };
  url?: string;
  updated_at?: string;
}

interface FormState {
  id?: number;
  specialty_id: string;
  naziv: string;
  slug: string;
  kratki_opis: string;
  sadrzaj: string;
  status: "draft" | "published";
  is_indexable: boolean;
  show_doctor_cta: boolean;
  sort_order: number;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
  og_image: string;
}

const initialForm: FormState = {
  specialty_id: "",
  naziv: "",
  slug: "",
  kratki_opis: "",
  sadrzaj: "",
  status: "draft",
  is_indexable: true,
  show_doctor_cta: true,
  sort_order: 0,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  og_image: "",
};

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ä‘/g, "d")
    .replace(/Ä/g, "c")
    .replace(/Ä‡/g, "c")
    .replace(/Å¡/g, "s")
    .replace(/Å¾/g, "z")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const normalizeOptionalUrl = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[^/\s]+\.[^/\s]+/.test(trimmed)) return `https://${trimmed}`;
  if (trimmed.startsWith("/")) return `${window.location.origin}${trimmed}`;

  return undefined;
};

const extractApiErrorMessage = (error: any, fallback: string): string => {
  const errors = error?.response?.data?.errors;
  if (errors && typeof errors === "object") {
    const firstEntry = Object.values(errors)[0];
    if (Array.isArray(firstEntry) && firstEntry.length > 0) {
      return String(firstEntry[0]);
    }
    if (typeof firstEntry === "string") {
      return firstEntry;
    }
  }

  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    fallback
  );
};

const flattenSpecialties = (items: Specialty[]): Specialty[] => {
  const result: Specialty[] = [];
  const walk = (nodes: Specialty[]) => {
    nodes.forEach((node) => {
      result.push({ id: node.id, naziv: node.naziv, slug: node.slug });
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children);
      }
    });
  };
  walk(items);
  return result;
};

export function AdminSpecialtyServicePages() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [pages, setPages] = useState<ServicePage[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">(
    "all"
  );
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");

  const specialtyById = useMemo(() => {
    const map = new Map<number, Specialty>();
    specialties.forEach((s) => map.set(s.id, s));
    return map;
  }, [specialties]);

  const selectedSpecialty =
    form.specialty_id !== "" ? specialtyById.get(Number(form.specialty_id)) : undefined;

  const generatedUrl = useMemo(() => {
    if (!selectedSpecialty?.slug || !form.slug) return "";
    return `/specijalnost/${selectedSpecialty.slug}/${form.slug}`;
  }, [selectedSpecialty?.slug, form.slug]);

  const filteredPages = useMemo(() => {
    const term = search.trim().toLowerCase();

    return pages.filter((page) => {
      if (statusFilter !== "all" && page.status !== statusFilter) return false;
      if (specialtyFilter !== "all" && page.specialty_id !== Number(specialtyFilter)) {
        return false;
      }

      if (!term) return true;

      const haystack = [
        page.naziv,
        page.slug,
        page.specialty?.naziv,
        page.meta_title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [pages, search, statusFilter, specialtyFilter]);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [specialtiesRes, pagesRes] = await Promise.all([
        specialtiesAPI.getAll(),
        adminAPI.getServicePages(),
      ]);

      const normalizedSpecialties = flattenSpecialties(specialtiesRes.data || []);
      setSpecialties(normalizedSpecialties);

      const pagesData = Array.isArray(pagesRes.data)
        ? pagesRes.data
        : pagesRes.data?.data || [];
      setPages(pagesData);

      if (normalizedSpecialties.length > 0) {
        setForm((prev) => ({
          ...prev,
          specialty_id: prev.specialty_id || String(normalizedSpecialties[0].id),
        }));
      }
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "GreÅ¡ka pri uÄitavanju podataka."));
    } finally {
      setLoading(false);
    }
  };

  const mapPageToForm = (page: ServicePage): FormState => ({
    id: page.id,
    specialty_id: String(page.specialty_id),
    naziv: page.naziv || "",
    slug: page.slug || "",
    kratki_opis: page.kratki_opis || "",
    sadrzaj: page.sadrzaj || "",
    status: page.status || "draft",
    is_indexable: page.is_indexable ?? true,
    show_doctor_cta: page.show_doctor_cta ?? true,
    sort_order: page.sort_order || 0,
    meta_title: page.meta_title || "",
    meta_description: page.meta_description || "",
    meta_keywords: page.meta_keywords || "",
    canonical_url: page.canonical_url || "",
    og_image: page.og_image || "",
  });

  const resetForm = () => {
    setForm((prev) => ({
      ...initialForm,
      specialty_id: prev.specialty_id || (specialties[0] ? String(specialties[0].id) : ""),
    }));
    setSlugTouched(false);
  };

  const selectPage = (page: ServicePage) => {
    setForm(mapPageToForm(page));
    setSlugTouched(true);
  };

  const onTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      naziv: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSave = async () => {
    if (!form.specialty_id) {
      toast.error("Odaberite specijalnost.");
      return;
    }
    if (!form.naziv.trim()) {
      toast.error("Naziv usluge je obavezan.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        specialty_id: Number(form.specialty_id),
        naziv: form.naziv.trim(),
        slug: form.slug.trim() || undefined,
        kratki_opis: form.kratki_opis.trim() || undefined,
        sadrzaj: form.sadrzaj || "",
        status: form.status,
        is_indexable: form.is_indexable,
        show_doctor_cta: form.show_doctor_cta,
        sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
        meta_title: form.meta_title.trim() || undefined,
        meta_description: form.meta_description.trim() || undefined,
        meta_keywords: form.meta_keywords.trim() || undefined,
        canonical_url: normalizeOptionalUrl(form.canonical_url),
        og_image: normalizeOptionalUrl(form.og_image),
      };

      const response = form.id
        ? await adminAPI.updateServicePage(form.id, payload)
        : await adminAPI.createServicePage(payload);

      const saved: ServicePage = response.data?.data || response.data;
      const pagesRes = await adminAPI.getServicePages();
      const pagesData = Array.isArray(pagesRes.data)
        ? pagesRes.data
        : pagesRes.data?.data || [];
      setPages(pagesData);

      if (saved?.id) {
        const updated = pagesData.find((p: ServicePage) => p.id === saved.id);
        if (updated) {
          setForm(mapPageToForm(updated));
          setSlugTouched(true);
        }
      }

      toast.success(form.id ? "Stranica je aÅ¾urirana." : "Stranica je kreirana.");
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "GreÅ¡ka pri Äuvanju stranice."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (!confirm("Obrisati ovu stranicu usluge?")) return;

    setDeleting(true);
    try {
      await adminAPI.deleteServicePage(form.id);
      setPages((prev) => prev.filter((p) => p.id !== form.id));
      resetForm();
      toast.success("Stranica je obrisana.");
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "GreÅ¡ka pri brisanju."));
    } finally {
      setDeleting(false);
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file, "blog");
      setForm((prev) => ({ ...prev, og_image: response.data.url }));
      toast.success("Slika je uploadovana.");
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "GreÅ¡ka pri uploadu slike."));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">UÄitavanje...</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Stranice usluga
            <Button size="sm" variant="outline" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Pretraga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={statusFilter}
            onValueChange={(value: "all" | "draft" | "published") => setStatusFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="published">Objavljeno</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Specijalnost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve specijalnosti</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty.id} value={String(specialty.id)}>
                  {specialty.naziv}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ScrollArea className="h-[520px] pr-2">
            <div className="space-y-2">
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => selectPage(page)}
                  className={`w-full text-left rounded-md border p-3 transition-colors ${
                    form.id === page.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm line-clamp-1">{page.naziv}</p>
                    <Badge variant={page.status === "published" ? "default" : "secondary"}>
                      {page.status === "published" ? "Objavljeno" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {page.specialty?.naziv || "Bez specijalnosti"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    /specijalnost/{page.specialty?.slug}/{page.slug}
                  </p>
                </button>
              ))}
              {filteredPages.length === 0 && (
                <p className="text-sm text-muted-foreground">Nema rezultata.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Osnovno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Specijalnost *</Label>
                <Select
                  value={form.specialty_id}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, specialty_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberi specijalnost" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={String(specialty.id)}>
                        {specialty.naziv}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: "draft" | "published") =>
                    setForm((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Objavljeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Naziv usluge *</Label>
              <Input
                value={form.naziv}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="npr. Kolposkopija"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                }}
                placeholder="kolposkopija"
              />
            </div>

            <div className="space-y-2">
              <Label>URL preview</Label>
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                {generatedUrl || "Unesite specijalnost i slug"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_indexable}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, is_indexable: checked }))
                }
              />
              <Label>Indexable (Google moÅ¾e indeksirati)</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.show_doctor_cta}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, show_doctor_cta: checked }))
                }
              />
              <Label>PrikaÅ¾i blok "TraÅ¾ite doktora za ovu uslugu?"</Label>
            </div>

            <div className="space-y-2">
              <Label>Kratki opis</Label>
              <Textarea
                value={form.kratki_opis}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, kratki_opis: e.target.value }))
                }
                rows={3}
                placeholder="SaÅ¾etak usluge za uvod i SEO fallback..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SadrÅ¾aj stranice</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              content={form.sadrzaj}
              onChange={(content) => setForm((prev) => ({ ...prev, sadrzaj: content }))}
              placeholder="PiÅ¡ite sadrÅ¾aj kao blog Älanak..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meta title</Label>
              <Input
                value={form.meta_title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, meta_title: e.target.value }))
                }
                placeholder="Max 70 karaktera"
                maxLength={70}
              />
            </div>

            <div className="space-y-2">
              <Label>Meta description</Label>
              <Textarea
                value={form.meta_description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, meta_description: e.target.value }))
                }
                placeholder="Max 160 karaktera"
                maxLength={160}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Meta keywords</Label>
              <Input
                value={form.meta_keywords}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, meta_keywords: e.target.value }))
                }
                placeholder="npr. ginekologija, kolposkopija, pregled"
              />
            </div>

            <div className="space-y-2">
              <Label>Canonical URL (opcionalno)</Label>
              <Input
                value={form.canonical_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, canonical_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-3">
              <Label>OG slika (upload)</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Label
                  htmlFor="service-og-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Upload..." : "Odaberi sliku"}
                </Label>
                <Input
                  id="service-og-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleOgImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {form.og_image && (
                  <>
                    <a
                      href={form.og_image}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary inline-flex items-center gap-1"
                    >
                      Pregled
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm((prev) => ({ ...prev, og_image: "" }))}
                    >
                      Ukloni sliku
                    </Button>
                  </>
                )}
              </div>

              {form.og_image && (
                <div className="max-w-md rounded-md border bg-muted/20 p-2">
                  <img
                    src={form.og_image}
                    alt="OG preview"
                    className="w-full h-auto rounded-md object-cover"
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Preporuka: 1200x630px, JPG/PNG/WebP, do 5MB.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "ÄŒuvanje..." : "SaÄuvaj stranicu"}
          </Button>

          {form.id && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Brisanje..." : "ObriÅ¡i"}
            </Button>
          )}

          {generatedUrl && (
            <a href={generatedUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Otvori stranicu
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

