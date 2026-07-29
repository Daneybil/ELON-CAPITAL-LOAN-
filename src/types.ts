export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  password?: string;
  isVerified: boolean;
  verificationCode?: string;
  isSuspended: boolean;
  role: 'user' | 'admin';
  createdAt: string;
  profilePhoto?: string;
  notificationPreferences?: {
    emailUpdates: boolean;
    applicationAlerts: boolean;
    securityAlerts: boolean;
  };
  activityHistory?: Array<{ id: string; action: string; timestamp: string; ipAddress: string }>;
}

export interface LoanInstallment {
  number: number;
  amount: number;
  status: 'Pending' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  txId?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  paymentMethod?: string;
  proofUrl?: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  personalInfo: {
    dateOfBirth: string;
    maritalStatus: string;
    address: string;
  };
  employmentInfo: {
    status: string;
    employerName?: string;
    monthlyIncome: number;
    yearsEmployed: number;
  };
  businessInfo?: {
    companyName?: string;
    registrationNumber?: string;
    industry?: string;
    annualRevenue?: number;
  };
  fundingDetails: {
    purpose: string;
    requestedAmount: number;
    repaymentPreference: string;
    description: string;
  };
  financialInfo: {
    existingDebts: number;
    creditScore?: number;
    assetsValue?: number;
  };
  status: 'Pending' | 'Approved' | 'Declined' | 'Under Review' | 'Processing';
  rejectionReason?: string;
  requiresEnhancedVerification: boolean;
  documents: Array<{ name: string; type: string; url: string; uploadedAt: string }>;
  collateralPaid?: boolean;
  collateralTxId?: string;
  collateralPaymentStatus?: 'None' | 'Pending' | 'Submitted' | 'Under Review' | 'Confirmed' | 'Rejected';
  isInstallmentPlan?: boolean;
  installments?: LoanInstallment[];
  disbursed?: boolean;
  disbursedAt?: string;
  withdrawn?: boolean;
  withdrawnAt?: string;
  withdrawalDetails?: any;
  repaid?: boolean;
  repaidAt?: string;
  repaymentTxId?: string;
  repaymentStatus?: 'None' | 'Pending' | 'Submitted' | 'Under Review' | 'Confirmed' | 'Rejected';
  gender?: string;
  ssnBvn?: string;
  nationalId?: string;
  passportNumber?: string;
  createdAt: string;
}

export interface KYC {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  idCardUrl: string;
  selfieUrl: string;
  addressProofUrl?: string;
  businessDocUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review' | 'Pending_Upload';
  remarks?: string;
  updatedAt: string;

  // New fields for Stage 2 KYC Flow
  fullName?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  employmentStatus?: string;
  employer?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  country?: string;
  residentialAddress?: string;
  proofOfAddressUrl?: string;
  governmentIdUrl?: string;
  passportNumber?: string;
  nationalId?: string;
  ssnBvn?: string;
  loanPurpose?: string;
  loanDescription?: string;
  socialHandles?: string;
  idType?: string;
  videoUrl?: string;
  requestedAmount?: number;
  loanDuration?: number;
}

export interface Message {
  id: string;
  senderId: string; // 'admin' or user.id
  senderName: string;
  receiverId: string; // 'admin' or user.id
  content: string;
  attachment?: { name: string; url: string };
  isRead: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  status: 'Open' | 'Resolved' | 'Waiting for User';
  replies: Array<{
    id: string;
    senderRole: 'user' | 'admin';
    senderName: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Security' | 'Maintenance' | 'Update';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string; // or 'all'
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  action: string;
  details: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  createdAt: string;
}

export interface HomePageContent {
  heroHeadline: string;
  heroSubheadline: string;
  statTotalFunded: string;
  statActiveBorrowers: string;
  statGlobalProjects: string;
}
