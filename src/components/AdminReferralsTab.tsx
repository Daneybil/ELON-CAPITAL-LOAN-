import React, { useState, useMemo } from 'react';
import { 
  Gift, 
  Search, 
  Globe, 
  Users, 
  TrendingUp, 
  Award, 
  Download, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ArrowUpRight,
  Filter,
  Copy,
  Check
} from 'lucide-react';
import { User } from '../types';

interface ReferralItem {
  userId: string;
  userName: string;
  userEmail: string;
  userCountry: string; // The referred user's country
  userPhone?: string;
  registeredAt: string;
  isVerified: boolean;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referrerCode: string;
  referrerCountry: string;
  hasLoan: boolean;
  loanStatus: string;
  loanAmount: number;
}

interface TopReferrer {
  id: string;
  name: string;
  email: string;
  code: string;
  country: string;
  referredCount: number;
  activeLoansCount: number;
  totalLoanVolume: number;
}

interface ReferralsData {
  totalReferredUsers: number;
  totalReferrers: number;
  countryBreakdown: Record<string, number>;
  topReferrers: TopReferrer[];
  referralsList: ReferralItem[];
}

interface AdminReferralsTabProps {
  referralsData: ReferralsData | null;
  onRefresh: () => void;
  onSelectUser: (user: User) => void;
  users: User[];
}

export default function AdminReferralsTab({
  referralsData,
  onRefresh,
  onSelectUser,
  users
}: AdminReferralsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const list: ReferralItem[] = referralsData?.referralsList || [];

  // Filtered List
  const filteredReferrals = useMemo(() => {
    return list.filter((item) => {
      const matchesSearch = 
        item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.userCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referrerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referrerCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry = 
        selectedCountry === 'all' || 
        item.userCountry.toLowerCase() === selectedCountry.toLowerCase();

      return matchesSearch && matchesCountry;
    });
  }, [list, searchQuery, selectedCountry]);

  // Unique list of countries represented in the referred users
  const uniqueCountries = useMemo(() => {
    const counts = referralsData?.countryBreakdown || {};
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [referralsData]);

  // Total Loan Volume from referred users
  const totalReferredLoanVolume = useMemo(() => {
    return list.reduce((sum, item) => sum + (item.loanAmount || 0), 0);
  }, [list]);

  // Export CSV
  const handleExportCSV = () => {
    if (!list.length) return;
    const headers = [
      'Referred User Name',
      'Referred User Email',
      'Referred User Country',
      'User Phone',
      'Registration Date',
      'Verification Status',
      'Referrer Name',
      'Referrer Email',
      'Referrer Country',
      'Referral Code Used',
      'Loan Status',
      'Loan Amount (USD)'
    ];

    const rows = list.map((item) => [
      `"${item.userName}"`,
      `"${item.userEmail}"`,
      `"${item.userCountry}"`,
      `"${item.userPhone || ''}"`,
      `"${new Date(item.registeredAt).toLocaleDateString()}"`,
      `"${item.isVerified ? 'VERIFIED' : 'UNVERIFIED'}"`,
      `"${item.referrerName}"`,
      `"${item.referrerEmail}"`,
      `"${item.referrerCountry}"`,
      `"${item.referrerCode}"`,
      `"${item.loanStatus}"`,
      item.loanAmount || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ElonCapital_Referral_Attribution_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowClickUser = (userId: string, userEmail: string) => {
    const found = users.find(u => u.id === userId || u.email.toLowerCase() === userEmail.toLowerCase());
    if (found) {
      onSelectUser(found);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="admin-view-referrals">
      {/* Top Banner & Audit Overview */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-black border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Gift className="h-5 w-5" />
            </span>
            <h3 className="font-display text-xl font-bold text-white tracking-wide">
              Global Referral Network & Geographic Attribution
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Live administrative ledger tracking all referred borrowers, referrer performance metrics, commission origin, and geographic distribution across global jurisdictions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="h-3.5 w-3.5" /> Export Audit CSV
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="px-3.5 py-2 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Refresh Ledger
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Total Referred Users</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {referralsData?.totalReferredUsers ?? list.length}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">
            Across {uniqueCountries.length} registered countries
          </span>
        </div>

        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Active Referrers</span>
            <Award className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono mt-2">
            {referralsData?.totalReferrers ?? 0}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">
            Borrowers with active referral networks
          </span>
        </div>

        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Referred Loan Volume</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">
            ${totalReferredLoanVolume.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">
            Funded & applied through referral links
          </span>
        </div>

        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-gray-400 font-bold">Top Referred Country</span>
            <Globe className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-300 truncate font-mono mt-2">
            {uniqueCountries[0] ? `${uniqueCountries[0][0]} (${uniqueCountries[0][1]})` : 'None yet'}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">
            Highest concentration of referred borrowers
          </span>
        </div>
      </div>

      {/* Referred Users Country Distribution Grid */}
      <div className="p-5 bg-white/[0.015] border border-white/5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-2">
            <Globe className="h-4 w-4" /> Referred Users By Country (Geographic Origin)
          </h4>
          <span className="text-[10px] text-gray-500">
            Click any country badge below to filter the audit table
          </span>
        </div>

        {uniqueCountries.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">
            No referral records recorded yet. Once users register using a referral code or referral link, their country and referrer details will populate here automatically.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSelectedCountry('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCountry === 'all'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              All Countries ({list.length})
            </button>
            {uniqueCountries.map(([country, count]) => {
              const isSelected = selectedCountry.toLowerCase() === country.toLowerCase();
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => setSelectedCountry(isSelected ? 'all' : country)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Globe className="h-3 w-3 text-emerald-400" />
                  <span>{country}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-black text-emerald-300' : 'bg-white/10 text-emerald-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Referrers Leaderboard */}
      {referralsData?.topReferrers && referralsData.topReferrers.length > 0 && (
        <div className="p-5 bg-white/[0.015] border border-white/5 rounded-2xl space-y-4">
          <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
            <Award className="h-4 w-4" /> Top Affiliate & Borrower Referrers
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {referralsData.topReferrers.slice(0, 6).map((ref, idx) => (
              <div 
                key={ref.id}
                className="p-4 bg-black/40 border border-white/10 rounded-xl flex items-start justify-between gap-3 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{ref.name}</h5>
                    <span className="text-[10px] text-gray-500 font-mono block">{ref.email}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3 text-cyan-400" /> {ref.country}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {ref.referredCount} {ref.referredCount === 1 ? 'user' : 'users'}
                  </span>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {ref.activeLoansCount} active loans
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono font-bold mt-1">
                    ${(ref.totalLoanVolume || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Attribution Table Controls */}
      <div className="bg-white/[0.015] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search referred user, country, code, referrer..."
                className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {selectedCountry !== 'all' && (
              <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5">
                Filtered: <strong>{selectedCountry}</strong>
                <button 
                  type="button" 
                  onClick={() => setSelectedCountry('all')}
                  className="hover:text-white ml-1 text-gray-400 font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500 font-mono">
            Showing <strong className="text-white">{filteredReferrals.length}</strong> of {list.length} referrals
          </div>
        </div>

        {/* Master Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="bg-white/[0.02] text-gray-400 uppercase text-[10px] font-mono border-b border-white/5">
              <tr>
                <th className="p-4 font-semibold">Referred User</th>
                <th className="p-4 font-semibold text-emerald-400">Referred User's Country</th>
                <th className="p-4 font-semibold">Referred By (Affiliate)</th>
                <th className="p-4 font-semibold">Referrer Country</th>
                <th className="p-4 font-semibold">Referral Code</th>
                <th className="p-4 font-semibold">Reg Date</th>
                <th className="p-4 font-semibold">Verification</th>
                <th className="p-4 font-semibold">Loan Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 italic">
                    {searchQuery || selectedCountry !== 'all'
                      ? 'No referral attribution records match your search criteria.'
                      : 'No users have registered with referral codes yet.'}
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((item) => (
                  <tr key={item.userId} className="hover:bg-white/[0.015] transition-colors">
                    {/* 1. Referred User */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white font-mono text-[10px] shrink-0">
                          {item.userName[0] || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{item.userName}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{item.userEmail}</span>
                          {item.userPhone && (
                            <span className="text-[9px] text-gray-600 font-mono">{item.userPhone}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. REFERRED USER'S COUNTRY (Prominently Highlighted) */}
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold text-xs shadow-sm">
                        <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{item.userCountry || 'United States'}</span>
                      </div>
                    </td>

                    {/* 3. Referrer Details */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{item.referrerName}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{item.referrerEmail}</span>
                      </div>
                    </td>

                    {/* 4. Referrer Country */}
                    <td className="p-4">
                      <span className="text-xs text-gray-300 font-medium">
                        {item.referrerCountry || 'United States'}
                      </span>
                    </td>

                    {/* 5. Referral Code Used */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-cyan-400 font-mono font-bold text-[10px]">
                          {item.referrerCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.referrerCode)}
                          className="text-gray-500 hover:text-white transition-colors p-1"
                          title="Copy Code"
                        >
                          {copiedCode === item.referrerCode ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 6. Registration Date */}
                    <td className="p-4 font-mono text-[10px] text-gray-400">
                      {new Date(item.registeredAt).toLocaleDateString()}
                    </td>

                    {/* 7. Verification */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase ${
                        item.isVerified 
                          ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' 
                          : 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </td>

                    {/* 8. Loan Status */}
                    <td className="p-4">
                      {item.hasLoan ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            ${(item.loanAmount || 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-gray-400 uppercase font-mono">
                            {item.loanStatus}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-600 italic">No loan submitted</span>
                      )}
                    </td>

                    {/* 9. Action */}
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRowClickUser(item.userId, item.userEmail)}
                        className="px-2.5 py-1 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20 bg-cyan-950/20 rounded-md hover:bg-cyan-400 hover:text-black transition-all cursor-pointer inline-flex items-center gap-1"
                        title="View Complete User Profile & Credit Facilities"
                      >
                        <UserCheck className="h-3 w-3" /> Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
