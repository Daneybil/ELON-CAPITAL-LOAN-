import React from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function EligibleBorrowers() {
  const eligibleGroups = [
    { category: "Early Venture", items: ["Entrepreneurs launching new businesses", "Startup founders", "Web3 developers", "Innovation-driven ventures"] },
    { category: "Corporate & Commercial", items: ["Small businesses", "Medium-sized businesses", "Companies seeking expansion capital", "Technology companies", "Digital businesses"] },
    { category: "Asset & Treasury Platforms", items: ["Blockchain businesses", "Cryptocurrency businesses", "Forex-related businesses", "Investment projects", "Professional investors applying for financing"] }
  ];

  return (
    <div className="bg-black py-20 border-t border-white/5" id="borrowers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-400 mb-3">Institutional Compliance</h2>
            <h3 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Eligible Entities & Borrowers
            </h3>
            <p className="text-gray-400 mt-4 text-sm font-light">
              Our specialized credit protocol evaluates and issues capital facilities to a diverse spectrum of high-potential creators, innovators, and corporations.
            </p>
          </div>
          <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl max-w-sm backdrop-blur-md">
            <ShieldAlert className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
              *Enhanced verification protocols automatically apply to applications exceeding <span className="text-white font-semibold">$5,000,000 USD</span>.
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
