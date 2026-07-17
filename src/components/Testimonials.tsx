import React from 'react';
import { Quote, Star, MapPin } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  amount: string;
  location: string;
}

export default function Testimonials() {
  const allReviews: Testimonial[] = [
    {
      quote: "Elon Capital Loan solved our series startup liquidity puzzle. After the loan application is approved, our loan was received under 24 hours directly. Thanks, Elon Musk!",
      author: "Marcus Vance",
      role: "CEO & Founder",
      company: "Novasphere Networks",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$25,000,000",
      location: "USA"
    },
    {
      quote: "As a Web3 developer, traditional banks don't understand our smart contract models. After the loan application is approved, our loan was received under 24 hours directly into our treasury wallet. Thanks, Elon Musk!",
      author: "Elena Rostova",
      role: "Core Protocol Architect",
      company: "Aether Layer-2 dApp",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$5,000,000",
      location: "Russia"
    },
    {
      quote: "I needed $100,000 expansion capital to purchase Forex trading servers and leverage. After the loan application is approved, our loan was received under 24 hours. The efficiency of Elon Capital Loan is unmatched. Thanks, Elon Musk!",
      author: "Daniel Kovic",
      role: "Trading Operations Lead",
      company: "Helios Capital Systems",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$100,000",
      location: "Switzerland"
    },
    {
      quote: "Starting with zero capital was terrifying, but Elon's platform gave us a $50,000 starter loan with friendly fixed interest. After the loan application is approved, our loan was received under 24 hours. Thanks, Elon Musk!",
      author: "Aisha Mwangi",
      role: "Creative Director",
      company: "Umoja Digital Agency",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$50,000",
      location: "UK"
    },
    {
      quote: "We secured $1,000,000 for our sustainable logistics business. No tedious bank branch visits! After the loan application is approved, our loan was received under 24 hours. Thanks, Elon Musk!",
      author: "Robert O'Connor",
      role: "Operations Director",
      company: "Greenway Freight Services",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$1,000,000",
      location: "Canada"
    },
    {
      quote: "Our cryptocurrency trading fund needed a temporary $10,000,000 capital injection during high-yield market weeks. After the loan application is approved, our loan was received under 24 hours. Highly secure. Thanks, Elon Musk!",
      author: "Sarah Jenkins",
      role: "Managing Partner",
      company: "Vector Block Ventures",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$10,000,000",
      location: "Germany"
    },
    {
      quote: "We were rejected by three credit institutions for our boutique Forex algorithmic trading project. Elon Capital Loan understood our system. After the loan application is approved, our loan was received under 24 hours. Thanks, Elon Musk!",
      author: "David Adebayo",
      role: "Quantitative Analyst",
      company: "Apex FX Algo LLC",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$500,000",
      location: "Ukraine"
    },
    {
      quote: "A premium $5,000,000 manufacturing expansion facility was granted completely online. After the loan application is approved, our loan was received under 24 hours. No physical paperwork. Thanks, Elon Musk!",
      author: "Christine Meyer",
      role: "CFO & Partner",
      company: "Precision Moulds Europe",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$5,000,000",
      location: "Europe"
    },
    {
      quote: "Our decentralized finance startup got funded with $2,500,000. After the loan application is approved, our loan was received under 24 hours. It is extremely inspiring to see Elon Musk supporting Web3 and Forex. Thanks, Elon Musk!",
      author: "Kenji Tanaka",
      role: "Lead Solidity Developer",
      company: "Kuro Protocols",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$2,500,000",
      location: "China"
    },
    {
      quote: "As a small shop startup owner starting from zero capital, a $30,000 loan allowed us to purchase inventory. After the loan application is approved, our loan was received under 24 hours. Thanks, Elon Musk!",
      author: "Malika Johnson",
      role: "Founder",
      company: "Luxe Flora Boutiques",
      avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$30,000",
      location: "USA"
    },
    {
      quote: "Getting an institutional loan was extremely painful until we found Elon Capital Loan. After the loan application is approved, our loan was received under 24 hours without any stressful bank interviews. Thanks, Elon Musk!",
      author: "Chloe Zheng",
      role: "Co-Founder",
      company: "Titan Web3 Solutions",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$10,000,000",
      location: "China"
    },
    {
      quote: "The speed of the underwriting process is magical. After the loan application is approved, our loan was received under 24 hours on our dashboard. This is an amazing opportunity globally! Thanks, Elon Musk!",
      author: "Jack Thornton",
      role: "Director of Trading",
      company: "Vanguard Alpha Group",
      avatar: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$250,000",
      location: "UK"
    },
    {
      quote: "We secured a $5,000,000 liquidity facility to expand our quantitative algorithms. After the loan application is approved, our loan was received under 24 hours. Truly incredible. Thanks, Elon Musk!",
      author: "Sofia Lindstrom",
      role: "Quantitative Analyst",
      company: "Zurich Quant Lab",
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$5,000,000",
      location: "Switzerland"
    },
    {
      quote: "For our local organic farming startup in Berlin, traditional credit was completely closed. After the loan application is approved, our loan was received under 24 hours. Thanks, Elon Musk!",
      author: "Pierre Dupont",
      role: "Operations Lead",
      company: "Berlin Agritech Starter",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=120&q=80",
      rating: 5,
      amount: "$150,000",
      location: "Germany"
    }
  ];

  // Rotating sliding mechanism
  // Show 3 testimonials at once, slide them sequentially by 1 step every 4 seconds
  const [startIndex, setStartIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % allReviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [allReviews.length]);

  // Extract a window of 3 items, wrapping around the end of the array
  const getVisibleTestimonials = () => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      const index = (startIndex + i) % allReviews.length;
      items.push(allReviews[index]);
    }
    return items;
  };

  const visibleReviews = getVisibleTestimonials();

  return (
    <div className="bg-transparent py-8" id="testimonials">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header - Verified Operations is removed as requested */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Trusted by Builders Globally
          </h3>
          <p className="text-xs sm:text-sm text-zinc-100 font-black uppercase tracking-wider mt-4 bg-white/[0.04] border border-white/15 rounded-2xl py-4 px-6 inline-block leading-relaxed">
            Real entrepreneurs, Web3 developers, Forex traders, and SME owners backed by Elon Capital Loan
          </p>
        </div>

        {/* Dynamic Testimonials Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden min-h-[380px]" id="testimonials-grid">
          {visibleReviews.map((review, idx) => (
            <div 
              key={`${review.author}-${idx}`}
              className="relative bg-black border border-white/15 rounded-2xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-col justify-between transition-all duration-700 transform hover:scale-[1.01] hover:border-cyan-400/40 select-none animate-fade-in"
              id={`testimonial-card-${idx}`}
            >
              {/* Dynamic Tag */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-300 uppercase tracking-widest font-black">
                  <MapPin className="h-2.5 w-2.5 text-cyan-400" /> {review.location}
                </span>
                <div className="bg-cyan-950 border border-cyan-500/40 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-black tracking-wider text-cyan-300">
                  FUNDED {review.amount}
                </div>
              </div>

              <div className="mt-4">
                {/* Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-cyan-400 text-cyan-400" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-cyan-400/20" />
                </div>

                <p className="text-base sm:text-lg text-white font-extrabold sm:font-black leading-relaxed italic mb-8 tracking-wide">
                  "{review.quote}"
                </p>
              </div>

              {/* Author details */}
              <div className="flex items-center gap-4 border-t border-white/10 pt-5">
                <img 
                  src={review.avatar} 
                  alt={review.author} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-white/30 shadow-md bg-zinc-900"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col text-left">
                  <span className="text-base font-black text-white">{review.author}</span>
                  <span className="text-xs text-zinc-100 font-mono font-black tracking-wide mt-1">
                    {review.role}, <span className="text-cyan-400 font-black">{review.company}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination indicator dots to represent rotation */}
        <div className="flex justify-center items-center gap-1.5 mt-8">
          {allReviews.map((_, i) => {
            const isActive = i === startIndex;
            return (
              <span 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${isActive ? 'w-4 bg-cyan-400' : 'w-1.5 bg-white/10'}`} 
              />
            );
          })}
        </div>

      </div>
    </div>
  );
}
