import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InstallAppButton } from './components/InstallAppButton';
import { BudgetInput } from './components/BudgetInput';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { PriorityCustomizer } from './components/PriorityCustomizer';
import { BiblicalWisdomCard } from './components/BiblicalWisdomCard';
import { AiStudentAdvisorChat } from './components/AiStudentAdvisorChat';
import { BudgetSimulator } from './components/BudgetSimulator';
import { ExpenseTracker } from './components/ExpenseTracker';
import { CampusGuide } from './components/CampusGuide';
import { BudgetExporter } from './components/BudgetExporter';
import { JeSuisFaucheModal } from './components/JeSuisFaucheModal';
import { AcademicCalendar } from './components/AcademicCalendar';

import { Period, MainCategoryId, EnabledCategories, SelectedMeals, CustomCategory, CustomDateRange, FrequencyType } from './types';
import { calculateBudget } from './utils/calculator';
import { BookOpen, Notebook, Compass, AlertCircle, HeartHandshake, ShieldCheck, Calendar as CalendarIcon, Bot, Lightbulb } from 'lucide-react';

export default function App() {
  // Persistence in localStorage
  const [period, setPeriod] = useState<Period>(() => {
    const saved = localStorage.getItem('stadjai_period');
    return (saved as Period) || 'month';
  });

  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>(() => {
    const saved = localStorage.getItem('stadjai_custom_daterange');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      startDate: '2026-09-15',
      endDate: '2026-12-20',
      label: '1er Trimestre 2026',
    };
  });

  const [amount, setAmount] = useState<number>(() => {
    const saved = localStorage.getItem('stadjai_amount');
    if (!saved || saved === '25000') return 0;
    const parsed = parseInt(saved, 10);
    return isNaN(parsed) ? 0 : parsed;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('stadjai_dark');
    return saved === 'true';
  });

  // Custom user categories
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => {
    const saved = localStorage.getItem('stadjai_custom_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [priorityOrder, setPriorityOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('stadjai_priority_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          if (!parsed.includes('transport_school')) {
            return ['transport_school', ...parsed];
          }
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return ['transport_school', 'cantine', 'food', 'transport', 'papotte'];
  });

  // State for enabled categories
  const [enabledCategories, setEnabledCategories] = useState<EnabledCategories>(() => {
    const saved = localStorage.getItem('stadjai_enabled_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.transport_school === undefined) {
          parsed.transport_school = true;
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return { transport_school: true, cantine: true, food: true, transport: true, papotte: true };
  });

  // State for selected meals in cantine
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeals>(() => {
    const saved = localStorage.getItem('stadjai_selected_meals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return { matin: true, midi: true, soir: true };
  });

  // State for Cité Universitaire residence
  const [isCiteUniversitaire, setIsCiteUniversitaire] = useState<boolean>(() => {
    const saved = localStorage.getItem('stadjai_is_cite');
    return saved === 'true'; // default false (living in town/hors cité)
  });

  const [isFaucheModalOpen, setIsFaucheModalOpen] = useState<boolean>(false);

  const [customModifiers, setCustomModifiers] = useState<{
    cantineSouchesPerMonth: number;
    foodDaily: number;
    transportTripsPerMonth: number;
    papotteMonthly: number;
  } | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<'calculator' | 'advisor' | 'calendar' | 'tracker' | 'guide'>('calculator');

  // Dark Mode side effect
  useEffect(() => {
    localStorage.setItem('stadjai_dark', darkMode ? 'true' : 'false');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Amount & Period & Persistence
  useEffect(() => {
    localStorage.setItem('stadjai_amount', amount.toString());
  }, [amount]);

  useEffect(() => {
    localStorage.setItem('stadjai_period', period);
  }, [period]);

  useEffect(() => {
    localStorage.setItem('stadjai_custom_daterange', JSON.stringify(customDateRange));
  }, [customDateRange]);

  useEffect(() => {
    localStorage.setItem('stadjai_custom_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem('stadjai_priority_order', JSON.stringify(priorityOrder));
  }, [priorityOrder]);

  useEffect(() => {
    localStorage.setItem('stadjai_enabled_categories', JSON.stringify(enabledCategories));
  }, [enabledCategories]);

  useEffect(() => {
    localStorage.setItem('stadjai_selected_meals', JSON.stringify(selectedMeals));
  }, [selectedMeals]);

  useEffect(() => {
    localStorage.setItem('stadjai_is_cite', isCiteUniversitaire ? 'true' : 'false');
  }, [isCiteUniversitaire]);

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    setCustomModifiers(undefined);
    if (newPeriod === 'year' && amount < 100000) {
      setAmount(225000); // 225 000 F pour 9 mois (25k/mois)
    } else if (newPeriod === 'month' && amount > 150000) {
      setAmount(25000);
    }
  };

  const handleReset = () => {
    setCustomModifiers(undefined);
    setAmount(25000);
    setPeriod('month');
    setPriorityOrder(['transport', 'cantine', 'food', 'papotte']);
    setEnabledCategories({ transport: true, cantine: true, food: true, papotte: true });
    setSelectedMeals({ matin: true, midi: true, soir: true });
  };

  const handleAutoMode = () => {
    setCustomModifiers(undefined);
  };

  const handleAddCustomCategory = (category: {
    name: string;
    emoji: string;
    description?: string;
    unitPrice?: number;
    frequencyType?: FrequencyType;
    frequencyValue?: number;
    monthlyCost?: number;
  }) => {
    // Calculate monthly cost if unitPrice & frequency provided
    let computedMonthlyCost = category.monthlyCost || 0;
    if (category.unitPrice && category.unitPrice > 0 && category.frequencyType) {
      const uPrice = category.unitPrice;
      const fVal = category.frequencyValue || 1;
      if (category.frequencyType === 'school_days') {
        computedMonthlyCost = uPrice * fVal * 20; // 20 jours de cours par mois
      } else if (category.frequencyType === 'daily') {
        computedMonthlyCost = uPrice * fVal * 30; // 30 jours par mois
      } else if (category.frequencyType === 'weekly') {
        computedMonthlyCost = uPrice * fVal * 4; // 4 semaines par mois
      } else if (category.frequencyType === 'monthly') {
        computedMonthlyCost = uPrice * fVal; // X fois par mois
      }
    }

    const newCat: CustomCategory = {
      id: `custom_${Date.now()}`,
      name: category.name,
      emoji: category.emoji,
      description: category.description,
      unitPrice: category.unitPrice,
      frequencyType: category.frequencyType,
      frequencyValue: category.frequencyValue,
      monthlyCost: computedMonthlyCost,
      enabled: true,
    };

    setCustomCategories((prev) => [...prev, newCat]);
    setPriorityOrder((prev) => [...prev, newCat.id]);
    setEnabledCategories((prev) => ({
      ...prev,
      [newCat.id]: true,
    }));
  };

  const handleDeleteCustomCategory = (id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    setPriorityOrder((prev) => prev.filter((catId) => catId !== id));
    setEnabledCategories((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleToggleCategory = (catId: string) => {
    setEnabledCategories((prev) => ({
      ...prev,
      [catId]: prev[catId] !== undefined ? !prev[catId] : false,
    }));
  };

  const handleToggleMeal = (meal: 'matin' | 'midi' | 'soir') => {
    setSelectedMeals((prev) => ({
      ...prev,
      [meal]: !prev[meal],
    }));
  };

  const calculationResult = useMemo(() => {
    return calculateBudget(amount, period, customModifiers, priorityOrder, enabledCategories, selectedMeals, customCategories, customDateRange, isCiteUniversitaire);
  }, [amount, period, customModifiers, priorityOrder, enabledCategories, selectedMeals, customCategories, customDateRange, isCiteUniversitaire]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between transition-colors duration-300">
      
      {/* App Header */}
      <div>
        <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />

        {/* Main Workspace Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          
          {/* PWA Mobile Installation Banner */}
          <InstallAppButton variant="banner" />

          {/* Navigation Bar / Mode Tabs */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-950" />
              <span>Calculateur STADJAI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-amber-500 dark:text-amber-950" />
              <span>Calendrier Académique (2026-2027)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'tracker'
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Notebook className="w-4 h-4 text-emerald-500 dark:text-emerald-950" />
              <span>Journal des Dépenses</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'guide'
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-500 dark:text-blue-950" />
              <span>Guide du Campus Bondoukou</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'advisor'
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-md ring-2 ring-amber-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>🤖 Conseiller IA STADJAI</span>
            </button>
          </div>

          {/* TAB 1: CALCULATOR & BIBLICAL WISDOM */}
          {activeTab === 'calculator' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Input Bar Section */}
              <BudgetInput
                amount={amount}
                period={period}
                customDateRange={customDateRange}
                isCiteUniversitaire={isCiteUniversitaire}
                onAmountChange={setAmount}
                onPeriodChange={handlePeriodChange}
                onCustomDateRangeChange={setCustomDateRange}
                onCiteUniversitaireChange={setIsCiteUniversitaire}
                onCalculate={() => setCustomModifiers(undefined)}
              />

              {/* Category Breakdown Cards with Category & Meal Deselection */}
              <CategoryBreakdown
                categories={calculationResult.categories}
                totalBudget={calculationResult.totalBudget}
                allocatedTotal={calculationResult.allocatedTotal}
                remainingAmount={calculationResult.remainingAmount}
                period={calculationResult.period}
                periodLabel={calculationResult.periodLabel}
                status={calculationResult.status}
                enabledCategories={enabledCategories}
                selectedMeals={selectedMeals}
                customCategories={customCategories}
                priorityCustomizer={
                  <PriorityCustomizer
                    priorityOrder={priorityOrder}
                    onPriorityOrderChange={setPriorityOrder}
                    enabledCategories={enabledCategories}
                    customCategories={customCategories}
                    onAddCustomCategory={handleAddCustomCategory}
                    onDeleteCustomCategory={handleDeleteCustomCategory}
                  />
                }
                onToggleCategory={handleToggleCategory}
                onToggleMeal={handleToggleMeal}
                onAddCustomCategory={handleAddCustomCategory}
                onDeleteCustomCategory={handleDeleteCustomCategory}
              />

              {/* Main Biblical Wisdom Advice Box for Global Budget */}
              <BiblicalWisdomCard
                wisdom={calculationResult.wisdom}
                totalBudget={calculationResult.totalBudget}
                period={calculationResult.period}
                categories={calculationResult.categories}
                remainingAmount={calculationResult.remainingAmount}
              />

              {/* Custom Simulator & Food Slider with Red Warning Alert */}
              <BudgetSimulator
                totalBudget={calculationResult.totalBudget}
                period={calculationResult.period}
                customCategories={customCategories}
                onApplyCustomModifiers={setCustomModifiers}
                onReset={handleReset}
                onAutoMode={handleAutoMode}
              />

              {/* Prominent Red Button */}
              <div className="bg-red-900/10 dark:bg-red-950/40 p-6 rounded-3xl border-2 border-red-500/80 shadow-lg text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-400 font-extrabold text-sm uppercase tracking-wider">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>Besoin d'urgence financière ?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFaucheModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-base sm:text-lg font-black uppercase tracking-wide shadow-xl shadow-red-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 mx-auto"
                >
                  <span>📢 Je suis fauché, que dois-je faire aujourd'hui ?</span>
                </button>
              </div>

              {/* Exporter / Download Report */}
              <BudgetExporter calculation={calculationResult} />

              {/* Interactive AI Chatbot Advisor (IA STADJAI) */}
              <AiStudentAdvisorChat calculationResult={calculationResult} />

            </div>
          )}

          {/* TAB 2: ACADEMIC CALENDAR (SEPT 2026 - JULY 2027) */}
          {activeTab === 'calendar' && (
            <div className="animate-fadeIn">
              <AcademicCalendar calculationResult={calculationResult} />
            </div>
          )}

          {/* TAB 3: EXPENSE LOGBOOK */}
          {activeTab === 'tracker' && (
            <div className="animate-fadeIn">
              <ExpenseTracker totalBudget={amount} />
            </div>
          )}

          {/* TAB 4: BONDOUKOU CAMPUS HACKS */}
          {activeTab === 'guide' && (
            <div className="animate-fadeIn">
              <CampusGuide />
            </div>
          )}

          {/* TAB 5: AI ADVISOR */}
          {activeTab === 'advisor' && (
            <div className="animate-fadeIn space-y-8">
              <BiblicalWisdomCard
                wisdom={calculationResult.wisdom}
                totalBudget={calculationResult.totalBudget}
                period={calculationResult.period}
                categories={calculationResult.categories}
                remainingAmount={calculationResult.remainingAmount}
              />
              <AiStudentAdvisorChat calculationResult={calculationResult} />
            </div>
          )}

        </main>
      </div>

      {/* Emergency Modal */}
      <JeSuisFaucheModal
        isOpen={isFaucheModalOpen}
        onClose={() => setIsFaucheModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-12 py-8 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-200 font-serif font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <span>STANEL © 2026 - Université de Bondoukou</span>
          </div>
          <p className="text-amber-400 font-bold text-sm">
            « Gère ton argent comme un sage »
          </p>
          <div className="flex items-center justify-center gap-1.5 text-slate-300 font-medium">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Que Dieu bénisse tes finances</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
