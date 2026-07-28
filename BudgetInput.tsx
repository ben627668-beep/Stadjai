import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Sparkles, Coins, ArrowRight, Clock, CheckCircle2, Home, Building, Bus } from 'lucide-react';
import { Period, CustomDateRange } from '../types';

interface BudgetInputProps {
  amount: number;
  period: Period;
  customDateRange: CustomDateRange;
  isCiteUniversitaire: boolean;
  onAmountChange: (value: number) => void;
  onPeriodChange: (period: Period) => void;
  onCustomDateRangeChange: (range: CustomDateRange) => void;
  onCiteUniversitaireChange: (isCite: boolean) => void;
  onCalculate: () => void;
}

export const BudgetInput: React.FC<BudgetInputProps> = ({
  amount,
  period,
  customDateRange,
  isCiteUniversitaire,
  onAmountChange,
  onPeriodChange,
  onCustomDateRangeChange,
  onCiteUniversitaireChange,
  onCalculate,
}) => {
  const [inputValue, setInputValue] = useState<string>(amount > 0 ? amount.toString() : '');

  useEffect(() => {
    setInputValue(amount > 0 ? amount.toString() : '');
  }, [amount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(raw);
    const num = parseInt(raw, 10);
    onAmountChange(isNaN(num) ? 0 : num);
  };

  const handlePreset = (presetAmount: number) => {
    setInputValue(presetAmount.toString());
    onAmountChange(presetAmount);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate();
  };

  // Compute calculated duration for custom date range
  const startDate = new Date(customDateRange.startDate || '2026-09-15');
  const endDate = new Date(customDateRange.endDate || '2026-12-20');
  const diffTime = Math.max(0, endDate.getTime() - startDate.getTime());
  const calculatedDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const calculatedMonths = Math.max(0.2, Math.round((calculatedDays / 30) * 10) / 10);

  const formatFrDate = (d: Date) => {
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Trimester Presets for Academic Year 2026 - 2027
  const academicPresets = [
    {
      label: '🍂 1er Trimestre',
      sub: '15 Sept. 2026 ➔ 20 Déc. 2026',
      start: '2026-09-15',
      end: '2026-12-20',
      days: 96,
      months: 3.2,
    },
    {
      label: '❄️ 2ème Trimestre',
      sub: '05 Janv. 2027 ➔ 15 Avril 2027',
      start: '2027-01-05',
      end: '2027-04-15',
      days: 100,
      months: 3.3,
    },
    {
      label: '🌸 3ème Trimestre',
      sub: '20 Avril 2027 ➔ 30 Juin 2027',
      start: '2027-04-20',
      end: '2027-06-30',
      days: 71,
      months: 2.3,
    },
    {
      label: '🎓 Année 2026-2027',
      sub: '15 Sept. 2026 ➔ 30 Juin 2027',
      start: '2026-09-15',
      end: '2027-06-30',
      days: 288,
      months: 9.6,
    },
  ];

  // Presets of amounts depending on selected period
  const presetsMonth = [15000, 25000, 40000, 60000, 80000, 100000];
  const presetsYear = [135000, 225000, 360000, 500000, 720000, 900000];

  let activePresets = presetsMonth;
  if (period === 'year') {
    activePresets = presetsYear;
  } else if (period === 'custom') {
    activePresets = presetsMonth.map((m) => Math.round((m * calculatedMonths) / 500) * 500);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-amber-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        {/* Top Header & Period Switcher */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-600 shrink-0" />
              <span>Calculateur de Budget STADJAI</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Choisis la période d'études et entre ton montant total.
            </p>
          </div>

          {/* Period Toggle - 3 Buttons: Month, Academic Year 2026-2027, Custom Date Range */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => onPeriodChange('month')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                period === 'month'
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-md ring-1 ring-amber-400/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>📅 CE MOIS</span>
            </button>

            <button
              type="button"
              onClick={() => onPeriodChange('year')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                period === 'year'
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-md ring-1 ring-amber-400/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🗓️ L'ANNÉE (9 mois / 2026-2027)</span>
            </button>

            <button
              type="button"
              onClick={() => onPeriodChange('custom')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                period === 'custom'
                  ? 'bg-amber-500 text-slate-950 dark:bg-amber-500 dark:text-slate-950 shadow-md ring-2 ring-amber-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
              <span>📆 SUR MESURE</span>
            </button>
          </div>
        </div>

        {/* Mini Calendar / Custom Period Selector Panel */}
        {period === 'custom' && (
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/80 dark:border-amber-800/80">
              <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-serif font-bold text-sm">
                <CalendarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Mini Calendrier - Période Personnalisée 2026-2027</span>
              </div>
              <span className="text-3xs font-mono font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full self-start sm:self-auto">
                Année Universitaire 2026-2027
              </span>
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-2xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  📅 Date de Début :
                </label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  min="2026-08-01"
                  max="2027-08-31"
                  onChange={(e) =>
                    onCustomDateRangeChange({
                      ...customDateRange,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-2xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  🏁 Date de Fin :
                </label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  min="2026-08-01"
                  max="2027-08-31"
                  onChange={(e) =>
                    onCustomDateRangeChange({
                      ...customDateRange,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono shadow-xs"
                />
              </div>
            </div>

            {/* Quick Trimester Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-2xs font-bold text-amber-900 dark:text-amber-300 block">
                ⚡ Raccourcis de trimestres & semestres (2026-2027) :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {academicPresets.map((pr, i) => {
                  const isSelected =
                    customDateRange.startDate === pr.start && customDateRange.endDate === pr.end;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        onCustomDateRangeChange({
                          startDate: pr.start,
                          endDate: pr.end,
                          label: pr.label,
                        })
                      }
                      className={`p-2.5 rounded-xl text-xs text-left transition-all border flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 border-slate-900 dark:border-amber-400 font-bold shadow-md'
                          : 'bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-amber-200 dark:border-amber-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-2xs">{pr.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950 shrink-0" />}
                      </div>
                      <span className="text-3xs opacity-80 font-mono">{pr.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live summary display */}
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-3 border border-amber-300 dark:border-amber-700/60 flex items-start sm:items-center gap-3 text-xs text-slate-800 dark:text-slate-200">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div className="space-y-0.5">
                <p className="font-extrabold text-2xs text-amber-950 dark:text-amber-200">
                  Du {formatFrDate(startDate)} au {formatFrDate(endDate)}
                </p>
                <p className="text-3xs text-slate-600 dark:text-slate-400">
                  Durée exacte : <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">{calculatedDays} jours</strong> (équivalent à <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">{calculatedMonths.toString().replace('.', ',')} mois</strong> de budget d'études en 2026-2027).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logement & Cité Universitaire Selector */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 font-serif flex items-center gap-2">
              <Home className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Lieu de Résidence : Es-tu logé en Cité Universitaire ?</span>
            </label>
            <span className={`text-3xs font-black uppercase px-2.5 py-1 rounded-full ${
              isCiteUniversitaire
                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                : 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300'
            }`}>
              {isCiteUniversitaire ? '🏫 En Cité (0F Transport École)' : '🏙️ Hors Cité / En Ville (Transport N°1)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: NON - Hors Cité / En Ville */}
            <button
              type="button"
              onClick={() => onCiteUniversitaireChange(false)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                !isCiteUniversitaire
                  ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-cyan-950 dark:text-cyan-100 ring-2 ring-cyan-500/30 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${!isCiteUniversitaire ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Bus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black uppercase">Non (En Ville / Hors Cité)</span>
                  {!isCiteUniversitaire && <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />}
                </div>
                <p className="text-3xs text-slate-600 dark:text-slate-400 leading-snug">
                  <strong>1 000 FCFA / jour de cours</strong> (500F Aller / 500F Retour) = <strong>20 000 FCFA / mois</strong>. Le transport école est ta priorité N°1 pour assister aux amphis !
                </p>
              </div>
            </button>

            {/* Option 2: OUI - En Cité Universitaire */}
            <button
              type="button"
              onClick={() => onCiteUniversitaireChange(true)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                isCiteUniversitaire
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isCiteUniversitaire ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Building className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black uppercase">Oui (En Cité Universitaire)</span>
                  {isCiteUniversitaire && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                </div>
                <p className="text-3xs text-slate-600 dark:text-slate-400 leading-snug">
                  Logé directement sur le campus : <strong>0 FCFA de transport école</strong> (tu marches aux cours). Tes 20 000 F économisés profitent à la nourriture !
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Big Prominent Input Bar */}
        <div className="relative">
          <label htmlFor="budget-amount" className="block text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-2 font-serif">
            💰 Mon budget total :
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
              <Search className="w-6 h-6 text-amber-600" />
            </div>

            <input
              id="budget-amount"
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={
                period === 'month'
                  ? 'Ex: 25000'
                  : period === 'year'
                  ? 'Ex: 225000'
                  : `Ex: ${Math.round(25000 * calculatedMonths).toLocaleString('fr-FR')}`
              }
              className="w-full pl-12 pr-28 py-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-mono"
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 px-3 py-1.5 rounded-xl font-black text-sm sm:text-base border border-amber-300 dark:border-amber-800">
              F CFA
            </div>
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
            Raccourcis de montants ({period === 'year' ? '9 mois 2026-2027' : period === 'custom' ? `${calculatedMonths.toString().replace('.', ',')} mois sur mesure` : 'Ce Mois'}) :
          </span>
          <div className="flex flex-wrap gap-2">
            {activePresets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  amount === p
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                {p.toLocaleString('fr-FR')} F
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-3 text-base sm:text-lg group"
        >
          <span>Calculer la répartition & Recevoir les Conseils Bibliques</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

      </form>
    </div>
  );
};
