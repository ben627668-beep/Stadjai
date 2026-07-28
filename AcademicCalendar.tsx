import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Coffee,
  Sun,
  Moon,
  Bus,
  Sparkles,
  Utensils,
  CheckSquare,
  Square,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { BudgetCalculationResult, MainCategoryId, EnabledCategories, SelectedMeals } from '../types';

interface AcademicCalendarProps {
  calculationResult: BudgetCalculationResult;
}

interface DailyRecord {
  dateStr: string; // YYYY-MM-DD
  plannedAmount: number;
  actualAmount?: number;
  status?: 'followed' | 'overspent' | 'saved' | 'pending';
  note?: string;
}

const MONTHS_ACADEMIC = [
  { name: 'Septembre 2026', year: 2026, monthIndex: 8 }, // 0-indexed month 8 = Sept
  { name: 'Octobre 2026', year: 2026, monthIndex: 9 },
  { name: 'Novembre 2026', year: 2026, monthIndex: 10 },
  { name: 'Décembre 2026', year: 2026, monthIndex: 11 },
  { name: 'Janvier 2027', year: 2027, monthIndex: 0 },
  { name: 'Février 2027', year: 2027, monthIndex: 1 },
  { name: 'Mars 2027', year: 2027, monthIndex: 2 },
  { name: 'Avril 2027', year: 2027, monthIndex: 3 },
  { name: 'Mai 2027', year: 2027, monthIndex: 4 },
  { name: 'Juin 2027', year: 2027, monthIndex: 5 },
  { name: 'Juillet 2027', year: 2027, monthIndex: 6 },
];

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ calculationResult }) => {
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0);
  const currentMonthConfig = MONTHS_ACADEMIC[selectedMonthIdx];

  // Selected date inside current month
  const [selectedDay, setSelectedDay] = useState<number>(14); // Default to Sept 14, 2026

  // Local state for daily spending records (persisted in localStorage)
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>(() => {
    const saved = localStorage.getItem('stadjai_daily_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  // Day-level active categories filter
  const [dayCategoryFilter, setDayCategoryFilter] = useState<EnabledCategories>({
    transport: true,
    cantine: true,
    food: true,
    papotte: true,
  });

  // Custom daily budget input state for selected day
  const [customDailyInput, setCustomDailyInput] = useState<number>(800);

  // Yesterday follow-up popup state
  const [yesterdayPromptOpen, setYesterdayPromptOpen] = useState<boolean>(false);
  const [yesterdayCustomSpent, setYesterdayCustomSpent] = useState<string>('');
  const [yesterdayDateStr, setYesterdayDateStr] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('stadjai_daily_records', JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  // Format YYYY-MM-DD
  const getDateStr = (year: number, monthIndex: number, day: number) => {
    const m = (monthIndex + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const selectedDateStr = getDateStr(
    currentMonthConfig.year,
    currentMonthConfig.monthIndex,
    selectedDay
  );

  // Compute Base Planned Daily Budget for current month
  const baseMonthlyBudget = calculationResult.totalBudget / calculationResult.monthsCount;
  
  // Sum up spent or overspent amounts in the current month to calculate dynamically adjusted remaining daily allowance
  const monthRecords = useMemo(() => {
    const prefix = `${currentMonthConfig.year}-${(currentMonthConfig.monthIndex + 1).toString().padStart(2, '0')}`;
    let totalActualSpent = 0;
    let daysLogged = 0;

    Object.entries(dailyRecords).forEach(([dateKey, rawRecord]) => {
      const record = rawRecord as DailyRecord;
      if (dateKey.startsWith(prefix) && record.actualAmount !== undefined) {
        totalActualSpent += record.actualAmount;
        daysLogged++;
      }
    });

    const daysInMonth = new Date(currentMonthConfig.year, currentMonthConfig.monthIndex + 1, 0).getDate();
    const remainingDaysInMonth = Math.max(1, daysInMonth - daysLogged);
    const allocatableRemainingInMonth = Math.max(0, baseMonthlyBudget - totalActualSpent);
    const adjustedDailyAllowance = Math.round((allocatableRemainingInMonth / remainingDaysInMonth) / 50) * 50;

    return {
      daysInMonth,
      totalActualSpent,
      daysLogged,
      remainingDaysInMonth,
      adjustedDailyAllowance,
    };
  }, [dailyRecords, currentMonthConfig, baseMonthlyBudget]);

  // Sync custom daily input when selected day or adjusted allowance changes
  useEffect(() => {
    const existingRec = dailyRecords[selectedDateStr];
    if (existingRec && existingRec.actualAmount !== undefined) {
      setCustomDailyInput(existingRec.actualAmount);
    } else {
      setCustomDailyInput(monthRecords.adjustedDailyAllowance || 800);
    }
  }, [selectedDateStr, monthRecords.adjustedDailyAllowance, dailyRecords]);

  // Compute category breakdown for the selected day
  const dailyCategoryBreakdown = useMemo(() => {
    const dailyBudget = monthRecords.adjustedDailyAllowance;

    // Daily breakdown ratio
    const cantineDaily = dayCategoryFilter.cantine && calculationResult.enabledCategories.cantine ? 500 : 0; // 100F + 200F + 200F
    const transportDaily = dayCategoryFilter.transport && calculationResult.enabledCategories.transport ? 150 : 0;
    const papotteDaily = dayCategoryFilter.papotte && calculationResult.enabledCategories.papotte ? 100 : 0;
    
    const fixedDaily = cantineDaily + transportDaily + papotteDaily;
    const foodDaily = dayCategoryFilter.food && calculationResult.enabledCategories.food
      ? Math.max(0, dailyBudget - fixedDaily)
      : 0;

    const totalPlannedDay = cantineDaily + transportDaily + papotteDaily + foodDaily;

    return {
      cantineDaily,
      transportDaily,
      papotteDaily,
      foodDaily,
      totalPlannedDay,
    };
  }, [monthRecords.adjustedDailyAllowance, dayCategoryFilter, calculationResult.enabledCategories]);

  // Check if yesterday exists and needs confirmation (only on 2nd time or subsequent visits)
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('stadjai_has_visited_calendar') === 'true';

    if (!hasVisitedBefore) {
      // First time entering the calendar section: mark as visited and do NOT show modal prompt
      localStorage.setItem('stadjai_has_visited_calendar', 'true');
      return;
    }

    // Starting from 2nd visit onwards, check if yesterday was logged
    if (selectedDay > 1) {
      const prevDay = selectedDay - 1;
      const prevDateStr = getDateStr(currentMonthConfig.year, currentMonthConfig.monthIndex, prevDay);
      if (!dailyRecords[prevDateStr]) {
        setYesterdayDateStr(prevDateStr);
        setYesterdayPromptOpen(true);
      }
    }
  }, [selectedDay, selectedMonthIdx]);

  const handleConfirmYesterdayFollowed = () => {
    if (!yesterdayDateStr) return;
    setDailyRecords((prev) => ({
      ...prev,
      [yesterdayDateStr]: {
        dateStr: yesterdayDateStr,
        plannedAmount: monthRecords.adjustedDailyAllowance,
        actualAmount: monthRecords.adjustedDailyAllowance,
        status: 'followed',
      },
    }));
    setYesterdayPromptOpen(false);
  };

  const handleConfirmYesterdayCustom = () => {
    if (!yesterdayDateStr) return;
    const spent = parseInt(yesterdayCustomSpent, 10) || 0;
    const planned = monthRecords.adjustedDailyAllowance;
    let status: 'followed' | 'overspent' | 'saved' = 'followed';
    if (spent > planned) status = 'overspent';
    if (spent < planned) status = 'saved';

    setDailyRecords((prev) => ({
      ...prev,
      [yesterdayDateStr]: {
        dateStr: yesterdayDateStr,
        plannedAmount: planned,
        actualAmount: spent,
        status: status,
      },
    }));
    setYesterdayPromptOpen(false);
    setYesterdayCustomSpent('');
  };

  const handleRecordTodaySpent = (spent: number) => {
    const planned = dailyCategoryBreakdown.totalPlannedDay;
    let status: 'followed' | 'overspent' | 'saved' = 'followed';
    if (spent > planned) status = 'overspent';
    if (spent < planned) status = 'saved';

    setDailyRecords((prev) => ({
      ...prev,
      [selectedDateStr]: {
        dateStr: selectedDateStr,
        plannedAmount: planned,
        actualAmount: spent,
        status: status,
      },
    }));
  };

  const handleUnconfirmDay = (dateStr: string) => {
    setDailyRecords((prev) => {
      const newRecords = { ...prev };
      delete newRecords[dateStr];
      return newRecords;
    });
  };

  const handleResetMonthConfirmations = () => {
    const prefix = `${currentMonthConfig.year}-${(currentMonthConfig.monthIndex + 1).toString().padStart(2, '0')}`;
    setDailyRecords((prev) => {
      const newRecords = { ...prev };
      Object.keys(newRecords).forEach((key) => {
        if (key.startsWith(prefix)) {
          delete newRecords[key];
        }
      });
      return newRecords;
    });
  };

  // Build Calendar grid cells
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentMonthConfig.year, currentMonthConfig.monthIndex, 1).getDay();
    // In JS getDay(): 0 = Sun, 1 = Mon... We want Mon = 0
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const cells = [];
    for (let i = 0; i < offset; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= monthRecords.daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  }, [currentMonthConfig, monthRecords.daysInMonth]);

  const toggleDayCategory = (catId: MainCategoryId) => {
    setDayCategoryFilter((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Academic Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
            <CalendarIcon className="w-4 h-4 text-amber-400" />
            <span>CALENDRIER ACADÉMIQUE STADJAI 2026 - 2027</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
            Suivi & Planification Quotidienne par Jour
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Clique sur n'importe quel jour du mois pour voir ton plan de dépenses. L'application ajuste automatiquement le budget des jours suivants si tu dépenses plus ou moins !
          </p>
        </div>

        {/* Month Selector Tabs Dropdown */}
        <div className="flex items-center gap-2 bg-slate-800/90 p-2 rounded-2xl border border-slate-700/80 w-full md:w-auto justify-between">
          <button
            type="button"
            disabled={selectedMonthIdx === 0}
            onClick={() => {
              setSelectedMonthIdx((prev) => prev - 1);
              setSelectedDay(1);
            }}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <span className="text-sm font-black font-serif text-amber-400 px-4">
            {currentMonthConfig.name}
          </span>

          <button
            type="button"
            disabled={selectedMonthIdx === MONTHS_ACADEMIC.length - 1}
            onClick={() => {
              setSelectedMonthIdx((prev) => prev + 1);
              setSelectedDay(1);
            }}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar View on Left (2 cols), Selected Day View on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLS: CALENDAR MONTH GRID */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Mois de {currentMonthConfig.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajustement dynamique : <strong className="text-amber-600 dark:text-amber-400">{monthRecords.adjustedDailyAllowance.toLocaleString('fr-FR')} F / jour</strong> disponible pour les jours restants.
              </p>
            </div>

            <div className="flex items-center gap-2 text-2xs font-bold">
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Suivi</span>
              <span className="flex items-center gap-1 text-red-500"><AlertCircle className="w-3.5 h-3.5" /> Dépassement</span>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-400 uppercase tracking-wider">
            {DAYS_OF_WEEK.map((dayName) => (
              <div key={dayName} className="py-2">{dayName}</div>
            ))}
          </div>

          {/* Calendar Day Buttons */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20" />;
              }

              const dayDateStr = getDateStr(currentMonthConfig.year, currentMonthConfig.monthIndex, dayNum);
              const rec = dailyRecords[dayDateStr];
              const isSelected = selectedDay === dayNum;

              let statusBg = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-500';
              if (isSelected) {
                statusBg = 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 border-slate-900 dark:border-amber-400 shadow-lg scale-105';
              } else if (rec?.status === 'followed') {
                statusBg = 'bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200';
              } else if (rec?.status === 'overspent') {
                statusBg = 'bg-red-100/80 dark:bg-red-950/60 border-red-400 text-red-900 dark:text-red-200';
              } else if (rec?.status === 'saved') {
                statusBg = 'bg-blue-100/80 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-200';
              }

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-16 rounded-2xl p-2 border flex flex-col justify-between items-center transition-all ${statusBg}`}
                >
                  <span className={`text-sm font-extrabold ${isSelected ? 'font-black' : ''}`}>
                    {dayNum}
                  </span>

                  {rec ? (
                    <span className="text-3xs font-mono font-bold px-1 rounded bg-black/10 dark:bg-white/10">
                      {rec.actualAmount?.toLocaleString('fr-FR')}F
                    </span>
                  ) : (
                    <span className="text-3xs font-mono opacity-60">
                      {monthRecords.adjustedDailyAllowance}F
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Month Stats Box */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-bold uppercase text-2xs">Total Dépensé Ce Mois</span>
              <span className="text-base font-black font-mono text-slate-900 dark:text-amber-400">
                {monthRecords.totalActualSpent.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase text-2xs">Jours Confirmés</span>
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                {monthRecords.daysLogged} / {monthRecords.daysInMonth} jours
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase text-2xs">Reste Pour le Mois</span>
              <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
                {Math.max(0, baseMonthlyBudget - monthRecords.totalActualSpent).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            {monthRecords.daysLogged > 0 && (
              <button
                type="button"
                onClick={handleResetMonthConfirmations}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/80 dark:hover:bg-red-900 dark:text-red-300 rounded-xl text-2xs font-extrabold transition-all border border-red-300 dark:border-red-800 flex items-center gap-1 shrink-0"
                title="Effacer toutes les confirmations de ce mois"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser le mois</span>
              </button>
            )}
          </div>

        </div>

        {/* RIGHT 1 COL: DAY EXPENSE DETAILS & SELECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 flex flex-col justify-between">
          
          <div className="space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                🗓️ PLAN DE DÉPENSES DU JOUR
              </span>
              <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mt-1">
                {selectedDay} {currentMonthConfig.name}
              </h3>
            </div>

            {/* Custom Day Budget Decider Box */}
            <div className="bg-amber-500/10 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-400 dark:border-amber-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>🎯 Choisis ton budget pour ce jour :</span>
                </span>
                <span className="font-mono text-sm font-black bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded text-amber-950 dark:text-amber-100">
                  {customDailyInput.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={50}
                  value={customDailyInput}
                  onChange={(e) => setCustomDailyInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-amber-600"
                />

                <div className="flex flex-wrap gap-1.5 justify-between">
                  {[500, 800, 1000, 1500, 2000].map((presetVal) => (
                    <button
                      key={presetVal}
                      type="button"
                      onClick={() => setCustomDailyInput(presetVal)}
                      className={`px-2 py-1 rounded-lg text-3xs font-extrabold border transition-all ${
                        customDailyInput === presetVal
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      {presetVal} F
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleRecordTodaySpent(customDailyInput)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {dailyRecords[selectedDateStr]
                      ? `Modifier à ${customDailyInput.toLocaleString('fr-FR')} F pour le ${selectedDay}`
                      : `Fixer ${customDailyInput.toLocaleString('fr-FR')} F pour le ${selectedDay} (Réajuster le mois)`}
                  </span>
                </button>

                {dailyRecords[selectedDateStr] && (
                  <button
                    type="button"
                    onClick={() => handleUnconfirmDay(selectedDateStr)}
                    className="w-full py-2 bg-red-100 hover:bg-red-200 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-700 dark:text-red-300 font-extrabold text-xs rounded-xl transition-all border border-red-300 dark:border-red-800 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Désélectionner / Annuler la confirmation du {selectedDay}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Toggles for this specific Day */}
            <div className="space-y-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block">
                ☑️ Catégories incluses pour ce jour :
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleDayCategory('cantine')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-2xs font-bold transition-all ${
                    dayCategoryFilter.cantine ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 line-through'
                  }`}
                >
                  {dayCategoryFilter.cantine ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>🍛 Cantine CROU-B</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleDayCategory('food')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-2xs font-bold transition-all ${
                    dayCategoryFilter.food ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 line-through'
                  }`}
                >
                  {dayCategoryFilter.food ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>🥐 Vie Étudiante</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleDayCategory('transport')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-2xs font-bold transition-all ${
                    dayCategoryFilter.transport ? 'bg-blue-500 text-white border-blue-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 line-through'
                  }`}
                >
                  {dayCategoryFilter.transport ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>Mosquée/Église</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleDayCategory('papotte')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-2xs font-bold transition-all ${
                    dayCategoryFilter.papotte ? 'bg-purple-500 text-white border-purple-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 line-through'
                  }`}
                >
                  {dayCategoryFilter.papotte ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>🧼 Papotte</span>
                </button>
              </div>
            </div>

            {/* Detail Breakdown for the Selected Day */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-baseline border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-2xs font-extrabold uppercase text-slate-500">Plafond Calculé</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-amber-400">
                  {dailyCategoryBreakdown.totalPlannedDay.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {dayCategoryFilter.cantine && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-emerald-600" />
                        <span>Cantine CROU-B (Tickets & Souches)</span>
                      </span>
                      <strong className="font-mono">{dailyCategoryBreakdown.cantineDaily} F</strong>
                    </div>
                    <div className="text-3xs text-emerald-800 dark:text-emerald-200 space-y-0.5 leading-relaxed">
                      <p>• ☕ <strong>Petit-Déjeuner :</strong> 1 ticket de 100 F (souche 1000F)</p>
                      <p>• ☀️ <strong>Déjeuner :</strong> 1 ticket de 200 F (souche 2000F)</p>
                      <p>• 🌙 <strong>Dîner :</strong> 1 ticket de 200 F (souche 2000F)</p>
                      <p className="font-extrabold text-emerald-950 dark:text-emerald-100 pt-1">
                        🎫 Total : 3 tickets par jour (500 F) | 3 Souches par mois (5 000 F).
                      </p>
                    </div>
                  </div>
                )}

                {dayCategoryFilter.food && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Coffee className="w-4 h-4 text-amber-600" />
                        <span>Vie Étudiante & Boulangerie</span>
                      </span>
                      <strong className="font-mono">{dailyCategoryBreakdown.foodDaily} F</strong>
                    </div>
                    <div className="text-3xs text-amber-800 dark:text-amber-200 space-y-0.5 leading-relaxed">
                      <p>• 🍲 <strong>Restauration :</strong> Plats chauds (Garba, Riz, Maquis) à partir de <strong>500 FCFA</strong> le plat.</p>
                      <p>• 🥖 <strong>Boulangerie :</strong> Pains chauds à partir de <strong>100 FCFA</strong> jusqu'à monter, gâteaux et viennoiseries.</p>
                    </div>
                  </div>
                )}

                {dayCategoryFilter.transport && (
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Transport (Mosquée/Église)</span>
                    </span>
                    <strong className="font-mono">{dailyCategoryBreakdown.transportDaily} F</strong>
                  </div>
                )}

                {dayCategoryFilter.papotte && (
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Papotte (Hygiène du jour)</span>
                    </span>
                    <strong className="font-mono">{dailyCategoryBreakdown.papotteDaily} F</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Record Action Buttons for Selected Day */}
            <div className="space-y-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block">
                ✍️ Valider mes dépenses réelles du jour :
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRecordTodaySpent(dailyCategoryBreakdown.totalPlannedDay)}
                  className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Respecté ({dailyCategoryBreakdown.totalPlannedDay}F)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecordTodaySpent(dailyCategoryBreakdown.totalPlannedDay + 300)}
                  className="px-3 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Dépassé (+300F)</span>
                </button>
              </div>
            </div>

          </div>

          {/* Status Box for Selected Day */}
          {dailyRecords[selectedDateStr] && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-medium space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Jour confirmé le {selectedDateStr}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleUnconfirmDay(selectedDateStr)}
                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-2xs font-extrabold transition-all border border-red-300 dark:border-red-800 flex items-center gap-1 shrink-0"
                  title="Désélectionner / Annuler la confirmation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Désélectionner</span>
                </button>
              </div>
              <p className="text-2xs leading-relaxed">
                Dépense enregistrée : <strong>{dailyRecords[selectedDateStr].actualAmount?.toLocaleString('fr-FR')} FCFA</strong>. Le reste du mois est automatiquement recalculé et synchronisé.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* YESTERDAY FOLLOW-UP PROMPT MODAL / CARD */}
      {yesterdayPromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-amber-500 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/80 rounded-2xl border border-amber-300 dark:border-amber-700 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black font-serif text-slate-900 dark:text-white">
                Bilan du jour précédent
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                As-tu suivi à la lettre tes dépenses d'hier (<strong>{yesterdayDateStr}</strong>) d'un montant prévu de <strong className="text-amber-600 dark:text-amber-400">{monthRecords.adjustedDailyAllowance} FCFA</strong> ?
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleConfirmYesterdayFollowed}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-extrabold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Oui, exactement suivi ({monthRecords.adjustedDailyAllowance} FCFA) !</span>
              </button>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-500 block text-center">
                  Non, j'ai dépensé un autre montant :
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Montant réel dépensé (ex: 1200)"
                    value={yesterdayCustomSpent}
                    onChange={(e) => setYesterdayCustomSpent(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmYesterdayCustom}
                    className="px-4 py-2 bg-slate-900 text-amber-400 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
                  >
                    Valider
                  </button>
                </div>
              </div>
            </div>

            <p className="text-2xs text-slate-400 text-center italic">
              Cette mise à jour permettra d'ajuster l'argent exact qu'il te reste pour les jours suivants.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
