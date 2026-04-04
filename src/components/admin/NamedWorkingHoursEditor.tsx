import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  createDefaultNamedWorkingHours,
  namedWorkingDayLabels,
  namedWorkingDays,
  NamedWorkingHours,
} from '@/components/admin/profileFormUtils';

interface NamedWorkingHoursEditorProps {
  value: NamedWorkingHours;
  onChange: (value: NamedWorkingHours) => void;
  title?: string;
  description?: string;
}

export function NamedWorkingHoursEditor({
  value,
  onChange,
  title = 'Radno vrijeme',
  description = 'Postavite sedmično radno vrijeme profila.',
}: NamedWorkingHoursEditorProps) {
  const defaults = createDefaultNamedWorkingHours();

  const updateDay = (day: string, updates: Partial<NamedWorkingHours[string]>) => {
    onChange({
      ...value,
      [day]: {
        ...(value[day] || defaults[day]),
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-3">
        {namedWorkingDays.map((day) => {
          const current = value[day] || defaults[day];

          return (
            <div
              key={day}
              className="grid grid-cols-1 items-center gap-3 rounded-md border p-3 md:grid-cols-[140px,1fr,1fr,auto]"
            >
              <Label className="font-medium">{namedWorkingDayLabels[day]}</Label>
              <Input
                type="time"
                disabled={current.closed}
                value={current.closed ? '' : current.open}
                onChange={(event) => updateDay(day, { open: event.target.value })}
              />
              <Input
                type="time"
                disabled={current.closed}
                value={current.closed ? '' : current.close}
                onChange={(event) => updateDay(day, { close: event.target.value })}
              />
              <div className="flex items-center justify-between gap-2 md:justify-end">
                <Label className="text-sm">Zatvoreno</Label>
                <Switch
                  checked={current.closed}
                  onCheckedChange={(checked) =>
                    updateDay(day, {
                      closed: checked,
                      open: checked ? defaults[day].open : current.open || defaults[day].open,
                      close: checked ? defaults[day].close : current.close || defaults[day].close,
                    })
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
