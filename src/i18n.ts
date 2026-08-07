import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', flag: '🇳🇬' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
];

const resources = {
  en: {
    translation: {
      "nav.home": "Home",
      "nav.howItWorks": "How It Works",
      "nav.transparency": "Transparency",
      "nav.checkEligibility": "Check Eligibility",
      "nav.apply": "Apply",
      "nav.calculator": "Calculator",
      "nav.dashboard": "Dashboard",
      "nav.support": "Support",
      "nav.warning": "⚠️ Global Warning",
      "nav.login": "Login",
      "nav.register": "Register",
      "nav.logout": "Logout",
      "hero.title": "Institutional Loan Protocol",
      "hero.subtitle": "Empowering Entrepreneurs, Startups & Growing Businesses Worldwide",
      "language.select": "Select Language",
      "language.autoDetected": "Auto-Detected Browser Language"
    }
  },
  es: {
    translation: {
      "nav.home": "Inicio",
      "nav.howItWorks": "Cómo Funciona",
      "nav.transparency": "Transparencia",
      "nav.checkEligibility": "Verificar Elegibilidad",
      "nav.apply": "Solicitar",
      "nav.calculator": "Calculadora",
      "nav.dashboard": "Panel",
      "nav.support": "Soporte",
      "nav.warning": "⚠️ Advertencia Global",
      "nav.login": "Iniciar Sesión",
      "nav.register": "Registrarse",
      "nav.logout": "Cerrar Sesión",
      "hero.title": "Protocolo de Préstamos Institucionales",
      "hero.subtitle": "Impulsando Emprendedores, Empresas Emergentes y Negocios en Crecimiento",
      "language.select": "Seleccionar Idioma",
      "language.autoDetected": "Idioma Detectado Automáticamente"
    }
  },
  fr: {
    translation: {
      "nav.home": "Accueil",
      "nav.howItWorks": "Comment Ça Marche",
      "nav.transparency": "Transparence",
      "nav.checkEligibility": "Vérifier l'Éligibilité",
      "nav.apply": "Postuler",
      "nav.calculator": "Calculateur",
      "nav.dashboard": "Tableau de Bord",
      "nav.support": "Support",
      "nav.warning": "⚠️ Avertissement Global",
      "nav.login": "Connexion",
      "nav.register": "S'inscrire",
      "nav.logout": "Déconnexion",
      "hero.title": "Protocole de Prêt Institutionnel",
      "hero.subtitle": "Soutenir les Entrepreneurs, Startups et Entreprises en Croissance",
      "language.select": "Choisir la Langue",
      "language.autoDetected": "Langue Détectée Automatiquement"
    }
  },
  de: {
    translation: {
      "nav.home": "Startseite",
      "nav.howItWorks": "Wie es funktioniert",
      "nav.transparency": "Transparenz",
      "nav.checkEligibility": "Berechtigung prüfen",
      "nav.apply": "Beantragen",
      "nav.calculator": "Rechner",
      "nav.dashboard": "Dashboard",
      "nav.support": "Unterstützung",
      "nav.warning": "⚠️ Globale Warnung",
      "nav.login": "Anmelden",
      "nav.register": "Registrieren",
      "nav.logout": "Abmelden",
      "hero.title": "Institutionelles Kreditprotokoll",
      "hero.subtitle": "Unterstützung von Unternehmern, Start-ups und wachsenden Unternehmen",
      "language.select": "Sprache auswählen",
      "language.autoDetected": "Automatisch erkannte Sprache"
    }
  },
  pt: {
    translation: {
      "nav.home": "Início",
      "nav.howItWorks": "Como Funciona",
      "nav.transparency": "Transparência",
      "nav.checkEligibility": "Verificar Elegibilidade",
      "nav.apply": "Solicitar",
      "nav.calculator": "Calculadora",
      "nav.dashboard": "Painel",
      "nav.support": "Suporte",
      "nav.warning": "⚠️ Aviso Global",
      "nav.login": "Entrar",
      "nav.register": "Cadastrar",
      "nav.logout": "Sair",
      "hero.title": "Protocolo de Empréstimo Institucional",
      "hero.subtitle": "Capacitando Empreendedores, Startups e Empresas em Crescimento",
      "language.select": "Selecionar Idioma",
      "language.autoDetected": "Idioma Detectado Automaticamente"
    }
  },
  ar: {
    translation: {
      "nav.home": "الرئيسية",
      "nav.howItWorks": "كيف يعمل",
      "nav.transparency": "الشفافية",
      "nav.checkEligibility": "التحقق من الأهلية",
      "nav.apply": "تقديم الطلب",
      "nav.calculator": "الحاسبة",
      "nav.dashboard": "لوحة التحكم",
      "nav.support": "الدعم",
      "nav.warning": "⚠️ تحذير عالمي",
      "nav.login": "تسجيل الدخول",
      "nav.register": "إنشاء حساب",
      "nav.logout": "تسجيل الخروج",
      "hero.title": "بروتوكول القروض المؤسسية",
      "hero.subtitle": "تمكين رواد الأعمال والشركات الناشئة والشركات النامية",
      "language.select": "اختر اللغة",
      "language.autoDetected": "اللغة المكتشفة تلقائياً"
    }
  },
  zh: {
    translation: {
      "nav.home": "首页",
      "nav.howItWorks": "运作方式",
      "nav.transparency": "透明度",
      "nav.checkEligibility": "检查资格",
      "nav.apply": "申请贷款",
      "nav.calculator": "贷款计算器",
      "nav.dashboard": "控制面板",
      "nav.support": "客户支持",
      "nav.warning": "⚠️ 全球警示",
      "nav.login": "登录",
      "nav.register": "注册",
      "nav.logout": "退出",
      "hero.title": "机构贷款协议",
      "hero.subtitle": "助力全球创业者、初创企业与成长型企业",
      "language.select": "选择语言",
      "language.autoDetected": "自动检测浏览器语言"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

// Handle RTL text direction automatically
i18n.on('languageChanged', (lng) => {
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lng || l.code === lng.split('-')[0]);
  if (langObj && langObj.rtl) {
    document.dir = 'rtl';
    document.documentElement.lang = langObj.code;
  } else {
    document.dir = 'ltr';
    document.documentElement.lang = lng || 'en';
  }
});

export default i18n;
