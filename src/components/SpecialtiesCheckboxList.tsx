import { useState, useMemo, useEffect } from 'react';
import { Check, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Specialty {
  id: number;
  naziv: string;
  parent_id?: number | null;
}

interface SpecialtiesCheckboxListProps {
  specialties: Specialty[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function SpecialtiesCheckboxList({
  specialties,
  selectedIds,
  onChange
}: SpecialtiesCheckboxListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

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

  // Auto-expand all parents on mount
  useEffect(() => {
    const allParentIds = parentSpecialties
      .filter(p => (childrenMap.get(p.id)?.length || 0) > 0)
      .map(p => p.id);
    setExpandedParents(new Set(allParentIds));
  }, [parentSpecialties, childrenMap]);

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

  const toggleParentExpanded = (parentId: number) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedParents(newExpanded);
  };

  const renderSpecialtyItem = (specialty: Specialty, isChild = false) => {
    const isSelected = selectedIds.includes(specialty.id);
    const children = childrenMap.get(specialty.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedParents.has(specialty.id);

    return (
      <div key={specialty.id} className={cn(isChild && "ml-6")}>
        <div className="flex items-center space-x-2 py-2 hover:bg-muted/50 rounded-md px-2">
          {hasChildren && !isChild && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleParentExpanded(specialty.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          {(!hasChildren || isChild) && <div className="w-6" />}
          
          <Checkbox
            id={`specialty-${specialty.id}`}
            checked={isSelected}
            onCheckedChange={() => toggleSpecialty(specialty.id)}
          />
          <Label
            htmlFor={`specialty-${specialty.id}`}
            className={cn(
              "flex-1 cursor-pointer",
              !isChild && hasChildren && "font-medium"
            )}
          >
            {specialty.naziv}
          </Label>
          {isSelected && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </div>
        
        {/* Render children if expanded and not searching */}
        {!searchQuery && hasChildren && isExpanded && children.map(child => renderSpecialtyItem(child, true))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pretraži specijalnosti..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Selected count and badges */}
      {selectedSpecialties.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Izabrano: {selectedSpecialties.length}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSpecialties.map((specialty) => {
              const parent = specialty.parent_id 
                ? specialties.find(s => s.id === specialty.parent_id)
                : null;
              
              return (
                <Badge key={specialty.id} variant="secondary">
                  {specialty.naziv}
                  {parent && (
                    <span className="text-xs opacity-70 ml-1">({parent.naziv})</span>
                  )}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Specialties list */}
      <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
        {searchQuery ? (
          // Show flat filtered list when searching
          filteredSpecialties.length > 0 ? (
            filteredSpecialties.map(specialty => {
              const isSelected = selectedIds.includes(specialty.id);
              const parent = specialty.parent_id 
                ? specialties.find(s => s.id === specialty.parent_id)
                : null;
              
              return (
                <div key={specialty.id} className="flex items-center space-x-2 py-2 hover:bg-muted/50 rounded-md px-2">
                  <Checkbox
                    id={`specialty-search-${specialty.id}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleSpecialty(specialty.id)}
                  />
                  <Label
                    htmlFor={`specialty-search-${specialty.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    {specialty.naziv}
                    {parent && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({parent.naziv})
                      </span>
                    )}
                  </Label>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nema rezultata za "{searchQuery}"
            </div>
          )
        ) : (
          // Show hierarchical list when not searching
          parentSpecialties.map(parent => renderSpecialtyItem(parent))
        )}
      </div>

      {/* Expand/Collapse all button */}
      {!searchQuery && parentSpecialties.length > 0 && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const allParentIds = parentSpecialties
                .filter(p => (childrenMap.get(p.id)?.length || 0) > 0)
                .map(p => p.id);
              setExpandedParents(new Set(allParentIds));
            }}
          >
            Proširi sve
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExpandedParents(new Set())}
          >
            Zatvori sve
          </Button>
        </div>
      )}
    </div>
  );
}
