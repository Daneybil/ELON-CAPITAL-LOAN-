import React from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { countries, CountryData } from '../utils/countries';

interface CountrySelectorProps {
  selectedCountry: string;
  onChange: (countryName: string, dialCode: string) => void;
  id?: string;
  placeholder?: string;
}

export default function CountrySelector({
  selectedCountry,
  onChange,
  id = 'country-selector',
  placeholder = 'Select country'
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const currentCountry = countries.find(
    c => c.name.toLowerCase() === selectedCountry.toLowerCase()
  );

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search)
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

  const handleSelect = (country: CountryData) => {
    onChange(country.name, country.dialCode);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full" ref={containerRef} id={`${id}-wrapper`}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-4 pr-4 py-3.5 bg-[#0e0e11] hover:bg-white/[0.03] border border-white/10 focus:border-cyan-500/50 rounded-xl text-sm text-white font-medium transition-all duration-150 text-left outline-none"
        id={`${id}-trigger`}
      >
        {currentCountry ? (
          <span className="flex items-center gap-2">
            <span className="text-lg">{currentCountry.flag}</span>
            <span>{currentCountry.name}</span>
            <span className="text-xs text-zinc-500 font-mono font-bold">({currentCountry.dialCode})</span>
          </span>
        ) : (
          <span className="text-zinc-500">{placeholder}</span>
        )}
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover List */}
      {isOpen && (
        <div 
          className="absolute z-50 left-0 right-0 mt-2 bg-[#0a0a0d] border border-white/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden max-h-72 flex flex-col backdrop-blur-lg"
          id={`${id}-dropdown`}
        >
          {/* Search Header */}
          <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-black/40">
            <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code..."
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-xs text-white placeholder-zinc-500"
              id={`${id}-search-input`}
            />
          </div>

          {/* List Area */}
          <div className="overflow-y-auto flex-1 py-1 divide-y divide-white/[0.02]">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs transition-colors cursor-pointer hover:bg-white/5 ${
                      isSelected ? 'bg-cyan-950/20 text-cyan-400 font-bold' : 'text-zinc-300'
                    }`}
                    id={`${id}-opt-${c.code}`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className="text-base select-none">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-zinc-500 font-mono font-bold">{c.dialCode}</span>
                      {isSelected && <Check className="h-3 w-3 text-cyan-400" />}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-zinc-500 font-medium">
                No matching countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
