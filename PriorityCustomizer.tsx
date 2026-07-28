import React, { useState } from 'react';
import { MainCategoryId, CustomCategory, FrequencyType } from '../types';
import { ArrowUp, ArrowDown, Sparkles, SlidersHorizontal, CheckCircle2, Plus, Trash2, X, FolderPlus } from 'lucide-react';

interface PriorityCustomizerProps {
  priorityOrder: string[];
  onPriorityOrderChange: (newOrder: string[]) => void;
  enabledCategories?: Record<string, boolean>;
  customCategories?: CustomCategory[];
  onAddCustomCategory?: (category: { name: string; emoji: string; monthlyCost: number }) => void;
  onDeleteCustomCategory?: (id: string) => void;
}

const CATEGORY_META: Record<string, { name: string; emoji: string; subtitle: string; color: string }> = {
  transport_school: {
    name: 'TRANSPORT ÉCOLE (LUNDI-VENDREDI)',
    emoji: '🚌',
    subtitle: '500F Aller / 500F Retour (1000F / jour de cours)',
    color: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-200 dark:border-cyan-800',
  },
  transport: {
    name: 'TRANSPORT RELIGIEUX',
    emoji: '🕌',
    subtitle: 'Église / Mosquée (1000F / semaine)',
    color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800',
  },
  cantine: {
    name: 'CANTINE (CROU-B)',
    emoji: '🍛',
    subtitle: 'Matin: 100F (souche 1000F) | Midi & Soir: 200F (souche 2000F)',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800',
  },
  food: {
    name: 'NOURRITURE VIE ÉTUDIANTE',
    emoji: '🍞',
    subtitle: 'Pour se faire plaisir de temps en temps (Garba, maquis, friandises)',
    color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800',
  },
  papotte: {
    name: 'PAPOTTE (HYGIÈNE)',
    emoji: '🧼',
    subtitle: 'Savon, liquide, pâte dentifrice, parfum',
    color: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-800',
  },
};

const COMMON_EMOJIS = ['📱', '🏠', '📚', '💊', '🤝', '🎁', '🛒', '💡', '🚲', '👔', '⚽', '📶', '🎧', '⚡'];

export const PriorityCustomizer: React.FC<PriorityCustomizerProps> = ({
  priorityOrder,
  onPriorityOrderChange,
  enabledCategories = {},
  customCategories = [],
  onAddCustomCategory,
  onDeleteCustomCategory,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📱');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatUnitPrice, setNewCatUnitPrice] = useState<number | ''>(500);
  const [newCatFrequencyType, setNewCatFrequencyType] = useState<FrequencyType>('school_days');
  const [newCatFrequencyValue, setNewCatFrequencyValue] = useState<number>(1);

  // Base standard category IDs
  const baseIds = ['transport_school', 'cantine', 'food', 'transport', 'papotte'];
  const customIds = customCategories.map((c) => c.id);
  const allIds = [...baseIds, ...customIds];

  // Full priority order guaranteed to contain all known category IDs
  const fullPriorityOrder = [
    ...priorityOrder.filter((id) => allIds.includes(id)),
    ...allIds.filter((id) => !priorityOrder.includes(id)),
  ];

  // Active priority order (filters out disabled categories)
  const activePriorityOrder = fullPriorityOrder.filter((catId) => {
    return enabledCategories[catId] !== false;
  });

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

  const moveUp = (index: number) => {
    if (index === 0) return;
    const currentCatId = activePriorityOrder[index];
    const prevCatId = activePriorityOrder[index - 1];

    const newOrder = [...fullPriorityOrder];
    const currIdxInMaster = newOrder.indexOf(currentCatId);
    const prevIdxInMaster = newOrder.indexOf(prevCatId);

    if (currIdxInMaster !== -1 && prevIdxInMaster !== -1) {
      const temp = newOrder[prevIdxInMaster];
      newOrder[prevIdxInMaster] = newOrder[currIdxInMaster];
      newOrder[currIdxInMaster] = temp;
      onPriorityOrderChange(newOrder);
    }
  };

  const moveDown = (index: number) => {
    if (index === activePriorityOrder.length - 1) return;
    const currentCatId = activePriorityOrder[index];
    const nextCatId = activePriorityOrder[index + 1];

    const newOrder = [...fullPriorityOrder];
    const currIdxInMaster = newOrder.indexOf(currentCatId);
    const nextIdxInMaster = newOrder.indexOf(nextCatId);

    if (currIdxInMaster !== -1 && nextIdxInMaster !== -1) {
      const temp = newOrder[nextIdxInMaster];
      newOrder[nextIdxInMaster] = newOrder[currIdxInMaster];
      newOrder[currIdxInMaster] = temp;
      onPriorityOrderChange(newOrder);
    }
  };

  const setPreset = (presetOrder: string[]) => {
    const combined = [...presetOrder, ...allIds.filter((id) => !presetOrder.includes(id))];
    onPriorityOrderChange(combined);
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

  const presets: { label: string; order: string[]; icon: string }[] = [];

  if (customCategories.length > 0) {
    presets.push({
      label: 'Tes Catégories Perso en 1er',
      order: [...customIds, 'transport_school', 'cantine', 'food', 'transport', 'papotte'],
      icon: '⭐',
    });

    presets.push({
      label: 'Équilibré avec Catégories Perso',
      order: ['transport_school', 'cantine', 'food', ...customIds, 'transport', 'papotte'],
      icon: '🎯',
    });
  }

  presets.push({
    label: 'Ordre Standard (Transport École en 1er)',
    order: ['transport_school', 'cantine', 'food', 'transport', 'papotte', ...customIds],
    icon: '🚌',
  });

  presets.push({
    label: 'Resto U & Cantine d\'abord',
    order: ['cantine', 'food', 'transport', 'papotte', ...customIds],
    icon: '🍛',
  });

  presets.push({
    label: 'Nourriture Quotidienne d\'abord',
    order: ['food', 'cantine', 'transport', 'papotte', ...customIds],
    icon: '🍞',
  });

  presets.push({
    label: 'Hygiène & Propreté d\'abord',
    order: ['papotte', 'cantine', 'food', 'transport', ...customIds],
    icon: '🧼',
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-400/80 dark:border-amber-500/50 shadow-xl my-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>🎯 Personnalise tes Priorités de Dépenses</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Ordre de priorité personnalisé (1er, 2ème, 3ème, 4ème...). Tu peux aussi <strong className="text-amber-600 dark:text-amber-400 font-extrabold">ajouter tes propres catégories</strong> (ex: Internet, Loyer, Livres...) !
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Ajouter une catégorie</span>
          </button>
        </div>
      </div>

      {/* Add Custom Category Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="p-5 rounded-2xl bg-amber-50 dark:bg-slate-800/90 border-2 border-amber-400 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-2">
            <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              <span>Créer et Ajouter une nouvelle catégorie</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-lg hover:bg-amber-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Nom de la catégorie (ex: Internet, Loyer, Santé, Livres...)
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Forfait Internet"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Émoji / Icône
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={2}
                  value={newCatEmoji}
                  onChange={(e) => setNewCatEmoji(e.target.value)}
                  className="w-12 px-2 py-2 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-black"
                />
                <div className="flex flex-wrap gap-1">
                  {COMMON_EMOJIS.slice(0, 8).map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setNewCatEmoji(emo)}
                      className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${
                        newCatEmoji === emo ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              À quoi sert cette catégorie ? (Description & Détails pour calculs & conseils)
            </label>
            <input
              type="text"
              placeholder="Ex: Forfait 15Go/mois pour recherches et WhatsApp, ou Loyer studio Bondoukou..."
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium"
            />
          </div>

          {/* Unit Price & Frequency Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Le prix commence à partir de combien ? (Prix unitaire en FCFA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={100}
                  placeholder="Ex: 200, 500, 1000, 15000..."
                  value={newCatUnitPrice}
                  onChange={(e) => setNewCatUnitPrice(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono text-amber-600 dark:text-amber-400"
                />
                <span className="absolute right-3 top-2.5 text-2xs font-bold text-slate-400 font-mono">FCFA</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Combien de fois payes-tu cela ? (Fréquence)
              </label>
              <select
                value={newCatFrequencyType}
                onChange={(e) => setNewCatFrequencyType(e.target.value as FrequencyType)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="school_days">🎓 Jours de cours uniquement (5 jours / semaine ≈ 20 j/mois)</option>
                <option value="daily">📅 Tous les jours (7 jours sur 7 ≈ 30 j/mois)</option>
                <option value="weekly">📆 Quelques fois par semaine (ex: 1, 2 ou 3 fois / sem)</option>
                <option value="monthly">📌 Fixe par mois (ex: 1 fois par mois pour un loyer)</option>
              </select>
            </div>
          </div>

          {(newCatFrequencyType === 'weekly' || newCatFrequencyType === 'monthly') && (
            <div className="space-y-1 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                {newCatFrequencyType === 'weekly' ? 'Combien de fois par semaine ?' : 'Combien de fois par mois ?'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={newCatFrequencyType === 'weekly' ? 7 : 31}
                  value={newCatFrequencyValue}
                  onChange={(e) => setNewCatFrequencyValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono text-center"
                />
                <span className="text-2xs font-medium text-slate-600 dark:text-slate-400">
                  {newCatFrequencyType === 'weekly'
                    ? `fois par semaine (soit ${newCatFrequencyValue * 4} fois par mois)`
                    : `fois par mois`}
                </span>
              </div>
            </div>
          )}

          {/* Live Estimated Calculation Banner */}
          <div className="p-3 bg-amber-100/80 dark:bg-amber-950/60 rounded-xl border border-amber-300 dark:border-amber-700/80 flex items-center justify-between text-xs text-amber-950 dark:text-amber-200">
            <span className="font-medium flex items-center gap-1.5">
              <span>💡</span>
              <span>Calcul du coût mensuel estimé :</span>
            </span>
            <span className="font-extrabold font-mono text-sm bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
              {calculateEstimatedMonthly().toLocaleString('fr-FR')} FCFA / mois
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Valider & Ajouter aux priorités</span>
            </button>
          </div>
        </form>
      )}

      {/* Preset Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Modèles de priorités préfinis :</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {presets.map((p, idx) => {
            const isSelected = JSON.stringify(priorityOrder) === JSON.stringify(p.order) ||
              JSON.stringify(priorityOrder.slice(0, p.order.length)) === JSON.stringify(p.order);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setPreset(p.order)}
                className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between gap-2 border ${
                  isSelected
                    ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 border-slate-900 dark:border-amber-500 shadow-sm ring-2 ring-amber-400/50 font-extrabold'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base shrink-0">{p.icon}</span>
                  <span className="truncate">{p.label}</span>
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400 dark:text-slate-950" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Priority List */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Classement actuel de tes priorités sélectionnées ({activePriorityOrder.length} actives) :
        </span>

        {activePriorityOrder.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Aucune catégorie sélectionnée !
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Coche des catégories ci-dessus dans « Sélectionne tes catégories » pour qu'elles apparaissent dans le classement.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activePriorityOrder.map((catId, index) => {
              const isStandard = CATEGORY_META[catId] !== undefined;
              const customCat = customCategories.find((c) => c.id === catId);
              
              const meta = CATEGORY_META[catId] || {
                name: customCat?.name.toUpperCase() || 'CATÉGORIE PERSONNALISÉE',
                emoji: customCat?.emoji || '📌',
                subtitle: 'Catégorie personnalisée (intégrée à tes priorités)',
                color: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-800',
              };

              const rankLabel =
                index === 0
                  ? '🥇 1ère Priorité (Essentiel)'
                  : index === 1
                  ? '🥈 2ème Priorité'
                  : index === 2
                  ? '🥉 3ème Priorité'
                  : `${index + 1}ème Priorité`;

              return (
                <div
                  key={catId}
                  className={`p-4 rounded-2xl border ${meta.color} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                      {meta.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md font-mono">
                          {rankLabel}
                        </span>
                        {!isStandard && (
                          <span className="text-3xs bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                            Personnalisée
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-black font-serif mt-0.5">
                        {meta.name}
                      </h4>
                      <p className="text-2xs opacity-80 font-medium">
                        {meta.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Move Up / Move Down / Delete controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                        index === 0
                          ? 'opacity-30 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent'
                          : 'bg-white dark:bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-xs'
                      }`}
                      title="Monter cette priorité"
                    >
                      <ArrowUp className="w-4 h-4" />
                      <span className="text-2xs font-extrabold uppercase hidden sm:inline">Monter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === activePriorityOrder.length - 1}
                      className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                        index === activePriorityOrder.length - 1
                          ? 'opacity-30 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent'
                          : 'bg-white dark:bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-xs'
                      }`}
                      title="Descendre cette priorité"
                    >
                      <ArrowDown className="w-4 h-4" />
                      <span className="text-2xs font-extrabold uppercase hidden sm:inline">Descendre</span>
                    </button>

                    {!isStandard && onDeleteCustomCategory && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomCategory(catId)}
                        className="p-2 rounded-xl text-xs font-bold bg-red-100 hover:bg-red-200 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                        title="Supprimer cette catégorie personnalisée"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

