import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
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
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_FILE = process.env.DB_FILE_PATH || path.join(process.cwd(), 'database.json');

// Configure CORS for Railway deployment and cross-origin frontend support (e.g. Vercel, netlify, custom domains)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : '*';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman, or same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins === '*' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

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
      id: "admin-2",
      name: "SpaceLoan Administrator",
      email: "admin@spaceloan.space",
      phone: "+1 (800) 555-0199",
      country: "United States",
      isVerified: true,
      isSuspended: false,
      role: "admin",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      activityHistory: [
        { id: generateId(), action: "Admin system initialization", timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), ipAddress: "127.0.0.1" }
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

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBsmHhRmjT9FRytyD6GY8tm57p8X9PQ8TU",
  authDomain: "elon-capital.firebaseapp.com",
  projectId: "elon-capital",
  storageBucket: "elon-capital.firebasestorage.app",
  messagingSenderId: "363773895492",
  appId: "1:363773895492:web:e7f82be91aaa07a2276d11",
  measurementId: "G-ELN9828WNR"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

let isFirestoreSynced = false;
let dbCache: DB = INITIAL_DB;

// Synchronously load database.json on startup to guarantee instant local-cache fallback
if (fs.existsSync(DB_FILE)) {
  try {
    dbCache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    console.log('[Core] Synchronously loaded initial database from local cache file.');
  } catch (e) {
    console.error('[Core] Failed to parse local database.json file, using INITIAL_DB:', e);
    dbCache = INITIAL_DB;
  }
} else {
  dbCache = INITIAL_DB;
}

const syncFromFirestore = async () => {
  try {
    console.log('[Firestore] Synchronizing database from Cloud Firestore...');
    const usersCol = await getDocs(collection(firestore, 'users'));
    const loansCol = await getDocs(collection(firestore, 'loans'));
    const kycCol = await getDocs(collection(firestore, 'kyc'));
    const notificationsCol = await getDocs(collection(firestore, 'notifications'));
    const ticketsCol = await getDocs(collection(firestore, 'tickets'));
    const messagesCol = await getDocs(collection(firestore, 'messages'));
    const logsCol = await getDocs(collection(firestore, 'logs'));
    const announcementsCol = await getDocs(collection(firestore, 'announcements'));
    const settingsDoc = await getDoc(doc(firestore, 'settings', 'homePageContent'));

    const users = usersCol.docs.map(d => d.data() as User);
    const loans = loansCol.docs.map(d => d.data() as LoanApplication);
    const kyc = kycCol.docs.map(d => d.data() as KYC);
    const notifications = notificationsCol.docs.map(d => d.data() as Notification);
    const tickets = ticketsCol.docs.map(d => d.data() as SupportTicket);
    const messages = messagesCol.docs.map(d => d.data() as Message);
    const logs = logsCol.docs.map(d => d.data() as SystemLog);
    const announcements = announcementsCol.docs.map(d => d.data() as Announcement);
    const homePageContent = settingsDoc.exists() ? settingsDoc.data() as HomePageContent : DEFAULT_HOMEPAGE_CONTENT;

    if (users.length > 0) {
      dbCache = {
        users,
        loans,
        kyc,
        notifications,
        tickets,
        messages,
        logs,
        announcements,
        homePageContent
      };
      console.log(`[Firestore] Sync complete. Loaded ${users.length} users, ${loans.length} loans, ${kyc.length} KYC.`);
    } else {
      console.log('[Firestore] Firestore is empty. Seeding initial database...');
      dbCache = INITIAL_DB;
      await syncToFirestore(INITIAL_DB);
    }
    isFirestoreSynced = true;
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[Firestore] Failed to sync from Firestore, falling back to local file:', err);
    if (fs.existsSync(DB_FILE)) {
      try {
        dbCache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        isFirestoreSynced = true;
      } catch (e) {
        dbCache = INITIAL_DB;
      }
    } else {
      dbCache = INITIAL_DB;
    }
  }
};

const syncToFirestore = async (db: DB) => {
  try {
    for (const user of db.users) {
      await setDoc(doc(firestore, 'users', user.id), user);
    }
    for (const loan of db.loans) {
      await setDoc(doc(firestore, 'loans', loan.id), loan);
    }
    for (const kycItem of db.kyc) {
      await setDoc(doc(firestore, 'kyc', kycItem.id), kycItem);
    }
    for (const notification of db.notifications) {
      await setDoc(doc(firestore, 'notifications', notification.id), notification);
    }
    for (const ticket of db.tickets) {
      await setDoc(doc(firestore, 'tickets', ticket.id), ticket);
    }
    for (const message of db.messages) {
      await setDoc(doc(firestore, 'messages', message.id), message);
    }
    for (const log of db.logs) {
      await setDoc(doc(firestore, 'logs', log.id), log);
    }
    for (const ann of db.announcements) {
      await setDoc(doc(firestore, 'announcements', ann.id), ann);
    }
    await setDoc(doc(firestore, 'settings', 'homePageContent'), db.homePageContent);
    console.log('[Firestore] Successfully synchronized database changes to Cloud Firestore.');
  } catch (err) {
    console.error('[Firestore] Sync to Firestore failed:', err);
  }
};

// Database state accessor functions
const getDB = (): DB => {
  if (!isFirestoreSynced) {
    if (fs.existsSync(DB_FILE)) {
      try {
        dbCache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      } catch (e) {
        dbCache = INITIAL_DB;
      }
    } else {
      dbCache = INITIAL_DB;
    }
  }
  return dbCache;
};

const saveDB = (db: DB) => {
  dbCache = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    syncToFirestore(db);
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
    password,
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

// 2b. AUTH ADMIN REGISTRATION
app.post('/api/auth/register-admin', (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const db = getDB();
  const lowerEmail = email.toLowerCase();
  let user = db.users.find(u => u.email.toLowerCase() === lowerEmail);

  if (user) {
    user.role = 'admin';
    user.isVerified = true;
  } else {
    user = {
      id: generateId(),
      name: name || 'System Administrator',
      email: lowerEmail,
      phone: '+1 (800) 555-0199',
      country: 'United States',
      isVerified: true,
      isSuspended: false,
      role: 'admin',
      createdAt: new Date().toISOString(),
      activityHistory: [
        { id: generateId(), action: "Admin account registered", timestamp: new Date().toISOString(), ipAddress: req.ip || "127.0.0.1" }
      ]
    };
    db.users.push(user);
  }

  saveDB(db);
  logAction("Admin Registration", `Admin account registered for ${lowerEmail}`, { id: user.id, email: user.email }, req.ip);

  res.json({ message: 'Administrator account created successfully.', token: user.id, user });
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

// 3b. AUTH PASSWORD RESET
app.post('/api/auth/reset-password', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and new password are required.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    user.password = password;
    if (!user.activityHistory) user.activityHistory = [];
    user.activityHistory.unshift({
      id: generateId(),
      action: "Password reset completed",
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || "127.0.0.1"
    });
    saveDB(db);
    logAction("Password Reset", `Password reset for ${email}`, { id: user.id, email: user.email }, req.ip);
  }

  res.json({ message: 'Password reset successfully. You can now login with your new password.' });
});

// 4. AUTH LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const db = getDB();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Auto-provision admin user if logging in with an admin-formatted email or default admin addresses
  if (!user && (email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@spaceloan.space' || email.toLowerCase() === 'admin@eloncapitalloan.com')) {
    user = {
      id: generateId(),
      name: "System Administrator",
      email: email.toLowerCase(),
      phone: "+1 (800) 555-0199",
      country: "United States",
      isVerified: true,
      isSuspended: false,
      role: "admin",
      createdAt: new Date().toISOString(),
      activityHistory: [
        { id: generateId(), action: "Admin account auto-provisioned", timestamp: new Date().toISOString(), ipAddress: req.ip || "127.0.0.1" }
      ]
    };
    db.users.push(user);
    saveDB(db);
  }

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password. Click "Create Admin Account" to register an administrator account for this email.' });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: 'Your account has been suspended. Please contact Support.' });
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

// 4b. AUTH FIREBASE SYNC
app.post('/api/auth/firebase-sync', (req, res) => {
  const { uid, email, name, phone, country, isVerified } = req.body;

  if (!uid || !email) {
    res.status(400).json({ error: 'UID and Email are required for synchronization.' });
    return;
  }

  const db = getDB();
  
  // 1. Try to find user by id === uid
  let user = db.users.find(u => u.id === uid);
  
  if (!user) {
    // 2. Try to find user by email
    const existingByEmailIdx = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingByEmailIdx !== -1) {
      // Migrate existing user to use the Firebase uid as their local id!
      user = db.users[existingByEmailIdx];
      const oldId = user.id;
      user.id = uid;
      user.isVerified = isVerified !== undefined ? isVerified : user.isVerified;
      
      // Update references in loans, kyc, notifications, tickets, messages
      db.loans.forEach(l => { if (l.userId === oldId) l.userId = uid; });
      db.kyc.forEach(k => { if (k.userId === oldId) k.userId = uid; });
      db.notifications.forEach(n => { if (n.userId === oldId) n.userId = uid; });
      db.tickets.forEach(t => { if (t.userId === oldId) t.userId = uid; });
      db.messages.forEach(m => {
        if (m.senderId === oldId) m.senderId = uid;
        if (m.receiverId === oldId) m.receiverId = uid;
      });
      
      if (!user.activityHistory) user.activityHistory = [];
      user.activityHistory.unshift({
        id: generateId(),
        action: "Account mapped to Firebase credentials",
        timestamp: new Date().toISOString(),
        ipAddress: req.ip || "127.0.0.1"
      });
    } else {
      // 3. Create a new user record in database.json
      user = {
        id: uid,
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        phone: phone || '',
        country: country || 'United States',
        isVerified: isVerified !== undefined ? isVerified : true,
        isSuspended: false,
        role: email.toLowerCase() === 'admin@eloncapitalloan.com' ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        notificationPreferences: {
          emailUpdates: true,
          applicationAlerts: true,
          securityAlerts: true
        },
        activityHistory: [
          { id: generateId(), action: "Account created via Firebase", timestamp: new Date().toISOString(), ipAddress: req.ip || "127.0.0.1" }
        ]
      };
      db.users.push(user);
    }
  } else {
    // User already exists by UID, just make sure verification status is synced
    if (isVerified && !user.isVerified) {
      user.isVerified = true;
    }
  }

  if (user.isSuspended) {
    res.status(403).json({ error: 'Your account has been suspended. Please contact Support.' });
    return;
  }

  if (!user.activityHistory) user.activityHistory = [];
  user.activityHistory.unshift({
    id: generateId(),
    action: "User logged in (Firebase Auth)",
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);

  logAction("Firebase Sync/Login", `User ${email} synchronized via Firebase Auth`, { id: user.id, email: user.email }, req.ip);

  res.json({
    message: 'Synchronization successful.',
    token: user.id,
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

// 7. PROFILE & PHOTO EDIT & OTP SECURITY
app.post('/api/auth/send-profile-otp', authenticateToken, (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = otpCode;
  saveDB(db);

  logAction("OTP Code Sent", `Profile security OTP code sent to ${user.email}`, { id: user.id, email: user.email }, req.ip);

  res.json({ 
    message: `Security OTP verification code sent to ${user.email}.`, 
    otpCode: otpCode 
  });
});

app.post('/api/user/profile/update', authenticateToken, (req, res) => {
  const { name, email, phone, country, password, notificationPreferences, profilePhoto } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.id === req.user!.id);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (name) user.name = name;
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const existingWithEmail = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== user.id);
    if (existingWithEmail) {
      res.status(400).json({ error: 'This email address is already registered to another user.' });
      return;
    }
    user.email = email.toLowerCase();
  }
  if (phone !== undefined) user.phone = phone;
  if (country) user.country = country;
  if (password) user.password = password;
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
  const { newPassword, otpCode } = req.body;
  if (!newPassword) {
    res.status(400).json({ error: 'New password is required.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (otpCode && user.verificationCode && otpCode.trim() !== user.verificationCode.trim()) {
    res.status(400).json({ error: 'Invalid security OTP code. Please check the code sent to your email.' });
    return;
  }

  user.password = newPassword;
  user.activityHistory?.unshift({
    id: generateId(),
    action: "Security password changed",
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  logAction("Password Changed", `Security credentials updated for ${user.email}`, { id: user.id, email: user.email }, req.ip);

  res.json({ message: 'Password changed successfully in real time.', user });
});

app.post('/api/user/profile/update-email', authenticateToken, (req, res) => {
  const { newEmail, otpCode } = req.body;
  if (!newEmail) {
    res.status(400).json({ error: 'New email address is required.' });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (otpCode && user.verificationCode && otpCode.trim() !== user.verificationCode.trim()) {
    res.status(400).json({ error: 'Invalid security OTP code. Please check the code sent to your email.' });
    return;
  }

  const existingWithEmail = db.users.find(u => u.email.toLowerCase() === newEmail.trim().toLowerCase() && u.id !== user.id);
  if (existingWithEmail) {
    res.status(400).json({ error: 'This email address is already registered to another user.' });
    return;
  }

  const oldEmail = user.email;
  user.email = newEmail.trim().toLowerCase();
  
  // Keep KYC and Loan applications synced with user email
  db.kyc.forEach(k => {
    if (k.userId === user.id || (k.userEmail && k.userEmail.toLowerCase() === oldEmail.toLowerCase())) {
      k.userEmail = user.email;
      k.email = user.email;
    }
  });

  db.loans.forEach(l => {
    if (l.userId === user.id || (l.userEmail && l.userEmail.toLowerCase() === oldEmail.toLowerCase())) {
      l.userEmail = user.email;
    }
  });

  user.activityHistory?.unshift({
    id: generateId(),
    action: `Email reset from ${oldEmail} to ${user.email}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  logAction("Email Reset", `Email updated for user ${user.id} to ${user.email}`, { id: user.id, email: user.email }, req.ip);

  res.json({ message: 'Email address successfully updated in real time.', user });
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

  // Enforce "one active loan application" rule
  const existingActiveLoan = db.loans.find(l => 
    l.userId === req.user!.id && 
    !['Declined', 'Rejected', 'Closed', 'Repaid', 'Settled', 'Disbursed', 'Completed'].includes(l.status) &&
    !l.disbursed
  );

  if (existingActiveLoan) {
    return res.status(400).json({ 
      error: `You already have an active loan application (${existingActiveLoan.id} - ${existingActiveLoan.status}). Please wait until your current application is completed, rejected, or fully settled before submitting a new application.` 
    });
  }

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
  const { loanId, txId, paymentMethod, installmentNumber, payFull } = req.body;
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

  if (loan.status !== 'Approved') {
    res.status(400).json({ error: 'Loan application must be Approved before submitting settlement payment.' });
    return;
  }

  const instNum = Number(installmentNumber) || 1;
  const requestedAmt = loan.fundingDetails.requestedAmount;
  const collateralAmt = Math.round(requestedAmt * 0.25);
  const companyFeeAmt = Math.round(requestedAmt * 0.035);
  const totalSettlement = collateralAmt + companyFeeAmt; // 28.5% combined total (25% collateral + 3.5% fee)

  if (payFull) {
    loan.isInstallmentPlan = false;
    loan.installments = [
      { number: 1, amount: totalSettlement, status: 'Under Review', txId, paymentMethod: paymentMethod || 'Crypto', submittedAt: new Date().toISOString() }
    ];
  } else {
    if (!loan.installments || loan.installments.length === 0) {
      // Split into 4 equal installments of combined settlement (25% collateral + 3.5% company fee)
      loan.isInstallmentPlan = true;
      const amountPerInst = Math.round(totalSettlement / 4);
      loan.installments = [
        { number: 1, amount: amountPerInst, status: 'Pending' },
        { number: 2, amount: amountPerInst, status: 'Pending' },
        { number: 3, amount: amountPerInst, status: 'Pending' },
        { number: 4, amount: totalSettlement - (amountPerInst * 3), status: 'Pending' }
      ];
    }

    const inst = loan.installments.find(i => i.number === instNum) || loan.installments[0];
    
    // Ensure sequential unlock order
    if (instNum > 1) {
      const prevInst = loan.installments.find(i => i.number === instNum - 1);
      if (prevInst && prevInst.status !== 'Approved') {
        res.status(400).json({ error: `Installment ${instNum - 1} must be verified and confirmed by Admin before Installment ${instNum} can be paid.` });
        return;
      }
    }

    inst.status = 'Under Review';
    inst.txId = txId;
    inst.paymentMethod = paymentMethod || 'Crypto';
    inst.submittedAt = new Date().toISOString();
  }

  loan.collateralTxId = txId;
  loan.collateralPaymentStatus = 'Under Review';

  db.notifications.push({
    id: generateId(),
    userId: req.user!.id,
    title: payFull ? "Full Settlement Payment Submitted" : `Installment ${instNum} Payment Submitted`,
    content: `Your payment reference ${txId} for ${payFull ? 'Full Settlement' : `Installment ${instNum}`} ($${payFull ? totalSettlement.toLocaleString() : loan.installments?.find(i => i.number === instNum)?.amount.toLocaleString()}) has been submitted. Please wait for Admin verification.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === req.user!.id);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Submitted settlement payment proof ${txId} for ${payFull ? 'Full Collateral' : `Installment ${instNum}`} on loan ${loan.id}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);

  res.json({
    message: 'The Elon Capital loan team will review your payment and get back to you within 24 hours.',
    loan
  });
});

// Admin disburse endpoint
app.post('/api/admin/loans/disburse', authenticateToken, requireAdmin, (req, res) => {
  const { loanId } = req.body;
  if (!loanId) {
    res.status(400).json({ error: 'Loan ID is required.' });
    return;
  }

  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId);
  if (!loan) {
    res.status(404).json({ error: 'Loan application not found.' });
    return;
  }

  loan.disbursed = true;
  loan.disbursedAt = new Date().toISOString();

  db.notifications.push({
    id: generateId(),
    userId: loan.userId,
    title: "Loan Disbursed Successfully",
    content: `Great news! The capital of $${loan.fundingDetails.requestedAmount.toLocaleString()} has been sent to your wallet/escrow address. Status updated to Loan Disbursed.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === loan.userId);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Loan ${loan.id} marked as disbursed by Admin`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  res.json({ message: 'Loan marked as disbursed successfully.', loan });
});

// 9. KYC VERIFICATION ENDPOINTS
app.post('/api/kyc/upload', authenticateToken, (req, res) => {
  const { 
    idCardUrl, 
    selfieUrl, 
    addressProofUrl, 
    businessDocUrl,
    fullName,
    dob,
    phone,
    email,
    country,
    residentialAddress,
    proofOfAddressUrl,
    employmentStatus,
    maritalStatus,
    loanPurpose,
    loanDescription,
    socialHandles,
    idType,
    videoUrl,
    requestedAmount,
    loanDuration
  } = req.body;

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
    userName: fullName || req.user!.name,
    idCardUrl,
    selfieUrl,
    addressProofUrl: addressProofUrl || proofOfAddressUrl || '',
    businessDocUrl: businessDocUrl || '',
    status: 'Pending',
    updatedAt: new Date().toISOString(),
    
    // REDESIGNED KYC FIELDS
    fullName: fullName || req.user!.name,
    dob: dob || '',
    phone: phone || req.user!.phone || '',
    email: email || req.user!.email || '',
    country: country || req.user!.country || 'United States',
    residentialAddress: residentialAddress || '',
    proofOfAddressUrl: proofOfAddressUrl || addressProofUrl || '',
    employmentStatus: employmentStatus || 'Employed',
    maritalStatus: maritalStatus || 'Single',
    loanPurpose: loanPurpose || 'Business Expansion',
    loanDescription: loanDescription || '',
    socialHandles: socialHandles || '',
    idType: idType || 'Passport',
    videoUrl: videoUrl || '',
    requestedAmount: Number(requestedAmount) || undefined,
    loanDuration: Number(loanDuration) || undefined
  };

  if (existingKycIdx !== -1) {
    db.kyc[existingKycIdx] = newKyc;
  } else {
    db.kyc.unshift(newKyc);
  }

  // Only auto-submit a corresponding LoanApplication if createLoan is explicitly true
  const reqAmount = Number(requestedAmount);
  if (req.body.createLoan === true && reqAmount && reqAmount >= 1000) {
    // Check if there is already a pending loan for this user
    const existingPendingLoan = db.loans.find(l => l.userId === req.user!.id && l.status === 'Pending');
    if (!existingPendingLoan) {
      const newLoan: LoanApplication = {
        id: `SL-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: req.user!.id,
        userEmail: req.user!.email,
        userName: fullName || req.user!.name,
        personalInfo: {
          dateOfBirth: dob || '',
          maritalStatus: maritalStatus || 'Single',
          address: residentialAddress || ''
        },
        employmentInfo: {
          status: employmentStatus || 'Employed',
          monthlyIncome: 5000,
          yearsEmployed: 2
        },
        fundingDetails: {
          purpose: loanPurpose || 'Personal / Business Expansion',
          requestedAmount: reqAmount,
          repaymentPreference: `Monthly structured / ${loanDuration || 24} months`,
          description: loanDescription || ''
        },
        financialInfo: {
          existingDebts: 0,
          creditScore: 750,
          assetsValue: 0
        },
        status: 'Pending',
        requiresEnhancedVerification: reqAmount > 5000000,
        documents: [
          { name: 'id_card', type: idType || 'ID Card', url: idCardUrl, uploadedAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      };
      db.loans.unshift(newLoan);
    } else {
      // Update existing pending loan
      existingPendingLoan.userName = fullName || req.user!.name;
      existingPendingLoan.personalInfo = {
        dateOfBirth: dob || '',
        maritalStatus: maritalStatus || 'Single',
        address: residentialAddress || ''
      };
      existingPendingLoan.fundingDetails = {
        purpose: loanPurpose || 'Personal / Business Expansion',
        requestedAmount: reqAmount,
        repaymentPreference: `Monthly structured / ${loanDuration || 24} months`,
        description: loanDescription || ''
      };
    }
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
  if (user) {
    if (!user.activityHistory) user.activityHistory = [];
    user.activityHistory.unshift({
      id: generateId(),
      action: "Uploaded KYC documents for verification",
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || "127.0.0.1"
    });
  }

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

const handleSendMessage = (req: express.Request, res: express.Response) => {
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
    senderName = "Elon Capital Loan Team";
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
      content: "You have received a new response from Elon Capital Loan Team. Check your Messages tab.",
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDB(db);
  res.json(newMessage);
};

app.post('/api/messages/send', authenticateToken, handleSendMessage);
app.post('/api/messages', authenticateToken, handleSendMessage);

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
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Restricted access. Administrative clearance required.' });
    return;
  }
  next();
}

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
  const { loanId, status, rejectionReason } = req.body;

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
  if (status === 'Declined' || status === 'Rejected') {
    loan.rejectionReason = rejectionReason || 'Application did not meet institutional risk standards.';
    loan.collateralPaid = false;
    loan.collateralPaymentStatus = 'None';
    loan.disbursed = false;
    delete loan.installments;
  } else if (status === 'Approved') {
    delete loan.rejectionReason;
    const totalCollateral = Math.round(loan.fundingDetails.requestedAmount * 0.25);
    if (totalCollateral >= 100000 || loan.fundingDetails.requestedAmount >= 400000) {
      loan.isInstallmentPlan = true;
      const amountPerInst = Math.round(totalCollateral / 3);
      loan.installments = [
        { number: 1, amount: amountPerInst, status: 'Pending' },
        { number: 2, amount: amountPerInst, status: 'Pending' },
        { number: 3, amount: totalCollateral - (amountPerInst * 2), status: 'Pending' }
      ];
    } else {
      loan.isInstallmentPlan = false;
      loan.installments = [
        { number: 1, amount: totalCollateral, status: 'Pending' }
      ];
    }
    loan.collateralPaymentStatus = 'Pending';
    loan.collateralPaid = false;
  }

  // Add notification
  db.notifications.push({
    id: generateId(),
    userId: loan.userId,
    title: `Funding Request ${loan.id}: ${status}`,
    content: status === 'Approved' 
      ? `Congratulations! Your funding request for $${loan.fundingDetails.requestedAmount.toLocaleString()} has been approved.`
      : `Your application for $${loan.fundingDetails.requestedAmount.toLocaleString()} was rejected: ${loan.rejectionReason}`,
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
      content: `Your application ${loan.id} has been APPROVED for $${loan.fundingDetails.requestedAmount.toLocaleString()}. Please proceed to the Settlement page to complete your request.`,
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

// Admin confirm collateral payment endpoint
app.post('/api/admin/loans/confirm-payment', authenticateToken, requireAdmin, (req, res) => {
  const { loanId, installmentNumber } = req.body;
  if (!loanId) {
    res.status(400).json({ error: 'Loan ID is required.' });
    return;
  }

  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId);
  if (!loan) {
    res.status(404).json({ error: 'Loan application not found.' });
    return;
  }

  if (loan.installments && loan.installments.length > 0) {
    const instNum = Number(installmentNumber) || loan.installments.find(i => i.status === 'Submitted' || i.status === 'Under Review')?.number || 1;
    const inst = loan.installments.find(i => i.number === instNum);
    if (inst) {
      inst.status = 'Approved';
      inst.reviewedAt = new Date().toISOString();
    }

    const allApproved = loan.installments.every(i => i.status === 'Approved');
    if (allApproved) {
      loan.collateralPaid = true;
      loan.collateralPaymentStatus = 'Confirmed';
    } else {
      loan.collateralPaid = false;
      loan.collateralPaymentStatus = 'Under Review';
    }
  } else {
    loan.collateralPaid = true;
    loan.collateralPaymentStatus = 'Confirmed';
  }

  db.notifications.push({
    id: generateId(),
    userId: loan.userId,
    title: loan.collateralPaid ? "Collateral Payment Confirmed" : "Installment Approved",
    content: loan.collateralPaid
      ? `Your settlement payment for Loan ${loan.id} has been verified and confirmed. Status: Loan Ready for Disbursement.`
      : `Payment for installment on Loan ${loan.id} has been verified. Next installment is now unlocked.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  saveDB(db);
  logAction("Payment Confirmed", `Collateral payment confirmed for loan ${loanId}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: loan.collateralPaid ? 'Payment confirmed successfully. Status: Loan Ready for Disbursement.' : 'Installment payment confirmed.', loan });
});

// Admin cancel/reject settlement payment endpoint
app.post('/api/admin/loans/cancel-payment', authenticateToken, requireAdmin, (req, res) => {
  const { loanId, installmentNumber, reason } = req.body;
  if (!loanId) {
    res.status(400).json({ error: 'Loan ID is required.' });
    return;
  }

  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId);
  if (!loan) {
    res.status(404).json({ error: 'Loan application not found.' });
    return;
  }

  const cancelReason = reason || 'Payment proof verification failed or funds not received.';

  if (loan.installments && loan.installments.length > 0) {
    const instNum = Number(installmentNumber) || loan.installments.find(i => i.status === 'Submitted' || i.status === 'Under Review')?.number || 1;
    const inst = loan.installments.find(i => i.number === instNum);
    if (inst) {
      inst.status = 'Rejected';
      inst.rejectionReason = cancelReason;
      inst.reviewedAt = new Date().toISOString();
    }
    loan.collateralPaymentStatus = 'Rejected';
    loan.rejectionReason = cancelReason;
  } else {
    loan.collateralPaymentStatus = 'Rejected';
    loan.rejectionReason = cancelReason;
  }

  db.notifications.push({
    id: generateId(),
    userId: loan.userId,
    title: "Settlement Payment Submission Cancelled",
    content: `The Elon Capital loan team cancelled/rejected your payment submission for Loan ${loan.id}. Reason: ${cancelReason}. You can now re-submit your payment proof on the settlement page.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === loan.userId);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Settlement payment submission for loan ${loan.id} was cancelled by Admin. Reason: ${cancelReason}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  logAction("Payment Cancelled", `Payment cancelled for loan ${loanId}. Reason: ${cancelReason}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'Payment submission cancelled/rejected successfully.', loan });
});

// User withdraw loan capital endpoint
app.post('/api/loans/withdraw', authenticateToken, (req, res) => {
  const { loanId, withdrawType, withdrawDetails } = req.body;
  if (!loanId) {
    res.status(400).json({ error: 'Loan ID is required.' });
    return;
  }

  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId && l.userId === req.user!.id);
  if (!loan) {
    res.status(404).json({ error: 'Loan application not found.' });
    return;
  }

  if (loan.withdrawn) {
    res.status(400).json({ error: 'You do not have any available balance to withdraw. Apply for more loan to see balance to withdraw.' });
    return;
  }

  loan.withdrawn = true;
  loan.withdrawnAt = new Date().toISOString();
  loan.withdrawalDetails = {
    type: withdrawType || 'crypto',
    details: withdrawDetails || {},
    timestamp: new Date().toISOString()
  };

  db.notifications.push({
    id: generateId(),
    userId: req.user!.id,
    title: "Loan Capital Withdrawn",
    content: `Withdrawal request for $${loan.fundingDetails.requestedAmount.toLocaleString()} USD has been submitted and debited from your Vault balance.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === req.user!.id);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Submitted withdrawal request for $${loan.fundingDetails.requestedAmount.toLocaleString()} USD on loan ${loan.id}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  logAction("Loan Withdrawn", `User ${req.user!.email} withdrew $${loan.fundingDetails.requestedAmount} for loan ${loan.id}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'Withdrawal request submitted successfully & loan balance debited.', loan });
});

// User submit loan repayment
app.post('/api/loans/repay', authenticateToken, (req, res) => {
  const { loanId, txId } = req.body;
  if (!loanId || !txId) {
    res.status(400).json({ error: 'Loan ID and Transaction Reference/Memo are required.' });
    return;
  }

  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId && l.userId === req.user!.id);
  if (!loan) {
    res.status(404).json({ error: 'Loan application not found.' });
    return;
  }

  loan.repaymentTxId = txId;
  loan.repaymentStatus = 'Under Review';

  db.notifications.push({
    id: generateId(),
    userId: req.user!.id,
    title: "Loan Repayment Submitted",
    content: `Your loan repayment reference ${txId} for loan ${loan.id} ($${loan.fundingDetails.requestedAmount.toLocaleString()} USD) has been submitted. The Elon Capital loan team will confirm your payment within 24 hours.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === req.user!.id);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Submitted loan repayment proof ${txId} for loan ${loan.id}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  res.json({
    message: 'The Elon Capital loan team will review your repayment and get back to you within 24 hours.',
    loan
  });
});

// Admin confirm loan repayment
app.post('/api/admin/loans/confirm-repayment', authenticateToken, requireAdmin, (req, res) => {
  const { loanId } = req.body;
  if (!loanId) {
    res.status(400).json({ error: 'Loan ID is required.' });
    return;
  }

  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId);
  if (!loan) {
    res.status(404).json({ error: 'Loan application not found.' });
    return;
  }

  loan.repaid = true;
  loan.repaidAt = new Date().toISOString();
  loan.repaymentStatus = 'Confirmed';

  db.notifications.push({
    id: generateId(),
    userId: loan.userId,
    title: "Loan Repayment Confirmed",
    content: `Your loan repayment for Loan #${loan.id} ($${loan.fundingDetails.requestedAmount.toLocaleString()} USD) has been verified and fully confirmed. You are now eligible to apply for new loan facilities!`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === loan.userId);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Loan ${loan.id} marked as fully repaid by Admin`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  res.json({ message: 'Loan repayment confirmed successfully.', loan });
});

// Admin disburse loan endpoint
app.post('/api/admin/loans/disburse', authenticateToken, requireAdmin, (req, res) => {
  const { loanId } = req.body;
  if (!loanId) {
    res.status(400).json({ error: 'Loan ID is required.' });
    return;
  }

  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId);
  if (!loan) {
    res.status(404).json({ error: 'Loan application not found.' });
    return;
  }

  if (!loan.collateralPaid && loan.collateralPaymentStatus !== 'Confirmed') {
    return res.status(400).json({ error: 'Settlement payment must be fully confirmed by Admin before disbursement.' });
  }

  loan.disbursed = true;
  loan.disbursedAt = new Date().toISOString();

  db.notifications.push({
    id: generateId(),
    userId: loan.userId,
    title: "Loan Disbursed Successfully",
    content: `Great news! The capital of $${loan.fundingDetails.requestedAmount.toLocaleString()} has been sent to your wallet/escrow address. Status updated to Loan Disbursed.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const user = db.users.find(u => u.id === loan.userId);
  user?.activityHistory?.unshift({
    id: generateId(),
    action: `Loan ${loan.id} marked as disbursed by Admin`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1"
  });

  saveDB(db);
  logAction("Loan Disbursed", `Loan ${loanId} disbursed to user ${loan.userId}`, { id: req.user!.id, email: req.user!.email }, req.ip);

  res.json({ message: 'Loan funds successfully disbursed.', loan });
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
  // Sync core databases with Cloud Firestore in the background on startup (non-blocking to ensure instant boot)
  syncFromFirestore().catch((err) => {
    console.error('[Core] Initial background Firestore sync failed:', err);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    // Serve static assets from public folder to guarantee image loading on local development
    app.use(express.static(path.join(process.cwd(), 'public')));
    
    // Custom index.html handler to apply Vite HTML transforms (injects React Refresh, HMR, etc.)
    app.get('*', async (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.includes('.')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const htmlPath = path.join(process.cwd(), 'index.html');
        let template = fs.readFileSync(htmlPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve static assets from all possible folders to guarantee image loading on all deployment environments (e.g. Vercel, Vessel, etc.)
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use(express.static(process.cwd()));
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
