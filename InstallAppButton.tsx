import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, Share2, PlusSquare, X, Info, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppButtonProps {
  variant?: 'header' | 'banner' | 'modal';
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({ variant = 'header' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Detect if already running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Installation error:', err);
        setShowInstructionsModal(true);
      }
    } else {
      // If no native prompt event (e.g. inside iframe or Safari or custom browser), open guide modal
      setShowInstructionsModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>App Installée 📱</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'banner' ? (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-950 font-serif">
                Installez STADJAI sur votre téléphone !
              </h4>
              <p className="text-2xs sm:text-xs text-slate-900 font-semibold mt-0.5">
                Accès instantané hors-ligne, sans téléchargement Play Store nécessaire.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 border border-amber-400 shrink-0"
          >
            <Download className="w-4 h-4 animate-bounce text-amber-400" />
            <span>Installer l'application</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all border border-amber-300 active:scale-95 shrink-0"
          title="Installer l'application STADJAI sur votre téléphone"
        >
          <Download className="w-4 h-4 animate-bounce text-slate-950" />
          <span>Installer l'application</span>
        </button>
      )}

      {/* Mobile Installation Guide Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 text-white border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold text-xl shadow">
                📱
              </div>
              <div>
                <span className="text-3xs uppercase font-extrabold tracking-widest text-amber-400">
                  Installation Mobile
                </span>
                <h3 className="text-lg font-extrabold text-white font-serif">
                  Comment installer STADJAI sur téléphone
                </h3>
              </div>
            </div>

            {isIOS ? (
              /* Instructions for iPhone / Safari */
              <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-amber-500/30 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Info className="w-5 h-5 shrink-0" />
                  <span>Procédure sur iPhone & iPad (Safari) :</span>
                </div>
                <ol className="space-y-3 text-slate-300 font-medium list-decimal list-inside">
                  <li className="leading-relaxed">
                    Appuyez sur le bouton <strong>Partager</strong>{' '}
                    <Share2 className="w-4 h-4 inline text-amber-400 mx-1" /> en bas de votre écran Safari.
                  </li>
                  <li className="leading-relaxed">
                    Faites défiler le menu vers le bas et sélectionnez{' '}
                    <strong>"Sur l'écran d'accueil"</strong>{' '}
                    <PlusSquare className="w-4 h-4 inline text-emerald-400 mx-1" />.
                  </li>
                  <li className="leading-relaxed">
                    Cliquez sur <strong>"Ajouter"</strong> en haut à droite. L'icône <strong>STADJAI 🕊️</strong> apparaîtra sur votre téléphone !
                  </li>
                </ol>
              </div>
            ) : (
              /* Instructions for Android / Chrome / General Browser */
              <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-amber-500/30 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Info className="w-5 h-5 shrink-0" />
                  <span>Procédure sur Android (Chrome, Samsung Internet, Opera) :</span>
                </div>
                <ol className="space-y-3 text-slate-300 font-medium list-decimal list-inside">
                  <li className="leading-relaxed">
                    Appuyez sur le menu <strong className="text-amber-400">⋮ (les 3 petits points)</strong> en haut à droite de votre navigateur.
                  </li>
                  <li className="leading-relaxed">
                    Sélectionnez <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong>.
                  </li>
                  <li className="leading-relaxed">
                    Validez en cliquant sur <strong>"Installer"</strong>. Vous aurez l'application directement dans le menu de votre téléphone !
                  </li>
                </ol>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
