import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import { User } from '../types';
import { getApiUrl } from '../utils/api';

interface UserReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  token?: string;
}

export default function UserReferralModal({
  isOpen,
  onClose,
  user,
  token
}: UserReferralModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralStats, setReferralStats] = useState<{
    referralCode: string;
    referredCount: number;
    referralEarnings: number;
    referrals: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
      isVerified: boolean;
      country: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const referralCode = user.referralCode || `ELON-${user.name.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()}-7742`;
  const referralUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${referralCode}`
    : `https://eloncapital.org/?ref=${referralCode}`;

  useEffect(() => {
    if (!isOpen) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(getApiUrl('/api/user/referrals'), { headers });
        if (res.ok) {
          const data = await res.json();
          setReferralStats(data);
        }
      } catch (err) {
        console.error('Failed to load user referral metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isOpen, user.id, token]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#09090b] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white text-left my-8"
        id="user-referral-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black font-display text-white">
              Elon Capital Affiliate & Referral Program
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Share your institutional code to invite businesses and earn financial rewards.
            </p>
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/30 via-zinc-900 to-black border border-emerald-500/30 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Your Unique Referral Code
            </span>
            <button
              onClick={copyCode}
              className="text-emerald-400 hover:text-white flex items-center gap-1 font-bold text-[11px] cursor-pointer"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-black/60 px-4 py-3 rounded-xl border border-white/10">
            <span className="text-lg font-mono font-bold tracking-widest text-emerald-300 select-all">
              {referralCode}
            </span>
          </div>

          {/* Referral Link */}
          <div className="pt-1">
            <span className="text-[11px] text-gray-400 block mb-1.5 font-mono">Your Direct Invitation Link:</span>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={referralUrl}
                className="w-full px-3 py-2 bg-black/70 border border-white/10 rounded-xl text-xs text-gray-300 font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={copyLink}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Performance Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">
              Total Borrowers Referred
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {referralStats?.referredCount ?? user.referredCount ?? 0}
            </div>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">
              Accrued Referral Credits
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              ${(referralStats?.referralEarnings ?? user.referralEarnings ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Referred Users List */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase font-bold text-gray-400 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-cyan-400" /> Your Referred Network (
            {referralStats?.referrals?.length || 0})
          </h4>

          {loading ? (
            <div className="p-4 text-center text-xs text-gray-500">Loading referral metrics...</div>
          ) : !referralStats?.referrals?.length ? (
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-center text-xs text-gray-500">
              You haven't referred any borrowers yet. Share your code to start building your referral network!
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-white/5 pr-1">
              {referralStats.referrals.map((ref) => (
                <div key={ref.id} className="pt-1.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{ref.name}</span>
                    <span className="text-[10px] text-gray-500 block font-mono">
                      {ref.country || 'Global'} • {new Date(ref.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase ${
                    ref.isVerified ? 'bg-cyan-950/40 text-cyan-400' : 'bg-white/5 text-gray-400'
                  }`}>
                    {ref.isVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <span>Elon Capital Affiliate Protocol</span>
          <button 
            type="button"
            onClick={onClose}
            className="text-emerald-400 hover:text-white font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
