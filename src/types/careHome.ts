// Domovi za njegu Types

export interface DomUpitFormData {
  ime: string;
  email: string;
  telefon?: string;
  poruka: string;
  opis_potreba?: string;
  zelja_posjeta?: string;
  tip?: 'upit' | 'rezervacija';
}

export interface DomRecenzijaFormData {
  ocjena: number;
  komentar?: string;
  ime?: string;
}
