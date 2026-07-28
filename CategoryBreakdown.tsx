import React, { useState } from 'react';
import {
  Utensils,
  Soup,
  Bus,
  Sparkles,
  PiggyBank,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  CheckSquare,
  Square,
  Coffee,
  Sun,
  Moon,
  FolderPlus,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { BudgetCategory, CategoryId, MainCategoryId, Period, EnabledCategories, SelectedMeals, CustomCategory, FrequencyType } from '../types';

interface CategoryBreakdownProps {
  categories: Record<string, BudgetCategory>;
  totalBudget: number;
  allocatedTotal: number;
  remainingAmount: number;
  period: Period;
  periodLabel?: string;
  status: 'insufficient' | 'tight' | 'balanced' | 'comfortable';
  enabledCategories: EnabledCategories;
  selectedMeals: SelectedMeals;
  customCategories?: CustomCategory[];
  priorityCustomizer?: React.ReactNode;
  onToggleCategory: (categoryId: string) => void;
  onToggleMeal: (meal: 'matin' | 'midi' | 'soir') => void;
  onAddCustomCategory?: (category: { name: string; emoji: string; monthlyCost: number }) => void;
  onDeleteCustomCategory?: (id: string) => void;
}

const COMMON_EMOJIS = ['📱', '🏠', '📚', '💊', '🤝', '🎁', '🛒', '💡', '🚲', '👔', '⚽', '📶', '🎧', '⚡'];

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categories,
  totalBudget,
  allocatedTotal,
  remainingAmount,
  period,
  periodLabel: customPeriodLabel,
  status,
  enabledCategories,
  selectedMeals,
  customCategories = [],
  priorityCustomizer,
  onToggleCategory,
  onToggleMeal,
  onAddCustomCategory,
  onDeleteCustomCategory,
}) => {
  const periodLabelText = customPeriodLabel || (period === 'year' ? 'les 9 mois (Année 2026-2027)' : period === 'custom' ? 'la période sur mesure' : 'le mois (30 jours)');

  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📱');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatUnitPrice, setNewCatUnitPrice] = useState<number | ''>(500);
  const [newCatFrequencyType, setNewCatFrequencyType] = useState<FrequencyType>('school_days');
  const [newCatFrequencyValue, setNewCatFrequencyValue] = useState<number>(1);

  const calculateEstimatedMonthly = () => {
    const uPrice = typeof newCatUnitPrice === 'number' ? newCatUnitPrice : 0;
    if (uPrice <= 0) return 0;
    const fVal = newCatFrequencyValue || 1;
    if (newCatFrequencyType === 'school_days') return uPrice * fVal * 20;
    if (newCatFrequencyType === 'daily') return uPrice * fVal * 30;
    if (newCatFrequencyType === 'weekly') return uPrice * fVal * 4;
    if (newCatFrequencyType === 'monthly') return uPrice * fVal;
    return 0;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const uPrice = typeof newCatUnitPrice === 'number' ? newCatUnitPrice : 0;
    const estimated = calculateEstimatedMonthly();
    if (onAddCustomCategory) {
      onAddCustomCategory({
        name: newCatName.trim(),
        emoji: newCatEmoji || '📌',
        description: newCatDesc.trim(),
        unitPrice: uPrice,
        frequencyType: newCatFrequencyType,
        frequencyValue: newCatFrequencyValue,
        monthlyCost: estimated,
      });
    }
    setNewCatName('');
    setNewCatDesc('');
    setNewCatUnitPrice(500);
    setNewCatFrequencyType('school_days');
    setNewCatFrequencyValue(1);
    setIsAdding(false);
  };

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'transport_school':
        return <Bus className="w-6 h-6 text-cyan-600" />;
      case 'transport':
        return <Bus className="w-6 h-6 text-blue-600" />;
      case 'cantine':
        return <Utensils className="w-6 h-6 text-emerald-600" />;
      case 'food':
        return <Soup className="w-6 h-6 text-amber-600" />;
      case 'papotte':
        return <Sparkles className="w-6 h-6 text-purple-600" />;
      case 'reserve':
        return <PiggyBank className="w-6 h-6 text-teal-600" />;
      default:
        return <FolderPlus className="w-6 h-6 text-indigo-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'insufficient':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            🔴 BUDGET CRITIQUE (&lt; 25 000 FCFA / mois)
          </span>
        );
      case 'tight':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            🟠 BUDGET SERRÉ (25 000F - 39 999F / mois)
          </span>
        );
      case 'balanced':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-300 dark:bg-yellow-950/80 dark:text-yellow-300 dark:border-yellow-800">
            <CheckCircle className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
            🟡 BUDGET MOYEN (40 000F - 69 999F / mois)
          </span>
        );
      case 'comfortable':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            🟢 BUDGET CONFORTABLE (&ge; 70 000 FCFA / mois)
          </span>
        );
    }
  };

  // Sort dynamically by the user's custom priority order
  const categoryList: BudgetCategory[] = (Object.values(categories) as BudgetCategory[])
    .filter((cat) => cat && cat.id !== 'reserve')
    .sort((a, b) => (a.priorityOrder || 0) - (b.priorityOrder || 0));

  return (
    <div className="space-y-6 my-6">
      
      {/* Top Overview Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <div className="mb-3">{getStatusBadge()}</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">
              SÉLECTIONNE TES CATÉGORIES
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Coche ou décoche les catégories selon tes besoins, ou <strong className="text-amber-400 font-extrabold">ajoute tes propres catégories</strong>. Le calcul s'ajuste instantanément sur tes <strong className="text-amber-400">{totalBudget.toLocaleString('fr-FR')} FCFA</strong> pour {periodLabelText}.
            </p>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 w-full md:w-auto flex items-center justify-between md:justify-end gap-6">
            <div>
              <span className="text-2xs uppercase tracking-wider text-slate-400 block font-bold">Total Dépenses Sélectionnées</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {allocatedTotal.toLocaleString('fr-FR')} F
              </span>
            </div>
            <div className="border-l border-slate-700 pl-6">
              <span className="text-2xs uppercase tracking-wider text-slate-400 block font-bold">Imprévus & Épargne</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                {remainingAmount.toLocaleString('fr-FR')} F
              </span>
            </div>
          </div>
        </div>

        {/* Category Toggles Quick Bar */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
              ☑️ Sélectionner les catégories actives :
            </span>

            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Ajouter une catégorie</span>
            </button>
          </div>

          {/* Inline Add Category Form */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-slate-800 border-2 border-amber-400 space-y-3 my-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4" />
                  <span>Nouvelle Catégorie Personnalisée</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-3xs font-bold uppercase text-slate-300 block mb-1">
                    Nom de la catégorie
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Forfait Internet, Loyer, Santé..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-3xs font-bold uppercase text-slate-300 block mb-1">
                    Émoji / Icône
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={2}
                      value={newCatEmoji}
                      onChange={(e) => setNewCatEmoji(e.target.value)}
                      className="w-10 px-2 py-2 bg-slate-900 border border-slate-700 text-white text-center rounded-lg text-xs font-bold"
                    />
                    <div className="flex gap-1 overflow-x-auto py-0.5">
                      {COMMON_EMOJIS.slice(0, 6).map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setNewCatEmoji(e)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-700 text-xs rounded border border-slate-700"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-3xs font-bold uppercase text-slate-300 block mb-1">
                  À quoi sert cette catégorie ? (Description pour conseils & calculs)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Forfait 15Go/mois pour cours & WhatsApp, ou Achat de livres..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-medium"
                />
              </div>

              {/* Price & Frequency questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-3xs font-bold uppercase text-slate-300 block mb-1">
                    Prix unitaire / Prix de départ (en FCFA)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={100}
                      placeholder="Ex: 200, 500, 1000..."
                      value={newCatUnitPrice}
                      onChange={(e) => setNewCatUnitPrice(e.target.value ? parseInt(e.target.value, 10) : '')}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-lg text-xs"
                    />
                    <span className="absolute right-2.5 top-2 text-3xs font-bold text-slate-400 font-mono">FCFA</span>
                  </div>
                </div>

                <div>
                  <label className="text-3xs font-bold uppercase text-slate-300 block mb-1">
                    Fréquence de paiement
                  </label>
                  <select
                    value={newCatFrequencyType}
                    onChange={(e) => setNewCatFrequencyType(e.target.value as FrequencyType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-bold"
                  >
                    <option value="school_days">🎓 Jours de cours (~20 j/mois)</option>
                    <option value="daily">📅 Tous les jours (~30 j/mois)</option>
                    <option value="weekly">📆 Par semaine (ex: 1, 2, 3x/sem)</option>
                    <option value="monthly">📌 Par mois (ex: 1x/mois)</option>
                  </select>
                </div>
              </div>

              {(newCatFrequencyType === 'weekly' || newCatFrequencyType === 'monthly') && (
                <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                  <label className="text-3xs font-bold uppercase text-slate-300">
                    {newCatFrequencyType === 'weekly' ? 'Nombre de fois / semaine :' : 'Nombre de fois / mois :'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={newCatFrequencyType === 'weekly' ? 7 : 31}
                    value={newCatFrequencyValue}
                    onChange={(e) => setNewCatFrequencyValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 text-white rounded text-xs font-bold text-center font-mono"
                  />
                  <span className="text-3xs text-slate-400 font-medium">
                    {newCatFrequencyType === 'weekly' ? `(soit ${newCatFrequencyValue * 4} fois par mois)` : 'fois'}
                  </span>
                </div>
              )}

              {/* Live estimation preview */}
              <div className="p-2.5 bg-amber-950/80 rounded-lg border border-amber-800/80 flex items-center justify-between text-xs text-amber-200 font-mono">
                <span className="text-3xs uppercase font-sans font-extrabold text-amber-300 flex items-center gap-1">
                  <span>💡</span>
                  <span>Calcul automatique :</span>
                </span>
                <span className="font-bold text-amber-400">
                  {calculateEstimatedMonthly().toLocaleString('fr-FR')} FCFA / mois
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-700 text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter & Intégrer aux priorités</span>
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {categoryList.map((cat) => {
              const isEnabled = enabledCategories[cat.id] !== undefined ? enabledCategories[cat.id] : cat.enabled;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggleCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isEnabled
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500 line-through'
                  }`}
                >
                  {isEnabled ? (
                    <CheckSquare className="w-4 h-4 text-slate-950" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{cat.emoji} {cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Multi-Segment Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs text-slate-300 font-medium">
            <span>Barre de répartition du budget total</span>
            <span>{Math.round((allocatedTotal / (totalBudget || 1)) * 100)}% alloué</span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700">
            {categoryList.map((cat) => {
              const isEnabled = enabledCategories[cat.id] !== undefined ? enabledCategories[cat.id] : cat.enabled;
              if (cat.amount <= 0 || !isEnabled) return null;
              let bgClass = 'bg-indigo-500';
              if (cat.id === 'transport_school') bgClass = 'bg-cyan-500';
              if (cat.id === 'transport') bgClass = 'bg-blue-500';
              if (cat.id === 'cantine') bgClass = 'bg-emerald-500';
              if (cat.id === 'food') bgClass = 'bg-amber-500';
              if (cat.id === 'papotte') bgClass = 'bg-purple-500';

              return (
                <div
                  key={cat.id}
                  style={{ width: `${Math.max(2, cat.percentage)}%` }}
                  className={`${bgClass} h-full transition-all rounded-sm`}
                  title={`${cat.name}: ${cat.amount.toLocaleString('fr-FR')} F (${cat.percentage}%)`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Customizer Slot (Classer ses priorités juste après la sélection) */}
      {priorityCustomizer && (
        <div>
          {priorityCustomizer}
        </div>
      )}

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categoryList.map((cat) => {
          const isEnabled = enabledCategories[cat.id] !== undefined ? enabledCategories[cat.id] : cat.enabled;
          const isStandard = ['transport_school', 'cantine', 'food', 'transport', 'papotte'].includes(cat.id);

          return (
            <div
              key={cat.id}
              className={`rounded-2xl p-6 border shadow-md transition-all flex flex-col justify-between relative overflow-hidden group ${
                isEnabled
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:shadow-xl'
                  : 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-300/50 dark:border-slate-800/50 opacity-60'
              }`}
            >
              {/* Top Indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-2.5 ${
                !isEnabled ? 'bg-slate-400' :
                cat.id === 'transport_school' ? 'bg-cyan-500' :
                cat.id === 'transport' ? 'bg-blue-500' :
                cat.id === 'cantine' ? 'bg-emerald-500' :
                cat.id === 'food' ? 'bg-amber-500' :
                cat.id === 'papotte' ? 'bg-purple-500' : 'bg-indigo-500'
              }`} />

              <div className="space-y-4 pt-1">
                
                {/* Priority Header + Checkbox Toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      {getCategoryIcon(cat.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{cat.emoji}</span>
                        <span className="text-2xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          Priorité {Math.max(1, cat.priorityOrder || 1)}
                        </span>
                        {!isStandard && (
                          <span className="text-3xs bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                            Personnalisée
                          </span>
                        )}
                      </div>
                      <h4 className={`text-base font-bold font-serif leading-tight mt-0.5 ${
                        isEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 line-through'
                      }`}>
                        {cat.name}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{cat.subtitle}</span>
                    </div>
                  </div>

                  {/* Toggle Checkbox Button & Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isEnabled
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isEnabled ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      <span>{isEnabled ? 'Activée' : 'Désactivée'}</span>
                    </button>

                    {!isStandard && onDeleteCustomCategory && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomCategory(cat.id)}
                        className="p-1.5 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                        title="Supprimer cette catégorie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Amount & Percentage */}
                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-100 dark:border-slate-700/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xs uppercase tracking-wider text-slate-400 block font-bold">Montant Recommandé</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-amber-400 font-mono">
                      {isEnabled ? cat.amount.toLocaleString('fr-FR') : '0'}{' '}
                      <span className="text-sm font-semibold text-slate-500">FCFA</span>
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700">
                    {isEnabled ? cat.percentage : 0}% du total
                  </span>
                </div>

                {/* Shortfall Explanation Box when Allocated < Target / Starting Price */}
                {cat.isShortfall && cat.shortfallExplanation && isEnabled && (
                  <div className="bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-400 dark:border-amber-700/80 rounded-xl p-3.5 space-y-2 text-amber-950 dark:text-amber-200 text-xs shadow-sm">
                    <div className="flex items-center gap-2 font-black text-amber-900 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="uppercase tracking-wider text-2xs font-sans">
                        EXPLICATION : POURQUOI {cat.amount.toLocaleString('fr-FR')} F AU LIEU DE {cat.targetAmount?.toLocaleString('fr-FR')} F ?
                      </span>
                    </div>
                    <p className="text-2xs font-semibold leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">
                      {cat.shortfallExplanation}
                    </p>
                  </div>
                )}

                {/* Specific Rules Info Box */}
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-600" />
                      <span>Détail du calcul :</span>
                    </div>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{cat.unitInfo}</p>

                  {/* Detailed Tickets & Souches Breakdown for CANTINE with Meal Selection */}
                  {cat.id === 'cantine' && isEnabled && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 space-y-3">
                      
                      {/* Interactive Meal Selector Checkboxes */}
                      <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-2">
                        <span className="text-2xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                          🍛 Repas Cantine à Inclure dans le Calcul :
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleMeal('matin')}
                            className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                              selectedMeals.matin
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 line-through'
                            }`}
                          >
                            <Coffee className="w-3.5 h-3.5" />
                            <span>Matin (100F)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleMeal('midi')}
                            className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                              selectedMeals.midi
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 line-through'
                            }`}
                          >
                            <Sun className="w-3.5 h-3.5" />
                            <span>Midi (200F)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleMeal('soir')}
                            className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                              selectedMeals.soir
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 line-through'
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5" />
                            <span>Soir (200F)</span>
                          </button>
                        </div>
                      </div>

                      {/* Cantine Summary */}
                      {cat.cantineBreakdown && (
                        <>
                          <div className="text-2xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                            <span>🎫 ACHAT CONSEILLÉ DE TICKETS :</span>
                            <span className="font-mono bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                              {cat.cantineBreakdown.totalSouches} Souche(s) ({cat.cantineBreakdown.totalTickets} tks)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-1.5 text-xs">
                            {/* Matin */}
                            <div className={`p-2 rounded-lg border flex items-center justify-between ${
                              selectedMeals.matin
                                ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                                : 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-50'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">☕</span>
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-2xs">Petit-Déjeuner (Matin) - 100F</span>
                                  <span className="text-2xs text-slate-500 dark:text-slate-400">
                                    {selectedMeals.matin ? (
                                      <>
                                        {cat.cantineBreakdown.matin.souchesCount > 0 && `${cat.cantineBreakdown.matin.souchesCount} Souche(s) `}
                                        {cat.cantineBreakdown.matin.unitTicketsCount > 0 && `+ ${cat.cantineBreakdown.matin.unitTicketsCount} ticket(s) `}
                                        ({cat.cantineBreakdown.matin.totalTicketsCount} tickets)
                                      </>
                                    ) : (
                                      'Non sélectionné (0 ticket)'
                                    )}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {cat.cantineBreakdown.matin.totalCost.toLocaleString('fr-FR')} F
                              </span>
                            </div>

                            {/* Midi */}
                            <div className={`p-2 rounded-lg border flex items-center justify-between ${
                              selectedMeals.midi
                                ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                                : 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-50'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">☀️</span>
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-2xs">Déjeuner (Midi) - 200F</span>
                                  <span className="text-2xs text-slate-500 dark:text-slate-400">
                                    {selectedMeals.midi ? (
                                      <>
                                        {cat.cantineBreakdown.midi.souchesCount > 0 && `${cat.cantineBreakdown.midi.souchesCount} Souche(s) `}
                                        {cat.cantineBreakdown.midi.unitTicketsCount > 0 && `+ ${cat.cantineBreakdown.midi.unitTicketsCount} ticket(s) `}
                                        ({cat.cantineBreakdown.midi.totalTicketsCount} tickets)
                                      </>
                                    ) : (
                                      'Non sélectionné (0 ticket)'
                                    )}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {cat.cantineBreakdown.midi.totalCost.toLocaleString('fr-FR')} F
                              </span>
                            </div>

                            {/* Soir */}
                            <div className={`p-2 rounded-lg border flex items-center justify-between ${
                              selectedMeals.soir
                                ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                                : 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-50'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">🌙</span>
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-2xs">Dîner (Soir) - 200F</span>
                                  <span className="text-2xs text-slate-500 dark:text-slate-400">
                                    {selectedMeals.soir ? (
                                      <>
                                        {cat.cantineBreakdown.soir.souchesCount > 0 && `${cat.cantineBreakdown.soir.souchesCount} Souche(s) `}
                                        {cat.cantineBreakdown.soir.unitTicketsCount > 0 && `+ ${cat.cantineBreakdown.soir.unitTicketsCount} ticket(s) `}
                                        ({cat.cantineBreakdown.soir.totalTicketsCount} tickets)
                                      </>
                                    ) : (
                                      'Non sélectionné (0 ticket)'
                                    )}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {cat.cantineBreakdown.soir.totalCost.toLocaleString('fr-FR')} F
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Personalized Biblical Advice Box */}
                {cat.biblicalVerse && isEnabled && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 rounded-xl p-3.5 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 font-serif">
                      <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{cat.biblicalVerse}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      💡 <strong>Conseil :</strong> {cat.biblicalAdvice}
                    </p>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
