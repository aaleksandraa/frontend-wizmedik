// src/services/reviewsAPI.ts

import api from './api';

export interface Recenzija {
  id: number;
  user_id: number;
  termin_id: number;
  recenziran_type: string;
  recenziran_id: number;
  ocjena: number;
  komentar?: string;
  odgovor?: string;
  odgovor_datum?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    ime: string;
    prezime: string;
  };
  termin?: {
    id: number;
    datum_vrijeme: string;
    status: string;
  };
}

export interface CreateRecenzijaData {
  termin_id: number;
  recenziran_type: string;
  recenziran_id: number;
  ocjena: number;
  komentar?: string;
}

export interface UpdateRecenzijaData {
  ocjena: number;
  komentar?: string;
}

export interface RatingStats {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  rating_display: string;
  rating_percentage: number;
}

export interface CanReviewResponse {
  can_review: boolean;
  reason?: string;
  recenzija_id?: number;
}

export interface EligibleTermin {
  id: number;
  datum_vrijeme: string;
  doktor_id: number;
  klinika_id?: number;
  status: string;
  doktor?: {
    id: number;
    ime: string;
    prezime: string;
  };
  klinika?: {
    id: number;
    naziv: string;
  };
}

export const reviewsAPI = {
  /**
   * Dohvati sve recenzije za doktora
   */
  getByDoktor: (doktorId: number) => 
    api.get<Recenzija[]>(`/recenzije/doktor/${doktorId}`),
  
  /**
   * Dohvati sve recenzije za kliniku
   */
  getByKlinika: (klinikaId: number) => 
    api.get<Recenzija[]>(`/recenzije/klinika/${klinikaId}`),
  
  /**
   * Dohvati statistiku ocjena
   */
  getRatingStats: (type: 'doktor' | 'klinika', id: number) => 
    api.get<RatingStats>(`/recenzije/${type}/${id}/stats`),
  
  /**
   * Kreiraj novu recenziju
   */
  create: (data: CreateRecenzijaData) => 
    api.post<Recenzija>('/recenzije', data),
  
  /**
   * Ažuriraj postojeću recenziju
   */
  update: (id: number, data: UpdateRecenzijaData) => 
    api.put<Recenzija>(`/recenzije/${id}`, data),
  
  /**
   * Obriši recenziju
   */
  delete: (id: number) => 
    api.delete(`/recenzije/${id}`),
  
  /**
   * Dodaj odgovor na recenziju (za doktore/klinike)
   */
  addResponse: (id: number, odgovor: string) => 
    api.post<Recenzija>(`/recenzije/${id}/odgovor`, { odgovor }),
  
  /**
   * Provjeri da li korisnik može recenzirati određeni termin
   */
  canReview: (terminId: number) => 
    api.get<CanReviewResponse>(`/recenzije/termin/${terminId}/can-review`),
  
  /**
   * Dohvati sve recenzije trenutnog korisnika
   */
  getMyRecenzije: () => 
    api.get<Recenzija[]>('/recenzije/my'),
  
  /**
   * Dohvati termine koji mogu biti recenzirani
   */
  getEligibleTermini: () => 
    api.get<{ termini: EligibleTermin[] }>('/recenzije/eligible-termini'),
};