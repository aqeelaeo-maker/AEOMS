import React, { useState, useEffect, useMemo } from 'react';
import { School, NSBData, NSBTransaction, NSBHead } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getNSB, saveNSB } from '../../services/storage';
import {
  Coins,
  Plus,
  Trash2,
  Edit3,
  Save,
  Check,
  Receipt,
  Building,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  Calculator,
  Wallet,
  Calendar,
  X
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface NSBModuleProps {
  school: School;
}

const NSB_HEADS: NSBHead[] = [
  'School Cleaning & Hygiene',
  'Minor Repair & Maintenance',
  'Stationery & Examination',
  'Utility Bills (Electricity/Water/Gas)',
  'Instructional Aids & TLM',
  'IT / Computer Lab Maintenance',
  'Sports & Co-Curricular',
  'Miscellaneous & First Aid'
];

export const NSBModule: React.FC<NSBModuleProps> = ({ school }) => {
  const { isDyDEO, isAEO, isSupervisor, currentUser } = useAuth();
  const { isUrdu } = useLanguage();

  const [nsbData, setNsbData] = useState<NSBData>(() => getNSB(school.emisCode));
  const [showAddTx, setShowAddTx] = useState(false);
  const [editingTx, setEditingTx] = useState<NSBTransaction | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  // Search & Filter state for expenditures
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHeadFilter, setSelectedHeadFilter] = useState<string>('all');

  // Income & Installments editable form state
  const [incomeForm, setIncomeForm] = useState({
    balanceOn30June2026: nsbData.balanceOn30June2026 ?? 0,
    firstInstallment: nsbData.firstInstallment ?? 0,
    secondInstallment: nsbData.secondInstallment ?? 0,
    thirdInstallment: nsbData.thirdInstallment ?? 0,
    forthInstallment: nsbData.forthInstallment ?? 0
  });

  // New Transaction Form State
  const [newTx, setNewTx] = useState<Partial<NSBTransaction>>({
    date: new Date().toISOString().slice(0, 10),
    voucherNo: `V-${(nsbData.transactions.length + 1).toString().padStart(2, '0')}/NSB`,
    head: 'School Cleaning & Hygiene',
    description: '',
    amount: 0,
    vendorName: '',
    receiptNumber: ''
  });

  // Keep state updated when active school changes or updates occur
  const refreshData = () => {
    const data = getNSB(school.emisCode);
    setNsbData(data);
    setIncomeForm({
      balanceOn30June2026: data.balanceOn30June2026 ?? 0,
      firstInstallment: data.firstInstallment ?? 0,
      secondInstallment: data.secondInstallment ?? 0,
      thirdInstallment: data.thirdInstallment ?? 0,
      forthInstallment: data.forthInstallment ?? 0
    });
  };

  useEffect(() => {
    refreshData();

    const handleUpdate = (e: any) => {
      if (!e.detail?.schoolEmisCode || e.detail.schoolEmisCode === school.emisCode) {
        refreshData();
      }
    };
    window.addEventListener('nsb_updated', handleUpdate);
    return () => window.removeEventListener('nsb_updated', handleUpdate);
  }, [school.emisCode]);

  const canEdit =
    isDyDEO ||
    isAEO ||
    (currentUser?.role === 'school_user' && currentUser.schoolEmisCode === school.emisCode);

  // Real-time calculation of Total Income from form inputs
  const liveTotalIncome = useMemo(() => {
    return (
      Number(incomeForm.balanceOn30June2026 || 0) +
      Number(incomeForm.firstInstallment || 0) +
      Number(incomeForm.secondInstallment || 0) +
      Number(incomeForm.thirdInstallment || 0) +
      Number(incomeForm.forthInstallment || 0)
    );
  }, [incomeForm]);

  // Current Balance based on live total income and recorded expenditures
  const liveCurrentBalance = liveTotalIncome - nsbData.totalExpenditure;

  // Handle saving income and installments
  const handleUpdateIncomeAndInstallments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: NSBData = {
      ...nsbData,
      balanceOn30June2026: Number(incomeForm.balanceOn30June2026 || 0),
      firstInstallment: Number(incomeForm.firstInstallment || 0),
      secondInstallment: Number(incomeForm.secondInstallment || 0),
      thirdInstallment: Number(incomeForm.thirdInstallment || 0),
      forthInstallment: Number(incomeForm.forthInstallment || 0),
      totalIncome: liveTotalIncome,
      currentBalance: liveTotalIncome - nsbData.totalExpenditure,
      // Keep legacy fields in sync
      openingBalance: Number(incomeForm.balanceOn30June2026 || 0),
      q1Funds: Number(incomeForm.firstInstallment || 0),
      q2Funds: Number(incomeForm.secondInstallment || 0),
      q3Funds: Number(incomeForm.thirdInstallment || 0),
      q4Funds: Number(incomeForm.forthInstallment || 0),
      totalReceived: liveTotalIncome
    };

    saveNSB(updated, currentUser);
    refreshData();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  // Handle adding new expenditure transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || newTx.amount <= 0 || !newTx.description || !currentUser) return;

    const tx: NSBTransaction = {
      id: 'nsb_tx_' + Date.now(),
      date: newTx.date || new Date().toISOString().slice(0, 10),
      voucherNo: newTx.voucherNo || `V-NSB-${Date.now()}`,
      head: (newTx.head as NSBHead) || 'School Cleaning & Hygiene',
      description: newTx.description.trim(),
      amount: Number(newTx.amount),
      vendorName: (newTx.vendorName || '').trim(),
      receiptNumber: (newTx.receiptNumber || '').trim(),
      createdAt: new Date().toISOString()
    };

    const updatedTransactions = [tx, ...nsbData.transactions];
    const updated: NSBData = {
      ...nsbData,
      transactions: updatedTransactions
    };

    saveNSB(updated, currentUser);
    refreshData();
    setShowAddTx(false);
    setNewTx({
      date: new Date().toISOString().slice(0, 10),
      voucherNo: `V-${(updatedTransactions.length + 1).toString().padStart(2, '0')}/NSB`,
      head: 'School Cleaning & Hygiene',
      description: '',
      amount: 0,
      vendorName: '',
      receiptNumber: ''
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  // Handle updating an existing expenditure transaction
  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editingTx.amount || editingTx.amount <= 0 || !currentUser) return;

    const updatedTransactions = nsbData.transactions.map(t =>
      t.id === editingTx.id ? { ...editingTx, amount: Number(editingTx.amount) } : t
    );

    const updated: NSBData = {
      ...nsbData,
      transactions: updatedTransactions
    };

    saveNSB(updated, currentUser);
    refreshData();
    setEditingTx(null);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  // Safe non-blocking delete expenditure handler
  const handleExecuteDeleteTx = () => {
    if (!deleteTxId || !currentUser || !canEdit) return;
    const updated = {
      ...nsbData,
      transactions: nsbData.transactions.filter(t => t.id !== deleteTxId)
    };
    saveNSB(updated, currentUser);
    refreshData();
    setDeleteTxId(null);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  // Filtered transactions list
  const filteredTransactions = nsbData.transactions.filter(tx => {
    const matchesHead = selectedHeadFilter === 'all' || tx.head === selectedHeadFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      tx.voucherNo.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      tx.vendorName.toLowerCase().includes(q) ||
      (tx.receiptNumber && tx.receiptNumber.toLowerCase().includes(q)) ||
      tx.date.includes(q);
    return matchesHead && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Overview KPI Cards displaying user-requested official fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Balance on 30-06-2026 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>{isUrdu ? 'بقایا برائے 30-06-2026' : 'Balance on 30-06-2026'}</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            Rs. {nsbData.balanceOn30June2026.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isUrdu ? 'سابقہ مالی سال کا بچت شدہ بیلنس' : 'Carryover Opening Balance'}
          </div>
        </div>

        {/* 2. Total Income */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <span>{isUrdu ? 'کل موصولہ آمدن (Total Income)' : 'Total Income'}</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            Rs. {nsbData.totalIncome.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 leading-snug">
            {isUrdu
              ? 'بقایا 30-06-2026 + پہلی + دوسری + تیسری + چوتھی قسط کا مجموعہ'
              : 'Sum of Balance on 30-06-2026 + 1st, 2nd, 3rd & 4th Installments'}
          </div>
        </div>

        {/* 3. Total Expenditure */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
            <span>{isUrdu ? 'کل اخراجات (Total Expenditure)' : 'Total Expenditure'}</span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            Rs. {nsbData.totalExpenditure.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {nsbData.transactions.length} {isUrdu ? 'واؤچرز رجسٹرڈ' : 'audited payment vouchers'}
          </div>
        </div>

        {/* 4. Current Balance */}
        <div
          className={`p-5 rounded-xl border shadow-2xs ${
            nsbData.currentBalance >= 0
              ? 'bg-emerald-50/60 border-emerald-300'
              : 'bg-rose-50/60 border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-1 text-slate-700">
            <span>{isUrdu ? 'موجودہ بقایا (Current Balance)' : 'Current Balance'}</span>
            <Calculator
              className={`w-4 h-4 ${
                nsbData.currentBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            />
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              nsbData.currentBalance >= 0 ? 'text-emerald-900' : 'text-rose-800'
            }`}
          >
            Rs. {nsbData.currentBalance.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1">
            <span>
              {isUrdu
                ? 'کل آمدن منہا کل اخراجات'
                : 'Total Income − Total Expenditure'}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Notice */}
      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            {isUrdu
              ? 'نان سیلری بجٹ و اخراجات کی معلومات کامیابی سے محفوظ ہو گئیں!'
              : 'NSB financial statement & transactions updated successfully!'}
          </span>
        </div>
      )}

      {/* Income & Installments Configuration Form (Requested Fields) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-800" />
              <span>
                {isUrdu
                  ? 'نان سیلری بجٹ آمدن و اقساط فنڈز کی تفصیل'
                  : 'NSB Funds Income & Installments Structure'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu
                ? 'کل آمدن = بقایا برائے 30-06-2026 + پہلی قسط + دوسری قسط + تیسری قسط + چوتھی قسط'
                : 'Total Income is the sum of: Balance on 30-06-2026 + First, Second, Third, and Forth Installment'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500 block">
              {isUrdu ? 'مالی سال:' : 'Financial Year:'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">
              {nsbData.financialYear}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateIncomeAndInstallments} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* 1. Balance on 30-06-2026 */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUrdu ? 'بقایا برائے 30-06-2026' : 'Balance on 30-06-2026'}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">Rs.</span>
                <input
                  type="number"
                  min="0"
                  disabled={!canEdit}
                  value={incomeForm.balanceOn30June2026}
                  onChange={e =>
                    setIncomeForm({
                      ...incomeForm,
                      balanceOn30June2026: Number(e.target.value)
                    })
                  }
                  className="w-full pl-9 pr-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white disabled:bg-slate-100"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Opening Carryover</span>
            </div>

            {/* 2. First Installment */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUrdu ? 'پہلی قسط (1st Installment)' : 'First Installment'}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">Rs.</span>
                <input
                  type="number"
                  min="0"
                  disabled={!canEdit}
                  value={incomeForm.firstInstallment}
                  onChange={e =>
                    setIncomeForm({
                      ...incomeForm,
                      firstInstallment: Number(e.target.value)
                    })
                  }
                  className="w-full pl-9 pr-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white disabled:bg-slate-100"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Q1 Fund Tranche</span>
            </div>

            {/* 3. Second Installment */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUrdu ? 'دوسری قسط (2nd Installment)' : 'Second Installment'}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">Rs.</span>
                <input
                  type="number"
                  min="0"
                  disabled={!canEdit}
                  value={incomeForm.secondInstallment}
                  onChange={e =>
                    setIncomeForm({
                      ...incomeForm,
                      secondInstallment: Number(e.target.value)
                    })
                  }
                  className="w-full pl-9 pr-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white disabled:bg-slate-100"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Q2 Fund Tranche</span>
            </div>

            {/* 4. Third Installment */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUrdu ? 'تیسری قسط (3rd Installment)' : 'Third Installment'}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">Rs.</span>
                <input
                  type="number"
                  min="0"
                  disabled={!canEdit}
                  value={incomeForm.thirdInstallment}
                  onChange={e =>
                    setIncomeForm({
                      ...incomeForm,
                      thirdInstallment: Number(e.target.value)
                    })
                  }
                  className="w-full pl-9 pr-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white disabled:bg-slate-100"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Q3 Fund Tranche</span>
            </div>

            {/* 5. Forth Installment */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUrdu ? 'چوتھی قسط (4th Installment)' : 'Forth Installment'}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">Rs.</span>
                <input
                  type="number"
                  min="0"
                  disabled={!canEdit}
                  value={incomeForm.forthInstallment}
                  onChange={e =>
                    setIncomeForm({
                      ...incomeForm,
                      forthInstallment: Number(e.target.value)
                    })
                  }
                  className="w-full pl-9 pr-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white disabled:bg-slate-100"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Q4 Fund Tranche</span>
            </div>
          </div>

          {/* Dynamic Real-time Calculations Ribbon */}
          <div className="p-3.5 bg-emerald-950 text-white rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-300">
                  {isUrdu ? 'حساب کا کلیہ (Formula):' : 'Formula:'}
                </span>
                <span className="text-[11px] text-emerald-100 font-mono">
                  [Rs. {incomeForm.balanceOn30June2026.toLocaleString()}] + [Rs.{' '}
                  {incomeForm.firstInstallment.toLocaleString()}] + [Rs.{' '}
                  {incomeForm.secondInstallment.toLocaleString()}] + [Rs.{' '}
                  {incomeForm.thirdInstallment.toLocaleString()}] + [Rs.{' '}
                  {incomeForm.forthInstallment.toLocaleString()}]
                </span>
              </div>
              <div className="text-xs text-slate-200">
                {isUrdu ? 'کل موصولہ آمدن:' : 'Calculated Total Income:'}{' '}
                <strong className="text-amber-400 font-mono text-sm">
                  Rs. {liveTotalIncome.toLocaleString()}
                </strong>{' '}
                · {isUrdu ? 'موجودہ خالص بقایا:' : 'Net Current Balance:'}{' '}
                <strong className="text-white font-mono text-sm">
                  Rs. {liveCurrentBalance.toLocaleString()}
                </strong>
              </div>
            </div>

            {canEdit && (
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isUrdu ? 'آمدن و اقساط محفوظ کریں' : 'Save Income & Installments'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Head-wise Expenditure Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span>
            {isUrdu
              ? 'ہیڈ وار اخراجات کی تفصیل (Govt. Prescribed Budget Heads)'
              : 'Expenditures by Prescribed Budget Head'}
          </span>
          <span className="text-xs font-normal text-slate-500 font-mono">
            Total Spent: Rs. {nsbData.totalExpenditure.toLocaleString()}
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {NSB_HEADS.map(head => {
            const spentOnHead = nsbData.expendituresByHead?.[head] || 0;
            return (
              <div
                key={head}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
              >
                <div className="text-[11px] font-medium text-slate-600 leading-tight h-8 line-clamp-2">
                  {head}
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-2">
                  Rs. {spentOnHead.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vouchers Register with Full CRUD (Add, Edit, Delete, Filter) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-800" />
              <span>
                {isUrdu ? 'اخراجات کیش بک اور واؤچرز رجسٹر' : 'NSB Cash Book & Expenditures Register'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu
                ? 'تمام ادائیگیوں کے تصدیق شدہ بلز اور رسیدیں (CRUD اختیارات دستیاب)'
                : 'Itemized expenditure vouchers with full CRUD (Create, Edit, Delete)'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder={isUrdu ? 'واؤچر یا تفصیل تلاش کریں...' : 'Search vouchers...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 w-44 sm:w-56"
              />
            </div>

            {/* Head Filter */}
            <select
              value={selectedHeadFilter}
              onChange={e => setSelectedHeadFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 bg-white"
            >
              <option value="all">{isUrdu ? 'تمام ہیڈز' : 'All Budget Heads'}</option>
              {NSB_HEADS.map(h => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setEditingTx(null);
                  setShowAddTx(!showAddTx);
                }}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{isUrdu ? 'نیا واؤچر درج کریں' : 'Record Expenditure'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Expenditure Voucher Drawer / Form */}
        {showAddTx && (
          <form
            onSubmit={handleAddTransaction}
            className="p-5 bg-emerald-50/50 border-b border-emerald-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {isUrdu ? 'نئے اخراجات واؤچر کا اندراج' : 'New NSB Expenditure Voucher Entry'}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddTx(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={newTx.date}
                  onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Voucher Number *
                </label>
                <input
                  type="text"
                  required
                  value={newTx.voucherNo}
                  onChange={e => setNewTx({ ...newTx, voucherNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Budget Head *
                </label>
                <select
                  value={newTx.head}
                  onChange={e => setNewTx({ ...newTx, head: e.target.value as NSBHead })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                >
                  {NSB_HEADS.map(h => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Amount (PKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTx.amount || ''}
                  onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                  placeholder="e.g. 8500"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Vendor / Payee Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTx.vendorName}
                  onChange={e => setNewTx({ ...newTx, vendorName: e.target.value })}
                  placeholder="e.g. Attock Traders"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Receipt / Invoice No.
                </label>
                <input
                  type="text"
                  value={newTx.receiptNumber}
                  onChange={e => setNewTx({ ...newTx, receiptNumber: e.target.value })}
                  placeholder="e.g. INV-4402"
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Purpose / Itemized Description *
                </label>
                <input
                  type="text"
                  required
                  value={newTx.description}
                  onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                  placeholder="e.g. Purchased 5 ceiling fan capacitors, 10 LED bulbs, and electric wire"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddTx(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-xs"
              >
                Save Voucher to Register
              </button>
            </div>
          </form>
        )}

        {/* Edit Voucher Modal / Drawer */}
        {editingTx && (
          <form
            onSubmit={handleUpdateTransaction}
            className="p-5 bg-amber-50/60 border-b border-amber-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {isUrdu ? 'واؤچر کی ترمیم (Edit Voucher)' : `Edit Voucher ${editingTx.voucherNo}`}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={editingTx.date}
                  onChange={e => setEditingTx({ ...editingTx, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Voucher Number *
                </label>
                <input
                  type="text"
                  required
                  value={editingTx.voucherNo}
                  onChange={e => setEditingTx({ ...editingTx, voucherNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Budget Head *
                </label>
                <select
                  value={editingTx.head}
                  onChange={e => setEditingTx({ ...editingTx, head: e.target.value as NSBHead })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-600 bg-white"
                >
                  {NSB_HEADS.map(h => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Amount (PKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingTx.amount || ''}
                  onChange={e => setEditingTx({ ...editingTx, amount: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Vendor / Payee Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingTx.vendorName}
                  onChange={e => setEditingTx({ ...editingTx, vendorName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Receipt / Invoice No.
                </label>
                <input
                  type="text"
                  value={editingTx.receiptNumber}
                  onChange={e => setEditingTx({ ...editingTx, receiptNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Purpose / Itemized Description *
                </label>
                <input
                  type="text"
                  required
                  value={editingTx.description}
                  onChange={e => setEditingTx({ ...editingTx, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs shadow-xs"
              >
                Update Voucher Details
              </button>
            </div>
          </form>
        )}

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Budget Head</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Vendor & Receipt</th>
                <th className="py-3 px-4 font-mono text-right">Amount (PKR)</th>
                {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {searchQuery || selectedHeadFilter !== 'all'
                      ? isUrdu
                        ? 'تلاش کے مطابق کوئی واؤچر نہیں ملا۔'
                        : 'No expenditure vouchers match your search criteria.'
                      : isUrdu
                      ? 'ابھی کوئی واؤچر درج نہیں ہے۔'
                      : 'No expenditure transactions recorded yet.'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {tx.voucherNo}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {tx.head}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 max-w-xs truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <div>{tx.vendorName}</div>
                      {tx.receiptNumber && (
                        <div className="text-[10px] font-mono text-slate-400">
                          {tx.receiptNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-right whitespace-nowrap">
                      Rs. {tx.amount.toLocaleString()}
                    </td>
                    {canEdit && (
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddTx(false);
                              setEditingTx({ ...tx });
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Edit Voucher Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTxId(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Designated Bank Account Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{nsbData.bankName}</div>
            <div className="text-[11px] text-slate-500">
              {nsbData.bankBranch} · Official NSB Drawing Account
            </div>
          </div>
        </div>
        <div className="font-mono text-xs bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-slate-800 font-bold">
          {nsbData.accountNumber}
        </div>
      </div>

      {/* In-app Confirmation Modal for Deleting Voucher (Iframe-safe) */}
      <ConfirmModal
        isOpen={deleteTxId !== null}
        title={isUrdu ? 'واؤچر حذف کریں' : 'Delete NSB Voucher'}
        message={
          isUrdu
            ? 'کیا آپ واقعی اس واؤچر کو رجسٹر سے مستقل طور پر حذف کرنا چاہتے ہیں؟'
            : 'Are you sure you want to permanently remove this NSB expenditure voucher from the register?'
        }
        confirmText={isUrdu ? 'حذف کریں' : 'Delete Voucher'}
        cancelText={isUrdu ? 'منسوخ کریں' : 'Cancel'}
        onConfirm={handleExecuteDeleteTx}
        onCancel={() => setDeleteTxId(null)}
      />
    </div>
  );
};
