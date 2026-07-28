import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Check, Sparkles, AlertCircle, Info, Utensils, Coffee, Bus, Wand2 } from 'lucide-react';
import { Period, MainCategoryId, CustomCategory } from '../types';

interface BudgetSimulatorProps {
  totalBudget: number;
  period: Period;
  customCategories?: CustomCategory[];
  onApplyCustomModifiers: (modifiers: {
    cantineSouchesPerMonth: number;
    foodDaily: number;
    transportTripsPerMonth: number;
    papotteMonthly: number;
    customMonthlyCosts?: Record<string, number>;
  }) => void;
  onReset: () => void;
  onAutoMode: () => void;
}

export const BudgetSimulator: React.FC<BudgetSimulatorProps> = ({
  totalBudget,
  period,
  customCategories = [],
  onApplyCustomModifiers,
  onReset,
  onAutoMode,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const monthsCount = period === 'year' ? 9 : 1;
  const monthlyBudget = totalBudget / monthsCount;

  // Standard Category amounts state (starts at 0 FCFA as requested by user)
  const [transportMonthly, setTransportMonthly] = useState<number>(0);
  const [cantineMonthly, setCantineMonthly] = useState<number>(0);
  const [foodDaily, setFoodDaily] = useState<number>(0);
  const [papotteMonthly, setPapotteMonthly] = useState<number>(0);

  // Custom Categories amounts state (Record<id, monthlyCost>)
  const [customMonthlyCosts, setCustomMonthlyCosts] = useState<Record<string, number>>({});

  // Sync customCategories with local state when new categories are created
  useEffect(() => {
    if (customCategories && customCategories.length > 0) {
      setCustomMonthlyCosts((prev) => {
        const next = { ...prev };
        customCategories.forEach((cc) => {
          if (next[cc.id] === undefined) {
            next[cc.id] = cc.monthlyCost || 0;
          }
        });
        return next;
      });
    }
  }, [customCategories]);

  // Track manual locks if user explicitly locks a category
  const [lockedCategories, setLockedCategories] = useState<Record<string, boolean>>({
    transport: false,
    cantine: false,
    food: false,
    papotte: false,
  });

  // Totals calculation
  const foodTotalMonthly = foodDaily * 30;
  const customTotalMonthly = Object.entries(customMonthlyCosts).reduce((sum, [catId, amount]) => {
    // Only include if custom category exists in current list
    const exists = customCategories.some((c) => c.id === catId);
    const numAmount = typeof amount === 'number' ? amount : 0;
    return exists ? sum + numAmount : sum;
  }, 0);

  const currentTotalMonthly = transportMonthly + cantineMonthly + foodTotalMonthly + papotteMonthly + customTotalMonthly;
  const currentTotalAllocated = currentTotalMonthly * monthsCount;

  const deficitAmountTotal = currentTotalAllocated - totalBudget;
  const deficitAmountMonthly = currentTotalMonthly - monthlyBudget;
  const isExceeded = deficitAmountTotal > 0;

  // Manual change handler marking category as modified
  const handleCategoryChange = (catId: MainCategoryId, value: number) => {
    setLockedCategories((prev) => ({ ...prev, [catId]: value > 0 }));
    if (catId === 'transport') setTransportMonthly(value);
    if (catId === 'cantine') setCantineMonthly(value);
    if (catId === 'food') setFoodDaily(value);
    if (catId === 'papotte') setPapotteMonthly(value);
  };

  const handleCustomCategoryChange = (catId: string, value: number) => {
    setLockedCategories((prev) => ({ ...prev, [catId]: value > 0 }));
    setCustomMonthlyCosts((prev) => ({
      ...prev,
      [catId]: Math.max(0, value),
    }));
  };

  // SMART AUTO-ADJUST:
  // Keeps any category where user entered > 0 or locked strictly UNTOUCHED (e.g. 5000F Papotte)
  // and calculates/distributes the remaining budget into the categories currently at 0!
  const handleAdjustRemaining = () => {
    const isPapotteSet = papotteMonthly > 0 || lockedCategories.papotte;
    const isCantineSet = cantineMonthly > 0 || lockedCategories.cantine;
    const isTransportSet = transportMonthly > 0 || lockedCategories.transport;
    const isFoodSet = foodDaily > 0 || lockedCategories.food;

    // Calculate sum of set categories
    let setTotalMonthly = 0;
    if (isPapotteSet) setTotalMonthly += papotteMonthly;
    if (isCantineSet) setTotalMonthly += cantineMonthly;
    if (isTransportSet) setTotalMonthly += transportMonthly;
    if (isFoodSet) setTotalMonthly += foodDaily * 30;

    // Add set custom categories
    customCategories.forEach((cc) => {
      const val = customMonthlyCosts[cc.id] || 0;
      if (val > 0 || lockedCategories[cc.id]) {
        setTotalMonthly += val;
      }
    });

    const remainingMonthly = Math.max(0, monthlyBudget - setTotalMonthly);

    // List of standard & custom categories currently at 0 FCFA that need to be adjusted
    const zeroStandardCats: MainCategoryId[] = [];
    if (!isPapotteSet) zeroStandardCats.push('papotte');
    if (!isCantineSet) zeroStandardCats.push('cantine');
    if (!isTransportSet) zeroStandardCats.push('transport');
    if (!isFoodSet) zeroStandardCats.push('food');

    const zeroCustomCats = customCategories.filter((cc) => (customMonthlyCosts[cc.id] || 0) === 0 && !lockedCategories[cc.id]);

    const totalZeroCount = zeroStandardCats.length + zeroCustomCats.length;

    if (totalZeroCount === 0) {
      // If all categories are set but budget is exceeded, adjust food
      if (!lockedCategories.food) zeroStandardCats.push('food');
    }

    // Default distribution weights
    const standardWeights: Record<string, number> = {
      food: 0.50,
      cantine: 0.25,
      transport: 0.15,
      papotte: 0.10,
    };

    let totalWeight = zeroStandardCats.reduce((sum, id) => sum + (standardWeights[id] || 0.1), 0);
    // Each zero custom category gets a share weight of 0.10
    totalWeight += zeroCustomCats.length * 0.10;
    if (totalWeight <= 0) totalWeight = 1;

    let newPapotte = papotteMonthly;
    let newCantine = cantineMonthly;
    let newTransport = transportMonthly;
    let newFoodDaily = foodDaily;
    const updatedCustoms = { ...customMonthlyCosts };

    zeroStandardCats.forEach((id) => {
      const share = ((standardWeights[id] || 0.1) / totalWeight) * remainingMonthly;
      const roundedShare = Math.round(share / 100) * 100;

      if (id === 'papotte') newPapotte = roundedShare;
      if (id === 'cantine') newCantine = roundedShare;
      if (id === 'transport') newTransport = roundedShare;
      if (id === 'food') newFoodDaily = Math.max(0, Math.floor(roundedShare / 30));
    });

    zeroCustomCats.forEach((cc) => {
      const share = (0.10 / totalWeight) * remainingMonthly;
      const roundedShare = Math.round(share / 100) * 100;
      updatedCustoms[cc.id] = roundedShare;
    });

    setPapotteMonthly(newPapotte);
    setCantineMonthly(newCantine);
    setTransportMonthly(newTransport);
    setFoodDaily(newFoodDaily);
    setCustomMonthlyCosts(updatedCustoms);
  };

  const handleApply = () => {
    if (isExceeded) return;
    onApplyCustomModifiers({
      cantineSouchesPerMonth: Math.max(0, Math.round(cantineMonthly / 2000)),
      foodDaily: Math.max(0, foodDaily),
      transportTripsPerMonth: Math.max(0, Math.round(transportMonthly / 1000)),
      papotteMonthly: Math.max(0, papotteMonthly),
      customMonthlyCosts: customMonthlyCosts,
    });
  };

  const handleResetAll = () => {
    onReset();
    setLockedCategories({ transport: false, cantine: false, food: false, papotte: false });
    setPapotteMonthly(0);
    setCantineMonthly(0);
    setFoodDaily(0);
    setTransportMonthly(0);

    const resetCustoms: Record<string, number> = {};
    customCategories.forEach((cc) => {
      resetCustoms[cc.id] = 0;
    });
    setCustomMonthlyCosts(resetCustoms);
  };

  const handleFullAutoDefault = () => {
    onAutoMode();
    const defaultPapotte = 5000;
    const defaultTransport = 4000;
    const defaultCantine = monthlyBudget >= 50000 ? 8000 : monthlyBudget >= 35000 ? 5000 : 3000;

    const autoCustoms: Record<string, number> = {};
    let customSum = 0;
    customCategories.forEach((cc) => {
      const cost = cc.monthlyCost && cc.monthlyCost > 0 ? cc.monthlyCost : 3000;
      autoCustoms[cc.id] = cost;
      customSum += cost;
    });

    const fixedMonthly = defaultPapotte + defaultTransport + defaultCantine + customSum;
    const remainingForFood = Math.max(0, monthlyBudget - fixedMonthly);
    const defaultFoodDaily = Math.max(300, Math.floor(remainingForFood / 30));

    setPapotteMonthly(defaultPapotte);
    setTransportMonthly(defaultTransport);
    setCantineMonthly(defaultCantine);
    setFoodDaily(defaultFoodDaily);
    setCustomMonthlyCosts(autoCustoms);
    setLockedCategories({ transport: false, cantine: false, food: false, papotte: false });
  };

  return (
    <div className={`rounded-3xl p-6 sm:p-8 border shadow-md my-8 transition-all duration-300 ${
      isExceeded
        ? 'bg-red-500/10 dark:bg-red-950/50 border-red-500 text-red-900 dark:text-red-200'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif flex items-center gap-2">
            <Sliders className={`w-6 h-6 ${isExceeded ? 'text-red-600 dark:text-red-400' : 'text-amber-600'}`} />
            <span>Simulateur & Personnalisation par Catégorie</span>
          </h3>
          <p className="text-xs sm:text-sm opacity-80 mt-0.5">
            Choisis tes montants pour tes catégories (standards & personnalisées). Les catégories à 0 FCFA s'ajustent automatiquement grâce au bouton <strong className="text-amber-600 dark:text-amber-400 font-extrabold">Ajuster</strong>.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handleAdjustRemaining}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 border border-amber-600"
            title="Ajuste automatiquement les catégories à 0 FCFA sans toucher à tes montants déjà choisis !"
          >
            <Wand2 className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>🪄 Ajuster le reste</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5"
            title="Remet tout à 0 FCFA"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser (Remettre à 0)</span>
          </button>

          <button
            type="button"
            onClick={handleFullAutoDefault}
            className="px-3.5 py-2.5 bg-slate-900 dark:bg-slate-950 text-amber-300 hover:bg-slate-800 rounded-xl text-xs font-bold border border-slate-800 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Remplir tout auto</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all"
          >
            {isOpen ? 'Masquer ▲' : 'Ouvrir ▼'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6 animate-fadeIn">
          
          {/* RED WARNING BANNER WITH SMART AUTO-ADJUST BUTTON IF EXCEEDED */}
          {isExceeded && (
            <div className="bg-red-600 text-white p-5 rounded-2xl shadow-xl border-2 border-red-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-bounce">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-7 h-7 text-white shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm sm:text-base uppercase tracking-wide">
                    🚨 ALERTE : VOUS AVEZ DÉPASSÉ VOTRE BUDGET TOTAL !
                  </h4>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    Vos choix dépassent votre budget de <strong className="underline text-amber-200 font-mono text-base">{deficitAmountMonthly.toLocaleString('fr-FR')} FCFA / mois</strong> ({period === 'year' ? `${deficitAmountTotal.toLocaleString('fr-FR')} FCFA sur l'année` : `${deficitAmountTotal.toLocaleString('fr-FR')} FCFA sur le mois`}).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdjustRemaining}
                className="w-full md:w-auto px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Wand2 className="w-4 h-4 text-slate-950" />
                <span>Ajuster le reste sans toucher vos choix</span>
              </button>
            </div>
          )}

          {/* Grid of Interactive Category Customizers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. PAPOTTE (Hygiène) */}
            <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
              papotteMonthly > 0
                ? 'bg-purple-100/90 dark:bg-purple-950/70 border-purple-500 dark:border-purple-700 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-90'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>🧼 Papotte (Hygiène / Mois)</span>
                </span>

                <span className={`px-2 py-0.5 rounded text-3xs font-extrabold ${
                  papotteMonthly > 0
                    ? 'bg-purple-600 text-white font-black'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {papotteMonthly > 0 ? '✓ Montant Choisis (Conservé)' : '0 F (Sera ajusté)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={25000}
                  step={500}
                  value={papotteMonthly}
                  onChange={(e) => handleCategoryChange('papotte', Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-1.5 font-mono text-sm font-black text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-slate-500 shrink-0">FCFA / mois</span>
              </div>

              <input
                type="range"
                min={0}
                max={15000}
                step={500}
                value={papotteMonthly}
                onChange={(e) => handleCategoryChange('papotte', parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg cursor-pointer accent-purple-600 bg-slate-200 dark:bg-slate-700"
              />
            </div>

            {/* 2. CANTINE CROU-B */}
            <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
              cantineMonthly > 0
                ? 'bg-emerald-100/90 dark:bg-emerald-950/70 border-emerald-500 dark:border-emerald-700 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-90'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <span>🍛 Cantine CROU-B (Mois)</span>
                </span>

                <span className={`px-2 py-0.5 rounded text-3xs font-extrabold ${
                  cantineMonthly > 0
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {cantineMonthly > 0 ? '✓ Montant Choisis (Conservé)' : '0 F (Sera ajusté)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={30000}
                  step={500}
                  value={cantineMonthly}
                  onChange={(e) => handleCategoryChange('cantine', Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-1.5 font-mono text-sm font-black text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-500 shrink-0">FCFA / mois</span>
              </div>

              <input
                type="range"
                min={0}
                max={20000}
                step={500}
                value={cantineMonthly}
                onChange={(e) => handleCategoryChange('cantine', parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg cursor-pointer accent-emerald-600 bg-slate-200 dark:bg-slate-700"
              />
            </div>

            {/* 3. NOURRITURE VIE ÉTUDIANTE (JOUR) */}
            <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
              foodDaily > 0
                ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-500 dark:border-amber-700 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-90'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span>🥐 Vie Étudiante (Par Jour)</span>
                </span>

                <span className={`px-2 py-0.5 rounded text-3xs font-extrabold ${
                  foodDaily > 0
                    ? 'bg-amber-600 text-white font-black'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {foodDaily > 0 ? `✓ ${(foodDaily * 30).toLocaleString('fr-FR')} F/mois` : '0 F (Sera ajusté)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={5000}
                  step={50}
                  value={foodDaily}
                  onChange={(e) => handleCategoryChange('food', Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-1.5 font-mono text-sm font-black text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-slate-500 shrink-0">FCFA / jour</span>
              </div>

              <input
                type="range"
                min={0}
                max={3000}
                step={50}
                value={foodDaily}
                onChange={(e) => handleCategoryChange('food', parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg cursor-pointer accent-amber-600 bg-slate-200 dark:bg-slate-700"
              />
            </div>

            {/* 4. TRANSPORT RELIGIEUX */}
            <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
              transportMonthly > 0
                ? 'bg-blue-100/90 dark:bg-blue-950/70 border-blue-500 dark:border-blue-700 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-90'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                  <Bus className="w-4 h-4 text-blue-600" />
                  <span>🕌 Transport (Mois)</span>
                </span>

                <span className={`px-2 py-0.5 rounded text-3xs font-extrabold ${
                  transportMonthly > 0
                    ? 'bg-blue-600 text-white font-black'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {transportMonthly > 0 ? '✓ Montant Choisis (Conservé)' : '0 F (Sera ajusté)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={15000}
                  step={500}
                  value={transportMonthly}
                  onChange={(e) => handleCategoryChange('transport', Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-1.5 font-mono text-sm font-black text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-500 shrink-0">FCFA / mois</span>
              </div>

              <input
                type="range"
                min={0}
                max={10000}
                step={500}
                value={transportMonthly}
                onChange={(e) => handleCategoryChange('transport', parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg cursor-pointer accent-blue-600 bg-slate-200 dark:bg-slate-700"
              />
            </div>

            {/* CUSTOM CATEGORIES CREATED BY THE USER */}
            {customCategories.map((cc) => {
              const cost = customMonthlyCosts[cc.id] ?? cc.monthlyCost ?? 0;
              const maxRange = Math.max(30000, (cc.monthlyCost || 5000) * 3);

              return (
                <div
                  key={cc.id}
                  className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    cost > 0
                      ? 'bg-indigo-100/90 dark:bg-indigo-950/70 border-indigo-500 dark:border-indigo-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 truncate pr-2">
                      <span className="text-base shrink-0">{cc.emoji || '📌'}</span>
                      <span className="truncate">{cc.name} (Perso / Mois)</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded text-3xs font-extrabold shrink-0 ${
                      cost > 0
                        ? 'bg-indigo-600 text-white font-black'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {cost > 0 ? '✓ Montant Choisis' : '0 F (Sera ajusté)'}
                    </span>
                  </div>

                  {cc.description && (
                    <p className="text-3xs text-slate-600 dark:text-slate-300 font-medium truncate">
                      {cc.description}
                    </p>
                  )}

                  {cc.unitPrice && cc.unitPrice > 0 && cost < cc.unitPrice && (
                    <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-xl p-2.5 text-3xs text-amber-900 dark:text-amber-200 space-y-1">
                      <div className="font-extrabold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Montant inférieur au prix de départ ({cc.unitPrice.toLocaleString('fr-FR')} F)</span>
                      </div>
                      <p className="leading-snug">
                        L'allocation ({cost.toLocaleString('fr-FR')} FCFA) est inférieure au prix de démarrage défini ({cc.unitPrice.toLocaleString('fr-FR')} FCFA). L'algorithme a ajusté la somme pour maintenir l'équilibre de tes repas et du transport.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      step={500}
                      value={cost}
                      onChange={(e) => handleCustomCategoryChange(cc.id, Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-3 py-1.5 font-mono text-sm font-black text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-500 shrink-0">FCFA / mois</span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={maxRange}
                    step={500}
                    value={cost}
                    onChange={(e) => handleCustomCategoryChange(cc.id, parseInt(e.target.value, 10))}
                    className="w-full h-2 rounded-lg cursor-pointer accent-indigo-600 bg-slate-200 dark:bg-slate-700"
                  />
                </div>
              );
            })}

          </div>

          {/* Simulation Summary Bar */}
          <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isExceeded
              ? 'bg-red-900 text-white border-red-800'
              : 'bg-slate-900 text-white border-slate-800'
          }`}>
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs text-slate-300 font-medium">
                Total dépenses simulées : <strong className="font-mono text-sm">{currentTotalAllocated.toLocaleString('fr-FR')} FCFA</strong> / {period === 'year' ? 'an' : 'mois'}
              </div>
              <div className={`text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5 ${
                isExceeded ? 'text-red-300' : 'text-emerald-400'
              }`}>
                {isExceeded ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Info className="w-4 h-4" />}
                <span>
                  {isExceeded
                    ? `Déficit créé : -${deficitAmountTotal.toLocaleString('fr-FR')} FCFA`
                    : `Réserve d'urgence restante : ${(totalBudget - currentTotalAllocated).toLocaleString('fr-FR')} FCFA`}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAdjustRemaining}
                className="w-full sm:w-auto px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Wand2 className="w-4 h-4" />
                <span>Ajuster le reste</span>
              </button>

              <button
                type="button"
                disabled={isExceeded}
                onClick={handleApply}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5 ${
                  isExceeded
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{isExceeded ? 'Dépassement interdit' : 'Appliquer ces choix'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};



