import React from 'react';
import { MessageSquare, X, Send, User, ArrowRight, ShieldAlert, Sparkles, Maximize2, Minimize2, AlertCircle, RefreshCw } from 'lucide-react';
import { User as UserType } from '../types';
import { getApiUrl } from '../utils/api';
import logoImg from '../assets/images/elon_capital_logo_1785585548636.jpg';

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'rep';
  senderName?: string;
  text: string;
  timestamp: Date;
  showAuthButtons?: boolean;
}

interface ChatbotProps {
  user: UserType | null;
  token: string | null;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

const FAQ_DATABASE = [
  {
    keywords: ['owner', 'own', 'who owns', 'elon', 'musk', 'founder'],
    answer: "Elon Capital Loan is a premier visionary venture owned, founded, and backed by Elon Musk. It operates in close alignment with SpaceX, Tesla, and Neuralink to provide high-velocity liquidity to global builders, aerospace developers, Web3/Forex traders, and ambitious small businesses."
  },
  {
    keywords: ['how much can i borrow', 'borrow limit', 'maximum borrow', 'maximum amount', 'loan size', 'minimum borrow', 'how much to borrow', 'capital pool', 'how much money can i borrow'],
    answer: "Qualified borrowers can secure funding allocations starting from a minimum of $1,000 up to a maximum capital pool of $500,000,000 (500 Million USD). Underwriting is based on project viability, enterprise scale, trading history, and portfolio strength."
  },
  {
    keywords: ['charter', 'charter fee', 'refundable charter fee', 'collateral', 'collateral fee', 'refundable collateral fee', 'curator', 'curator fee', 'refundable curator fee', 'security deposit', 'refundable', '25%'],
    answer: "The refundable collateral fee (also referenced on our platform as the refundable charter or curator fee) is fixed at exactly 25% of any amount you are borrowing. This security deposit is held safely in escrow by Elon Capital Loan for the entire duration of your loan and is 100% fully refundable back to you upon loan maturity and complete repayment. You can review full comprehensive details, terms, and guidelines directly under the 'Loan Terms and Transparency' section of our platform."
  },
  {
    keywords: ['company setup fee', 'setup fee', 'company fee', 'admin fee', 'processing fee', '3.5%', '3.25%'],
    answer: "The company setup fee is fixed at 3.5% of any amount you are borrowing. This organizational processing fee covers administrative onboarding, sovereign legal compliance auditing, institutional credit allocation setup, and smart ledger integration. Full information and documentation explaining everything in detail can be accessed directly under the 'Loan Terms and Transparency' section on our platform."
  },
  {
    keywords: ['interest', 'interest rate', 'interest rates', 'rates', 'percentage', '15%', '20%'],
    answer: "Our interest rate schedule is fully detailed under the 'Loan Terms and Transparency' section and is structured as follows:\n- For loan terms from 1 month up to 12 months: A flat 15% interest rate applies to the total principal borrowed.\n- For loan terms from 13 months up to 60 months (up to 5 years): A 20% interest rate applies.\nYou can calculate your exact monthly repayment and total interest directly using our interactive Loan Calculator or by reviewing 'Loan Terms and Transparency'."
  },
  {
    keywords: ['how does it work', 'process', 'steps', 'workflow'],
    answer: "Our funding process consists of 6 simple steps:\n1. Create Your Account\n2. Complete Identity Verification\n3. Submit Your Funding Request\n4. Application Undergoes Professional Review\n5. Receive Funding Decision\n6. Receive Your Funds directly into your verified account."
  },
  {
    keywords: ['not pay', 'does not pay', 'doesnt pay', 'dont pay', "don't pay", 'refuse to pay', 'fail to pay', 'run away', 'scam', 'default', 'warning', 'prosecute', 'jail', 'steal', 'government', 'arrest', 'legal', 'consequence', 'consequences'],
    answer: "⚠️ EXTREMELY IMPORTANT GLOBAL GOVERNMENT WARNING: Full legal consequences and compliance details are established under the 'Loan Terms and Transparency' section. Elon Capital Loan operates in absolute direct coordination with global law enforcement agencies, international tribunals, Interpol, federal recovery courts, and national tax authorities (IRS, HMRC, ATO, etc.). Any attempt to borrow and default or evade repayment is treated as a severe high-tier financial felony. We offer a maximum 1-month (30-day) grace window. If payment is not settled within 30 days past the due date, we initiate immediate sovereign asset seizure (covering all linked bank accounts, physical properties, corporate entities, and cold-storage cryptocurrency wallets) followed by criminal prosecution and mandatory prison sentences. We enforce 100% asset recovery globally."
  }
];

export default function Chatbot({ user, token, onOpenAuth }: ChatbotProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [hasUnreadReply, setHasUnreadReply] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! Welcome to Elon Capital B.O.T. — your official AI liquidity assistant. How can I assist you with your funding application, refundable charter fee, company setup fee, interest rates, or ownership details today?\n\nIf you need custom underwriting, click 'Connect to Live Representative' below to speak directly with an operations officer.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [activeTicketId, setActiveTicketId] = React.useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Reset unread reply badge when chatbot is opened
  React.useEffect(() => {
    if (isOpen) {
      setHasUnreadReply(false);
    }
  }, [isOpen]);

  // Auto-load user's existing ticket history on login / mount
  React.useEffect(() => {
    if (!token || !user) return;

    const loadUserTickets = async () => {
      try {
        const res = await fetch(getApiUrl('/api/support/tickets'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const ticketsList: any[] = await res.json();
          if (ticketsList && ticketsList.length > 0) {
            const latestTicket = ticketsList[0];
            setActiveTicketId(latestTicket.id);
            setIsLiveMode(true);

            if (latestTicket.replies && latestTicket.replies.length > 0) {
              const mappedMessages: Message[] = latestTicket.replies.map((reply: any) => ({
                id: reply.id,
                sender: reply.senderRole === 'admin' ? 'rep' : 'user',
                senderName: reply.senderName || (reply.senderRole === 'admin' ? 'Sarah (Operations Desk)' : user.name),
                text: reply.content,
                timestamp: new Date(reply.createdAt)
              }));

              const hasAdminReply = latestTicket.replies.some((r: any) => r.senderRole === 'admin');
              if (hasAdminReply) {
                setHasUnreadReply(true);
              }

              setMessages(prev => {
                const welcome = prev.filter(m => m.id === 'welcome');
                return [...welcome, ...mappedMessages];
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to auto-load user ticket history', err);
      }
    };

    loadUserTickets();
  }, [user?.id, token]);

  // Sync direct messages and ticket replies if in Live Representative Mode
  React.useEffect(() => {
    if (!isLiveMode || !token) return;

    const interval = setInterval(async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch direct messages from Admin Message Desk
        const resMsg = await fetch(getApiUrl('/api/messages'), { headers });
        if (resMsg.ok) {
          const directMsgs: any[] = await resMsg.json();
          if (directMsgs && directMsgs.length > 0) {
            const mappedDirectMsgs: Message[] = directMsgs.map((m: any) => ({
              id: m.id,
              sender: m.senderRole === 'admin' || m.senderId === 'admin-1' ? 'rep' : 'user',
              senderName: m.senderRole === 'admin' || m.senderId === 'admin-1' ? 'Elon Capital Loan Team' : (user?.name || 'You'),
              text: m.content,
              timestamp: new Date(m.createdAt)
            }));

            setMessages(prev => {
              const prevRepCount = prev.filter(m => m.sender === 'rep').length;
              const newRepCount = mappedDirectMsgs.filter(m => m.sender === 'rep').length;
              if (newRepCount > prevRepCount) {
                setHasUnreadReply(true);
              }
              const welcome = prev.filter(m => m.id === 'welcome');
              return [...welcome, ...mappedDirectMsgs];
            });
            return;
          }
        }

        if (activeTicketId) {
          const res = await fetch(getApiUrl('/api/support/tickets'), { headers });
          if (res.ok) {
            const ticketsList = await res.json();
            const targetTicket = ticketsList.find((t: any) => t.id === activeTicketId);
            if (targetTicket && targetTicket.replies) {
              const mappedMessages: Message[] = targetTicket.replies.map((reply: any) => ({
                id: reply.id,
                sender: reply.senderRole === 'admin' ? 'rep' : 'user',
                senderName: reply.senderName || (reply.senderRole === 'admin' ? 'Elon Capital Loan Team' : 'You'),
                text: reply.content,
                timestamp: new Date(reply.createdAt)
              }));
              
              setMessages(prev => {
                const prevRepMsgsCount = prev.filter(m => m.sender === 'rep').length;
                const newRepMsgsCount = mappedMessages.filter(m => m.sender === 'rep').length;
                if (newRepMsgsCount > prevRepMsgsCount) {
                  setHasUnreadReply(true);
                }

                const welcome = prev.filter(m => m.id === 'welcome');
                return [...welcome, ...mappedMessages];
              });
            }
          }
        }
      } catch (err) {
        console.error('Error polling live messages', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveMode, activeTicketId, token, user?.name]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderName: user?.name || 'You',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    if (isLiveMode && token) {
      try {
        if (activeTicketId) {
          await fetch(getApiUrl('/api/support/tickets/reply'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ticketId: activeTicketId,
              content: textToSend
            })
          });
        }
        await fetch(getApiUrl('/api/messages/send'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: textToSend
          })
        });
      } catch (err) {
        console.error('Failed to send live reply', err);
      }
    } else {
      setIsTyping(true);
      setTimeout(() => {
        let responseText = "Thank you for reaching out! I am analyzing your request. For full terms, please consult our 'Loan Terms and Transparency' page, or click 'Connect to Live Representative' above.";
        
        const normalizedInput = textToSend.toLowerCase();
        
        let matched: typeof FAQ_DATABASE[0] | null = null;
        let maxKeywordLen = 0;

        for (const item of FAQ_DATABASE) {
          for (const keyword of item.keywords) {
            const kw = keyword.toLowerCase();
            if (normalizedInput.includes(kw)) {
              if (kw.length > maxKeywordLen) {
                maxKeywordLen = kw.length;
                matched = item;
              }
            }
          }
        }

        if (matched) {
          responseText = matched.answer;
        } else if (normalizedInput.includes('hello') || normalizedInput.includes('hi') || normalizedInput.includes('hey')) {
          responseText = "Hello! I am the Elon Capital B.O.T. intelligence assistant. Ask me anything about our ownership, maximum borrow limits, refundable charter fee, company setup fee, interest rates, or default warnings!";
        }

        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: responseText,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 600);
    }
  };

  const handleConnectToRepresentative = async () => {
    if (!token || !user) {
      const authMsg: Message = {
        id: `auth-req-${Date.now()}`,
        sender: 'bot',
        text: "🔒 ACCESS RESTRICTED: Live underwriting officers require an established borrower security token.\n\nPlease Register or Login using the buttons below to initiate live communications immediately.",
        timestamp: new Date(),
        showAuthButtons: true
      };
      setMessages(prev => [...prev, authMsg]);
      return;
    }

    setIsConnecting(true);

    try {
      const res = await fetch(getApiUrl('/api/support/tickets/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: `Elon Capital B.O.T. Live Chat Session`,
          category: 'General',
          message: `Hello, I would like to connect with a high-clearance underwriting representative about my capital requirements.`
        })
      });

      if (!res.ok) throw new Error('Could not create ticket session');

      const data = await res.json();
      const ticketId = data.ticket.id;

      setActiveTicketId(ticketId);
      setIsLiveMode(true);

      setTimeout(() => {
        const joinMsg: Message = {
          id: `rep-join-${Date.now()}`,
          sender: 'rep',
          senderName: "Sarah (Operations Desk)",
          text: `👋 CONNECTION SECURED!\nLive session code: ${ticketId}.\n\nHello ${user.name}, I am Sarah, your high-clearance underwriting officer. I have received your request on my dashboard. Let's discuss your capital needs. How can I help you?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, joinMsg]);
        setIsConnecting(false);
      }, 1500);

    } catch (err) {
      console.error('Failed to instantiate rep chat', err);
      setIsConnecting(false);
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "⚠️ Connection timeout. The desk is currently handling high volume. Please try again or submit an administrative support request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const quickQuestions = [
    { label: "Who owns this platform?", query: "Who owns this platform?" },
    { label: "How much can I borrow?", query: "How much can I borrow?" },
    { label: "How much is the refundable collateral fee?", query: "How much is the refundable collateral fee?" },
    { label: "How much is the company setup fee?", query: "How much is the company setup fee?" },
    { label: "What are the interest rates?", query: "What are the interest rates?" },
    { label: "What if someone does not pay?", query: "What happens if someone tries to borrow and not pay?" }
  ];

  return (
    <div 
      className={`fixed z-50 font-sans select-none transition-all duration-300 ${
        isExpanded && isOpen
          ? 'inset-0 w-screen h-screen bottom-0 right-0 p-0 m-0'
          : 'bottom-6 right-6'
      }`} 
      id="global-chatbot-root"
    >
      {/* Elon Capital Floating 3D Logo Button */}
      {!isOpen && (
        <div className="flex items-center gap-3">
          {/* Permanent Floating Title Badge for High Visibility */}
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-zinc-950/95 hover:bg-black text-white border-2 border-cyan-400 px-4 py-3 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.6)] backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer group relative"
          >
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400"></span>
            </span>
            <div className="text-left">
              <span className="block text-xs font-black uppercase tracking-wider text-cyan-400 font-display">
                Elon Capital B.O.T.
              </span>
              <span className="block text-[10px] text-gray-200 font-mono font-bold">
                {hasUnreadReply ? '🔴 1 NEW REPLY FROM UNDERWRITING' : 'Online AI Liquidity Desk'}
              </span>
            </div>

            {hasUnreadReply && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full animate-bounce shadow-[0_0_12px_rgba(239,68,68,0.8)] border border-white">
                NEW REPLY!
              </span>
            )}
          </button>

          {/* Large Noticeable Glowing 3D Logo Circle Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative group h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-black border-4 border-cyan-400 p-1 shadow-[0_0_45px_rgba(6,182,212,0.85)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer overflow-hidden shrink-0"
            id="btn-chatbot-toggle"
            title="Elon Capital B.O.T. - Click to Chat"
          >
            {/* Pulsing halo effect */}
            <span className="absolute -inset-2 bg-cyan-400/50 rounded-full blur-xl opacity-90 animate-pulse" />
            <div className="h-full w-full rounded-full overflow-hidden relative z-10 flex items-center justify-center bg-black border border-cyan-300/50">
              <img 
                src={logoImg} 
                alt="Elon Capital 3D Logo" 
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/elon_capital_logo.jpg';
                }}
                className="h-full w-full object-cover group-hover:scale-110 transition duration-300" 
              />
            </div>
            
            <span className="absolute top-1 right-1 z-20 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-400 border-2 border-black"></span>
            </span>

            {hasUnreadReply && (
              <span className="absolute bottom-1 right-1 z-30 bg-red-500 text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded-full animate-pulse border border-black shadow">
                1
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`bg-zinc-950 border-2 border-cyan-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded 
              ? 'w-full h-full rounded-none' 
              : 'w-[calc(100vw-2rem)] sm:w-[440px] max-w-[440px] h-[560px] sm:h-[600px] max-h-[calc(100vh-6rem)] rounded-3xl'
          }`}
          id="chatbot-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-950 via-cyan-950/40 to-zinc-950 px-5 py-4 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-black border-2 border-cyan-400/70 overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <img 
                  src={logoImg} 
                  alt="Elon Capital 3D Logo" 
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/elon_capital_logo.jpg';
                  }}
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-white uppercase tracking-wider font-display">
                  Elon Capital <span className="text-cyan-400">B.O.T.</span>
                </span>
                <span className="block text-[8px] text-cyan-400 font-mono uppercase tracking-widest font-bold">
                  {isLiveMode ? `🔴 LIVE LINE: ${activeTicketId}` : "⚡ AUTONOMOUS LIQUIDITY INTEL"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition"
                title={isExpanded ? "Collapse Window" : "Expand to Full Screen"}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              
              <button 
                onClick={() => { setIsOpen(false); setIsExpanded(false); }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Header: Connect Live Support */}
          {!isLiveMode && (
            <div className="bg-cyan-950/20 border-b border-cyan-500/10 px-4 py-2.5 flex items-center justify-between text-[11px]">
              <span className="text-gray-300 font-medium">Need live human underwriting?</span>
              <button
                onClick={handleConnectToRepresentative}
                disabled={isConnecting}
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 text-black font-black uppercase tracking-wider rounded text-[9px] flex items-center gap-1 transition cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Connecting...
                  </>
                ) : (
                  "Live Desk"
                )}
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800" id="chatbot-messages">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              const isRep = msg.sender === 'rep';
              const isWarning = msg.text.includes('⚠️ EXTREMELY IMPORTANT');
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${isBot || isRep ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                >
                  <div className={`h-8 w-8 rounded-xl shrink-0 overflow-hidden flex items-center justify-center text-xs ${
                    isBot 
                      ? 'bg-black border border-cyan-400/50' 
                      : isRep
                        ? 'bg-cyan-950 border border-cyan-500/30 text-cyan-400'
                        : 'bg-zinc-800 border border-white/10 text-white'
                  }`}>
                    {isBot ? (
                      <img 
                        src={logoImg} 
                        alt="Elon Capital 3D Logo" 
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/elon_capital_logo.jpg';
                        }}
                        className="h-full w-full object-cover" 
                      />
                    ) : isRep ? (
                      <User className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className={`rounded-2xl p-3.5 text-xs leading-relaxed border ${
                    isBot 
                      ? isWarning 
                        ? 'bg-red-950/20 border-red-500/40 text-red-200 font-bold shadow-[0_4px_12px_rgba(239,68,68,0.08)]' 
                        : 'bg-zinc-900/90 border-white/5 text-gray-200 font-medium'
                      : isRep
                        ? 'bg-cyan-950/30 border-cyan-500/30 text-white font-bold'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-white font-bold'
                  }`}>
                    {(isBot || isRep) && (
                      <span className="block font-mono text-[8px] uppercase tracking-wider text-cyan-400 mb-1 font-extrabold">
                        {isRep ? msg.senderName : "ELON CAPITAL B.O.T."}
                      </span>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Interactive Login/Register Action Buttons for Restricted Access */}
                    {msg.showAuthButtons && onOpenAuth && (
                      <div className="mt-3 flex flex-wrap gap-2 pt-2.5 border-t border-white/10">
                        <button
                          onClick={() => onOpenAuth('login')}
                          className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black text-[11px] font-black uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-mono"
                        >
                          🔑 Sign In to Account
                        </button>
                        <button
                          onClick={() => onOpenAuth('register')}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer font-mono"
                        >
                          ✨ Register New Borrower
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 max-w-[80%] mr-auto text-left">
                <div className="h-8 w-8 rounded-xl bg-black border border-cyan-400/50 shrink-0 overflow-hidden">
                  <img src={logoImg} alt="Elon Capital 3D Logo" className="h-full w-full object-cover" />
                </div>
                <div className="bg-zinc-900/90 border border-white/5 rounded-2xl p-3.5 text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Click Questions */}
          {!isLiveMode && (
            <div className="px-5 py-2.5 border-t border-white/5 bg-zinc-950 flex flex-wrap gap-1.5">
              {quickQuestions.map((qq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qq.query)}
                  className="text-[10px] font-mono font-bold bg-zinc-900 hover:bg-zinc-850 border border-white/5 hover:border-cyan-500/40 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg transition duration-150 cursor-pointer text-left"
                >
                  {qq.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 border-t border-white/10 bg-zinc-950 flex gap-2"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLiveMode ? "Type reply to representative..." : "Ask Elon Capital B.O.T. about rates, charter fee..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08]"
            />
            <button 
              type="submit"
              className="h-9 w-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shrink-0 border border-cyan-300 transition cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

