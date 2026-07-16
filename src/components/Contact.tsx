import React from 'react';
import { Mail, Phone, MapPin, Send, ShieldAlert } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', message: '' });
    }, 4000);
  };

  return (
    <div className="bg-black py-20 border-t border-white/5" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start" id="contact-grid">
          
          {/* Info Block */}
          <div id="contact-info">
            <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-400 mb-3">Secure Communications</h2>
            <h3 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Initiate Funding Dialogue
            </h3>
            <p className="text-gray-400 mt-4 text-sm font-light max-w-lg mb-10 leading-relaxed">
              Have specific capital requirements? Reach out to our liquidity desks. All channels are monitored via secure enterprise-grade systems.
            </p>

            <div className="space-y-6" id="contact-channels">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-cyan-400 flex items-center justify-center shadow-md">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-gray-500 uppercase">Secure Email</p>
                  <p className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">capital@spaceloan.space</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-cyan-400 flex items-center justify-center shadow-md">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-gray-500 uppercase">Institutional desk</p>
                  <p className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">+41 (0) 44 888 01 99</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-cyan-400 flex items-center justify-center shadow-md">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-gray-500 uppercase">European Headquarters</p>
                  <p className="text-sm font-medium text-gray-300 leading-relaxed">
                    Bahnhofstrasse 102, 8001 Zürich, Switzerland
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-3 items-center p-4 bg-white/[0.01] border border-white/5 rounded-xl max-w-md">
              <ShieldAlert className="h-5 w-5 text-cyan-500/40 flex-shrink-0" />
              <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                Communications transmitted through these channels are protected by AES-256 end-to-end operational standards.
              </p>
            </div>
          </div>

          {/* Form Block */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-8 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]" id="contact-form-container">
            {submitted ? (
              <div className="text-center py-12" id="contact-success-state">
                <div className="h-12 w-12 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Send className="h-5 w-5" />
                </div>
                <h4 className="font-display text-lg font-bold text-white mb-2">Inquiry Securely Transmitted</h4>
                <p className="text-sm text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                  Your communication has been processed. A capital representative will reply on secure channels within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="contact-form">
                <h4 className="font-display text-lg font-semibold text-white tracking-wide border-b border-white/5 pb-4">
                  Liquidity Request Form
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-sm text-white focus:outline-none transition-all"
                      placeholder="e.g. Jean Dupont"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Secure Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-sm text-white focus:outline-none transition-all"
                      placeholder="e.g. name@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Company Name (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-sm text-white focus:outline-none transition-all"
                    placeholder="e.g. Novasphere Inc."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Funding Requirement Summary</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-sm text-white focus:outline-none transition-all resize-none"
                    placeholder="Briefly detail your funding request (e.g., SME Expansion, Crypto Business, etc.)."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 text-sm font-medium text-black bg-white rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-[0_2px_15px_rgba(255,255,255,0.05)] flex items-center justify-center gap-2 group cursor-pointer"
                  id="btn-contact-submit"
                >
                  Transmit Inquiry
                  <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
