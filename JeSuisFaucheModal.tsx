import React from 'react';
import { AlertCircle, X, HeartHandshake, Utensils, Bus, Sparkles, Footprints } from 'lucide-react';

interface JeSuisFaucheModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JeSuisFaucheModal: React.FC<JeSuisFaucheModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-red-500 shadow-2xl relative space-y-6 overflow-hidden">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full bg-slate-100 dark:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md ring-2 ring-red-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-serif uppercase tracking-tight">
              📢 Mode Fauché : Que faire aujourd'hui ?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pas de panique, voici ta feuille de route immédiate à l'Université de Bondoukou.
            </p>
          </div>
        </div>

        {/* Big Key Message */}
        <div className="bg-red-50 dark:bg-red-950/50 p-5 rounded-2xl border-2 border-red-200 dark:border-red-800 space-y-3">
          <p className="text-base font-extrabold text-red-900 dark:text-red-200 leading-relaxed font-serif">
            « Va à l'église ou à la mosquée à pied (gratuit), prends 1 ticket petit-déjeuner cantine (100F) ou midi/soir (200F). La prière ne coûte rien. Dieu pourvoira ! »
          </p>
        </div>

        {/* Detailed Solutions */}
        <div className="space-y-3">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <Utensils className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
              <strong className="text-emerald-900 dark:text-emerald-300 font-bold block">1. Resto U (CROU-B)</strong>
              Ticket petit-déjeuner à 100F, déjeuner/dîner à 200F pour manger chaud au campus.
            </div>
          </div>

          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 flex items-start gap-3">
            <Footprints className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
              <strong className="text-purple-900 dark:text-purple-300 font-bold block">2. Déplacement à pied</strong>
              Marche pour aller au cours ou à l'église. Jésus et les disciples marchaient kilomètres !
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
              <strong className="text-amber-900 dark:text-amber-300 font-bold block">3. La Foi & la Prière</strong>
              Garde ton sang-froid et fais confiance. Dieu nourrit aussi les oiseaux du ciel.
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-sm shadow-md transition-all uppercase tracking-wider"
        >
          D'accord, je garde la foi ! 👍
        </button>

      </div>
    </div>
  );
};
