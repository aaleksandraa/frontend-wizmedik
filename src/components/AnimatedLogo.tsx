import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedLogo({ className, size = 'md' }: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center font-medium cursor-pointer select-none transition-transform duration-300',
        sizeClasses[size],
        isHovered && 'scale-105',
        className
      )}
      style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: 'normal' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* wiz - Cyan color #0891b2 */}
      <span className="relative inline-block">
        <span
          className="relative z-10"
          style={{ color: '#0891b2' }}
        >
          wiz
        </span>
      </span>
      
      {/* Medik - Dark gray, almost black */}
      <span
        className="relative inline-block"
        style={{ color: '#1f2937' }}
      >
        Medik
      </span>
    </div>
  );
}

// Compact version for mobile
export function AnimatedLogoCompact({ className }: { className?: string }) {
  return (
    <div 
      className={cn('inline-flex items-center font-medium', className)}
      style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: 'normal' }}
    >
      <span className="text-xl" style={{ color: '#0891b2' }}>w</span>
      <span className="text-xl" style={{ color: '#1f2937' }}>M</span>
    </div>
  );
}
