import React from 'react';
import { Rocket, Cpu, Building2, TrendingUp } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  amount: string;
  key?: React.Key;
}

function FeatureCard({ icon, title, description, amount }: FeatureCardProps) {
  return (
    <div className="relative group overflow-hidden border-t border-white/10 hover:border-cyan-400/50 pt-8 transition-all duration-500">
      <div className="h-8 w-8 text-cyan-400 mb-6 transition-transform duration-500 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-white tracking-wide uppercase mb-3">{title}</h3>
      <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
        {description}
      </p>
      <div className="font-mono text-xs text-cyan-400 font-semibold tracking-wider">
        {amount}
      </div>
    </div>
  );
}

export default function Features() {
  const fundingSolutions = [
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Startup Liquidity",
      description: "Non-dilutive institutional bridge funding for late-stage aerospace, robotics, and tech platforms.",
      amount: "UP TO $50,000,000"
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Protocol Capital",
      description: "Custom decentralized treasury loans and layer-1 node scaling facilities.",
      amount: "UP TO $250,000,000"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Enterprise Scaling",
      description: "Direct asset purchase facilities and cross-border commercial credit expansion.",
      amount: "UP TO $150,000,000"
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Infrastructure Debt",
      description: "Syndicated project financing structures for off-grid operations and industrial real estate.",
      amount: "UP TO $500,000,000"
    }
  ];

  return (
    <div className="bg-black py-28 border-t border-white/5" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-20">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 mb-4">Structured Capital</h2>
          <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight uppercase">
            High-Capacity Liquidity Lines
          </h3>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16" id="features-grid">
          {fundingSolutions.map((solution, idx) => (
            <FeatureCard 
              key={idx}
              icon={solution.icon}
              title={solution.title}
              description={solution.description}
              amount={solution.amount}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
