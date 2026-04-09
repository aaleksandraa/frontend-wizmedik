import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { citiesAPI } from '@/services/api';

export interface CityOption {
  id: number;
  naziv: string;
  slug: string;
}

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  valueId?: number | string | null;
  onSelectCity?: (city: CityOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  showIcon?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function CitySelect({
  value,
  onChange,
  valueId,
  onSelectCity,
  placeholder = 'Odaberite grad',
  disabled = false,
  error = false,
  className,
  showIcon = true,
  showAllOption = false,
  allOptionLabel = 'Svi gradovi',
}: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await citiesAPI.getAll();
        setCities(response.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const normalizedValueId =
    valueId === null || valueId === undefined || valueId === ''
      ? null
      : Number(valueId);

  const selectedCity = normalizedValueId !== null
    ? cities.find((city) => city.id === normalizedValueId)
    : cities.find((city) => city.naziv === value);
  const displayValue =
    selectedCity?.naziv ||
    value ||
    (showAllOption ? allOptionLabel : placeholder);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn(
            'w-full justify-between font-normal',
            !selectedCity && !value && !showAllOption && 'text-muted-foreground',
            error && 'border-red-500',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {showIcon ? <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" /> : null}
            {loading ? 'Ucitavanje...' : displayValue}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Pretrazi gradove..." />
          <CommandList>
            <CommandEmpty>Grad nije pronadjen.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {showAllOption ? (
                <CommandItem
                  value="__all_cities__"
                  onSelect={() => {
                    onChange('');
                    onSelectCity?.(null);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === '' ? 'opacity-100' : 'opacity-0')} />
                  {allOptionLabel}
                </CommandItem>
              ) : null}
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.naziv}
                  onSelect={() => {
                    onChange(city.naziv);
                    onSelectCity?.(city);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      city.id === normalizedValueId || value === city.naziv ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {city.naziv}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CitySelect;
