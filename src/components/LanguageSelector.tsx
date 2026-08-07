import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = (i18n.language || 'en').split('-')[0];
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id="language-selector-container">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-white/10 border border-cyan-500/30 hover:border-cyan-400 rounded-full text-xs font-mono font-medium text-white transition-all cursor-pointer shadow-sm group"
        title="Change Language / Select Locale"
        id="btn-language-selector-toggle"
      >
        <Globe className="h-3.5 w-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
        <span className="text-sm">{currentLang.flag}</span>
        <span className="hidden sm:inline font-bold tracking-wider">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-zinc-950 border-2 border-cyan-500/30 rounded-2xl shadow-2xl z-[200] p-2 space-y-1 backdrop-blur-xl animate-fade-in no-scrollbar">
          <div className="px-3 py-2 border-b border-white/10 flex justify-between items-center text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
            <span>🌐 Select Language</span>
            <span className="text-[9px] text-gray-500">30+ Languages</span>
          </div>

          <div className="py-1 space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base shrink-0">{lang.flag}</span>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-white text-xs leading-tight">{lang.nativeName}</span>
                      <span className="text-[10px] text-gray-400 leading-tight">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-cyan-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
