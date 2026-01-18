import { 
  Heart, Brain, Bone, Eye, Ear, Pill, Syringe, Activity, Stethoscope,
  Baby, Users, Microscope, Dna, Zap, Droplet, Wind, Thermometer,
  Scissors, Bandage, Shield, Smile, Footprints, Hand, LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Eye,
  Ear,
  Pill,
  Syringe,
  Activity,
  Baby,
  Users,
  Microscope,
  Dna,
  Zap,
  Droplet,
  Wind,
  Thermometer,
  Scissors,
  Bandage,
  Shield,
  Smile,
  Footprints,
  Hand,
};

interface Props {
  iconUrl?: string;
  alt: string;
  className?: string;
  fallbackIcon?: LucideIcon;
}

export function IconRenderer({ iconUrl, alt, className = "w-6 h-6", fallbackIcon: FallbackIcon = Stethoscope }: Props) {
  // Check if it's a predefined icon
  if (iconUrl?.startsWith('icon:')) {
    const iconName = iconUrl.replace('icon:', '');
    const IconComponent = iconMap[iconName] || FallbackIcon;
    return <IconComponent className={className} />;
  }

  // Check if it's an uploaded image
  if (iconUrl) {
    return <img src={iconUrl} alt={alt} className={`${className} object-contain`} />;
  }

  // Fallback to default icon
  return <FallbackIcon className={className} />;
}
