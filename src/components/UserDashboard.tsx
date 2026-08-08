import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  CreditCard,
  X,
  Eye,
  EyeOff,
  Key,
  Mail
} from 'lucide-react';
import { Calculator, History, Clock, ArrowRight, ArrowLeft, ArrowUpRight, CheckCircle2, User as UserIcon, Percent } from 'lucide-react';
import CountrySelector from './CountrySelector';
import SearchableSelect from './SearchableSelect';
import LoanCalculatorPage from './LoanCalculatorPage';
import { auth } from '../firebase';
import { updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';
import { getApiUrl } from '../utils/api';
import { useTranslation } from 'react-i18next';

const getInterestRateFromPreference = (prefStr?: string): number => {
  if (!prefStr) return 15;
  const match = prefStr.match(/(\d+)\s*months?/i);
  if (match) {
    const months = parseInt(match[1], 10);
    return months <= 12 ? 15 : 20;
  }
  return 15;
};

const calculateTotalRepayable = (loan: LoanApplication): number => {
  const principal = loan.fundingDetails?.requestedAmount || 0;
  const rate = getInterestRateFromPreference(loan.fundingDetails?.repaymentPreference);
  return Math.round(principal * (1 + rate / 100));
};

interface UserDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
  defaultTab?: 'account' | 'overview' | 'apply' | 'loans' | 'repayment' | 'kyc' | 'calculator' | 'messages' | 'support' | 'settings';
  onTabChange?: (tab: 'account' | 'overview' | 'apply' | 'loans' | 'repayment' | 'kyc' | 'calculator' | 'messages' | 'support' | 'settings') => void;
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<'account' | 'overview' | 'apply' | 'loans' | 'repayment' | 'kyc' | 'calculator' | 'messages' | 'support' | 'settings'>(defaultTab || 'account');

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabChange = (tab: 'account' | 'overview' | 'apply' | 'loans' | 'repayment' | 'kyc' | 'calculator' | 'messages' | 'support' | 'settings') => {
    setActiveTab(tab);
    if (tab === 'messages') {
      fetch(getApiUrl('/api/messages'), { headers: { 'Authorization': `Bearer ${token}` } });
      setUnreadMsgCount(0);
    }
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

  // Loan Submission Confirmation Modal State
  const [submittedLoanConfirmation, setSubmittedLoanConfirmation] = React.useState<{ id: string; amount: number } | null>(null);

  // Collateral payment form state
  const [payingCollateralLoan, setPayingCollateralLoan] = React.useState<LoanApplication | null>(null);
  const [collateralTxIdInput, setCollateralTxIdInput] = React.useState('');
  const [collateralPaymentMethod, setCollateralPaymentMethod] = React.useState<'Crypto' | 'Wire'>('Crypto');
  const [selectedInstallmentNum, setSelectedInstallmentNum] = React.useState<number>(1);
  const [isPayFullCrypto, setIsPayFullCrypto] = React.useState<boolean>(false);

  // Repayment form state
  const [repaymentMethod, setRepaymentMethod] = React.useState<'Crypto' | 'Wire'>('Crypto');
  const [repaymentCryptoAsset, setRepaymentCryptoAsset] = React.useState<'USDT (TRC-20)' | 'USDT (ERC-20)' | 'BTC' | 'ETH'>('USDT (TRC-20)');
  const [repaymentTxInput, setRepaymentTxInput] = React.useState('');
  const [repaymentAmountInput, setRepaymentAmountInput] = React.useState('');

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

  // Withdrawal Modal States
  const [withdrawalModal, setWithdrawalModal] = React.useState<LoanApplication | null>(null);
  const [withdrawType, setWithdrawType] = React.useState<'crypto' | 'bank'>('crypto');
  const [withdrawCryptoAsset, setWithdrawCryptoAsset] = React.useState('USDT (TRC-20)');
  const [withdrawCryptoNetwork, setWithdrawCryptoNetwork] = React.useState<'ERC-20' | 'BEP-20' | 'TRC-20' | 'SOL'>('TRC-20');
  const [withdrawValidationError, setWithdrawValidationError] = React.useState<string | null>(null);
  const [withdrawWalletAddress, setWithdrawWalletAddress] = React.useState('');
  const [withdrawBankName, setWithdrawBankName] = React.useState('');
  const [withdrawAccountNo, setWithdrawAccountNo] = React.useState('');
  const [withdrawSwiftCode, setWithdrawSwiftCode] = React.useState('');
  const [withdrawAccountName, setWithdrawAccountName] = React.useState('');
  const [withdrawalSubmitted, setWithdrawalSubmitted] = React.useState(false);

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
  const userMsgImageInputRef = React.useRef<HTMLInputElement | null>(null);

  // Ticket Form States
  const [ticketSubject, setTicketSubject] = React.useState('');
  const [ticketCategory, setTicketCategory] = React.useState('General Inquiry');
  const [ticketMsg, setTicketMsg] = React.useState('');
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
  const [ticketReply, setTicketReply] = React.useState('');

  // Settings State
  const [profileName, setProfileName] = React.useState(user.name);
  const [profileEmail, setProfileEmail] = React.useState(user.email);
  const [profilePhone, setProfilePhone] = React.useState(user.phone);
  const [profileCountry, setProfileCountry] = React.useState(user.country);
  const [profilePhoto, setProfilePhoto] = React.useState(user.profilePhoto || '');
  const [showUserPassword, setShowUserPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  
  // Password Reset States
  const [otpSentCode, setOtpSentCode] = React.useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = React.useState('');
  const [newPasswordVal, setNewPasswordVal] = React.useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = React.useState('');
  const [isSendingOtp, setIsSendingOtp] = React.useState(false);

  // Email Reset States
  const [newEmailInput, setNewEmailInput] = React.useState('');
  const [emailOtpSentCode, setEmailOtpSentCode] = React.useState<string | null>(null);
  const [enteredEmailOtp, setEnteredEmailOtp] = React.useState('');
  const [isSendingEmailOtp, setIsSendingEmailOtp] = React.useState(false);
  const [notifPref, setNotifPref] = React.useState(user.notificationPreferences || {
    emailUpdates: true,
    applicationAlerts: true,
    securityAlerts: true
  });

  // REDESIGN MODALS STATE
  const [isCalcOpen, setIsCalcOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [collateralNoticeModal, setCollateralNoticeModal] = React.useState<LoanApplication | null>(null);
  const [calcAmount, setCalcAmount] = React.useState(50000);
  const [calcMonths, setCalcMonths] = React.useState(24);

  // Debited loan tracking & real-time transaction ledger state
  const [withdrawnLoanIds, setWithdrawnLoanIds] = React.useState<string[]>([]);
  const [customTransactions, setCustomTransactions] = React.useState<Array<{
    id: string;
    date: string;
    description: string;
    type: 'credit' | 'debit' | 'escrow';
    amount: number;
    method: string;
    status: string;
  }>>([]);

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

  // Fetch all user state elements
  const fetchAllData = React.useCallback(async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch loans
      const resLoans = await fetch(getApiUrl('/api/loans/list'), { headers });
      if (resLoans.ok) {
        const fetchedLoans: LoanApplication[] = await resLoans.json();
        setLoans(fetchedLoans);
        const backendWithdrawnIds = fetchedLoans.filter(l => l.withdrawn).map(l => l.id);
        if (backendWithdrawnIds.length > 0) {
          setWithdrawnLoanIds(prev => Array.from(new Set([...prev, ...backendWithdrawnIds])));
        }
      }

      // Fetch kyc
      const resKyc = await fetch(getApiUrl('/api/kyc/status'), { headers });
      if (resKyc.ok) setKycStatus(await resKyc.json());

      // Fetch messages
      const resMsg = await fetch(getApiUrl('/api/messages'), { headers });
      if (resMsg.ok) setMessages(await resMsg.json());

      // Fetch unread messages
      const resUnread = await fetch(getApiUrl('/api/messages/unread'), { headers });
      if (resUnread.ok) {
        const d = await resUnread.json();
        setUnreadMsgCount(d.unreadCount);
      }

      // Fetch tickets
      const resTkt = await fetch(getApiUrl('/api/support/tickets'), { headers });
      if (resTkt.ok) setTickets(await resTkt.json());

      // Fetch notifications
      const resNotif = await fetch(getApiUrl('/api/notifications'), { headers });
      if (resNotif.ok) setNotifications(await resNotif.json());

    } catch (err) {
      console.error('Error fetching dashboard info', err);
    }
  }, [token]);

  React.useEffect(() => {
    fetchAllData();
    // Simple poll loop every 3 seconds for live messaging/updates
    const interval = setInterval(fetchAllData, 3000);
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
      setSubmittedLoanConfirmation({ id: data.application.id, amount: data.application.fundingDetails.requestedAmount });
      
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
      const res = await fetch(getApiUrl('/api/kyc/upload'), {
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
      const loansRes = await fetch(getApiUrl('/api/loans/list'), {
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
    if (!newMsgContent.trim() && !msgAttachment) return;

    try {
      const res = await fetch(getApiUrl('/api/messages/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMsgContent.trim() || (msgAttachment ? `[Attachment: ${msgAttachment.name}]` : 'Attachment'),
          attachment: msgAttachment || undefined,
          imageUrl: msgAttachment?.url && (msgAttachment.url.startsWith('data:image') || msgAttachment.url.startsWith('http') || msgAttachment.url.startsWith('blob:')) ? msgAttachment.url : undefined
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
      const res = await fetch(getApiUrl('/api/support/tickets/create'), {
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
      const res = await fetch(getApiUrl('/api/support/tickets/reply'), {
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
  const safeParseJson = async (res: Response) => {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok && data && data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (err: any) {
      if (err.message && !err.message.includes('JSON')) {
        throw err;
      }
      if (!res.ok) {
        throw new Error(`Server returned HTTP status ${res.status}.`);
      }
      throw new Error('Received non-JSON response from server.');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/user/profile/update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          country: profileCountry,
          profilePhoto: profilePhoto,
          notificationPreferences: notifPref
        })
      });

      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');

      triggerAlert('success', '✨ Account profile details updated in real time!');
      onUpdateUser(data.user);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/send-profile-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.error || 'Failed to generate security OTP.');
      
      setOtpSentCode(data.otpCode);
      triggerAlert('success', `📩 Security verification OTP code sent to ${profileEmail}!`);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setIsSendingEmailOtp(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/send-profile-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.error || 'Failed to generate security OTP.');
      
      setEmailOtpSentCode(data.otpCode);
      triggerAlert('success', `📩 Security verification OTP code sent to ${profileEmail}!`);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput || !newEmailInput.includes('@')) {
      triggerAlert('error', 'Please enter a valid new email address.');
      return;
    }

    setActionLoading(true);

    try {
      if (auth.currentUser) {
        try {
          if (verifyBeforeUpdateEmail) {
            await verifyBeforeUpdateEmail(auth.currentUser, newEmailInput.trim());
          }
        } catch (fbErr: any) {
          console.warn('Firebase verifyBeforeUpdateEmail warning:', fbErr);
        }
      }

      const res = await fetch(getApiUrl('/api/user/profile/update-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newEmail: newEmailInput.trim(),
          otpCode: enteredEmailOtp || undefined
        })
      });

      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.error || 'Email address reset failed.');

      triggerAlert('success', '✉️ Email address updated successfully! If required, check your new inbox for confirmation.');
      if (data.user) {
        onUpdateUser(data.user);
        setProfileEmail(data.user.email);
      }
      setNewEmailInput('');
      setEnteredEmailOtp('');
      setEmailOtpSentCode(null);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordVal) {
      triggerAlert('error', 'Please enter a new password.');
      return;
    }
    if (newPasswordVal !== confirmPasswordVal) {
      triggerAlert('error', 'New passwords do not match. Please recheck.');
      return;
    }

    setActionLoading(true);

    try {
      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, newPasswordVal);
        } catch (fbErr: any) {
          console.warn('Firebase updatePassword warning:', fbErr);
        }
      }

      const res = await fetch(getApiUrl('/api/user/profile/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword: newPasswordVal,
          otpCode: enteredOtp || undefined
        })
      });

      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.error || 'Password update failed.');

      triggerAlert('success', '🔐 Password updated successfully in real time!');
      if (data.user) {
        onUpdateUser(data.user);
      }
      setNewPasswordVal('');
      setConfirmPasswordVal('');
      setEnteredOtp('');
      setOtpSentCode(null);
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStripeCheckout = async (loan: LoanApplication, amount: number, installmentNum: number, payFull: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/payments/create-stripe-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          loanId: loan.id,
          paymentType: 'Collateral & Organizational Fee',
          amount: amount,
          installmentNumber: installmentNum,
          payFull: payFull
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize Stripe payment.');

      if (data.url) {
        window.location.href = data.url;
      } else if (data.isTestMode) {
        // Stripe API key test simulation
        const verifyRes = await fetch(getApiUrl('/api/payments/verify-stripe-session'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sessionId: data.sessionId,
            loanId: loan.id,
            paymentType: 'Collateral & Organizational Fee',
            amount: amount,
            installmentNumber: installmentNum,
            payFull: payFull
          })
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || 'Card verification failed.');

        triggerAlert('success', '🎉 Card Payment verified and confirmed successfully!');
        setPayingCollateralLoan(null);
        setCollateralTxIdInput('');
        await fetchAllData();
      }
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCryptoSubmit = async (loan: LoanApplication, amount: number, installmentNum: number, payFull: boolean) => {
    if (!collateralTxIdInput.trim()) {
      triggerAlert('error', 'Please enter your BEP20 blockchain transaction hash (TxID).');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/payments/submit-crypto'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          loanId: loan.id,
          txHash: collateralTxIdInput.trim(),
          amount: amount,
          paymentType: 'Collateral & Organizational Fee',
          installmentNumber: installmentNum,
          payFull: payFull
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit BEP20 crypto payment proof.');

      triggerAlert('success', '⚡ BEP20 Crypto payment proof submitted for Admin verification!');
      setPayingCollateralLoan(null);
      setCollateralTxIdInput('');
      await fetchAllData();
    } catch (err: any) {
      triggerAlert('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayCollateral = async (loanId: string) => {
    if (!payingCollateralLoan) return;
    const totalSettlement = Math.round(payingCollateralLoan.fundingDetails.requestedAmount * 0.285);
    const instAmount = Math.round(totalSettlement / 4);
    const amountToPay = isPayFullCrypto ? totalSettlement : instAmount;

    if (collateralPaymentMethod === 'Stripe' || collateralPaymentMethod === 'Wire') {
      await handleStripeCheckout(payingCollateralLoan, amountToPay, selectedInstallmentNum, isPayFullCrypto);
    } else {
      await handleCryptoSubmit(payingCollateralLoan, amountToPay, selectedInstallmentNum, isPayFullCrypto);
    }
  };


  // Read notifications helper
  const markNotificationsRead = async () => {
    try {
      await fetch(getApiUrl('/api/notifications/read'), {
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

    // Check for existing active loan application (excluding finished, declined, disbursed, or completed loans)
    const hasActiveLoan = loans.some(l => 
      !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled', 'Disbursed', 'Completed'].includes(l.status) &&
      !l.disbursed
    );
    if (hasActiveLoan) {
      const activeLoan = loans.find(l => 
        !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled', 'Disbursed', 'Completed'].includes(l.status) &&
        !l.disbursed
      );
      triggerAlert('error', `You already have an active loan application (${activeLoan?.id || 'pending'}). Please wait until your active application is completed, rejected, or fully settled before submitting a new application.`);
      return;
    }

    // Comprehensive Page 1 & Page 2 Validations
    if (!kycFullName.trim() || kycFullName.trim().split(/\s+/).length < 2) {
      triggerAlert('error', 'Please enter your full legal name (first and last name).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!kycEmail.trim() || !emailRegex.test(kycEmail.trim())) {
      triggerAlert('error', 'Please enter a valid email address.');
      return;
    }
    if (!kycPhone.trim() || kycPhone.trim().replace(/\D/g, '').length < 7) {
      triggerAlert('error', 'Please enter a valid phone number.');
      return;
    }
    if (!loanPersonal.dob) {
      triggerAlert('error', 'Please enter a valid date of birth.');
      return;
    }
    const dobDate = new Date(loanPersonal.dob);
    const ageYears = (Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (isNaN(dobDate.getTime()) || ageYears < 18) {
      triggerAlert('error', 'Applicant must be at least 18 years of age to apply for credit facility.');
      return;
    }
    if (!loanPersonal.address.trim() || loanPersonal.address.trim().length < 5) {
      triggerAlert('error', 'Please enter your full residential address.');
      return;
    }
    const incomeVal = Number(loanEmployment.income);
    if (isNaN(incomeVal) || incomeVal <= 0) {
      triggerAlert('error', 'Please enter a valid positive monthly income amount.');
      return;
    }
    const amountVal = Number(loanFunding.amount);
    if (isNaN(amountVal) || amountVal < 100) {
      triggerAlert('error', 'Please enter a valid funding amount (minimum $100).');
      return;
    }
    if (!loanFunding.description.trim() || loanFunding.description.trim().length < 10) {
      triggerAlert('error', 'Please provide a detailed purpose or project scope description.');
      return;
    }

    // SSN validation for United States residents
    if (kycCountry === 'United States') {
      const cleanSsn = complianceSsn.replace(/\D/g, '');
      if (!complianceSsn.trim() || cleanSsn.length !== 9) {
        triggerAlert('error', 'Please enter a valid 9-digit Social Security Number (SSN) for United States verification.');
        return;
      }
    }

    if (!kycIdCard || !kycIdCard.trim()) {
      triggerAlert('error', 'Please upload your government-issued identity document scan.');
      return;
    }

    if (!kycSelfie || !kycSelfie.trim()) {
      triggerAlert('error', 'Please upload or capture your biometric selfie photo.');
      return;
    }

    if (!kycVideoUrl || !kycVideoUrl.trim()) {
      triggerAlert('error', 'Please upload your recorded video verification statement.');
      return;
    }

    // Mandatory Declaration checkbox validation
    if (!kycDeclaresAccuracy) {
      triggerAlert('error', '⚠️ Action Required: You must check the declaration box confirming the legal undertaking before submitting your loan application.');
      return;
    }

    // Electronic signature validation
    if (!kycSignature.trim()) {
      triggerAlert('error', 'Please type your full legal name as your electronic signature.');
      return;
    }
    if (kycSignature.trim().toLowerCase() !== kycFullName.trim().toLowerCase()) {
      triggerAlert('error', `Your electronic signature ("${kycSignature.trim()}") must match your full legal name ("${kycFullName.trim()}").`);
      return;
    }

    setActionLoading(true);

    try {
      // 1. Submit KYC Portfolio
      const kycPayload = {
        idCardUrl: kycIdCard.trim(),
        selfieUrl: kycSelfie.trim(),
        addressProofUrl: kycProofOfAddress.trim() || '',
        businessDocUrl: kycBusiness.trim() || '',
        fullName: kycFullName.trim(),
        dob: loanPersonal.dob,
        phone: kycPhone.trim(),
        email: kycEmail.trim(),
        country: kycCountry,
        residentialAddress: loanPersonal.address.trim(),
        proofOfAddressUrl: kycProofOfAddress.trim() || '',
        employmentStatus: loanEmployment.status,
        maritalStatus: loanPersonal.marital,
        loanPurpose: loanFunding.purpose,
        loanDescription: loanFunding.description.trim(),
        socialHandles: [singleSocialHandle || twitterUsername, linkedinUsername].filter(Boolean).map(u => u.trim()).join(', ') || 'N/A',
        idType: kycIdType,
        videoUrl: kycVideoUrl.trim()
      };

      const kycRes = await fetch(getApiUrl('/api/kyc/upload'), {
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

      const loanRes = await fetch(getApiUrl('/api/loans/apply'), {
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

      // Pop up submission confirmation modal
      setSubmittedLoanConfirmation({ 
        id: loanData.application.id, 
        amount: loanData.application.fundingDetails.requestedAmount 
      });

      // Reset Form State
      onClearPrefilled?.();
      setWizardStep(1);
      setKycDeclaresAccuracy(false);
      setKycSignature('');
      
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-1 flex flex-col space-y-2.5 bg-zinc-950/80 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl self-start" id="dash-sidebar">
          <button
            onClick={() => handleTabChange('account')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-xs sm:text-sm lg:text-base font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'account' ? 'bg-emerald-950/70 text-emerald-300 border-l-4 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'text-zinc-200 hover:text-white hover:bg-white/[0.03]'
            }`}
            id="tab-btn-account"
          >
            <span className="flex items-center gap-2.5">
              <CreditCard className="h-5 w-5 stroke-[2.5] text-emerald-400 shrink-0" /> Account Vault
            </span>
            <span className="bg-emerald-400 text-black font-mono font-black text-[9px] px-2 py-0.5 rounded-full uppercase shrink-0">USD</span>
          </button>

          <button
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-xs sm:text-sm lg:text-base font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'overview' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Activity className="h-5 w-5 stroke-[2.5] shrink-0" /> Overview & Logs
          </button>

          <button
            onClick={() => handleTabChange('loans')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-xs sm:text-sm lg:text-base font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'loans' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-2.5"><FileText className="h-5 w-5 stroke-[2.5] shrink-0" /> Loan Applications</span>
            {loans.length > 0 && <span className="bg-cyan-400 text-black font-mono font-black text-[10px] px-2 py-0.5 rounded-full shrink-0">{loans.length}</span>}
          </button>

          <button
            onClick={() => handleTabChange('repayment')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-xs sm:text-sm lg:text-base font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'repayment' ? 'bg-emerald-950/70 text-emerald-300 border-l-4 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
            id="tab-btn-repayment"
          >
            <span className="flex items-center gap-2.5"><RefreshCw className="h-5 w-5 stroke-[2.5] text-emerald-400 shrink-0" /> Loan Repayment</span>
            <span className="bg-emerald-400 text-black font-mono font-black text-[9px] px-2 py-0.5 rounded-full uppercase shrink-0">Pay</span>
          </button>

          <button
            onClick={() => handleTabChange('kyc')}
            className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-xs sm:text-sm lg:text-base font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'kyc' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <ShieldCheck className="h-5 w-5 stroke-[2.5] shrink-0" /> Document KYC
          </button>

          <button
            onClick={() => handleTabChange('calculator')}
            className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-xs sm:text-sm lg:text-base font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'calculator' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
            id="tab-btn-calculator"
          >
            <Calculator className="h-5 w-5 stroke-[2.5] text-cyan-400 shrink-0" /> Loan Calculator
          </button>

          <button
            onClick={() => handleTabChange('messages')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-xs sm:text-sm lg:text-base font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'messages' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-2.5"><MessageSquare className="h-5 w-5 stroke-[2.5] shrink-0" /> Message Desk</span>
            {unreadMsgCount > 0 && <span className="bg-cyan-400 text-black font-black font-mono text-[10px] px-2 py-0.5 rounded-full shrink-0">{unreadMsgCount}</span>}
          </button>

          <button
            onClick={() => handleTabChange('support')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-xs sm:text-sm lg:text-base font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'support' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <span className="flex items-center gap-2.5"><HelpCircle className="h-5 w-5 stroke-[2.5] shrink-0" /> Support Center</span>
            {tickets.length > 0 && <span className="bg-white/20 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded-full shrink-0">{tickets.length}</span>}
          </button>

          <button
            onClick={() => { handleTabChange('settings'); markNotificationsRead(); }}
            className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-xs sm:text-sm lg:text-base font-black tracking-wide transition-all font-display cursor-pointer ${
              activeTab === 'settings' ? 'bg-cyan-950/60 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Settings className="h-5 w-5 stroke-[2.5] shrink-0" /> Account Settings
          </button>
        </div>

        {/* WORKSPACE AREA */}
        <div className="lg:col-span-3 bg-white/[0.01] border border-white/5 rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-md shadow-2xl min-h-[500px]" id="dash-workspace">
          
          {/* UNREAD ADMIN MESSAGE ALERT BANNER */}
          {unreadMsgCount > 0 && activeTab !== 'messages' && (
            <div 
              onClick={() => handleTabChange('messages')}
              className="mb-6 p-4 bg-gradient-to-r from-cyan-950 via-cyan-900 to-black border-2 border-cyan-400 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.01] transition-all animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-400 text-black rounded-xl shrink-0">
                  <MessageSquare className="h-6 w-6 stroke-[3]" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-white font-display uppercase tracking-wider">
                    🚨 NEW MESSAGE FROM ELON CAPITAL ADMINISTRATOR ({unreadMsgCount})
                  </h4>
                  <p className="text-xs text-cyan-200 font-bold">
                    The administrative desk has responded to your account request. Click here to open your inbox.
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider rounded-lg font-mono shrink-0 shadow-md">
                View Inbox →
              </span>
            </div>
          )}

          {/* ---------------- 0. ACCOUNT VAULT (USD) ---------------- */}
          {activeTab === 'account' && (() => {
            const disbursedLoan = loans.find(l => l.disbursed === true);
            const activeLoan = loans[0];
            const loanAmount = disbursedLoan ? disbursedLoan.fundingDetails.requestedAmount : 0;
            const isLoanDebited = disbursedLoan ? (withdrawnLoanIds.includes(disbursedLoan.id) || disbursedLoan.withdrawn === true) : false;
            const withdrawableBalance = disbursedLoan ? (isLoanDebited ? 0 : loanAmount) : 0;
            const collateralAmount = (disbursedLoan || activeLoan?.collateralPaid) ? Math.round((disbursedLoan?.fundingDetails.requestedAmount || activeLoan?.fundingDetails.requestedAmount || 0) * 0.25) : 0;
            const totalAccountBalance = withdrawableBalance + collateralAmount;

            return (
              <div className="space-y-8 animate-fade-in" id="view-account-vault">
                {/* 1. TOP USD ACCOUNT BANNER */}
                <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-950/70 via-black to-zinc-950 border-2 border-emerald-500/50 rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] text-left" id="account-top-card">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                          INSTITUTIONAL USD LIQUIDITY ACCOUNT
                        </span>
                        <span className="text-xs font-mono font-black text-white bg-white/10 px-3 py-1 rounded-full">
                          STATUS: ACTIVE & VERIFIED
                        </span>
                      </div>
                      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                        {user.name}'s USD Account
                      </h2>
                    </div>

                    {/* Total Account Balance Card */}
                    <div className="w-full lg:w-auto">
                      <div className="p-6 bg-black/90 border-2 border-emerald-400/80 rounded-2xl shrink-0 text-center space-y-1 shadow-[0_0_35px_rgba(52,211,153,0.35)] min-w-0 sm:min-w-[280px] w-full sm:w-auto">
                        <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wider block">TOTAL ACCOUNT BALANCE</span>
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-emerald-300 tracking-tight">
                          ${totalAccountBalance.toLocaleString()} USD
                        </div>
                        <div className="text-[11px] font-mono font-bold text-gray-300 pt-1.5 flex items-center justify-center gap-2 border-t border-emerald-500/20 mt-1">
                          <span>Loan: ${withdrawableBalance.toLocaleString()}</span>
                          <span>•</span>
                          <span>Collateral: ${collateralAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. LOAN BALANCE & HUGE WITHDRAW BUTTON CARD */}
                <div className="p-6 sm:p-8 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 border-2 border-white/15 rounded-3xl space-y-6 text-left shadow-2xl" id="account-loan-balance-card">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
                    <div className="space-y-3">
                      <span className="text-xs font-mono font-black uppercase tracking-widest text-emerald-400 block flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> DISBURSED CAPITAL BALANCE
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                        Borrowed Loan Balance
                      </h3>
                      <div className="p-4 bg-cyan-950/60 border-2 border-cyan-400/50 rounded-2xl">
                        <p className="text-base sm:text-lg font-black text-cyan-300 leading-snug font-display">
                          This reflects the exact loan capital approved and allocated to your account by Elon Capital Loan.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-black/90 border-2 border-emerald-500/50 rounded-2xl shrink-0 text-center space-y-1 min-w-0 sm:min-w-[240px] w-full sm:w-auto">
                      <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wider block">LOAN BALANCE AMOUNT</span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                        ${withdrawableBalance.toLocaleString()} USD
                      </div>
                      {isLoanDebited ? (
                        <span className="text-[10px] font-mono text-red-400 font-black uppercase block">State: Debited ($0 Remaining)</span>
                      ) : activeLoan ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-black uppercase block">State: Available for Instant Withdrawal</span>
                      ) : (
                        <span className="text-[10px] font-mono text-gray-400 font-black uppercase block">State: Pending Application</span>
                      )}
                    </div>
                  </div>

                  {/* HUGE WITHDRAW BUTTON SECTION */}
                  <div className="pt-2 flex flex-col items-center justify-between gap-4">
                    {!isLoanDebited && activeLoan ? (
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawalModal(activeLoan);
                          setWithdrawalSubmitted(false);
                          setWithdrawValidationError(null);
                        }}
                        className="w-full py-5 sm:py-6 px-8 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-black font-black text-lg sm:text-xl uppercase tracking-wider rounded-2xl transition-all cursor-pointer font-display shadow-[0_0_40px_rgba(52,211,153,0.5)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border-2 border-emerald-300"
                        id="btn-huge-withdraw-loan"
                      >
                        <ArrowUpRight className="h-8 w-8 stroke-[3]" />
                        💸 WITHDRAW LOAN BALANCE NOW
                      </button>
                    ) : isLoanDebited ? (
                      <div className="w-full p-6 bg-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl text-center space-y-2">
                        <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-400 block flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[3]" /> LOAN BALANCE FULLY DEBITED & TRANSFERRED
                        </span>
                        <p className="text-sm font-bold text-gray-200">
                          Your loan balance has been debited and processed for release. If you have any questions regarding settlement, please contact Elon Capital Loan customer service.
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTabChange('apply')}
                        className="w-full py-5 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-lg uppercase tracking-wider rounded-2xl transition-all cursor-pointer font-display shadow-lg flex items-center justify-center gap-3"
                      >
                        <FilePlus className="h-6 w-6 stroke-[3]" />
                        SUBMIT LOAN APPLICATION TO UNLOCK LIQUIDITY
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. REFUNDABLE COLLATERAL VAULT BOX */}
                <div className="p-6 sm:p-8 bg-gradient-to-br from-yellow-950/60 via-black to-zinc-950 border-2 border-yellow-500/60 rounded-3xl space-y-6 text-left shadow-[0_0_40px_rgba(234,179,8,0.15)]" id="account-refundable-collateral-box">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-yellow-500/30">
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono font-black uppercase tracking-widest text-yellow-400 block flex items-center gap-2">
                        <Lock className="h-4 w-4" /> 100% REFUNDABLE COLLATERAL ESCROW
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                        Refundable Collateral Balance
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-200 font-bold leading-relaxed max-w-xl">
                        Your 25% security deposit is held in escrow by <strong className="text-yellow-400">Elon Capital Loan</strong> and is 100% refundable upon loan repayment.
                      </p>
                    </div>

                    <div className="p-4 bg-black/90 border-2 border-yellow-400/50 rounded-2xl shrink-0 text-center space-y-1 min-w-0 sm:min-w-[240px] w-full sm:w-auto">
                      <span className="text-xs font-mono font-black text-yellow-400 uppercase tracking-wider block">ESCROW COLLATERAL VALUE</span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-yellow-300">
                        ${collateralAmount.toLocaleString()} USD
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 uppercase font-black block">🔒 Status: Held in Secured Escrow</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setCollateralNoticeModal(activeLoan || null)}
                      className="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      id="btn-withdraw-refundable-collateral"
                    >
                      <Lock className="h-5 w-5 stroke-[3]" />
                      WITHDRAW REFUNDABLE COLLATERAL
                    </button>

                    <div className="text-xs font-mono font-bold text-yellow-200/90 text-center sm:text-right">
                      🔒 Unlocks automatically upon 100% loan repayment at maturity
                    </div>
                  </div>
                </div>

                {/* 4. REAL-TIME ACCOUNT DEBIT & TRANSACTION HISTORY */}
                <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-3xl space-y-4 text-left" id="account-transaction-ledger">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-xl font-black text-white font-display uppercase tracking-tight">
                        USD Account Transaction History & Debit Ledger
                      </h4>
                      <p className="text-xs text-gray-400 font-bold font-mono">
                        Real-time audit log for all credits, debits, and escrow deposits
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black text-cyan-400 uppercase bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
                      LIVE ACCOUNT LEDGER
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs text-gray-300">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 uppercase font-bold text-[11px]">
                          <th className="py-3 px-2">Date / Time</th>
                          <th className="py-3 px-2">Description</th>
                          <th className="py-3 px-2">Routing Method</th>
                          <th className="py-3 px-2">Amount (USD)</th>
                          <th className="py-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {/* Render custom debited transactions */}
                        {customTransactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 px-2 font-bold text-white">{tx.date}</td>
                            <td className="py-3.5 px-2 font-bold text-amber-300">{tx.description}</td>
                            <td className="py-3.5 px-2 text-gray-300">{tx.method}</td>
                            <td className="py-3.5 px-2 font-black text-red-400 text-sm">-${tx.amount.toLocaleString()} USD</td>
                            <td className="py-3.5 px-2">
                              <span className="px-2.5 py-1 bg-red-950/80 text-red-300 font-bold rounded-md border border-red-500/30 text-[10px]">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {/* Default Disbursed Loan Credit Record */}
                        {activeLoan && (
                          <tr className="hover:bg-white/[0.02]">
                            <td className="py-3.5 px-2 font-bold text-white">{new Date(activeLoan.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td className="py-3.5 px-2 font-bold text-emerald-300">Disbursed Loan Capital Credit</td>
                            <td className="py-3.5 px-2 text-gray-300">Elon Capital Liquidity Pool</td>
                            <td className="py-3.5 px-2 font-black text-emerald-400 text-sm">+${loanAmount.toLocaleString()} USD</td>
                            <td className="py-3.5 px-2">
                              <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 font-bold rounded-md border border-emerald-500/30 text-[10px]">
                                CREDITED & VERIFIED
                              </span>
                            </td>
                          </tr>
                        )}

                        {/* Default Refundable Collateral Deposit Record */}
                        {activeLoan && (
                          <tr className="hover:bg-white/[0.02]">
                            <td className="py-3.5 px-2 font-bold text-white">{new Date(activeLoan.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td className="py-3.5 px-2 font-bold text-yellow-300">25% Refundable Collateral Deposit</td>
                            <td className="py-3.5 px-2 text-gray-300">Escrow Vault Custody</td>
                            <td className="py-3.5 px-2 font-black text-yellow-400 text-sm">+${collateralAmount.toLocaleString()} USD</td>
                            <td className="py-3.5 px-2">
                              <span className="px-2.5 py-1 bg-yellow-950/80 text-yellow-300 font-bold rounded-md border border-yellow-500/30 text-[10px]">
                                ESCROW LOCKED
                              </span>
                            </td>
                          </tr>
                        )}

                        {!activeLoan && customTransactions.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-400 font-mono text-xs font-bold">
                              No loan transactions recorded yet. Submit your loan application to unlock instant funding.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-xs font-mono text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>💬 Direct Support Feedback:</span>
                    <span className="text-cyan-300 font-bold">If you have any questions regarding your debited account, please contact customer service.</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ---------------- 0.5. LOAN CALCULATOR TAB ---------------- */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-fade-in text-left" id="view-calculator-tab">
              <div className="p-6 bg-gradient-to-r from-cyan-950/70 via-black to-zinc-950 border-2 border-cyan-500/40 rounded-3xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest bg-cyan-950 px-3 py-1 rounded-full border border-cyan-500/30">
                    INSTITUTIONAL LOAN CALCULATOR
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  Calculate Loan Principal & Amortization
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 font-medium">
                  Adjust loan principal and payback terms to compute instant monthly installments, interest rates, and payback totals.
                </p>
              </div>

              <LoanCalculatorPage
                initialAmount={prefilledAmount || 100000}
                initialTerm={prefilledTerm || 24}
                onBackToHome={() => handleTabChange('account')}
                onApplyClick={(amt, trm) => {
                  setLoanFunding(prev => ({
                    ...prev,
                    amount: amt.toString(),
                    preference: `Monthly structured / ${trm} months`
                  }));
                  handleTabChange('apply');
                  setWizardStep(1);
                }}
              />
            </div>
          )}

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
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[3]" />
                        <span className="text-white font-black">Create Secure EMC Account</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {(kycStatus?.status === 'Approved' || activeLoan?.status === 'Approved') ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[3]" />
                        ) : (
                          <span className="h-5 w-5 rounded-full border-2 border-zinc-500 flex-shrink-0" />
                        )}
                        <span className={(kycStatus?.status === 'Approved' || activeLoan?.status === 'Approved') ? 'text-white font-black' : 'text-zinc-300 font-bold'}>
                          Complete KYC Identity Verification
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {(loans.length > 0 && activeLoan?.status === 'Approved') ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[3]" />
                        ) : (
                          <span className="h-5 w-5 rounded-full border-2 border-zinc-500 flex-shrink-0" />
                        )}
                        <span className={(loans.length > 0 && activeLoan?.status === 'Approved') ? 'text-white font-black' : 'text-zinc-300 font-bold'}>
                          Submit Loan Capital Request
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {activeLoan?.collateralPaid ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[3]" />
                        ) : (
                          <span className="h-5 w-5 rounded-full border-2 border-zinc-500 flex-shrink-0" />
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
                        {kycStatus?.status === 'Approved' || activeLoan?.status === 'Approved' ? 'Verified Clearance Active' :
                         kycStatus?.status === 'Pending' ? 'In Review Queue' :
                         kycStatus?.status === 'Rejected' ? 'Re-upload Required' :
                         'Not Submitted'}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-200 font-bold leading-relaxed max-w-[240px]">
                        {kycStatus?.remarks || 'Identity validation verified for capital allocation.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pl-4">
                      <ShieldCheck className={`h-11 w-11 ${(kycStatus?.status === 'Approved' || activeLoan?.status === 'Approved') ? 'text-cyan-400' : 'text-gray-600'}`} />
                    </div>
                  </div>

                  {/* Active Loan Capital Card */}
                  <div className="p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-between transition-all">
                    <div className="space-y-1.5 text-left">
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block font-black">Capital Liquidity Line</span>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {!activeLoan ? 'No Active Loan' :
                         activeLoan.disbursed ? 'Capital Disbursed & Active' :
                         activeLoan.status === 'Pending' || activeLoan.status === 'Under Review' ? 'Loan Under Review' :
                         activeLoan.status === 'Approved' && !activeLoan.collateralPaid ? 'Approved (Collateral Required)' :
                         activeLoan.status === 'Approved' && activeLoan.collateralPaid ? 'Refund Received / Awaiting Release' :
                         activeLoan.status === 'Declined' ? 'Request Rejected' :
                         'Undergoing Verification'}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-200 font-bold leading-relaxed max-w-[240px]">
                        {!activeLoan ? 'Initialize your loan request using our compliance wizard.' :
                         activeLoan.disbursed ? 'Your loan capital is disbursed and available for instant withdrawal.' :
                         activeLoan.status === 'Approved' && !activeLoan.collateralPaid ? `Refundable 25% collateral fee ($${(activeLoan.fundingDetails.requestedAmount * 0.25).toLocaleString()}) pending.` :
                         activeLoan.status === 'Approved' && activeLoan.collateralPaid ? 'Refund deposit approved. Admin finalizing fund release.' :
                         'Our risk underwriters are assessing your application.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pl-4">
                      <CreditCard className={`h-11 w-11 ${activeLoan?.status === 'Approved' ? 'text-cyan-400' : 'text-gray-600'}`} />
                    </div>
                  </div>
                </div>

                {/* 3. DISBURSED CAPITAL BALANCE VAULT (Shows when loan is disbursed) */}
                {activeLoan && activeLoan.disbursed && (
                  <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-950/60 via-black to-zinc-950 border-2 border-emerald-500/50 rounded-3xl space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-left animate-fade-in" id="disbursed-capital-vault">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-emerald-500/30">
                      <div className="space-y-1">
                        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-black block flex items-center gap-2">
                          <Check className="h-4 w-4" /> DISBURSED CAPITAL VAULT
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                          Disbursed Loan Balance
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 font-bold leading-relaxed">
                          Your approved credit application funds are fully unlocked and ready to be transferred to your account.
                        </p>
                      </div>

                      <div className="p-4 bg-black/80 border-2 border-emerald-400/50 rounded-2xl shrink-0 text-center space-y-1">
                        <span className="text-[11px] font-mono font-black text-emerald-400 uppercase tracking-wider block">AVAILABLE LIQUID CAPITAL</span>
                        <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-300">
                          ${activeLoan.fundingDetails.requestedAmount.toLocaleString()} USD
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase font-black block">Status: Fully Disbursed & Unlocked</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleTabChange('account');
                        }}
                        className="w-full sm:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display shadow-[0_0_25px_rgba(52,211,153,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <ArrowUpRight className="h-5 w-5 stroke-[3]" />
                        WITHDRAW LOAN FUNDS NOW
                      </button>

                      <div className="text-xs font-mono font-bold text-gray-300">
                        ✓ Supports ERC-20, BEP-20, Solana & Bank Wire transfers
                      </div>
                    </div>

                    {/* Transaction History for Disbursed Capital */}
                    <div className="pt-4 space-y-3">
                      <h4 className="text-xs font-mono font-black uppercase tracking-wider text-gray-300">
                        Disbursed Capital Transaction History
                      </h4>
                      <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/60">
                        <table className="w-full text-xs text-left font-mono">
                          <thead className="bg-zinc-900 border-b border-white/10 text-gray-400 font-black uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-3">Date</th>
                              <th className="p-3">Transaction Description</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-gray-200 font-bold">
                            <tr>
                              <td className="p-3 text-gray-400">{new Date(activeLoan.updatedAt || activeLoan.createdAt).toLocaleDateString()}</td>
                              <td className="p-3 text-white font-black">Capital Loan Disbursed To Vault</td>
                              <td className="p-3 text-emerald-400 font-black">+${activeLoan.fundingDetails.requestedAmount.toLocaleString()} USD</td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase rounded">
                                  COMPLETED / DISBURSED
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3.5 REFUNDABLE COLLATERAL BALANCE VAULT */}
                {activeLoan && (activeLoan.collateralPaid || activeLoan.status === 'Approved' || activeLoan.disbursed) && (
                  <div className="p-6 sm:p-8 bg-gradient-to-br from-yellow-950/50 via-black to-zinc-950 border-2 border-yellow-500/50 rounded-3xl space-y-6 shadow-[0_0_40px_rgba(234,179,8,0.15)] text-left animate-fade-in" id="refundable-collateral-vault">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-yellow-500/30">
                      <div className="space-y-1">
                        <span className="text-xs font-mono uppercase tracking-widest text-yellow-400 font-black block flex items-center gap-2">
                          <Lock className="h-4 w-4" /> 100% REFUNDABLE COLLATERAL VAULT
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                          Refundable Collateral Balance
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-200 font-bold leading-relaxed">
                          Your 25% security collateral is securely held in escrow by Elon Capital Loan until loan maturity.
                        </p>
                      </div>

                      <div className="p-4 bg-black/80 border-2 border-yellow-400/50 rounded-2xl shrink-0 text-center space-y-1">
                        <span className="text-[11px] font-mono font-black text-yellow-400 uppercase tracking-wider block">COLLATERAL ESCROW VALUE</span>
                        <div className="text-3xl sm:text-4xl font-black font-mono text-yellow-300">
                          ${(activeLoan.fundingDetails.requestedAmount * 0.25).toLocaleString()} USD
                        </div>
                        <span className="text-[10px] font-mono text-amber-300 uppercase font-black block flex items-center justify-center gap-1">
                          🔒 {activeLoan.collateralPaid ? 'Status: Held in Escrow' : 'Status: Pending Deposit'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setCollateralNoticeModal(activeLoan)}
                        className="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Lock className="h-5 w-5 stroke-[3]" />
                        WITHDRAW COLLATERAL
                      </button>

                      <div className="text-xs font-mono font-bold text-yellow-200/90">
                        🔒 Unlocks automatically upon 100% loan principal repayment
                      </div>
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

                      {(() => {
                        const rate = getInterestRateFromPreference(loan.fundingDetails?.repaymentPreference);
                        const totalPayback = Math.round(loan.fundingDetails.requestedAmount * (1 + rate / 100));
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-4 border-t border-b border-white/10 text-sm font-mono">
                            <div>
                              <span className="block text-[10px] text-cyan-400 uppercase font-black mb-1">Repayment Term</span>
                              <span className="text-white font-bold text-xs">{loan.fundingDetails.repaymentPreference}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-cyan-400 uppercase font-black mb-1">Interest Rate</span>
                              <span className="text-emerald-400 font-black text-xs">{rate}% Fixed</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-cyan-400 uppercase font-black mb-1">Total Amortization</span>
                              <span className="text-yellow-300 font-black text-xs">${totalPayback.toLocaleString()} USD</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-cyan-400 uppercase font-black mb-1">Credit Score</span>
                              <span className="text-white font-bold text-xs">{loan.financialInfo.creditScore || "750"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-cyan-400 uppercase font-black mb-1">Submission Date</span>
                              <span className="text-white font-bold text-xs">{new Date(loan.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })()}

                      <p className="text-sm text-zinc-200 font-bold leading-relaxed mt-4">
                        <span className="text-white font-black">Description:</span> {loan.fundingDetails.description}
                      </p>

                      {/* REJECTED LOAN VIEW */}
                      {(loan.status === 'Declined' || loan.status === 'Rejected') && (
                        <div className="mt-6 p-6 bg-red-950/40 border-2 border-red-500/50 rounded-2xl space-y-4 animate-fade-in text-left shadow-[0_0_25px_rgba(239,68,68,0.2)]">
                          <div className="flex items-center gap-3 text-red-400 font-display font-black text-xl uppercase tracking-wider">
                            <AlertTriangle className="h-7 w-7 text-red-500 shrink-0" />
                            <span>Loan Status: Declined</span>
                          </div>
                          <div className="p-4 bg-black/80 rounded-xl border border-red-500/30 space-y-2">
                            <h6 className="text-xs font-mono font-black text-red-400 uppercase tracking-wider">
                              Reason for Rejection:
                            </h6>
                            <p className="text-sm font-bold text-gray-200">
                              {loan.rejectionReason || "Application did not meet institutional credit and document requirements."}
                            </p>
                          </div>
                          <p className="text-xs text-gray-300 font-semibold">
                            You may review your credit details, update your KYC documentation, and submit a new loan application when ready.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => { handleTabChange('apply'); setWizardStep(1); }}
                              className="px-6 py-3.5 bg-red-500 hover:bg-red-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer font-display shadow-lg hover:scale-105 active:scale-95"
                            >
                              Submit New Application →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* APPROVED LOAN VIEW & SETTLEMENT */}
                      {loan.status === 'Approved' && (
                        <>
                          {!loan.collateralPaid ? (
                            <div className="mt-6 p-6 bg-yellow-950/30 border-2 border-yellow-500/40 rounded-2xl space-y-5 animate-fade-in shadow-[0_0_30px_rgba(234,179,8,0.15)] text-left">
                              
                              {/* Payment Review Banner if submitted */}
                              {(loan.collateralPaymentStatus === 'Under Review' || loan.collateralPaymentStatus === 'Submitted') && (
                                <div className="p-4 bg-yellow-950/80 border-2 border-yellow-400 rounded-xl space-y-2">
                                  <div className="flex items-center gap-2 text-yellow-300 font-black text-sm uppercase tracking-wider font-display">
                                    <RefreshCw className="h-5 w-5 animate-spin text-yellow-400" />
                                    <span>Payment Submitted Successfully — Under Review</span>
                                  </div>
                                  <p className="text-xs text-white font-bold leading-relaxed">
                                    Your payment is currently under review. Our finance team will verify your payment. After successful verification, your approved loan will be released within 24 hours.
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-yellow-500/20 pb-4">
                                <div className="space-y-1">
                                  <h5 className="text-base sm:text-lg font-black uppercase tracking-wider text-yellow-400 flex items-center gap-2 font-display">
                                    <AlertTriangle className="h-6 w-6 shrink-0" /> LOAN APPROVED — SETTLEMENT & COLLATERAL DEPOSIT REQUIRED
                                  </h5>
                                  <p className="text-sm text-yellow-200/90 font-bold">
                                    Approved Capital Sum: <span className="text-white font-mono font-black text-base">${loan.fundingDetails.requestedAmount.toLocaleString()} USD</span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setPayingCollateralLoan(loan);
                                    setCollateralTxIdInput('');
                                  }}
                                  className="px-6 py-3.5 text-xs font-black uppercase tracking-widest bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl transition-all shrink-0 cursor-pointer font-display shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95"
                                >
                                  💳 PAY SETTLEMENT NOW
                                </button>
                              </div>

                              {/* Layman Breakdown Box */}
                              <div className="space-y-4 bg-black/60 p-5 rounded-xl border border-yellow-500/30">
                                <h6 className="text-xs font-mono font-black uppercase text-yellow-400 tracking-wider">
                                  Settlement Deposit Breakdown:
                                </h6>
                                
                                <p className="text-xs sm:text-sm text-gray-100 leading-relaxed font-bold">
                                  To activate disbursement of your approved <strong className="text-white font-black">${loan.fundingDetails.requestedAmount.toLocaleString()}</strong> loan, institutional regulations require a combined settlement deposit of <strong className="text-yellow-300 font-black">28.5% Total Fees</strong>: comprising a <strong className="text-yellow-400 font-black">25% Refundable Security Collateral</strong> (${Math.round(loan.fundingDetails.requestedAmount * 0.25).toLocaleString()} USD) and a <strong className="text-cyan-400 font-black">3.5% Company Fee</strong> (${Math.round(loan.fundingDetails.requestedAmount * 0.035).toLocaleString()} USD), totaling <strong className="text-yellow-300 font-mono font-black text-sm sm:text-base">${Math.round(loan.fundingDetails.requestedAmount * 0.285).toLocaleString()} USD</strong>.
                                </p>

                                {/* Installments Section (4 Equal Installments) */}
                                <div className="space-y-3 pt-3 border-t-2 border-yellow-500/30">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="text-xs font-mono font-black uppercase text-yellow-300 flex items-center gap-1.5">
                                      ⚡ Settlement Plan: 4 Equal Installments (Bank/Card) or Full Crypto Transfer
                                    </span>
                                    <span className="text-[10px] text-cyan-300 font-mono font-black bg-cyan-950/90 px-2.5 py-1 rounded border border-cyan-400/50 shadow-sm">
                                      Combined 28.5% Fee Split
                                    </span>
                                  </div>

                                  {/* Prominent Full Crypto Option Button */}
                                  <div className="p-3.5 bg-gradient-to-r from-yellow-950/70 via-zinc-900 to-black rounded-xl border-2 border-yellow-400/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                                    <div className="space-y-1 text-left">
                                      <span className="text-xs sm:text-sm font-mono font-black uppercase text-yellow-300 flex items-center gap-1">
                                        🪙 Instant 100% Full Settlement (Crypto Option)
                                      </span>
                                      <p className="text-xs text-gray-200 font-medium leading-normal">
                                        Pay the total <strong className="text-yellow-400 font-black">${Math.round(loan.fundingDetails.requestedAmount * 0.285).toLocaleString()} USD</strong> (25% Collateral + 3.5% Company Fee combined) in one single crypto transfer (USDT TRC20/ERC20, BTC, ETH) without waiting for installment unlocks.
                                      </p>
                                    </div>
                                    {loan.collateralPaymentStatus === 'Under Review' || loan.collateralPaymentStatus === 'Submitted' ? (
                                      <div className="px-5 py-2.5 bg-yellow-500/20 text-yellow-300 border border-yellow-400/60 text-xs font-mono font-black uppercase tracking-wider rounded-xl shrink-0 flex items-center gap-1.5 shadow-inner">
                                        ⏳ Payment Under Review
                                      </div>
                                    ) : loan.collateralPaid || loan.collateralPaymentStatus === 'Confirmed' ? (
                                      <div className="px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 text-xs font-mono font-black uppercase tracking-wider rounded-xl shrink-0 flex items-center gap-1.5 shadow-inner">
                                        ✓ Fully Confirmed
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedInstallmentNum(1);
                                          setPayingCollateralLoan(loan);
                                          setCollateralTxIdInput('');
                                          setIsPayFullCrypto(true);
                                          setCollateralPaymentMethod('Crypto');
                                        }}
                                        className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer font-display shadow-md hover:scale-105 active:scale-95 shrink-0"
                                      >
                                        Pay Full ${Math.round(loan.fundingDetails.requestedAmount * 0.285).toLocaleString()} (Crypto)
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    {[1, 2, 3, 4].map((num) => {
                                      const totalSettlement = Math.round(loan.fundingDetails.requestedAmount * 0.285);
                                      const amountPerInst = Math.round(totalSettlement / 4);
                                      const rawInst = loan.installments?.find(i => i.number === num) || {
                                        number: num,
                                        amount: num === 4 ? totalSettlement - (amountPerInst * 3) : amountPerInst,
                                        status: 'Pending'
                                      };

                                      const isOverallUnderReview = loan.collateralPaymentStatus === 'Under Review' || loan.collateralPaymentStatus === 'Submitted';
                                      const isOverallPaid = loan.collateralPaid || loan.collateralPaymentStatus === 'Confirmed';

                                      const effectiveStatus = isOverallPaid ? 'Approved' : (isOverallUnderReview && !loan.isInstallmentPlan) ? 'Under Review' : rawInst.status;

                                      const prevInst = num > 1 ? loan.installments?.find(i => i.number === num - 1) : null;
                                      const isUnlocked = num === 1 || prevInst?.status === 'Approved';

                                      return (
                                        <div key={num} className={`p-4 rounded-xl border-2 space-y-2 text-left transition-all ${
                                          effectiveStatus === 'Approved' ? 'bg-emerald-950/60 border-emerald-400 text-white' :
                                          effectiveStatus === 'Under Review' ? 'bg-yellow-950/60 border-yellow-400 text-white' :
                                          isUnlocked ? 'bg-zinc-900 border-yellow-400/50 text-white' : 'bg-black/60 border-white/10 opacity-60'
                                        }`}>
                                          <div className="flex items-center justify-between text-xs font-mono font-black">
                                            <span className="text-gray-200 uppercase">Installment {num}</span>
                                            <span className={
                                              effectiveStatus === 'Approved' ? 'text-emerald-400 font-black' :
                                              effectiveStatus === 'Under Review' ? 'text-yellow-300 font-black' :
                                              isUnlocked ? 'text-yellow-300 font-black' : 'text-gray-400 font-bold'
                                            }>
                                              {effectiveStatus === 'Approved' ? '✓ Confirmed' :
                                               effectiveStatus === 'Under Review' ? '⏳ Under Review' :
                                               isUnlocked ? 'Available' : '🔒 Locked'}
                                            </span>
                                          </div>

                                          <div className="text-base font-black font-mono text-yellow-300">
                                            ${rawInst.amount.toLocaleString()} USD
                                          </div>

                                          {isUnlocked && effectiveStatus !== 'Approved' && effectiveStatus !== 'Under Review' && !isOverallUnderReview && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setSelectedInstallmentNum(num);
                                                setPayingCollateralLoan(loan);
                                                setCollateralTxIdInput('');
                                                setIsPayFullCrypto(false);
                                              }}
                                              className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-[11px] font-black uppercase rounded-lg transition cursor-pointer font-display shadow-md hover:scale-105 active:scale-95"
                                            >
                                              Pay Installment {num}
                                            </button>
                                          )}

                                          {effectiveStatus === 'Under Review' && (
                                            <p className="text-[10px] text-yellow-300 font-mono font-black leading-tight pt-1">
                                              ⏳ Paid. Waiting for Elon Capital loan team confirmation.
                                            </p>
                                          )}

                                          {!isUnlocked && effectiveStatus !== 'Under Review' && effectiveStatus !== 'Approved' && (
                                            <p className="text-[10px] text-gray-400 font-mono font-bold leading-tight pt-1">
                                              🔒 Locked until Installment {num - 1} is confirmed.
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Customer Support Guidance Notice */}
                                <div className="p-3.5 bg-yellow-950/40 border-2 border-yellow-400/50 rounded-xl space-y-1.5 text-xs text-white">
                                  <span className="font-mono font-black text-yellow-300 uppercase tracking-wider block flex items-center gap-1.5">
                                    💬 Need Help or Have Questions During Settlement?
                                  </span>
                                  <p className="leading-relaxed font-bold text-gray-200">
                                    If you experience any issues or need assistance with wire details, please send a message with your payment screenshots directly to <span className="text-yellow-300 font-black underline">Customer Service / Live Chat</span>. Our support team will guide you step-by-step through instant confirmation!
                                  </p>
                                </div>

                                {/* Payment Methods Guidance Notice */}
                                <div className="p-3 bg-zinc-900 border border-cyan-400/40 rounded-xl space-y-1 text-xs text-zinc-200">
                                  <span className="font-mono font-black text-cyan-300 uppercase tracking-wider block">
                                    💳 Payment Methods Guidance:
                                  </span>
                                  <p className="leading-relaxed font-bold">
                                    • Small settlement amounts may be paid using supported debit or credit cards.<br />
                                    • Large settlement amounts are expected to be completed through cryptocurrency (USDT TRC-20/ERC-20, BTC, ETH) or bank wire transfer due to daily card processing limits.
                                  </p>
                                </div>

                                <div className="p-3 bg-emerald-950/40 border border-emerald-400/50 rounded-lg text-xs font-bold text-emerald-300 flex items-start gap-2">
                                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                                  <span>
                                    <strong className="text-emerald-300">Collateral Guarantee:</strong> 100% of your 25% refundable security collateral is returned in full upon completion of loan repayments.
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-6 p-6 bg-cyan-950/30 border-2 border-cyan-500/40 rounded-2xl space-y-5 animate-fade-in shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <div>
                                  <h5 className="text-base sm:text-lg font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                                    <Check className="h-6 w-6 stroke-[3]" /> SETTLEMENT CONFIRMED & LIQUIDITY UNLOCKED
                                  </h5>
                                  <p className="text-xs sm:text-sm text-gray-200 font-bold mt-1">
                                    25% Refundable Collateral (<span className="text-yellow-400 font-black">${(loan.fundingDetails.requestedAmount * 0.25).toLocaleString()}</span>) and 3.5% Processing Fee (<span className="text-cyan-400 font-black">${(loan.fundingDetails.requestedAmount * 0.035).toLocaleString()}</span>) have been audited and verified.
                                  </p>
                                </div>
                                <span className={`px-4 py-2 font-mono text-xs font-black rounded-full uppercase tracking-wider border-2 shrink-0 ${
                                  loan.disbursed ? 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)] font-black' : 'bg-orange-950/80 border-orange-400 text-orange-300'
                                }`}>
                                  {loan.disbursed ? '✓ Capital Disbursed' : '⏳ Awaiting Final Release'}
                                </span>
                              </div>

                              {/* Withdrawal & Disbursement Destination Setup */}
                              {!loan.disbursed ? (
                                <div className="space-y-4 bg-black/60 p-5 rounded-xl border border-cyan-500/30">
                                  <h6 className="text-xs font-mono font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                                    <span>⚙️ Set Destination for Capital Transfer:</span>
                                  </h6>
                                  
                                  {/* Destination Selector */}
                                  <div className="grid grid-cols-2 gap-3 max-w-md">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveDisbursementMethod(loan.id, 'Crypto')}
                                      className={`py-2.5 text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 transition-all cursor-pointer ${
                                        disbursementMethods[loan.id] === 'Crypto' || !disbursementMethods[loan.id]
                                          ? 'bg-cyan-400 text-black border-cyan-400 shadow-md'
                                          : 'border-white/10 text-gray-300 hover:text-white bg-zinc-900'
                                      }`}
                                    >
                                      USDT / Crypto Wallet
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveDisbursementMethod(loan.id, 'Bank')}
                                      className={`py-2.5 text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 transition-all cursor-pointer ${
                                        disbursementMethods[loan.id] === 'Bank'
                                          ? 'bg-cyan-400 text-black border-cyan-400 shadow-md'
                                          : 'border-white/10 text-gray-300 hover:text-white bg-zinc-900'
                                      }`}
                                    >
                                      Direct Bank Wire
                                    </button>
                                  </div>

                                  {/* Interactive Form fields */}
                                  {(disbursementMethods[loan.id] === 'Crypto' || !disbursementMethods[loan.id]) ? (
                                    <div className="space-y-2">
                                      <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider font-bold">
                                        Cryptocurrency Wallet Address (USDT TRC-20 / ERC-20 / BTC) *
                                      </label>
                                      <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                          type="text"
                                          placeholder="Paste your wallet address here (e.g., T... or 0x...)"
                                          value={disbursementInputs[loan.id]?.cryptoAddress || ''}
                                          onChange={(e) => handleUpdateDisbursementInput(loan.id, 'cryptoAddress', e.target.value)}
                                          className="flex-1 px-4 py-3 bg-black border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleLockDestination(loan.id)}
                                          className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase rounded-xl cursor-pointer font-mono shadow-md shrink-0"
                                        >
                                          Save Address
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider font-bold">
                                        Bank Transfer Routing Details *
                                      </label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                          type="text"
                                          placeholder="Bank Name (e.g. Chase, Barclays)"
                                          value={disbursementInputs[loan.id]?.bankName || ''}
                                          onChange={(e) => handleUpdateDisbursementInput(loan.id, 'bankName', e.target.value)}
                                          className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-xs font-bold text-white focus:outline-none"
                                        />
                                        <input
                                          type="text"
                                          placeholder="SWIFT / BIC Code"
                                          value={disbursementInputs[loan.id]?.bankSwift || ''}
                                          onChange={(e) => handleUpdateDisbursementInput(loan.id, 'bankSwift', e.target.value)}
                                          className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-xs font-bold text-white focus:outline-none"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Account Number / IBAN"
                                          value={disbursementInputs[loan.id]?.bankIban || ''}
                                          onChange={(e) => handleUpdateDisbursementInput(loan.id, 'bankIban', e.target.value)}
                                          className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-xs font-bold text-white focus:outline-none col-span-1 sm:col-span-2"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleLockDestination(loan.id)}
                                        className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase rounded-xl cursor-pointer font-display tracking-wider shadow-md"
                                      >
                                        Save Bank Wire Details
                                      </button>
                                    </div>
                                  )}

                                  {disbursementLocked[loan.id] && (
                                    <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-2 pt-1">
                                      <Check className="h-4 w-4" /> Destination details saved. Transfer release is queued!
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-4 bg-emerald-950/40 p-6 rounded-2xl border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                      <span className="text-sm font-mono text-emerald-400 uppercase tracking-widest block font-black flex items-center gap-2">
                                        <Check className="h-6 w-6 stroke-[3] text-emerald-400" /> Capital Disbursed & Unlocked
                                      </span>
                                      <p className="text-base text-gray-100 leading-relaxed font-black mt-2">
                                        Capital sum of <span className="text-emerald-300 font-mono font-black text-xl">${loan.fundingDetails.requestedAmount.toLocaleString()} USD</span> is released and ready for immediate withdrawal.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleTabChange('account');
                                      }}
                                      className="px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display shadow-[0_0_25px_rgba(52,211,153,0.4)] shrink-0 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                                    >
                                      <span>💸 WITHDRAW LOAN FUNDS NOW</span>
                                    </button>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-4 text-xs font-mono text-gray-200 font-black pt-3 border-t border-emerald-500/30">
                                    <span>COLLATERAL TxID: <span className="text-white font-mono">{loan.collateralTxId}</span></span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>RELEASE DATE: <span className="text-white font-mono">{loan.disbursedAt ? new Date(loan.disbursedAt).toLocaleString() : 'N/A'}</span></span>
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
              {loans.some(l => !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled'].includes(l.status) && !l.repaid) ? (
                <div className="bg-amber-950/80 border-2 border-amber-400 p-8 rounded-2xl space-y-5 text-left shadow-[0_0_30px_rgba(251,191,36,0.25)] animate-fade-in">
                  <div className="flex items-center gap-3 text-amber-300 font-display font-black text-xl uppercase tracking-wider">
                    <AlertTriangle className="h-8 w-8 text-amber-400 flex-shrink-0" />
                    <span>Active Borrowed Loan Facility Policy</span>
                  </div>
                  <p className="text-base font-bold text-white leading-relaxed">
                    You currently hold an active borrowed loan facility (<strong className="text-amber-300 font-mono">#{loans.find(l => !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled'].includes(l.status) && !l.repaid)?.id}</strong> — ${loans.find(l => !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled'].includes(l.status) && !l.repaid)?.fundingDetails.requestedAmount.toLocaleString()} USD).
                  </p>
                  <p className="text-sm font-semibold text-zinc-300">
                    Institutional credit policy strictly requires that borrowers must fully repay their existing borrowed loan facility before submitting an application for a new loan.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => handleTabChange('repayment')}
                      className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer font-display shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" /> Go To Loan Repayment Tab →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange('loans')}
                      className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer font-display border border-amber-500/30"
                    >
                      View My Loan Applications
                    </button>
                  </div>
                </div>
              ) : (
                <>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                      <div>
                        <SearchableSelect
                          label="Preferred Repayment Term"
                          required
                          options={[
                            '6 months (15% Interest Rate)',
                            '12 months (15% Interest Rate)',
                            '18 months (20% Interest Rate)',
                            '24 months (20% Interest Rate)',
                            '36 months (20% Interest Rate)',
                            '48 months (20% Interest Rate)',
                            '60 months (20% Interest Rate)'
                          ]}
                          value={loanFunding.preference}
                          onChange={(val) => {
                            setLoanFunding({ ...loanFunding, preference: val });
                          }}
                          id="kyc-repayment-preference-select"
                        />
                      </div>
                    </div>

                    {/* OFFICIAL INTEREST RATE POLICY BANNER */}
                    <div className="p-5 bg-gradient-to-r from-cyan-950/60 via-zinc-950 to-cyan-950/60 border-2 border-cyan-400/50 rounded-2xl space-y-3 shadow-lg my-2">
                      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                        <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                          <Percent className="h-4 w-4" /> OFFICIAL LOAN INTEREST RATE POLICY
                        </span>
                        <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                          FIXED NON-COMPOUNDING
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono font-bold">
                        <div className="p-3 bg-black/60 rounded-xl border border-white/10 flex justify-between items-center">
                          <div>
                            <span className="uppercase text-[10px] tracking-wider text-cyan-300 block">1 Month – 12 Months Term</span>
                            <span className="text-white font-black">Short-Term Amortization</span>
                          </div>
                          <span className="text-emerald-400 font-black text-base bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/30">15% Interest</span>
                        </div>
                        <div className="p-3 bg-black/60 rounded-xl border border-white/10 flex justify-between items-center">
                          <div>
                            <span className="uppercase text-[10px] tracking-wider text-cyan-300 block">&gt;12 Months – 60 Months (5 Yrs)</span>
                            <span className="text-white font-black">Long-Term Amortization</span>
                          </div>
                          <span className="text-cyan-300 font-black text-base bg-cyan-950/80 px-3 py-1 rounded-lg border border-cyan-500/30">20% Interest</span>
                        </div>
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
                        if (!kycFullName.trim() || kycFullName.trim().split(/\s+/).length < 2) {
                          triggerAlert('error', 'Please enter your full legal name (first and last name).');
                          return;
                        }
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!kycEmail.trim() || !emailRegex.test(kycEmail.trim())) {
                          triggerAlert('error', 'Please enter a valid email address.');
                          return;
                        }
                        if (!kycPhone.trim() || kycPhone.trim().replace(/\D/g, '').length < 7) {
                          triggerAlert('error', 'Please enter a valid phone number.');
                          return;
                        }
                        if (!loanPersonal.dob) {
                          triggerAlert('error', 'Please enter a valid date of birth.');
                          return;
                        }
                        const dobDate = new Date(loanPersonal.dob);
                        const ageYears = (Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
                        if (isNaN(dobDate.getTime()) || ageYears < 18) {
                          triggerAlert('error', 'Applicant must be at least 18 years of age to apply for credit facility.');
                          return;
                        }
                        if (!loanPersonal.address.trim() || loanPersonal.address.trim().length < 5) {
                          triggerAlert('error', 'Please enter your full residential address.');
                          return;
                        }
                        const incomeVal = Number(loanEmployment.income);
                        if (isNaN(incomeVal) || incomeVal <= 0) {
                          triggerAlert('error', 'Please enter a valid positive monthly income amount.');
                          return;
                        }
                        const amountVal = Number(loanFunding.amount);
                        if (isNaN(amountVal) || amountVal < 100) {
                          triggerAlert('error', 'Please enter a valid funding amount (minimum $100).');
                          return;
                        }
                        if (!loanFunding.description.trim() || loanFunding.description.trim().length < 10) {
                          triggerAlert('error', 'Please provide a detailed purpose or project scope description.');
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
                                      const reader = new FileReader();
                                      reader.onload = (evt) => {
                                        if (evt.target?.result) {
                                          setKycIdCard(evt.target.result as string);
                                          triggerAlert('success', `📁 Front ID uploaded: ${file.name}`);
                                        }
                                      };
                                      reader.readAsDataURL(file);
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
                                      const reader = new FileReader();
                                      reader.onload = (evt) => {
                                        if (evt.target?.result) {
                                          setKycIdCardBack(evt.target.result as string);
                                          triggerAlert('success', `📁 Back ID uploaded: ${file.name}`);
                                        }
                                      };
                                      reader.readAsDataURL(file);
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
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setKycProofOfAddress(evt.target.result as string);
                                triggerAlert('success', `📁 Proof of Address uploaded: ${file.name}`);
                              }
                            };
                            reader.readAsDataURL(file);
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
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setKycBusiness(evt.target.result as string);
                                triggerAlert('success', `📁 Business document selected: ${file.name}`);
                              }
                            };
                            reader.readAsDataURL(file);
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
              </>
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
                    const isAdmin = msg.senderId === 'admin-1' || msg.senderRole === 'admin';
                    const senderLabel = isAdmin ? 'Elon Capital Loan Team' : (msg.senderName || user.name);
                    const hasImage = msg.imageUrl || (msg.attachment?.url && msg.attachment.url.startsWith('data:image'));
                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                        id={`chat-msg-${msg.id}`}
                      >
                        <span className={`font-mono text-xs font-black mb-1 ${isAdmin ? 'text-cyan-400' : 'text-emerald-400'}`}>
                          {senderLabel}
                        </span>
                        <div className={`p-4 rounded-xl text-sm font-bold max-w-sm leading-relaxed ${
                          isAdmin 
                            ? 'bg-zinc-900 border-2 border-zinc-700 text-white rounded-tl-none' 
                            : 'bg-cyan-400 text-black font-black rounded-tr-none shadow-md'
                        }`}>
                          {msg.content}
                          {hasImage ? (
                            <div className="mt-2.5">
                              <img 
                                src={msg.imageUrl || msg.attachment?.url} 
                                alt="Message attachment" 
                                className="rounded-lg max-h-52 w-full object-cover border border-white/20 cursor-pointer shadow-md"
                                onClick={() => window.open(msg.imageUrl || msg.attachment?.url, '_blank')}
                              />
                            </div>
                          ) : msg.attachment && (
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
                <input 
                  type="file" 
                  ref={userMsgImageInputRef}
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        setMsgAttachment({ name: file.name, url: evt.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {msgAttachment && (
                  <div className="mb-2 p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-cyan-300 flex items-center gap-2 truncate">
                      📎 Attached: {msgAttachment.name}
                      {msgAttachment.url.startsWith('data:image') && (
                        <img src={msgAttachment.url} alt="Preview" className="h-6 w-6 object-cover rounded border border-cyan-400/50" />
                      )}
                    </span>
                    <button type="button" onClick={() => setMsgAttachment(null)} className="text-red-400 hover:underline font-black shrink-0">Remove</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => userMsgImageInputRef.current?.click()}
                    className="px-4 bg-zinc-900 border-2 border-zinc-700 text-sm font-bold text-zinc-300 hover:text-white hover:border-cyan-400 rounded-xl cursor-pointer"
                    title="Upload image or file"
                  >
                    📷 / 📎
                  </button>
                  <input 
                    type="text" 
                    required={!msgAttachment}
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

              {/* Official Customer Support Email Banner */}
              <div className="p-6 bg-gradient-to-r from-zinc-950 via-cyan-950/40 to-zinc-950 border-2 border-cyan-400/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_25px_rgba(34,211,238,0.15)]">
                <div className="flex items-center gap-4 text-left">
                  <div className="h-12 w-12 rounded-xl bg-cyan-950 border border-cyan-400/50 text-cyan-400 flex items-center justify-center shrink-0 shadow-md">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest block">Official Customer Support Desk</span>
                    <a 
                      href="mailto:customersupport@eloncapital.store"
                      className="text-lg font-mono font-bold text-white hover:text-cyan-300 underline underline-offset-4 transition-colors"
                    >
                      customersupport@eloncapital.store
                    </a>
                    <p className="text-xs text-zinc-300 font-semibold mt-0.5">Direct 24/7 priority customer support & inquiry desk.</p>
                  </div>
                </div>
                <a
                  href="mailto:customersupport@eloncapital.store?subject=Customer%20Support%20Inquiry"
                  className="px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display shadow-md shrink-0 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Mail className="h-4 w-4 stroke-[2.5]" />
                  <span>Email Support Desk</span>
                </a>
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

              {/* Administrative Message Real-Time Alert Banner */}
              {notifications.some(n => n.title.includes('Administrative Message') || n.content.includes('Elon Capital Loan Team')) && (
                <div className="p-5 bg-gradient-to-r from-black via-zinc-950 to-black border-2 border-cyan-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/30">
                      📢 NEW ADMINISTRATIVE RESPONSE RECEIVED
                    </span>
                    <h4 className="text-base font-black text-white">Message from Elon Capital Loan Team</h4>
                    <p className="text-xs text-zinc-300 font-semibold">
                      You have received a new response from Elon Capital Loan Team. Check your message tab.
                    </p>
                    <span className="text-[10px] font-mono text-cyan-300/80 block pt-1">
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('messages')}
                    className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display shrink-0"
                  >
                    💬 Open Messages Desk
                  </button>
                </div>
              )}

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
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2 font-black">Profile Information</h4>
                  
                  <div>
                    <label className="block text-xs font-mono font-black text-zinc-300 uppercase mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-sm font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-black text-zinc-300 uppercase mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-sm font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-black text-zinc-300 uppercase mb-2">Phone Number *</label>
                    <input 
                      type="text" 
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-sm font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-black text-zinc-300 uppercase mb-2">Country Location *</label>
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
                    className="w-full py-3.5 bg-cyan-400 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-cyan-300 transition-all cursor-pointer shadow-lg active:scale-98 font-display"
                  >
                    Save Profile Changes
                  </button>
                </form>

                {/* Account Security & Credentials */}
                <div className="space-y-6" id="form-password-change">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2 font-black">Account Security & Credentials</h4>
                  
                  {/* Current Password Viewing Card with Eye Icon */}
                  <div className="p-5 bg-zinc-950 border-2 border-cyan-500/30 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Key className="h-4 w-4" /> Current Security Credentials
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded-full uppercase">
                        Active Profile
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">Account Email:</span>
                        <span className="text-sm font-mono font-bold text-white">{user.email}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">Account Security Password:</span>
                        <div className="flex items-center justify-between gap-3 bg-black p-3 rounded-xl border border-zinc-700">
                          <span className="text-sm font-mono font-black text-emerald-400 tracking-wider select-all">
                            {showUserPassword ? (user.password || 'ElonCapital2026!') : '••••••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowUserPassword(!showUserPassword)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 rounded-lg text-xs font-mono font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                            title={showUserPassword ? "Hide Password" : "View Password"}
                          >
                            {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span>{showUserPassword ? "Hide" : "View Password"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ---------------- 8. LOAN REPAYMENT PORTAL ---------------- */}
          {activeTab === 'repayment' && (() => {
            const activeLoan = loans.find(l => l.disbursed === true || l.status === 'Approved') || loans[0];
            const activeDisbursedLoan = loans.find(l => l.disbursed === true);
            const collateralAmount = (activeDisbursedLoan || activeLoan?.collateralPaid) 
              ? Math.round((activeDisbursedLoan?.fundingDetails.requestedAmount || activeLoan?.fundingDetails.requestedAmount || 0) * 0.25) 
              : 0;

            return (
              <div className="space-y-8" id="view-repayment">
                <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/30">
                      ⚡ DIRECT REPAYMENT GATEWAY
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-black text-white mt-2 uppercase tracking-tight">Loan Repayment Portal</h3>
                    <p className="text-sm font-semibold text-zinc-300">Settle active borrowed loan facilities, track repayment schedules, and monitor collateral release.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchAllData()}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-cyan-300 font-mono text-xs font-bold rounded-xl border border-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" /> Refresh Portal
                    </button>
                  </div>
                </div>

                {/* Refundable Collateral Balance Display */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-950 to-emerald-950/60 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(52,211,153,0.15)] relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-emerald-400" />
                        <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest">
                          REFUNDABLE COLLATERAL DEPOSIT BALANCE
                        </span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight">
                        ${collateralAmount.toLocaleString()} <span className="text-lg text-emerald-300 font-sans font-bold">USD</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-bold max-w-xl">
                        🔒 <span className="text-emerald-300 font-black">100% Refundable Guarantee</span>: Upon full repayment of your borrowed loan principal, your ${collateralAmount.toLocaleString()} USD collateral deposit is unlocked and automatically returned to your account vault balance.
                      </p>
                    </div>

                    <div className="bg-black/60 border border-emerald-500/30 p-4 rounded-xl shrink-0 space-y-1 text-right">
                      <span className="text-[10px] font-mono text-gray-400 uppercase block font-bold">Escrow Protection</span>
                      <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/40 inline-block uppercase">
                        ✓ Active & Protected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Borrowed Loans Section */}
                <div className="space-y-6">
                  <h4 className="font-mono text-xs text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2 font-black flex items-center justify-between">
                    <span>Active Borrowed Facilities Requiring Repayment</span>
                    <span className="text-gray-400">{loans.filter(l => l.disbursed || l.status === 'Approved').length} Active</span>
                  </h4>

                  {loans.filter(l => l.disbursed || l.status === 'Approved').length === 0 ? (
                    <div className="p-8 text-center bg-zinc-950/60 border border-white/10 rounded-2xl space-y-3">
                      <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                      <h5 className="text-lg font-black text-white">No Outstanding Borrowed Loans</h5>
                      <p className="text-sm text-zinc-400 font-semibold max-w-md mx-auto">
                        You currently do not have any active unpaid loan facilities. All borrowed funds are settled or clear!
                      </p>
                      <button
                        type="button"
                        onClick={() => handleTabChange('apply')}
                        className="mt-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition font-display shadow-md"
                      >
                        Apply For New Loan Facility →
                      </button>
                    </div>
                  ) : (
                    loans.filter(l => l.disbursed || l.status === 'Approved').map(loan => {
                      const isFullyRepaid = loan.repaid || loan.repaymentStatus === 'Confirmed';
                      const isUnderReview = loan.repaymentStatus === 'Under Review';

                      return (
                        <div key={loan.id} className="p-6 bg-zinc-950 border-2 border-white/10 rounded-2xl space-y-6 shadow-xl relative">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/30">
                                  LOAN ID: #{loan.id}
                                </span>
                                {isFullyRepaid ? (
                                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40 uppercase">
                                    ✓ FULLY REPAID & SETTLED
                                  </span>
                                ) : isUnderReview ? (
                                  <span className="text-xs font-mono font-black text-yellow-300 bg-yellow-950/80 px-2.5 py-0.5 rounded border border-yellow-500/40 uppercase animate-pulse">
                                    ⏳ REPAYMENT UNDER REVIEW
                                  </span>
                                ) : (
                                  <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-500/40 uppercase">
                                    ⚠️ REPAYMENT OUTSTANDING
                                  </span>
                                )}
                              </div>
                              <h5 className="text-xl font-black text-white mt-1">
                                Capital Facility: ${loan.fundingDetails.requestedAmount.toLocaleString()} USD
                              </h5>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-[10px] font-mono text-gray-400 uppercase block font-bold">Repayment Due Date</span>
                              <span className="text-sm font-mono font-black text-white">
                                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Loan Summary Grid */}
                          {(() => {
                            const rate = getInterestRateFromPreference(loan.fundingDetails?.repaymentPreference);
                            const totalPayback = Math.round(loan.fundingDetails.requestedAmount * (1 + rate / 100));
                            return (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/60 rounded-xl border border-white/5 font-mono text-xs">
                                <div>
                                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Borrowed Principal</span>
                                  <span className="text-white font-black text-sm">${loan.fundingDetails.requestedAmount.toLocaleString()} USD</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Interest Rate</span>
                                  <span className="text-emerald-400 font-black text-sm">{rate}% Fixed</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Repayment Term</span>
                                  <span className="text-cyan-300 font-black text-sm">{loan.fundingDetails.repaymentPreference}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Repayable Amount</span>
                                  <span className="text-yellow-300 font-black text-sm">${totalPayback.toLocaleString()} USD</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Repayment Form or Under Review Banner */}
                          {isFullyRepaid ? (
                            <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-center space-y-1">
                              <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                              <p className="text-sm font-black text-emerald-300 uppercase font-mono">
                                Loan Facility Fully Repaid & Closed
                              </p>
                              <p className="text-xs text-gray-300 font-bold">
                                Your collateral deposit has been unlocked. You may now apply for additional loan facilities anytime.
                              </p>
                            </div>
                          ) : isUnderReview ? (
                            <div className="p-5 bg-yellow-950/50 border-2 border-yellow-500/50 rounded-xl space-y-2 text-left">
                              <div className="flex items-center gap-2 text-yellow-300 font-mono font-black text-sm uppercase">
                                <Clock className="h-5 w-5 text-yellow-400" />
                                <span>Repayment Proof Submitted — Under Review</span>
                              </div>
                              <p className="text-xs font-bold text-gray-200">
                                ⚡ The Elon Capital loan team will confirm your payment and get back to you within 24 hours. Reference: <code className="bg-black px-2 py-0.5 rounded text-yellow-300 font-mono">{loan.repaymentTxId}</code>
                              </p>
                            </div>
                          ) : (
                            <div className="p-5 bg-black/80 border-2 border-cyan-500/40 rounded-xl space-y-5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                                <div>
                                  <h6 className="text-sm font-black text-white uppercase font-display flex items-center gap-2">
                                    <span className="text-cyan-400 font-mono">⚡</span> Submit Loan Repayment
                                  </h6>
                                  <p className="text-xs text-gray-300 font-semibold mt-0.5">
                                    Send your repayment via <strong className="text-cyan-400 font-black">Binance Smart Chain (BEP-20)</strong>, then paste your transaction hash below for instant confirmation.
                                  </p>
                                </div>
                                <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-400/50 rounded-lg shrink-0">
                                  <span className="text-[10px] font-mono font-black text-cyan-300 uppercase tracking-widest">
                                    BEP-20 / BNB CHAIN EXCLUSIVE
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="p-4 bg-zinc-950 border-2 border-cyan-500/30 rounded-xl space-y-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider">
                                      Binance Smart Chain (BEP-20) Receiving Wallet Address:
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 uppercase font-black">
                                      ✓ Official Receiving Vault
                                    </span>
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-black p-4 rounded-xl border-2 border-cyan-400/40">
                                    <div className="bg-white p-2 rounded-lg shrink-0 shadow-md">
                                      <QRCodeSVG value="0x2eaCE35C695bdCa012E6f0Ce95D5302103EDd926" size={100} />
                                    </div>
                                    <div className="space-y-2 flex-1 w-full">
                                      <div className="flex items-center justify-between gap-2 bg-zinc-900 p-2.5 rounded-lg border border-white/10">
                                        <span className="text-cyan-300 font-mono text-xs sm:text-sm font-black break-all select-all">
                                          0x2eaCE35C695bdCa012E6f0Ce95D5302103EDd926
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText('0x2eaCE35C695bdCa012E6f0Ce95D5302103EDd926');
                                            triggerAlert('success', 'BEP-20 receiving wallet address copied to clipboard!');
                                          }}
                                          className="px-3 py-1.5 bg-cyan-400 text-black hover:bg-cyan-300 text-xs font-black uppercase rounded-md transition-all cursor-pointer shrink-0 font-display shadow-md"
                                        >
                                          Copy Address
                                        </button>
                                      </div>
                                      <p className="text-[11px] font-mono text-zinc-300 font-semibold leading-relaxed">
                                        💡 <strong className="text-white font-bold">Instruction:</strong> Transfer your repayment using the <strong className="text-cyan-300 font-bold">Binance Smart Chain (BEP-20) network</strong> to the wallet address or QR code above.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Repayment Amount Field */}
                                <div>
                                  <label className="block text-xs font-mono font-black text-cyan-300 uppercase mb-1">
                                    Repayment Amount (USD) *
                                  </label>
                                  <input
                                    type="number"
                                    value={repaymentAmountInput}
                                    onChange={(e) => setRepaymentAmountInput(e.target.value)}
                                    placeholder={`Suggested total payback: $${calculateTotalRepayable(loan).toLocaleString()}`}
                                    className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-xs sm:text-sm font-mono font-bold text-white placeholder-gray-600 focus:outline-none"
                                  />
                                  <p className="text-[11px] font-mono text-gray-400 mt-1">
                                    Leave blank to default to full repayable amount (${calculateTotalRepayable(loan).toLocaleString()} USD).
                                  </p>
                                </div>

                                {/* TxHash Field */}
                                <div>
                                  <label className="block text-xs font-mono font-black text-yellow-300 uppercase mb-1">
                                    Blockchain Transaction Hash (TxHash / TxID) *
                                  </label>
                                  <input
                                    type="text"
                                    value={repaymentTxInput}
                                    onChange={(e) => setRepaymentTxInput(e.target.value)}
                                    placeholder="Paste your BEP-20 Transaction Hash (0x...)"
                                    className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-700 focus:border-yellow-400 rounded-xl text-xs sm:text-sm font-mono font-bold text-white placeholder-gray-600 focus:outline-none"
                                  />
                                  <p className="text-[11px] font-mono text-yellow-300 font-bold mt-1.5">
                                    ⚡ Once submitted, our loan team will verify the transaction on the BSC blockchain. Upon confirmation, your loan status will update to Repaid & Settled.
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={actionLoading || !repaymentTxInput.trim()}
                                onClick={async () => {
                                  if (!repaymentTxInput.trim()) return;
                                  setActionLoading(true);
                                  try {
                                    const res = await fetch('/api/loans/repay', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                      },
                                      body: JSON.stringify({
                                        loanId: loan.id,
                                        txId: repaymentTxInput.trim(),
                                        amount: repaymentAmountInput ? Number(repaymentAmountInput) : calculateTotalRepayable(loan)
                                      })
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || 'Repayment submission failed.');
                                    triggerAlert('success', data.message || 'Repayment submitted successfully!');
                                    setRepaymentTxInput('');
                                    setRepaymentAmountInput('');
                                    await fetchAllData();
                                  } catch (err: any) {
                                    triggerAlert('error', err.message);
                                  } finally {
                                    setActionLoading(false);
                                  }
                                }}
                                className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-black text-sm uppercase tracking-wider rounded-xl transition cursor-pointer font-display shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                              >
                                {actionLoading ? 'Transmitting Repayment Proof...' : '✓ Submit Loan Repayment Proof'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

        </div>

      </div>

      {/* ----------------- LOAN SUBMISSION CONFIRMATION MODAL ----------------- */}
      {submittedLoanConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none animate-fade-in">
          <div className="relative w-full max-w-lg bg-neutral-950 border-2 border-cyan-400 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(34,211,238,0.3)] text-left space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <Check className="h-10 w-10 stroke-[3]" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-black block">
                APPLICATION SUBMISSION SUCCESS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                Loan Successfully Submitted
              </h3>
              <p className="text-sm text-gray-300 font-bold font-mono">
                Reference ID: <span className="text-cyan-400 font-black">{submittedLoanConfirmation.id}</span>
              </p>
            </div>

            <div className="p-5 bg-cyan-950/40 border-2 border-cyan-400/50 rounded-2xl text-center space-y-3">
              <p className="text-sm sm:text-base font-black text-white leading-relaxed">
                Please wait while our team reviews your application. You can monitor the progress in your Loan Application tab.
              </p>
              <p className="text-xs font-semibold text-gray-300 leading-normal">
                Our risk assessment team is conducting verification. You will be notified of updates directly in your Message Desk.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedLoanConfirmation(null);
                  handleTabChange('loans');
                }}
                className="w-full py-4 text-xs sm:text-sm font-black uppercase tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 transition-all rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] cursor-pointer font-display"
              >
                View Loan Application Tab →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- COLLATERAL PAYMENT MODAL ----------------- */}
      {payingCollateralLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
          <div className="relative w-full max-w-2xl bg-neutral-950 border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] shadow-[0_0_60px_rgba(234,179,8,0.2)] animate-fade-in text-left space-y-6">
            <button
              onClick={() => setPayingCollateralLoan(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-yellow-400 font-black block flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> OFFICIAL LOAN SETTLEMENT PORTAL
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                Refundable Collateral & Settlement Payment
              </h3>
              <p className="text-sm font-bold text-gray-300">
                Approved Loan Capital Amount: <span className="text-yellow-400 font-mono font-black text-lg">${payingCollateralLoan.fundingDetails.requestedAmount.toLocaleString()} USD</span>
              </p>
            </div>

            {/* Clear Layman Explanation Box */}
            <div className="p-5 bg-black/90 border-2 border-yellow-400/60 rounded-2xl space-y-4 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <h4 className="text-sm font-mono font-black uppercase text-yellow-300 tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">💡 Official Settlement Breakdown</span>
                <span className="text-xs bg-yellow-400 text-black px-2.5 py-0.5 rounded font-black uppercase">
                  {(collateralPaymentMethod === 'Crypto' && isPayFullCrypto) ? 'Full Crypto Settlement' : `Installment ${selectedInstallmentNum} of 4`}
                </span>
              </h4>

              <p className="text-xs sm:text-sm text-gray-100 font-bold leading-relaxed">
                Congratulations! Your loan request of <strong className="text-white font-black">${payingCollateralLoan.fundingDetails.requestedAmount.toLocaleString()}</strong> has been approved. To complete the final step and disburse these funds directly to your bank or crypto wallet, you must submit your combined settlement deposit of <strong className="text-yellow-300 font-black">28.5% Total Fees</strong> (combining the <strong className="text-yellow-400 font-black">25% Refundable Security Collateral</strong> and the <strong className="text-cyan-400 font-black">3.5% Company Fee</strong>).
              </p>

              {(() => {
                const requestedAmt = payingCollateralLoan.fundingDetails.requestedAmount;
                const totalCollateral = Math.round(requestedAmt * 0.25);
                const companyFee = Math.round(requestedAmt * 0.035);
                const totalSettlement = Math.round(requestedAmt * 0.285);
                const instAmount = Math.round(totalSettlement / 4);
                const currentDue = (collateralPaymentMethod === 'Crypto' && isPayFullCrypto) ? totalSettlement : instAmount;

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-zinc-900/95 rounded-xl border-2 border-yellow-400/50 space-y-1">
                        <span className="text-[10px] font-mono text-gray-300 uppercase font-black block">1. Refundable Collateral (25%)</span>
                        <span className="text-xl font-black font-mono text-yellow-300">${totalCollateral.toLocaleString()} USD</span>
                        <span className="text-[10px] font-bold text-emerald-400 block pt-0.5">
                          ✓ 100% Fully Refunded back to you after loan completion.
                        </span>
                      </div>

                      <div className="p-3 bg-zinc-900/95 rounded-xl border-2 border-cyan-400/50 space-y-1">
                        <span className="text-[10px] font-mono text-gray-300 uppercase font-black block">2. Company Fee (3.5%)</span>
                        <span className="text-xl font-black font-mono text-cyan-300">${companyFee.toLocaleString()} USD</span>
                        <span className="text-[10px] font-bold text-gray-200 block pt-0.5">
                          Capital loan processing and legal verification fee.
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-950/80 border-2 border-yellow-400 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-md">
                      <div>
                        <span className="text-yellow-300 font-mono font-black uppercase text-xs sm:text-sm block">
                          {(collateralPaymentMethod === 'Crypto' && isPayFullCrypto) ? 'Full Settlement Amount Due (Collateral + Fee):' : `Installment ${selectedInstallmentNum} Amount Due (Combined Split):`}
                        </span>
                        <span className="text-[11px] text-gray-200 font-mono font-bold">
                          {(collateralPaymentMethod === 'Crypto' && isPayFullCrypto) ? 'Includes 25% Refundable Collateral + 3.5% Company Fee in full' : `1 of 4 installments of total $${totalSettlement.toLocaleString()} USD`}
                        </span>
                      </div>
                      <span className="text-2xl font-black font-mono text-yellow-300 tracking-tight">${currentDue.toLocaleString()} USD</span>
                    </div>
                  </div>
                );
              })()}

              {/* Customer Support Direct Contact Notice */}
              <div className="p-3.5 bg-yellow-950/50 border-2 border-yellow-400/60 rounded-xl space-y-1 text-xs text-white">
                <span className="font-mono font-black text-yellow-300 uppercase tracking-wider block flex items-center gap-1.5">
                  💬 Need Assistance or Have Questions?
                </span>
                <p className="leading-relaxed font-bold text-gray-200">
                  If you have any questions or need step-by-step guidance, please send a message with your screenshots directly to <span className="text-yellow-300 font-black underline">Customer Service / Live Chat</span>. Our support team is online to assist you instantly!
                </p>
              </div>
            </div>

            {/* Selector tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-black uppercase text-gray-200 tracking-wider">
                Select Your Payment Gateway:
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-black rounded-xl border border-white/20">
                <button
                  type="button"
                  onClick={() => {
                    setCollateralPaymentMethod('Stripe');
                  }}
                  className={`py-3 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    collateralPaymentMethod === 'Stripe' || collateralPaymentMethod === 'Wire'
                      ? 'bg-yellow-400 text-black font-black shadow-lg scale-[1.02]'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span>💳 Credit / Debit Card (Stripe)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCollateralPaymentMethod('Crypto');
                    setIsPayFullCrypto(true);
                  }}
                  className={`py-3 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    collateralPaymentMethod === 'Crypto'
                      ? 'bg-yellow-400 text-black font-black shadow-lg scale-[1.02]'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span>🪙 Crypto (BEP20)</span>
                </button>
              </div>
            </div>

            {/* Payment Option Contents */}
            {collateralPaymentMethod === 'Crypto' ? (
              <div className="space-y-4">
                {/* Crypto Payment Plan Selection (Installment vs Pay Full) */}
                <div className="p-3 bg-black rounded-xl border border-yellow-500/40 space-y-2">
                  <label className="block text-[11px] font-mono font-black uppercase text-yellow-300">
                    BEP20 Payment Structure:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPayFullCrypto(false)}
                      className={`p-3 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                        !isPayFullCrypto
                          ? 'bg-yellow-400 text-black border-yellow-400 font-bold'
                          : 'bg-zinc-900 text-gray-200 border-white/20 hover:border-yellow-400/50'
                      }`}
                    >
                      <div className="text-xs uppercase font-black">Pay Installment {selectedInstallmentNum} of 4</div>
                      <div className="text-xs font-black font-mono">
                        ${Math.round((payingCollateralLoan.fundingDetails.requestedAmount * 0.285) / 4).toLocaleString()} USD
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPayFullCrypto(true)}
                      className={`p-3 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                        isPayFullCrypto
                          ? 'bg-yellow-400 text-black border-yellow-400 font-bold'
                          : 'bg-zinc-900 text-gray-200 border-white/20 hover:border-yellow-400/50'
                      }`}
                    >
                      <div className="text-xs uppercase font-black">Pay Full Settlement At Once</div>
                      <div className="text-xs font-black font-mono">
                        ${Math.round(payingCollateralLoan.fundingDetails.requestedAmount * 0.285).toLocaleString()} USD (100% Full Settlement)
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-zinc-900 rounded-xl border-2 border-cyan-500/40 space-y-4 text-center">
                  <div className="inline-block px-3 py-1 bg-cyan-950 border border-cyan-400 text-cyan-400 font-mono text-xs font-black uppercase rounded-full tracking-wider">
                    ⚡ Required Network Protocol: BEP20 (BNB Smart Chain)
                  </div>

                  {/* QR CODE DISPLAY */}
                  <div className="py-2">
                    <QRCodeSVG 
                      value="0x2eaCE35C695bdCa012E6f0Ce95D5302103EDd926" 
                      size={160} 
                      bgLineWidth={0} 
                      fgColor="#22d3ee" 
                      bgColor="#0a0a0a" 
                      level="H" 
                      className="mx-auto rounded-xl p-3 bg-black border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                    />
                    <span className="block text-[11px] font-mono text-zinc-400 mt-2 font-bold uppercase tracking-wider">
                      Scan QR Code to Send BEP20 Tokens
                    </span>
                  </div>

                  <div className="text-left space-y-1">
                    <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider block">
                      Official BEP20 Receiving Wallet Address:
                    </span>
                    <div className="flex items-center justify-between gap-2 bg-black p-3.5 rounded-xl border-2 border-cyan-400/50 font-mono text-xs sm:text-sm font-black text-cyan-300 select-all">
                      <span className="break-all font-mono">0x2eaCE35C695bdCa012E6f0Ce95D5302103EDd926</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('0x2eaCE35C695bdCa012E6f0Ce95D5302103EDd926');
                          triggerAlert('success', 'BEP20 Wallet address copied to clipboard!');
                        }}
                        className="px-3 py-1.5 bg-cyan-400 text-black text-[11px] font-black uppercase rounded-lg hover:bg-cyan-300 transition-all cursor-pointer shrink-0 font-display shadow-md"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-left text-xs font-mono text-red-300 space-y-1">
                    <span className="font-black uppercase block text-red-400">⚠️ IMPORTANT NETWORK WARNING:</span>
                    <p className="leading-relaxed">
                      Only send funds using the <strong className="text-white underline">BEP20 (BNB Smart Chain)</strong> network. Transactions sent using ERC20, TRC20, Polygon, or any other network will fail and funds may be lost.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono font-black text-gray-200 uppercase tracking-wider">
                    Enter BEP20 Blockchain Transaction Hash (TxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={collateralTxIdInput}
                    onChange={(e) => setCollateralTxIdInput(e.target.value)}
                    placeholder="e.g. 0x8a9f... 64-character BEP20 transaction hash"
                    className="w-full px-4 py-3 bg-black border-2 border-zinc-700 focus:border-cyan-400 rounded-xl text-xs sm:text-sm font-mono font-bold text-white placeholder-gray-600 focus:outline-none"
                  />
                  <p className="text-[11px] font-mono text-cyan-300 font-bold">
                    ⚡ Once submitted, your transaction hash will be audited by Admin. Verification takes under 24 hours.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* STRIPE CARD PAYMENT METHOD */}
                <div className="p-5 bg-zinc-900 rounded-xl border-2 border-yellow-400/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono font-black text-yellow-400 uppercase tracking-wider">
                      💳 Stripe Card Payment Gateway
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase">
                      Instant Automated Settlement
                    </span>
                  </div>

                  <div className="p-4 bg-black rounded-xl border border-white/10 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-gray-300">
                      <span>Loan Reference ID:</span>
                      <span className="text-white font-bold">{payingCollateralLoan.id}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Fee Description:</span>
                      <span className="text-white font-bold">Collateral Deposit & Organizational Fee</span>
                    </div>
                    <div className="flex justify-between text-yellow-300 font-bold text-sm pt-2 border-t border-white/10">
                      <span>Total Amount to Pay:</span>
                      <span className="text-yellow-400 font-black text-base">
                        ${(() => {
                          const totalSettlement = Math.round(payingCollateralLoan.fundingDetails.requestedAmount * 0.285);
                          const instAmount = Math.round(totalSettlement / 4);
                          return (isPayFullCrypto ? totalSettlement : instAmount).toLocaleString();
                        })()} USD
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-gray-300 uppercase font-bold block">
                      Accepted Cards & Methods:
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-black text-white bg-black/60 p-3 rounded-lg border border-white/10">
                      <span className="px-2.5 py-1 bg-zinc-800 rounded border border-white/10 text-cyan-300">💳 Visa</span>
                      <span className="px-2.5 py-1 bg-zinc-800 rounded border border-white/10 text-amber-300">💳 Mastercard</span>
                      <span className="px-2.5 py-1 bg-zinc-800 rounded border border-white/10 text-cyan-200">💳 American Express</span>
                      <span className="px-2.5 py-1 bg-zinc-800 rounded border border-white/10 text-white">🍎 Apple Pay</span>
                      <span className="px-2.5 py-1 bg-zinc-800 rounded border border-white/10 text-emerald-300">G Pay</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-gray-300 leading-relaxed font-bold">
                    🔒 Payment will be securely processed via 256-Bit SSL Encrypted Stripe Checkout. Your payment status will update immediately upon authorization.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handlePayCollateral(payingCollateralLoan.id)}
                className="w-full py-4 text-xs font-black uppercase tracking-widest text-black bg-yellow-400 hover:bg-yellow-300 transition-all rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2 cursor-pointer font-display text-sm"
              >
                {actionLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-black" />
                ) : collateralPaymentMethod === 'Stripe' || collateralPaymentMethod === 'Wire' ? (
                  '💳 PROCEED TO STRIPE CARD CHECKOUT'
                ) : (
                  '⚡ SUBMIT BEP20 CRYPTO PAYMENT PROOF'
                )}
              </button>

              <button
                type="button"
                onClick={() => setPayingCollateralLoan(null)}
                className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shrink-0"
              >
                Cancel
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

      {/* Withdrawal Modal Overlay */}
      {withdrawalModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden">
            
            <button
              onClick={() => setWithdrawalModal(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block flex items-center gap-2">
                <Check className="h-4 w-4" /> Liquidity Release Authorized
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                Withdraw Loan Capital
              </h3>
              <p className="text-sm text-gray-300 font-medium">
                Approved Capital Sum: <span className="text-emerald-400 font-mono font-black text-lg">${withdrawalModal.fundingDetails.requestedAmount.toLocaleString()} USD</span>
              </p>
            </div>

            {withdrawalSubmitted ? (
              <div className="p-6 bg-emerald-950/60 border-2 border-emerald-500/50 rounded-2xl space-y-4 text-center animate-fade-in shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border-2 border-emerald-500/50">
                  <Check className="h-10 w-10 stroke-[3]" />
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
                  WITHDRAWAL DISPATCHED & LOAN DEBITED!
                </h4>
                <p className="text-sm sm:text-base text-gray-100 leading-relaxed font-bold">
                  Your request to withdraw <span className="text-emerald-400 font-mono font-black text-xl">${withdrawalModal.fundingDetails.requestedAmount.toLocaleString()} USD</span> via {withdrawType === 'crypto' ? `${withdrawCryptoAsset} (${withdrawCryptoNetwork})` : 'Bank Wire'} has been queued for immediate release.
                </p>
                <div className="p-4 bg-black/80 rounded-xl border border-emerald-500/40 text-xs text-emerald-300 font-mono font-black uppercase tracking-wider space-y-1.5 text-left">
                  <div className="text-emerald-400 font-black">⚡ ACCOUNT STATUS: LOAN BALANCE DEBITED ($0 REMAINING)</div>
                  <div className="text-gray-200 text-xs font-sans font-bold">Funds will settle in your destination account within 1 to 24 hours.</div>
                  <div className="text-cyan-300 text-xs font-sans font-bold pt-1 border-t border-white/10">💬 Direct Feedback: If you have any questions, please contact customer service.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setWithdrawalModal(null)}
                  className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display shadow-lg hover:scale-105 active:scale-95"
                >
                  Done / Return to Dashboard
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setWithdrawValidationError(null);

                  if (withdrawType === 'crypto') {
                    const addr = withdrawWalletAddress.trim();
                    if (!addr) {
                      setWithdrawValidationError(`⚠️ Address Required: Please enter a valid wallet address for ${withdrawCryptoNetwork} network.`);
                      return;
                    }
                    if (withdrawCryptoNetwork === 'ERC-20' || withdrawCryptoNetwork === 'BEP-20') {
                      if (!addr.toLowerCase().startsWith('0x')) {
                        setWithdrawValidationError(`⚠️ Address Format & Network Mismatch Error: You selected ${withdrawCryptoNetwork} network, but provided an invalid wallet address. ERC-20 and BEP-20 (Web 20) wallet addresses must begin with "0x". Please provide a valid 0x EVM wallet address.`);
                        return;
                      }
                    } else if (withdrawCryptoNetwork === 'TRC-20') {
                      if (addr.toLowerCase().startsWith('0x')) {
                        setWithdrawValidationError(`⚠️ Network Mismatch Error: You selected TRC-20 (Tron) network, but provided an EVM address starting with "0x". Please enter a valid TRC-20 wallet address starting with "T".`);
                        return;
                      }
                    } else if (withdrawCryptoNetwork === 'SOL') {
                      if (addr.toLowerCase().startsWith('0x')) {
                        setWithdrawValidationError(`⚠️ Network Mismatch Error: You selected Solana (SOL) network, but provided an EVM address starting with "0x". Please select ERC-20 or BEP-20 network, or enter a valid base58 Solana wallet address.`);
                        return;
                      }
                    }
                  } else {
                    if (!withdrawBankName || !withdrawAccountNo || !withdrawAccountName) {
                      setWithdrawValidationError(`⚠️ Bank Coordinates Missing: Please provide Bank Name, Account Number, and Account Holder Name.`);
                      return;
                    }
                  }

                  // Perform Loan Debiting & Log Transaction on Server
                  if (withdrawalModal) {
                    setActionLoading(true);
                    try {
                      const res = await fetch('/api/loans/withdraw', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          loanId: withdrawalModal.id,
                          withdrawType,
                          withdrawDetails: {
                            walletAddress: withdrawWalletAddress,
                            cryptoAsset: withdrawCryptoAsset,
                            cryptoNetwork: withdrawCryptoNetwork,
                            bankName: withdrawBankName,
                            accountNo: withdrawAccountNo,
                            accountName: withdrawAccountName
                          }
                        })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Withdrawal failed');

                      setWithdrawnLoanIds(prev => [...prev, withdrawalModal.id]);
                      const newTx = {
                        id: `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        description: `Loan Capital Debited & Dispatched (${withdrawType === 'crypto' ? `${withdrawCryptoAsset} / ${withdrawCryptoNetwork}` : 'Bank Wire'})`,
                        type: 'debit' as const,
                        amount: withdrawalModal.fundingDetails.requestedAmount,
                        method: withdrawType === 'crypto' ? `${withdrawCryptoAsset} (${withdrawWalletAddress.slice(0, 6)}...${withdrawWalletAddress.slice(-4)})` : `Bank: ${withdrawBankName} (${withdrawAccountNo.slice(-4)})`,
                        status: 'COMPLETED / DEBITED'
                      };
                      setCustomTransactions(prev => [newTx, ...prev]);
                      setWithdrawalSubmitted(true);
                      triggerAlert('success', 'Withdrawal request submitted successfully & loan balance debited.');
                      await fetchAllData();
                    } catch (err: any) {
                      setWithdrawValidationError(`⚠️ ${err.message}`);
                    } finally {
                      setActionLoading(false);
                    }
                  }
                }}
                className="space-y-5"
              >
                {/* Error Banner */}
                {withdrawValidationError && (
                  <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-xl text-red-200 text-xs font-mono font-black space-y-1 animate-shake">
                    <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[11px]">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" /> Validation Failed
                    </div>
                    <p className="leading-relaxed">{withdrawValidationError}</p>
                  </div>
                )}

                {/* Method Selection Tabs */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-black rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawType('crypto');
                      setWithdrawValidationError(null);
                    }}
                    className={`py-3 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      withdrawType === 'crypto'
                        ? 'bg-emerald-400 text-black font-black shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🪙 Crypto (Instant)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawType('bank');
                      setWithdrawValidationError(null);
                    }}
                    className={`py-3 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      withdrawType === 'bank'
                        ? 'bg-emerald-400 text-black font-black shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🏦 Bank Wire (1–7 Days)
                  </button>
                </div>

                {withdrawType === 'crypto' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2 font-bold">
                        Select Cryptocurrency Network *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawCryptoNetwork('ERC-20');
                            setWithdrawCryptoAsset('USDT (ERC-20 Ethereum Network)');
                            setWithdrawValidationError(null);
                          }}
                          className={`py-2.5 px-2 text-xs font-mono font-black rounded-xl border-2 transition-all ${
                            withdrawCryptoNetwork === 'ERC-20'
                              ? 'bg-emerald-400 text-black border-emerald-400'
                              : 'bg-black text-gray-300 border-zinc-700 hover:border-gray-500'
                          }`}
                        >
                          ERC-20
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawCryptoNetwork('BEP-20');
                            setWithdrawCryptoAsset('USDT (BEP-20 / BSC Network)');
                            setWithdrawValidationError(null);
                          }}
                          className={`py-2.5 px-2 text-xs font-mono font-black rounded-xl border-2 transition-all ${
                            withdrawCryptoNetwork === 'BEP-20'
                              ? 'bg-emerald-400 text-black border-emerald-400'
                              : 'bg-black text-gray-300 border-zinc-700 hover:border-gray-500'
                          }`}
                        >
                          BEP-20
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawCryptoNetwork('TRC-20');
                            setWithdrawCryptoAsset('USDT (TRC-20 Tron Network)');
                            setWithdrawValidationError(null);
                          }}
                          className={`py-2.5 px-2 text-xs font-mono font-black rounded-xl border-2 transition-all ${
                            withdrawCryptoNetwork === 'TRC-20'
                              ? 'bg-emerald-400 text-black border-emerald-400'
                              : 'bg-black text-gray-300 border-zinc-700 hover:border-gray-500'
                          }`}
                        >
                          TRC-20
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawCryptoNetwork('SOL');
                            setWithdrawCryptoAsset('USDT (Solana SOL Network)');
                            setWithdrawValidationError(null);
                          }}
                          className={`py-2.5 px-2 text-xs font-mono font-black rounded-xl border-2 transition-all ${
                            withdrawCryptoNetwork === 'SOL'
                              ? 'bg-emerald-400 text-black border-emerald-400'
                              : 'bg-black text-gray-300 border-zinc-700 hover:border-gray-500'
                          }`}
                        >
                          SOL
                        </button>
                      </div>

                      <select
                        value={withdrawCryptoAsset}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWithdrawCryptoAsset(val);
                          if (val.includes('ERC-20')) setWithdrawCryptoNetwork('ERC-20');
                          else if (val.includes('BEP-20') || val.includes('BSC')) setWithdrawCryptoNetwork('BEP-20');
                          else if (val.includes('TRC-20') || val.includes('Tron')) setWithdrawCryptoNetwork('TRC-20');
                          else if (val.includes('Solana') || val.includes('SOL')) setWithdrawCryptoNetwork('SOL');
                          setWithdrawValidationError(null);
                        }}
                        className="w-full px-4 py-3 bg-black border-2 border-zinc-700 focus:border-emerald-400 rounded-xl text-sm font-mono text-white focus:outline-none"
                      >
                        <option value="USDT (TRC-20 Tron Network)">USDT (TRC-20 Tron Network)</option>
                        <option value="USDT (ERC-20 Ethereum Network)">USDT (ERC-20 Ethereum Network)</option>
                        <option value="USDT (BEP-20 / BSC Network)">USDT (BEP-20 Binance Smart Chain)</option>
                        <option value="USDT (Solana SOL Network)">USDT (Solana Network)</option>
                        <option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
                        <option value="Ethereum (ETH)">Ethereum (ETH)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2 font-bold">
                        Destination Wallet Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={withdrawWalletAddress}
                        onChange={(e) => {
                          setWithdrawWalletAddress(e.target.value);
                          setWithdrawValidationError(null);
                        }}
                        placeholder={
                          withdrawCryptoNetwork === 'ERC-20' || withdrawCryptoNetwork === 'BEP-20'
                            ? "Must start with 0x... (e.g. 0x71C...)"
                            : withdrawCryptoNetwork === 'TRC-20'
                            ? "TRC-20 address starting with T... (e.g. T9x...)"
                            : withdrawCryptoNetwork === 'SOL'
                            ? "Solana base58 address (e.g. 7xKX...)"
                            : "Enter your wallet address"
                        }
                        className="w-full px-4 py-3 bg-black border-2 border-zinc-700 focus:border-emerald-400 rounded-xl text-sm font-mono text-white focus:outline-none"
                      />
                      <p className="text-[11px] font-mono text-gray-400 mt-1 font-bold">
                        {withdrawCryptoNetwork === 'ERC-20' && '⚡ Instant Transfer • Requires a valid 0x EVM wallet address.'}
                        {withdrawCryptoNetwork === 'BEP-20' && '⚡ Instant Transfer • Requires a valid 0x EVM wallet address.'}
                        {withdrawCryptoNetwork === 'TRC-20' && '⚡ Instant Transfer • Requires a valid TRC-20 address starting with T.'}
                        {withdrawCryptoNetwork === 'SOL' && '⚡ Instant Transfer • Requires a valid Solana address.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-cyan-950/50 border border-cyan-400/40 rounded-xl text-xs font-mono text-cyan-300 font-bold">
                      ℹ️ Bank Wire transfers take 1 to 7 working days for processing and international settlement. For instant settlement, choose Cryptocurrency.
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-1 font-bold">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={withdrawBankName}
                        onChange={(e) => setWithdrawBankName(e.target.value)}
                        placeholder="e.g. Chase Bank, Barclays, Citibank"
                        className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 focus:border-emerald-400 rounded-xl text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-1 font-bold">
                          Account / IBAN Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={withdrawAccountNo}
                          onChange={(e) => setWithdrawAccountNo(e.target.value)}
                          placeholder="e.g. GB29NWBK60161331926819"
                          className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 focus:border-emerald-400 rounded-xl text-xs font-mono text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-1 font-bold">
                          SWIFT / BIC Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={withdrawSwiftCode}
                          onChange={(e) => setWithdrawSwiftCode(e.target.value)}
                          placeholder="e.g. CHASUS33XXX"
                          className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 focus:border-emerald-400 rounded-xl text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-1 font-bold">
                        Account Holder Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={withdrawAccountName}
                        onChange={(e) => setWithdrawAccountName(e.target.value)}
                        placeholder="e.g. Johnathan Doe"
                        className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 focus:border-emerald-400 rounded-xl text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer font-display shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                  >
                    Confirm & Submit Withdrawal
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalModal(null)}
                    className="px-5 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer font-mono"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Refundable Collateral Modal Notice Overlay */}
      {collateralNoticeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border-2 border-yellow-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-[0_0_50px_rgba(234,179,8,0.25)] relative text-left">
            <button
              onClick={() => setCollateralNoticeModal(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-yellow-400 font-black block flex items-center gap-2">
                <Lock className="h-5 w-5 text-yellow-400" /> SECURE ESCROW VAULT LOCK
              </span>
              <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                Refundable Collateral Notice
              </h3>
            </div>

            <div className="p-5 bg-yellow-950/40 border-2 border-yellow-500/40 rounded-2xl space-y-3">
              <p className="text-base text-white font-bold leading-relaxed">
                Your 25% refundable collateral (<span className="text-yellow-400 font-mono font-black text-lg">${(collateralNoticeModal.fundingDetails.requestedAmount * 0.25).toLocaleString()} USD</span>) is securely held by <strong className="text-cyan-300">Elon Capital Loan</strong> and can only be withdrawn after your loan has reached maturity and has been fully repaid.
              </p>
            </div>

            <div className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-300 font-bold">
                <span>Escrow Collateral Value:</span>
                <span className="text-yellow-400 font-black">${(collateralNoticeModal.fundingDetails.requestedAmount * 0.25).toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between text-gray-300 font-bold">
                <span>Repayment Condition:</span>
                <span className="text-emerald-400 font-black">Full Repayment at Maturity</span>
              </div>
              <div className="flex justify-between text-gray-300 font-bold">
                <span>Vault Custodian:</span>
                <span className="text-white font-black">Elon Capital Institutional Escrow</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCollateralNoticeModal(null)}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display shadow-lg hover:scale-105 active:scale-95"
            >
              I UNDERSTAND / DISMISS
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
