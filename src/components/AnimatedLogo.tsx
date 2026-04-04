import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const logoSizes = {
  sm: {
    mark: 34,
    gap: 'gap-2',
    title: 'text-lg',
    subtitle: 'hidden',
  },
  md: {
    mark: 57,
    gap: 'gap-3',
    title: 'text-[30px]',
    subtitle: 'block text-[11px]',
  },
  lg: {
    mark: 57,
    gap: 'gap-3.5',
    title: 'text-[30px]',
    subtitle: 'block text-[11px]',
  },
} as const;

function BrandMark({ size }: { size: number }) {
  return (
    <div
      className="relative shrink-0 rounded-full wm-brand-mark"
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 512 512"
        className="h-full w-full drop-shadow-[0_6px_18px_rgba(14,146,179,0.18)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="256" cy="256" r="224" fill="#D9EEF0" />
        <circle
          className="wm-brand-circle"
          cx="256"
          cy="256"
          r="224"
          fill="none"
          stroke="#0E92B3"
          strokeWidth="32"
          strokeLinecap="round"
        />
        <g className="wm-brand-plus">
          <rect x="139" y="230" width="234" height="52" rx="26" fill="#0E92B3" />
          <rect x="230" y="139" width="52" height="234" rx="26" fill="#0E92B3" />
        </g>
      </svg>
    </div>
  );
}

export function AnimatedLogo({ className, size = 'md' }: AnimatedLogoProps) {
  const config = logoSizes[size];
  const showSubtitle = size !== 'sm';

  return (
    <div
      className={cn(
        'group inline-flex items-center select-none transition-transform duration-300 hover:scale-[1.02]',
        config.gap,
        className
      )}
      style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: 'normal' }}
      aria-label="WizMedik"
    >
      <BrandMark size={config.mark} />

      <div className="min-w-0">
        <div className={cn('leading-none tracking-[-0.03em]', config.title)}>
          <span className="font-semibold text-[#0E92B3]">wiz</span>
          <span className="font-normal text-slate-950 dark:text-slate-50">Medik</span>
        </div>
        {showSubtitle ? (
          <div
            className={cn(
              'mt-[2px] leading-[1.1] tracking-[0.02em] text-slate-500 dark:text-slate-400',
              config.subtitle
            )}
          >
            Tvoje zdravlje. Tvoj izbor.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AnimatedLogoCompact({ className }: { className?: string }) {
  return <AnimatedLogo size="sm" className={className} />;
}
