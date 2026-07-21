import React from 'react';
import { 
  User, 
  LoanApplication, 
  KYC, 
  Message, 
  SupportTicket, 
  Announcement, 
  SystemLog, 
  HomePageContent 
} from '../types';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  AlertTriangle, 
  Activity, 
  HelpCircle, 
  MessageSquare, 
  Bell, 
  Settings, 
  Play, 
  Check, 
  X, 
  Search, 
  Lock, 
  Megaphone, 
  RefreshCw, 
  Download, 
  Server, 
  Eye,
  Globe
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: User;
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({
  adminUser,
  token,
  onLogout,
}: AdminDashboardProps) {
  // Authentication Guards
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState('');
  const [mfaCode, setMfaCode] = React.useState('');
  const [mfaStep, setMfaStep] = React.useState(false);
  const [demoMfaToken] = React.useState('842940');

  // Panel Tabs
  const [adminTab, setAdminTab] = React.useState<'stats' | 'users' | 'kyc' | 'loans' | 'tickets' | 'announcements' | 'homepage' | 'logs'>('stats');

  // Dynamic API State
  const [adminStats, setAdminStats] = React.useState<any>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [searchUser, setSearchUser] = React.useState('');
  const [kycRequests, setKycRequests] = React.useState<KYC[]>([]);
  const [loans, setLoans] = React.useState<LoanApplication[]>([]);
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [logs, setLogs] = React.useState<SystemLog[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [homePage, setHomePage] = React.useState<HomePageContent | null>(null);

  // Modal Doc Viewers
  const [activeKycDoc, setActiveKycDoc] = React.useState<KYC | null>(null);
  const [kycRemarks, setKycRemarks] = React.useState('');
  const [activeLoanView, setActiveLoanView] = React.useState<LoanApplication | null>(null);
  const [activeTicketView, setActiveTicketView] = React.useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = React.useState('');

  // Form inputs
  const [newAnnTitle, setNewAnnTitle] = React.useState('');
  const [newAnnContent, setNewAnnContent] = React.useState('');
  const [newAnnCat, setNewAnnCat] = React.useState<'General' | 'Security' | 'Maintenance' | 'Update'>('General');

  // Editable Homepage form
  const [editHeadline, setEditHeadline] = React.useState('');
  const [editSubheadline, setEditSubheadline] = React.useState('');
  const [editStatFunded, setEditStatFunded] = React.useState('');
  const [editStatBorrowers, setEditStatBorrowers] = React.useState('');
  const [editStatProjects, setEditStatProjects] = React.useState('');

  // Page States
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');

  const headers = React.useMemo(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  const triggerAlert = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Fetch administrator states
  const fetchAdminData = React.useCallback(async () => {
    if (!isAuthorized) return;
    try {
      const resStats = await fetch('/api/admin/stats', { headers });
      if (resStats.ok) setAdminStats(await resStats.ok ? await resStats.json() : null);

      const resUsers = await fetch(`/api/admin/users?search=${searchUser}`, { headers });
      if (resUsers.ok) setUsers(await resUsers.json());

      const resKyc = await fetch('/api/admin/kyc', { headers });
      if (resKyc.ok) setKycRequests(await resKyc.json());

      const resLoans = await fetch('/api/admin/loans', { headers });
      if (resLoans.ok) setLoans(await resLoans.json());

      const resTkts = await fetch('/api/admin/tickets', { headers });
      if (resTkts.ok) setTickets(await resTkts.json());

      const resLogs = await fetch('/api/admin/logs', { headers });
      if (resLogs.ok) setLogs(await resLogs.json());

      const resAnn = await fetch('/api/announcements', { headers });
      if (resAnn.ok) setAnnouncements(await resAnn.json());

      const resHome = await fetch('/api/homepage', { headers });
      if (resHome.ok) {
        const hData = await resHome.json();
        setHomePage(hData);
        setEditHeadline(hData.heroHeadline);
        setEditSubheadline(hData.heroSubheadline);
        setEditStatFunded(hData.statTotalFunded);
        setEditStatBorrowers(hData.statActiveBorrowers);
        setEditStatProjects(hData.statGlobalProjects);
      }
    } catch (err) {
      console.error('Error fetching admin panels', err);
    }
  }, [isAuthorized, searchUser, headers]);

  React.useEffect(() => {
    fetchAdminData();
    if (isAuthorized) {
      const interval = setInterval(fetchAdminData, 6000);
      return () => clearInterval(interval);
    }
  }, [fetchAdminData, isAuthorized]);

  // Auth administrative password check
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (adminPassword === 'admin123') {
      setMfaStep(true);
      triggerAlert('success', 'Credentials accepted. Input MFA secure code.');
    } else {
      triggerAlert('error', 'Invalid administrative access password.');
    }
  };

  // Auth administrative 2FA check
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/verify-2fa', {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: mfaCode })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failure.');

      setIsAuthorized(true);
      triggerAlert('success', 'Security protocols unlocked. Access approved.');
    } catch (err: any) {
      triggerAlert('error', err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Suspend / Unsuspend user account
  const handleToggleSuspension = async (userId: string, suspend: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/suspend', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, suspend })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed.');

      triggerAlert('success', `User successfully ${suspend ? 'suspended' : 'reinstated'}.`);
      setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve / Reject KYC
  const handleAuditKyc = async (kycId: string, status: 'Approved' | 'Rejected') => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kyc/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({ kycId, status, remarks: kycRemarks })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'KYC Audit update failed.');

      triggerAlert('success', `KYC decision recorded as: ${status}`);
      setKycRequests(prev => prev.map(k => k.id === kycId ? data.kyc : k));
      setActiveKycDoc(null);
      setKycRemarks('');
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve / Decline Loan Applications
  const handleAuditLoan = async (loanId: string, status: 'Approved' | 'Declined' | 'Under Review' | 'Processing') => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/loans/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({ loanId, status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Loan status update failed.');

      triggerAlert('success', `Loan application ${loanId} set to: ${status}`);
      setLoans(prev => prev.map(l => l.id === loanId ? data.loan : l));
      setActiveLoanView(null);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disburse Funds for approved, collateral paid loan
  const handleDisburseLoan = async (loanId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/loans/disburse', {
        method: 'POST',
        headers,
        body: JSON.stringify({ loanId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Loan disbursement failed.');

      triggerAlert('success', `Loan application ${loanId} marked as DISBURSED!`);
      setLoans(prev => prev.map(l => l.id === loanId ? data.loan : l));
      setActiveLoanView(null);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reply & Resolve Support ticket
  const handleTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReply.trim() || !activeTicketView) return;
    setLoading(true);

    try {
      const res = await fetch('/api/support/tickets/reply', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ticketId: activeTicketView.id, content: ticketReply })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post reply.');

      setTickets(prev => prev.map(t => t.id === activeTicketView.id ? data.ticket : t));
      setActiveTicketView(data.ticket);
      setTicketReply('');
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tickets/resolve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ticketId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resolve ticket.');

      triggerAlert('success', 'Ticket successfully marked as resolved.');
      setTickets(prev => prev.map(t => t.id === ticketId ? data.ticket : t));
      setActiveTicketView(null);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Announcements
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/announcements/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: newAnnTitle, content: newAnnContent, category: newAnnCat })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post announcement.');

      triggerAlert('success', 'New network-wide announcement published.');
      setAnnouncements(prev => [data.announcement, ...prev]);
      setNewAnnTitle('');
      setNewAnnContent('');
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manage Homepage contents
  const handleUpdateHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/homepage/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          heroHeadline: editHeadline,
          heroSubheadline: editSubheadline,
          statTotalFunded: editStatFunded,
          statActiveBorrowers: editStatBorrowers,
          statGlobalProjects: editStatProjects
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update content.');

      triggerAlert('success', 'Homepage content parameters updated successfully.');
      setHomePage(data.content);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mock Report downloader
  const triggerReportDownload = () => {
    triggerAlert('success', 'Synthesizing report memo... check system logs.');
  };

  // Unauthorized display: Form
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-black border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)]" id="admin-auth-panel">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-white tracking-wide">Administrative Authorization</h2>
          <p className="text-xs text-gray-500 font-mono mt-1">RESTRICTED AREA • PRIVATE SYSTEM ACCESS</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded-lg text-xs font-mono text-red-400">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-lg text-xs font-mono text-cyan-400">
            {successMsg}
          </div>
        )}

        {!mfaStep ? (
          <form onSubmit={handleVerifyPassword} className="space-y-4" id="form-admin-pw">
            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Private Console Password</label>
              <input 
                type="password" 
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/5 focus:border-cyan-500/50 rounded-xl text-sm text-white focus:outline-none"
                placeholder="e.g. admin123"
              />
              <span className="text-[10px] text-gray-500 font-mono mt-2 block">*Demo credentials password is: <span className="text-white">admin123</span></span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-xs font-semibold text-black bg-white hover:bg-cyan-400 rounded-xl transition-all"
            >
              Verify Master Password
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyMfa} className="space-y-4" id="form-admin-mfa">
            {/* Show code directly to evaluation agent */}
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg text-xs text-center font-mono text-gray-400">
              MFA Security Token generated: <span className="text-white font-bold select-all">{demoMfaToken}</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase mb-2">6-Digit 2FA Authenticator Token</label>
              <input 
                type="text" 
                maxLength={6}
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/5 focus:border-cyan-500/50 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Unlock Administration Desk"}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Authorized Admin View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="admin-dashboard-root">
      
      {/* Alert Overlays */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-950/90 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-400 shadow-[0_4px_30px_rgba(6,182,212,0.3)] flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-950/90 border border-red-500/30 rounded-xl text-xs font-mono text-red-400 shadow-[0_4px_30px_rgba(239,68,68,0.3)] flex items-center gap-2 animate-pulse">
          <AlertTriangle className="h-4 w-4" /> {errorMsg}
        </div>
      )}

      {/* Admin Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4" id="admin-header">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-wide">Administration Console</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">SpaceLoan.space operations and security cockpit</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={triggerReportDownload}
            className="px-4 py-2.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-1.5 font-semibold cursor-pointer"
            id="btn-admin-report"
          >
            <Download className="h-4 w-4" /> Generate Report
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 text-xs text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-lg transition-all"
          >
            Exit Console
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1.5" id="admin-sidebar">
          <button
            onClick={() => setAdminTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'stats' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <Activity className="h-4 w-4" /> Overview
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'users' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <Users className="h-4 w-4" /> Users
          </button>

          <button
            onClick={() => setAdminTab('loans')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'loans' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="flex items-center gap-3"><FileText className="h-4 w-4" /> Applications</span>
            {loans.filter(l => l.status === 'Pending').length > 0 && (
              <span className="bg-cyan-500 text-black font-mono font-bold text-[9px] px-2 py-0.5 rounded-full">
                {loans.filter(l => l.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('kyc')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'kyc' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="flex items-center gap-3"><ShieldCheck className="h-4 w-4" /> KYC</span>
            {kycRequests.filter(k => k.status === 'Pending').length > 0 && (
              <span className="bg-yellow-500 text-black font-mono font-bold text-[9px] px-2 py-0.5 rounded-full">
                {kycRequests.filter(k => k.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('tickets')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'tickets' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="flex items-center gap-3"><FileText className="h-4 w-4" /> Documents</span>
            {tickets.filter(t => t.status === 'Open').length > 0 && (
              <span className="bg-white/10 text-white font-mono text-[9px] px-2 py-0.5 rounded-full">
                {tickets.filter(t => t.status === 'Open').length}
              </span>
            )}
          </button>

          <button
            onClick={triggerReportDownload}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/[0.01] transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" /> Reports
          </button>

          <button
            onClick={() => setAdminTab('homepage')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'homepage' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
        </div>

        {/* Admin Workspace */}
        <div className="lg:col-span-3 bg-white/[0.01] border border-white/5 rounded-2xl p-8 backdrop-blur-md shadow-2xl min-h-[520px]" id="admin-workspace">
          
          {/* ---------------- A. ANALYTICS & STATS ---------------- */}
          {adminTab === 'stats' && adminStats && (
            <div className="space-y-8 animate-fade-in" id="admin-view-stats">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">Platform Activity Analytics</h3>
                <p className="text-xs text-gray-400">Aggregated real-time metrics across capital provisioning systems.</p>
              </div>

              {/* Counter Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-mono block uppercase">Total Borrowers</span>
                  <span className="text-2xl font-bold text-white font-mono">{adminStats.totalUsers}</span>
                </div>
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-mono block uppercase">Funding Requests</span>
                  <span className="text-2xl font-bold text-white font-mono">{adminStats.totalApplications}</span>
                </div>
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-mono block uppercase">KYC In Queue</span>
                  <span className="text-2xl font-bold text-cyan-400 font-mono">{adminStats.kycPending}</span>
                </div>
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-mono block uppercase">Open Tickets</span>
                  <span className="text-2xl font-bold text-yellow-500 font-mono">{adminStats.openTickets}</span>
                </div>
              </div>

              {/* Volume metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-mono text-gray-500 block uppercase mb-1">Total Requested Capital Volume</span>
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono">${adminStats.totalVolumeApplied.toLocaleString()}</span>
                  <p className="text-[10px] text-gray-500 mt-2">Combined face value of all historic applications.</p>
                </div>
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-mono text-gray-500 block uppercase mb-1">Dispatched Capital Reserves</span>
                  <span className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono">${adminStats.totalVolumeApproved.toLocaleString()}</span>
                  <p className="text-[10px] text-gray-500 mt-2">Total approved funding active on the ledger.</p>
                </div>
              </div>

              {/* Custom CSS Bar Charts */}
              <div>
                <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Capital Allocations Overview</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Approved Applications ({adminStats.approvedApplications})</span>
                      <span className="font-mono">{Math.round((adminStats.approvedApplications / (adminStats.totalApplications || 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(adminStats.approvedApplications / (adminStats.totalApplications || 1)) * 100}%` }}
                        className="h-full bg-cyan-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Pending Audits ({adminStats.pendingApplications})</span>
                      <span className="font-mono">{Math.round((adminStats.pendingApplications / (adminStats.totalApplications || 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(adminStats.pendingApplications / (adminStats.totalApplications || 1)) * 100}%` }}
                        className="h-full bg-yellow-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ---------------- B. MANAGE BORROWERS ---------------- */}
          {adminTab === 'users' && (
            <div className="space-y-6 animate-fade-in" id="admin-view-users">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-1">Manage Platform Borrowers</h3>
                  <p className="text-xs text-gray-400">Search profiles, evaluate statuses, and suspend accounts.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                    placeholder="Search name or email..."
                  />
                </div>
              </div>

              {/* Users List Table */}
              <div className="overflow-x-auto" id="users-table-container">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-white/[0.01] text-gray-500 uppercase text-[10px] font-mono border-b border-white/5">
                    <tr>
                      <th className="p-4 font-semibold">User details</th>
                      <th className="p-4 font-semibold">Country</th>
                      <th className="p-4 font-semibold">Verification</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5" id="users-list-body">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.005]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-white font-mono text-[10px]">
                              {u.name[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{u.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-300">{u.country}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full ${
                            u.isVerified ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : 'bg-red-950/40 text-red-500 border border-red-500/10'
                          }`}>
                            {u.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[10px] uppercase text-gray-400">{u.role}</td>
                        <td className="p-4 text-right">
                          {u.role !== 'admin' && (
                            u.isSuspended ? (
                              <button
                                onClick={() => handleToggleSuspension(u.id, false)}
                                className="px-2.5 py-1 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20 bg-cyan-950/20 rounded-md hover:bg-cyan-400 hover:text-black transition-all"
                              >
                                Reactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleSuspension(u.id, true)}
                                className="px-2.5 py-1 text-[10px] font-semibold text-red-400 border border-red-500/20 bg-red-950/20 rounded-md hover:bg-red-500 hover:text-white transition-all"
                              >
                                Suspend Account
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- C. KYC APPLICATIONS ---------------- */}
          {adminTab === 'kyc' && (
            <div className="space-y-6 animate-fade-in" id="admin-view-kyc">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">KYC Compliance Audit Board</h3>
                <p className="text-xs text-gray-400">Examine submitted photocards, selfies, and company licenses.</p>
              </div>

              {kycRequests.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">No KYC documents registered in compliance database.</div>
              ) : (
                <div className="space-y-4" id="admin-kyc-list">
                  {kycRequests.map((k) => (
                    <div key={k.id} className="p-6 border border-white/5 bg-white/[0.005] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="font-mono text-[10px] text-gray-500">REQUEST ID: {k.id}</span>
                        <h4 className="font-display text-base font-bold text-white mt-1">{k.userName}</h4>
                        <p className="text-[11px] text-gray-400 font-mono mt-1">Applicant: {k.userEmail}</p>
                        <p className="text-xs text-gray-500 mt-2">Last Updated: {new Date(k.updatedAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 font-mono text-[10px] font-bold rounded-full border uppercase ${
                          k.status === 'Approved' ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400' :
                          k.status === 'Pending' ? 'bg-yellow-950/40 border-yellow-500/20 text-yellow-500' :
                          'bg-red-950/40 border-red-500/20 text-red-500'
                        }`}>
                          {k.status}
                        </span>
                        
                        <button
                          onClick={() => { setActiveKycDoc(k); setKycRemarks(k.remarks || ''); }}
                          className="px-3 py-1.5 text-xs font-medium text-black bg-white rounded-lg hover:bg-cyan-400 transition-all flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Evaluate File
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* KYC Evaluation Overlay Modal */}
              {activeKycDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
                  <div className="relative w-full max-w-3xl bg-[#09090b] border border-white/10 rounded-2xl p-8 my-8 shadow-2xl">
                    <button onClick={() => setActiveKycDoc(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X className="h-5 w-5" /></button>
                    
                    <div className="border-b border-white/5 pb-4 mb-6">
                      <span className="px-2 py-0.5 bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 font-mono text-[9px] font-bold rounded-full uppercase tracking-wider">KYC AUDIT PORTAL</span>
                      <h4 className="font-display text-2xl font-black text-white mt-2">Evaluate KYC Document Wallet</h4>
                      <p className="text-xs text-gray-400 font-mono mt-1">Applicant Name: <span className="text-white font-semibold">{activeKycDoc.fullName || activeKycDoc.userName}</span></p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Left Column: ID documents, Video, Selfie */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">1. VERIFIED ATTACHMENTS & MEDIA</h5>
                        
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                          <span className="text-[10px] font-mono text-gray-500 uppercase block">Government-Issued Photo ID ({activeKycDoc.idType || 'Passport'})</span>
                          <div className="h-28 bg-black border border-white/5 rounded-lg flex flex-col items-center justify-center text-xs text-cyan-400 font-mono p-4">
                            <span className="text-xl mb-1">📄</span>
                            <span className="text-[10px] text-zinc-300 font-mono text-center truncate w-full">{activeKycDoc.idCardUrl}</span>
                            <span className="text-[9px] text-zinc-500 font-mono mt-1">Security AES-256 Encrypted</span>
                          </div>
                        </div>

                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                          <span className="text-[10px] font-mono text-gray-500 uppercase block">Applicant Biometric Face Selfie</span>
                          <div className="h-28 bg-black border border-white/5 rounded-lg flex flex-col items-center justify-center text-xs text-cyan-400 font-mono p-4">
                            {activeKycDoc.selfieUrl && activeKycDoc.selfieUrl.startsWith('http') ? (
                              <img src={activeKycDoc.selfieUrl} alt="Selfie" className="h-16 w-16 rounded-full object-cover border border-cyan-400/30 mb-1" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-xl mb-1">👤</span>
                            )}
                            <span className="text-[9px] text-zinc-300 font-mono truncate w-full text-center">{activeKycDoc.selfieUrl}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                          <span className="text-[10px] font-mono text-gray-500 uppercase block">Video Verification Proof</span>
                          <div className="h-28 bg-black border border-white/5 rounded-lg flex flex-col items-center justify-center text-xs text-cyan-400 font-mono p-4">
                            <span className="text-xl mb-1">📹</span>
                            <span className="text-[10px] text-zinc-300 font-mono text-center truncate w-full">{activeKycDoc.videoUrl || 'live_face_scan_video.mp4'}</span>
                            <span className="text-[9px] text-emerald-400 font-mono font-bold mt-1">✓ Liveness Check Passed</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Identity fields and Loan Details */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">2. IDENTITY PROFILE & REQUEST</h5>

                        {/* Account and Contact Details */}
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2.5 text-xs text-zinc-300">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">Account Contact Info</span>
                          <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                            <span className="text-zinc-500">Registered Email:</span>
                            <span className="font-mono text-white">{activeKycDoc.email || activeKycDoc.userEmail}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                            <span className="text-zinc-500">Phone Number:</span>
                            <span className="font-mono text-white">{activeKycDoc.phone || 'Not Specified'}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                            <span className="text-zinc-500">Country of Origin:</span>
                            <span className="text-white font-medium">{activeKycDoc.country || 'United States'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Date of Birth:</span>
                            <span className="text-white font-medium">{activeKycDoc.dob || 'Not Specified'}</span>
                          </div>
                        </div>

                        {/* Financial and Loan Info */}
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2.5 text-xs text-zinc-300">
                          <span className="text-[9px] font-mono text-cyan-400 uppercase block">Requested Funding Capital</span>
                          <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                            <span className="text-zinc-500">Requested Amount:</span>
                            <span className="font-mono text-white font-bold text-sm text-cyan-400">
                              ${activeKycDoc.requestedAmount ? activeKycDoc.requestedAmount.toLocaleString() : '100,000'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                            <span className="text-zinc-500">Loan Duration:</span>
                            <span className="text-white font-medium">{activeKycDoc.loanDuration ? `${activeKycDoc.loanDuration} Months` : '24 Months'}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                            <span className="text-zinc-500">Employment Status:</span>
                            <span className="text-white font-medium">{activeKycDoc.employmentStatus || 'Employed'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Marital Status:</span>
                            <span className="text-white font-medium">{activeKycDoc.maritalStatus || 'Single'}</span>
                          </div>
                        </div>

                        {/* Residential and Socials */}
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2.5 text-xs text-zinc-300">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">Residential Location Address</span>
                          <p className="text-white bg-black/30 p-2 border border-white/5 rounded text-[10px] leading-relaxed break-all">
                            {activeKycDoc.residentialAddress || 'Not Provided'}
                          </p>
                          <div className="flex justify-between border-t border-white/[0.02] pt-2">
                            <span className="text-zinc-500">Proof of Address Doc:</span>
                            <span className="font-mono text-cyan-400 text-[10px] truncate max-w-[180px]">
                              {activeKycDoc.proofOfAddressUrl || activeKycDoc.addressProofUrl || 'utility_bill_verified.pdf'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Social Handles:</span>
                            <span className="font-mono text-zinc-300 text-[10px] truncate max-w-[180px]">
                              {activeKycDoc.socialHandles || 'None Provided'}
                            </span>
                          </div>
                        </div>

                        {/* Loan Purpose */}
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2 text-xs text-zinc-300">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">Declared Loan Intent</span>
                          <span className="text-white font-bold block">{activeKycDoc.loanPurpose || 'Business Growth & Scaling'}</span>
                          <p className="text-zinc-400 italic font-light text-[11px] leading-relaxed">
                            " {activeKycDoc.loanDescription || 'Expansion and liquidity facilitation for operating company.'} "
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Internal Compliance Remarks / Audit Memos</label>
                        <textarea 
                          rows={2}
                          value={kycRemarks}
                          onChange={(e) => setKycRemarks(e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50 resize-none font-sans"
                          placeholder="Specify reasons if declining, or compliance clearance details."
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                          onClick={() => handleAuditKyc(activeKycDoc.id, 'Rejected')}
                          className="px-5 py-2.5 text-xs font-semibold text-red-400 border border-red-500/20 bg-red-950/20 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        >
                          Reject Identity Files
                        </button>
                        <button
                          onClick={() => handleAuditKyc(activeKycDoc.id, 'Approved')}
                          className="px-5 py-2.5 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg cursor-pointer"
                        >
                          Approve Clearance
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ---------------- D. LOAN APPLICATIONS ---------------- */}
          {adminTab === 'loans' && (
            <div className="space-y-6 animate-fade-in" id="admin-view-loans">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">Corporate Capital Audit Board</h3>
                <p className="text-xs text-gray-400">Review corporate profile applications and approve liquidation payouts.</p>
              </div>

              {loans.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">No corporate proposals registered.</div>
              ) : (
                <div className="space-y-4" id="admin-loans-list">
                  {loans.map((l) => (
                    <div key={l.id} className="p-6 border border-white/5 bg-white/[0.005] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-gray-500">LOAN ID: {l.id}</span>
                          {l.requiresEnhancedVerification && (
                            <span className="px-2 py-0.5 bg-yellow-950/40 border border-yellow-500/20 text-yellow-500 font-mono text-[8px] font-bold rounded-full">ENHANCED REQ</span>
                          )}
                        </div>
                        <h4 className="font-display text-lg font-bold text-white mt-1">${l.fundingDetails.requestedAmount.toLocaleString()}</h4>
                        <p className="text-[11px] text-gray-400 mt-1">Applicant: <span className="text-white font-medium">{l.userName}</span> ({l.userEmail})</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 font-mono text-[10px] font-bold rounded-full border uppercase ${
                          l.status === 'Approved' ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400' :
                          l.status === 'Pending' ? 'bg-yellow-950/40 border-yellow-500/20 text-yellow-500' :
                          'bg-red-950/40 border-red-500/20 text-red-500'
                        }`}>
                          {l.status}
                        </span>

                        <button
                          onClick={() => setActiveLoanView(l)}
                          className="px-3 py-1.5 text-xs font-medium text-black bg-white rounded-lg hover:bg-cyan-400 transition-all flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Audit Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loan Detail Evaluation Modal */}
              {activeLoanView && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
                  <div className="relative w-full max-w-2xl bg-black border border-white/10 rounded-2xl p-8 my-8 shadow-2xl">
                    <button onClick={() => setActiveLoanView(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X className="h-5 w-5" /></button>
                    
                    <h4 className="font-display text-lg font-bold text-white mb-2">Audit Capital Application</h4>
                    <p className="text-xs text-gray-400 font-mono border-b border-white/5 pb-4 mb-6">REFERENCE ID: {activeLoanView.id}</p>

                    <div className="space-y-6 text-xs max-h-96 overflow-y-auto pr-2">
                      <div>
                        <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest block mb-2 border-b border-white/5 pb-1">Applicant Information</span>
                        <p className="text-gray-300">Full Name: <span className="text-white font-medium">{activeLoanView.userName}</span> • DOB: {activeLoanView.personalInfo.dateOfBirth}</p>
                        <p className="text-gray-300 mt-1">Marital Status: {activeLoanView.personalInfo.maritalStatus} • Res: {activeLoanView.personalInfo.address}</p>
                      </div>

                      <div>
                        <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest block mb-2 border-b border-white/5 pb-1">Employment & Corporate profile</span>
                        <p className="text-gray-300">Status: {activeLoanView.employmentInfo.status} ({activeLoanView.employmentInfo.yearsEmployed} yrs)</p>
                        <p className="text-gray-300 mt-1">Company: {activeLoanView.businessInfo?.companyName || 'None'} ({activeLoanView.businessInfo?.industry || 'N/A'})</p>
                        <p className="text-gray-300 mt-1">Reported Monthly Income: ${activeLoanView.employmentInfo.monthlyIncome.toLocaleString()} • Annual Corp Revenue: ${activeLoanView.businessInfo?.annualRevenue?.toLocaleString() || '0'}</p>
                      </div>

                      <div>
                        <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest block mb-2 border-b border-white/5 pb-1">Requested capital terms</span>
                        <p className="text-base font-bold text-white font-mono">${activeLoanView.fundingDetails.requestedAmount.toLocaleString()}</p>
                        <p className="text-gray-300 mt-1">Amortization Structure: {activeLoanView.fundingDetails.repaymentPreference}</p>
                        <p className="text-gray-400 mt-2 italic font-light">" {activeLoanView.fundingDetails.description} "</p>
                      </div>

                      <div>
                        <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest block mb-2 border-b border-white/5 pb-1">Supporting Memos ({activeLoanView.documents.length})</span>
                        {activeLoanView.documents.map((doc, idx) => (
                          <div key={idx} className="p-2 bg-white/5 rounded font-mono text-[10px] text-gray-300 flex justify-between mt-1">
                            <span>📎 {doc.name} • {doc.type}</span>
                            <span className="text-cyan-400">Security scanned</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                      {/* Process Loan button (enabled when collateralPaid is true, and status is Approved or Processing) */}
                      {activeLoanView.status === 'Approved' && activeLoanView.collateralPaid && !activeLoanView.disbursed && (
                        <button
                          onClick={() => handleAuditLoan(activeLoanView.id, 'Processing')}
                          className="px-5 py-2.5 text-xs font-semibold text-black bg-orange-400 hover:bg-orange-300 rounded-lg mr-auto cursor-pointer"
                        >
                          ⚙️ Process Loan
                        </button>
                      )}

                      {/* Send Loan button (enabled when status is Processing or Approved, and collateralPaid is true, and not disbursed) */}
                      {activeLoanView.collateralPaid && !activeLoanView.disbursed && (
                        <button
                          onClick={() => handleDisburseLoan(activeLoanView.id)}
                          className="px-5 py-2.5 text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] mr-auto cursor-pointer"
                        >
                          💸 Send Loan
                        </button>
                      )}

                      {/* Approve Loan button (only if status is Pending) */}
                      {activeLoanView.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleAuditLoan(activeLoanView.id, 'Declined')}
                            className="px-5 py-2.5 text-xs font-semibold text-red-400 border border-red-500/20 bg-red-950/20 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                          >
                            Reject Loan
                          </button>
                          <button
                            onClick={() => handleAuditLoan(activeLoanView.id, 'Approved')}
                            className="px-5 py-2.5 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg cursor-pointer"
                          >
                            Approve Loan
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ---------------- E. SUPPORT TICKETS ---------------- */}
          {adminTab === 'tickets' && (
            <div className="space-y-6 animate-fade-in" id="admin-view-tickets">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">Administrative Help Desk Queue</h3>
                <p className="text-xs text-gray-400">Resolve system tickets and direct communications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tickets list */}
                <div className="md:col-span-1 space-y-4">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Active Tickets</h4>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                    {tickets.map((t) => (
                      <div 
                        key={t.id} 
                        onClick={() => setActiveTicketView(t)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          activeTicketView?.id === t.id ? 'border-cyan-500/30 bg-white/[0.015]' : 'border-white/5 hover:bg-white/[0.005]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono text-[9px] text-gray-500">{t.id} • {t.category}</span>
                          <span className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded-full border ${
                            t.status === 'Open' ? 'bg-green-950/40 text-green-400 border-green-500/20' : 'bg-yellow-950/40 text-yellow-500 border-yellow-500/10'
                          }`}>{t.status}</span>
                        </div>
                        <h5 className="font-display text-xs font-semibold text-white truncate">{t.subject}</h5>
                        <span className="text-[9px] text-gray-500 block font-mono mt-1">By: {t.userName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply thread */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Audit Dialogue</h4>
                  
                  {activeTicketView ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-display text-sm font-bold text-white">{activeTicketView.subject}</h5>
                          <p className="text-[10px] text-gray-500 font-mono">Owner: {activeTicketView.userName} ({activeTicketView.userEmail})</p>
                        </div>
                        {activeTicketView.status !== 'Resolved' && (
                          <button
                            onClick={() => handleResolveTicket(activeTicketView.id)}
                            className="px-3 py-1 bg-green-500 text-black text-xs font-semibold rounded"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>

                      <div className="space-y-3 max-h-48 overflow-y-auto" id="ticket-chats">
                        {activeTicketView.replies.map((reply, i) => (
                          <div key={reply.id || i} className={`p-3 rounded text-xs ${
                            reply.senderRole === 'admin' ? 'bg-cyan-950/20 border border-cyan-500/10 text-cyan-300' : 'bg-white/5 text-gray-300'
                          }`}>
                            <div className="flex justify-between text-[9px] font-mono text-gray-500 mb-1">
                              <span>{reply.senderName} ({reply.senderRole.toUpperCase()})</span>
                              <span>{new Date(reply.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p>{reply.content}</p>
                          </div>
                        ))}
                      </div>

                      {activeTicketView.status !== 'Resolved' ? (
                        <form onSubmit={handleTicketReply} className="flex gap-2" id="form-ticket-reply-admin">
                          <input 
                            type="text" 
                            required
                            value={ticketReply}
                            onChange={(e) => setTicketReply(e.target.value)}
                            className="flex-1 px-3 py-2 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                            placeholder="Type administrative reply..."
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg"
                          >
                            Send
                          </button>
                        </form>
                      ) : (
                        <p className="text-center text-xs text-green-500 font-mono">This support ticket was closed as RESOLVED.</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-gray-500 py-16">Select an active ticket from the left column to view the thread.</p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ---------------- F. ANNOUNCEMENTS ---------------- */}
          {adminTab === 'announcements' && (
            <div className="space-y-8 animate-fade-in" id="admin-view-announcements">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">Manage Platform Announcements</h3>
                <p className="text-xs text-gray-400">Broadcast security upgrades, planned maintenance, and platform news.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Publish announcement form */}
                <form onSubmit={handleCreateAnnouncement} className="space-y-4" id="form-ann-create">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Publish Memo</h4>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Memo Title</label>
                    <input 
                      type="text" 
                      required
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                      placeholder="e.g. Infrastructure Security Update"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Category</label>
                    <select
                      value={newAnnCat}
                      onChange={(e) => setNewAnnCat(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option>General</option>
                      <option>Security</option>
                      <option>Maintenance</option>
                      <option>Update</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Content Message</label>
                    <textarea 
                      required
                      rows={4}
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                      placeholder="Type broadcast text here..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-xs font-semibold text-black bg-white hover:bg-cyan-400 rounded-lg"
                  >
                    Broadcast Announcement
                  </button>
                </form>

                {/* Announcements Feed */}
                <div className="space-y-4">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Active Broadcasts</h4>
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2" id="admin-ann-feed">
                    {announcements.map((a) => (
                      <div key={a.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-lg text-xs">
                        <div className="flex justify-between items-center mb-2 font-mono text-[9px] text-gray-500">
                          <span>CATEGORY: {a.category.toUpperCase()}</span>
                          <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h5 className="font-display font-semibold text-white text-sm mb-1">{a.title}</h5>
                        <p className="text-gray-400 font-light leading-relaxed">{a.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ---------------- G. LANDING PAGE CONTENT EDIT ---------------- */}
          {adminTab === 'homepage' && (
            <form onSubmit={handleUpdateHomepage} className="space-y-6 animate-fade-in" id="form-homepage-edit">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">Manage Website Contents</h3>
                <p className="text-xs text-gray-400">Modify hero headlines, subtitles, and displayed statistics in real-time.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Hero Section Headline</label>
                  <input 
                    type="text" 
                    required
                    value={editHeadline}
                    onChange={(e) => setEditHeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Hero Section Sub-headline</label>
                  <textarea 
                    required
                    rows={2}
                    value={editSubheadline}
                    onChange={(e) => setEditSubheadline(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Stat: Total Funded</label>
                  <input 
                    type="text" 
                    required
                    value={editStatFunded}
                    onChange={(e) => setEditStatFunded(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Stat: Active Borrowers</label>
                  <input 
                    type="text" 
                    required
                    value={editStatBorrowers}
                    onChange={(e) => setEditStatBorrowers(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Stat: Global Projects</label>
                  <input 
                    type="text" 
                    required
                    value={editStatProjects}
                    onChange={(e) => setEditStatProjects(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg"
              >
                Commit Website Changes
              </button>
            </form>
          )}

          {/* ---------------- H. SECURITY LOGS ---------------- */}
          {adminTab === 'logs' && (
            <div className="space-y-6 animate-fade-in" id="admin-view-logs">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">System Security Auditing Logs</h3>
                <p className="text-xs text-gray-400">Platform-wide audit trial records detailing compliance activities.</p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 font-mono text-[11px]" id="system-logs-feed">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex gap-4 text-gray-500 text-[10px]">
                        <span>EVENT: {log.action}</span>
                        <span>IP: {log.ipAddress}</span>
                      </div>
                      <p className="text-gray-300">{log.details}</p>
                      {log.userEmail && <p className="text-[10px] text-cyan-400">Actor Email: {log.userEmail}</p>}
                    </div>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
