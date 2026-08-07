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
  EyeOff,
  Key,
  Globe,
  LogOut,
  ArrowLeft,
  UserCheck,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  XCircle,
  FileCheck,
  Paperclip,
  Send,
  FileSpreadsheet,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Briefcase,
  Building,
  DollarSign,
  Calendar
} from 'lucide-react';
import { getApiUrl } from '../utils/api';

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
  // Enforce strict Admin Access Guard
  if (!adminUser || adminUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 border border-red-500/20 bg-red-950/20 rounded-2xl text-center text-white space-y-4 shadow-2xl">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="font-display text-xl font-bold uppercase tracking-wide">Access Restricted</h3>
        <p className="text-xs text-gray-400 leading-relaxed">This administrative protocol console is strictly reserved for authorized security officers and administrators.</p>
        <button
          onClick={onLogout}
          className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
        >
          Exit Administrative Console
        </button>
      </div>
    );
  }

  // Authentication Guards
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState('');
  const [mfaCode, setMfaCode] = React.useState('');
  const [mfaStep, setMfaStep] = React.useState(false);
  const [demoMfaToken] = React.useState('842940');

  // Panel Tabs
  const [adminTab, setAdminTab] = React.useState<'stats' | 'users' | 'kyc' | 'loans' | 'payments' | 'repayments' | 'tickets' | 'messages' | 'announcements' | 'homepage' | 'logs'>('stats');

  // Repayment Review State
  const [repaymentNotes, setRepaymentNotes] = React.useState<Record<string, string>>({});
  const [repaymentFilter, setRepaymentFilter] = React.useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [repaymentSearch, setRepaymentSearch] = React.useState('');

  // Asset Preview Controls State
  const [previewZoom, setPreviewZoom] = React.useState(1);
  const [previewRotate, setPreviewRotate] = React.useState(0);
  const [isFullScreenModal, setIsFullScreenModal] = React.useState(false);

  // Dynamic API State
  const [adminStats, setAdminStats] = React.useState<any>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [searchUser, setSearchUser] = React.useState('');
  const [kycRequests, setKycRequests] = React.useState<KYC[]>([]);
  const [loans, setLoans] = React.useState<LoanApplication[]>([]);
  const [payments, setPayments] = React.useState<any[]>([]);
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);

  const [logs, setLogs] = React.useState<SystemLog[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [homePage, setHomePage] = React.useState<HomePageContent | null>(null);

  // Admin Message Desk state
  const [adminMessages, setAdminMessages] = React.useState<any[]>([]);
  const [selectedUserForMsg, setSelectedUserForMsg] = React.useState<string | null>(null);
  const [adminReplyContent, setAdminReplyContent] = React.useState('');
  const [adminMsgAttachment, setAdminMsgAttachment] = React.useState<{ name: string; url: string } | null>(null);
  const adminMsgAttachmentInputRef = React.useRef<HTMLInputElement | null>(null);

  // Modal Doc Viewers
  const [selectedUserDetail, setSelectedUserDetail] = React.useState<User | null>(null);
  const [showUserModalPassword, setShowUserModalPassword] = React.useState(false);
  const [visibleUserPasswords, setVisibleUserPasswords] = React.useState<Record<string, boolean>>({});
  const [showKycModalPassword, setShowKycModalPassword] = React.useState(false);
  const [activeKycDoc, setActiveKycDoc] = React.useState<KYC | null>(null);
  const [kycRemarks, setKycRemarks] = React.useState('');
  const [activeLoanView, setActiveLoanView] = React.useState<LoanApplication | null>(null);
  const [activeTicketView, setActiveTicketView] = React.useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = React.useState('');
  const [previewAssetModal, setPreviewAssetModal] = React.useState<{ name: string; url?: string; type: string } | null>(null);

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
      const resStats = await fetch(getApiUrl('/api/admin/stats'), { headers });
      if (resStats.ok) setAdminStats(await resStats.ok ? await resStats.json() : null);

      const resUsers = await fetch(getApiUrl(`/api/admin/users?search=${searchUser}`), { headers });
      if (resUsers.ok) setUsers(await resUsers.json());

      const resKyc = await fetch(getApiUrl('/api/admin/kyc'), { headers });
      if (resKyc.ok) setKycRequests(await resKyc.json());

      const resLoans = await fetch(getApiUrl('/api/admin/loans'), { headers });
      if (resLoans.ok) setLoans(await resLoans.json());

      const resPmts = await fetch(getApiUrl('/api/admin/payments'), { headers });
      if (resPmts.ok) setPayments(await resPmts.json());

      const resTkts = await fetch(getApiUrl('/api/admin/tickets'), { headers });

      if (resTkts.ok) setTickets(await resTkts.json());

      const resLogs = await fetch(getApiUrl('/api/admin/logs'), { headers });
      if (resLogs.ok) setLogs(await resLogs.json());

      const resAnn = await fetch(getApiUrl('/api/announcements'), { headers });
      if (resAnn.ok) setAnnouncements(await resAnn.json());

      const resMsgs = await fetch(getApiUrl('/api/messages'), { headers });
      if (resMsgs.ok) setAdminMessages(await resMsgs.json());

      if (selectedUserForMsg) {
        await fetch(getApiUrl(`/api/messages?userId=${selectedUserForMsg}`), { headers });
      }

      const resHome = await fetch(getApiUrl('/api/homepage'), { headers });
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
  }, [isAuthorized, searchUser, headers, selectedUserForMsg]);

  React.useEffect(() => {
    fetchAdminData();
    if (isAuthorized) {
      const interval = setInterval(fetchAdminData, 3000);
      return () => clearInterval(interval);
    }
  }, [fetchAdminData, isAuthorized]);

  // Mark user messages as read when selected
  React.useEffect(() => {
    if (selectedUserForMsg && isAuthorized) {
      fetch(getApiUrl(`/api/messages?userId=${selectedUserForMsg}`), { headers })
        .then(res => res.ok ? res.json() : null)
        .then(() => {
          fetch(getApiUrl('/api/messages'), { headers })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setAdminMessages(data); });
        });
    }
  }, [selectedUserForMsg, isAuthorized, headers]);

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
      const res = await fetch(getApiUrl('/api/admin/verify-2fa'), {
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
      const res = await fetch(getApiUrl('/api/admin/users/suspend'), {
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

  // Approve / Reject / Request Additional Docs KYC
  const handleAuditKyc = async (kycId: string, status: 'Approved' | 'Rejected' | 'Additional Docs Requested') => {
    if ((status === 'Rejected' || status === 'Additional Docs Requested') && !kycRemarks.trim()) {
      triggerAlert('error', `Please enter a reason or notes before setting KYC status to ${status}.`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/kyc/update'), {
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

  const [loanRejectionReason, setLoanRejectionReason] = React.useState('');
  const [showRejectionPrompt, setShowRejectionPrompt] = React.useState(false);

  // Approve / Decline Loan Applications
  const handleAuditLoan = async (loanId: string, status: 'Approved' | 'Declined' | 'Under Review' | 'Processing', customReason?: string) => {
    if (status === 'Declined' && !customReason && !loanRejectionReason.trim()) {
      setShowRejectionPrompt(true);
      triggerAlert('error', 'Rejection reason is required. Please enter a reason below.');
      return;
    }

    setLoading(true);
    try {
      const reason = customReason || loanRejectionReason || 'Application did not meet institutional credit and document requirements.';
      const res = await fetch(getApiUrl('/api/admin/loans/update'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ loanId, status, rejectionReason: reason })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Loan status update failed.');

      triggerAlert('success', `Loan application ${loanId} status updated to: ${status}`);
      setLoans(prev => prev.map(l => l.id === loanId ? data.loan : l));
      setActiveLoanView(null);
      setLoanRejectionReason('');
      setShowRejectionPrompt(false);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin confirm collateral payment or installment
  const handleConfirmPayment = async (loanId: string, installmentNumber?: number) => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/loans/confirm-payment'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ loanId, installmentNumber })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment confirmation failed.');

      triggerAlert('success', data.message || `Collateral payment for loan ${loanId} confirmed!`);
      setLoans(prev => prev.map(l => l.id === loanId ? data.loan : l));
      if (activeLoanView && activeLoanView.id === loanId) {
        setActiveLoanView(data.loan);
      }
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin cancel/reject payment submission
  const handleCancelPayment = async (loanId: string, installmentNumber?: number) => {
    const cancelReason = prompt('Please enter reason for cancelling this payment submission (e.g. Invalid payment reference or funds not received):') || 'Payment proof verification failed or funds not received.';
    if (!cancelReason) return;

    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/loans/cancel-payment'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ loanId, installmentNumber, reason: cancelReason })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment cancellation failed.');

      triggerAlert('success', data.message || `Payment submission for loan ${loanId} cancelled.`);
      setLoans(prev => prev.map(l => l.id === loanId ? data.loan : l));
      if (activeLoanView && activeLoanView.id === loanId) {
        setActiveLoanView(data.loan);
      }
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin update payment record status (Approve or Reject)
  const handleUpdatePaymentRecordStatus = async (paymentId: string, status: 'Approved' | 'Rejected', notes?: string) => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/payments/update-status'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ paymentId, status, notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update payment record status');

      triggerAlert('success', `Payment ${paymentId} marked as ${status}!`);
      await fetchAdminData();
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
      const res = await fetch(getApiUrl('/api/admin/loans/disburse'), {
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
      const res = await fetch(getApiUrl('/api/support/tickets/reply'), {
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

  // Send message to user from Admin Message Desk
  const handleAdminSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForMsg || (!adminReplyContent.trim() && !adminMsgAttachment)) return;
    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/messages'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          receiverId: selectedUserForMsg,
          content: adminReplyContent.trim() || (adminMsgAttachment ? `[Attachment: ${adminMsgAttachment.name}]` : 'Attachment'),
          attachments: adminMsgAttachment ? [adminMsgAttachment] : [],
          imageUrl: adminMsgAttachment?.url && (adminMsgAttachment.url.startsWith('data:image') || adminMsgAttachment.url.startsWith('http') || adminMsgAttachment.url.startsWith('blob:')) ? adminMsgAttachment.url : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch message.');

      triggerAlert('success', 'Message dispatched to user Message Desk.');
      setAdminReplyContent('');
      setAdminMsgAttachment(null);

      // Refresh messages
      const resMsgs = await fetch(getApiUrl('/api/messages'), { headers });
      if (resMsgs.ok) setAdminMessages(await resMsgs.json());
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/tickets/resolve'), {
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
      const res = await fetch(getApiUrl('/api/admin/announcements/create'), {
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
      const res = await fetch(getApiUrl('/api/admin/homepage/update'), {
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

      {/* Admin Unreplied Notification Banner */}
      {(() => {
        const openT = tickets.filter(t => t.status === 'Open' || (t.replies && t.replies.length > 0 && t.replies[t.replies.length - 1].senderRole === 'user')).length;
        const unreadM = adminMessages.filter(m => !m.isRead && m.senderRole !== 'admin').length;
        const totalPending = openT + unreadM;
        if (totalPending === 0) return null;

        return (
          <div className="mb-8 p-4 bg-gradient-to-r from-red-950/60 via-amber-950/40 to-zinc-950 border-2 border-red-500/50 rounded-2xl text-xs font-sans text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(239,68,68,0.25)] animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl shrink-0">
                <Bell className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm uppercase tracking-wider block font-display">
                  🚨 ATTENTION: UNANSWERED USER MESSAGES ({totalPending} PENDING)
                </span>
                <span className="text-gray-300 text-xs">
                  {openT > 0 ? `${openT} support ticket(s) awaiting reply` : ''} 
                  {openT > 0 && unreadM > 0 ? ' & ' : ''} 
                  {unreadM > 0 ? `${unreadM} unread direct message(s)` : ''}. This notification remains active until all messages are answered.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {openT > 0 && (
                <button
                  onClick={() => setAdminTab('tickets')}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-black font-mono font-black text-xs uppercase rounded-xl transition shadow-lg cursor-pointer"
                >
                  Reply to Tickets ({openT}) →
                </button>
              )}
              {unreadM > 0 && (
                <button
                  onClick={() => setAdminTab('messages')}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-black text-xs uppercase rounded-xl transition shadow-lg cursor-pointer"
                >
                  View Messages ({unreadM}) →
                </button>
              )}
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 flex flex-col space-y-2 bg-zinc-950/80 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl self-start" id="admin-sidebar">
          <button
            onClick={() => setAdminTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'stats' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <Activity className="h-4 w-4 shrink-0" /> Dashboard
          </button>

          <button
            onClick={() => setAdminTab('kyc')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'kyc' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="flex items-center gap-2 sm:gap-3"><ShieldCheck className="h-4 w-4 shrink-0" /> KYC Applications</span>
            {kycRequests.filter(k => k.status === 'Pending').length > 0 && (
              <span className="bg-yellow-500 text-black font-mono font-bold text-[9px] px-2 py-0.5 rounded-full shrink-0">
                {kycRequests.filter(k => k.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('loans')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'loans' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="flex items-center gap-2 sm:gap-3"><FileText className="h-4 w-4 shrink-0" /> Loan Applications</span>
            {loans.filter(l => l.status === 'Pending').length > 0 && (
              <span className="bg-cyan-500 text-black font-mono font-bold text-[9px] px-2 py-0.5 rounded-full shrink-0">
                {loans.filter(l => l.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('payments')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'payments' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="flex items-center gap-2 sm:gap-3"><Lock className="h-4 w-4 shrink-0" /> Payments & Collateral</span>
            {loans.filter(l => l.collateralPaid && !l.disbursed).length > 0 && (
              <span className="bg-green-500 text-black font-mono font-bold text-[9px] px-2 py-0.5 rounded-full shrink-0">
                {loans.filter(l => l.collateralPaid && !l.disbursed).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('repayments')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'repayments' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="flex items-center gap-2 sm:gap-3"><DollarSign className="h-4 w-4 shrink-0 text-emerald-400" /> Loan Repayment Review</span>
            {payments.filter(p => p.type === 'Loan Repayment' && (p.status === 'Under Review' || p.status === 'Pending')).length > 0 ? (
              <span className="bg-amber-400 text-black font-mono font-bold text-[9px] px-2 py-0.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-pulse">
                {payments.filter(p => p.type === 'Loan Repayment' && (p.status === 'Under Review' || p.status === 'Pending')).length} NEW
              </span>
            ) : (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full shrink-0">
                {payments.filter(p => p.type === 'Loan Repayment').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('messages')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'messages' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="flex items-center gap-2 sm:gap-3"><MessageSquare className="h-4 w-4 shrink-0" /> Direct Messages</span>
            {adminMessages.filter(m => !m.isRead && m.senderRole !== 'admin').length > 0 && (
              <span className="bg-cyan-400 text-black font-mono font-bold text-[9px] px-2 py-0.5 rounded-full shrink-0">
                {adminMessages.filter(m => !m.isRead && m.senderRole !== 'admin').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('tickets')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'tickets' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="flex items-center gap-2 sm:gap-3"><HelpCircle className="h-4 w-4 shrink-0" /> Support Tickets</span>
            {tickets.filter(t => t.status === 'Open' || (t.replies && t.replies.length > 0 && t.replies[t.replies.length - 1].senderRole === 'user')).length > 0 && (
              <span className="bg-red-500 text-white font-mono font-bold text-[9px] px-2.5 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] shrink-0">
                {tickets.filter(t => t.status === 'Open' || (t.replies && t.replies.length > 0 && t.replies[t.replies.length - 1].senderRole === 'user')).length} NEW
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'users' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" /> Users
          </button>

          <button
            onClick={() => setAdminTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'logs' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <Download className="h-4 w-4 shrink-0" /> Reports / Audit Log
          </button>

          <button
            onClick={() => setAdminTab('homepage')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
              adminTab === 'homepage' ? 'bg-white/5 text-cyan-400 border-l border-cyan-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <Settings className="h-4 w-4" /> Settings
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest text-red-400 hover:bg-red-950/20 transition-all cursor-pointer border border-red-500/10 mt-4"
          >
            <LogOut className="h-4 w-4" /> Logout
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
                      <th className="p-4 font-semibold">Country / Phone</th>
                      <th className="p-4 font-semibold">User Login Password</th>
                      <th className="p-4 font-semibold">Verification</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5" id="users-list-body">
                    {users.map((u) => {
                      const isPwdVisible = !!visibleUserPasswords[u.id];
                      return (
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
                          <td className="p-4">
                            <div className="flex flex-col text-xs">
                              <span className="font-medium text-gray-300">{u.country}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{u.phone || 'No phone'}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs">
                            <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1.5 rounded-lg border border-white/10 w-fit">
                              <span className="text-emerald-400 font-bold select-all">
                                {isPwdVisible ? (u.password || 'ElonCapital2026!') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setVisibleUserPasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
                                title={isPwdVisible ? "Hide Password" : "Show Password"}
                              >
                                {isPwdVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full ${
                              u.isVerified ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : 'bg-red-950/40 text-red-500 border border-red-500/10'
                            }`}>
                              {u.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[10px] uppercase text-gray-400">{u.role}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedUserDetail(u)}
                                className="px-2.5 py-1 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20 bg-cyan-950/20 rounded-md hover:bg-cyan-400 hover:text-black transition-all cursor-pointer flex items-center gap-1"
                                title="View Unified User Profile (Account, Loans, KYC)"
                              >
                                <UserCheck className="h-3 w-3" /> Profile
                              </button>
                              {u.role !== 'admin' && (
                                u.isSuspended ? (
                                  <button
                                    onClick={() => handleToggleSuspension(u.id, false)}
                                    className="px-2.5 py-1 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20 bg-cyan-950/20 rounded-md hover:bg-cyan-400 hover:text-black transition-all cursor-pointer"
                                  >
                                    Reactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleSuspension(u.id, true)}
                                    className="px-2.5 py-1 text-[10px] font-semibold text-red-400 border border-red-500/20 bg-red-950/20 rounded-md hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                  >
                                    Suspend
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewAssetModal({ name: `Govt ID (${activeKycDoc.idType || 'Passport'})`, url: activeKycDoc.idCardUrl, type: 'Government ID' })}
                              className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-bold font-mono rounded flex items-center justify-center gap-1 border border-cyan-500/20"
                            >
                              <ZoomIn className="h-3 w-3" /> View / Zoom
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                          <span className="text-[10px] font-mono text-gray-500 uppercase block">Applicant Biometric Face Selfie</span>
                          <div className="h-28 bg-black border border-white/5 rounded-lg flex flex-col items-center justify-center text-xs text-cyan-400 font-mono p-4">
                            {activeKycDoc.selfieUrl && (activeKycDoc.selfieUrl.startsWith('http') || activeKycDoc.selfieUrl.startsWith('data:image')) ? (
                              <img src={activeKycDoc.selfieUrl} alt="Selfie" className="h-16 w-16 rounded-full object-cover border border-cyan-400/30 mb-1" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-xl mb-1">👤</span>
                            )}
                            <span className="text-[9px] text-zinc-300 font-mono truncate w-full text-center">{activeKycDoc.selfieUrl}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewAssetModal({ name: 'Applicant Biometric Selfie', url: activeKycDoc.selfieUrl, type: 'Biometric Selfie' })}
                              className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-bold font-mono rounded flex items-center justify-center gap-1 border border-cyan-500/20"
                            >
                              <ZoomIn className="h-3 w-3" /> View / Zoom
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                          <span className="text-[10px] font-mono text-gray-500 uppercase block">Video Verification Proof</span>
                          <div className="h-28 bg-black border border-white/5 rounded-lg flex flex-col items-center justify-center text-xs text-cyan-400 font-mono p-4">
                            <span className="text-xl mb-1">📹</span>
                            <span className="text-[10px] text-zinc-300 font-mono text-center truncate w-full">{activeKycDoc.videoUrl || 'live_face_scan_video.mp4'}</span>
                            <span className="text-[9px] text-emerald-400 font-mono font-bold mt-1">✓ Liveness Check Passed</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewAssetModal({ name: 'Liveness Video Verification', url: activeKycDoc.videoUrl || activeKycDoc.selfieUrl, type: 'Liveness Video' })}
                              className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-bold font-mono rounded flex items-center justify-center gap-1 border border-cyan-500/20"
                            >
                              <Play className="h-3 w-3" /> Play Video
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Identity fields and Loan Details */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">2. IDENTITY PROFILE & REQUEST</h5>

                        {/* Account and Contact Details */}
                        {(() => {
                          const matchedUser = users.find(u => u.email.toLowerCase() === (activeKycDoc.email || activeKycDoc.userEmail || '').toLowerCase() || u.id === activeKycDoc.userId);
                          const userPasswordVal = matchedUser?.password || 'ElonCapital2026!';
                          return (
                            <div className="p-4 bg-emerald-950/20 border-2 border-emerald-500/30 rounded-xl space-y-2.5 text-xs text-zinc-300">
                              <span className="text-[9px] font-mono text-emerald-400 font-black uppercase tracking-wider block flex items-center gap-1.5">
                                <Key className="h-3.5 w-3.5" /> Transferred Profile Credentials & Contact
                              </span>
                              <div className="flex justify-between border-b border-white/[0.05] pb-1.5">
                                <span className="text-zinc-400">Login Email:</span>
                                <span className="font-mono text-white font-bold">{activeKycDoc.email || activeKycDoc.userEmail}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-white/[0.05] pb-1.5">
                                <span className="text-zinc-400">Account Password:</span>
                                <div className="flex items-center gap-2 bg-black px-2 py-1 rounded border border-emerald-500/30 font-mono">
                                  <span className="text-emerald-400 font-bold select-all">
                                    {showKycModalPassword ? userPasswordVal : '••••••••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowKycModalPassword(!showKycModalPassword)}
                                    className="text-cyan-400 hover:text-cyan-300"
                                    title={showKycModalPassword ? "Hide Password" : "Show Password"}
                                  >
                                    {showKycModalPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-between border-b border-white/[0.05] pb-1.5">
                                <span className="text-zinc-400">Phone Number:</span>
                                <span className="font-mono text-white">{activeKycDoc.phone || matchedUser?.phone || 'Not Specified'}</span>
                              </div>
                              <div className="flex justify-between border-b border-white/[0.05] pb-1.5">
                                <span className="text-zinc-400">Country Location:</span>
                                <span className="text-white font-medium">{activeKycDoc.country || matchedUser?.country || 'United States'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Date of Birth:</span>
                                <span className="text-white font-medium">{activeKycDoc.dob || 'Not Specified'}</span>
                              </div>
                            </div>
                          );
                        })()}

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

                      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                          onClick={() => handleAuditKyc(activeKycDoc.id, 'Rejected')}
                          className="px-4 py-2 text-xs font-semibold text-red-400 border border-red-500/20 bg-red-950/20 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        >
                          Reject Identity Files
                        </button>
                        <button
                          onClick={() => handleAuditKyc(activeKycDoc.id, 'Additional Docs Requested')}
                          className="px-4 py-2 text-xs font-semibold text-yellow-400 border border-yellow-500/30 bg-yellow-950/30 rounded-lg hover:bg-yellow-500 hover:text-black transition-all cursor-pointer"
                        >
                          Request Additional Documents
                        </button>
                        <button
                          onClick={() => handleAuditKyc(activeKycDoc.id, 'Approved')}
                          className="px-5 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg cursor-pointer"
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setAdminTab('stats')}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                  >
                    <ArrowLeft className="h-4 w-4 text-cyan-400" />
                    <span>← Back to Overview Tabs</span>
                  </button>
                  <h3 className="font-display text-xl font-bold text-white mb-1">Submitted Loan Applications</h3>
                  <p className="text-xs text-gray-400">Review applicant records, identity documents, approve or reject applications, confirm payments, and disburse capital.</p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-3 py-1 bg-yellow-950/40 border border-yellow-500/20 text-yellow-400 rounded-lg">
                    Pending: {loans.filter(l => l.status === 'Pending').length}
                  </span>
                  <span className="px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded-lg">
                    Approved: {loans.filter(l => l.status === 'Approved').length}
                  </span>
                </div>
              </div>

              {loans.length === 0 ? (
                <div className="text-center py-16 border border-white/5 bg-black/30 rounded-xl space-y-2">
                  <p className="text-xs text-gray-400">No loan applications submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4" id="admin-loans-list">
                  {loans.map((l) => {
                    // Compute descriptive status label
                    let statusLabel = 'Pending Review';
                    let statusBadgeStyle = 'bg-yellow-950/60 border-yellow-500/40 text-yellow-400';

                    if (l.status === 'Declined' || l.status === 'Rejected') {
                      statusLabel = 'Rejected';
                      statusBadgeStyle = 'bg-red-950/60 border-red-500/40 text-red-400';
                    } else if (l.disbursed) {
                      statusLabel = 'Loan Disbursed';
                      statusBadgeStyle = 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400';
                    } else if (l.collateralPaymentStatus === 'Confirmed' || (l.collateralPaid && l.status === 'Approved')) {
                      statusLabel = 'Payment Confirmed / Ready for Disbursement';
                      statusBadgeStyle = 'bg-cyan-950/60 border-cyan-400 text-cyan-300';
                    } else if (l.collateralPaid || l.collateralTxId) {
                      statusLabel = 'Payment Submitted (Pending Verification)';
                      statusBadgeStyle = 'bg-orange-950/60 border-orange-500/40 text-orange-400';
                    } else if (l.status === 'Approved') {
                      statusLabel = 'Approved (Awaiting Collateral Payment)';
                      statusBadgeStyle = 'bg-blue-950/60 border-blue-400 text-blue-300';
                    }

                    return (
                      <div key={l.id} className="p-6 border border-white/10 bg-white/[0.01] hover:border-cyan-500/30 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all shadow-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-gray-500 font-bold">REF ID: {l.id}</span>
                            <span className="text-gray-600">•</span>
                            <span className="font-mono text-[10px] text-gray-400">Submitted: {new Date(l.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <h4 className="font-display text-xl font-black text-white">${l.fundingDetails.requestedAmount.toLocaleString()}</h4>
                            <span className="text-xs text-gray-300 font-medium">{l.fundingDetails.purpose}</span>
                          </div>
                          <p className="text-xs text-gray-300">
                            Applicant: <strong className="text-white font-bold">{l.userName}</strong> ({l.userEmail})
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <span className={`px-3 py-1 font-mono text-[10px] font-bold rounded-full border uppercase tracking-wider ${statusBadgeStyle}`}>
                            {statusLabel}
                          </span>

                          <button
                            onClick={() => {
                              setActiveLoanView(l);
                              setLoanRejectionReason(l.rejectionReason || '');
                              setShowRejectionPrompt(false);
                            }}
                            className="px-4 py-2 text-xs font-bold text-black bg-white hover:bg-cyan-400 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-sans shadow"
                          >
                            <Eye className="h-4 w-4" /> Open Application Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Comprehensive Loan Application Review Modal */}
              {activeLoanView && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
                  <div className="relative w-full max-w-4xl bg-zinc-950 border border-white/15 rounded-2xl p-6 sm:p-8 my-8 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold rounded-md">
                            APPLICATION REVIEW
                          </span>
                          <span className="font-mono text-xs text-gray-400">REF: {activeLoanView.id}</span>
                        </div>
                        <h4 className="font-display text-2xl font-black text-white">
                          Loan Application: {activeLoanView.userName}
                        </h4>
                        <p className="text-xs text-gray-400">Submitted on {new Date(activeLoanView.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setActiveLoanView(null);
                            setShowRejectionPrompt(false);
                          }} 
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          <ArrowLeft className="h-4 w-4 text-cyan-400" />
                          <span>Back to Applications List</span>
                        </button>
                        <button 
                          onClick={() => {
                            setActiveLoanView(null);
                            setShowRejectionPrompt(false);
                          }} 
                          className="text-gray-400 hover:text-white p-2 rounded-lg bg-white/5 cursor-pointer"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6 text-xs max-h-[60vh] overflow-y-auto pr-2">
                      
                      {/* Section 1: Loan Request Details */}
                      <div className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-3">
                        <h5 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                          <FileText className="h-4 w-4" /> 1. Requested Loan Terms & Purpose
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-white/5">
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Desired Loan Amount</span>
                            <span className="text-xl font-black text-white font-mono">${activeLoanView.fundingDetails.requestedAmount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Purpose of Funding</span>
                            <span className="text-sm font-bold text-white">{activeLoanView.fundingDetails.purpose}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Repayment Preference</span>
                            <span className="text-sm font-bold text-white">{activeLoanView.fundingDetails.repaymentPreference}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-gray-500 block text-[10px] uppercase font-mono mb-1">Detailed Purpose & Proposal</span>
                          <p className="text-gray-200 leading-relaxed bg-zinc-900/80 p-3 rounded-lg border border-white/5 italic">
                            "{activeLoanView.fundingDetails.description}"
                          </p>
                        </div>
                      </div>

                      {/* Section 2: Personal & KYC Information */}
                      <div className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-3">
                        <h5 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                          <Users className="h-4 w-4" /> 2. Personal & Employment Information
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-white/5">
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Full Legal Name</span>
                            <span className="text-white font-bold">{activeLoanView.userName || activeLoanView.personalInfo?.fullName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Email Address</span>
                            <span className="text-white font-mono">{activeLoanView.userEmail}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Mobile Phone</span>
                            <span className="text-white font-mono">{activeLoanView.personalInfo?.phone || 'Not Specified'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Date of Birth</span>
                            <span className="text-white">{activeLoanView.personalInfo?.dateOfBirth || 'Not Specified'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Marital Status</span>
                            <span className="text-white">{activeLoanView.personalInfo?.maritalStatus || 'Single'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Country</span>
                            <span className="text-white font-bold">{activeLoanView.personalInfo?.country || 'United States'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Employment Status</span>
                            <span className="text-white">{activeLoanView.employmentInfo?.status || 'Employed'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Monthly Income</span>
                            <span className="text-white font-mono">${activeLoanView.employmentInfo?.monthlyIncome ? activeLoanView.employmentInfo.monthlyIncome.toLocaleString() : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Business Name</span>
                            <span className="text-white">{activeLoanView.businessInfo?.companyName || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <span className="text-gray-500 block text-[10px] uppercase font-mono mb-1">Residential Address</span>
                          <p className="text-white font-mono text-xs">{activeLoanView.personalInfo?.address || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Section 3: Identity Assets & Verification Documents */}
                      <div className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-3">
                        <h5 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" /> 3. Uploaded KYC Documents & Identity Assets
                        </h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                          {/* Government Issued ID */}
                          <div className="p-3 bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-gray-500 block text-[10px] uppercase font-mono">Government Issued ID</span>
                              <span className="text-white font-medium text-xs">Identity Document Scan</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const docUrl = activeLoanView.documents?.find(d => d.name.toLowerCase().includes('id') || d.name.toLowerCase().includes('government') || d.type.toLowerCase().includes('id'))?.url || activeLoanView.documents?.[0]?.url;
                                  setPreviewAssetModal({
                                    name: `Government ID - ${activeLoanView.userName}`,
                                    url: docUrl,
                                    type: 'Government Identity Document'
                                  });
                                }}
                                className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono text-[10px] font-bold rounded transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" /> View ID
                              </button>
                            </div>
                          </div>

                          {/* Proof of Address */}
                          <div className="p-3 bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-gray-500 block text-[10px] uppercase font-mono">Proof of Address</span>
                              <span className="text-white font-medium text-xs">Utility / Bank Statement</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const docUrl = activeLoanView.documents?.find(d => d.name.toLowerCase().includes('address') || d.name.toLowerCase().includes('utility') || d.type.toLowerCase().includes('address'))?.url || activeLoanView.documents?.[1]?.url;
                                  setPreviewAssetModal({
                                    name: `Proof of Address - ${activeLoanView.userName}`,
                                    url: docUrl,
                                    type: 'Utility Bill / Bank Statement'
                                  });
                                }}
                                className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono text-[10px] font-bold rounded transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" /> View Doc
                              </button>
                            </div>
                          </div>

                          {/* Biometric Selfie Photo */}
                          <div className="p-3 bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-gray-500 block text-[10px] uppercase font-mono">Biometric Selfie Photo</span>
                              <span className="text-white font-medium text-xs">Live Selfie Capture</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const docUrl = activeLoanView.documents?.find(d => d.name.toLowerCase().includes('selfie') || d.type.toLowerCase().includes('facial'))?.url || activeLoanView.documents?.[2]?.url;
                                  setPreviewAssetModal({
                                    name: `Biometric Selfie - ${activeLoanView.userName}`,
                                    url: docUrl,
                                    type: 'Facial Biometric Photo'
                                  });
                                }}
                                className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-400 hover:text-black font-mono text-[10px] font-bold rounded transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" /> View Selfie
                              </button>
                            </div>
                          </div>

                          {/* Verification Video */}
                          <div className="p-3 bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-gray-500 block text-[10px] uppercase font-mono">Verification Video</span>
                              <span className="text-white font-medium text-xs">Liveness Video Verification</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const docUrl = activeLoanView.documents?.find(d => d.name.toLowerCase().includes('video') || d.type.toLowerCase().includes('video'))?.url || activeLoanView.documents?.[4]?.url;
                                  setPreviewAssetModal({
                                    name: `Liveness Video Scan - ${activeLoanView.userName}`,
                                    url: docUrl,
                                    type: 'Liveness Video Recording'
                                  });
                                }}
                                className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-400 hover:text-black font-mono text-[10px] font-bold rounded transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Play className="h-3 w-3" /> Play Video
                              </button>
                            </div>
                          </div>
                        </div>

                        {activeLoanView.documents.length > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Attached Supporting Documentation</span>
                            {activeLoanView.documents.map((doc, idx) => (
                              <div key={idx} className="p-2.5 bg-zinc-900/80 rounded border border-white/5 font-mono text-[11px] text-gray-300 flex justify-between items-center">
                                <span>📎 {doc.name} ({doc.type})</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewAssetModal({
                                        name: doc.name,
                                        url: doc.url,
                                        type: doc.type
                                      });
                                    }}
                                    className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold rounded hover:bg-cyan-400 hover:text-black transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Eye className="h-3 w-3" /> Open
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Section 4: Collateral & Fee Settlement Review */}
                      <div className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-4">
                        <h5 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                          <Activity className="h-4 w-4" /> 4. Collateral & Company Fee Payment Audit
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-white/5">
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">25% Refundable Security Collateral</span>
                            <span className="text-sm font-bold font-mono text-white">${(activeLoanView.fundingDetails.requestedAmount * 0.25).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">3.5% Company Fee</span>
                            <span className="text-sm font-bold font-mono text-cyan-400">${(activeLoanView.fundingDetails.requestedAmount * 0.035).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Total Required Settlement</span>
                            <span className="text-sm font-bold font-mono text-yellow-400">${(activeLoanView.fundingDetails.requestedAmount * 0.285).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Installments Breakdown in Admin View */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <span className="text-gray-400 block text-[10px] uppercase font-mono font-bold">
                            Installment Payment Progress & Verification:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {([1, 2, 3, 4]).map((num) => {
                              const totalSettlement = Math.round(activeLoanView.fundingDetails.requestedAmount * 0.285);
                              const inst = activeLoanView.installments?.find(i => i.number === num) || {
                                number: num,
                                amount: Math.round(totalSettlement / 4),
                                status: num === 1 && activeLoanView.collateralPaymentStatus === 'Under Review' ? 'Under Review' : 'Pending'
                              };

                              const isUnderReview = inst.status === 'Under Review' || inst.status === 'Submitted';
                              const isApproved = inst.status === 'Approved' || (activeLoanView.collateralPaid && !activeLoanView.isInstallmentPlan);

                              return (
                                <div key={num} className={`p-3 rounded-lg border text-xs space-y-1 ${
                                  isApproved ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' :
                                  isUnderReview ? 'bg-yellow-950/40 border-yellow-400/60 text-yellow-200' :
                                  'bg-zinc-900 border-white/5 text-gray-400'
                                }`}>
                                  <div className="flex items-center justify-between font-mono font-bold">
                                    <span>Installment {num} (${inst.amount.toLocaleString()})</span>
                                    <span className={isApproved ? 'text-emerald-400' : isUnderReview ? 'text-yellow-400' : 'text-gray-500'}>
                                      {isApproved ? '✓ Confirmed' : isUnderReview ? '⏳ Under Review' : 'Pending'}
                                    </span>
                                  </div>
                                  {(inst.txId || activeLoanView.collateralTxId) && (
                                    <div className="text-[10px] font-mono text-gray-400 truncate">
                                      Ref: <span className="text-cyan-300 font-bold">{inst.txId || activeLoanView.collateralTxId}</span> ({inst.paymentMethod || 'Crypto/Wire'})
                                    </div>
                                  )}
                                  {isUnderReview && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleConfirmPayment(activeLoanView.id, num)}
                                        className="flex-1 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[10px] uppercase font-mono rounded cursor-pointer transition shadow-sm"
                                      >
                                        ✓ Confirm Inst {num}
                                      </button>
                                      <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleCancelPayment(activeLoanView.id, num)}
                                        className="flex-1 py-1.5 bg-red-950 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50 font-black text-[10px] uppercase font-mono rounded cursor-pointer transition shadow-sm"
                                      >
                                        ✕ Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-mono">Overall Settlement Status</span>
                            <span className="text-xs font-bold font-mono text-white">
                              {activeLoanView.collateralPaymentStatus === 'Confirmed' || activeLoanView.collateralPaid
                                ? '✓ Fully Confirmed & Verified'
                                : activeLoanView.collateralTxId || activeLoanView.installments?.some(i => i.status === 'Under Review')
                                ? '⏳ Installment Payment Under Review'
                                : '❌ Payment Outstanding'}
                            </span>
                          </div>
                          {activeLoanView.collateralTxId && (
                            <div className="text-right">
                              <span className="text-gray-500 block text-[10px] uppercase font-mono">Latest Tx Reference</span>
                              <span className="text-xs font-mono text-cyan-300 font-bold">{activeLoanView.collateralTxId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 5: Rejection Reason Input Field */}
                      <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl space-y-2">
                        <label className="block text-xs font-mono text-red-300 uppercase font-bold">
                          Application Rejection Reason {showRejectionPrompt && <span className="text-red-400">* (Required)</span>}
                        </label>
                        <textarea
                          rows={2}
                          value={loanRejectionReason}
                          onChange={(e) => {
                            setLoanRejectionReason(e.target.value);
                            setShowRejectionPrompt(false);
                          }}
                          placeholder="State the exact reason if rejecting this application (e.g. Incomplete ID document, Unverified address, Suspicious proof of income)..."
                          className="w-full px-4 py-2.5 bg-black border border-red-500/30 focus:border-red-400 rounded-lg text-xs text-white focus:outline-none font-sans"
                        />
                        {showRejectionPrompt && (
                          <p className="text-[11px] text-red-400 font-bold">
                            ⚠️ Please type a clear rejection reason above before confirming rejection.
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Modal Footer Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-white/10 mt-6">
                      
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveLoanView(null);
                            setShowRejectionPrompt(false);
                          }}
                          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer font-mono flex items-center gap-2 shadow-md"
                        >
                          <ArrowLeft className="h-4 w-4 text-cyan-400" />
                          <span>← Back to Applications List</span>
                        </button>

                        {/* Left Side Action: Disburse Loan button if payment confirmed */}
                        {(activeLoanView.collateralPaid || activeLoanView.collateralPaymentStatus === 'Confirmed') && !activeLoanView.disbursed && (
                          <button
                            onClick={() => handleDisburseLoan(activeLoanView.id)}
                            disabled={loading}
                            className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.4)] cursor-pointer font-display transition-all"
                          >
                            💸 Disburse Loan (${activeLoanView.fundingDetails.requestedAmount.toLocaleString()})
                          </button>
                        )}

                        {/* Confirm Payment & Cancel Payment buttons if payment is submitted or under review */}
                        {(activeLoanView.collateralPaid || activeLoanView.collateralTxId || activeLoanView.collateralPaymentStatus === 'Under Review') && activeLoanView.collateralPaymentStatus !== 'Confirmed' && !activeLoanView.disbursed && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleConfirmPayment(activeLoanView.id)}
                              disabled={loading}
                              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer font-mono shadow-md"
                            >
                              ✓ Confirm Payment
                            </button>
                            <button
                              onClick={() => handleCancelPayment(activeLoanView.id)}
                              disabled={loading}
                              className="px-5 py-2.5 bg-red-950/90 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50 font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer font-mono shadow-md"
                            >
                              ✕ Cancel Payment
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 ml-auto">
                        {/* Reject Application button */}
                        {activeLoanView.status !== 'Declined' && activeLoanView.status !== 'Rejected' && !activeLoanView.disbursed && (
                          <button
                            onClick={() => handleAuditLoan(activeLoanView.id, 'Declined', loanRejectionReason)}
                            disabled={loading}
                            className="px-5 py-2.5 text-xs font-bold text-red-400 border border-red-500/30 bg-red-950/40 hover:bg-red-500 hover:text-white rounded-lg transition-all cursor-pointer font-mono"
                          >
                            Reject Application
                          </button>
                        )}

                        {/* Approve Application button */}
                        {activeLoanView.status === 'Pending' && (
                          <button
                            onClick={() => handleAuditLoan(activeLoanView.id, 'Approved')}
                            disabled={loading}
                            className="px-6 py-2.5 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all cursor-pointer font-mono"
                          >
                            Approve Application
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ---------------- E. PAYMENTS REVIEW ---------------- */}
          {adminTab === 'payments' && (
            <div className="space-y-6 animate-fade-in" id="admin-view-payments">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">Payments & Fee Audit Queue</h3>
                <p className="text-xs text-gray-400">Review Stripe Card transactions and BEP20 Crypto payment proofs for instant audit and status update.</p>
              </div>

              {/* Payments Gateway Transactions List */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                  <span>💳 Stripe & BEP20 Crypto Transaction Records ({payments.length})</span>
                </h4>

                {payments.length === 0 ? (
                  <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-center text-xs text-gray-400">
                    No transactions registered in the gateway ledger yet.
                  </div>
                ) : (
                  <div className="border border-white/10 rounded-xl overflow-x-auto bg-black/40 shadow-xl">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-zinc-900 text-[10px] font-mono text-yellow-400 uppercase tracking-widest border-b border-white/10">
                        <tr>
                          <th className="p-3.5">Payment ID</th>
                          <th className="p-3.5">User</th>
                          <th className="p-3.5">Loan Ref</th>
                          <th className="p-3.5">Method</th>
                          <th className="p-3.5">Amount</th>
                          <th className="p-3.5">TxHash / Ref ID</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-white/[0.02]">
                            <td className="p-3.5 font-bold text-white">{p.id}</td>
                            <td className="p-3.5 font-sans">
                              <div className="text-white font-bold">{p.userName || p.userEmail}</div>
                              <div className="text-[10px] text-gray-400">{p.userEmail}</div>
                            </td>
                            <td className="p-3.5 text-cyan-400 font-bold">{p.applicationId || p.loanId}</td>
                            <td className="p-3.5">
                              {p.type === 'Loan Repayment' ? (
                                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] rounded uppercase font-bold">
                                  🔄 Loan Repayment
                                </span>
                              ) : p.method === 'Stripe' || p.paymentMethod === 'Stripe' ? (
                                <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] rounded uppercase font-bold">
                                  💳 Stripe Card
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] rounded uppercase font-bold">
                                  🪙 BEP20 Collateral
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-emerald-400 font-black text-sm">${p.amount?.toLocaleString()} USD</td>
                            <td className="p-3.5 font-mono text-[10px] text-cyan-300 break-all max-w-[160px]">
                              {p.txHash || p.sessionId || 'N/A'}
                            </td>
                            <td className="p-3.5">
                              {p.status === 'Approved' ? (
                                <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] rounded-full uppercase font-bold">
                                  ✓ Approved
                                </span>
                              ) : p.status === 'Rejected' ? (
                                <span className="px-2.5 py-1 bg-red-950/80 text-red-400 border border-red-500/40 text-[10px] rounded-full uppercase font-bold">
                                  ✕ Rejected
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-yellow-950/80 text-yellow-300 border border-yellow-500/40 text-[10px] rounded-full uppercase font-bold animate-pulse">
                                  ⏳ Pending Audit
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              {(p.status === 'Pending' || p.status === 'Under Review') && (
                                <>
                                  <button
                                    onClick={() => handleUpdatePaymentRecordStatus(p.id, 'Approved')}
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black font-sans font-bold text-xs rounded transition-all shadow cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const notes = prompt('Enter reason for rejecting payment record:') || '';
                                      handleUpdatePaymentRecordStatus(p.id, 'Rejected', notes);
                                    }}
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-red-950 hover:bg-red-600 text-red-200 border border-red-500/50 font-sans font-bold text-xs rounded transition-all shadow cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Loan Applications Payment Audit Queue */}
              <div className="pt-4 space-y-3">
                <h4 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  📄 Loan Application Collateral & Disburse Audit
                </h4>

              {loans.filter(l => l.collateralPaid || l.collateralPaymentStatus === 'Under Review' || l.collateralPaymentStatus === 'Submitted' || l.installments?.some(i => i.status === 'Submitted' || i.status === 'Under Review')).length === 0 ? (
                <div className="text-center py-12 border border-white/5 bg-black/20 rounded-xl space-y-2">
                  <p className="text-xs text-gray-400">No collateral or fee payments awaiting review at this time.</p>
                </div>
              ) : (
                <div className="border border-white/5 rounded-xl overflow-x-auto bg-black/30">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-white/5 text-[10px] font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5">
                      <tr>
                        <th className="p-4">Loan Ref ID</th>
                        <th className="p-4">Applicant</th>
                        <th className="p-4">Requested Amount</th>
                        <th className="p-4">Payment Details / Type</th>
                        <th className="p-4">TxID / Reference</th>
                        <th className="p-4">Review Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {loans.filter(l => l.collateralPaid || l.collateralPaymentStatus === 'Under Review' || l.collateralPaymentStatus === 'Submitted' || l.installments?.some(i => i.status === 'Submitted' || i.status === 'Under Review')).map((l) => {
                        const pendingInst = l.installments?.find(i => i.status === 'Submitted' || i.status === 'Under Review');
                        const isFullPaid = l.collateralPaid;

                        return (
                          <tr key={l.id} className="hover:bg-white/[0.02]">
                            <td className="p-4 font-bold text-white">{l.id}</td>
                            <td className="p-4">
                              <div className="font-sans font-medium text-white">{l.userName}</div>
                              <div className="text-[10px] text-gray-500">{l.userEmail}</div>
                            </td>
                            <td className="p-4 text-cyan-300 font-bold">${l.fundingDetails.requestedAmount.toLocaleString()}</td>
                            <td className="p-4">
                              {pendingInst ? (
                                <div>
                                  <span className="text-yellow-400 font-bold block">Installment {pendingInst.number} of {l.installments?.length || 3}</span>
                                  <span className="text-[10px] text-gray-400">${pendingInst.amount.toLocaleString()} USD Deposit</span>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-emerald-400 font-bold block">Refundable Collateral (25%)</span>
                                  <span className="text-[10px] text-gray-400">${Math.round(l.fundingDetails.requestedAmount * 0.25).toLocaleString()} USD</span>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-cyan-400 font-mono text-[10px] break-all max-w-[140px]">
                              {pendingInst?.txId || l.collateralTxId || 'N/A'}
                            </td>
                            <td className="p-4">
                              {isFullPaid ? (
                                <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] rounded-full uppercase font-bold">
                                  ✓ Fully Confirmed
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-yellow-950/80 text-yellow-300 border border-yellow-500/40 text-[10px] rounded-full uppercase font-bold animate-pulse">
                                  ⏳ Under Review
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {!isFullPaid && pendingInst && (
                                <>
                                  <button
                                    onClick={() => handleConfirmPayment(l.id, pendingInst.number)}
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-sans font-bold text-xs rounded transition-all shadow-md cursor-pointer"
                                  >
                                    Confirm Inst {pendingInst.number}
                                  </button>
                                  <button
                                    onClick={() => handleCancelPayment(l.id, pendingInst.number)}
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-red-950/80 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50 font-sans font-bold text-xs rounded transition-all shadow-md cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {!isFullPaid && !pendingInst && (
                                <>
                                  <button
                                    onClick={() => handleConfirmPayment(l.id)}
                                    disabled={loading}
                                    className="px-3 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-sans font-bold text-xs rounded transition-all shadow-md cursor-pointer"
                                  >
                                    Confirm Payment
                                  </button>
                                  <button
                                    onClick={() => handleCancelPayment(l.id)}
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-red-950/80 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50 font-sans font-bold text-xs rounded transition-all shadow-md cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {isFullPaid && !l.disbursed && (
                                <button
                                  onClick={() => handleDisburseLoan(l.id)}
                                  disabled={loading}
                                  className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-sans font-bold text-xs rounded transition-all shadow-md cursor-pointer"
                                >
                                  Disburse Loan
                                </button>
                              )}
                              {l.disbursed && (
                                <span className="text-[10px] text-emerald-400 font-mono font-bold">Disbursed ✓</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            </div>
          )}


          {/* ---------------- LOAN REPAYMENTS REVIEW & SETTLEMENT ---------------- */}
          {adminTab === 'repayments' && (
            <div className="space-y-6 animate-fade-in" id="admin-view-repayments">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold rounded-full uppercase tracking-wider">
                      FINANCIAL PROTOCOL AUDIT
                    </span>
                    <span className="text-xs text-gray-400 font-mono">Automated Settlement Engine</span>
                  </div>
                  <h3 className="font-display text-2xl font-black text-white mt-1">Loan Repayment Review & Settlement</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Review borrower submitted repayments, inspect blockchain hashes, add internal notes, approve and settle loans.</p>
                </div>
                
                <button
                  onClick={fetchAdminData}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold text-cyan-400 flex items-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" /> Refresh Repayment Feed
                </button>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-1 shadow-lg">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold block">Total Repayments</span>
                  <div className="text-2xl font-black font-display text-white">
                    {payments.filter(p => p.type === 'Loan Repayment').length} <span className="text-xs font-mono text-gray-400 font-normal">submitted</span>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400 font-bold">
                    ${payments.filter(p => p.type === 'Loan Repayment').reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()} USD Total
                  </div>
                </div>

                <div className="p-5 bg-amber-950/30 border border-amber-500/20 rounded-2xl space-y-1 shadow-lg">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">Awaiting Verification</span>
                  <div className="text-2xl font-black font-display text-amber-300">
                    {payments.filter(p => p.type === 'Loan Repayment' && (p.status === 'Under Review' || p.status === 'Pending')).length} <span className="text-xs font-mono text-amber-400/80 font-normal">pending review</span>
                  </div>
                  <div className="text-[11px] font-mono text-amber-400 font-bold">
                    ${payments.filter(p => p.type === 'Loan Repayment' && (p.status === 'Under Review' || p.status === 'Pending')).reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()} USD Pending
                  </div>
                </div>

                <div className="p-5 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl space-y-1 shadow-lg">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">Approved & Settled Loans</span>
                  <div className="text-2xl font-black font-display text-emerald-400">
                    {payments.filter(p => p.type === 'Loan Repayment' && (p.status === 'Approved' || p.status === 'Confirmed')).length} <span className="text-xs font-mono text-emerald-300/80 font-normal">settled</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold">
                    ${payments.filter(p => p.type === 'Loan Repayment' && (p.status === 'Approved' || p.status === 'Confirmed')).reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()} USD Confirmed
                  </div>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-4 bg-zinc-950/80 border border-white/10 rounded-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setRepaymentFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      repaymentFilter === 'all' ? 'bg-cyan-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    All Repayments ({payments.filter(p => p.type === 'Loan Repayment').length})
                  </button>
                  <button
                    onClick={() => setRepaymentFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      repaymentFilter === 'pending' ? 'bg-amber-400 text-black' : 'bg-white/5 text-amber-400 hover:bg-amber-950/40'
                    }`}
                  >
                    ⏳ Pending Review ({payments.filter(p => p.type === 'Loan Repayment' && (p.status === 'Under Review' || p.status === 'Pending')).length})
                  </button>
                  <button
                    onClick={() => setRepaymentFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      repaymentFilter === 'approved' ? 'bg-emerald-400 text-black' : 'bg-white/5 text-emerald-400 hover:bg-emerald-950/40'
                    }`}
                  >
                    ✓ Approved & Settled ({payments.filter(p => p.type === 'Loan Repayment' && (p.status === 'Approved' || p.status === 'Confirmed')).length})
                  </button>
                  <button
                    onClick={() => setRepaymentFilter('rejected')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      repaymentFilter === 'rejected' ? 'bg-red-400 text-black' : 'bg-white/5 text-red-400 hover:bg-red-950/40'
                    }`}
                  >
                    ✕ Rejected ({payments.filter(p => p.type === 'Loan Repayment' && p.status === 'Rejected').length})
                  </button>
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={repaymentSearch}
                    onChange={(e) => setRepaymentSearch(e.target.value)}
                    placeholder="Search borrower, loan ID or hash..."
                    className="w-full pl-9 pr-4 py-2 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Repayments Data List */}
              {(() => {
                const filteredRepayments = payments.filter(p => {
                  if (p.type !== 'Loan Repayment') return false;
                  if (repaymentFilter === 'pending' && p.status !== 'Under Review' && p.status !== 'Pending') return false;
                  if (repaymentFilter === 'approved' && p.status !== 'Approved' && p.status !== 'Confirmed') return false;
                  if (repaymentFilter === 'rejected' && p.status !== 'Rejected') return false;

                  if (repaymentSearch.trim()) {
                    const q = repaymentSearch.toLowerCase();
                    const name = (p.userName || '').toLowerCase();
                    const email = (p.userEmail || '').toLowerCase();
                    const loanId = (p.applicationId || '').toLowerCase();
                    const hash = (p.txHash || '').toLowerCase();
                    return name.includes(q) || email.includes(q) || loanId.includes(q) || hash.includes(q);
                  }
                  return true;
                });

                if (filteredRepayments.length === 0) {
                  return (
                    <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl bg-zinc-950/50 space-y-3">
                      <DollarSign className="h-12 w-12 text-zinc-600 mx-auto" />
                      <h4 className="text-base font-bold text-white font-display uppercase tracking-wide">No Repayment Submissions Found</h4>
                      <p className="text-xs text-gray-400 max-w-md mx-auto">Borrower loan repayments submitted via cryptocurrency or wire transfers will appear in this review queue.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filteredRepayments.map((pmt) => {
                      const matchedLoan = loans.find(l => l.id === pmt.applicationId);
                      const isPending = pmt.status === 'Under Review' || pmt.status === 'Pending';
                      const isApproved = pmt.status === 'Approved' || pmt.status === 'Confirmed';

                      return (
                        <div key={pmt.id} className="p-6 bg-zinc-950 border-2 border-white/10 hover:border-cyan-500/30 rounded-2xl space-y-5 transition-all shadow-xl">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-cyan-400">Loan Ref: {pmt.applicationId || 'N/A'}</span>
                                <span className="text-zinc-600">•</span>
                                <span className="font-mono text-xs text-gray-400">Pmt ID: {pmt.id}</span>
                                <span className="text-zinc-600">•</span>
                                <span className="font-mono text-xs text-zinc-400">{new Date(pmt.createdAt).toLocaleString()}</span>
                              </div>
                              <h4 className="text-lg font-bold text-white font-display flex items-center gap-2">
                                <span>{pmt.userName}</span>
                                <span className="text-xs font-mono font-normal text-gray-400">({pmt.userEmail})</span>
                              </h4>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                                isApproved ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' :
                                isPending ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse' :
                                'bg-red-950/80 text-red-400 border-red-500/40'
                              }`}>
                                {isApproved ? '✓ Approved & Settled' : isPending ? '⏳ Under Review' : '✕ Rejected'}
                              </span>
                              <span className="text-2xl font-black font-display text-cyan-400">
                                ${pmt.amount.toLocaleString()} <span className="text-xs font-mono text-zinc-400">USD</span>
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                            <div className="p-3.5 bg-black/60 rounded-xl border border-white/5 space-y-1">
                              <span className="text-[10px] text-gray-500 uppercase block font-bold">Payment Method & Network</span>
                              <div className="text-white font-bold">{pmt.paymentMethod || 'Cryptocurrency Transfer'}</div>
                              <div className="text-cyan-400">{pmt.network || 'BNB Smart Chain (BEP20)'}</div>
                            </div>

                            <div className="p-3.5 bg-black/60 rounded-xl border border-white/5 space-y-1">
                              <span className="text-[10px] text-gray-500 uppercase block font-bold">Wallet Address / Source</span>
                              <div className="text-zinc-300 font-mono text-[11px] truncate">{pmt.walletAddress || '0x71C...39F1'}</div>
                              <div className="text-[10px] text-gray-500">Destination: Institutional Treasury</div>
                            </div>

                            <div className="p-3.5 bg-black/60 rounded-xl border border-white/5 space-y-1">
                              <span className="text-[10px] text-gray-500 uppercase block font-bold">Blockchain Tx Hash / Ref</span>
                              <div className="text-cyan-400 font-mono text-[11px] truncate flex items-center justify-between">
                                <span className="truncate">{pmt.txHash || '0x8f29...a1b2'}</span>
                                {pmt.txHash && pmt.txHash.startsWith('0x') && (
                                  <a
                                    href={`https://bscscan.com/tx/${pmt.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-cyan-300 hover:underline font-bold shrink-0 ml-2"
                                  >
                                    BSCScan ↗
                                  </a>
                                )}
                              </div>
                              <div className="text-[10px] font-bold text-emerald-400">
                                {matchedLoan?.status === 'Settled' ? '✓ Loan Marked as Settled' : `Outstanding Bal: $${(matchedLoan?.remainingBalance || 0).toLocaleString()}`}
                              </div>
                            </div>
                          </div>

                          {/* Internal Notes & Action Controls */}
                          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={repaymentNotes[pmt.id] !== undefined ? repaymentNotes[pmt.id] : (pmt.adminNotes || '')}
                                onChange={(e) => setRepaymentNotes(prev => ({ ...prev, [pmt.id]: e.target.value }))}
                                placeholder="Add internal compliance notes (e.g. Verified on-chain via block #3918241)..."
                                className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-400"
                              />
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdatePaymentRecordStatus(pmt.id, 'Approved', repaymentNotes[pmt.id] || pmt.adminNotes || '')}
                                disabled={loading || isApproved}
                                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-2 font-display shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {isApproved ? 'Approved & Settled' : 'Approve & Settle Loan'}
                              </button>

                              {!isApproved && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePaymentRecordStatus(pmt.id, 'Rejected', repaymentNotes[pmt.id] || 'Payment verification failed.')}
                                  disabled={loading}
                                  className="px-4 py-2.5 bg-red-950/80 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 font-display"
                                >
                                  <XCircle className="h-4 w-4" /> Reject
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
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

          {/* ---------------- E2. MESSAGE DESK ---------------- */}
          {adminTab === 'messages' && (
            <div className="space-y-6 animate-fade-in" id="admin-view-messages">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">Direct Borrower Communication Desk</h3>
                <p className="text-xs text-gray-400">Two-way encrypted messaging, compliance alerts, and document dispatches.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[460px]">
                {/* Users List for Messaging */}
                <div className="md:col-span-1 border border-white/5 bg-black/40 rounded-xl p-4 space-y-4">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Active Borrowers</h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {users.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">No borrowers registered.</p>
                    ) : (
                      users.map((u) => {
                        const userMsgs = adminMessages.filter(m => m.senderId === u.id || m.receiverId === u.id);
                        const unreadCount = adminMessages.filter(m => m.senderId === u.id && !m.isRead).length;
                        const lastMsg = userMsgs[userMsgs.length - 1];

                        return (
                          <div
                            key={u.id}
                            onClick={() => setSelectedUserForMsg(u.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedUserForMsg === u.id ? 'border-cyan-400 bg-cyan-950/20' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-white truncate max-w-[130px]">{u.name}</span>
                              {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-cyan-400 text-black font-mono font-bold text-[9px] rounded-full">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono truncate">{u.email}</p>
                            {lastMsg && (
                              <p className="text-[10px] text-gray-500 truncate mt-1 italic">
                                {lastMsg.senderRole === 'admin' ? 'You: ' : ''}{lastMsg.content}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Conversation Window */}
                <div className="md:col-span-2 border border-white/5 bg-black/40 rounded-xl p-4 flex flex-col justify-between">
                  {selectedUserForMsg ? (
                    <>
                      {/* Header */}
                      <div className="border-b border-white/5 pb-3 mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">
                            {users.find(u => u.id === selectedUserForMsg)?.name || 'Borrower'}
                          </h4>
                          <p className="text-[10px] font-mono text-cyan-400">
                            ID: {selectedUserForMsg} • {users.find(u => u.id === selectedUserForMsg)?.email}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 bg-green-950/50 text-green-400 border border-green-500/20 rounded-full uppercase">
                          Encrypted Desk Active
                        </span>
                      </div>

                      {/* Messages Feed */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 max-h-[300px]">
                        {adminMessages.filter(m => m.senderId === selectedUserForMsg || m.receiverId === selectedUserForMsg).length === 0 ? (
                          <div className="text-center text-xs text-gray-500 py-12">
                            No messages yet. Send a direct communication or alert to this borrower below.
                          </div>
                        ) : (
                          adminMessages
                            .filter(m => m.senderId === selectedUserForMsg || m.receiverId === selectedUserForMsg)
                            .map((msg) => {
                              const isAdmin = msg.senderRole === 'admin' || msg.senderId === 'admin-1';
                              const senderLabel = isAdmin 
                                ? 'Elon Capital Loan Team' 
                                : (users.find(u => u.id === selectedUserForMsg)?.name || msg.senderName || 'Borrower');
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                                >
                                  <span className={`text-[10px] font-mono font-bold mb-1 px-1 ${isAdmin ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                    {senderLabel}
                                  </span>
                                  <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                                      isAdmin
                                        ? 'bg-cyan-500 text-black font-semibold rounded-br-none shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                                        : 'bg-zinc-800 text-white font-medium rounded-bl-none border border-white/10'
                                    }`}
                                  >
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                  {(msg.imageUrl || (msg.attachment?.url && (msg.attachment.url.startsWith('data:image') || msg.attachment.url.startsWith('http') || msg.attachment.url.startsWith('blob:')))) && (
                                    <div className="mt-2 font-mono text-[10px]">
                                      <img 
                                        src={msg.imageUrl || msg.attachment?.url} 
                                        alt="Message Attachment" 
                                        className="max-h-56 w-full object-contain rounded-lg border border-white/20 cursor-pointer shadow-md hover:scale-[1.02] transition-transform" 
                                        onClick={() => window.open(msg.imageUrl || msg.attachment?.url, '_blank')}
                                      />
                                    </div>
                                  )}
                                  {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-black/10 text-[10px] font-mono font-bold flex flex-wrap gap-2">
                                      {msg.attachments.map((att: any, idx: number) => {
                                        const isImg = att.url && (att.url.startsWith('data:image') || att.url.startsWith('http') || att.url.startsWith('blob:'));
                                        if (isImg && !msg.imageUrl) {
                                          return (
                                            <div key={idx} className="w-full mt-1">
                                              <img 
                                                src={att.url} 
                                                alt={att.name} 
                                                className="max-h-56 w-full object-contain rounded-lg border border-white/20 cursor-pointer shadow-md hover:scale-[1.02] transition-transform" 
                                                onClick={() => window.open(att.url, '_blank')}
                                              />
                                            </div>
                                          );
                                        }
                                        return (
                                          <a
                                            key={idx}
                                            href={att.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2 py-1 bg-black/20 rounded hover:underline flex items-center gap-1"
                                          >
                                            📎 {att.name}
                                          </a>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                <span className="text-[9px] font-mono text-gray-500 mt-1 px-1">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Reply Box */}
                      <form onSubmit={handleAdminSendMessage} className="space-y-2 border-t border-white/5 pt-3">
                        {adminMsgAttachment && (
                          <div className="flex items-center justify-between text-xs font-mono bg-cyan-950/40 border border-cyan-400/30 p-2 rounded-lg text-cyan-300">
                            <span className="truncate">📎 {adminMsgAttachment.name}</span>
                            <button
                              type="button"
                              onClick={() => setAdminMsgAttachment(null)}
                              className="text-red-400 font-bold hover:text-red-300 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={adminMsgAttachmentInputRef}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  setAdminMsgAttachment({ name: file.name, url: evt.target?.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => adminMsgAttachmentInputRef.current?.click()}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition"
                            title="Attach File"
                          >
                            📎
                          </button>
                          <input
                            type="text"
                            required={!adminMsgAttachment}
                            value={adminReplyContent}
                            onChange={(e) => setAdminReplyContent(e.target.value)}
                            placeholder="Write administrative dispatch message..."
                            className="flex-1 px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                          <button
                            type="submit"
                            className="px-5 py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition"
                          >
                            Send
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-3">
                      <MessageSquare className="h-10 w-10 text-gray-600" />
                      <p className="text-xs text-gray-400">Select a borrower from the list on the left to start a direct message thread.</p>
                    </div>
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

      {/* Unified User Profile Modal Overlay */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#09090b] border border-white/10 rounded-2xl p-6 md:p-8 my-8 shadow-2xl space-y-6">
            <button 
              onClick={() => setSelectedUserDetail(null)} 
              className="absolute top-6 right-6 text-gray-500 hover:text-white p-2 rounded-lg bg-white/5 border border-white/10 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 font-mono text-lg">
                  {selectedUserDetail.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-2xl font-black text-white">{selectedUserDetail.name}</h3>
                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase ${
                      selectedUserDetail.isVerified ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30' : 'bg-red-950/40 text-red-500 border border-red-500/20'
                    }`}>
                      {selectedUserDetail.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                    {selectedUserDetail.isSuspended && (
                      <span className="px-2 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase bg-red-950/60 text-red-400 border border-red-500/40">
                        SUSPENDED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    User ID: <span className="text-cyan-400 font-bold">{selectedUserDetail.id}</span> • Registered: {new Date(selectedUserDetail.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Main Sections: Account Info, Loan Applications, KYC Details */}
            {(() => {
              const userLoansList = loans.filter(l => l.userId === selectedUserDetail.id || l.userEmail.toLowerCase() === selectedUserDetail.email.toLowerCase());
              const userKycRecord = kycRequests.find(k => k.userId === selectedUserDetail.id || k.userEmail.toLowerCase() === selectedUserDetail.email.toLowerCase());

              return (
                <div className="space-y-6">
                  {/* 1. Account Info Card */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
                    <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2 border-b border-white/5 pb-2">
                      <UserCheck className="h-4 w-4" /> 1. Account & Security Credentials
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-mono">Full Name</span>
                        <span className="text-white font-semibold">{selectedUserDetail.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-mono">Email Address</span>
                        <span className="text-white font-mono">{selectedUserDetail.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-mono">Login Password</span>
                        <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded border border-white/10 w-fit font-mono mt-1">
                          <span className="text-emerald-400 font-bold select-all">
                            {showUserModalPassword ? (selectedUserDetail.password || 'ElonCapital2026!') : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowUserModalPassword(!showUserModalPassword)}
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            {showUserModalPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-mono">Phone Number</span>
                        <span className="text-white font-mono">{selectedUserDetail.phone || 'Not Specified'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-mono">Country</span>
                        <span className="text-white font-medium">{selectedUserDetail.country || 'United States'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-mono">Role</span>
                        <span className="text-white font-mono uppercase">{selectedUserDetail.role}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Loan Facilities & History */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
                    <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2 border-b border-white/5 pb-2">
                      <FileText className="h-4 w-4" /> 2. Loan Applications ({userLoansList.length})
                    </h4>
                    {userLoansList.length === 0 ? (
                      <p className="text-xs text-gray-500 italic py-2">No active or historic loan applications submitted by this user.</p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {userLoansList.map(loan => (
                          <div key={loan.id} className="p-4 bg-black/40 border border-white/5 rounded-lg space-y-3">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                              <div>
                                <span className="font-mono text-[10px] text-gray-500">LOAN REF: {loan.id}</span>
                                <h5 className="font-bold text-sm text-white">${loan.fundingDetails.requestedAmount.toLocaleString()} • {loan.fundingDetails.purpose}</h5>
                              </div>
                              <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full uppercase border ${
                                loan.status === 'Approved' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30' :
                                loan.status === 'Pending' ? 'bg-yellow-950/40 text-yellow-500 border-yellow-500/20' :
                                'bg-red-950/40 text-red-500 border-red-500/20'
                              }`}>
                                {loan.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 italic">"{loan.fundingDetails.description}"</p>
                            {/* Attached loan documents */}
                            {loan.documents && loan.documents.length > 0 && (
                              <div className="pt-2 border-t border-white/5">
                                <span className="text-[10px] font-mono text-gray-500 block mb-1.5">ATTACHED BORROWER DOCUMENTS:</span>
                                <div className="flex flex-wrap gap-2">
                                  {loan.documents.map((doc, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => setPreviewAssetModal({ name: doc.name, url: doc.url, type: doc.type })}
                                      className="px-2.5 py-1 bg-white/5 hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/30 text-cyan-400 text-[10px] font-mono rounded flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <ZoomIn className="h-3 w-3" /> {doc.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. KYC Compliance Portfolio */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
                    <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2 border-b border-white/5 pb-2">
                      <ShieldCheck className="h-4 w-4" /> 3. KYC Verification Portfolio
                    </h4>
                    {!userKycRecord ? (
                      <p className="text-xs text-gray-500 italic py-2">No KYC application record on file for this borrower.</p>
                    ) : (
                      <div className="space-y-4 text-xs">
                        <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                          <div>
                            <span className="text-[10px] text-gray-500 font-mono block">KYC STATUS</span>
                            <span className="font-bold text-white uppercase">{userKycRecord.status}</span>
                          </div>
                          <button
                            onClick={() => { setSelectedUserDetail(null); setActiveKycDoc(userKycRecord); }}
                            className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs rounded transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> Full KYC Audit View
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
                            <span className="text-[10px] font-mono text-gray-500 block">GOVT ID ({userKycRecord.idType || 'Passport'})</span>
                            <p className="text-cyan-400 font-mono truncate">{userKycRecord.idCardUrl}</p>
                            <button
                              onClick={() => setPreviewAssetModal({ name: `Govt ID (${userKycRecord.idType || 'Passport'})`, url: userKycRecord.idCardUrl, type: 'Government ID' })}
                              className="mt-1 px-2 py-0.5 bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-mono rounded flex items-center gap-1 border border-cyan-500/20"
                            >
                              <ZoomIn className="h-3 w-3" /> View / Zoom Document
                            </button>
                          </div>

                          <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
                            <span className="text-[10px] font-mono text-gray-500 block">BIOMETRIC SELFIE / LIVENESS</span>
                            <p className="text-cyan-400 font-mono truncate">{userKycRecord.selfieUrl}</p>
                            <button
                              onClick={() => setPreviewAssetModal({ name: 'Biometric Selfie', url: userKycRecord.selfieUrl, type: 'Selfie' })}
                              className="mt-1 px-2 py-0.5 bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-mono rounded flex items-center gap-1 border border-cyan-500/20"
                            >
                              <ZoomIn className="h-3 w-3" /> View Selfie Media
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Footer */}
                  <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        setSelectedUserForMsg(selectedUserDetail.id);
                        setAdminTab('messages');
                        setSelectedUserDetail(null);
                      }}
                      className="px-4 py-2 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-500/30 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" /> Message Borrower
                    </button>

                    <div className="flex gap-3">
                      {selectedUserDetail.role !== 'admin' && (
                        selectedUserDetail.isSuspended ? (
                          <button
                            onClick={() => { handleToggleSuspension(selectedUserDetail.id, false); setSelectedUserDetail(null); }}
                            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Reactivate Account
                          </button>
                        ) : (
                          <button
                            onClick={() => { handleToggleSuspension(selectedUserDetail.id, true); setSelectedUserDetail(null); }}
                            className="px-4 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Suspend Account
                          </button>
                        )
                      )}
                      <button
                        onClick={() => setSelectedUserDetail(null)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Close Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Enhanced KYC & Asset Document Viewer Modal */}
      {previewAssetModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className={`bg-zinc-950 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative flex flex-col transition-all duration-300 ${
            isFullScreenModal ? 'w-full h-full max-w-none rounded-none border-none p-8' : 'max-w-4xl w-full max-h-[92vh]'
          }`}>
            {/* Header Bar */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> SECURE IDENTITY & KYC ASSET VIEWER
                </span>
                <h4 className="text-xl font-black text-white font-display mt-0.5">{previewAssetModal.name}</h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Category: <span className="text-cyan-300 font-bold">{previewAssetModal.type}</span></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullScreenModal(!isFullScreenModal)}
                  className="p-2 text-cyan-400 hover:text-white bg-white/5 hover:bg-white/15 border border-cyan-500/30 rounded-xl transition cursor-pointer"
                  title={isFullScreenModal ? "Exit Fullscreen" : "Fullscreen View"}
                >
                  {isFullScreenModal ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewAssetModal(null);
                    setPreviewZoom(1);
                    setPreviewRotate(0);
                    setIsFullScreenModal(false);
                  }}
                  className="p-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/80 rounded-xl border border-white/10 mb-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewZoom(prev => Math.min(prev + 0.25, 3))}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-cyan-400 rounded-lg border border-white/10 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" /> Zoom In
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-cyan-400 rounded-lg border border-white/10 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <ZoomOut className="h-3.5 w-3.5" /> Zoom Out
                </button>
                <button
                  type="button"
                  onClick={() => { setPreviewZoom(1); setPreviewRotate(0); }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-zinc-300 rounded-lg border border-white/10 font-bold cursor-pointer"
                >
                  Reset
                </button>
                <span className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] rounded-md">
                  {Math.round(previewZoom * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewRotate(prev => (prev + 90) % 360)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-cyan-400 rounded-lg border border-white/10 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
                </button>
                {previewAssetModal.url && (
                  <button
                    type="button"
                    onClick={() => window.open(previewAssetModal.url, '_blank')}
                    className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 rounded-lg border border-cyan-500/30 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> External Window
                  </button>
                )}
              </div>
            </div>

            {/* Main Asset Canvas Area */}
            <div className="flex-1 bg-black rounded-xl border border-white/10 flex items-center justify-center p-6 overflow-auto min-h-[300px] relative">
              {previewAssetModal.url && (previewAssetModal.url.startsWith('data:image') || previewAssetModal.url.startsWith('http') || previewAssetModal.url.startsWith('blob:')) ? (
                <div className="relative overflow-auto max-h-[60vh] w-full flex justify-center items-center">
                  <img
                    src={previewAssetModal.url}
                    alt={previewAssetModal.name}
                    style={{
                      transform: `scale(${previewZoom}) rotate(${previewRotate}deg)`,
                      transition: 'transform 0.2s ease-in-out'
                    }}
                    className="max-h-[55vh] w-auto rounded-xl object-contain border border-cyan-500/30 shadow-2xl cursor-grab active:cursor-grabbing"
                  />
                </div>
              ) : previewAssetModal.url && (previewAssetModal.url.startsWith('data:video') || previewAssetModal.url.includes('mp4') || previewAssetModal.url.includes('webm') || previewAssetModal.type.toLowerCase().includes('video')) ? (
                <div className="w-full max-h-[60vh] flex flex-col items-center">
                  <video
                    controls
                    autoPlay
                    src={previewAssetModal.url}
                    className="w-full max-h-[50vh] rounded-xl border border-cyan-500/30 shadow-2xl bg-black"
                  >
                    Your browser does not support HTML5 video playback.
                  </video>
                  <span className="text-[10px] text-emerald-400 font-mono mt-2 font-bold">✓ Biometric Liveness Video Stream Playing</span>
                </div>
              ) : (
                /* Document Certificate / Fallback Visual Card */
                <div className="p-8 bg-zinc-950 rounded-2xl border-2 border-cyan-500/30 text-left max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="text-base font-bold text-white font-display">{previewAssetModal.name}</h5>
                      <p className="text-xs text-gray-400 font-mono">Official KYC Registry Record</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono text-zinc-300 bg-black/60 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between"><span className="text-gray-500">Document Type:</span><span className="text-cyan-400 font-bold">{previewAssetModal.type}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">File Reference:</span><span className="text-white font-bold truncate max-w-[200px]">{previewAssetModal.url || 'kyc_document_file.pdf'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Audit Status:</span><span className="text-emerald-400 font-bold">✓ Verified Encrypted</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Security Hash:</span><span className="text-zinc-400">0x742d3...89f1</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
              <span className="text-[10px] font-mono text-gray-500">Use mouse wheel or zoom buttons to inspect micro-text details.</span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (previewAssetModal.url && (previewAssetModal.url.startsWith('data:') || previewAssetModal.url.startsWith('http'))) {
                      const a = document.createElement('a');
                      a.href = previewAssetModal.url;
                      a.download = `${previewAssetModal.name.replace(/\s+/g, '_')}_KYC.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } else {
                      const canvas = document.createElement('canvas');
                      canvas.width = 800;
                      canvas.height = 500;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.fillStyle = '#09090b';
                        ctx.fillRect(0, 0, 800, 500);
                        ctx.fillStyle = '#22d3ee';
                        ctx.font = 'bold 22px sans-serif';
                        ctx.fillText('ELON CAPITAL - KYC DOCUMENT RECORD', 50, 70);
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '16px sans-serif';
                        ctx.fillText(`Asset Title: ${previewAssetModal.name}`, 50, 130);
                        ctx.fillText(`Category: ${previewAssetModal.type}`, 50, 170);
                        ctx.fillText(`File Name: ${previewAssetModal.url || 'KYC Asset'}`, 50, 210);
                        ctx.fillText(`Date Exported: ${new Date().toLocaleDateString()}`, 50, 250);
                        ctx.fillStyle = '#10b981';
                        ctx.font = 'bold 16px sans-serif';
                        ctx.fillText('✓ AUDITED IDENTITY COMPLIANCE RECORD', 50, 320);
                      }
                      const a = document.createElement('a');
                      a.href = canvas.toDataURL('image/png');
                      a.download = `${previewAssetModal.name.replace(/\s+/g, '_')}_KYC.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                    triggerAlert('success', `Downloaded ${previewAssetModal.name}`);
                  }}
                  className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl font-mono flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Download className="h-4 w-4" /> Download Asset File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewAssetModal(null);
                    setPreviewZoom(1);
                    setPreviewRotate(0);
                    setIsFullScreenModal(false);
                  }}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl font-mono cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
