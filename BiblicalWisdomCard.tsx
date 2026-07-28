import React, { useState } from 'react';
import { BookOpen, Sparkles, RefreshCw, HeartHandshake, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { BiblicalWisdom, Period, BudgetCategory } from '../types';

interface BiblicalWisdomCardProps {
  wisdom: BiblicalWisdom;
  totalBudget: number;
  period: Period;
  categories: Record<string, BudgetCategory>;
  remainingAmount: number;
}

export const BiblicalWisdomCard: React.FC<BiblicalWisdomCardProps> = ({
  wisdom: initialWisdom,
  totalBudget,
  period,
  categories,
  remainingAmount,
}) => {
  const [currentWisdom, setCurrentWisdom] = useState<BiblicalWisdom>(initialWisdom);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Update when initialWisdom changes
  React.useEffect(() => {
    setCurrentWisdom(initialWisdom);
  }, [initialWisdom]);

  const fetchGeminiWisdom = async () => {
    setIsLoadingAi(true);
    setAiMessage(null);
    try {
      const response = await fetch('/api/wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalBudget,
          period,
          categories,
          remaining: remainingAmount,
        }),
      });

      const data = await response.json();
      if (data.success && data.wisdom) {
        setCurrentWisdom({
          reference: data.wisdom.reference,
          verseText: data.wisdom.verseText,
          spiritualAdvice: data.wisdom.spiritualAdvice,
          antiWasteTip: data.wisdom.antiWasteTip,
          encouragement: data.wisdom.encouragement,
          theme: 'Méditation Personnalisée Gemini AI',
        });
        setAiMessage('Conseil biblique personnalisé généré avec succès par l\'IA STADJAI !');
      } else {
        setAiMessage('Moteur de sagesse biblique STADJAI actualisé.');
      }
    } catch (err) {
      console.error('Error fetching AI wisdom:', err);
      setAiMessage('Moteur de sagesse biblique réinitialisé.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const periodText = period === 'year' ? "l'année académique de 9 mois" : "le mois";

  return (
    <div className="bg-gradient-to-br from-amber-50 via-amber-100/60 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-300/80 shadow-xl relative overflow-hidden my-8">
      {/* Decorative background watermark */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-emerald-200/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-600 text-amber-50 rounded-2xl flex items-center justify-center shadow-md shrink-0 ring-2 ring-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                Conseil pour {periodText} ({totalBudget.toLocaleString('fr-FR')} FCFA)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchGeminiWisdom}
            disabled={isLoadingAi}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAi ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isLoadingAi ? 'Consultation en cours...' : 'Inspiration Biblique AI'}</span>
          </button>
        </div>

        {aiMessage && (
          <div className="text-xs font-medium text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-xl p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{aiMessage}</span>
          </div>
        )}

        {/* Biblical Verse Block */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-amber-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm sm:text-base font-extrabold text-amber-900 font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{currentWisdom.reference}</span>
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
              {currentWisdom.theme || "Sagesse & Prévoyance"}
            </span>
          </div>

          <blockquote className="text-base sm:text-lg font-serif italic text-slate-800 border-l-4 border-amber-500 pl-4 py-1 my-2">
            {currentWisdom.verseText}
          </blockquote>

          <p className="text-xs sm:text-sm text-slate-700 mt-4 leading-relaxed font-medium">
            <strong className="text-amber-950 font-bold block mb-1">💡 Enseignement pour l'étudiant de Bondoukou :</strong>
            {currentWisdom.spiritualAdvice}
          </p>
        </div>

        {/* 2 Key Action Columns: Anti-Gaspillage & Pense à Demain */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Anti-Gaspillage Box */}
          <div className="bg-emerald-900/90 text-emerald-50 rounded-2xl p-5 border border-emerald-700/80 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span>Ne Pas Gaspiller Ton Argent !</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal">
              {currentWisdom.antiWasteTip}
            </p>
          </div>

          {/* Pense à Demain Box */}
          <div className="bg-amber-950/90 text-amber-50 rounded-2xl p-5 border border-amber-700/80 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <HeartHandshake className="w-5 h-5 text-amber-400" />
              <span>Pense à Demain !</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-normal">
              {currentWisdom.encouragement}
            </p>
          </div>

        </div>

        {/* Summary Footer Warning */}
        <div className="text-center pt-2 text-xs text-amber-900/80 font-medium italic">
          « L'étudiant sage gère son argent avant de le dépenser. Que Dieu bénisse tes études à Bondoukou ! »
        </div>

      </div>
    </div>
  );
};
