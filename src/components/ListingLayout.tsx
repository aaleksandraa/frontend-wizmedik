import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ListingHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function ListingHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  action,
}: ListingHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div>
        {badge && (
          <Badge variant="outline" className="mb-3 border-[#0891b2]/25 bg-[#0891b2]/5 px-3 py-1 text-[#0891b2]">
            {BadgeIcon && <BadgeIcon className="mr-1.5 h-3.5 w-3.5" />}
            {badge}
          </Badge>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-base text-gray-600 md:text-lg">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ListingFilters({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 rounded-2xl border border-[#0891b2]/10 bg-white p-4 shadow-[0_4px_24px_-8px_rgba(8,145,178,0.1)] md:p-5">
      {children}
    </div>
  );
}

export function ListingGrid({
  children,
  horizontalScroll = false,
}: {
  children: ReactNode;
  horizontalScroll?: boolean;
}) {
  if (horizontalScroll) {
    return (
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
        {children}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">{children}</div>
  );
}
