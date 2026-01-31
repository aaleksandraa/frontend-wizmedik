import { AnimatedLogo } from './AnimatedLogo';
import { useLogoSettings } from '@/hooks/useLogoSettings';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const { settings, loading } = useLogoSettings();

  if (loading) {
    return <div className="h-10 w-32 bg-muted animate-pulse rounded" />;
  }

  if (!settings.logo_enabled) {
    return <AnimatedLogo size={size} className={className} />;
  }

  const logoContent = settings.logo_type === 'text' || !settings.logo_url ? (
    <AnimatedLogo size={size} className={className} />
  ) : (
    <img
      src={settings.logo_url}
      alt="WizMedik"
      className={cn('transition-transform group-hover:scale-105', className)}
      style={{ 
        height: '70px',
        width: 'auto',
        objectFit: 'contain'
      }}
    />
  );

  // If heart icon is enabled, wrap with heart
  if (settings.show_heart_icon_header) {
    return (
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-[rgb(8,145,178)]/10 group-hover:bg-[rgb(8,145,178)]/20 transition-colors">
          <Heart className="h-8 w-8" style={{ color: 'rgb(8, 145, 178)' }} />
        </div>
        {logoContent}
      </div>
    );
  }

  return logoContent;
}

// Compact version for mobile
export function LogoCompact({ className }: { className?: string }) {
  const { settings, loading } = useLogoSettings();

  if (loading || !settings.logo_enabled) {
    return <AnimatedLogo size="sm" className={className} />;
  }

  const logoContent = settings.logo_type === 'text' || !settings.logo_url ? (
    <AnimatedLogo size="sm" className={className} />
  ) : (
    <img
      src={settings.logo_url}
      alt="WizMedik"
      className={cn(className)}
      style={{ 
        height: '50px',
        width: 'auto',
        objectFit: 'contain'
      }}
    />
  );

  // If heart icon is enabled, wrap with heart (smaller for mobile)
  if (settings.show_heart_icon_header) {
    return (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-[rgb(8,145,178)]/10">
          <Heart className="h-6 w-6" style={{ color: 'rgb(8, 145, 178)' }} />
        </div>
        {logoContent}
      </div>
    );
  }

  return logoContent;
}
