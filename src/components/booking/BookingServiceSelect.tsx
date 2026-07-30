import { useMemo } from 'react';
import { Check, Clock, PencilLine } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  BookingService,
  BookingServiceCategory,
  OTHER_SERVICE_VALUE,
  buildServiceGroups,
  formatServiceDuration,
  formatServicePrice,
} from '@/lib/booking-services';

interface BookingServiceSelectProps {
  services: BookingService[] | undefined;
  categories: BookingServiceCategory[] | undefined;
  value: string;
  onChange: (value: string) => void;
  allowOther?: boolean;
  otherReason: string;
  onOtherReasonChange: (value: string) => void;
  slotDuration: number;
}

export function BookingServiceSelect({
  services,
  categories,
  value,
  onChange,
  allowOther,
  otherReason,
  onOtherReasonChange,
  slotDuration,
}: BookingServiceSelectProps) {
  const groups = useMemo(() => buildServiceGroups(services, categories), [services, categories]);
  const hasServices = groups.some((group) => group.services.length > 0);

  if (!hasServices && !allowOther) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
        Trenutno nema dostupnih usluga za online zakazivanje.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Dodirnite uslugu da nastavite.</p>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.key} className="space-y-2">
            {group.label && (
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h3>
            )}
            <div className="grid gap-2">
              {group.services.map((service) => {
                const selected = value === String(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => onChange(String(service.id))}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all sm:p-4',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                        : 'border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03]'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug text-foreground">
                        {service.naziv}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {formatServicePrice(service)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatServiceDuration(service, slotDuration)}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {allowOther && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onChange(OTHER_SERVICE_VALUE)}
              className={cn(
                'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all sm:p-4',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                value === OTHER_SERVICE_VALUE
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                  : 'border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03]'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                  value === OTHER_SERVICE_VALUE
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30'
                )}
              >
                {value === OTHER_SERVICE_VALUE ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <PencilLine className="h-3 w-3 text-muted-foreground" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">Ostalo</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Opišite razlog posjete
                </span>
              </span>
            </button>

            {value === OTHER_SERVICE_VALUE && (
              <Input
                value={otherReason}
                onChange={(event) => onOtherReasonChange(event.target.value)}
                placeholder="Npr. bol u grudima, kontrola..."
                className="h-12 rounded-xl"
                autoFocus
                required
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
