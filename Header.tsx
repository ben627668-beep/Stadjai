import React from 'react';
import { BookOpen, GraduationCap, Moon, Sun } from 'lucide-react';
import { InstallAppButton } from './InstallAppButton';

interface HeaderProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-amber-500/30 relative overflow-hidden">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/50 opacity-80 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30 shrink-0 relative">
              <BookOpen className="w-8 h-8 text-slate-950" />
              <span className="absolute -top-1.5 -right-1.5 text-lg" title="Colombe de Sagesse">
                🕊️
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
                  STADJAI
                </span>
                <span className="text-lg">🕊️</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Université de Bondoukou
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-lg font-medium">
                Gère ton argent comme un sage — Calculateur & Conseils Bibliques
              </p>
            </div>
          </div>

          {/* Right Badges, Install App Button & Dark Mode Toggle */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 text-xs font-semibold text-slate-300">
            <InstallAppButton variant="header" />

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Année = 9 Mois</span>
            </div>

            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all font-bold"
                title="Basculez le mode sombre / clair"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
                <span>{darkMode ? 'Clair' : 'Sombre'}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
