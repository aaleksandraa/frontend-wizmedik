import { ClinicListingCard, ClinicListingData } from '@/components/ClinicListingCard';

interface ClinicCardSoftProps {
  clinic: ClinicListingData;
}

export function ClinicCardSoft({ clinic }: ClinicCardSoftProps) {
  return <ClinicListingCard clinic={clinic} />;
}
