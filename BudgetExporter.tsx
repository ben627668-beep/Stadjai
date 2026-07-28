import React, { useState } from 'react';
import { Share2, Copy, Check, Download, Printer } from 'lucide-react';
import { BudgetCalculationResult } from '../types';

interface BudgetExporterProps {
  calculation: BudgetCalculationResult;
}

export const BudgetExporter: React.FC<BudgetExporterProps> = ({ calculation }) => {
  const [copied, setCopied] = useState(false);

  const generateReportText = () => {
    const periodLabel = calculation.period === 'year' ? 'Année Académique (9 mois)' : 'Un Mois';
    const c = calculation.categories;

    return `
========================================
🎓 PLAN BUDGETAIRE STADJAI - UNIVERSITÉ DE BONDOUKOU
========================================
Période : ${periodLabel}
Budget Total : ${calculation.totalBudget.toLocaleString('fr-FR')} FCFA

--- RÉPARTITION PAR CATÉGORIE ---
1. Tickets de Cantine (200F / Souche 2000F) : ${c.cantine.amount.toLocaleString('fr-FR')} FCFA (${c.cantine.badgeText})
2. Nourriture Vie Étudiante (Maquis/Garba) : ${c.foodLife.amount.toLocaleString('fr-FR')} FCFA
3. Nourriture Boulangerie (Pain/Petit-déj) : ${c.boulangerie.amount.toLocaleString('fr-FR')} FCFA
4. Transport Église / Mosquée (1000F A/R) : ${c.transport.amount.toLocaleString('fr-FR')} FCFA
5. La Papotte (Hygiène : Savon, liquide, dentifrice, parfum) : ${c.papotte.amount.toLocaleString('fr-FR')} FCFA
6. Cagnotte Épargne & Réserve ("Pense à demain") : ${calculation.remainingAmount.toLocaleString('fr-FR')} FCFA

--- CONSEIL DE SAGESSE BIBLIQUE STADJAI ---
Verset Clé : ${calculation.wisdom.reference}
${calculation.wisdom.verseText}

Conseil Spirituel :
${calculation.wisdom.spiritualAdvice}

Conseil Anti-Gaspillage :
${calculation.wisdom.antiWasteTip}

Bénédiction & Avenir :
${calculation.wisdom.encouragement}
========================================
Généré sur l'application STADJAI - Université de Bondoukou
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateReportText()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `STADJAI_Budget_Bondoukou_${calculation.period}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-amber-600" />
          <span>Exporter / Sauvegarder mon Plan Budget STADJAI</span>
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Télécharge ou copie le récapitulatif complet et la méditation biblique pour les garder sur ton téléphone.
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
          <span>{copied ? 'Copié !' : 'Copier résumé'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Télécharger TXT</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimer</span>
        </button>
      </div>
    </div>
  );
};
