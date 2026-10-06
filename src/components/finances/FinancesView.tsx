import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import { convertUsdToUah, convertUahToUsd } from '../../services/nbuService';

export const FinancesView: React.FC = () => {
  const { deals, expenses, expenseGroups, addExpense, nbuRate, setSelectedDealId } = useCrm();

  const [activeTab, setActiveTab] = useState<'installments' | 'expenses' | 'calculator'>('installments');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // New expense form state
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState<number>(500);
  const [expGroupId, setExpGroupId] = useState(expenseGroups[0]?.id || 'eg-1');

  // Currency calculator state
  const [calcUsd, setCalcUsd] = useState(50000);
  const [calcUah, setCalcUah] = useState(Math.round(50000 * nbuRate.usd));

  const handleUsdChange = (val: number) => {
    setCalcUsd(val);
    setCalcUah(convertUsdToUah(val, nbuRate.usd));
  };

  const handleUahChange = (val: number) => {
    setCalcUah(val);
    setCalcUsd(convertUahToUsd(val, nbuRate.usd));
  };

  // Collect all payments from deals
  const allPayments = deals.flatMap(d => (d.payments || []).map(p => ({
    ...p,
    dealTitle: d.title,
    sellerName: d.sellerName
  })));

  const totalPlannedInstallments = allPayments.reduce((sum, p) => sum + p.plannedAmount, 0);
  const totalPaidInstallments = allPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim()) return;

    const group = expenseGroups.find(g => g.id === expGroupId);
    await addExpense({
      title: expTitle,
      amount: expAmount,
      groupId: expGroupId,
      groupName: group?.name || 'Інші витрати',
      date: new Date().toISOString().split('T')[0],
      paymentStatus: 'paid'
    });

    setExpTitle('');
    setShowAddExpenseModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] tracking-tight">
              Фінанси, розстрочки та платежі
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb012] text-[#01283c]">
              G-PLUS API v1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            Графіки оплат за договорами, розстрочка девелопера, фактичні надходження та операційні витрати
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Додати витрату девелопера</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Загальний пул розстрочок</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
            ${totalPlannedInstallments.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">
            ~{convertUsdToUah(totalPlannedInstallments, nbuRate.usd).toLocaleString()} ₴
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Фактично сплачено</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
            ${totalPaidInstallments.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">
            {totalPlannedInstallments ? Math.round((totalPaidInstallments / totalPlannedInstallments) * 100) : 0}% виконано
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Операційні витрати девелопера</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#ffb012] mt-1 tracking-tight">
            ${totalExpenses.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">
            Маркетинг, реклама, комісії АН
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">Офіційний курс НБУ</span>
          <p className="text-2xl font-black text-[#01283c] dark:text-[#f8fafc] mt-1 tracking-tight">
            {nbuRate.usd} ₴ / $
          </p>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 block">
            EUR: {nbuRate.eur} ₴ / €
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0] dark:border-[#163042]">
        <button
          onClick={() => setActiveTab('installments')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'installments'
              ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
              : 'border-transparent text-[#64748b] hover:text-[#01283c]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Графік оплат за угодами ({allPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
              : 'border-transparent text-[#64748b] hover:text-[#01283c]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Статті витрат девелопера ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'border-[#01283c] text-[#01283c] dark:border-[#ffb012] dark:text-[#ffb012]'
              : 'border-transparent text-[#64748b] hover:text-[#01283c]'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Калькулятор НБУ конвертації</span>
        </button>
      </div>

      {/* Installments Tab */}
      {activeTab === 'installments' && (
        <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f6f8] dark:bg-[#06131c] text-[#64748b] dark:text-[#94a3b8] uppercase text-[10px] font-bold border-b border-[#e2e8f0] dark:border-[#163042]">
                <tr>
                  <th className="px-5 py-3.5">Угода та об'єкт</th>
                  <th className="px-5 py-3.5">Покупець</th>
                  <th className="px-5 py-3.5">Плановий термін</th>
                  <th className="px-5 py-3.5">Сума до сплати ($)</th>
                  <th className="px-5 py-3.5">В еквіваленті (₴)</th>
                  <th className="px-5 py-3.5 text-right">Статус траншу</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#163042]">
                {allPayments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedDealId(p.dealId)}
                    className="hover:bg-[#f4f6f8] dark:hover:bg-[#06131c] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#01283c] dark:text-[#f8fafc] block">{p.dealTitle}</span>
                      <span className="text-[11px] text-[#64748b]">{p.description}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#01283c] dark:text-[#f8fafc]">
                      {p.sellerName}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#64748b]">
                      {p.dueDate}
                    </td>
                    <td className="px-5 py-3.5 font-black text-[#01283c] dark:text-[#ffb012]">
                      ${p.plannedAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-[#64748b]">
                      {convertUsdToUah(p.plannedAmount, nbuRate.usd).toLocaleString()} ₴
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {p.status === 'paid' ? 'Сплачено' : 'Очікується'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white dark:bg-[#0c1e2b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                    {exp.groupName}
                  </span>
                  <h4 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc] mt-0.5">{exp.title}</h4>
                  <span className="text-[11px] text-[#64748b] mt-1 block">Дата: {exp.date}</span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-[#01283c] dark:text-[#ffb012] block">
                    ${exp.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#64748b] block">
                    (~{convertUsdToUah(exp.amount, nbuRate.usd).toLocaleString()} ₴)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currency Converter Tab */}
      {activeTab === 'calculator' && (
        <div className="bg-white dark:bg-[#0c1e2b] p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#163042] shadow-xs max-w-xl space-y-4">
          <h3 className="font-bold text-sm text-[#01283c] dark:text-[#f8fafc]">
            Конвертація вартості квадратного метра та об'єктів за курсом НБУ
          </h3>
          <p className="text-xs text-[#64748b]">
            Офіційний курс Національного Банку України на сьогодні: <strong>{nbuRate.usd} грн / 1 USD</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc] block mb-1">
                Сума в доларах ($ USD)
              </label>
              <input
                type="number"
                value={calcUsd}
                onChange={(e) => handleUsdChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-black text-[#01283c] dark:text-[#ffb012]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#01283c] dark:text-[#f8fafc] block mb-1">
                Сума в гривні (₴ UAH)
              </label>
              <input
                type="number"
                value={calcUah}
                onChange={(e) => handleUahChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-sm font-black text-[#01283c] dark:text-[#f8fafc]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01283c]/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1e2b] rounded-2xl border border-[#e2e8f0] dark:border-[#163042] p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-black text-[#01283c] dark:text-[#f8fafc]">
              Додати витрату девелопера
            </h3>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">Категорія витрат</label>
                <select
                  value={expGroupId}
                  onChange={(e) => setExpGroupId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-xs font-bold"
                >
                  {expenseGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">Призначення платежу / Назва</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="напр. Білборди на вул. Мазепи"
                  className="w-full mt-1 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#01283c] dark:text-[#f8fafc]">Сума ($ USD)</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-[#f4f6f8] dark:bg-[#06131c] border border-[#e2e8f0] dark:border-[#163042] rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 font-bold text-[#64748b]"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01283c] hover:bg-[#023854] dark:bg-[#ffb012] dark:hover:bg-[#e59e10] text-white dark:text-[#01283c] rounded-xl font-bold"
                >
                  Зберегти витрату
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
