import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BookingStepItem {
  id: string;
  label: string;
}

interface BookingStepsProps {
  steps: BookingStepItem[];
  current: string;
  completed: string[];
  onStepClick?: (stepId: string) => void;
}

export function BookingSteps({ steps, current, completed, onStepClick }: BookingStepsProps) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <ol className="flex items-center gap-1 sm:gap-2" aria-label="Koraci zakazivanja">
      {steps.map((step, index) => {
        const isCurrent = step.id === current;
        const isDone = completed.includes(step.id) || index < currentIndex;
        const canClick = Boolean(onStepClick) && (isDone || isCurrent);

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <button
              type="button"
              disabled={!canClick}
              onClick={() => canClick && onStepClick?.(step.id)}
              className={cn(
                'flex w-full min-w-0 items-center gap-2 rounded-xl px-1.5 py-1.5 text-left transition-colors sm:px-2',
                canClick && 'hover:bg-muted/60',
                !canClick && 'cursor-default'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isCurrent && 'bg-primary text-primary-foreground',
                  isDone && !isCurrent && 'bg-primary/15 text-primary',
                  !isDone && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isDone && !isCurrent ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  'truncate text-xs font-medium sm:text-sm',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  'hidden h-px w-3 shrink-0 sm:block sm:w-5',
                  index < currentIndex ? 'bg-primary/40' : 'bg-border'
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
