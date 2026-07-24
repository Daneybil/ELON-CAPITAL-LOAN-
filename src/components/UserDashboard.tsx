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
import { Calculator, History, Clock, ArrowRight, ArrowLeft, CheckCircle2, User as UserIcon } from 'lucide-react';
import CountrySelector from './CountrySelector';
import SearchableSelect from './SearchableSelect';

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
  const [kycIdCardBack, setKycIdCardBack] = React.useState('passport_digital_back.png');
  const [kycSelfie, setKycSelfie] = React.useState('verification_selfie_latest.png');
  const [kycAddress, setKycAddress] = React.useState('utility_bill_copy.pdf');
  const [kycBusiness, setKycBusiness] = React.useState('certificate_of_good_standing.pdf');

  // Enhanced KYC Flow State
  const [kycCountry, setKycCountry] = React.useState(user.country || 'United States');
  const [kycIdType, setKycIdType] = React.useState('National Identity Card');
  const [kycAddressText, setKycAddressText] = React.useState('');
  const [kycDeclaresAccuracy, setKycDeclaresAccuracy] = React.useState(false);
  const [kycSignature, setKycSignature] = React.useState('');
  const [isWebcamActive, setIsWebcamActive] = React.useState(false);
  const [webcamCountdown, setWebcamCountdown] = React.useState(0);

  // Redesigned Step-by-Step Compliance states
  const [kycWizardStep, setKycWizardStep] = React.useState(1);
  const [kycFullName, setKycFullName] = React.useState(user.name || '');
  const [kycDob, setKycDob] = React.useState('');
  const [kycPhone, setKycPhone] = React.useState(user.phone || '');
  const [kycEmail, setKycEmail] = React.useState(user.email || '');
  const [kycProofOfAddress, setKycProofOfAddress] = React.useState('proof_of_address_utility.png');
  const [kycEmploymentStatus, setKycEmploymentStatus] = React.useState('Employed');
  const [kycMaritalStatus, setKycMaritalStatus] = React.useState('Single');
  const [kycLoanPurpose, setKycLoanPurpose] = React.useState('Personal / Business Expansion');
  const [kycLoanDescription, setKycLoanDescription] = React.useState('');
  const [kycSocialHandles, setKycSocialHandles] = React.useState('');
  const [complianceSsn, setComplianceSsn] = React.useState('');
  const [isUsResident, setIsUsResident] = React.useState(true);
  const [socialPlatform, setSocialPlatform] = React.useState('Twitter / X');
  const [singleSocialHandle, setSingleSocialHandle] = React.useState('@johndoe_trader');
  const [twitterUsername, setTwitterUsername] = React.useState('');
  const [linkedinUsername, setLinkedinUsername] = React.useState('');
  const [tiktokUsername, setTiktokUsername] = React.useState('');
  const [facebookUsername, setFacebookUsername] = React.useState('');
  const [youtubeUsername, setYoutubeUsername] = React.useState('');
  const [kycVideoUrl, setKycVideoUrl] = React.useState('liveness_video_proof.mp4');
  const [isVideoRecording, setIsVideoRecording] = React.useState(false);
  const [videoCountdown, setVideoCountdown] = React.useState(0);
  const [kycBvn, setKycBvn] = React.useState('');

  // Manual File Upload Input Refs
  const idCardFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const idCardBackFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const proofOfAddressFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const businessDocFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const selfieFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = React.useRef<HTMLInputElement | null>(null);

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
  const [profilePhoto, setProfilePhoto] = React.useState(user.profilePhoto || '');
  const [currentPwd, setCurrentPwd] = React.useState('');
  const [newPwd, setNewPwd] = React.useState('');
  const [notifPref, setNotifPref] = React.useState(user.notificationPreferences || {
    emailUpdates: true,
    applicationAlerts: true,
    securityAlerts: true
  });

  // REDESIGN MODALS STATE
  const [isCalcOpen, setIsCalcOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [calcAmount, setCalcAmount] = React.useState(50000);
  const [calcMonths, setCalcMonths] = React.useState(24);

  // Live countdown ticker state
  const [countdownStr, setCountdownStr] = React.useState('23h 59m 59s');
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdownStr('Preparing final dispatch...');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownStr(`${hours}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Disbursement Flow local states for Crypto / Bank withdrawal options
  const [disbursementMethods, setDisbursementMethods] = React.useState<Record<string, 'Crypto' | 'Bank'>>({});
  const [disbursementInputs, setDisbursementInputs] = React.useState<Record<string, { cryptoAddress?: string, bankIban?: string, bankSwift?: string, bankName?: string }>>({});
  const [disbursementLocked, setDisbursementLocked] = React.useState<Record<string, boolean>>({});

  const handleSaveDisbursementMethod = (loanId: string, method: 'Crypto' | 'Bank') => {
    setDisbursementMethods(prev => ({ ...prev, [loanId]: method }));
  };

  const handleUpdateDisbursementInput = (loanId: string, field: string, value: string) => {
    setDisbursementInputs(prev => ({
      ...prev,
      [loanId]: {
        ...(prev[loanId] || {}),
        [field]: value
      }
    }));
  };

  const handleLockDestination = (loanId: string) => {
    setDisbursementLocked(prev => ({ ...prev, [loanId]: true }));
    triggerAlert('success', 'Disbursement destination coordinates locked & secured for routing release.');
  };

  // Demo auto-fill helper functions for easy testing
  const handleAutoFillPage1 = () => {
    setKycFullName("Johnathan Alexander Doe");
    setKycEmail(user.email || "john.doe@corporate.com");
    setKycPhone("+1 (555) 019-2834");
    setKycCountry("United States");

    setLoanPersonal({
      dob: "1988-06-15",
      marital: "Married",
      address: "742 Evergreen Terrace, Springfield, OR 97477"
    });
    setKycDob("1988-06-15");
    setKycMaritalStatus("Married");
    setKycAddressText("742 Evergreen Terrace, Springfield, OR 97477");

    setLoanEmployment({
      status: "Small Business Owner",
      employer: "Apex Trading Solutions LLC",
      income: "15000",
      years: "5"
    });
    setKycEmploymentStatus("Small Business Owner");

    setLoanFunding({
      purpose: "Business Expansion",
      amount: "100000",
      preference: "Monthly structured / 24 months",
      description: "Requesting capital facility to scale commercial operations, acquire high-performance infrastructure, and support inventory expansion."
    });
    setKycLoanPurpose("Business Expansion");
    setKycLoanDescription("Requesting capital facility to scale commercial operations, acquire high-performance infrastructure, and support inventory expansion.");

    triggerAlert('success', '✨ Page 1 demo data auto-filled! Click "Continue to Security & Biometrics →" to proceed.');
  };

  const handleAutoFillPage2 = () => {
    setIsUsResident(true);
    setKycCountry("United States");
    setKycIdType("Driver's License");
    setComplianceSsn("987-65-4321");
    setKycIdCard("approved_us_driver_license_front.png");
    setKycIdCardBack("approved_us_driver_license_back.png");
    setKycBusiness("llc_formation_certificate_active.pdf");
    setSocialPlatform("Twitter / X");
    setSingleSocialHandle("@johndoe_trader");
    setTwitterUsername("@johndoe_trader");
    setLinkedinUsername("johndoe_corporate");
    setTiktokUsername("@johndoe_official");
    setFacebookUsername("john.doe.trader");
    setYoutubeUsername("@JohnDoeFinance");

    setKycSelfie("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&h=180&q=80");
    setIsWebcamActive(true);
    setWebcamCountdown(0);

    setKycVideoUrl("liveness_video_recording_8821.mp4");
    setKycDeclaresAccuracy(true);
    setKycSignature(user.name);

    triggerAlert('success', '✨ Page 2 demo data auto-filled! Credentials, ID scan, selfie, video proof, and signature populated. Ready to submit!');
  };

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
          addressProofUrl: kycProofOfAddress,
          businessDocUrl: kycBusiness,
          fullName: kycFullName,
          dob: kycDob,
          phone: kycPhone,
          email: kycEmail,
          country: kycCountry,
          residentialAddress: kycAddressText,
          proofOfAddressUrl: kycProofOfAddress,
          employmentStatus: kycEmploymentStatus,
          maritalStatus: kycMaritalStatus,
          loanPurpose: kycLoanPurpose,
          loanDescription: kycLoanDescription,
          socialHandles: kycSocialHandles,
          idType: kycIdType,
          videoUrl: kycVideoUrl,
          requestedAmount: Number(loanFunding.amount || 100000),
          loanDuration: Number(loanFunding.preference ? loanFunding.preference.replace(/[^0-9]/g, '') : 24)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'KYC submission failed.');

      triggerAlert('success', 'Compliance portfolio submitted successfully for audit.');
      setKycStatus(data.kyc);
      
      // Also fetch loans list so that newly created/updated loans are synced!
      const loansRes = await fetch('/api/loans/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (loansRes.ok) {
        const loansData = await loansRes.json();
        setLoans(loansData);
      }
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
          profilePhoto: profilePhoto,
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

  const handleUnifiedSubmit = async () => {
    setErrorMsg('');

    // Check for existing active loan application
    const hasActiveLoan = loans.some(l => !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled'].includes(l.status));
    if (hasActiveLoan) {
      triggerAlert('error', 'You already have an active loan application. Please wait until your current application is completed, rejected, or fully settled before submitting a new application.');
      return;
    }

    // SSN validation for United States residents
    if (kycCountry === 'United States' && !complianceSsn.trim()) {
      triggerAlert('error', 'Social Security Number (SSN) is required for United States residents.');
      return;
    }

    // Declaration checkbox validation
    if (!kycDeclaresAccuracy) {
      triggerAlert('error', 'You must review and agree to the Applicant Undertaking declaration before submitting.');
      return;
    }

    // Electronic signature validation
    if (!kycSignature.trim()) {
      triggerAlert('error', 'Please type your full legal name as your electronic signature.');
      return;
    }

    setActionLoading(true);

    try {
      // 1. Submit KYC Portfolio
      const kycPayload = {
        idCardUrl: kycIdCard || 'passport_digital.png',
        selfieUrl: kycSelfie || 'verification_selfie_latest.png',
        addressProofUrl: kycProofOfAddress || 'proof_of_address_utility.png',
        businessDocUrl: kycBusiness || 'certificate_of_good_standing.pdf',
        fullName: kycFullName,
        dob: loanPersonal.dob,
        phone: kycPhone,
        email: kycEmail,
        country: kycCountry,
        residentialAddress: loanPersonal.address,
        proofOfAddressUrl: kycProofOfAddress || 'proof_of_address_utility.png',
        employmentStatus: loanEmployment.status,
        maritalStatus: loanPersonal.marital,
        loanPurpose: loanFunding.purpose,
        loanDescription: loanFunding.description || 'Sovereign institutional capital facility allocation request.',
        socialHandles: [singleSocialHandle || twitterUsername, linkedinUsername].filter(Boolean).map(u => u.trim()).join(', ') || kycSocialHandles || 'N/A',
        idType: kycIdType,
        videoUrl: kycVideoUrl || 'liveness_video_proof.mp4',
        requestedAmount: Number(loanFunding.amount || 100000),
        loanDuration: Number(loanFunding.preference ? loanFunding.preference.replace(/[^0-9]/g, '') : 24)
      };

      const kycRes = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(kycPayload)
      });
      const kycData = await kycRes.json();
      if (!kycRes.ok) throw new Error(kycData.error || 'Identity portfolio compliance submission failed.');
      setKycStatus(kycData.kyc);

      // 2. Submit Loan Application
      const loanPayload = {
        personalInfo: {
          dateOfBirth: loanPersonal.dob,
          maritalStatus: loanPersonal.marital,
          address: loanPersonal.address
        },
        employmentInfo: {
          status: loanEmployment.status,
          employerName: loanEmployment.employer || 'Sovereign Capitalist',
          monthlyIncome: Number(loanEmployment.income) || 12000,
          yearsEmployed: Number(loanEmployment.years) || 5
        },
        businessInfo: loanBusiness.name ? {
          companyName: loanBusiness.name,
          registrationNumber: loanBusiness.regNumber || 'N/A',
          industry: loanBusiness.industry || 'Asset Management',
          annualRevenue: Number(loanBusiness.revenue) || Number(loanEmployment.income) * 12
        } : {
          companyName: 'Sovereign Treasury',
          registrationNumber: 'N/A',
          industry: 'Investment and Financial Market Trading',
          annualRevenue: Number(loanEmployment.income) * 12
        },
        fundingDetails: {
          purpose: loanFunding.purpose,
          requestedAmount: Number(loanFunding.amount || 100000),
          repaymentPreference: loanFunding.preference,
          description: loanFunding.description || 'Sovereign institutional capital facility allocation request.'
        },
        financialInfo: {
          existingDebts: Number(loanFinancial.debts) || 0,
          creditScore: Number(loanFinancial.creditScore) || 750,
          assetsValue: Number(loanFinancial.assetsValue) || 0
        },
        documents: uploadedLoanDocs.length > 0 ? uploadedLoanDocs : (kycBusiness ? [{ name: 'business_incorporation_compliance.pdf', type: 'Sovereign Document', url: '#' }] : [])
      };

      const loanRes = await fetch('/api/loans/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(loanPayload)
      });
      const loanData = await loanRes.json();
      if (!loanRes.ok) throw new Error(loanData.error || 'Funding request submission failed.');

      triggerAlert('success', `Underwriting and Compliance Portfolio Submitted. Credit Line ${loanData.application.id} Created.`);
      setLoans(prev => [loanData.application, ...prev]);

      // Reset Form State
      onClearPrefilled?.();
      setWizardStep(1);
      
      // Navigate to loans list
      handleTabChange('loans');
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16" id="user-dashboard-root">
      
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 pb-8 border-b-2 border-white/10 gap-6">
        <div>
          <span className="text-xs font-mono tracking-[0.25em] text-cyan-400 font-black uppercase block mb-1.5">
            Elon Capital • Secured Sovereign Portal
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none">
            Personal Dashboard
          </h1>
          <p className="text-base sm:text-lg font-semibold text-zinc-200 mt-2.5 max-w-2xl leading-relaxed">
            Manage your sovereign credit facility, complete mandatory compliance checks, and track treasury disbursements.
          </p>
        </div>

        {/* Global CTA & Balance */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="p-4 bg-zinc-950/80 border-2 border-cyan-400/30 rounded-2xl font-mono text-left shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            <span className="block text-xs text-zinc-400 uppercase tracking-widest font-black">Approved Credit Limit</span>
            <span className="text-cyan-400 font-black font-mono text-lg sm:text-xl block mt-0.5">$500,000,000 USD</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { handleTabChange('apply'); setWizardStep(1); }}
              className="px-6 py-4 text-sm sm:text-base font-black uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all duration-300 flex items-center gap-2.5 shadow-[0_0_20px_rgba(34,211,238,0.4)] cursor-pointer font-display"
              id="btn-dash-apply-funding"
            >
              <Plus className="h-5 w-5 stroke-[3]" /> Apply for Funding
            </button>
            <button
              onClick={onLogout}
              className="px-5 py-4 text-sm sm:text-base font-black text-gray-200 hover:text-red-400 border-2 border-white/10 hover:border-red-500/30 rounded-xl transition-all cursor-pointer font-display"
              id="btn-dash-logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-1 space-y-2.5" id="dash-sidebar">
          <button
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-xl text-base sm:text-lg font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'overview' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" /> Overview & Logs
          </button>

          <button
            onClick={() => handleTabChange('loans')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-base sm:text-lg font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'loans' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-3.5"><FileText className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" /> Loan Applications</span>
            {loans.length > 0 && <span className="bg-cyan-400 text-black font-mono font-black text-xs px-2.5 py-0.5 rounded-full">{loans.length}</span>}
          </button>

          <button
            onClick={() => handleTabChange('kyc')}
            className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-xl text-base sm:text-lg font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'kyc' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" /> Document KYC
          </button>

          <button
            onClick={() => handleTabChange('messages')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-base sm:text-lg font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'messages' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-3.5"><MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" /> Message Desk</span>
            {unreadMsgCount > 0 && <span className="bg-cyan-400 text-black font-black font-mono text-xs px-2.5 py-0.5 rounded-full">{unreadMsgCount}</span>}
          </button>

          <button
            onClick={() => handleTabChange('support')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-base sm:text-lg font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'support' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-3.5"><HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" /> Support Center</span>
            {tickets.length > 0 && <span className="bg-white/20 text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full">{tickets.length}</span>}
          </button>

          <button
            onClick={() => { handleTabChange('settings'); markNotificationsRead(); }}
            className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-xl text-base sm:text-lg font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'settings' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" /> Account Settings
          </button>
        </div>

        {/* WORKSPACE AREA */}
        <div className="lg:col-span-3 bg-white/[0.01] border border-white/5 rounded-2xl p-8 backdrop-blur-md shadow-2xl min-h-[500px]" id="dash-workspace">
          
          {/* ---------------- 1. OVERVIEW & LOGS ---------------- */}
          {activeTab === 'overview' && (() => {
            const activeLoan = loans[0];
            return (
              <div className="space-y-8" id="view-overview">
                {/* 1. WELCOME CARD */}
                <div className="p-6 bg-gradient-to-r from-cyan-950/20 to-black border border-cyan-500/10 rounded-2xl relative overflow-hidden" id="dash-welcome-card">
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-cyan-500/5 to-transparent pointer-events-none" />
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
                        Welcome Back, {user.name}
                      </h3>
                      <p className="text-sm sm:text-base font-bold text-zinc-200 mt-1.5 leading-relaxed">
                        Your account is active. Complete the required operational milestones below to receive funding.
                      </p>
                    </div>

                    {/* Completion Checklist Checklist */}
                    <div className="pt-2 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm font-black">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400 stroke-[3]" />
                        <span className="text-white font-black">Create Secure EMC Account</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {kycStatus?.status === 'Approved' ? (
                          <CheckCircle2 className="h-4 w-4 text-cyan-400 stroke-[3]" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border-2 border-zinc-500 flex-shrink-0" />
                        )}
                        <span className={kycStatus?.status === 'Approved' ? 'text-white font-black' : 'text-zinc-300 font-bold'}>
                          Complete KYC Identity Verification
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {loans.length > 0 ? (
                          <CheckCircle2 className="h-4 w-4 text-cyan-400 stroke-[3]" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border-2 border-zinc-500 flex-shrink-0" />
                        )}
                        <span className={loans.length > 0 ? 'text-white font-black' : 'text-zinc-300 font-bold'}>
                          Submit Loan Capital Request
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {activeLoan?.collateralPaid ? (
                          <CheckCircle2 className="h-4 w-4 text-cyan-400 stroke-[3]" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border-2 border-zinc-500 flex-shrink-0" />
                        )}
                        <span className={activeLoan?.collateralPaid ? 'text-white font-black' : 'text-zinc-300 font-bold'}>
                          Remit Refundable Collateral Fee
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. STATUS BOARD BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dash-status-grid">
                  {/* KYC Compliance Status Card */}
                  <div className="p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-between transition-all">
                    <div className="space-y-1.5 text-left">
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block font-black">KYC Compliance Passport</span>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {kycStatus?.status === 'Approved' ? 'Verified Clearance Active' :
                         kycStatus?.status === 'Pending' ? 'In Review Queue' :
                         kycStatus?.status === 'Rejected' ? 'Re-upload Required' :
                         'Not Submitted'}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-200 font-bold leading-relaxed max-w-[240px]">
                        {kycStatus?.remarks || 'Complete identity validation to unlock standard capital allocation.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pl-4">
                      <ShieldCheck className={`h-11 w-11 ${kycStatus?.status === 'Approved' ? 'text-cyan-400' : 'text-gray-600'}`} />
                    </div>
                  </div>

                  {/* Active Loan Capital Card */}
                  <div className="p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-between transition-all">
                    <div className="space-y-1.5 text-left">
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block font-black">Capital Liquidity Line</span>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {!activeLoan ? 'No Active Loan' :
                         activeLoan.status === 'Pending' || activeLoan.status === 'Under Review' ? 'Loan Under Review' :
                         activeLoan.status === 'Approved' && !activeLoan.collateralPaid ? 'Approved (Collateral Required)' :
                         activeLoan.status === 'Approved' && activeLoan.collateralPaid ? 'Preparing Disbursement' :
                         activeLoan.status === 'Declined' ? 'Request Rejected' :
                         'Undergoing Verification'}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-200 font-bold leading-relaxed max-w-[240px]">
                        {!activeLoan ? 'Initialize your loan request using our 8-step compliance wizard.' :
                         activeLoan.status === 'Approved' && !activeLoan.collateralPaid ? `Refundable 25% collateral fee ($${(activeLoan.fundingDetails.requestedAmount * 0.25).toLocaleString()}) pending.` :
                         activeLoan.status === 'Approved' && activeLoan.collateralPaid ? 'Deposit confirmed. Liquid funds dispatch processing.' :
                         'Our financial risk underwriters are assessing your application.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pl-4">
                      <CreditCard className={`h-11 w-11 ${activeLoan?.status === 'Approved' ? 'text-cyan-400' : 'text-gray-600'}`} />
                    </div>
                  </div>
                </div>

                {/* 3. POST-PAYMENT DISBURSEMENT TRACKER (If Collateral Paid) */}
                {activeLoan && activeLoan.status === 'Approved' && activeLoan.collateralPaid && (
                  <div className="p-6 sm:p-8 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl space-y-6" id="post-payment-tracker">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">Payment Status: CONFIRMED</span>
                        <h4 className="font-display text-lg font-bold text-white uppercase">Preparing Disbursement</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          Your collateral deposit has been verified. Our treasury desk is executing the liquidity allocation sequence.
                        </p>
                      </div>
                      <div className="bg-cyan-950/40 border border-cyan-500/30 px-4 py-2.5 rounded-xl text-center flex-shrink-0">
                        <span className="text-[9px] font-mono text-cyan-500 uppercase tracking-wider block mb-0.5">Estimated Dispatch In</span>
                        <span className="text-sm font-mono font-bold text-white tracking-wider animate-pulse">{countdownStr}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-xs leading-relaxed text-zinc-400">
                      Your payment has been received successfully. Your loan will be processed within 24 hours after confirmation.
                    </div>

                    {/* Vertical Application Timeline step tracker */}
                    <div className="space-y-4">
                      <h5 className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Capital Dispatch Timeline</h5>
                      <div className="relative pl-6 border-l border-white/10 space-y-5 ml-2 text-left">
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-cyan-400 border-4 border-black flex items-center justify-center"></span>
                          <h6 className="text-xs font-bold text-white">1. Credit Application Submitted</h6>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Completed on {new Date(activeLoan.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-cyan-400 border-4 border-black flex items-center justify-center"></span>
                          <h6 className="text-xs font-bold text-white">2. KYC & Identity Clearance</h6>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Approved with institutional grade</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-cyan-400 border-4 border-black flex items-center justify-center"></span>
                          <h6 className="text-xs font-bold text-white">3. Institutional Underwriting</h6>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Approved for limit of ${activeLoan.fundingDetails.requestedAmount.toLocaleString()}</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-cyan-400 border-4 border-black flex items-center justify-center"></span>
                          <h6 className="text-xs font-bold text-white">4. Refundable Collateral Deposit</h6>
                          <p className="text-[10px] text-cyan-400 mt-0.5 font-mono">Confirmed • Tx ID: {activeLoan.collateralTxId}</p>
                        </div>
                        <div className="relative flex items-center">
                          <span className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-cyan-400 border-4 border-black flex items-center justify-center animate-ping"></span>
                          <div>
                            <h6 className="text-xs font-bold text-cyan-400">5. Liquidity Dispatch & Clearing</h6>
                            <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">Currently executing bank clearing protocols...</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Receipt Download block */}
                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-left">
                      <div>
                        <h6 className="text-xs font-bold text-white">Collateral Payment Receipt</h6>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">REF ID: REC-{activeLoan.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerAlert('success', 'Downloading payment receipt to device...')}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono text-gray-300 hover:text-white uppercase tracking-wider transition"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. QUICK ACTIONS HUB */}
                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-left font-black">QUICK ACTIONS CONTROL PORTAL</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="dash-quick-actions">
                    {/* REQUEST FUNDING */}
                    <button
                      type="button"
                      onClick={() => { handleTabChange('apply'); setWizardStep(1); }}
                      className="group relative p-6 bg-gradient-to-br from-neutral-900 to-black hover:from-cyan-950/20 hover:to-neutral-900 border-2 border-zinc-700/80 hover:border-cyan-400 rounded-2xl text-left flex flex-col justify-between h-48 transition-all duration-300 shadow-xl cursor-pointer hover:shadow-[0_10px_30px_rgba(34,211,238,0.15)] active:scale-95"
                      id="btn-quick-request-funding"
                    >
                      <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6 stroke-[3]" />
                      </div>
                      <div>
                        <span className="font-display text-base font-black text-white block uppercase tracking-wider">Request Funding</span>
                        <span className="text-xs text-zinc-300 font-bold mt-1 block leading-relaxed">Access lines of capital up to $500M with streamlined institutional clearings.</span>
                      </div>
                    </button>

                    {/* COMPLETE KYC */}
                    <button
                      type="button"
                      onClick={() => handleTabChange('kyc')}
                      className="group relative p-6 bg-gradient-to-br from-neutral-900 to-black hover:from-cyan-950/20 hover:to-neutral-900 border-2 border-zinc-700/80 hover:border-cyan-400 rounded-2xl text-left flex flex-col justify-between h-48 transition-all duration-300 shadow-xl cursor-pointer hover:shadow-[0_10px_30px_rgba(34,211,238,0.15)] active:scale-95"
                      id="btn-quick-complete-kyc"
                    >
                      <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="font-display text-base font-black text-white block uppercase tracking-wider">Complete KYC</span>
                        <span className="text-xs text-zinc-300 font-bold mt-1 block leading-relaxed">Fulfill regulatory and sovereign requirements with our secure upload system.</span>
                      </div>
                    </button>

                    {/* LOAN CALCULATOR */}
                    <button
                      type="button"
                      onClick={() => setIsCalcOpen(true)}
                      className="group relative p-6 bg-gradient-to-br from-neutral-900 to-black hover:from-cyan-950/20 hover:to-neutral-900 border-2 border-zinc-700/80 hover:border-cyan-400 rounded-2xl text-left flex flex-col justify-between h-48 transition-all duration-300 shadow-xl cursor-pointer hover:shadow-[0_10px_30px_rgba(34,211,238,0.15)] active:scale-95"
                      id="btn-quick-loan-calculator"
                    >
                      <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <Calculator className="h-6 w-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="font-display text-base font-black text-white block uppercase tracking-wider">Loan Calculator</span>
                        <span className="text-xs text-zinc-300 font-bold mt-1 block leading-relaxed">Synchronized real-time simulation module for interest and amortization rates.</span>
                      </div>
                    </button>

                    {/* MY LOANS */}
                    <button
                      type="button"
                      onClick={() => handleTabChange('loans')}
                      className="group relative p-6 bg-gradient-to-br from-neutral-900 to-black hover:from-cyan-950/20 hover:to-neutral-900 border-2 border-zinc-700/80 hover:border-cyan-400 rounded-2xl text-left flex flex-col justify-between h-48 transition-all duration-300 shadow-xl cursor-pointer hover:shadow-[0_10px_30px_rgba(34,211,238,0.15)] active:scale-95"
                      id="btn-quick-my-loans"
                    >
                      <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <FileText className="h-6 w-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="font-display text-base font-black text-white block uppercase tracking-wider">My Loans</span>
                        <span className="text-xs text-zinc-300 font-bold mt-1 block leading-relaxed">Access active contracts, clearing statuses, and history registers.</span>
                      </div>
                    </button>

                    {/* PAYMENT HISTORY */}
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(true)}
                      className="group relative p-6 bg-gradient-to-br from-neutral-900 to-black hover:from-cyan-950/20 hover:to-neutral-900 border-2 border-zinc-700/80 hover:border-cyan-400 rounded-2xl text-left flex flex-col justify-between h-48 transition-all duration-300 shadow-xl cursor-pointer hover:shadow-[0_10px_30px_rgba(34,211,238,0.15)] active:scale-95"
                      id="btn-quick-payment-history"
                    >
                      <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <History className="h-6 w-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="font-display text-base font-black text-white block uppercase tracking-wider">Payment History</span>
                        <span className="text-xs text-zinc-300 font-bold mt-1 block leading-relaxed">Review secure transaction receipts, collateral logs, and bank wires.</span>
                      </div>
                    </button>

                    {/* VIEW PROFILE */}
                    <button
                      type="button"
                      onClick={() => handleTabChange('settings')}
                      className="group relative p-6 bg-gradient-to-br from-neutral-900 to-black hover:from-cyan-950/20 hover:to-neutral-900 border-2 border-zinc-700/80 hover:border-cyan-400 rounded-2xl text-left flex flex-col justify-between h-48 transition-all duration-300 shadow-xl cursor-pointer hover:shadow-[0_10px_30px_rgba(34,211,238,0.15)] active:scale-95"
                      id="btn-quick-profile"
                    >
                      <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <UserIcon className="h-6 w-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="font-display text-base font-black text-white block uppercase tracking-wider">Profile Control</span>
                        <span className="text-xs text-zinc-300 font-bold mt-1 block leading-relaxed">Customize account details, high-resolution avatar photos, and credentials.</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ---------------- 2. LOAN APPLICATIONS ---------------- */}
          {activeTab === 'loans' && (
            <div className="space-y-6" id="view-loans">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-1 uppercase tracking-tight">Credit & Funding Proposals</h3>
                  <p className="text-sm font-semibold text-zinc-200">Review status logs of active and historic liquidity proposals.</p>
                </div>
                <button
                  onClick={() => { setActiveTab('apply'); setWizardStep(1); }}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all cursor-pointer shadow-lg"
                  id="btn-loans-new-app"
                >
                  New Application
                </button>
              </div>

              {loans.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-zinc-700/80 rounded-2xl bg-zinc-950/40" id="loans-empty-state">
                  <FilePlus className="h-12 w-12 text-cyan-400 mx-auto mb-4 stroke-[2.5]" />
                  <p className="text-base text-zinc-200 font-bold mb-4">You have not submitted any credit applications.</p>
                  <button
                    onClick={() => setActiveTab('apply')}
                    className="px-6 py-3 text-xs text-black bg-cyan-400 rounded-xl hover:bg-cyan-300 font-black uppercase tracking-wider shadow-md"
                  >
                    Initiate First Application
                  </button>
                </div>
              ) : (
                <div className="space-y-6" id="loans-list">
                  {loans.map((loan) => (
                    <div 
                      key={loan.id}
                      className="border-2 border-zinc-700/80 bg-zinc-950/60 hover:border-cyan-400/50 rounded-2xl p-6 transition-all"
                      id={`loan-item-${loan.id}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                          <span className="font-mono text-xs font-black text-cyan-400 uppercase tracking-widest">REF ID: {loan.id}</span>
                          <h4 className="font-display text-xl sm:text-2xl font-black text-white mt-1">
                            ${loan.fundingDetails.requestedAmount.toLocaleString()}{' '}
                            <span className="text-sm text-zinc-300 font-bold">for {loan.fundingDetails.purpose}</span>
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {loan.requiresEnhancedVerification && (
                            <span className="px-3 py-1 bg-yellow-950/60 border border-yellow-500/40 text-yellow-400 font-mono text-xs font-black rounded-full flex items-center gap-1 uppercase">
                              <AlertTriangle className="h-3.5 w-3.5" /> Enhanced Audit Req
                            </span>
                          )}
                          <span className={`px-3.5 py-1 font-mono text-xs font-black rounded-full border-2 uppercase ${
                            loan.status === 'Approved' ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300' :
                            loan.status === 'Declined' ? 'bg-red-950/60 border-red-500 text-red-400' :
                            loan.status === 'Under Review' ? 'bg-blue-950/60 border-blue-400 text-blue-300' :
                            'bg-yellow-950/60 border-yellow-400 text-yellow-300'
                          }`}>
                            {loan.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-white/10 text-sm">
                        <div>
                          <span className="block text-xs text-cyan-400 uppercase font-mono font-black mb-1">Repayment Method</span>
                          <span className="text-white font-bold">{loan.fundingDetails.repaymentPreference}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-cyan-400 uppercase font-mono font-black mb-1">Applicant Entity</span>
                          <span className="text-white font-bold">{loan.businessInfo?.companyName || "Personal Enterprise"}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-cyan-400 uppercase font-mono font-black mb-1">Credit Score</span>
                          <span className="text-white font-bold font-mono">{loan.financialInfo.creditScore || "Not Scored"}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-cyan-400 uppercase font-mono font-black mb-1">Submission Date</span>
                          <span className="text-white font-bold font-mono">{new Date(loan.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-sm text-zinc-200 font-bold leading-relaxed mt-4">
                        <span className="text-white font-black">Description:</span> {loan.fundingDetails.description}
                      </p>

                      {loan.status === 'Approved' && (
                        <>
                           {!loan.collateralPaid ? (
                            <div className="mt-5 p-5 bg-yellow-950/20 border border-yellow-500/20 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                              <div className="space-y-1">
                                <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                                  <AlertTriangle className="h-4 w-4" /> Refundable Collateral & Processing Fees Required
                                </h5>
                                <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                                  Your compliance status is verified. Transmit the 25% refundable collateral deposit of <span className="text-white font-mono font-bold">${(loan.fundingDetails.requestedAmount * 0.25).toLocaleString()}</span> and the 3.5% non-refundable processing fee of <span className="text-cyan-400 font-mono font-bold">${(loan.fundingDetails.requestedAmount * 0.035).toLocaleString()}</span> to activate liquidity release. Total settlement: <span className="text-white font-mono font-bold">${(loan.fundingDetails.requestedAmount * 0.285).toLocaleString()}</span>.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setPayingCollateralLoan(loan);
                                  setCollateralTxIdInput('');
                                }}
                                className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg transition-all shrink-0 cursor-pointer font-mono"
                              >
                                Pay Settlement
                              </button>
                            </div>
                          ) : (
                            <div className="mt-5 p-5 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-4 animate-fade-in">
                              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                                <div>
                                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1">
                                    <Check className="h-4 w-4" /> Settlement Confirmed & Secured
                                  </h5>
                                  <p className="text-[11px] text-gray-400 font-light">
                                    Sovereign collateral fee of <span className="text-cyan-400 font-mono font-bold">${(loan.fundingDetails.requestedAmount * 0.25).toLocaleString()}</span> (25%) and processing fee of <span className="text-yellow-500 font-mono font-bold">${(loan.fundingDetails.requestedAmount * 0.035).toLocaleString()}</span> (3.5%) have been audited successfully.
                                  </p>
                                </div>
                                <span className={`px-2.5 py-1 font-mono text-[9px] font-bold rounded-full uppercase tracking-wider border ${
                                  loan.disbursed ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 animate-pulse' : 'bg-orange-950/40 border-orange-500/20 text-orange-400'
                                }`}>
                                  {loan.disbursed ? 'Capital Disbursed' : 'Awaiting Releases'}
                                </span>
                              </div>

                              {/* Withdrawal & Disbursement Destination Setup */}
                              {!loan.disbursed ? (
                                <div className="space-y-3 bg-black/40 p-4 rounded-lg border border-white/5">
                                  <h6 className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                                    Disbursement Routing Protocol
                                  </h6>
                                  
                                  {/* Destination Selector */}
                                  <div className="grid grid-cols-2 gap-2 max-w-xs">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveDisbursementMethod(loan.id, 'Crypto')}
                                      className={`py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
                                        disbursementMethods[loan.id] === 'Crypto' || !disbursementMethods[loan.id]
                                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                          : 'border-white/5 text-gray-400 hover:text-white'
                                      }`}
                                    >
                                      USDT / USDC Address
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveDisbursementMethod(loan.id, 'Bank')}
                                      className={`py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
                                        disbursementMethods[loan.id] === 'Bank'
                                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                          : 'border-white/5 text-gray-400 hover:text-white'
                                      }`}
                                    >
                                      Global Bank Wire
                                    </button>
                                  </div>

                                  {/* Interactive Form fields */}
                                  {(disbursementMethods[loan.id] === 'Crypto' || !disbursementMethods[loan.id]) ? (
                                    <div className="space-y-2">
                                      <label className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider">
                                        ERC-20 (Ethereum) / TRC-20 (Tron) Destination Wallet Address
                                      </label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="Enter wallet address (e.g. 0x... or T...)"
                                          value={disbursementInputs[loan.id]?.cryptoAddress || ''}
                                          onChange={(e) => handleUpdateDisbursementInput(loan.id, 'cryptoAddress', e.target.value)}
                                          className="w-full px-3 py-1.5 bg-black border border-white/5 focus:border-cyan-500/30 rounded text-[11px] font-mono text-white focus:outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleLockDestination(loan.id)}
                                          className="px-3 bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-bold uppercase rounded cursor-pointer font-mono"
                                        >
                                          Secure
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <label className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider">
                                        Institutional IBAN Wire Transfer Routing Details
                                      </label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input
                                          type="text"
                                          placeholder="Bank Name"
                                          value={disbursementInputs[loan.id]?.bankName || ''}
                                          onChange={(e) => handleUpdateDisbursementInput(loan.id, 'bankName', e.target.value)}
                                          className="w-full px-3 py-1.5 bg-black border border-white/5 focus:border-cyan-500/30 rounded text-[11px] text-white focus:outline-none"
                                        />
                                        <input
                                          type="text"
                                          placeholder="SWIFT / BIC Code"
                                          value={disbursementInputs[loan.id]?.bankSwift || ''}
                                          onChange={(e) => handleUpdateDisbursementInput(loan.id, 'bankSwift', e.target.value)}
                                          className="w-full px-3 py-1.5 bg-black border border-white/5 focus:border-cyan-500/30 rounded text-[11px] text-white focus:outline-none"
                                        />
                                        <input
                                          type="text"
                                          placeholder="IBAN Account Number"
                                          value={disbursementInputs[loan.id]?.bankIban || ''}
                                          onChange={(e) => handleUpdateDisbursementInput(loan.id, 'bankIban', e.target.value)}
                                          className="w-full px-3 py-1.5 bg-black border border-white/5 focus:border-cyan-500/30 rounded text-[11px] text-white focus:outline-none col-span-1 sm:col-span-2"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleLockDestination(loan.id)}
                                        className="w-full py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-bold uppercase rounded cursor-pointer mt-1"
                                      >
                                        Lock Wire Coordinates
                                      </button>
                                    </div>
                                  )}

                                  {disbursementLocked[loan.id] && (
                                    <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                      ✓ Routing locked. Queue release triggered.
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-3 bg-emerald-950/10 p-4 rounded-lg border border-emerald-500/10">
                                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                                    Liquidity Disbursed & Settled
                                  </span>
                                  <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                    Capital sum of <span className="text-white font-mono font-bold">${loan.fundingDetails.requestedAmount.toLocaleString()}</span> has been wired and released to your designated treasury destination.
                                  </p>
                                  <div className="flex flex-col sm:flex-row gap-4 text-[10px] font-mono text-gray-500 pt-1.5 border-t border-white/5">
                                    <span>COLLATERAL TxID: <span className="text-gray-300">{loan.collateralTxId}</span></span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>RELEASE DATE: <span className="text-gray-300">{loan.disbursedAt ? new Date(loan.disbursedAt).toLocaleString() : 'N/A'}</span></span>
                                  </div>
                                </div>
                              )}
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

          {/* ---------------- 3. APPLY FOR FUNDING (2-PAGE APPLICATION FORM) ---------------- */}
          {activeTab === 'apply' && (
            <div className="max-w-4xl mx-auto py-8 space-y-10" id="view-apply-wizard">
              {/* Active Loan Enforcement Warning Banner */}
              {loans.some(l => !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled'].includes(l.status)) && (
                <div className="bg-amber-950/80 border-2 border-amber-400 p-6 rounded-2xl space-y-4 text-left shadow-[0_0_25px_rgba(251,191,36,0.2)] animate-fade-in">
                  <div className="flex items-center gap-3 text-amber-300 font-display font-black text-xl uppercase tracking-wider">
                    <AlertTriangle className="h-7 w-7 text-amber-400 flex-shrink-0" />
                    <span>Active Loan Application In Progress</span>
                  </div>
                  <p className="text-base font-bold text-white leading-relaxed">
                    You already have an active loan application ({loans.find(l => !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled'].includes(l.status))?.id} - Status: <strong className="text-amber-300">{loans.find(l => !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled'].includes(l.status))?.status}</strong>). Under institutional credit policy, applicants may only hold one active loan application at a time.
                  </p>
                  <p className="text-sm font-semibold text-zinc-300">
                    Please wait until your current application is finalized, approved, rejected, or fully settled before submitting a new application.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange('loans')}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer font-display shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                    >
                      View My Active Application →
                    </button>
                  </div>
                </div>
              )}
              {/* Step Tracker Header */}
              <div className="p-6 rounded-2xl bg-zinc-950/80 border-2 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6" id="apply-step-header">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center font-display font-black text-2xl text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    {wizardStep}
                  </div>
                  <div className="text-left">
                    <h4 className="font-display text-xl font-black text-white uppercase tracking-wider">
                      Capital Application Step {wizardStep} of 2
                    </h4>
                    <p className="text-xs text-cyan-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                      {wizardStep === 1 ? 'CORE ACCOUNT & PERSONAL INFORMATION' : 'SECURITY CREDENTIALS, LIVENESS PROOF & DECLARATION'}
                    </p>
                  </div>
                </div>
                {/* Linear Step Bar */}
                <div className="flex items-center gap-3">
                  {[1, 2].map((step) => (
                    <div
                      key={step}
                      className={`h-3 w-20 rounded-full transition-all duration-300 ${
                        step <= wizardStep ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* PAGE 1: CORE PROFILE */}
              {wizardStep === 1 && (
                <div className="space-y-8 animate-fade-in text-left" id="apply-page-1">
                  {/* Page 1 Quick Demo Auto-Fill Banner */}
                  <div className="bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-amber-500/20 border-2 border-amber-400/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <h5 className="font-display font-black text-amber-300 text-base uppercase tracking-wider">Demo Auto-Fill (Page 1)</h5>
                      </div>
                      <p className="text-xs font-extrabold text-zinc-100">
                        Click this button to automatically populate all required Page 1 personal, address, and financial funding fields for instant testing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillPage1}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 cursor-pointer flex-shrink-0 font-display"
                    >
                      ✨ Auto-Fill Page 1
                    </button>
                  </div>

                  {/* Identity Section */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-cyan-400/40 pb-4">
                      1. Account & Personal Information
                    </h3>
                    <p className="text-base font-semibold text-zinc-200 leading-relaxed">
                      Please enter your full legal identity details exactly as they appear on your official government identification documents.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          value={kycFullName}
                          onChange={(e) => setKycFullName(e.target.value)}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none transition-colors"
                          placeholder="e.g. Johnathan Alexander Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={kycEmail}
                          onChange={(e) => setKycEmail(e.target.value)}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none transition-colors"
                          placeholder="john.doe@corporate.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={kycPhone}
                          onChange={(e) => setKycPhone(e.target.value)}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none transition-colors"
                          placeholder="+1 (555) 019-2834"
                        />
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Country / Sovereign Jurisdiction *</label>
                        <CountrySelector
                          selectedCountry={kycCountry}
                          onChange={(cName) => {
                            setKycCountry(cName);
                            setIsUsResident(cName === 'United States');
                          }}
                          id="apply-country-selector"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Date of Birth *</label>
                        <input
                          type="date"
                          required
                          value={loanPersonal.dob}
                          onChange={(e) => {
                            setLoanPersonal({ ...loanPersonal, dob: e.target.value });
                            setKycDob(e.target.value);
                          }}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none transition-colors"
                        />
                        <div className="text-xs font-black text-amber-400 uppercase tracking-wide mt-2" id="compliance-warning-dob">
                          ⚠️ Applicants must be at least 18 years of age.
                        </div>
                      </div>
                      <div>
                        <SearchableSelect
                          label="Marital Status"
                          required
                          options={['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Civil Partnership']}
                          value={loanPersonal.marital}
                          onChange={(val) => {
                            setLoanPersonal({ ...loanPersonal, marital: val });
                            setKycMaritalStatus(val);
                          }}
                          id="kyc-marital-status-select"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Primary Residential Address *</label>
                      <textarea
                        required
                        value={loanPersonal.address}
                        onChange={(e) => {
                          setLoanPersonal({ ...loanPersonal, address: e.target.value });
                          setKycAddressText(e.target.value);
                        }}
                        placeholder="Enter street name, house number, city, state, postal code, and country"
                        className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none transition-colors h-24 resize-none"
                      />
                    </div>
                  </div>

                  {/* Financial Profile Section */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-cyan-400/40 pb-4">
                      2. Capital & Financial Profile
                    </h3>
                    <p className="text-base font-semibold text-zinc-200 leading-relaxed">
                      State your current professional status and requested credit facility amount to establish your funding tier.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <SearchableSelect
                          label="Profession / Employment Status"
                          required
                          options={[
                            'Small Business Owner',
                            'Crypto Trader / Web3 Investor',
                            'Digital Asset Allocator',
                            'Forex & Financial Market Trader',
                            'Software Engineer / Developer',
                            'Independent Corporate Institution',
                            'Self-Employed Freelancer',
                            'Employed / Salaried Officer',
                            'Financial Market Analyst',
                            'Corporate Officer',
                            'Doctor / Healthcare Specialist',
                            'Attorney / Legal Professional',
                            'Consultant / Executive',
                            'Real Estate Developer',
                            'Other Professional Status'
                          ]}
                          value={loanEmployment.status}
                          onChange={(val) => {
                            setLoanEmployment({ ...loanEmployment, status: val });
                            setKycEmploymentStatus(val);
                          }}
                          id="kyc-employment-status-select"
                        />
                      </div>

                      <div>
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Estimated Monthly Income (USD) *</label>
                        <input
                          type="number"
                          required
                          value={loanEmployment.income}
                          onChange={(e) => setLoanEmployment({ ...loanEmployment, income: e.target.value })}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none transition-colors"
                          placeholder="e.g. 15000"
                        />
                      </div>
                    </div>

                    {loanEmployment.status === 'Other Professional Status' && (
                      <div className="animate-fade-in">
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Please describe your professional occupation</label>
                        <input
                          type="text"
                          required
                          value={loanEmployment.employer}
                          onChange={(e) => setLoanEmployment({ ...loanEmployment, employer: e.target.value })}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none transition-colors"
                          placeholder="e.g. High-frequency arbitrage trader"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Requested Funding Amount (USD) *</label>
                        <input
                          type="number"
                          required
                          value={loanFunding.amount}
                          onChange={(e) => setLoanFunding({ ...loanFunding, amount: e.target.value })}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none transition-colors"
                          placeholder="e.g. 50000"
                        />
                      </div>

                      <div>
                        <SearchableSelect
                          label="Primary Purpose of Funding"
                          required
                          options={[
                            'Business Expansion',
                            'Treasury Liquidity',
                            'Real Estate Acquisition',
                            'Working Capital',
                            'Research & Development (R&D)',
                            'Equipment & Asset Purchase',
                            'Web3 Development',
                            'Debt Consolidation',
                            'Inventory Acquisition',
                            'Other Capital Requirement'
                          ]}
                          value={loanFunding.purpose}
                          onChange={(val) => {
                            setLoanFunding({ ...loanFunding, purpose: val });
                            setKycLoanPurpose(val);
                          }}
                          id="kyc-funding-purpose-select"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Detailed Purpose / Project Scope Description *</label>
                      <textarea
                        required
                        value={loanFunding.description}
                        onChange={(e) => {
                          setLoanFunding({ ...loanFunding, description: e.target.value });
                          setKycLoanDescription(e.target.value);
                        }}
                        placeholder="Explain how the credit facility will be utilized to facilitate growth, settle trading accounts, or purchase corporate equipment..."
                        className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none transition-colors h-24 resize-none"
                      />
                    </div>
                  </div>

                  {/* Navigation Button */}
                  <div className="flex justify-end pt-4" id="apply-nav-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!kycFullName || !kycEmail || !kycPhone || !loanPersonal.dob || !loanPersonal.address || !loanEmployment.income || !loanFunding.amount || !loanFunding.description) {
                          triggerAlert('error', 'Please complete all required fields on Page 1 before proceeding.');
                          return;
                        }
                        setWizardStep(2);
                      }}
                      className="relative group rounded-xl bg-cyan-500 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer w-full md:w-auto"
                      id="btn-apply-next-step-3d"
                    >
                      <span className="absolute inset-0 rounded-xl bg-cyan-700 translate-y-1 block"></span>
                      <span className="relative flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-cyan-400 text-black text-sm font-black uppercase tracking-widest -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 font-display">
                        Continue to Identity Verification & Document Scans →
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* PAGE 2: SECURITY, LIVENESS PROOF & DECLARATION */}
              {wizardStep === 2 && (
                <div className="space-y-8 animate-fade-in text-left" id="apply-page-2">
                  {/* Page 2 Quick Demo Auto-Fill Banner */}
                  <div className="bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-amber-500/20 border-2 border-amber-400/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <h5 className="font-display font-black text-amber-300 text-base uppercase tracking-wider">Demo Auto-Fill (Page 2)</h5>
                      </div>
                      <p className="text-xs font-extrabold text-zinc-100">
                        Click this button to automatically populate SSN/ID, sample document paths, biometric selfie, video statement, and matching typed signature.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillPage2}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 cursor-pointer flex-shrink-0 font-display"
                    >
                      ✨ Auto-Fill Page 2
                    </button>
                  </div>

                  {/* Top noticeable 3D Back button */}
                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="relative group rounded-xl bg-zinc-700 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer w-full md:w-auto"
                      id="btn-apply-back-step-3d"
                    >
                      <span className="absolute inset-0 rounded-xl bg-zinc-800 translate-y-1 block"></span>
                      <span className="relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-600 text-white text-xs font-black uppercase tracking-widest -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 font-display">
                        ← Back to Page 1 (Personal & Financial Details)
                      </span>
                    </button>
                  </div>

                  {/* Country Selection & SSN Section */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-cyan-400/40 pb-4">
                      1. Country Selection & Identification Credentials
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-base font-black text-white uppercase tracking-wider">Country of Primary Citizenship / Jurisdiction *</label>
                        <CountrySelector
                          selectedCountry={kycCountry}
                          onChange={(cName) => {
                            setKycCountry(cName);
                            setIsUsResident(cName === 'United States');
                          }}
                          id="page2-country-selector"
                        />
                        <p className="text-xs font-bold text-cyan-300 mt-2">
                          ✓ All 195+ sovereign countries & territories worldwide are fully supported.
                        </p>
                      </div>

                      {kycCountry === 'United States' && (
                        <div className="space-y-2 animate-fade-in">
                          <label className="block text-base font-black text-white uppercase tracking-wider">Social Security Number (US SSN) *</label>
                          <input
                            type="text"
                            required
                            value={complianceSsn}
                            onChange={(e) => setComplianceSsn(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-black text-white focus:outline-none transition-colors font-mono"
                            placeholder="XXX-XX-XXXX (Mandatory for US Residents)"
                          />
                          <p className="text-xs font-bold text-cyan-300">
                            🛡️ Social Security Number is required for United States residents to facilitate credit bureau validation.
                          </p>
                        </div>
                      )}

                      {kycCountry === 'Nigeria' && (
                        <div className="space-y-2 animate-fade-in">
                          <label className="block text-base font-black text-white uppercase tracking-wider">Bank Verification Number (BVN) *</label>
                          <input
                            type="text"
                            required
                            value={kycBvn}
                            onChange={(e) => setKycBvn(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-black text-white focus:outline-none transition-colors font-mono"
                            placeholder="11-Digit BVN Number (e.g. 22123456789)"
                          />
                          <p className="text-xs font-bold text-cyan-300">
                            🛡️ Bank Verification Number (BVN) is required for Nigerian identity verification.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Identification Document Selection & Adaptive Document Upload */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-cyan-400/40 pb-4">
                      2. Identification Document & Adaptive Scan Upload
                    </h3>

                    <p className="text-base font-semibold text-zinc-200 leading-relaxed">
                      Select which official government identification document you wish to upload for identity verification.
                    </p>

                    {/* Document Selector Buttons */}
                    <div className="space-y-3">
                      <label className="block text-base font-black text-white uppercase tracking-wider">Select Document Type *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                          { id: 'National Identity Card', label: 'National ID Card', icon: '🪪' },
                          { id: 'International Passport', label: 'Passport', icon: '🛂' },
                          { id: "Driver's License", label: "Driver's License", icon: '🚗' },
                          { id: 'Residence Permit', label: 'Residence Permit', icon: '📄' },
                          { id: 'Other Government ID', label: 'Other Gov ID', icon: '🛡️' }
                        ].map((doc) => {
                          const isSelected = kycIdType === doc.id;
                          return (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => setKycIdType(doc.id)}
                              className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer font-display ${
                                isSelected
                                  ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                              }`}
                            >
                              <span className="text-2xl">{doc.icon}</span>
                              <span className="text-xs font-black uppercase tracking-wider">{doc.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Adaptive Upload Section */}
                    {(() => {
                      const isTwoSided = kycIdType === 'National Identity Card' || kycIdType === "Driver's License" || kycIdType === 'Residence Permit' || kycIdType === 'Other Government ID';

                      return (
                        <div className="pt-4 border-t border-white/10 space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                              Document Upload Requirement: {isTwoSided ? 'Front & Back Scans Required (2 Sides)' : 'Photo Page Scan Required (1 Side)'}
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest bg-amber-400 text-black px-3 py-1 rounded-md">
                              Mandatory Verification
                            </span>
                          </div>

                          {isTwoSided ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Front Upload Card */}
                              <div className="bg-zinc-950/80 p-6 rounded-2xl border-2 border-zinc-700 space-y-4">
                                <div className="space-y-1">
                                  <h5 className="text-base font-black text-white uppercase tracking-wider">Upload Front of {kycIdType} *</h5>
                                  <p className="text-xs font-semibold text-zinc-300">
                                    Upload a clear photo or scan of the FRONT side showing photo, name, and ID details.
                                  </p>
                                </div>

                                <input
                                  type="file"
                                  ref={idCardFileInputRef}
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setKycIdCard(file.name);
                                      triggerAlert('success', `📁 Front ID uploaded: ${file.name}`);
                                    }
                                  }}
                                />

                                <div className="space-y-3 pt-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => idCardFileInputRef.current?.click()}
                                      className="px-5 py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex-1 font-display"
                                    >
                                      📁 Upload Front Image
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setKycIdCard("approved_national_id_front.png");
                                        triggerAlert('success', 'Sample front ID scan loaded.');
                                      }}
                                      className="px-3 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-mono font-bold text-white transition cursor-pointer"
                                    >
                                      Sample
                                    </button>
                                  </div>
                                  <div className="px-4 py-3 bg-black border border-zinc-800 rounded-xl text-xs font-mono text-cyan-300 truncate font-bold">
                                    {kycIdCard || 'No front file selected'}
                                  </div>
                                </div>
                              </div>

                              {/* Back Upload Card */}
                              <div className="bg-zinc-950/80 p-6 rounded-2xl border-2 border-zinc-700 space-y-4">
                                <div className="space-y-1">
                                  <h5 className="text-base font-black text-white uppercase tracking-wider">Upload Back of {kycIdType} *</h5>
                                  <p className="text-xs font-semibold text-zinc-300">
                                    Upload a clear photo or scan of the BACK side showing magnetic barcodes or address details.
                                  </p>
                                </div>

                                <input
                                  type="file"
                                  ref={idCardBackFileInputRef}
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setKycIdCardBack(file.name);
                                      triggerAlert('success', `📁 Back ID uploaded: ${file.name}`);
                                    }
                                  }}
                                />

                                <div className="space-y-3 pt-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => idCardBackFileInputRef.current?.click()}
                                      className="px-5 py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex-1 font-display"
                                    >
                                      📁 Upload Back Image
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setKycIdCardBack("approved_national_id_back.png");
                                        triggerAlert('success', 'Sample back ID scan loaded.');
                                      }}
                                      className="px-3 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-mono font-bold text-white transition cursor-pointer"
                                    >
                                      Sample
                                    </button>
                                  </div>
                                  <div className="px-4 py-3 bg-black border border-zinc-800 rounded-xl text-xs font-mono text-cyan-300 truncate font-bold">
                                    {kycIdCardBack || 'No back file selected'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Passport Single Upload Card */
                            <div className="bg-zinc-950/80 p-6 rounded-2xl border-2 border-zinc-700 space-y-4 max-w-2xl">
                              <div className="space-y-1">
                                <h5 className="text-base font-black text-white uppercase tracking-wider">Upload Passport Information Page *</h5>
                                <p className="text-xs font-semibold text-zinc-300">
                                  Upload a clear photo or scan of your passport information page showing your photo, full name, passport number, expiry date, and MRZ lines.
                                </p>
                              </div>

                              <input
                                type="file"
                                ref={idCardFileInputRef}
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setKycIdCard(file.name);
                                    triggerAlert('success', `📁 Passport page uploaded: ${file.name}`);
                                  }
                                }}
                              />

                              <div className="space-y-3 pt-1">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => idCardFileInputRef.current?.click()}
                                    className="px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex-1 font-display"
                                  >
                                    📁 Upload Passport Page Image
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setKycIdCard("approved_international_passport_scan.png");
                                      triggerAlert('success', 'Sample passport scan loaded.');
                                    }}
                                    className="px-4 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-mono font-bold text-white transition cursor-pointer"
                                  >
                                    Sample
                                  </button>
                                </div>
                                <div className="px-4 py-3 bg-black border border-zinc-800 rounded-xl text-xs font-mono text-cyan-300 truncate font-bold">
                                  {kycIdCard || 'No passport file selected'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Mandatory Proof of Address Upload */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl relative overflow-hidden" id="apply-proof-of-address-section">
                    <div className="absolute right-0 top-0 bg-amber-400 text-black text-xs font-black uppercase px-4 py-1.5 tracking-widest rounded-bl-xl shadow-lg font-display">
                      Mandatory Requirement *
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-white/10 pb-4">
                        3. Proof of Residential Address Upload *
                      </h3>
                      <p className="text-base font-semibold text-zinc-200 leading-relaxed">
                        Upload a recent official utility bill, bank statement, municipal notice, or government residential document showing your full name and residential address.
                      </p>

                      <input
                        type="file"
                        ref={proofOfAddressFileInputRef}
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setKycProofOfAddress(file.name);
                            triggerAlert('success', `📁 Proof of Address uploaded: ${file.name}`);
                          }
                        }}
                      />

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => proofOfAddressFileInputRef.current?.click()}
                          className="px-6 py-4 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-2 font-display shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                        >
                          <span>📁 Upload Proof of Address</span>
                        </button>
                        <input
                          type="text"
                          required
                          value={kycProofOfAddress}
                          onChange={(e) => setKycProofOfAddress(e.target.value)}
                          className="flex-1 px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-bold text-white focus:outline-none font-mono"
                          placeholder="e.g. utility_bill_2026.pdf *"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setKycProofOfAddress('utility_bill_verified_residential.pdf');
                            triggerAlert('success', 'Sample Proof of Address loaded.');
                          }}
                          className="px-5 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-mono font-black text-white uppercase tracking-wider transition cursor-pointer"
                        >
                          Sample
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Supporting Business Documents (Optional) */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl relative overflow-hidden" id="apply-business-doc-section">
                    <div className="absolute right-0 top-0 bg-cyan-400 text-black text-xs font-black uppercase px-4 py-1.5 tracking-widest rounded-bl-xl shadow-lg font-display">
                      Optional Document
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-white/10 pb-4">
                        4. Supporting Business Documents (Optional)
                      </h3>
                      <p className="text-base font-semibold text-zinc-200 leading-relaxed">
                        You may optionally upload business incorporation certificates, LLC licenses, or tax records from your phone or device gallery to optimize credit limit evaluation.
                      </p>

                      <input
                        type="file"
                        ref={businessDocFileInputRef}
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setKycBusiness(file.name);
                            triggerAlert('success', `📁 Business document selected: ${file.name}`);
                          }
                        }}
                      />

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => businessDocFileInputRef.current?.click()}
                          className="px-6 py-3.5 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-zinc-500 font-display"
                        >
                          <span>📁 Upload Business File</span>
                        </button>
                        <input
                          type="text"
                          value={kycBusiness}
                          onChange={(e) => setKycBusiness(e.target.value)}
                          className="flex-1 px-5 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-sm font-bold text-white focus:outline-none font-mono"
                          placeholder="e.g. llc_formation.pdf (Optional)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setKycBusiness('llc_formation_certificate_active.pdf');
                            triggerAlert('success', 'Sample corporate document loaded.');
                          }}
                          className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-mono font-black text-white uppercase tracking-wider transition cursor-pointer"
                        >
                          Sample
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Verified Social Media Username (Single Space) */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-white/10 pb-4">
                      5. Verified Social Media Handle (1 Space Only)
                    </h3>
                    <p className="text-base font-semibold text-cyan-300 leading-relaxed">
                      Please select 1 social platform below and input your exact account handle/username for identity verification.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div>
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Select Social Platform *</label>
                        <select
                          value={socialPlatform}
                          onChange={(e) => setSocialPlatform(e.target.value)}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-black text-white focus:outline-none font-mono"
                        >
                          <option value="Twitter / X">Twitter / X</option>
                          <option value="Instagram">Instagram</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Facebook">Facebook</option>
                          <option value="YouTube">YouTube</option>
                          <option value="LinkedIn">LinkedIn</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider mb-2">Username / Handle Only (No Links) *</label>
                        <input
                          type="text"
                          required
                          value={singleSocialHandle}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSingleSocialHandle(val);
                            setTwitterUsername(val);
                          }}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-base font-black text-white focus:outline-none font-mono"
                          placeholder="e.g. @johndoe_official or johndoe_trader"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Biometric Face Photo / Selfie (Upload File Only) */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-white/10 pb-4">
                      6. Biometric Selfie Photo Verification
                    </h3>

                    <p className="text-base font-semibold text-zinc-200 leading-relaxed">
                      Select and upload an existing clear photo or selfie image file directly from your phone or device gallery.
                    </p>

                    <input
                      type="file"
                      ref={selfieFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) {
                              setKycSelfie(evt.target.result as string);
                              triggerAlert('success', `📁 Selfie photo uploaded from device gallery: ${file.name}`);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <div className="flex flex-col lg:flex-row items-center gap-8 p-6 bg-zinc-950/80 rounded-2xl border-2 border-white/10">
                      <div className="relative h-44 w-44 rounded-full border-4 border-cyan-400 flex items-center justify-center overflow-hidden bg-black flex-shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                        {kycSelfie ? (
                          <div className="h-full w-full relative">
                            <img src={kycSelfie.startsWith('http') || kycSelfie.startsWith('data:') ? kycSelfie : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&h=180&q=80"} className="h-full w-full object-cover" alt="Biometric Selfie Photo" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-cyan-400/10 border-2 border-cyan-400/30 pointer-events-none rounded-full" />
                          </div>
                        ) : (
                          <div className="text-center px-4 space-y-2">
                            <span className="text-3xl block">👤</span>
                            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block font-mono">No Photo</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 text-left flex-1">
                        <h5 className="text-xl font-black text-white uppercase tracking-wider">Upload Biometric Selfie Image File</h5>
                        <p className="text-base font-semibold text-zinc-300 leading-relaxed">
                          Ensure your face is well-lit, clearly centered, and unobscured by glasses or hats.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => selfieFileInputRef.current?.click()}
                            className="px-6 py-4 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)] font-display"
                          >
                            📁 Upload Selfie Photo from Device Gallery
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setKycSelfie("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&h=180&q=80");
                              triggerAlert('success', 'Sample biometric selfie photo loaded.');
                            }}
                            className="px-5 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-mono font-black text-white uppercase tracking-wider transition cursor-pointer"
                          >
                            Sample Photo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Statement Upload Verification (Upload File Only) */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-white/10 pb-4">
                      7. Video Verification Statement
                    </h3>

                    <p className="text-base font-semibold text-zinc-200 leading-relaxed">
                      Record a short verification video using your phone or camera clearly reciting the exact declaration below, then upload the video file here.
                    </p>

                    <input
                      type="file"
                      ref={videoFileInputRef}
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setKycVideoUrl(file.name);
                          triggerAlert('success', `📁 Recorded video statement uploaded: ${file.name}`);
                        }
                      }}
                    />

                    <div className="space-y-6">
                      <div className="p-6 bg-black border-2 border-amber-400/50 rounded-2xl font-display text-center shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                        <span className="block text-xs text-amber-300 font-mono tracking-widest uppercase font-black mb-3">📜 EXACT STATEMENT TO SPEAK IN YOUR RECORDED VIDEO</span>
                        <p className="text-lg font-black text-white italic tracking-wide leading-relaxed">
                          "Hello, I am <span className="text-cyan-300 not-italic font-mono underline">{kycFullName || user.name || 'Applicant'}</span>, requesting this credit line facility from Eloan Capital today, <span className="text-amber-300 not-italic font-mono font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>. This video serves as proof of my identity and authorization."
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-zinc-950/80 rounded-2xl border-2 border-white/10">
                        <div className="relative h-28 w-48 rounded-xl border-2 border-cyan-400/40 bg-black flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                          {kycVideoUrl ? (
                            <div className="text-center space-y-1 p-2">
                              <span className="text-2xl block">🎥</span>
                              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block font-black">Video Ready</span>
                              <span className="text-[10px] font-mono text-zinc-300 block truncate max-w-[160px]">{kycVideoUrl}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 font-mono text-xs uppercase font-bold">No Video Selected</span>
                          )}
                        </div>

                        <div className="space-y-3 text-left flex-1">
                          <h5 className="text-base font-black text-white uppercase tracking-wider">Upload Recorded Video File</h5>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => videoFileInputRef.current?.click()}
                              className="px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)] font-display"
                            >
                              📁 Upload Recorded Video File
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setKycVideoUrl("liveness_video_recording_8821.mp4");
                                triggerAlert('success', 'Sample video statement loaded.');
                              }}
                              className="px-4 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-mono font-bold text-white transition cursor-pointer"
                            >
                              Sample Video
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Applicant undertaking & electronic signature */}
                  <div className="bg-black/40 border-2 border-white/10 p-8 rounded-3xl space-y-6">
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight border-b-2 border-white/10 pb-4">
                      8. Applicant Undertaking & Electronic Signature
                    </h3>

                    <div className="p-6 bg-cyan-950/40 border-2 border-cyan-400/40 rounded-2xl space-y-3 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                      <p className="text-xs font-mono text-cyan-300 uppercase tracking-widest font-black">Official Legal Undertaking Declaration</p>
                      <p className="text-base sm:text-lg text-white font-bold leading-relaxed">
                        "I, <span className="text-cyan-300 underline font-black font-mono">{kycFullName || user.name || 'Applicant'}</span>, hereby declare under penalty of perjury that all personal, financial, and identity information supplied in this onboarding portfolio is accurate, truthful, and authentic. I confirm that all uploaded documents are genuine government-issued credentials. I understand that providing false or misleading information carries legal consequences and may result in immediate loan rejection, termination of services, and reporting to legal authorities. I agree to the terms and conditions of Eloan Capital."
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer text-base font-bold text-white hover:text-cyan-300 select-none text-left">
                        <input
                          type="checkbox"
                          required
                          checked={kycDeclaresAccuracy}
                          onChange={(e) => setKycDeclaresAccuracy(e.target.checked)}
                          className="rounded border-zinc-600 bg-zinc-900 text-cyan-400 focus:ring-0 h-6 w-6 mt-0.5 cursor-pointer flex-shrink-0"
                        />
                        <span>I confirm and accept the legal undertaking above and declare that all information provided is true and authentic.</span>
                      </label>

                      <div className="pt-2">
                        <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2">Type Full Legal Name as Electronic Signature *</label>
                        <input
                          type="text"
                          required
                          value={kycSignature}
                          onChange={(e) => setKycSignature(e.target.value)}
                          placeholder={kycFullName || user.name || 'Johnathan Doe'}
                          className="w-full px-5 py-4 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-lg font-mono font-black text-white focus:outline-none"
                        />
                        <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-2">
                          Typed signature must match legal applicant name: <strong className="text-cyan-400 font-mono font-black">{kycFullName || user.name || 'Johnathan Doe'}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3D Action controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8" id="apply-nav-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="relative group rounded-xl bg-zinc-700 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer w-full sm:w-auto"
                    >
                      <span className="absolute inset-0 rounded-xl bg-zinc-800 translate-y-1 block"></span>
                      <span className="relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-600 text-white text-xs font-extrabold uppercase tracking-widest -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 font-display">
                        ← Back to Page 1
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleUnifiedSubmit}
                      className="relative group rounded-xl bg-cyan-500 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer w-full sm:w-auto"
                      id="btn-apply-submit-3d"
                    >
                      <span className="absolute inset-0 rounded-xl bg-cyan-700 translate-y-1 block"></span>
                      <span className="relative flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-cyan-400 text-black text-xs font-black uppercase tracking-widest -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 font-display">
                        {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Submit Loan Application 🚀"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------- 4. KYC DOCUMENT CENTER & SOVEREIGN CLEARANCE Certificate ---------------- */}
          {activeTab === 'kyc' && (
            <div className="max-w-4xl mx-auto py-8 space-y-10" id="view-kyc">
              {/* Header */}
              <div className="text-left">
                <h3 className="font-display text-3xl font-black text-white uppercase tracking-tight">Compliance & Sovereign Identity</h3>
                <p className="text-sm text-cyan-400 font-mono uppercase tracking-widest mt-1">Sovereign identity parameters, security clearances, and underwriting validations.</p>
              </div>

              {/* Status Header */}
              <div className="p-8 rounded-3xl bg-zinc-950/80 border-2 border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="kyc-status-header">
                <div className="space-y-2 text-left">
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-black">Institutional Compliance Verdict</span>
                  <h4 className="text-2xl font-display font-black text-white uppercase tracking-wider">
                    {kycStatus?.status === 'Approved' ? '✅ Sovereign Clearance Active' :
                     kycStatus?.status === 'Pending' ? '⏳ Underactive Audit Queue' :
                     kycStatus?.status === 'Rejected' ? '❌ Security Audit Failed' :
                     '⚠️ Onboarding Audit Required'}
                  </h4>
                  <p className="text-base font-semibold text-zinc-300 leading-relaxed">
                    {kycStatus?.status === 'Approved' ? 'Your identity coordinates have been verified against international federal registries and credit bureaus.' :
                     kycStatus?.status === 'Pending' ? (kycCountry === 'United States' ? 'Our compliance team is reviewing your submitted SSN and identity documents.' : 'Our compliance team is reviewing your submitted identity documents and verification information.') :
                     kycStatus?.status === 'Rejected' ? 'Re-submission requested. Please check administrative feedback and correct parameters.' :
                     'Submit your administrative coordinates and identity verification portfolio to activate sovereign capital limit drawdowns.'}
                  </p>
                  <p className="text-xs font-mono font-black text-cyan-400 mt-2 uppercase tracking-widest">
                    ⏱️ Estimated Review Time: 24–72 Hours
                  </p>
                  {kycStatus?.remarks && (
                    <div className="p-3 bg-red-950/20 border border-red-500/20 text-xs font-mono text-red-400 rounded-xl mt-3">
                      Compliance Officer Remarks: {kycStatus.remarks}
                    </div>
                  )}
                </div>
                <span className={`px-6 py-2.5 font-mono text-xs font-black rounded-xl border-2 uppercase tracking-widest shadow-md ${
                  kycStatus?.status === 'Approved' ? 'bg-cyan-950/60 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' :
                  kycStatus?.status === 'Pending' ? 'bg-amber-950/60 border-amber-500 text-amber-500 animate-pulse' :
                  kycStatus?.status === 'Rejected' ? 'bg-red-950/60 border-red-500 text-red-500' :
                  'bg-white/5 border-zinc-700 text-zinc-400'
                }`}>
                  {kycStatus?.status || 'UNSUBMITTED'}
                </span>
              </div>

              {/* If Unsubmitted or Rejected, show Unified Onboarding Call to Action */}
              {(kycStatus === null || kycStatus?.status === 'Rejected' || kycStatus?.status === 'Pending_Upload') && (
                <div className="p-8 rounded-3xl bg-gradient-to-br from-neutral-900/80 to-black border-2 border-dashed border-zinc-700 space-y-6 text-center animate-fade-in" id="kyc-prompt-unified">
                  <div className="h-16 w-16 bg-cyan-950/60 border-2 border-cyan-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <ShieldCheck className="h-8 w-8 text-cyan-400 stroke-[2.5]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Unified Account Verification & Compliance</h4>
                    <p className="text-base text-zinc-200 max-w-2xl mx-auto leading-relaxed font-bold">
                      We have streamlined our processes! You no longer need to fill out separate KYC forms. Identity verification, SSN check, biometric proof, and business documents are now fully integrated into a <strong className="text-cyan-300 font-mono font-black">single, 2-page Capital Limit application</strong>.
                    </p>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('apply');
                        setWizardStep(1);
                      }}
                      className="relative group rounded-xl bg-cyan-500 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer w-full sm:w-auto"
                      id="btn-kyc-redirect-apply"
                    >
                      <span className="absolute inset-0 rounded-xl bg-cyan-700 translate-y-1 block"></span>
                      <span className="relative flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-cyan-400 text-black text-xs font-black uppercase tracking-widest -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 font-display">
                        Start Unified Capital Application 🚀
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* If Pending, show active analysis tracker */}
              {kycStatus?.status === 'Pending' && (
                <div className="p-10 rounded-3xl bg-zinc-950/90 border-2 border-zinc-700 space-y-6 text-center animate-fade-in" id="kyc-pending-status-card">
                  <RefreshCw className="h-14 w-14 text-cyan-400 mx-auto animate-spin stroke-[2.5]" />
                  <div className="space-y-2">
                    <h4 className="font-display text-2xl font-black text-white uppercase tracking-tight">Validating Sovereign Credentials</h4>
                    <p className="text-base text-zinc-200 max-w-xl mx-auto leading-relaxed font-bold">
                      Federal compliance agencies and international underwriters are verifying your details. Encryption endpoints are active, and no manual actions are required.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono font-black uppercase tracking-wider text-left max-w-2xl mx-auto">
                    <div className="p-4 bg-black/60 rounded-xl border border-zinc-700 flex items-center gap-3 text-white">
                      <span className="text-cyan-400 text-base">●</span> <span>SSN Verification</span>
                    </div>
                    <div className="p-4 bg-black/60 rounded-xl border border-zinc-700 flex items-center gap-3 text-white">
                      <span className="text-cyan-400 text-base">●</span> <span>Biometric Match</span>
                    </div>
                    <div className="p-4 bg-black/60 rounded-xl border border-zinc-700 flex items-center gap-3 text-white">
                      <span className="text-cyan-400 text-base">●</span> <span>Sovereign ID Verification</span>
                    </div>
                  </div>
                </div>
              )}

              {/* If Approved, show the highly premium Sovereign institutional clearance certificate */}
              {kycStatus?.status === 'Approved' && (
                <div className="p-10 rounded-3xl bg-zinc-950/90 border-4 border-double border-cyan-400/60 relative overflow-hidden text-left animate-fade-in shadow-[0_0_40px_rgba(34,211,238,0.15)]" id="kyc-certificate">
                  {/* Decorative corner borders */}
                  <div className="absolute top-4 left-4 h-8 w-8 border-t-2 border-l-2 border-cyan-400/60" />
                  <div className="absolute top-4 right-4 h-8 w-8 border-t-2 border-r-2 border-cyan-400/60" />
                  <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-cyan-400/60" />
                  <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-cyan-400/60" />

                  {/* Watermark Logo */}
                  <div className="absolute right-10 top-10 text-cyan-400/5 select-none pointer-events-none font-display font-black text-9xl">
                    ELON
                  </div>

                  <div className="space-y-8 relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-white/10 pb-6">
                      <div>
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-black">Elon Capital underwriting Group</span>
                        <h4 className="text-2xl font-display font-black text-white uppercase tracking-tight mt-1">Sovereign Clearance Certificate</h4>
                      </div>
                      <div className="text-right font-mono text-xs font-black text-zinc-400">
                        <div>CERTIFICATE ID: <span className="text-white font-black font-mono">SOV-{Math.floor(100000 + Math.random() * 900000)}</span></div>
                        <div>ISSUED ON: <span className="text-white font-black font-mono">{new Date().toLocaleDateString()}</span></div>
                      </div>
                    </div>

                    <p className="text-base text-zinc-200 leading-relaxed font-bold">
                      This certificate declares that the corporate identity and administrative parameters of <strong className="text-white font-black">{kycFullName || user.name}</strong> have been thoroughly processed and audited through accredited sovereign identity registers, international compliance networks, and biometric liveness filters.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-black/60 rounded-xl border border-zinc-700 flex items-center justify-between text-xs font-black">
                        <span className="font-mono text-zinc-300 uppercase">Verification Level</span>
                        <span className="font-black text-cyan-400 uppercase tracking-wider">Level 3 Clearance</span>
                      </div>
                      <div className="p-4 bg-black/60 rounded-xl border border-zinc-700 flex items-center justify-between text-xs font-black">
                        <span className="font-mono text-zinc-300 uppercase">Drawdown Parameters</span>
                        <span className="font-black text-cyan-400 uppercase tracking-wider">Up to $500M institutionally</span>
                      </div>
                      <div className="p-4 bg-black/60 rounded-xl border border-zinc-700 flex items-center justify-between text-xs font-black">
                        <span className="font-mono text-zinc-300 uppercase">Biometric Match</span>
                        <span className="font-black text-cyan-400 uppercase tracking-wider">Verified 99.8% Match</span>
                      </div>
                      <div className="p-4 bg-black/60 rounded-xl border border-zinc-700 flex items-center justify-between text-xs font-black">
                        <span className="font-mono text-zinc-300 uppercase">Country jurisdiction</span>
                        <span className="font-black text-cyan-400 uppercase tracking-wider">{kycCountry || 'United States'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-6 border-t border-white/10">
                      <div className="space-y-1">
                        <span className="block text-xs text-zinc-400 font-mono font-black uppercase tracking-widest">Electronic Signature Verification</span>
                        <span className="text-2xl font-display text-white font-black italic">{kycSignature || user.name}</span>
                      </div>
                      <div className="p-3 bg-cyan-950/40 border-2 border-cyan-400 text-xs font-mono font-black text-cyan-300 rounded-xl uppercase tracking-wider">
                        🛡️ SECURED COMPLIANCE BLOCKCHAIN ENVELOPE
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------- 5. MESSAGES DESK ---------------- */}
          {activeTab === 'messages' && (
            <div className="space-y-6 flex flex-col justify-between h-[520px]" id="view-messages">
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-1 uppercase tracking-tight">Administrative Message Desk</h3>
                <p className="text-sm font-semibold text-zinc-300">Direct encrypted communications with the compliance and financial officer desks.</p>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 py-4 max-h-[340px]" id="chat-thread">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-zinc-300 text-sm font-bold">
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
                        <span className="font-mono text-xs text-cyan-400 font-black mb-1">{msg.senderName}</span>
                        <div className={`p-4 rounded-xl text-sm font-bold max-w-sm leading-relaxed ${
                          isAdmin 
                            ? 'bg-zinc-900 border-2 border-zinc-700 text-white rounded-tl-none' 
                            : 'bg-cyan-400 text-black font-black rounded-tr-none shadow-md'
                        }`}>
                          {msg.content}
                          {msg.attachment && (
                            <div className="mt-2 pt-2 border-t border-black/20 text-xs font-mono font-bold flex items-center gap-1.5 opacity-90">
                              <span>📎 Attachment: {msg.attachment.name}</span>
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-[10px] font-bold text-zinc-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Send */}
              <form onSubmit={handleSendMessage} className="border-t border-white/10 pt-4" id="form-chat-send">
                {msgAttachment && (
                  <div className="mb-2 p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-cyan-300">📎 Attached: {msgAttachment.name}</span>
                    <button type="button" onClick={() => setMsgAttachment(null)} className="text-red-400 hover:underline font-black">Remove</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMsgAttachment({ name: 'treasury_balance_sheet.pdf', url: '#' })}
                    className="px-4 bg-zinc-900 border-2 border-zinc-700 text-sm font-bold text-zinc-300 hover:text-white hover:border-cyan-400 rounded-xl cursor-pointer"
                    title="Add attachment"
                  >
                    📎
                  </button>
                  <input 
                    type="text" 
                    required
                    value={newMsgContent}
                    onChange={(e) => setNewMsgContent(e.target.value)}
                    className="flex-1 px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-sm font-bold text-white focus:outline-none"
                    placeholder="Type encrypted message..."
                  />
                  <button
                    type="submit"
                    className="px-6 bg-cyan-400 text-black hover:bg-cyan-300 rounded-xl transition-all cursor-pointer font-black shadow-md flex items-center justify-center"
                  >
                    <Send className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---------------- 6. SUPPORT CENTER ---------------- */}
          {activeTab === 'support' && (
            <div className="space-y-8" id="view-support">
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-1 uppercase tracking-tight">Help Desk & Support Center</h3>
                <p className="text-sm font-semibold text-zinc-300">Initiate service tickets or consult platform documentation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Submit New Ticket */}
                <div className="md:col-span-1 space-y-4">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2 font-black">Submit Ticket</h4>
                  <form onSubmit={handleCreateTicket} className="space-y-4" id="form-ticket-create">
                    <div>
                      <label className="block text-xs font-mono font-black text-zinc-300 uppercase mb-2">Subject</label>
                      <input 
                        type="text" 
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-sm font-bold text-white focus:outline-none"
                        placeholder="e.g. Collateral collateral query"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-black text-zinc-300 uppercase mb-2">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-sm font-bold text-white focus:outline-none"
                      >
                        <option>General Inquiry</option>
                        <option>Funding Terms</option>
                        <option>KYC Compliance</option>
                        <option>Security / Passwords</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-black text-zinc-300 uppercase mb-2">Message</label>
                      <textarea 
                        required
                        rows={4}
                        value={ticketMsg}
                        onChange={(e) => setTicketMsg(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-sm font-bold text-white focus:outline-none resize-none"
                        placeholder="Describe your inquiry..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-3.5 text-xs font-black uppercase tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" /> Submit Support Ticket
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
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-tight">Account & Security Settings</h3>
                <p className="text-sm font-semibold text-zinc-300">Audit your security parameters and operational communication channels.</p>
              </div>

              {/* Dynamic Notification log list */}
              <div>
                <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-4 font-black">Notification Center Logs</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2" id="notifications-list">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-zinc-400 font-bold">No active notifications.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-4 bg-zinc-950 border border-white/10 rounded-2xl flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-mono font-bold text-cyan-400 block">{new Date(notif.createdAt).toLocaleString()}</span>
                          <h5 className="text-base font-black text-white">{notif.title}</h5>
                          <p className="text-sm text-zinc-300 leading-relaxed font-semibold">{notif.content}</p>
                        </div>
                        {!notif.isRead && (
                          <span className="h-2.5 w-2.5 bg-cyan-400 rounded-full flex-shrink-0 animate-ping mt-1" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Edit Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Profile preferences */}
                <form onSubmit={handleUpdateProfile} className="space-y-6" id="form-profile-update">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2 font-black">Profile Details</h4>
                  
                  <div>
                    <label className="block text-xs font-mono font-black text-zinc-300 uppercase mb-2">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-black text-zinc-300 uppercase mb-2">Country Location</label>
                    <CountrySelector
                      selectedCountry={profileCountry}
                      onChange={(cName, dCode) => setProfileCountry(cName)}
                      id="profile-country"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-mono font-black text-zinc-300 uppercase">Notification Preferences</label>
                    
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-white hover:text-cyan-300 select-none">
                      <input 
                        type="checkbox"
                        checked={notifPref.emailUpdates}
                        onChange={(e) => setNotifPref({ ...notifPref, emailUpdates: e.target.checked })}
                        className="rounded border-zinc-600 bg-zinc-900 text-cyan-400 focus:ring-0 h-5 w-5"
                      />
                      Transmit secure email newsletters
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-white hover:text-cyan-300 select-none">
                      <input 
                        type="checkbox"
                        checked={notifPref.applicationAlerts}
                        onChange={(e) => setNotifPref({ ...notifPref, applicationAlerts: e.target.checked })}
                        className="rounded border-zinc-600 bg-zinc-900 text-cyan-400 focus:ring-0 h-5 w-5"
                      />
                      Transmit credit application updates
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-3.5 bg-cyan-400 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-cyan-300 transition-all cursor-pointer shadow-lg active:scale-98"
                  >
                    Save Profile Preferences
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
              To activate liquidity of <span className="text-white font-semibold">${payingCollateralLoan.fundingDetails.requestedAmount.toLocaleString()}</span>, compliance requires the settlement of a **25% refundable collateral deposit** of <span className="text-cyan-400 font-mono font-bold">${(payingCollateralLoan.fundingDetails.requestedAmount * 0.25).toLocaleString()}</span> and a **3.5% non-refundable processing fee** of <span className="text-yellow-500 font-mono font-bold">${(payingCollateralLoan.fundingDetails.requestedAmount * 0.035).toLocaleString()}</span>. The total transmission amount is <span className="text-white font-mono font-bold">${(payingCollateralLoan.fundingDetails.requestedAmount * 0.285).toLocaleString()}</span>. The collateral deposit is fully protected and refundable upon contract maturity.
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

      {/* ----------------- LOAN CALCULATOR MODAL ----------------- */}
      {isCalcOpen && (() => {
        const calcRate = calcMonths <= 12 ? 15 : 25;
        const calcTotalInterest = calcAmount * (calcRate / 100);
        const calcTotalPayback = calcAmount + calcTotalInterest;
        const calcMonthly = calcMonths > 0 ? Math.round(calcTotalPayback / calcMonths) : 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
            <div className="relative w-full max-w-lg bg-neutral-950 border border-white/10 rounded-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-fade-in text-left">
              <button
                onClick={() => setIsCalcOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white font-mono text-xs uppercase transition-colors"
              >
                ✕ Close
              </button>

              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                FINANCIAL ARCHITECTURE LAB
              </span>
              <h3 className="font-display text-xl font-bold text-white tracking-wide uppercase mb-2">
                Capital Credit Calculator
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed mb-6">
                Simulate collateral lines and structured amortization rates across institutional capital bands.
              </p>

              <div className="space-y-6">
                {/* Slider 1: Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-500 uppercase">Capital Request</span>
                    <span className="text-cyan-400 font-bold">${calcAmount.toLocaleString()} USD</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="500000000"
                    step="1000"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-ew-resize bg-white/10 h-1 rounded"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-gray-600">
                    <span>$1,000</span>
                    <span>$500,000,000</span>
                  </div>
                </div>

                {/* Slider 2: Tenure */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-500 uppercase">Amortization Period</span>
                    <span className="text-cyan-400 font-bold">{calcMonths} Months</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="60"
                    step="6"
                    value={calcMonths}
                    onChange={(e) => setCalcMonths(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-ew-resize bg-white/10 h-1 rounded"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-gray-600">
                    <span>6 Mos</span>
                    <span>60 Mos</span>
                  </div>
                </div>

                {/* Calculations Box */}
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3.5 text-xs font-mono">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500 uppercase">25% Refundable Collateral</span>
                    <span className="text-white font-bold">${(calcAmount * 0.25).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500 uppercase">One-Time Setup Fee (3.5%)</span>
                    <span className="text-white font-bold">${(calcAmount * 0.035).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500 uppercase">Interest Rate Applied</span>
                    <span className="text-cyan-400 font-bold">{calcRate}% Non-Compounding</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500 uppercase">Monthly Repayment</span>
                    <span className="text-white font-bold">
                      ${calcMonthly.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 uppercase font-semibold">Total Amortized Value</span>
                    <span className="text-cyan-400 font-bold">
                      ${calcTotalPayback.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCalcOpen(false)}
                  className="w-full py-3 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-white border border-transparent hover:border-white/5 rounded-xl transition"
                >
                  Close Model
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCalcOpen(false);
                    handleTabChange('apply');
                  }}
                  className="w-full py-3 text-xs font-bold uppercase tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 transition rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                >
                  Apply for this limit
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ----------------- PAYMENT HISTORY MODAL ----------------- */}
      {isHistoryOpen && (() => {
        const activeLoan = loans[0];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
            <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-fade-in text-left">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white font-mono text-xs uppercase transition-colors"
              >
                ✕ Close
              </button>

              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                SECURE TRANSACTION LOGS
              </span>
              <h3 className="font-display text-xl font-bold text-white tracking-wide uppercase mb-2">
                Capital Ledger Audits
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed mb-6">
                Transparent cryptographic history of corporate deposits, collateral settlements, and capital payouts.
              </p>

              <div className="overflow-x-auto border border-white/5 rounded-xl">
                <table className="w-full text-xs text-left text-gray-400">
                  <thead className="text-[9px] uppercase font-mono tracking-wider bg-white/[0.02] border-b border-white/5 text-gray-500">
                    <tr>
                      <th className="p-4 font-normal">Date / Timestamp</th>
                      <th className="p-4 font-normal">Classification</th>
                      <th className="p-4 font-normal">Audit Reference</th>
                      <th className="p-4 font-normal">Value (USD)</th>
                      <th className="p-4 font-normal">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {/* Collateral entry if paid */}
                    {activeLoan && activeLoan.collateralPaid && (
                      <tr className="hover:bg-white/[0.01]">
                        <td className="p-4 text-gray-500">{new Date(activeLoan.updatedAt || activeLoan.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-white font-sans font-bold">Collateral Deposit</td>
                        <td className="p-4 text-cyan-400 text-[10px] break-all max-w-[120px]">{activeLoan.collateralTxId}</td>
                        <td className="p-4 text-emerald-400 font-bold">${(activeLoan.fundingDetails.requestedAmount * 0.15).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    )}
                    {/* Principal entry pending dispatch */}
                    {activeLoan && activeLoan.collateralPaid && (
                      <tr className="hover:bg-white/[0.01]">
                        <td className="p-4 text-gray-500">{new Date(activeLoan.updatedAt || activeLoan.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-white font-sans font-bold">Principal Dispatch</td>
                        <td className="p-4 text-gray-600 text-[10px]">Processing...</td>
                        <td className="p-4 text-cyan-400 font-bold">${activeLoan.fundingDetails.requestedAmount.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 uppercase font-semibold animate-pulse">
                            Clearing
                          </span>
                        </td>
                      </tr>
                    )}
                    {/* Approved loan collateral pending */}
                    {activeLoan && activeLoan.status === 'Approved' && !activeLoan.collateralPaid && (
                      <tr className="hover:bg-white/[0.01]">
                        <td className="p-4 text-gray-500">{new Date(activeLoan.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-white font-sans font-bold">Collateral Settlement</td>
                        <td className="p-4 text-gray-600 text-[10px]">Pending Payment</td>
                        <td className="p-4 text-yellow-400 font-bold">${(activeLoan.fundingDetails.requestedAmount * 0.15).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[9px] bg-yellow-950/40 text-yellow-400 border border-yellow-500/20 uppercase font-semibold">
                            Pending
                          </span>
                        </td>
                      </tr>
                    )}
                    {/* Fallback empty logs */}
                    {(!activeLoan || (activeLoan.status !== 'Approved' && !activeLoan.collateralPaid)) && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-600 uppercase tracking-wider text-[10px]">
                          No transactional records found. Submit an approved capital application to begin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg hover:text-white transition-all border border-white/10 uppercase tracking-widest font-mono"
                >
                  Dismiss Ledger
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
