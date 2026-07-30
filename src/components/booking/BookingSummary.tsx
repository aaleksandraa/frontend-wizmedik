import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { CalendarCheck, Clock, Stethoscope } from 'lucide-react';

interface BookingSummaryProps {
  date: Date | undefined;
  time: string;
  serviceName?: string;
  price?: string;
}

export function BookingSummary({ date, time, serviceName, price }: BookingSummaryProps) {
  if (!date && !time && !serviceName) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl bg-primary/5 px-3 py-2.5 text-sm">
      {date && (
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <CalendarCheck className="h-4 w-4 text-primary" />
          {format(date, 'EEEE, d. MMMM', { locale: bs })}
        </span>
      )}
      {time && (
        <span className="flex items-center gap-1.5 font-medium tabular-nums text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          {time}
        </span>
      )}
      {serviceName && (
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <Stethoscope className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="truncate">
            {serviceName}
            {price ? ` · ${price}` : ''}
          </span>
        </span>
      )}
    </div>
  );
}
