import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Bell, 
  Globe 
} from 'lucide-react';
import logoImg from '../assets/images/elon_capital_logo_1785585548636.jpg';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // Detect device OS
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
        setActivePlatform('ios');
      } else if (/android/i.test(ua)) {
        setActivePlatform('android');
      }
    }

    // Capture PWA beforeinstallprompt on supported Chromium browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track appinstalled event
    const handleAppInstalled = () => {
      setInstalledSuccessfully(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccessfully(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      // Direct instruction fallback
      alert('To install on your phone:\n1. Tap your browser menu (3 dots or share icon)\n2. Select "Add to Home screen" or "Install App"');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-[#09090b] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white text-left my-8"
        id="download-app-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close download modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <div className="h-16 w-16 rounded-2xl bg-zinc-900 border-2 border-cyan-500 overflow-hidden flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <img 
              src={logoImg} 
              alt="Elon Capital Loan" 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = '/elon_capital_logo.jpg';
              }}
              className="h-full w-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                Download Elon Capital App
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">
                PWA v2.6
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Install directly on your iPhone or Android phone. No App Store download wait times.
            </p>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/60 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => setActivePlatform('ios')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePlatform === 'ios'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            id="tab-download-ios"
          >
            <span className="text-lg">🍎</span> iPhone (iOS)
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('android')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePlatform === 'android'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            id="tab-download-android"
          >
            <span className="text-lg">🤖</span> Android (Google)
          </button>
        </div>

        {/* Content for iPhone / iOS */}
        {activePlatform === 'ios' && (
          <div className="space-y-4 animate-fade-in" id="ios-download-instructions">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> iPhone & iPad Setup (Safari)
                </span>
                <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                  Takes 10 Seconds
                </span>
              </div>

              <ol className="space-y-3.5 text-xs sm:text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-white">Open in Safari</span>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Ensure you are viewing this page in Safari on your iPhone.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                      Tap the <Share2 className="h-4 w-4 text-cyan-400 inline" /> Share Button
                    </span>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Look at the bottom toolbar of Safari and tap the square icon with the upward arrow.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                      Tap <PlusSquare className="h-4 w-4 text-cyan-400 inline" /> "Add to Home Screen"
                    </span>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Scroll down through the share options and select <strong className="text-white">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                    4
                  </span>
                  <div>
                    <span className="font-semibold text-white">Tap "Add" in Top Right</span>
                    <p className="text-gray-400 text-xs mt-0.5">
                      The Elon Capital Loan app icon will be installed immediately onto your iPhone home screen!
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Content for Android */}
        {activePlatform === 'android' && (
          <div className="space-y-4 animate-fade-in" id="android-download-instructions">
            {/* 1-Click Install Button if supported */}
            {isInstallable && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase text-sm tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-trigger-android-pwa"
              >
                <Download className="h-5 w-5" /> 1-Click Install on Android
              </button>
            )}

            {installedSuccessfully && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                App is installed successfully! Check your phone app drawer or home screen.
              </div>
            )}

            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> Android Installation Steps (Chrome / Edge / Brave)
                </span>
                <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                  Direct Install
                </span>
              </div>

              <ol className="space-y-3.5 text-xs sm:text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-white">Tap Browser Menu (⋮)</span>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Tap the three vertical dots located in the top-right corner of Chrome or Edge.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-white">Tap "Install App" or "Add to Home Screen"</span>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Look for <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home Screen"</strong> in the dropdown menu.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-white">Confirm Installation</span>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Tap "Install". The full standalone Elon Capital Loan app will be placed directly on your Android home screen with push notifications.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Native App Advantages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <Zap className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold block text-white">Instant Speed</span>
            <span className="text-[9px] text-gray-500">Zero loading delays</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <ShieldCheck className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold block text-white">Biometric Login</span>
            <span className="text-[9px] text-gray-500">Face ID & fingerprint</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <Bell className="h-4 w-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold block text-white">Loan Alerts</span>
            <span className="text-[9px] text-gray-500">Direct notifications</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <Globe className="h-4 w-4 text-purple-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold block text-white">Offline Access</span>
            <span className="text-[9px] text-gray-500">Check balance offline</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <span>Elon Capital Protocol • Progressive Web App</span>
          <button 
            type="button"
            onClick={onClose}
            className="text-cyan-400 hover:text-white transition-colors font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
