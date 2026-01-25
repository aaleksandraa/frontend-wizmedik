import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
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

interface Service {
  id: number;
  naziv: string;
  cijena: number | null;
  trajanje_minuti: number;
}

interface SearchableServiceSelectProps {
  services: Service[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableServiceSelect({
  services,
  value,
  onValueChange,
  placeholder = 'Izaberite uslugu'
}: SearchableServiceSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    if (!searchQuery) return services;
    
    const query = searchQuery.toLowerCase();
    return services.filter(s => s.naziv.toLowerCase().includes(query));
  }, [services, searchQuery]);

  const selectedService = services.find(s => s.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedService ? (
            <span className="truncate">
              {selectedService.naziv} - {selectedService.cijena ? `${selectedService.cijena} KM` : 'Po dogovoru'} ({selectedService.trajanje_minuti} min)
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Pretraži usluge..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>
              {searchQuery ? 'Nema rezultata.' : 'Nema dostupnih usluga.'}
            </CommandEmpty>
            <CommandGroup className="max-h-80 overflow-auto">
              {filteredServices.map((service) => (
                <CommandItem
                  key={service.id}
                  value={service.id.toString()}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-start gap-2 py-3"
                >
                  <Check
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      value === service.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{service.naziv}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.cijena ? `${service.cijena} KM` : 'Po dogovoru'} • {service.trajanje_minuti} min
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
