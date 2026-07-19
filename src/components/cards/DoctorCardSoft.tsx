import { DoctorListingCard, DoctorListingData } from '@/components/DoctorListingCard';

interface DoctorCardSoftProps {
  doctor: DoctorListingData;
}

export function DoctorCardSoft({ doctor }: DoctorCardSoftProps) {
  return <DoctorListingCard doctor={doctor} />;
}
