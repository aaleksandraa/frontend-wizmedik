import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  className?: string;
  hideLabelOnMobile?: boolean; // Hide label on mobile devices
  disabled?: boolean; // Add disabled prop
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Odaberite...',
  label,
  className,
  hideLabelOnMobile = false,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Enhanced useEffect to handle disabled state changes
  useEffect(() => {
    // Close dropdown if component becomes disabled
    if (disabled && isOpen) {
      setIsOpen(false);
      setSearchQuery('');
    }
  }, [disabled, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label className={cn(
          'text-sm font-medium text-gray-700 block mb-2',
          hideLabelOnMobile && 'hidden md:block'
        )}>
          {label}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full h-12 px-4 rounded-lg border-2 text-left',
          'flex items-center justify-between',
          'transition-all duration-200',
          disabled 
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
            : 'bg-white hover:bg-gray-50',
          !disabled && isOpen
            ? 'border-cyan-500 ring-2 ring-cyan-500/20'
            : !disabled && 'border-gray-200 hover:border-gray-300',
          !selectedOption && !disabled && 'text-gray-500'
        )}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : (disabled ? 'Nedostupno za ovaj tip' : placeholder)}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 transition-transform duration-200 flex-shrink-0 ml-2',
            disabled ? 'text-gray-300' : 'text-gray-400',
            !disabled && isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-[9999] w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search Input (for long lists) */}
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretražite..."
                className="w-full px-3 py-2 text-base sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:border-cyan-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nema rezultata
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-4 py-3 text-left flex items-center justify-between',
                    'hover:bg-cyan-50 transition-colors',
                    option.value === value && 'bg-cyan-50 text-cyan-700 font-medium'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
