import React from 'react';
import { MessageSquare, X, Send, Bot, User, ArrowRight, ShieldAlert, Sparkles, Maximize2, Minimize2, LifeBuoy, AlertCircle, RefreshCw } from 'lucide-react';
import { User as UserType } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'rep';
  senderName?: string;
  text: string;
  timestamp: Date;
}

interface ChatbotProps {
  user: UserType | null;
  token: string | null;
}

const FAQ_DATABASE = [
  {
    keywords: ['owner', 'own', 'who owns', 'elon', 'musk'],
    answer: "Elon Capital Loan is a premier visionary venture owned and established under the forward-looking technological expansion of Elon Musk. It operates in close alignment with SpaceX, Tesla, and Neuralink, aiming to provide high-velocity liquidity to global builders, aerospace developers, and ambitious small businesses."
  },
  {
    keywords: ['borrow', 'limit', 'how much', 'maximum', 'amount', 'loan size', 'minimum'],
    answer: "Qualified individuals and registered businesses can secure funding allocations ranging from a minimum borrow amount of $1,000 up to a maximum capital pool of $500,000,000. Underwriting is based on portfolio strength, digital cash flows, active trading volume, and enterprise scale."
  },
  {
    keywords: ['collateral', 'collateral fee', 'fee', 'security deposit', 'refundable'],
    answer: "To secure deep liquidity reserves and validate asset backing, our platform implements a 25% refundable security deposit as collateral. This verification collateral must be fully processed and cleared before the final execution and dispatch of your funds."
  },
  {
    keywords: ['company fee', 'admin fee', 'underwriting fee', 'platform fee', 'setup'],
    answer: "The company fee (setup fee) for general administration, setup, international underwriting, and ledger integration is fixed at 3.5% of the total loan principal. This is accounted for during the underwriting clearance phase."
  },
  {
    keywords: ['interest', 'rate', 'rates', 'percentage'],
    answer: "Our interest rates are highly competitive and structured as follows:\n- 15% interest for loan terms less than or equal to 12 months.\n- 25% interest for loan terms greater than 12 months."
  },
  {
    keywords: ['work', 'how does it work', 'process', 'steps', 'workflow'],
    answer: "Our funding process consists of 6 simple steps:\n1. Create Your Account\n2. Complete Identity Verification\n3. Submit Your Funding Request\n4. Application Undergoes Professional Review\n5. Receive Funding Decision\n6. Receive Your Funds directly into your verified accounts."
  },
  {
    keywords: ['not pay', 'run away', 'scam', 'default', 'warning', 'prosecute', 'jail', 'steal', 'government', 'arrest'],
    answer: "⚠️ EXTREMELY IMPORTANT NOTICE: Elon Capital Loan operates in absolute cooperation with global law enforcement, international tribunals, Interpol, and local government recovery agencies. Any attempt to borrow and default or escape repayment is treated as a high-tier financial felony. We offer a maximum 1-month grace window. If payment is not settled within 30 days past the due date, we initiate immediate asset seizure (including all bank accounts, physical properties, corporate entities, and cold-storage cryptocurrency wallets) followed by severe criminal prosecution and prison/jail sentences. We enforce 100% recovery."
  }
];

export default function Chatbot({ user, token }: ChatbotProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false); // New full screen capability
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am the Yellow Capital Boat AI assistant. How can I assist you with your funding, interest rates, ownership questions, or platform workflows today?\n\nIf you need custom underwriting, click the 'Connect to Live Representative' button below to speak directly with an operations officer.",
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

  // Sync ticket replies if in Live Representative Mode
  React.useEffect(() => {
    if (!isLiveMode || !activeTicketId || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/support/tickets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const ticketsList = await res.json();
          const targetTicket = ticketsList.find((t: any) => t.id === activeTicketId);
          if (targetTicket && targetTicket.replies) {
            // Map replies to messages format
            const mappedMessages: Message[] = targetTicket.replies.map((reply: any) => ({
              id: reply.id,
              sender: reply.senderRole === 'admin' ? 'rep' : 'user',
              senderName: reply.senderName,
              text: reply.content,
              timestamp: new Date(reply.createdAt)
            }));
            
            // Deduplicate and append
            setMessages(prev => {
              // Preserve the initial welcome message, then override with mapped ticket messages
              const welcome = prev.filter(m => m.id === 'welcome');
              return [...welcome, ...mappedMessages];
            });
          }
        }
      } catch (err) {
        console.error('Error polling support ticket replies', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveMode, activeTicketId, token]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    if (isLiveMode && activeTicketId && token) {
      // Send the reply to the actual backend Support Ticket replies DB!
      try {
        await fetch('/api/support/tickets/reply', {
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
      } catch (err) {
        console.error('Failed to send live reply', err);
      }
    } else {
      // Standard AI Bot Mode
      setIsTyping(true);
      setTimeout(() => {
        let responseText = "Thank you for reaching out! I am analyzing your request. For precise parameters, please refer to our active application portal, or click the 'Connect to Live Representative' button above.";
        
        const normalizedInput = textToSend.toLowerCase();
        
        // Find matching keywords
        const matched = FAQ_DATABASE.find(item => 
          item.keywords.some(keyword => normalizedInput.includes(keyword))
        );

        if (matched) {
          responseText = matched.answer;
        } else if (normalizedInput.includes('hello') || normalizedInput.includes('hi') || normalizedInput.includes('hey')) {
          responseText = "Hello there! I am the Yellow Capital Boat AI intelligence assistant. Ask me anything about our ownership, maximum borrow limits, interest structures, setup fees, or non-repayment warnings!";
        }

        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: responseText,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 750);
    }
  };

  // Create a real support ticket on the backend and wire up live desk chat
  const handleConnectToRepresentative = async () => {
    if (!token || !user) {
      // User is not logged in
      const authMsg: Message = {
        id: `auth-req-${Date.now()}`,
        sender: 'bot',
        text: "🔒 ACCESS RESTRICTED: Live underwriting officers require an established borrower security token.\n\nPlease Register or Login using the buttons at the top of the page to initiate live communications immediately.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, authMsg]);
      return;
    }

    setIsConnecting(true);

    try {
      const res = await fetch('/api/support/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: `Yellow Capital Boat Live Chat Session`,
          category: 'General',
          message: `Hello, I would like to connect with a high-clearance underwriting representative about my capital requirements.`
        })
      });

      if (!res.ok) throw new Error('Could not create ticket session');

      const data = await res.json();
      const ticketId = data.ticket.id;

      setActiveTicketId(ticketId);
      setIsLiveMode(true);

      // Simulate representative joining sequence
      setTimeout(() => {
        const joinMsg: Message = {
          id: `rep-join-${Date.now()}`,
          sender: 'rep',
          senderName: "Sarah (Operations Desk)",
          text: `👋 CONNECTION SECURED!\nLive session code: ${ticketId}.\n\nHello, I am Sarah, your high-clearance underwriting officer. I have received your request on my dashboard. Let's discuss your capital needs. How can I help you?`,
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
        text: "⚠️ Connection timeout. The desk is currently handling extreme volume. Please try again or submit an administrative support request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const quickQuestions = [
    { label: "Who owns this platform?", query: "Who owns this platform?" },
    { label: "How much can I borrow?", query: "How much can I borrow?" },
    { label: "What is the collateral fee?", query: "How much is the collateral fee?" },
    { label: "What is the setup fee?", query: "How much is the company setup fee?" },
    { label: "What are the interest rates?", query: "What are the interest rates?" },
    { label: "Non-repayment warning?", query: "What happens if someone tries to borrow and not pay?" }
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
      {/* Yellow Capital Boat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group h-14 w-14 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black flex items-center justify-center shadow-[0_8px_30px_rgba(234,179,8,0.5)] border border-yellow-300 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          id="btn-chatbot-toggle"
          title="Yellow Capital Boat Assistant"
        >
          {/* Pulse effect */}
          <span className="absolute -inset-1 bg-yellow-400/30 rounded-full blur-md opacity-75 animate-pulse" />
          <LifeBuoy className="h-6 w-6 relative z-10 text-black animate-spin" style={{ animationDuration: '12s' }} />
          
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`bg-zinc-950 border-2 border-yellow-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded 
              ? 'w-full h-full rounded-none' 
              : 'w-[350px] sm:w-[420px] h-[580px] rounded-3xl'
          }`}
          id="chatbot-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-950/80 to-zinc-950 px-5 py-4 border-b border-yellow-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <LifeBuoy className="h-5 w-5 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-white uppercase tracking-wider">Yellow Capital Boat</span>
                <span className="block text-[8px] text-yellow-400 font-mono uppercase tracking-widest font-bold">
                  {isLiveMode ? `🔴 LIVE LINE: ${activeTicketId}` : "⚡ AUTONOMOUS INTEL"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Expand Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
                title={isExpanded ? "Collapse Window" : "Expand to Full Screen"}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              
              <button 
                onClick={() => { setIsOpen(false); setIsExpanded(false); }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Header: Connect Live Support */}
          {!isLiveMode && (
            <div className="bg-yellow-950/20 border-b border-yellow-500/10 px-4 py-2.5 flex items-center justify-between text-[11px]">
              <span className="text-gray-300 font-medium">Need live human underwriting?</span>
              <button
                onClick={handleConnectToRepresentative}
                disabled={isConnecting}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-black font-black uppercase tracking-wider rounded text-[9px] flex items-center gap-1 transition cursor-pointer"
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
                  <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-xs ${
                    isBot 
                      ? isWarning 
                        ? 'bg-red-950/40 border border-red-500/30 text-red-400' 
                        : 'bg-yellow-950/40 border border-yellow-500/20 text-yellow-400'
                      : isRep
                        ? 'bg-cyan-950 border border-cyan-500/30 text-cyan-400'
                        : 'bg-zinc-800 border border-white/10 text-white'
                  }`}>
                    {isBot ? <Bot className="h-4 w-4" /> : isRep ? <User className="h-4 w-4 text-cyan-400" /> : <User className="h-4 w-4" />}
                  </div>
                  
                  <div className={`rounded-2xl p-3.5 text-xs leading-relaxed border ${
                    isBot 
                      ? isWarning 
                        ? 'bg-red-950/20 border-red-500/40 text-red-200 font-bold shadow-[0_4px_12px_rgba(239,68,68,0.08)]' 
                        : 'bg-zinc-900/90 border-white/5 text-gray-200 font-medium'
                      : isRep
                        ? 'bg-cyan-950/30 border-cyan-500/30 text-white font-bold'
                        : 'bg-yellow-500/10 border-yellow-500/30 text-white font-bold'
                  }`}>
                    {(isBot || isRep) && (
                      <span className="block font-mono text-[8px] uppercase tracking-wider text-yellow-500 mb-1">
                        {isRep ? msg.senderName : "YELLOW CAPITAL BOAT"}
                      </span>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 max-w-[80%] mr-auto text-left">
                <div className="h-8 w-8 rounded-xl bg-yellow-950/40 border border-yellow-500/20 text-yellow-400 shrink-0 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-zinc-900/90 border border-white/5 rounded-2xl p-3.5 text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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
                  className="text-[10px] font-mono font-bold bg-zinc-900 hover:bg-zinc-850 border border-white/5 hover:border-yellow-500/40 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg transition duration-150 cursor-pointer text-left"
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
              placeholder={isLiveMode ? "Type reply to representative..." : "Ask Yellow Capital Boat about rates, default warning..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-yellow-500/50 focus:bg-white/[0.08]"
            />
            <button 
              type="submit"
              className="h-9 w-9 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black flex items-center justify-center shrink-0 border border-yellow-300 transition cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
