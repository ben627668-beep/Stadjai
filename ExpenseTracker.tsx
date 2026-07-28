import React, { useState, useEffect } from 'react';
import { Notebook, Plus, Trash2, Wallet, Calendar, AlertCircle } from 'lucide-react';
import { CategoryId, ExpenseLog } from '../types';

interface ExpenseTrackerProps {
  totalBudget: number;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ totalBudget }) => {
  const [expenses, setExpenses] = useState<ExpenseLog[]>(() => {
    try {
      const saved = localStorage.getItem('stadjai_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('cantine');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('stadjai_expenses', JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses:', e);
    }
  }, [expenses]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const newExpense: ExpenseLog = {
      id: Date.now().toString(),
      title: title.trim(),
      categoryId,
      amount: numAmount,
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      note: note.trim() || undefined,
    };

    setExpenses([newExpense, ...expenses]);
    setTitle('');
    setAmount('');
    setNote('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingReal = totalBudget - totalSpent;

  const categoryLabels: Record<CategoryId, string> = {
    cantine: 'Tickets Cantine (200F / 2000F)',
    food: 'Nourriture Vie Étudiante & Boulangerie',
    transport: 'Transport (1000F A/R)',
    papotte: 'La Papotte (Hygiène 2000F+)',
    reserve: 'Épargne & Autre',
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg my-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Notebook className="w-6 h-6 text-amber-600" />
            <span>Mon Journal des Dépenses en Direct</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Note tes achats au fur et à mesure à Bondoukou pour ne pas dépasser ton budget STADJAI.
          </p>
        </div>

        {/* Real Balance Widget */}
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center gap-4 border border-slate-800">
          <div>
            <span className="text-2xs text-slate-400 font-bold uppercase block">Total Dépensé</span>
            <span className="text-base font-black text-amber-400 font-mono">
              {totalSpent.toLocaleString('fr-FR')} F
            </span>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-2xs text-slate-400 font-bold uppercase block">Reste Réel</span>
            <span className={`text-base font-black font-mono ${remainingReal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {remainingReal.toLocaleString('fr-FR')} F
            </span>
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      <form onSubmit={handleAddExpense} className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200/60 space-y-4">
        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
          ➕ Enregistrer une nouvelle dépense à Bondoukou :
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          
          <input
            type="text"
            placeholder="Ex: Souche de 10 tickets cantine"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3.5 py-2.5 bg-white text-slate-900 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value as CategoryId)}
            className="px-3.5 py-2.5 bg-white text-slate-900 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {Object.entries(categoryLabels).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="number"
              placeholder="Montant (ex: 2000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-3.5 pr-10 py-2.5 bg-white text-slate-900 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              FCFA
            </span>
          </div>

          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter la dépense</span>
          </button>

        </div>
      </form>

      {/* Expenses History Table */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>Historique de tes dépenses récentes ({expenses.length})</span>
        </h4>

        {expenses.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-1">
            <Wallet className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-500">Aucune dépense enregistrée pour le moment.</p>
            <p>Ajoute ton premier achat (ex: 1 ticket cantine à 200F ou savon papotte à 2000F).</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {expenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between gap-4 group hover:bg-slate-50 px-2 rounded-xl transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{exp.title}</span>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {categoryLabels[exp.categoryId] || exp.categoryId}
                    </span>
                  </div>
                  <span className="text-2xs text-slate-400 font-medium block mt-0.5">{exp.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-900 font-mono">
                    -{exp.amount.toLocaleString('fr-FR')} FCFA
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="text-slate-300 hover:text-red-600 p-1 rounded-md transition-all opacity-80 group-hover:opacity-100"
                    title="Supprimer la dépense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
