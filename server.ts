import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { 
  User, 
  LoanApplication, 
  KYC, 
  Message, 
  SupportTicket, 
  Announcement, 
  Notification, 
  SystemLog, 
  HomePageContent 
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.json');

app.use(express.json({ limit: '10mb' }));

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Initialize Database structure
interface DB {
  users: User[];
  loans: LoanApplication[];
  kyc: KYC[];
  messages: Message[];
  tickets: SupportTicket[];
  announcements: Announcement[];
  notifications: Notification[];
  logs: SystemLog[];
  homePageContent: HomePageContent;
}

const DEFAULT_HOMEPAGE_CONTENT: HomePageContent = {
  heroHeadline: "Financing Engineered for High-Growth Ventures",
  heroSubheadline: "Institutional liquidity up to $500,000,000. Fast, secure, and built for modern Web3, tech startups, SMEs, and digital enterprises.",
  statTotalFunded: "$1,480,240,000+",
  statActiveBorrowers: "14,820+",
  statGlobalProjects: "112"
};

const INITIAL_DB: DB = {
  users: [
    {
      id: "admin-1",
      name: "Administrator Console",
      email: "admin@eloncapitalloan.com",
      phone: "+1 (800) 555-0199",
      country: "Switzerland",
      isVerified: true,
      isSuspended: false,
      role: "admin",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      activityHistory: [
        { id: generateId(), action: "Admin system initialization", timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), ipAddress: "127.0.0.1" }
      ]
    },
    {
      id: "user-1",
      name: "Alex Thorne",
      email: "borrower@eloncapitalloan.com",
      phone: "+1 (415) 890-3420",
      country: "United States",
      isVerified: true,
      isSuspended: false,
      role: "user",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      notificationPreferences: {
        emailUpdates: true,
        applicationAlerts: true,
        securityAlerts: true
      },
      activityHistory: [
        { id: generateId(), action: "Account created", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), ipAddress: "192.168.1.45" },
        { id: generateId(), action: "Verified email address", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), ipAddress: "192.168.1.45" },
        { id: generateId(), action: "User session login", timestamp: new Date().toISOString(), ipAddress: "192.168.1.45" }
      ]
    }
  ],
  loans: [
    {
      id: "loan-1",
      userId: "user-1",
      userEmail: "borrower@eloncapitalloan.com",
      userName: "Alex Thorne",
      personalInfo: {
        dateOfBirth: "1988-06-12",
        maritalStatus: "Single",
        address: "555 Mission St, San Francisco, CA"
      },
      employmentInfo: {
        status: "Self-Employed",
        employerName: "Apex Blockchain Labs",
        monthlyIncome: 25000,
        yearsEmployed: 4
      },
      businessInfo: {
        companyName: "Apex Blockchain Labs Inc.",
        registrationNumber: "US-8942-TX",
        industry: "Web3 Development & Infrastructure",
        annualRevenue: 320000
      },
      fundingDetails: {
        purpose: "Expansion Capital",
        requestedAmount: 1250000,
        repaymentPreference: "Monthly structured / 36 months",
        description: "To hire 3 senior Rust engineers and scale our Layer-2 indexing infrastructure."
      },
      financialInfo: {
        existingDebts: 50000,
        creditScore: 780,
        assetsValue: 450000
      },
      status: "Approved",
      requiresEnhancedVerification: false,
      documents: [
        { name: "incorporation_doc.pdf", type: "Business Registration", url: "#", uploadedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
        { name: "financial_statements.pdf", type: "Financial Record", url: "#", uploadedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "loan-2",
      userId: "user-1",
      userEmail: "borrower@eloncapitalloan.com",
      userName: "Alex Thorne",
      personalInfo: {
        dateOfBirth: "1988-06-12",
        maritalStatus: "Single",
        address: "555 Mission St, San Francisco, CA"
      },
      employmentInfo: {
        status: "Self-Employed",
        employerName: "Apex Blockchain Labs",
        monthlyIncome: 25000,
        yearsEmployed: 4
      },
      businessInfo: {
        companyName: "Apex Blockchain Labs Inc.",
        registrationNumber: "US-8942-TX",
        industry: "Web3 Development & Infrastructure",
        annualRevenue: 320000
      },
      fundingDetails: {
        purpose: "Web3 Liquidity Provision",
        requestedAmount: 15000000,
        repaymentPreference: "Flexible / 24 months",
        description: "DeFi liquidity pool facilitation and smart contract staking collateral."
      },
      financialInfo: {
        existingDebts: 50000,
        creditScore: 780,
        assetsValue: 450000
      },
      status: "Pending",
      requiresEnhancedVerification: true, // Over $5M trigger
      documents: [
        { name: "liquidity_report_q2.pdf", type: "Investment Memorandum", url: "#", uploadedAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  kyc: [
    {
      id: "kyc-1",
      userId: "user-1",
      userEmail: "borrower@eloncapitalloan.com",
      userName: "Alex Thorne",
      idCardUrl: "passport_alex_thorne.png",
      selfieUrl: "selfie_alex_thorne.png",
      addressProofUrl: "utility_bill_alex.pdf",
      businessDocUrl: "apex_business_licence.pdf",
      status: "Approved",
      remarks: "Verified against US Federal records.",
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  messages: [
    {
      id: "msg-1",
      senderId: "admin-1",
      senderName: "Elon Capital Loan Compliance",
      receiverId: "user-1",
      content: "Welcome to Elon Capital Loan, Alex. Your KYC verification has been processed and approved. You are now cleared to apply for up to $150M in liquidity.",
      isRead: true,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "msg-2",
      senderId: "user-1",
      senderName: "Alex Thorne",
      receiverId: "admin-1",
      content: "Thank you for the prompt review! I've submitted a second expansion loan request for our Web3 liquidity pool. Let me know if you need further bank credentials.",
      isRead: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  tickets: [
    {
      id: "tkt-1",
      userId: "user-1",
      userName: "Alex Thorne",
      userEmail: "borrower@eloncapitalloan.com",
      subject: "Inquiry regarding Web3 project collateral options",
      category: "Funding Terms",
      status: "Open",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      replies: [
        {
          id: generateId(),
          senderRole: "user",
          senderName: "Alex Thorne",
          content: "We currently hold 80% of our treasury in USD and 20% in major crypto tokens. Can we stake tokens directly as repayment warranty?",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ],
  announcements: [
    {
      id: "ann-1",
      title: "Enhanced Verification Threshold Notice",
      content: "Please be advised that all high-capital requests exceeding $5,000,000 are subject to automated enhanced institutional review including deep treasury audit.",
      category: "Update",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ann-2",
      title: "Planned Platform Infrastructure Security Patch",
      content: "A security maintenance window is scheduled for July 18 at 02:00 UTC. System latency might rise temporarily for up to 10 minutes. No active loans will be affected.",
      category: "Maintenance",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  notifications: [
    {
      id: "not-1",
      userId: "user-1",
      title: "KYC Approved",
      content: "Congratulations! Your identity and business documents have been approved by compliance.",
      isRead: false,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "not-2",
      userId: "user-1",
      title: "First Funding Request Approved",
      content: "Your initial request for $1.25M Expansion Capital has been APPROVED. Funding contract has been sent to your registered email.",
      isRead: false,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  logs: [
    { id: generateId(), action: "System seeded successfully", details: "Initial SpaceLoan core platform loaded", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  homePageContent: DEFAULT_HOMEPAGE_CONTENT
};

// Database state accessor functions
const getDB = (): DB => {
  if (!fs.existsSync(DB_FILE)) {
    saveDB(INITIAL_DB);
    return INITIAL_DB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read database, resetting to initial', error);
    saveDB(INITIAL_DB);
    return INITIAL_DB;
  }
};

const saveDB = (db: DB) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write database file', error);
  }
};

const logAction = (action: string, details: string, user?: { id: string; email: string }, ip = "127.0.0.1") => {
  const db = getDB();
  const newLog: SystemLog = {
    id: generateId(),
    action,
    details,
    userId: user?.id,
    userEmail: user?.email,
    ipAddress: ip,
    createdAt: new Date().toISOString()
  };
  db.logs.unshift(newLog);
  // Keep logs capped at 100
  if (db.logs.length > 100) db.logs.pop();
  saveDB(db);
};

// Simple middleware to parse and verify the Bearer token
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Access denied. Token missing.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.id === token);

  if (!user) {
    res.status(401).json({ error: 'Invalid session token.' });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
    return;
  }

  req.user = user;
  next();
};

// Extend express requests
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// ---------------- API ENDPOINTS ----------------

// 1. PUBLIC LANDING PAGE & FAQ INFO
app.get('/api/homepage', (req, res) => {
  const db = getDB();
  res.json(db.homePageContent);
});

app.get('/api/announcements', (req, res) => {
  const db = getDB();
  res.json(db.announcements);
});

// 2. AUTH REGISTRATION
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, country, password, confirmPassword } = req.body;

  if (!name || !email || !phone || !country || !password) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  const db = getDB();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    res.status(400).json({ error: 'An account with this email address already exists.' });
    return;
  }

  // Create registration code (verification simulation)
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser: User = {
    id: generateId(),
    name,
    email: email.toLowerCase(),
    phone,
    country,
    isVerified: false,
    verificationCode: code,
    isSuspended: false,
    role: 'user',
    createdAt: new Date().toISOString(),
    notificationPreferences: {
      emailUpdates: true,
      applicationAlerts: true,
      securityAlerts: true
    },
    activityHistory: [
      { id: generateId(), action: "Account registration initiated", timestamp: new Date().toISOString(), ipAddress: req.ip || "127.0.0.1" }
    ]
  };

  db.users.push(newUser);
  saveDB(db);

  logAction("User Registration", `Account initiated for ${email}`, { id: newUser.id, email: newUser.email }, req.ip);

  // Return the code so the client can simulate displaying "email verification sent" and let the user enter it
  res.json({ 
    message: 'Registration successful. Verification code generated.', 
    email: newUser.email,
    verificationCode: code // This allows the front-end to display it elegantly so the developer/user is never locked out!
  });
});

// 3. AUTH EMAIL VERIFICATION
app.post('/api/auth/verify-email', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ error: 'Email and verification code are required.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (user.isVerified) {
    res.status(400).json({ error: 'Email is already verified.' });
    return;
  }

  if (user.verificationCode !== code) {
    res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
    return;
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  
  // Add first login notification
  db.notifications.push({
    id: generateId(),
    userId: user.id,
    title: "Email Verified Successfully",
    content: "Welcome to SpaceLoan. You can now proceed to upload your KYC documents to begin your first funding application.",
    isRead: false,
    createdAt: new Date().toISOString()
  });

  user.activityHistory?.unshift({
    id: generateId(),
    action: "Email verified successfully",
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);

  logAction("Email Verified", `Verified email for ${email}`, { id: user.id, email: user.email }, req.ip);

  res.json({ message: 'Email verified successfully. You can now login.', token: user.id, user });
});

// 4. AUTH LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: 'Your account has been suspended. Please contact Support.' });
    return;
  }

  // Verification check: let them complete verification if not verified
  if (!user.isVerified) {
    res.status(403).json({ 
      error: 'Please verify your email first.', 
      notVerified: true, 
      email: user.email, 
      verificationCode: user.verificationCode 
    });
    return;
  }

  // In a simulated database we allow valid login
  user.activityHistory?.unshift({
    id: generateId(),
    action: "User logged in",
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);

  logAction("User Login", `Successful login for ${email}`, { id: user.id, email: user.email }, req.ip);

  res.json({
    message: 'Login successful.',
    token: user.id, // User ID acts as our Bearer token for simulated sessions
    user
  });
});

// 5. SESSION CHECK
app.get('/api/auth/session', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// 6. FORGOT & RESET PASSWORD
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    res.json({ message: 'If the email exists, a password reset code has been sent.' });
    return;
  }

  // Generate simple 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = `RESET:${resetCode}`;
  saveDB(db);

  logAction("Password Reset Initiated", `Reset requested for ${email}`, { id: user.id, email: user.email }, req.ip);

  res.json({ 
    message: 'If the email exists, a password reset code has been sent.', 
    resetCode // Returned directly for frictionless testing and simulation!
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.verificationCode !== `RESET:${code}`) {
    res.status(400).json({ error: 'Invalid reset code or email.' });
    return;
  }

  user.verificationCode = undefined;
  
  user.activityHistory?.unshift({
    id: generateId(),
    action: "Password reset completed",
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  // Simulated password change
  saveDB(db);

  logAction("Password Reset Completed", `Successful password reset for ${email}`, { id: user.id, email: user.email }, req.ip);

  res.json({ message: 'Password has been successfully reset. You can now login.' });
});

// 7. PROFILE & PHOTO EDIT
app.post('/api/user/profile/update', authenticateToken, (req, res) => {
  const { phone, country, notificationPreferences, profilePhoto } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.id === req.user!.id);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (phone) user.phone = phone;
  if (country) user.country = country;
  if (notificationPreferences) user.notificationPreferences = notificationPreferences;
  if (profilePhoto) user.profilePhoto = profilePhoto;

  user.activityHistory?.unshift({
    id: generateId(),
    action: "Profile updated",
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  logAction("Profile Update", `Profile updated for ${user.email}`, { id: user.id, email: user.email }, req.ip);

  res.json({ message: 'Profile updated successfully.', user });
});

app.post('/api/user/profile/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new passwords are required.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  user.activityHistory?.unshift({
    id: generateId(),
    action: "Password changed in settings",
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  logAction("Password Changed", `Security credentials updated for ${user.email}`, { id: user.id, email: user.email }, req.ip);

  res.json({ message: 'Password changed successfully.' });
});

// 8. LOAN APPLICATIONS
app.post('/api/loans/apply', authenticateToken, (req, res) => {
  const { personalInfo, employmentInfo, businessInfo, fundingDetails, financialInfo, documents } = req.body;

  if (!personalInfo || !employmentInfo || !fundingDetails || !financialInfo) {
    res.status(400).json({ error: 'Incomplete application credentials provided.' });
    return;
  }

  const amount = Number(fundingDetails.requestedAmount);
  if (isNaN(amount) || amount < 1000 || amount > 500000000) {
    res.status(400).json({ error: 'Requested funding must be between $1,000 and $500,000,000.' });
    return;
  }

  const db = getDB();
  
  // Set enhanced verification if funding request exceeds $5,000,000
  const requiresEnhancedVerification = amount > 5000000;

  const newApplication: LoanApplication = {
    id: `SL-${Math.floor(100000 + Math.random() * 900000)}`,
    userId: req.user!.id,
    userEmail: req.user!.email,
    userName: req.user!.name,
    personalInfo,
    employmentInfo,
    businessInfo,
    fundingDetails: {
      ...fundingDetails,
      requestedAmount: amount
    },
    financialInfo,
    status: 'Pending',
    requiresEnhancedVerification,
    documents: documents || [],
    createdAt: new Date().toISOString()
  };

  db.loans.unshift(newApplication);

  // Add application notification
  db.notifications.push({
    id: generateId(),
    userId: req.user!.id,
    title: "Application Received",
    content: `Your application ${newApplication.id} for $${amount.toLocaleString()} is currently under compliance audit.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === req.user!.id);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Submitted funding request ${newApplication.id}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);

  logAction("Funding Application", `Application ${newApplication.id} submitted by ${req.user!.email} for $${amount}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'Application submitted successfully.', application: newApplication });
});

app.get('/api/loans/list', authenticateToken, (req, res) => {
  const db = getDB();
  const userLoans = db.loans.filter(l => l.userId === req.user!.id);
  res.json(userLoans);
});

app.post('/api/loans/pay-collateral', authenticateToken, (req, res) => {
  const { loanId, txId, paymentMethod } = req.body;
  if (!loanId || !txId) {
    res.status(400).json({ error: 'Loan ID and Transaction Reference are required.' });
    return;
  }

  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId && l.userId === req.user!.id);
  if (!loan) {
    res.status(404).json({ error: 'Loan application not found.' });
    return;
  }

  loan.collateralPaid = true;
  loan.collateralTxId = txId;
  loan.disbursed = true;
  loan.disbursedAt = new Date().toISOString();

  // Add system notifications
  db.notifications.push({
    id: generateId(),
    userId: req.user!.id,
    title: "Collateral Verified & Funding Disbursed",
    content: `Payment reference ${txId} verified. Liquidity of $${loan.fundingDetails.requestedAmount.toLocaleString()} has been dispatched to your designated terminal/wallet.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === req.user!.id);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Paid collateral and cleared disbursement for ${loan.id}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  res.json({ message: 'Collateral payment processed. Funding disbursed successfully.', loan });
});

// 9. KYC VERIFICATION ENDPOINTS
app.post('/api/kyc/upload', authenticateToken, (req, res) => {
  const { idCardUrl, selfieUrl, addressProofUrl, businessDocUrl } = req.body;

  if (!idCardUrl || !selfieUrl) {
    res.status(400).json({ error: 'Government ID and Selfie files are required for KYC submission.' });
    return;
  }

  const db = getDB();
  
  // Look for existing kyc status or create new one
  const existingKycIdx = db.kyc.findIndex(k => k.userId === req.user!.id);

  const newKyc: KYC = {
    id: existingKycIdx !== -1 ? db.kyc[existingKycIdx].id : `KYC-${generateId()}`,
    userId: req.user!.id,
    userEmail: req.user!.email,
    userName: req.user!.name,
    idCardUrl,
    selfieUrl,
    addressProofUrl,
    businessDocUrl,
    status: 'Pending',
    updatedAt: new Date().toISOString()
  };

  if (existingKycIdx !== -1) {
    db.kyc[existingKycIdx] = newKyc;
  } else {
    db.kyc.unshift(newKyc);
  }

  // Update user's notifications
  db.notifications.push({
    id: generateId(),
    userId: req.user!.id,
    title: "KYC Documents Received",
    content: "Your identity files have been securely transmitted and queued for administrative approval.",
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === req.user!.id);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: "Uploaded KYC documents for verification",
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);

  logAction("KYC Submission", `KYC documents submitted for audit by ${req.user!.email}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'KYC documents uploaded successfully and are pending review.', kyc: newKyc });
});

app.get('/api/kyc/status', authenticateToken, (req, res) => {
  const db = getDB();
  const userKyc = db.kyc.find(k => k.userId === req.user!.id);
  res.json(userKyc || { status: 'Pending_Upload' });
});

// 10. NOTIFICATIONS
app.get('/api/notifications', authenticateToken, (req, res) => {
  const db = getDB();
  const userNotifications = db.notifications.filter(n => n.userId === req.user!.id || n.userId === 'all');
  res.json(userNotifications);
});

app.post('/api/notifications/read', authenticateToken, (req, res) => {
  const { notificationId } = req.body;
  const db = getDB();

  db.notifications.forEach(n => {
    if ((n.userId === req.user!.id || n.userId === 'all') && (!notificationId || n.id === notificationId)) {
      n.isRead = true;
    }
  });

  saveDB(db);
  res.json({ message: 'Notifications marked as read.' });
});

// 11. INTERNAL MESSAGING
app.get('/api/messages', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.user!.id;
  const role = req.user!.role;

  let conversation: Message[] = [];
  if (role === 'admin') {
    // Admin request should include a target userId to read that specific conversation
    const targetUserId = req.query.userId as string;
    if (targetUserId) {
      conversation = db.messages.filter(m => 
        (m.senderId === 'admin-1' && m.receiverId === targetUserId) ||
        (m.senderId === targetUserId && m.receiverId === 'admin-1')
      );
      
      // Mark as read by admin
      db.messages.forEach(m => {
        if (m.senderId === targetUserId && m.receiverId === 'admin-1') {
          m.isRead = true;
        }
      });
      saveDB(db);
    } else {
      // Just return all messages involving admin
      conversation = db.messages;
    }
  } else {
    // User request: conversation between user and admin
    conversation = db.messages.filter(m => 
      (m.senderId === userId && m.receiverId === 'admin-1') ||
      (m.senderId === 'admin-1' && m.receiverId === userId)
    );

    // Mark as read by user
    db.messages.forEach(m => {
      if (m.senderId === 'admin-1' && m.receiverId === userId) {
        m.isRead = true;
      }
    });
    saveDB(db);
  }

  // Sort by date ascending
  conversation.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  res.json(conversation);
});

app.post('/api/messages/send', authenticateToken, (req, res) => {
  const { content, receiverId, attachment } = req.body;

  if (!content) {
    res.status(400).json({ error: 'Message content cannot be blank.' });
    return;
  }

  const db = getDB();
  const userId = req.user!.id;
  const role = req.user!.role;

  let actualReceiverId = 'admin-1';
  let senderName = req.user!.name;

  if (role === 'admin') {
    if (!receiverId) {
      res.status(400).json({ error: 'Receiver user ID is required for administrative messages.' });
      return;
    }
    actualReceiverId = receiverId;
    senderName = "SpaceLoan Compliance Team";
  }

  const newMessage: Message = {
    id: generateId(),
    senderId: role === 'admin' ? 'admin-1' : userId,
    senderName,
    receiverId: actualReceiverId,
    content,
    attachment,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  db.messages.push(newMessage);

  // Send an alert/notification if a user is receiving this message
  if (actualReceiverId !== 'admin-1') {
    db.notifications.push({
      id: generateId(),
      userId: actualReceiverId,
      title: "New Administrative Message",
      content: "You have received a new response from SpaceLoan administration. Check your Messages tab.",
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDB(db);
  res.json(newMessage);
});

app.get('/api/messages/unread', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.user!.id;
  const role = req.user!.role;

  let count = 0;
  if (role === 'admin') {
    count = db.messages.filter(m => m.receiverId === 'admin-1' && !m.isRead).length;
  } else {
    count = db.messages.filter(m => m.receiverId === userId && !m.isRead).length;
  }

  res.json({ unreadCount: count });
});

// 12. SUPPORT TICKETS
app.get('/api/support/tickets', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.user!.id;
  const role = req.user!.role;

  if (role === 'admin') {
    res.json(db.tickets);
  } else {
    const userTickets = db.tickets.filter(t => t.userId === userId);
    res.json(userTickets);
  }
});

app.post('/api/support/tickets/create', authenticateToken, (req, res) => {
  const { subject, category, message } = req.body;

  if (!subject || !category || !message) {
    res.status(400).json({ error: 'Subject, category, and initial message are required.' });
    return;
  }

  const db = getDB();
  const newTicket: SupportTicket = {
    id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userEmail: req.user!.email,
    subject,
    category,
    status: 'Open',
    createdAt: new Date().toISOString(),
    replies: [
      {
        id: generateId(),
        senderRole: 'user',
        senderName: req.user!.name,
        content: message,
        createdAt: new Date().toISOString()
      }
    ]
  };

  db.tickets.unshift(newTicket);
  saveDB(db);

  logAction("Support Ticket Created", `Ticket ${newTicket.id} opened by ${req.user!.email}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'Support ticket registered successfully.', ticket: newTicket });
});

app.post('/api/support/tickets/reply', authenticateToken, (req, res) => {
  const { ticketId, content } = req.body;

  if (!ticketId || !content) {
    res.status(400).json({ error: 'Ticket ID and response message are required.' });
    return;
  }

  const db = getDB();
  const ticket = db.tickets.find(t => t.id === ticketId);

  if (!ticket) {
    res.status(404).json({ error: 'Support ticket not found.' });
    return;
  }

  const role = req.user!.role;

  // Security check: must own ticket or be admin
  if (role !== 'admin' && ticket.userId !== req.user!.id) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  ticket.replies.push({
    id: generateId(),
    senderRole: role === 'admin' ? 'admin' : 'user',
    senderName: role === 'admin' ? 'SpaceLoan Operations' : req.user!.name,
    content,
    createdAt: new Date().toISOString()
  });

  ticket.status = role === 'admin' ? 'Waiting for User' : 'Open';
  ticket.createdAt = new Date().toISOString(); // Bump active order

  // Notify user if admin replied
  if (role === 'admin') {
    db.notifications.push({
      id: generateId(),
      userId: ticket.userId,
      title: "Support Ticket Update",
      content: `Compliance and Operations have replied to your ticket ${ticket.id}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDB(db);
  res.json({ message: 'Reply transmitted successfully.', ticket });
});


// ----------------- ADMINISTRATOR CONTROL ENDPOINTS -----------------

// Authentication Middleware for Admins
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Restricted access. Administrative clearance required.' });
    return;
  }
  next();
};

// Admin authentication with 2FA simulation
app.post('/api/admin/verify-2fa', authenticateToken, requireAdmin, (req, res) => {
  const { code } = req.body;
  if (!code || code.length !== 6) {
    res.status(400).json({ error: 'Please enter a valid 6-digit administrative verification code.' });
    return;
  }

  logAction("Admin Auth Verified", `MFA authorization clearance approved for ${req.user!.email}`, { id: req.user!.id, email: req.user!.email }, req.ip);
  res.json({ message: 'Security authentication approved. Panel unlocked.', authorized: true });
});

// Admin Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB();
  
  const totalVolumeApplied = db.loans.reduce((sum, current) => sum + current.fundingDetails.requestedAmount, 0);
  const totalVolumeApproved = db.loans
    .filter(l => l.status === 'Approved')
    .reduce((sum, current) => sum + current.fundingDetails.requestedAmount, 0);
  
  const stats = {
    totalUsers: db.users.length,
    activeUsers: db.users.filter(u => !u.isSuspended).length,
    totalApplications: db.loans.length,
    pendingApplications: db.loans.filter(l => l.status === 'Pending').length,
    approvedApplications: db.loans.filter(l => l.status === 'Approved').length,
    declinedApplications: db.loans.filter(l => l.status === 'Declined').length,
    kycPending: db.kyc.filter(k => k.status === 'Pending').length,
    totalTickets: db.tickets.length,
    openTickets: db.tickets.filter(t => t.status === 'Open').length,
    totalVolumeApplied,
    totalVolumeApproved
  };

  res.json(stats);
});

// Get all users
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB();
  const search = (req.query.search as string || '').toLowerCase();

  let filteredUsers = db.users;
  if (search) {
    filteredUsers = db.users.filter(u => 
      u.name.toLowerCase().includes(search) || 
      u.email.toLowerCase().includes(search) ||
      u.country.toLowerCase().includes(search)
    );
  }

  res.json(filteredUsers);
});

// Suspend/Unsuspend User
app.post('/api/admin/users/suspend', authenticateToken, requireAdmin, (req, res) => {
  const { userId, suspend } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (user.role === 'admin') {
    res.status(400).json({ error: 'Cannot suspend an administrative account.' });
    return;
  }

  user.isSuspended = suspend;
  saveDB(db);

  const actionText = suspend ? "User Account Suspended" : "User Account Reinstated";
  logAction(actionText, `${actionText} for ${user.email}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: `User account has been successfully ${suspend ? 'suspended' : 'reinstated'}.`, user });
});

// List all KYC applications
app.get('/api/admin/kyc', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB();
  res.json(db.kyc);
});

// Approve/Reject KYC
app.post('/api/admin/kyc/update', authenticateToken, requireAdmin, (req, res) => {
  const { kycId, status, remarks } = req.body;

  if (!kycId || !status) {
    res.status(400).json({ error: 'KYC ID and outcome status are required.' });
    return;
  }

  const db = getDB();
  const kycItem = db.kyc.find(k => k.id === kycId);

  if (!kycItem) {
    res.status(404).json({ error: 'KYC record not found.' });
    return;
  }

  kycItem.status = status;
  kycItem.remarks = remarks || '';
  kycItem.updatedAt = new Date().toISOString();

  // Send notification to user
  db.notifications.push({
    id: generateId(),
    userId: kycItem.userId,
    title: `KYC Review: ${status}`,
    content: status === 'Approved' 
      ? 'Your identity and security records have been successfully verified.' 
      : `Your KYC documents were declined. Reason: ${remarks}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === kycItem.userId);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `KYC application review: ${status}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);

  logAction("KYC Status Update", `KYC ${kycId} for ${kycItem.userEmail} set to ${status}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'KYC status successfully updated.', kyc: kycItem });
});

// List all loan applications
app.get('/api/admin/loans', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB();
  res.json(db.loans);
});

// Approve/Decline Loan Applications
app.post('/api/admin/loans/update', authenticateToken, requireAdmin, (req, res) => {
  const { loanId, status } = req.body;

  if (!loanId || !status) {
    res.status(400).json({ error: 'Loan ID and updated status are required.' });
    return;
  }

  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId);

  if (!loan) {
    res.status(404).json({ error: 'Loan application not found.' });
    return;
  }

  loan.status = status;

  // Add notification
  db.notifications.push({
    id: generateId(),
    userId: loan.userId,
    title: `Funding Request ${loan.id}: ${status}`,
    content: status === 'Approved' 
      ? `Congratulations! Your funding request for $${loan.fundingDetails.requestedAmount.toLocaleString()} has been approved.`
      : `Your application for $${loan.fundingDetails.requestedAmount.toLocaleString()} was declined after manual administrative audit.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Message simulation to initiate contract dialogue
  if (status === 'Approved') {
    db.messages.push({
      id: generateId(),
      senderId: "admin-1",
      senderName: "SpaceLoan Capital Operations",
      receiverId: loan.userId,
      content: `Your application ${loan.id} has been APPROVED for $${loan.fundingDetails.requestedAmount.toLocaleString()}. Please respond here to initiate contract signatures and wallet/escrow wiring validation.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  const user = db.users.find(u => u.id === loan.userId);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Funding request ${loan.id} status updated to ${status}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);

  logAction("Loan Status Update", `Loan ${loanId} set to ${status} for ${loan.userEmail}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: `Loan status successfully updated to ${status}.`, loan });
});

// Mark Ticket resolved
app.post('/api/admin/tickets/resolve', authenticateToken, requireAdmin, (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) {
    res.status(400).json({ error: 'Ticket ID is required.' });
    return;
  }

  const db = getDB();
  const ticket = db.tickets.find(t => t.id === ticketId);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  ticket.status = 'Resolved';
  saveDB(db);

  logAction("Ticket Resolved", `Ticket ${ticketId} resolved`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'Ticket status updated to Resolved.', ticket });
});

// Create Announcement
app.post('/api/admin/announcements/create', authenticateToken, requireAdmin, (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content || !category) {
    res.status(400).json({ error: 'Title, content, and category are required.' });
    return;
  }

  const db = getDB();
  const newAnnouncement: Announcement = {
    id: `ann-${generateId()}`,
    title,
    content,
    category,
    createdAt: new Date().toISOString()
  };

  db.announcements.unshift(newAnnouncement);
  saveDB(db);

  logAction("Announcement Created", `New announcement posted: ${title}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'Announcement published successfully.', announcement: newAnnouncement });
});

// Get Audit Logs
app.get('/api/admin/logs', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB();
  res.json(db.logs);
});

// Manage Homepage content
app.post('/api/admin/homepage/update', authenticateToken, requireAdmin, (req, res) => {
  const { heroHeadline, heroSubheadline, statTotalFunded, statActiveBorrowers, statGlobalProjects } = req.body;

  const db = getDB();
  if (heroHeadline) db.homePageContent.heroHeadline = heroHeadline;
  if (heroSubheadline) db.homePageContent.heroSubheadline = heroSubheadline;
  if (statTotalFunded) db.homePageContent.statTotalFunded = statTotalFunded;
  if (statActiveBorrowers) db.homePageContent.statActiveBorrowers = statActiveBorrowers;
  if (statGlobalProjects) db.homePageContent.statGlobalProjects = statGlobalProjects;

  saveDB(db);

  logAction("Homepage Update", `Homepage contents updated by administrator`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'Homepage elements updated successfully.', content: db.homePageContent });
});


// ----------------- VITE DEVELOPMENT & PRODUCTION INTEGRATION -----------------

const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Core] Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer().catch((err) => {
  console.error('[Core] Failed to boot SpaceLoan environment:', err);
});
