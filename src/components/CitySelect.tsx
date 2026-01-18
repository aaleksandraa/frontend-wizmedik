import { useState, useEffect } from 'react';
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

interface City {
  id: number;
  naziv: string;
  slug: string;
}

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function CitySelect({
  value,
  onChange,
  placeholder = 'Odaberite grad',
  disabled = false,
  error = false,
  className,
  showIcon = true,
}: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
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

  const selectedCity = cities.find((city) => city.naziv === value);

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
            !value && 'text-muted-foreground',
            error && 'border-red-500',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {showIcon && <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />}
            {loading ? 'Učitavanje...' : selectedCity?.naziv || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Pretraži gradove..." />
          <CommandList>
            <CommandEmpty>Grad nije pronađen.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.naziv}
                  onSelect={() => {
                    onChange(city.naziv);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === city.naziv ? 'opacity-100' : 'opacity-0'
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
