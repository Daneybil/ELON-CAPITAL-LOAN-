import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  ChevronDown, 
  Check, 
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { 
  ALL_SUPPORTED_LANGUAGES, 
  getCurrentGoogleTranslateLanguage, 
  detectVisitorLanguage, 
  applyGoogleTranslateLanguage,
  GoogleTranslateLanguage 
} from '../utils/googleTranslate';

interface Props {
  onHeightChange?: (height: number) => void;
}

export default function GoogleTranslateBar({ onHeightChange }: Props) {
  const [currentLangCode, setCurrentLangCode] = useState<string>('en');
  const [detectedLang, setDetectedLang] = useState<GoogleTranslateLanguage | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize and detect visitor location & language on mount
  useEffect(() => {
    const detected = detectVisitorLanguage();
    setDetectedLang(detected);

    const activeCode = getCurrentGoogleTranslateLanguage();
    setCurrentLangCode(activeCode || detected.code);

    // If visitor is in a non-English country (e.g. Arabic, Spanish, etc.) and no manual override, auto-apply!
    const manualPref = localStorage.getItem('user_lang_preference');
    if (!manualPref && detected.code !== 'en' && activeCode !== detected.code) {
      setIsTranslating(true);
      applyGoogleTranslateLanguage(detected.code, false);
      setCurrentLangCode(detected.code);
      setTimeout(() => setIsTranslating(false), 800);
    }

    if (barRef.current && onHeightChange) {
      onHeightChange(barRef.current.offsetHeight);
    }
  }, [onHeightChange]);

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: string) => {
    setIsTranslating(true);
    setCurrentLangCode(code);
    setIsOpen(false);
    applyGoogleTranslateLanguage(code, true);
    setTimeout(() => setIsTranslating(false), 1200);
  };

  const currentLang = ALL_SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || ALL_SUPPORTED_LANGUAGES[0];

  const filteredLanguages = ALL_SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularQuickLangs = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' }
  ];

  return (
    <div 
      ref={barRef}
      id="google-translator-head-bar"
      className="w-full fixed top-0 left-0 right-0 z-[60] h-[34px] sm:h-[36px] bg-zinc-950/98 backdrop-blur-md border-b border-cyan-500/40 text-white select-none transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center"
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 text-xs font-mono">
        
        {/* Left: Powered by Google Translate & Auto-detection indicator */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded-full text-cyan-300 font-bold shadow-sm">
            <Globe className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold flex items-center gap-1">
              Powered by <span className="text-white font-black underline decoration-cyan-400 decoration-2">Google Translate</span>
            </span>
          </div>

          {detectedLang && (
            <div 
              className="hidden lg:flex items-center gap-1.5 text-[10px] text-zinc-400 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10"
              title="Automatically inferred from your global IP region, browser locale, and timezone"
            >
              <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
              <span>Auto-Detected Region:</span>
              <span className="text-white font-bold flex items-center gap-1">
                <span>{detectedLang.flag}</span>
                <span>{detectedLang.nativeName} ({detectedLang.name})</span>
              </span>
              <span className="text-[9px] text-cyan-400/80 bg-cyan-950 px-1.5 py-0.2 rounded font-mono">Live</span>
            </div>
          )}

          {isTranslating && (
            <div className="flex items-center gap-1 text-[10px] text-cyan-300 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
              <span>Translating all content...</span>
            </div>
          )}
        </div>

        {/* Right: Quick language shortcuts & Primary Language Selector */}
        <div className="flex items-center gap-2 ml-auto" ref={dropdownRef}>
          {/* Quick Popular Pills (Visible on larger screens) */}
          <div className="hidden xl:flex items-center gap-1">
            {popularQuickLangs.map((p) => {
              const isActive = currentLangCode === p.code;
              return (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => handleSelectLanguage(p.code)}
                  className={`px-2 py-0.5 rounded-md text-[10px] transition-all cursor-pointer flex items-center gap-1 font-bold ${
                    isActive 
                      ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]' 
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={`Translate website instantly to ${p.label}`}
                >
                  <span>{p.flag}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Master Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/50 hover:border-cyan-400 rounded-full text-xs font-bold text-white transition-all cursor-pointer shadow-sm group"
              id="google-translate-active-btn"
              title="Select your native language (Translates 100% of website)"
            >
              <span className="text-sm">{currentLang.flag}</span>
              <span className="font-extrabold text-cyan-300">{currentLang.nativeName}</span>
              <span className="hidden sm:inline text-zinc-400 text-[10px]">({currentLang.name})</span>
              <ChevronDown className={`h-3.5 w-3.5 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 sm:w-80 max-h-96 overflow-hidden bg-zinc-950/98 border-2 border-cyan-500/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-[100] backdrop-blur-2xl animate-fade-in flex flex-col"
                id="google-translate-dropdown-menu"
              >
                {/* Header inside dropdown */}
                <div className="p-3 border-b border-white/10 bg-zinc-900/80">
                  <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 uppercase tracking-widest mb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      Global Regional Translator
                    </span>
                    <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      35+ Languages
                    </span>
                  </div>

                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search language or country..."
                    className="w-full px-3 py-1.5 bg-black border border-white/20 focus:border-cyan-400 rounded-lg text-xs text-white placeholder:text-zinc-500 outline-none"
                    autoFocus
                  />
                </div>

                {/* Language List */}
                <div className="overflow-y-auto max-h-64 p-1.5 space-y-1 divide-y divide-white/5">
                  {filteredLanguages.map((lang) => {
                    const isSelected = currentLangCode === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelectLanguage(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/90 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                            : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-base shrink-0">{lang.flag}</span>
                          <div className="flex flex-col truncate">
                            <span className="font-black text-white text-xs leading-tight">
                              {lang.nativeName}
                            </span>
                            <span className="text-[10px] text-zinc-400 leading-tight">
                              {lang.name} • <span className="text-cyan-400/80">{lang.region}</span>
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-cyan-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}

                  {filteredLanguages.length === 0 && (
                    <div className="p-4 text-center text-xs text-zinc-500">
                      No language found matching "{searchQuery}"
                    </div>
                  )}
                </div>

                {/* Footer status notice */}
                <div className="p-2 border-t border-white/10 bg-black/60 text-[9px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Automatically translates every page, form & notification worldwide</span>
                </div>
              </div>
            )}
          </div>

          {/* Mount point for official Google Translate element */}
          <div id="google_translate_element" className="opacity-0 pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true" />
        </div>

      </div>
    </div>
  );
}
