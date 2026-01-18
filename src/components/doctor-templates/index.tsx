import { DoctorTemplateModern } from './DoctorTemplateModern';
import { DoctorTemplateCard } from './DoctorTemplateCard';
import { DoctorTemplateMinimal } from './DoctorTemplateMinimal';

export type DoctorTemplateType = 'classic' | 'modern' | 'card' | 'minimal';

export interface GuestVisitService {
  id: number;
  naziv: string;
  opis?: string;
  cijena?: number;
  trajanje_minuti: number;
}

export interface GuestVisit {
  id: number;
  datum: string;
  vrijeme_od: string;
  vrijeme_do: string;
  slot_trajanje_minuti: number;
  prihvata_online_rezervacije: boolean;
  usluge: GuestVisitService[];
  klinika: {
    id: number;
    naziv: string;
    lokacija: string;
    grad: string;
    slug: string;
    google_maps_link?: string;
    telefon?: string;
  };
}

interface DoctorTemplateProps {
  template: DoctorTemplateType;
  doctor: any;
  services: any[];
  recenzije: any[];
  ratingStats: any;
  onBookClick: () => void;
  onGuestBookClick: () => void;
  onBookService?: (serviceId: number) => void;
  onGuestVisitBook?: (visit: GuestVisit) => void;
  guestVisits?: GuestVisit[];
  isLoggedIn: boolean;
  coverType?: 'gradient' | 'image';
  coverValue?: string;
  children?: React.ReactNode;
}

export function DoctorTemplate({ template, children, coverType, coverValue, guestVisits, onGuestVisitBook, ...props }: DoctorTemplateProps) {
  switch (template) {
    case 'modern':
      return <DoctorTemplateModern {...props} coverType={coverType} coverValue={coverValue} guestVisits={guestVisits} onGuestVisitBook={onGuestVisitBook} />;
    case 'card':
      return <DoctorTemplateCard {...props} guestVisits={guestVisits} onGuestVisitBook={onGuestVisitBook} />;
    case 'minimal':
      return <DoctorTemplateMinimal {...props} guestVisits={guestVisits} onGuestVisitBook={onGuestVisitBook} />;
    case 'classic':
    default:
      return <>{children}</>;
  }
}

export { DoctorTemplateModern, DoctorTemplateCard, DoctorTemplateMinimal };
