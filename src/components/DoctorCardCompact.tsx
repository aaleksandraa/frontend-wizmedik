import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, User } from 'lucide-react';

interface DoctorData {
  id: number | string;
  slug: string;
  ime?: string;
  prezime?: string;
  specijalnost?: string;
  grad?: string;
  slika_profila?: string;
}

interface DoctorCardCompactProps {
  doctor: DoctorData;
}

export function DoctorCardCompact({ doctor }: DoctorCardCompactProps) {
  const fullName = doctor.ime && doctor.prezime 
    ? `${doctor.ime} ${doctor.prezime}` 
    : 'Nepoznato ime';
  
  const initials = doctor.ime && doctor.prezime
    ? `${doctor.ime[0]}${doctor.prezime[0]}`
    : 'NN';

  return (
    <div className="flex items-start gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
      {/* Profile Image - Left */}
      <Avatar className="h-20 w-20 flex-shrink-0">
        <AvatarImage src={doctor.slika_profila} alt={fullName} />
        <AvatarFallback className="bg-primary/10 text-primary text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Content - Right */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {fullName}
        </h3>

        {/* Specialty */}
        {doctor.specijalnost && (
          <p className="text-sm text-gray-600 mb-2">
            {doctor.specijalnost}
          </p>
        )}

        {/* Location */}
        {doctor.grad && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="h-4 w-4" />
            <span>{doctor.grad}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Link to={`/doktor/${doctor.slug}`}>
              <User className="h-3 w-3 mr-1" />
              O doktoru
            </Link>
          </Button>
          
          <Button
            asChild
            size="sm"
            className="text-xs"
          >
            <Link to={`/doktor/${doctor.slug}#zakazi`}>
              <Calendar className="h-3 w-3 mr-1" />
              Zakaži termin
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
