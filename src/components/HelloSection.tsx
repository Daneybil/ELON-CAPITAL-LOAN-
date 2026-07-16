import React from 'react';
import { ShieldCheck, Rocket, Zap, Globe, ArrowRight } from 'lucide-react';

interface HelloSectionProps {
  onApplyClick: () => void;
}

export default function HelloSection({ onApplyClick }: HelloSectionProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-28" id="hello-image-section">
      <div className="relative min-h-[480px] w-full rounded-2xl border border-white/5 bg-zinc-950/40 p-8 sm:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.9)] group hover:border-cyan-500/20 transition-all duration-500 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Background glow effects and ambient space grid */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-cyan-500/[0.02] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.002)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.002)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        {/* Left Column: Hello Greeting and Venture Content */}
        <div className="flex-1 text-left z-10 max-w-xl">
          <span className="px-3 py-1 text-[8px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 rounded-full inline-flex items-center gap-1.5 mb-6">
            <Rocket className="h-3 w-3 text-cyan-400 animate-pulse" />
            ELON MUSK'S VENTURE CREDIT COALITION
          </span>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-tight mb-4">
            Hello, Welcome to <br />
            <span className="text-cyan-400">Elon Capital Loan</span>
          </h2>
          
          <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400 font-bold mb-6">
            Secure Fast Loan & Change Your Life
          </h3>
          
          <p className="text-sm sm:text-base text-gray-200 font-semibold leading-relaxed mb-8">
            This platform is built directly in synchronization with the forward-looking technological expansion of our decade. We believe traditional banking gatekeepers are actively holding back the dreamers, the developers, and the builders of the future. By locking decentralized capital facilities up to <strong className="text-cyan-400">$500,000,000</strong>, we back ventures in aerospace, layer-1 blockchain networks, AI research, off-grid infrastructure, and professional crypto trading. 
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onApplyClick}
              className="relative group rounded-xl bg-cyan-700/80 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer"
            >
              <span className="absolute inset-0 rounded-xl bg-cyan-800 translate-y-1 block"></span>
              <span className="relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-widest -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 font-display">
                Apply for Funding
                <ArrowRight className="h-4 w-4 text-black stroke-[2.5]" />
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: High-Res Rocket Launch Image */}
        <div className="flex-1 w-full max-w-md z-10 relative">
          {/* Ambient cyan backdrop shadow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl blur-xl opacity-60 pointer-events-none" />
          
          <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 p-2 shadow-2xl group hover:border-cyan-400/30 transition-colors duration-300">
            <img 
              src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80" 
              alt="Falcon Rocket Thrust Propulsion"
              referrerPolicy="no-referrer"
              className="w-full h-80 object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
            />
            {/* Absolute overlay badge inside image */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-md border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div className="text-left">
                <span className="block text-[8px] font-mono text-cyan-400 uppercase tracking-widest">Active Ventures</span>
                <span className="block text-xs font-bold text-white uppercase font-sans">SpaceX / Tesla / Neuralink</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
