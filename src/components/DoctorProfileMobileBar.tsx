import { Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DoctorProfileMobileBarProps {
  prihvataOnline?: boolean;
  telefon: string;
  onBookClick: () => void;
  onPhoneClick?: () => void;
}

export function DoctorProfileMobileBar({
  prihvataOnline,
  telefon,
  onBookClick,
  onPhoneClick,
}: DoctorProfileMobileBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#0891b2]/10 bg-white/95 p-3 shadow-[0_-4px_24px_-8px_rgba(8,145,178,0.2)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        {prihvataOnline ? (
          <Button
            onClick={onBookClick}
            className="h-12 flex-1 rounded-full bg-[#0891b2] text-base font-semibold shadow-md hover:bg-[#0e7490]"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Zakaži termin
          </Button>
        ) : (
          <Button
            asChild
            className="h-12 flex-1 rounded-full bg-[#0891b2] text-base font-semibold shadow-md hover:bg-[#0e7490]"
          >
            <a href={`tel:${telefon}`} onClick={onPhoneClick}>
              <Phone className="mr-2 h-5 w-5" />
              Pozovite
            </a>
          </Button>
        )}
        {prihvataOnline && telefon && (
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full border-[#0891b2]/30 px-4 text-[#0891b2] hover:bg-[#0891b2]/5"
          >
            <a href={`tel:${telefon}`} onClick={onPhoneClick}>
              <Phone className="h-5 w-5" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
