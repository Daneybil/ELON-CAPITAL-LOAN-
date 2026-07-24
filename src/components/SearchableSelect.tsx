import React from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface SearchableSelectProps {
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  id?: string;
  allowCustom?: boolean;
  customValue?: string;
  onCustomChange?: (val: string) => void;
  customPlaceholder?: string;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  required = false,
  id = 'searchable-select',
  allowCustom = false,
  customValue = '',
  onCustomChange,
  customPlaceholder = 'Please specify...',
  className = ''
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Normalize options to object format
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Filter options based on search term
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase()) ||
    (opt.description && opt.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Find currently selected option
  const selectedOpt = normalizedOptions.find(
    (opt) => opt.value.toLowerCase() === value.toLowerCase()
  );

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optVal: string) => {
    onChange(optVal);
    setIsOpen(false);
    setSearch('');
  };

  const isOtherSelected = value === 'Other' || value === 'Other Professional Status';

  return (
    <div className={`relative w-full ${className}`} ref={containerRef} id={`${id}-container`}>
      {label && (
        <label className="block text-base sm:text-lg font-black text-white uppercase tracking-wider mb-2">
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-zinc-950 hover:bg-zinc-900 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base sm:text-lg font-extrabold text-white transition-all text-left outline-none cursor-pointer"
        id={`${id}-trigger`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOpt ? (
            <>
              {selectedOpt.icon && <span className="text-xl">{selectedOpt.icon}</span>}
              <span className="text-white font-extrabold">{selectedOpt.label}</span>
            </>
          ) : value ? (
            <span className="text-white font-extrabold">{value}</span>
          ) : (
            <span className="text-zinc-500 font-bold">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-cyan-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-2 bg-zinc-950 border-2 border-cyan-500/40 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] overflow-hidden max-h-80 flex flex-col backdrop-blur-xl animate-fade-in"
          id={`${id}-dropdown`}
        >
          {/* Search Header */}
          <div className="p-3 border-b-2 border-zinc-800 flex items-center gap-3 bg-black">
            <Search className="h-5 w-5 text-cyan-400 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search options..."
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-base font-bold text-white placeholder-zinc-500"
              id={`${id}-search-input`}
            />
          </div>

          {/* List Area */}
          <div className="overflow-y-auto flex-1 py-1 divide-y divide-zinc-900">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value.toLowerCase() === opt.value.toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-left text-base font-bold transition-colors cursor-pointer hover:bg-cyan-950/40 hover:text-white ${
                      isSelected
                        ? 'bg-cyan-950/60 text-cyan-300 font-black border-l-4 border-cyan-400'
                        : 'text-zinc-200'
                    }`}
                    id={`${id}-opt-${opt.value.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2">
                        {opt.icon && <span className="text-lg">{opt.icon}</span>}
                        <span>{opt.label}</span>
                      </span>
                      {opt.description && (
                        <span className="text-xs font-semibold text-zinc-400 mt-0.5">
                          {opt.description}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-cyan-400 flex-shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-5 text-center text-sm font-bold text-zinc-400">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}

      {/* If "Other" is selected and custom input is supported */}
      {allowCustom && isOtherSelected && onCustomChange && (
        <div className="mt-3 animate-fade-in">
          <label className="block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1">
            Specify Custom Details *
          </label>
          <input
            type="text"
            required
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder={customPlaceholder}
            className="w-full px-5 py-3.5 bg-black border-2 border-cyan-400/60 rounded-xl text-base font-bold text-white focus:outline-none focus:border-cyan-300"
            id={`${id}-custom-input`}
          />
        </div>
      )}
    </div>
  );
}
