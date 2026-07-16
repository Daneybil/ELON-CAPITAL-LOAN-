import React from 'react';
import { 
  User, 
  LoanApplication, 
  KYC, 
  Message, 
  SupportTicket, 
  Notification as NotificationType 
} from '../types';
import { 
  ShieldCheck, 
  FileText, 
  Send, 
  Plus, 
  HelpCircle, 
  UploadCloud, 
  Check, 
  AlertTriangle, 
  MessageSquare, 
  Activity, 
  Settings, 
  Bell, 
  Lock, 
  RefreshCw, 
  FilePlus, 
  CreditCard 
} from 'lucide-react';

interface UserDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
  defaultTab?: 'overview' | 'apply' | 'loans' | 'kyc' | 'messages' | 'support' | 'settings';
  onTabChange?: (tab: 'overview' | 'apply' | 'loans' | 'kyc' | 'messages' | 'support' | 'settings') => void;
  prefilledAmount?: number;
  prefilledTerm?: number;
  onClearPrefilled?: () => void;
}

export default function UserDashboard({
  user,
  token,
  onLogout,
  onUpdateUser,
  defaultTab,
  onTabChange,
  prefilledAmount,
  prefilledTerm,
  onClearPrefilled,
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'apply' | 'loans' | 'kyc' | 'messages' | 'support' | 'settings'>(defaultTab || 'overview');

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabChange = (tab: 'overview' | 'apply' | 'loans' | 'kyc' | 'messages' | 'support' | 'settings') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  
  // Dynamic App State
  const [loans, setLoans] = React.useState<LoanApplication[]>([]);
  const [kycStatus, setKycStatus] = React.useState<KYC | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [unreadMsgCount, setUnreadMsgCount] = React.useState(0);
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = React.useState<NotificationType[]>([]);

  // Collateral payment form state
  const [payingCollateralLoan, setPayingCollateralLoan] = React.useState<LoanApplication | null>(null);
  const [collateralTxIdInput, setCollateralTxIdInput] = React.useState('');
  const [collateralPaymentMethod, setCollateralPaymentMethod] = React.useState<'Crypto' | 'Wire'>('Crypto');

  // Form Loading States
  const [loadingLoans, setLoadingLoans] = React.useState(false);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [loadingTickets, setLoadingTickets] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  // Loan Wizard Form State
  const [wizardStep, setWizardStep] = React.useState(1);
  const [loanPersonal, setLoanPersonal] = React.useState({ dob: '', marital: 'Single', address: '' });
  const [loanEmployment, setLoanEmployment] = React.useState({ status: 'Employed', employer: '', income: '', years: '' });
  const [loanBusiness, setLoanBusiness] = React.useState({ name: '', regNumber: '', industry: '', revenue: '' });
  const [loanFunding, setLoanFunding] = React.useState({ purpose: 'Business Scaling', amount: '', preference: 'Monthly structured / 24 months', description: '' });
  
  // Sync prefilled loan parameters from separate calculator page
  React.useEffect(() => {
    if (prefilledAmount !== undefined || prefilledTerm !== undefined) {
      setLoanFunding(prev => ({
        ...prev,
        amount: prefilledAmount !== undefined ? prefilledAmount.toString() : prev.amount,
        preference: prefilledTerm !== undefined ? `Monthly structured / ${prefilledTerm} months` : prev.preference
      }));
    }
  }, [prefilledAmount, prefilledTerm]);

  const [loanFinancial, setLoanFinancial] = React.useState({ debts: '', creditScore: '750', assetsValue: '' });
  const [uploadedLoanDocs, setUploadedLoanDocs] = React.useState<{ name: string; type: string; url: string }[]>([]);

  // KYC Upload form State
  const [kycIdCard, setKycIdCard] = React.useState('passport_digital.png');
  const [kycSelfie, setKycSelfie] = React.useState('verification_selfie_latest.png');
  const [kycAddress, setKycAddress] = React.useState('utility_bill_copy.pdf');
  const [kycBusiness, setKycBusiness] = React.useState('certificate_of_good_standing.pdf');

  // Messaging States
  const [newMsgContent, setNewMsgContent] = React.useState('');
  const [msgAttachment, setMsgAttachment] = React.useState<{ name: string; url: string } | null>(null);

  // Ticket Form States
  const [ticketSubject, setTicketSubject] = React.useState('');
  const [ticketCategory, setTicketCategory] = React.useState('General Inquiry');
  const [ticketMsg, setTicketMsg] = React.useState('');
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
  const [ticketReply, setTicketReply] = React.useState('');

  // Settings State
  const [profilePhone, setProfilePhone] = React.useState(user.phone);
  const [profileCountry, setProfileCountry] = React.useState(user.country);
  const [currentPwd, setCurrentPwd] = React.useState('');
  const [newPwd, setNewPwd] = React.useState('');
  const [notifPref, setNotifPref] = React.useState(user.notificationPreferences || {
    emailUpdates: true,
    applicationAlerts: true,
    securityAlerts: true
  });

  // Fetch all user state elements
  const fetchAllData = React.useCallback(async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch loans
      const resLoans = await fetch('/api/loans/list', { headers });
      if (resLoans.ok) setLoans(await resLoans.json());

      // Fetch kyc
      const resKyc = await fetch('/api/kyc/status', { headers });
      if (resKyc.ok) setKycStatus(await resKyc.json());

      // Fetch messages
      const resMsg = await fetch('/api/messages', { headers });
      if (resMsg.ok) setMessages(await resMsg.json());

      // Fetch unread messages
      const resUnread = await fetch('/api/messages/unread', { headers });
      if (resUnread.ok) {
        const d = await resUnread.json();
        setUnreadMsgCount(d.unreadCount);
      }

      // Fetch tickets
      const resTkt = await fetch('/api/support/tickets', { headers });
      if (resTkt.ok) setTickets(await resTkt.json());

      // Fetch notifications
      const resNotif = await fetch('/api/notifications', { headers });
      if (resNotif.ok) setNotifications(await resNotif.json());

    } catch (err) {
      console.error('Error fetching dashboard info', err);
    }
  }, [token]);

  React.useEffect(() => {
    fetchAllData();
    // Simple poll loop every 5 seconds for live messaging/updates
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const triggerAlert = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // 1. Submit Loan Application Wizard
  const handleLoanSubmit = async () => {
    setErrorMsg('');
    setActionLoading(true);

    try {
      const payload = {
        personalInfo: {
          dateOfBirth: loanPersonal.dob,
          maritalStatus: loanPersonal.marital,
          address: loanPersonal.address
        },
        employmentInfo: {
          status: loanEmployment.status,
          employerName: loanEmployment.employer,
          monthlyIncome: Number(loanEmployment.income) || 0,
          yearsEmployed: Number(loanEmployment.years) || 0
        },
        businessInfo: loanBusiness.name ? {
          companyName: loanBusiness.name,
          registrationNumber: loanBusiness.regNumber,
          industry: loanBusiness.industry,
          annualRevenue: Number(loanBusiness.revenue) || 0
        } : undefined,
        fundingDetails: {
          purpose: loanFunding.purpose,
          requestedAmount: Number(loanFunding.amount),
          repaymentPreference: loanFunding.preference,
          description: loanFunding.description
        },
        financialInfo: {
          existingDebts: Number(loanFinancial.debts) || 0,
          creditScore: Number(loanFinancial.creditScore) || 750,
          assetsValue: Number(loanFinancial.assetsValue) || 0
        },
        documents: uploadedLoanDocs
      };

      const res = await fetch('/api/loans/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit loan application.');

      triggerAlert('success', `Funding Application ${data.application.id} submitted securely.`);
      setLoans(prev => [data.application, ...prev]);
      
      // Clear prefilled state from calculator
      onClearPrefilled?.();
      
      // Reset wizard
      setWizardStep(1);
      setLoanPersonal({ dob: '', marital: 'Single', address: '' });
      setLoanEmployment({ status: 'Employed', employer: '', income: '', years: '' });
      setLoanBusiness({ name: '', regNumber: '', industry: '', revenue: '' });
      setLoanFunding({ purpose: 'Business Scaling', amount: '', preference: 'Monthly structured / 24 months', description: '' });
      setLoanFinancial({ debts: '', creditScore: '750', assetsValue: '' });
      setUploadedLoanDocs([]);
      
      handleTabChange('loans');
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Submit KYC Form
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idCardUrl: kycIdCard,
          selfieUrl: kycSelfie,
          addressProofUrl: kycAddress,
          businessDocUrl: kycBusiness
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'KYC submission failed.');

      triggerAlert('success', 'KYC identity files submitted successfully for review.');
      setKycStatus(data.kyc);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgContent.trim()) return;

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMsgContent,
          attachment: msgAttachment || undefined
        })
      });

      if (!res.ok) throw new Error('Message transit failure.');

      const sentMsg = await res.json();
      setMessages(prev => [...prev, sentMsg]);
      setNewMsgContent('');
      setMsgAttachment(null);
    } catch (err: any) {
      triggerAlert('error', err.message);
    }
  };

  // 4. Create Support Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/support/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: ticketSubject,
          category: ticketCategory,
          message: ticketMsg
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ticket creation error.');

      triggerAlert('success', `Support ticket ${data.ticket.id} registered.`);
      setTickets(prev => [data.ticket, ...prev]);
      setTicketSubject('');
      setTicketMsg('');
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Reply to Support Ticket
  const handleTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReply.trim() || !selectedTicketId) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/support/tickets/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticketId: selectedTicketId,
          content: ticketReply
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply.');

      setTickets(prev => prev.map(t => t.id === selectedTicketId ? data.ticket : t));
      setTicketReply('');
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Update Profile settings
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: profilePhone,
          country: profileCountry,
          notificationPreferences: notifPref
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');

      triggerAlert('success', 'Profile security preferences updated.');
      onUpdateUser(data.user);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/user/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed.');

      triggerAlert('success', 'Account security password updated.');
      setCurrentPwd('');
      setNewPwd('');
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayCollateral = async (loanId: string) => {
    if (!collateralTxIdInput.trim()) {
      triggerAlert('error', 'Please enter a valid transaction reference.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/loans/pay-collateral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          loanId,
          txId: collateralTxIdInput,
          paymentMethod: collateralPaymentMethod
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Collateral payment failed.');

      triggerAlert('success', 'Collateral deposit processed successfully. Liquidity has been disbursed!');
      setPayingCollateralLoan(null);
      setCollateralTxIdInput('');
      await fetchAllData();
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Read notifications helper
  const markNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="user-dashboard-root">
      
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

      {/* Dashboard Top Frame */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={user.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80"} 
            alt={user.name} 
            className="h-16 w-16 rounded-xl border border-white/10 object-cover shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-wide">{user.name}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="font-mono text-[10px] text-gray-500 tracking-wider">SECURE ID: {user.id}</span>
              <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase ${
                kycStatus?.status === 'Approved' ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-400' : 'bg-yellow-950/40 border border-yellow-500/20 text-yellow-500'
              }`}>
                KYC: {kycStatus?.status || 'NOT SUBMITTED'}
              </span>
            </div>
          </div>
        </div>

        {/* Global CTA */}
        <div className="flex gap-4">
          <button
            onClick={() => { handleTabChange('apply'); setWizardStep(1); }}
            className="px-5 py-2.5 text-xs font-semibold text-black bg-white rounded-lg hover:bg-cyan-400 transition-all duration-300 flex items-center gap-2 shadow-sm cursor-pointer"
            id="btn-dash-apply-funding"
          >
            <Plus className="h-4 w-4" /> Apply for Funding
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 text-xs text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-lg transition-all"
            id="btn-dash-logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-1 space-y-2" id="dash-sidebar">
          <button
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'overview' ? 'bg-white/5 text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Activity className="h-4 w-4" /> Overview & Logs
          </button>

          <button
            onClick={() => handleTabChange('loans')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'loans' ? 'bg-white/5 text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <span className="flex items-center gap-3"><FileText className="h-4 w-4" /> Loan Applications</span>
            {loans.length > 0 && <span className="bg-white/10 text-white font-mono text-[10px] px-2 py-0.5 rounded-full">{loans.length}</span>}
          </button>

          <button
            onClick={() => handleTabChange('kyc')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'kyc' ? 'bg-white/5 text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Document KYC
          </button>

          <button
            onClick={() => handleTabChange('messages')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'messages' ? 'bg-white/5 text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <span className="flex items-center gap-3"><MessageSquare className="h-4 w-4" /> Message Desk</span>
            {unreadMsgCount > 0 && <span className="bg-cyan-500 text-black font-bold font-mono text-[10px] px-2 py-0.5 rounded-full">{unreadMsgCount}</span>}
          </button>

          <button
            onClick={() => handleTabChange('support')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'support' ? 'bg-white/5 text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <span className="flex items-center gap-3"><HelpCircle className="h-4 w-4" /> Support Center</span>
            {tickets.length > 0 && <span className="bg-white/10 text-white font-mono text-[10px] px-2 py-0.5 rounded-full">{tickets.length}</span>}
          </button>

          <button
            onClick={() => { handleTabChange('settings'); markNotificationsRead(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'settings' ? 'bg-white/5 text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Settings className="h-4 w-4" /> Account Settings
          </button>
        </div>

        {/* WORKSPACE AREA */}
        <div className="lg:col-span-3 bg-white/[0.01] border border-white/5 rounded-2xl p-8 backdrop-blur-md shadow-2xl min-h-[500px]" id="dash-workspace">
          
          {/* ---------------- 1. OVERVIEW & LOGS ---------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-8" id="view-overview">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Borrower Console</h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">Secured operational dashboard for active loans, compliance records, and messaging audit channels.</p>
              </div>

              {/* Status Board */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1">KYC Registry Status</span>
                    <h4 className="text-lg font-bold text-white">{kycStatus?.status || 'Unregistered'}</h4>
                    <p className="text-[11px] text-gray-500 mt-2">{kycStatus?.remarks || 'Please upload documents to begin authorization.'}</p>
                  </div>
                  <ShieldCheck className={`h-12 w-12 ${kycStatus?.status === 'Approved' ? 'text-cyan-400' : 'text-gray-700'}`} />
                </div>

                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1">Active Loan Records</span>
                    <h4 className="text-lg font-bold text-white">
                      {loans.filter(l => l.status === 'Approved').length} Approved / {loans.filter(l => l.status === 'Pending').length} Pending
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-2">Capital dispatch requires approved KYC credentials.</p>
                  </div>
                  <CreditCard className="h-12 w-12 text-gray-700" />
                </div>
              </div>

              {/* Activity History Log */}
              <div>
                <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-wider border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Activity History Logs
                </h4>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2" id="activity-logs">
                  {user.activityHistory && user.activityHistory.length > 0 ? (
                    user.activityHistory.map((log) => (
                      <div key={log.id} className="flex justify-between items-start text-xs border-b border-white/5 pb-3">
                        <div className="space-y-1">
                          <p className="text-gray-300 font-medium">{log.action}</p>
                          <p className="text-[10px] text-gray-500 font-mono">IP address: {log.ipAddress}</p>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No activity registered yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- 2. LOAN APPLICATIONS ---------------- */}
          {activeTab === 'loans' && (
            <div className="space-y-6" id="view-loans">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-1">Credit & Funding Proposals</h3>
                  <p className="text-xs text-gray-400">Review status logs of active and historic liquidity proposals.</p>
                </div>
                <button
                  onClick={() => { setActiveTab('apply'); setWizardStep(1); }}
                  className="px-4 py-2 text-xs font-medium text-black bg-white hover:bg-cyan-400 rounded-lg transition-all"
                  id="btn-loans-new-app"
                >
                  New Application
                </button>
              </div>

              {loans.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-xl" id="loans-empty-state">
                  <FilePlus className="h-10 w-10 text-gray-600 mx-auto mb-4" />
                  <p className="text-sm text-gray-400 font-light mb-4">You have not submitted any credit applications.</p>
                  <button
                    onClick={() => setActiveTab('apply')}
                    className="px-5 py-2.5 text-xs text-black bg-white rounded-lg hover:bg-cyan-400 font-semibold"
                  >
                    Initiate First Application
                  </button>
                </div>
              ) : (
                <div className="space-y-6" id="loans-list">
                  {loans.map((loan) => (
                    <div 
                      key={loan.id}
                      className="border border-white/5 bg-white/[0.005] hover:bg-white/[0.01] rounded-xl p-6 transition-all"
                      id={`loan-item-${loan.id}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                          <span className="font-mono text-[10px] text-gray-500">REF ID: {loan.id}</span>
                          <h4 className="font-display text-lg font-bold text-white mt-1">
                            ${loan.fundingDetails.requestedAmount.toLocaleString()}{' '}
                            <span className="text-xs text-gray-400 font-sans font-light">for {loan.fundingDetails.purpose}</span>
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {loan.requiresEnhancedVerification && (
                            <span className="px-2.5 py-1 bg-yellow-950/40 border border-yellow-500/20 text-yellow-500 font-mono text-[9px] font-bold rounded-full flex items-center gap-1 uppercase">
                              <AlertTriangle className="h-3 w-3" /> Enhanced Audit Req
                            </span>
                          )}
                          <span className={`px-3 py-1 font-mono text-xs font-bold rounded-full border uppercase ${
                            loan.status === 'Approved' ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400' :
                            loan.status === 'Declined' ? 'bg-red-950/40 border-red-500/20 text-red-500' :
                            loan.status === 'Under Review' ? 'bg-blue-950/40 border-blue-500/20 text-blue-400' :
                            'bg-yellow-950/40 border-yellow-500/20 text-yellow-500'
                          }`}>
                            {loan.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-white/5 text-xs font-light">
                        <div>
                          <span className="block text-[10px] text-gray-500 uppercase font-mono mb-0.5">Repayment Method</span>
                          <span className="text-gray-300 font-medium">{loan.fundingDetails.repaymentPreference}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-500 uppercase font-mono mb-0.5">Applicant Entity</span>
                          <span className="text-gray-300 font-medium">{loan.businessInfo?.companyName || "Personal Enterprise"}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-500 uppercase font-mono mb-0.5">Credit Score</span>
                          <span className="text-gray-300 font-medium font-mono">{loan.financialInfo.creditScore || "Not Scored"}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-500 uppercase font-mono mb-0.5">Submission Date</span>
                          <span className="text-gray-300 font-medium font-mono">{new Date(loan.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 font-light leading-relaxed mt-4">
                        <span className="text-white font-medium">Description:</span> {loan.fundingDetails.description}
                      </p>

                      {loan.status === 'Approved' && (
                        <>
                           {!loan.collateralPaid ? (
                            <div className="mt-5 p-5 bg-yellow-950/20 border border-yellow-500/20 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="space-y-1">
                                <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                                  <AlertTriangle className="h-4 w-4" /> 15% Refundable Collateral Deposit Required
                                </h5>
                                <p className="text-[11px] text-gray-400 font-light">
                                  Your compliance status is verified. Transmit the refundable collateral fee of <span className="text-white font-mono font-bold">${(loan.fundingDetails.requestedAmount * 0.15).toLocaleString()}</span> (15% of the requested amount) to initiate instant disbursement.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setPayingCollateralLoan(loan);
                                  setCollateralTxIdInput('');
                                }}
                                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg transition-all shrink-0 cursor-pointer"
                              >
                                Pay Collateral
                              </button>
                            </div>
                          ) : (
                            <div className="mt-5 p-5 bg-cyan-950/20 border border-cyan-500/20 rounded-xl">
                              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1">
                                <Check className="h-4 w-4" /> Institutional Funding Disbursed
                              </h5>
                              <p className="text-[11px] text-gray-400 font-light mb-2">
                                Refundable collateral deposit of <span className="text-cyan-400 font-mono font-bold">${(loan.fundingDetails.requestedAmount * 0.15).toLocaleString()}</span> has been confirmed. Capital has been wired to your designated account.
                              </p>
                              <div className="flex flex-col sm:flex-row gap-4 text-[10px] font-mono text-gray-500">
                                <span>TRANSACTION ID: <span className="text-gray-300">{loan.collateralTxId}</span></span>
                                <span className="hidden sm:inline">•</span>
                                <span>CLEARING TIME: <span className="text-gray-300">{loan.disbursedAt ? new Date(loan.disbursedAt).toLocaleString() : 'N/A'}</span></span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------------- 3. APPLY FOR FUNDING (WIZARD) ---------------- */}
          {activeTab === 'apply' && (
            <div className="max-w-3xl mx-auto py-12 space-y-12" id="view-apply-wizard">
              {/* Modern Minimal Progress Indicator */}
              <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                <span>Step {wizardStep} of 8</span>
                <span className="w-12 h-px bg-white/10" />
                <span className="text-cyan-400">{Math.round((wizardStep / 8) * 100)}% Complete</span>
              </div>

              {/* Progress Track line */}
              <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${(wizardStep / 8) * 100}%` }}
                />
              </div>

              {/* STEP 1: DATE OF BIRTH */}
              {wizardStep === 1 && (
                <div className="space-y-6 animate-fade-in" id="step-dob">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                    What is your date of birth?
                  </h3>
                  <div className="border-b border-white/10 focus-within:border-cyan-400 transition-colors py-2">
                    <input 
                      type="date" 
                      required
                      value={loanPersonal.dob}
                      onChange={(e) => setLoanPersonal({ ...loanPersonal, dob: e.target.value })}
                      className="w-full bg-transparent text-xl sm:text-2xl font-light text-white focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Required for regulatory verification compliance.</p>
                </div>
              )}

              {/* STEP 2: MARITAL STATUS */}
              {wizardStep === 2 && (
                <div className="space-y-6 animate-fade-in" id="step-marital">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                    What is your marital status?
                  </h3>
                  <div className="border-b border-white/10 focus-within:border-cyan-400 transition-colors py-2">
                    <select
                      value={loanPersonal.marital}
                      onChange={(e) => setLoanPersonal({ ...loanPersonal, marital: e.target.value })}
                      className="w-full bg-transparent text-xl sm:text-2xl font-light text-white focus:outline-none cursor-pointer"
                    >
                      <option className="bg-black text-white">Single</option>
                      <option className="bg-black text-white">Married</option>
                      <option className="bg-black text-white">Divorced</option>
                      <option className="bg-black text-white">Widowed</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3: RESIDENCY */}
              {wizardStep === 3 && (
                <div className="space-y-6 animate-fade-in" id="step-address">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                    Where is your primary residence?
                  </h3>
                  <div className="border-b border-white/10 focus-within:border-cyan-400 transition-colors py-2">
                    <input 
                      type="text" 
                      required
                      value={loanPersonal.address}
                      onChange={(e) => setLoanPersonal({ ...loanPersonal, address: e.target.value })}
                      className="w-full bg-transparent text-xl sm:text-2xl font-light text-white placeholder-gray-700 focus:outline-none"
                      placeholder="Enter legal residential address"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: EMPLOYMENT STATUS */}
              {wizardStep === 4 && (
                <div className="space-y-6 animate-fade-in" id="step-employment-status">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                    What is your current professional status?
                  </h3>
                  <div className="border-b border-white/10 focus-within:border-cyan-400 transition-colors py-2">
                    <select
                      value={loanEmployment.status}
                      onChange={(e) => setLoanEmployment({ ...loanEmployment, status: e.target.value })}
                      className="w-full bg-transparent text-xl sm:text-2xl font-light text-white focus:outline-none cursor-pointer"
                    >
                      <option className="bg-black text-white">Employed</option>
                      <option className="bg-black text-white">Self-Employed</option>
                      <option className="bg-black text-white">Unemployed</option>
                      <option className="bg-black text-white">Retired</option>
                      <option className="bg-black text-white">Student</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 5: MONTHLY INCOME */}
              {wizardStep === 5 && (
                <div className="space-y-6 animate-fade-in" id="step-income">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                    What is your estimated monthly income?
                  </h3>
                  <div className="flex items-center gap-4 border-b border-white/10 focus-within:border-cyan-400 transition-colors py-2">
                    <span className="text-xl sm:text-2xl text-gray-600 font-light">$</span>
                    <input 
                      type="number" 
                      required
                      value={loanEmployment.income}
                      onChange={(e) => setLoanEmployment({ ...loanEmployment, income: e.target.value })}
                      className="w-full bg-transparent text-xl sm:text-2xl font-light text-white placeholder-gray-800 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: REQUESTED LIQUIDITY */}
              {wizardStep === 6 && (
                <div className="space-y-6 animate-fade-in" id="step-liquidity-amount">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                    How much capital liquidity do you require?
                  </h3>
                  <div className="flex items-center gap-4 border-b border-white/10 focus-within:border-cyan-400 transition-colors py-2">
                    <span className="text-xl sm:text-2xl text-gray-600 font-light">$</span>
                    <input 
                      type="number" 
                      required
                      min={1000}
                      max={500000000}
                      value={loanFunding.amount}
                      onChange={(e) => setLoanFunding({ ...loanFunding, amount: e.target.value })}
                      className="w-full bg-transparent text-xl sm:text-2xl font-light text-white placeholder-gray-800 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    Flexible institutional lines are engineered for requests between $1,000 and $500,000,000.
                  </p>
                </div>
              )}

              {/* STEP 7: PURPOSE */}
              {wizardStep === 7 && (
                <div className="space-y-6 animate-fade-in" id="step-purpose">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                    What is the primary purpose of this funding?
                  </h3>
                  <div className="border-b border-white/10 focus-within:border-cyan-400 transition-colors py-2">
                    <select
                      value={loanFunding.purpose}
                      onChange={(e) => setLoanFunding({ ...loanFunding, purpose: e.target.value })}
                      className="w-full bg-transparent text-xl sm:text-2xl font-light text-white focus:outline-none cursor-pointer"
                    >
                      <option className="bg-black text-white">Business Funding</option>
                      <option className="bg-black text-white">Startup Funding</option>
                      <option className="bg-black text-white">SME Expansion</option>
                      <option className="bg-black text-white">Entrepreneur Growth</option>
                      <option className="bg-black text-white">Web3 Development Funding</option>
                      <option className="bg-black text-white">Cryptocurrency Business Funding</option>
                      <option className="bg-black text-white">Forex Business Funding</option>
                      <option className="bg-black text-white">Investment Project Funding</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 8: DOCUMENT MEMO */}
              {wizardStep === 8 && (
                <div className="space-y-6 animate-fade-in" id="step-docs">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                    Attach supporting business document
                  </h3>
                  
                  <div className="border border-dashed border-white/10 rounded-xl p-10 text-center bg-white/[0.01] hover:border-cyan-400/30 transition-all cursor-pointer">
                    <UploadCloud className="h-10 w-10 text-cyan-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-300 font-medium">Drag & drop or select files to transmit</p>
                    <p className="text-[10px] text-gray-600 mt-1 font-mono uppercase tracking-wider">Secure AES-256 encrypted uplink</p>
                    
                    <button
                      type="button"
                      onClick={() => setUploadedLoanDocs([{ name: 'corporate_capitalization_audit.pdf', type: 'Financial Memo', url: '#', uploadedAt: new Date().toISOString() }])}
                      className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-[10px] text-gray-400 font-mono uppercase tracking-widest transition"
                    >
                      Pre-populate compliance document
                    </button>
                  </div>

                  {uploadedLoanDocs.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Enclosed Files</span>
                      {uploadedLoanDocs.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-lg text-xs font-mono text-gray-400">
                          <span>{doc.name} • {doc.type}</span>
                          <span className="text-cyan-400 uppercase text-[9px] flex items-center gap-1">
                            <Check className="h-3 w-3" /> Encrypted
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wizard Nav Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-10" id="wizard-nav">
                <button
                  type="button"
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="w-full sm:w-auto px-8 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:text-gray-500 cursor-pointer"
                >
                  Back
                </button>

                {wizardStep < 8 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(prev => prev + 1)}
                    className="relative group rounded-xl bg-gray-300 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer w-full sm:w-auto"
                  >
                    <span className="absolute inset-0 rounded-xl bg-gray-400 translate-y-1 block"></span>
                    <span className="relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black text-xs font-extrabold uppercase tracking-widest -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 font-display">
                      Continue
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleLoanSubmit}
                    className="relative group rounded-xl bg-cyan-700/80 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer w-full sm:w-auto"
                  >
                    <span className="absolute inset-0 rounded-xl bg-cyan-800 translate-y-1 block"></span>
                    <span className="relative flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-widest -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 font-display">
                      {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Submit Application"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ---------------- 4. KYC DOCUMENT CENTER ---------------- */}
          {activeTab === 'kyc' && (
            <div className="space-y-8" id="view-kyc">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Compliance Document Center</h3>
                <p className="text-xs text-gray-400">Manage identity records to unlock platform liquidity parameters.</p>
              </div>

              {/* Status Header */}
              <div className="p-6 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Security Audit Status</span>
                  <h4 className="text-xl font-bold text-white mt-1">
                    {kycStatus?.status === 'Approved' ? 'Institutional Clearance Active' :
                     kycStatus?.status === 'Pending' ? 'Identity Verification In Queue' :
                     kycStatus?.status === 'Rejected' ? 'Application Refused / Re-upload Required' :
                     'Pending Compliance Upload'}
                  </h4>
                  {kycStatus?.remarks && (
                    <p className="text-xs text-red-400 font-mono mt-3">Compliance Officer Remarks: {kycStatus.remarks}</p>
                  )}
                </div>
                <span className={`px-4 py-1.5 font-mono text-xs font-bold rounded-full border uppercase ${
                  kycStatus?.status === 'Approved' ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400' :
                  kycStatus?.status === 'Pending' ? 'bg-yellow-950/40 border-yellow-500/20 text-yellow-500' :
                  kycStatus?.status === 'Rejected' ? 'bg-red-950/40 border-red-500/20 text-red-500' :
                  'bg-white/5 border-white/10 text-gray-400'
                }`}>
                  {kycStatus?.status || 'NOT SUBMITTED'}
                </span>
              </div>

              {/* Upload Panel */}
              {(kycStatus === null || kycStatus?.status === 'Rejected' || kycStatus?.status === 'Pending_Upload') && (
                <form onSubmit={handleKycSubmit} className="space-y-6" id="form-kyc-upload">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Government Issued ID card</label>
                      <input 
                        type="text" 
                        required
                        value={kycIdCard}
                        onChange={(e) => setKycIdCard(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-sm text-white focus:outline-none"
                        placeholder="e.g. passport_scan.png"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Verification Selfie</label>
                      <input 
                        type="text" 
                        required
                        value={kycSelfie}
                        onChange={(e) => setKycSelfie(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-sm text-white focus:outline-none"
                        placeholder="e.g. selfie_live.png"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Proof of Residence (Optional)</label>
                      <input 
                        type="text" 
                        value={kycAddress}
                        onChange={(e) => setKycAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-sm text-white focus:outline-none"
                        placeholder="e.g. utility_bill.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Business Registry Memo (Optional)</label>
                      <input 
                        type="text" 
                        value={kycBusiness}
                        onChange={(e) => setKycBusiness(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-sm text-white focus:outline-none"
                        placeholder="e.g. registration_cert.pdf"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-4 text-sm font-semibold text-black bg-white rounded-xl hover:bg-cyan-400 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Transmit Compliance Documents"}
                  </button>
                </form>
              )}

              {kycStatus?.status === 'Pending' && (
                <div className="p-8 border border-white/5 rounded-xl text-center text-gray-400" id="kyc-pending-state">
                  <RefreshCw className="h-10 w-10 text-cyan-400 mx-auto animate-spin mb-4" />
                  <h4 className="font-display text-base font-medium text-white mb-2">KYC Under Audit Queue</h4>
                  <p className="text-xs font-light max-w-sm mx-auto">Compliance teams are validating your photocard and company certificates against European databases. Typical queue timeline: 2 hours.</p>
                </div>
              )}

              {kycStatus?.status === 'Approved' && (
                <div className="p-8 border border-cyan-500/20 bg-cyan-950/10 rounded-xl text-center text-cyan-400" id="kyc-approved-state">
                  <ShieldCheck className="h-10 w-10 mx-auto mb-4" />
                  <h4 className="font-display text-base font-bold text-white mb-2">Compliance Vault Fully Verified</h4>
                  <p className="text-xs font-light text-gray-400 max-w-md mx-auto">All identity verification points are unlocked. Your account holds active institutional clearance allowing capital drawdowns up to $500,000,000.</p>
                </div>
              )}
            </div>
          )}

          {/* ---------------- 5. MESSAGES DESK ---------------- */}
          {activeTab === 'messages' && (
            <div className="space-y-6 flex flex-col justify-between h-[520px]" id="view-messages">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-xl font-bold text-white mb-1">Administrative Message Desk</h3>
                <p className="text-xs text-gray-400">Direct encrypted communications with the compliance and financial officer desks.</p>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 py-4 max-h-[340px]" id="chat-thread">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 text-xs">
                    No active messages in thread. Start communication below.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderId === 'admin-1';
                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                        id={`chat-msg-${msg.id}`}
                      >
                        <span className="font-mono text-[9px] text-gray-500 mb-1">{msg.senderName}</span>
                        <div className={`p-4 rounded-xl text-xs max-w-sm leading-relaxed ${
                          isAdmin 
                            ? 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none' 
                            : 'bg-cyan-500 text-black font-medium rounded-tr-none shadow-md'
                        }`}>
                          {msg.content}
                          {msg.attachment && (
                            <div className="mt-2 pt-2 border-t border-black/10 text-[10px] font-mono flex items-center gap-1.5 opacity-80">
                              <span>📎 Attachment: {msg.attachment.name}</span>
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-[8px] text-gray-600 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Send */}
              <form onSubmit={handleSendMessage} className="border-t border-white/5 pt-4" id="form-chat-send">
                {msgAttachment && (
                  <div className="mb-2 p-2 bg-white/5 rounded-lg flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-400">📎 Attached: {msgAttachment.name}</span>
                    <button type="button" onClick={() => setMsgAttachment(null)} className="text-red-400 hover:underline">Remove</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMsgAttachment({ name: 'treasury_balance_sheet.pdf', url: '#' })}
                    className="px-3 bg-white/5 border border-white/5 text-xs text-gray-400 hover:text-white rounded-xl"
                    title="Add attachment"
                  >
                    📎
                  </button>
                  <input 
                    type="text" 
                    required
                    value={newMsgContent}
                    onChange={(e) => setNewMsgContent(e.target.value)}
                    className="flex-1 px-4 py-3 bg-black border border-white/5 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
                    placeholder="Type encrypted message..."
                  />
                  <button
                    type="submit"
                    className="px-5 bg-white text-black hover:bg-cyan-400 rounded-xl transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---------------- 6. SUPPORT CENTER ---------------- */}
          {activeTab === 'support' && (
            <div className="space-y-8" id="view-support">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display text-xl font-bold text-white mb-1">Help Desk & Support Center</h3>
                <p className="text-xs text-gray-400">Initiate service tickets or consult platform documentation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Submit New Ticket */}
                <div className="md:col-span-1 space-y-4">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Submit Ticket</h4>
                  <form onSubmit={handleCreateTicket} className="space-y-4" id="form-ticket-create">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Subject</label>
                      <input 
                        type="text" 
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="w-full px-3 py-2.5 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                        placeholder="e.g. Collateral collateral query"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                      >
                        <option>General Inquiry</option>
                        <option>Funding Terms</option>
                        <option>KYC Compliance</option>
                        <option>Security / Passwords</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Message</label>
                      <textarea 
                        required
                        rows={3}
                        value={ticketMsg}
                        onChange={(e) => setTicketMsg(e.target.value)}
                        className="w-full px-3 py-2.5 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none resize-none"
                        placeholder="Describe your inquiry..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-2.5 text-xs font-semibold text-black bg-white hover:bg-cyan-400 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Submit Support Ticket
                    </button>
                  </form>
                </div>

                {/* Tickets Thread Area */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Active Tickets</h4>
                  
                  {tickets.length === 0 ? (
                    <div className="text-center py-12 text-xs text-gray-500">
                      No active tickets registered.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2" id="tickets-list">
                      {tickets.map((t) => (
                        <div 
                          key={t.id} 
                          onClick={() => setSelectedTicketId(t.id)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            selectedTicketId === t.id ? 'border-cyan-500/30 bg-white/[0.015]' : 'border-white/5 hover:bg-white/[0.005]'
                          }`}
                          id={`ticket-item-${t.id}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-[10px] text-gray-500">{t.id} • {t.category}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border ${
                              t.status === 'Open' ? 'bg-green-950/40 border-green-500/20 text-green-400' : 'bg-yellow-950/40 border-yellow-500/20 text-yellow-500'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <h5 className="font-display text-sm font-semibold text-white mb-1">{t.subject}</h5>
                          <span className="text-[10px] text-gray-500 font-mono">Replies: {t.replies.length} • Updated: {new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Selected Ticket Reply dialogue */}
              {activeTicket && (
                <div className="border-t border-white/5 pt-6 space-y-4" id="ticket-thread-box">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h4 className="text-sm font-semibold text-white">Ticket Dialog: {activeTicket.subject}</h4>
                    <button onClick={() => setSelectedTicketId(null)} className="text-xs text-gray-500 hover:text-white">Close Dialogue</button>
                  </div>

                  <div className="space-y-3 max-h-40 overflow-y-auto" id="ticket-replies">
                    {activeTicket.replies.map((reply, i) => (
                      <div key={reply.id || i} className={`p-3 rounded-lg text-xs leading-relaxed ${
                        reply.senderRole === 'admin' ? 'bg-cyan-950/20 border border-cyan-500/10 text-cyan-300' : 'bg-white/5 text-gray-300'
                      }`}>
                        <div className="flex justify-between items-center mb-1 text-[9px] font-mono text-gray-500">
                          <span>{reply.senderName} ({reply.senderRole.toUpperCase()})</span>
                          <span>{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{reply.content}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleTicketReply} className="flex gap-2" id="form-ticket-reply">
                    <input 
                      type="text" 
                      required
                      value={ticketReply}
                      onChange={(e) => setTicketReply(e.target.value)}
                      className="flex-1 px-3 py-2 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                      placeholder="Type response to operations desk..."
                    />
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 bg-white text-black hover:bg-cyan-400 text-xs font-semibold rounded-lg"
                    >
                      Reply
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ---------------- 7. SETTINGS AND NOTIFICATIONS ---------------- */}
          {activeTab === 'settings' && (
            <div className="space-y-8" id="view-settings">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Account & Notification Settings</h3>
                <p className="text-xs text-gray-400 font-light">Audit your security parameters and operational communication channels.</p>
              </div>

              {/* Dynamic Notification log list */}
              <div>
                <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Notification Center Logs</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2" id="notifications-list">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500">No active notifications.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-gray-500 block">{new Date(notif.createdAt).toLocaleString()}</span>
                          <h5 className="text-xs font-semibold text-white">{notif.title}</h5>
                          <p className="text-xs text-gray-400 leading-relaxed font-light">{notif.content}</p>
                        </div>
                        {!notif.isRead && (
                          <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full flex-shrink-0 animate-ping mt-1" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Edit Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Profile preferences */}
                <form onSubmit={handleUpdateProfile} className="space-y-4" id="form-profile-update">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Profile Details</h4>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Country Location</label>
                    <input 
                      type="text" 
                      required
                      value={profileCountry}
                      onChange={(e) => setProfileCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-[10px] font-mono text-gray-500 uppercase">Notification Preferences</label>
                    
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-white select-none">
                      <input 
                        type="checkbox"
                        checked={notifPref.emailUpdates}
                        onChange={(e) => setNotifPref({ ...notifPref, emailUpdates: e.target.checked })}
                        className="rounded border-white/10 bg-black text-cyan-500 focus:ring-0 h-4 w-4"
                      />
                      Transmit secure email newsletters
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-white select-none">
                      <input 
                        type="checkbox"
                        checked={notifPref.applicationAlerts}
                        onChange={(e) => setNotifPref({ ...notifPref, applicationAlerts: e.target.checked })}
                        className="rounded border-white/10 bg-black text-cyan-500 focus:ring-0 h-4 w-4"
                      />
                      Transmit credit application updates
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-cyan-400 transition-all"
                  >
                    Save Preferences
                  </button>
                </form>

                {/* Change password */}
                <form onSubmit={handleUpdatePassword} className="space-y-4" id="form-password-change">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Change Password</h4>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Current Password</label>
                    <input 
                      type="password" 
                      required
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">New Password</label>
                    <input 
                      type="password" 
                      required
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg hover:text-white transition-all border border-white/10"
                  >
                    Overhaul Credentials
                  </button>
                </form>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* ----------------- COLLATERAL PAYMENT MODAL ----------------- */}
      {payingCollateralLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
          <div className="relative w-full max-w-xl bg-neutral-950 border border-white/10 rounded-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-fade-in">
            <button
              onClick={() => setPayingCollateralLoan(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white font-mono text-sm uppercase transition-colors"
            >
              ✕ Close
            </button>

            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              SECURE CLEARING CONSOLE
            </span>
            <h3 className="font-display text-xl font-bold text-white tracking-wide uppercase mb-2">
              Refundable Collateral Settlement
            </h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed mb-6">
              To activate liquidity of <span className="text-white font-semibold">${payingCollateralLoan.fundingDetails.requestedAmount.toLocaleString()}</span>, compliance requires the settlement of a 15% refundable collateral deposit of <span className="text-cyan-400 font-mono font-bold">${(payingCollateralLoan.fundingDetails.requestedAmount * 0.15).toLocaleString()}</span>. This deposit is fully protected and refundable.
            </p>

            {/* Selector tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setCollateralPaymentMethod('Crypto')}
                className={`py-2 text-[11px] font-mono font-bold uppercase tracking-widest rounded-md transition-all ${
                  collateralPaymentMethod === 'Crypto'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                USDT / USDC (Instant)
              </button>
              <button
                type="button"
                onClick={() => setCollateralPaymentMethod('Wire')}
                className={`py-2 text-[11px] font-mono font-bold uppercase tracking-widest rounded-md transition-all ${
                  collateralPaymentMethod === 'Wire'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Bank Wire
              </button>
            </div>

            {/* Option Crypto instructions */}
            {collateralPaymentMethod === 'Crypto' ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-1">
                      Settlement Network
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      TRON Network (TRC-20) / Ethereum (ERC-20)
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-1">
                      Corporate Hot Wallet Address
                    </span>
                    <div className="flex items-center gap-2 bg-black px-3 py-2 rounded border border-white/5 font-mono text-[11px] text-cyan-400 overflow-x-auto select-all">
                      0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    Uplink Transaction Hash (TxID)
                  </label>
                  <input
                    type="text"
                    required
                    value={collateralTxIdInput}
                    onChange={(e) => setCollateralTxIdInput(e.target.value)}
                    placeholder="Enter 64-character transaction hash"
                    className="w-full px-4 py-3 bg-black border border-white/10 focus:border-cyan-500/50 rounded-xl text-xs text-white placeholder-gray-800 focus:outline-none font-mono"
                  />
                  <p className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">
                    Auto-audited against blockchain ledgers in real-time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500 uppercase font-mono text-[9px]">Bank Name</span>
                    <span className="col-span-2 text-gray-200">Union Bancaire Privée</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500 uppercase font-mono text-[9px]">City/Country</span>
                    <span className="col-span-2 text-gray-200">Geneva, Switzerland</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500 uppercase font-mono text-[9px]">IBAN CH</span>
                    <span className="col-span-2 text-cyan-400 font-mono">CH76 0024 0240 1234 5678 9</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500 uppercase font-mono text-[9px]">SWIFT / BIC</span>
                    <span className="col-span-2 text-gray-200 font-mono">UBPVCHGGXXX</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500 uppercase font-mono text-[9px]">Reference Memo</span>
                    <span className="col-span-2 text-yellow-400 font-mono uppercase font-bold">
                      COLLATERAL-{payingCollateralLoan.id}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    Bank Reference ID / Wire slip ID
                  </label>
                  <input
                    type="text"
                    required
                    value={collateralTxIdInput}
                    onChange={(e) => setCollateralTxIdInput(e.target.value)}
                    placeholder="Enter wire transfer validation code"
                    className="w-full px-4 py-3 bg-black border border-white/10 focus:border-cyan-500/50 rounded-xl text-xs text-white placeholder-gray-800 focus:outline-none font-mono"
                  />
                  <p className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">
                    Include the Reference Memo above on your wire receipt.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setPayingCollateralLoan(null)}
                className="w-full py-3.5 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-white border border-transparent hover:border-white/5 rounded-xl transition-all"
              >
                Cancel Settlement
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handlePayCollateral(payingCollateralLoan.id)}
                className="w-full py-3.5 text-xs font-bold uppercase tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 transition-all rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirm Deposit Transmission'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
