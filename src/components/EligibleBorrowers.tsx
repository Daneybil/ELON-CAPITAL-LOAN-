import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function EligibleBorrowers() {
  const { t } = useTranslation();

  const eligibleGroups = [
    { 
      category: t('borrowers.earlyVenture', "Early Venture"), 
      items: [
        t('borrowers.item1', "Entrepreneurs launching new businesses"), 
        t('borrowers.item2', "Startup founders"), 
        t('borrowers.item3', "Web3 developers"), 
        t('borrowers.item4', "Innovation-driven ventures")
      ] 
    },
    { 
      category: t('borrowers.corporateCommercial', "Corporate & Commercial"), 
      items: [
        t('borrowers.item5', "Small businesses"), 
        t('borrowers.item6', "Medium-sized businesses"), 
        t('borrowers.item7', "Companies seeking expansion capital"), 
        t('borrowers.item8', "Technology companies"), 
        t('borrowers.item9', "Digital businesses")
      ] 
    },
    { 
      category: t('borrowers.assetTreasury', "Asset & Treasury Platforms"), 
      items: [
        t('borrowers.item10', "Blockchain businesses"), 
        t('borrowers.item11', "Cryptocurrency businesses"), 
        t('borrowers.item12', "Forex-related businesses"), 
        t('borrowers.item13', "Investment projects"), 
        t('borrowers.item14', "Professional investors applying for financing")
      ] 
    }
  ];

  return (
    <div className="bg-black py-12 sm:py-16 lg:py-20 border-t border-white/5" id="borrowers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 lg:mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-400 mb-3">{t('borrowers.compliance', 'Institutional Compliance')}</h2>
            <h3 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {t('borrowers.title', 'Eligible Entities & Borrowers')}
            </h3>
            <p className="text-gray-400 mt-4 text-sm font-light">
              {t('borrowers.subtitle', 'Our specialized credit protocol evaluates and issues capital facilities to a diverse spectrum of high-potential creators, innovators, and corporations.')}
            </p>
          </div>
          <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl max-w-sm backdrop-blur-md">
            <ShieldAlert className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
              {t('borrowers.enhancedVerificationNote', '*Enhanced verification protocols automatically apply to applications exceeding')} <span className="text-white font-semibold">$5,000,000 USD</span>.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="borrowers-grid">
          {eligibleGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="bg-white/[0.01] border border-white/5 rounded-xl p-6 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
              <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
                {group.category}
              </h4>
              <ul className="space-y-4" id={`borrower-list-${groupIdx}`}>
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3 group">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-gray-300 font-light leading-snug group-hover:text-white transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
