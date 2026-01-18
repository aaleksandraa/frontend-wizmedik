import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Specialty {
  id: number;
  naziv: string;
}

interface MultiSelectSpecialtiesProps {
  specialties: Specialty[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

export function MultiSelectSpecialties({
  specialties,
  selectedIds,
  onChange,
  placeholder = 'Izaberite specijalnosti...'
}: MultiSelectSpecialtiesProps) {
  const [open, setOpen] = useState(false);

  const selectedSpecialties = specialties.filter(s => selectedIds.includes(s.id));

  const toggleSpecialty = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(sid => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeSpecialty = (id: number) => {
    onChange(selectedIds.filter(sid => sid !== id));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedSpecialties.length > 0
              ? `${selectedSpecialties.length} izabrano`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Pretraži specijalnosti..." />
            <CommandEmpty>Nema rezultata.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {specialties.map((specialty) => (
                <CommandItem
                  key={specialty.id}
                  onSelect={() => toggleSpecialty(specialty.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedIds.includes(specialty.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {specialty.naziv}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSpecialties.map((specialty) => (
            <Badge key={specialty.id} variant="secondary" className="flex items-center gap-1">
              {specialty.naziv}
              <button
                type="button"
                onClick={() => removeSpecialty(specialty.id)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
