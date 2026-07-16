export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
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
  status: 'Pending' | 'Approved' | 'Declined' | 'Under Review';
  requiresEnhancedVerification: boolean;
  documents: Array<{ name: string; type: string; url: string; uploadedAt: string }>;
  collateralPaid?: boolean;
  collateralTxId?: string;
  disbursed?: boolean;
  disbursedAt?: string;
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
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  remarks?: string;
  updatedAt: string;
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
