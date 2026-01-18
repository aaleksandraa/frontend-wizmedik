// Banje i Rehabilitacija Types

export interface VrstaBanje {
  id: number;
  naziv: string;
  slug: string;
  opis?: string;
  ikona?: string;
  redoslijed: number;
  aktivan: boolean;
  banje_count?: number;
}

export interface Indikacija {
  id: number;
  naziv: string;
  slug: string;
  kategorija?: string;
  opis?: string;
  medicinski_opis?: string;
  redoslijed: number;
  aktivan: boolean;
  banje_count?: number;
  pivot?: {
    prioritet: number;
    napomena?: string;
  };
}

export interface Terapija {
  id: number;
  naziv: string;
  slug: string;
  kategorija?: string;
  opis?: string;
  medicinski_opis?: string;
  redoslijed: number;
  aktivan: boolean;
  banje_count?: number;
  pivot?: {
    cijena?: number;
    trajanje_minuta?: number;
    napomena?: string;
  };
}

export interface BanjaPaket {
  id: number;
  banja_id: number;
  naziv: string;
  opis?: string;
  trajanje_dana?: number;
  cijena?: number;
  ukljuceno?: string[];
  aktivan: boolean;
  created_at: string;
  updated_at: string;
}

export interface BanjaRecenzija {
  id: number;
  banja_id: number;
  user_id?: number;
  ime?: string;
  ocjena: number;
  komentar?: string;
  verifikovano: boolean;
  odobreno: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface BanjaUpit {
  id: number;
  banja_id: number;
  user_id?: number;
  ime: string;
  email: string;
  telefon?: string;
  poruka: string;
  datum_dolaska?: string;
  broj_osoba?: number;
  tip: 'upit' | 'rezervacija';
  status: 'novi' | 'procitan' | 'odgovoren' | 'zatvoren';
  created_at: string;
  updated_at: string;
}

export interface Banja {
  id: number;
  naziv: string;
  slug: string;
  grad: string;
  regija?: string;
  adresa: string;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
  telefon?: string;
  email?: string;
  website?: string;
  opis: string;
  detaljni_opis?: string;
  
  // Medical data
  medicinski_nadzor: boolean;
  fizijatar_prisutan: boolean;
  medicinsko_osoblje?: string;
  
  // Accommodation
  ima_smjestaj: boolean;
  broj_kreveta?: number;
  
  // Online features
  online_rezervacija: boolean;
  online_upit: boolean;
  
  // Status
  verifikovan: boolean;
  aktivan: boolean;
  
  // Ratings
  prosjecna_ocjena: number;
  broj_recenzija: number;
  broj_pregleda: number;
  
  // Images
  featured_slika?: string;
  galerija?: string[];
  
  // Working hours
  radno_vrijeme?: Record<string, any>;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Relationships
  vrste?: VrstaBanje[];
  indikacije?: Indikacija[];
  terapije?: Terapija[];
  customTerapije?: CustomTerapija[];
  paketi?: BanjaPaket[];
  recenzije?: BanjaRecenzija[];
  
  // Computed
  url: string;
}

export interface CustomTerapija {
  id: number;
  banja_id: number;
  naziv: string;
  opis?: string;
  cijena?: number;
  trajanje_minuta?: number;
  redoslijed: number;
  aktivan: boolean;
  created_at: string;
  updated_at: string;
}

export interface BanjaFilters {
  grad?: string;
  regija?: string;
  search?: string;
  vrsta_id?: number;
  indikacija_id?: number;
  terapija_id?: number;
  medicinski_nadzor?: boolean;
  ima_smjestaj?: boolean;
  online_rezervacija?: boolean;
  sort_by?: 'naziv' | 'grad' | 'prosjecna_ocjena' | 'broj_recenzija' | 'broj_pregleda' | 'created_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export interface BanjaStatistics {
  ukupno_banja: number;
  ukupno_vrsta: number;
  ukupno_indikacija: number;
  ukupno_terapija: number;
  ukupno_gradova: number;
  prosjecna_ocjena: number;
  ukupno_recenzija: number;
  sa_medicinskimNadzor: number;
  sa_smjestajem: number;
}

export interface BanjaDashboardStats {
  broj_pregleda: number;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  ukupno_upita: number;
  novi_upiti: number;
  procitani_upiti: number;
  odgovoreni_upiti: number;
  recenzije_na_cekanju: number;
  odobrene_recenzije: number;
  status: {
    aktivan: boolean;
    verifikovan: boolean;
  };
  views_trend?: Array<{
    date: string;
    views: number;
  }>;
}

export interface BanjaUpitFormData {
  ime: string;
  email: string;
  telefon?: string;
  poruka: string;
  datum_dolaska?: string;
  broj_osoba?: number;
  tip?: 'upit' | 'rezervacija';
}

export interface BanjaRecenzijaFormData {
  ocjena: number;
  komentar?: string;
  ime?: string;
}
