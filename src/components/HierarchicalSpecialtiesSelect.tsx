import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, X, ChevronRight } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface Specialty {
  id: number;
  naziv: string;
  parent_id?: number | null;
}

interface HierarchicalSpecialtiesSelectProps {
  specialties: Specialty[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

export function HierarchicalSpecialtiesSelect({
  specialties,
  selectedIds,
  onChange,
  placeholder = 'Izaberite specijalnosti...'
}: HierarchicalSpecialtiesSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Organize specialties into parent-child structure
  const { parentSpecialties, childrenMap } = useMemo(() => {
    const parents = specialties.filter(s => !s.parent_id);
    const childMap = new Map<number, Specialty[]>();
    
    specialties.forEach(s => {
      if (s.parent_id) {
        if (!childMap.has(s.parent_id)) {
          childMap.set(s.parent_id, []);
        }
        childMap.get(s.parent_id)!.push(s);
      }
    });
    
    return { parentSpecialties: parents, childrenMap: childMap };
  }, [specialties]);

  // Filter specialties based on search
  const filteredSpecialties = useMemo(() => {
    if (!searchQuery) return specialties;
    
    const query = searchQuery.toLowerCase();
    return specialties.filter(s => s.naziv.toLowerCase().includes(query));
  }, [specialties, searchQuery]);

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

  const renderSpecialtyItem = (specialty: Specialty, isChild = false) => {
    const isSelected = selectedIds.includes(specialty.id);
    const children = childrenMap.get(specialty.id) || [];
    const hasChildren = children.length > 0;

    return (
      <div key={specialty.id}>
        <CommandItem
          onSelect={() => toggleSpecialty(specialty.id)}
          className={cn(
            isChild && "pl-8",
            "cursor-pointer"
          )}
        >
          <Check
            className={cn(
              "mr-2 h-4 w-4 flex-shrink-0",
              isSelected ? "opacity-100" : "opacity-0"
            )}
          />
          {hasChildren && !isChild && (
            <ChevronRight className="mr-1 h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          <span className={cn(
            "flex-1",
            !isChild && hasChildren && "font-medium"
          )}>
            {specialty.naziv}
          </span>
        </CommandItem>
        
        {/* Render children if not searching */}
        {!searchQuery && hasChildren && children.map(child => renderSpecialtyItem(child, true))}
      </div>
    );
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
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Pretraži specijalnosti..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>Nema rezultata.</CommandEmpty>
            <CommandList>
              <CommandGroup className="max-h-80 overflow-auto">
                {searchQuery ? (
                  // Show flat filtered list when searching
                  filteredSpecialties.map(specialty => (
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
                      {specialty.parent_id && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({specialties.find(s => s.id === specialty.parent_id)?.naziv})
                        </span>
                      )}
                    </CommandItem>
                  ))
                ) : (
                  // Show hierarchical list when not searching
                  parentSpecialties.map(parent => renderSpecialtyItem(parent))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSpecialties.map((specialty) => {
            const parent = specialty.parent_id 
              ? specialties.find(s => s.id === specialty.parent_id)
              : null;
            
            return (
              <Badge key={specialty.id} variant="secondary" className="flex items-center gap-1">
                {specialty.naziv}
                {parent && (
                  <span className="text-xs opacity-70">({parent.naziv})</span>
                )}
                <button
                  type="button"
                  onClick={() => removeSpecialty(specialty.id)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
