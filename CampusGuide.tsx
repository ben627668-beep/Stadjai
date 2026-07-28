import React from 'react';
import { BONDOUKOU_CAMPUS_TIPS } from '../data/bondoukouData';
import { BookMarked, Utensils, Sparkles, Bus, Coffee, Soup } from 'lucide-react';

export const CampusGuide: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-emerald-600" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'Bus':
        return <Bus className="w-5 h-5 text-blue-600" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-orange-600" />;
      case 'Soup':
        return <Soup className="w-5 h-5 text-amber-600" />;
      default:
        return <BookMarked className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl my-8">
      
      <div className="border-b border-slate-800 pb-4 mb-6">
        <h3 className="text-xl sm:text-2xl font-bold font-serif flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-amber-400" />
          <span>Guide de Survie Financière — Université de Bondoukou</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Conseils pratiques et astuces de la cité universitaire pour économiser chaque franc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BONDOUKOU_CAMPUS_TIPS.map((tip, idx) => (
          <div
            key={idx}
            className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-3 hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                {getIcon(tip.icon)}
              </div>
              <div>
                <span className="text-2xs uppercase tracking-wider text-amber-400 font-bold block">
                  {tip.category}
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">{tip.title}</h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {tip.text}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
