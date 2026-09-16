export interface GoogleTranslateLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  isRTL?: boolean;
}

export const ALL_SUPPORTED_LANGUAGES: GoogleTranslateLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'Global / US / UK' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Spain & Latin America' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East & North Africa', isRTL: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'France, Canada & Africa' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Germany, Austria & Switzerland' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', region: 'Brazil & Portugal' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Italy & Europe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Eastern Europe & Central Asia' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', region: 'China & Singapore' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', region: 'Taiwan & Hong Kong' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Japan' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'South Korea' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India & South Asia' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Turkey & Eurasia' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Netherlands & Belgium' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Poland & Eastern Europe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Vietnam & Southeast Asia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Thailand' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', region: 'Malaysia' },
  { code: 'tl', name: 'Filipino / Tagalog', nativeName: 'Tagalog', flag: '🇵🇭', region: 'Philippines' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', region: 'Ukraine' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', region: 'Greece & Cyprus' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', region: 'Israel', isRTL: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', region: 'Iran & Central Asia', isRTL: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', region: 'Pakistan & South Asia', isRTL: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', region: 'Bangladesh & India' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'East Africa' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Sweden' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', region: 'Norway' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', region: 'Denmark' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', region: 'Finland' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', region: 'Czech Republic' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', region: 'Romania & Moldova' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', region: 'Hungary' }
];

export function getCurrentGoogleTranslateLanguage(): string {
  // Check cookie first
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match && match[1]) {
    const parts = decodeURIComponent(match[1]).split('/');
    if (parts.length >= 3 && parts[2]) {
      return parts[2];
    }
  }
  return localStorage.getItem('user_lang_preference') || 'en';
}

export function detectVisitorLanguage(): GoogleTranslateLanguage {
  // Check saved preference first
  const saved = localStorage.getItem('user_lang_preference');
  if (saved) {
    const found = ALL_SUPPORTED_LANGUAGES.find(l => l.code === saved);
    if (found) return found;
  }

  // 1. Check navigator.languages array
  const navLangs = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language || 'en'])) || ['en'];
  for (const rawLang of navLangs) {
    const clean = (rawLang || '').toLowerCase();
    if (clean.includes('zh-tw') || clean.includes('zh-hk')) {
      const match = ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'zh-TW');
      if (match) return match;
    }
    if (clean.includes('zh')) {
      const match = ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'zh-CN');
      if (match) return match;
    }
    const primary = clean.split('-')[0];
    const match = ALL_SUPPORTED_LANGUAGES.find(l => l.code === primary);
    if (match && match.code !== 'en') {
      return match;
    }
  }

  // 2. Check TimeZone region
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/Riyadh|Dubai|Cairo|Baghdad|Kuwait|Qatar|Amman|Casablanca|Beirut|Muscat|Tripoli|Khartoum|Tunis|Algiers|Aden|Damascus|Sanaa/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'ar')!;
    }
    if (/Madrid|Mexico|Bogota|Buenos_Aires|Santiago|Lima|Caracas|Montevideo|Asuncion|Guatemala|Havana|Costa_Rica|Panama|San_Jose|Santo_Domingo|Tegucigalpa|Managua|Quito/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'es')!;
    }
    if (/Paris|Brussels|Montreal|Dakar|Abidjan|Kinshasa|Geneva/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'fr')!;
    }
    if (/Berlin|Vienna|Zurich/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'de')!;
    }
    if (/Sao_Paulo|Lisbon|Luanda|Maputo|Fortaleza|Recife/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'pt')!;
    }
    if (/Tokyo/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'ja')!;
    }
    if (/Seoul/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'ko')!;
    }
    if (/Shanghai|Taipei|Hong_Kong|Beijing|Chongqing|Urumqi/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'zh-CN')!;
    }
    if (/Moscow|Novosibirsk|Yekaterinburg|Krasnoyarsk|Samara|Vladivostok/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'ru')!;
    }
    if (/Istanbul/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'tr')!;
    }
    if (/Rome/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'it')!;
    }
    if (/Kolkata|Calcutta/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'hi')!;
    }
    if (/Amsterdam/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'nl')!;
    }
    if (/Warsaw/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'pl')!;
    }
    if (/Jakarta|Pontianak|Makassar|Jayapura/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'id')!;
    }
    if (/Ho_Chi_Minh|Saigon|Hanoi/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'vi')!;
    }
    if (/Bangkok/i.test(tz)) {
      return ALL_SUPPORTED_LANGUAGES.find(l => l.code === 'th')!;
    }
  } catch (_) {}

  return ALL_SUPPORTED_LANGUAGES[0]; // English
}

export function setGoogleTranslateCookie(langCode: string) {
  const cookieDomain = window.location.hostname;
  // Write to both /en/CODE and /auto/CODE across all paths and domain
  document.cookie = `googtrans=/en/${langCode}; path=/;`;
  document.cookie = `googtrans=/auto/${langCode}; path=/;`;
  if (cookieDomain && cookieDomain !== 'localhost') {
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${cookieDomain};`;
    document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${cookieDomain};`;
  }
}

export function applyGoogleTranslateLanguage(langCode: string, reloadFallback = true): void {
  localStorage.setItem('user_lang_preference', langCode);
  setGoogleTranslateCookie(langCode);

  const langObj = ALL_SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  if (langObj?.isRTL) {
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.classList.add('rtl-layout');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.classList.remove('rtl-layout');
  }

  // Trigger Google Translate native combo selector if initialized in DOM
  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
  } else if (reloadFallback) {
    // If not yet present in DOM, a soft reload with the cookie set instantly activates Google Translate
    window.location.reload();
  }
}

export function initRegionalGoogleTranslate(): GoogleTranslateLanguage {
  const detected = detectVisitorLanguage();
  const current = getCurrentGoogleTranslateLanguage();

  // If visitor is from a non-English region and hasn't loaded that translation yet, activate it!
  if (detected.code !== 'en' && current !== detected.code && !localStorage.getItem('user_lang_preference')) {
    setGoogleTranslateCookie(detected.code);
    if (detected.isRTL) {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  } else if (current && current !== 'en') {
    const currentObj = ALL_SUPPORTED_LANGUAGES.find(l => l.code === current);
    if (currentObj?.isRTL) {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }

  return detected;
}
