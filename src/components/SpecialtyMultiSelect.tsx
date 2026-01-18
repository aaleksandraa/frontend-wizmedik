import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Specialty {
  id: number;
  naziv: string;
  parent_id?: number;
  children?: Specialty[];
}

interface Props {
  specialties: Specialty[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  error?: string;
}

export function SpecialtyMultiSelect({ specialties, selectedIds, onChange, error }: Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Flatten specialties - backend returns hierarchical data with children
  const flatSpecialties: Specialty[] = [];
  specialties.forEach(category => {
    flatSpecialties.push({
      id: category.id,
      naziv: category.naziv,
      parent_id: category.parent_id,
    });
    
    if (category.children && Array.isArray(category.children)) {
      category.children.forEach(child => {
        flatSpecialties.push({
          id: child.id,
          naziv: child.naziv,
          parent_id: category.id,
        });
      });
    }
  });

  const categories = flatSpecialties.filter(s => !s.parent_id);
  const subcategoriesMap = new Map<number, Specialty[]>();
  
  flatSpecialties.forEach(s => {
    if (s.parent_id) {
      if (!subcategoriesMap.has(s.parent_id)) {
        subcategoriesMap.set(s.parent_id, []);
      }
      subcategoriesMap.get(s.parent_id)!.push(s);
    }
  });

  // Auto-expand categories that have selected subcategories
  useEffect(() => {
    const newExpanded = new Set(expandedCategories);
    selectedIds.forEach(id => {
      const specialty = flatSpecialties.find(s => s.id === id);
      if (specialty?.parent_id) {
        newExpanded.add(specialty.parent_id);
      }
    });
    setExpandedCategories(newExpanded);
  }, [selectedIds]);

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSpecialty = (id: number, hasSubcategories: boolean) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];
    onChange(newSelected);
    
    if (!selectedIds.includes(id) && hasSubcategories) {
      const newExpanded = new Set(expandedCategories);
      newExpanded.add(id);
      setExpandedCategories(newExpanded);
    }
  };

  const isSelected = (id: number) => selectedIds.includes(id);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            Odaberite specijalnosti
          </Label>
          <p className="text-sm text-muted-foreground">
            Možete odabrati jednu ili više specijalnosti i podkategorija
          </p>
        </div>
      </div>

      {/* Selection Card */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>
                {selectedIds.length === 0 ? (
                  'Nijedna specijalnost nije odabrana'
                ) : (
                  <>
                    <span className="text-primary font-semibold">{selectedIds.length}</span>
                    {' '}
                    {selectedIds.length === 1 ? 'specijalnost odabrana' : 
                     selectedIds.length < 5 ? 'specijalnosti odabrane' : 
                     'specijalnosti odabrano'}
                  </>
                )}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Circle className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nema dostupnih specijalnosti
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {categories.map((category, index) => {
                  const subcategories = subcategoriesMap.get(category.id) || [];
                  const hasSubcategories = subcategories.length > 0;
                  const isExpanded = expandedCategories.has(category.id);
                  const isCategorySelected = isSelected(category.id);

                  return (
                    <div 
                      key={category.id} 
                      className={cn(
                        "transition-colors",
                        isCategorySelected && "bg-primary/5"
                      )}
                    >
                      {/* Main Category */}
                      <div className="flex items-center gap-2 p-4 hover:bg-muted/50 transition-colors group">
                        {/* Expand/Collapse Button */}
                        {hasSubcategories ? (
                          <button
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className={cn(
                              "flex-shrink-0 p-1.5 rounded-md transition-all",
                              "hover:bg-primary/10 hover:scale-110",
                              "focus:outline-none focus:ring-2 focus:ring-primary/20",
                              isExpanded && "bg-primary/10"
                            )}
                            aria-label={isExpanded ? 'Zatvori podkategorije' : 'Otvori podkategorije'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-primary" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </button>
                        ) : (
                          <div className="w-8" />
                        )}
                        
                        {/* Checkbox & Label */}
                        <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                          <Checkbox
                            checked={isCategorySelected}
                            onCheckedChange={() => toggleSpecialty(category.id, hasSubcategories)}
                            className={cn(
                              "flex-shrink-0 transition-all",
                              isCategorySelected && "scale-110"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "text-sm font-medium transition-colors",
                                isCategorySelected ? "text-primary" : "text-foreground"
                              )}>
                                {category.naziv}
                              </span>
                              {hasSubcategories && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  {subcategories.length} {subcategories.length === 1 ? 'podkategorija' : 'podkategorije'}
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Subcategories */}
                      {hasSubcategories && isExpanded && (
                        <div className="bg-muted/30 border-t border-border/50">
                          <div className="pl-12 pr-4 py-2 space-y-1">
                            {subcategories.map((sub) => {
                              const isSubSelected = isSelected(sub.id);
                              
                              return (
                                <label
                                  key={sub.id}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                                    "hover:bg-background hover:shadow-sm",
                                    isSubSelected && "bg-background shadow-sm ring-1 ring-primary/20"
                                  )}
                                >
                                  <Checkbox
                                    checked={isSubSelected}
                                    onCheckedChange={() => toggleSpecialty(sub.id, false)}
                                    className="flex-shrink-0"
                                  />
                                  <span className={cn(
                                    "text-sm transition-colors",
                                    isSubSelected ? "text-foreground font-medium" : "text-muted-foreground"
                                  )}>
                                    {sub.naziv}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5">
            <span className="text-destructive text-xs font-bold">!</span>
          </div>
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
