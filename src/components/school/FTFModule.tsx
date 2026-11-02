import React, { useState, useEffect, useMemo } from 'react';
import { School, FTFData, FTFTransaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getFTF, saveFTF } from '../../services/storage';
import {
  Receipt,
  Plus,
  Trash2,
  Edit3,
  Check,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  X,
  Wallet,
  Coins,
  Calculator,
  Search,
  CheckCircle2,
  Building,
  Save,
  RotateCcw
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface FTFModuleProps {
  school: School;
}

export const FTFModule: React.FC<FTFModuleProps> = ({ school }) => {
  const { isDyDEO, isAEO, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [ftfData, setFtfData] = useState<FTFData>(() => getFTF(school.emisCode));
  const [showAddTx, setShowAddTx] = useState(false);
  const [editingTx, setEditingTx] = useState<FTFTransaction | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'collection' | 'expenditure'>('all');

  // Editable Form for the 4 official requested fields
  const [balanceForm, setBalanceForm] = useState({
    balanceOn30June2026: ftfData.balanceOn30June2026 ?? 0,
    totalIncome: ftfData.totalIncome ?? 0,
    totalExpenditure: ftfData.totalExpenditure ?? 0,
    overrideExpenditure: false
  });

  // New Transaction Form State
  const [newTx, setNewTx] = useState<Partial<FTFTransaction>>({
    date: new Date().toISOString().slice(0, 10),
    type: 'collection',
    description: '',
    amount: 0,
    voucherNo: `FTF-${(ftfData.transactions.length + 1).toString().padStart(2, '0')}`,
    approvedByCommittee: true
  });

  const refreshData = () => {
    const data = getFTF(school.emisCode);
    setFtfData(data);
    setBalanceForm({
      balanceOn30June2026: data.balanceOn30June2026 ?? 0,
      totalIncome: data.totalIncome ?? 0,
      totalExpenditure: data.totalExpenditure ?? 0,
      overrideExpenditure: false
    });
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = (e: any) => {
      if (!e.detail?.schoolEmisCode || e.detail.schoolEmisCode === school.emisCode) {
        refreshData();
      }
    };
    window.addEventListener('ftf_updated', handleUpdate);
    return () => window.removeEventListener('ftf_updated', handleUpdate);
  }, [school.emisCode]);

  const canEdit =
    isDyDEO ||
    isAEO ||
    (currentUser?.role === 'school_user' && currentUser.schoolEmisCode === school.emisCode);

  // Live computed sum of transactions
  const txTotals = useMemo(() => {
    let incomeFromTx = 0;
    let spentFromTx = 0;
    (ftfData.transactions || []).forEach(tx => {
      if (tx.type === 'collection') incomeFromTx += Number(tx.amount || 0);
      if (tx.type === 'expenditure') spentFromTx += Number(tx.amount || 0);
    });
    return { incomeFromTx, spentFromTx };
  }, [ftfData.transactions]);

  // Live calculated current balance based on form inputs
  const liveBalance30June = Number(balanceForm.balanceOn30June2026 || 0);
  const liveTotalIncome = Number(balanceForm.totalIncome || 0);
  const liveExpenditure = balanceForm.overrideExpenditure
    ? Number(balanceForm.totalExpenditure || 0)
    : (txTotals.spentFromTx > 0 ? txTotals.spentFromTx : Number(balanceForm.totalExpenditure || 0));
  const liveCurrentBalance = liveBalance30June + liveTotalIncome - liveExpenditure;

  // Save the 4 official requested fields
  const handleSaveBalances = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: FTFData = {
      ...ftfData,
      balanceOn30June2026: liveBalance30June,
      totalIncome: liveTotalIncome,
      totalExpenditure: liveExpenditure,
      currentBalance: liveCurrentBalance,
      openingBalance: liveBalance30June,
      totalCollected: liveTotalIncome
    };

    saveFTF(updated, currentUser);
    refreshData();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  // Add a new transaction (collection or expenditure)
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || newTx.amount <= 0 || !newTx.description || !currentUser) return;

    const tx: FTFTransaction = {
      id: 'ftf_tx_' + Date.now(),
      date: newTx.date || new Date().toISOString().slice(0, 10),
      type: newTx.type || 'collection',
      description: newTx.description.trim(),
      amount: Number(newTx.amount),
      voucherNo: newTx.voucherNo?.trim() || `FTF-${Date.now()}`,
      approvedByCommittee: true,
      createdAt: new Date().toISOString()
    };

    const newTransactions = [tx, ...ftfData.transactions];

    // Compute new income and expenditure
    let newSpent = 0;
    let newIncome = 0;
    newTransactions.forEach(t => {
      if (t.type === 'expenditure') newSpent += Number(t.amount || 0);
      if (t.type === 'collection') newIncome += Number(t.amount || 0);
    });

    // If new transaction was collection, ensure totalIncome reflects at least the collection sum
    const effectiveIncome = Math.max(Number(ftfData.totalIncome || 0), newIncome);
    const effectiveBalance30June = Number(ftfData.balanceOn30June2026 || 0);
    const effectiveCurrentBalance = effectiveBalance30June + effectiveIncome - newSpent;

    const updated: FTFData = {
      ...ftfData,
      totalIncome: effectiveIncome,
      totalExpenditure: newSpent,
      currentBalance: effectiveCurrentBalance,
      totalCollected: effectiveIncome,
      transactions: newTransactions
    };

    saveFTF(updated, currentUser);
    refreshData();
    setShowAddTx(false);
    setNewTx({
      date: new Date().toISOString().slice(0, 10),
      type: 'collection',
      description: '',
      amount: 0,
      voucherNo: `FTF-${(newTransactions.length + 1).toString().padStart(2, '0')}`,
      approvedByCommittee: true
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Update existing transaction
  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editingTx.amount || editingTx.amount <= 0 || !currentUser) return;

    const newTransactions = ftfData.transactions.map(t =>
      t.id === editingTx.id
        ? {
            ...editingTx,
            amount: Number(editingTx.amount),
            description: editingTx.description.trim()
          }
        : t
    );

    let newSpent = 0;
    let newIncome = 0;
    newTransactions.forEach(t => {
      if (t.type === 'expenditure') newSpent += Number(t.amount || 0);
      if (t.type === 'collection') newIncome += Number(t.amount || 0);
    });

    const effectiveIncome = Math.max(Number(ftfData.totalIncome || 0), newIncome);
    const effectiveBalance30June = Number(ftfData.balanceOn30June2026 || 0);
    const effectiveCurrentBalance = effectiveBalance30June + effectiveIncome - newSpent;

    const updated: FTFData = {
      ...ftfData,
      totalIncome: effectiveIncome,
      totalExpenditure: newSpent,
      currentBalance: effectiveCurrentBalance,
      totalCollected: effectiveIncome,
      transactions: newTransactions
    };

    saveFTF(updated, currentUser);
    refreshData();
    setEditingTx(null);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Delete transaction
  const handleExecuteDeleteTx = () => {
    if (!deleteTxId || !currentUser || !canEdit) return;
    const newTransactions = ftfData.transactions.filter(t => t.id !== deleteTxId);

    let newSpent = 0;
    let newIncome = 0;
    newTransactions.forEach(t => {
      if (t.type === 'expenditure') newSpent += Number(t.amount || 0);
      if (t.type === 'collection') newIncome += Number(t.amount || 0);
    });

    const effectiveIncome = Math.max(Number(ftfData.totalIncome || 0), newIncome);
    const effectiveBalance30June = Number(ftfData.balanceOn30June2026 || 0);
    const effectiveCurrentBalance = effectiveBalance30June + effectiveIncome - newSpent;

    const updated: FTFData = {
      ...ftfData,
      totalIncome: effectiveIncome,
      totalExpenditure: newSpent,
      currentBalance: effectiveCurrentBalance,
      totalCollected: effectiveIncome,
      transactions: newTransactions
    };

    saveFTF(updated, currentUser);
    refreshData();
    setDeleteTxId(null);
  };

  // Filter transactions
  const filteredTransactions = (ftfData.transactions || []).filter(tx => {
    const matchesSearch =
      tx.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.date.includes(searchQuery);
    const matchesType = txTypeFilter === 'all' || tx.type === txTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 1. Official FTF Summary Header Cards (The 4 Requested Things) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Balance on 30-06-2026 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>{isUrdu ? '30-06-2026 کو بقایا بیلنس' : 'Balance on 30-06-2026'}</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            Rs. {(ftfData.balanceOn30June2026 || 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isUrdu ? 'سابقہ سال کا بچت شدہ بیلنس' : 'Carryover Opening Balance'}
          </div>
        </div>

        {/* Card 2: Total Income (30-06-2026 to current date) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <span>{isUrdu ? 'کل آمدن (30-06-2026 تا حال)' : 'Total Income (30-06-2026 to current date)'}</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            Rs. {(ftfData.totalIncome || 0).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'طلباء فیس وصولیاں و فنڈز' : 'Collections & student contributions'}</span>
          </div>
        </div>

        {/* Card 3: Total Expenditure (30-06-2026 to current date) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
            <span>{isUrdu ? 'کل اخراجات (30-06-2026 تا حال)' : 'Total Expenditure (30-06-2026 to current date)'}</span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            Rs. {(ftfData.totalExpenditure || 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            <span>{ftfData.transactions.filter(t => t.type === 'expenditure').length} {isUrdu ? 'واؤچرز منظور شدہ' : 'approved payment vouchers'}</span>
          </div>
        </div>

        {/* Card 4: Current Balance */}
        <div
          className={`p-5 rounded-xl border shadow-2xs ${
            (ftfData.currentBalance || 0) >= 0
              ? 'bg-emerald-50/60 border-emerald-300'
              : 'bg-rose-50/60 border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-1 text-slate-700">
            <span>{isUrdu ? 'موجودہ بیلنس (Current Balance)' : 'Current Balance'}</span>
            <Calculator
              className={`w-4 h-4 ${
                (ftfData.currentBalance || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            />
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              (ftfData.currentBalance || 0) >= 0 ? 'text-emerald-900' : 'text-rose-800'
            }`}
          >
            Rs. {(ftfData.currentBalance || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">
            {isUrdu
              ? 'بقایا 30-06-2026 + کل آمدن − کل اخراجات'
              : 'Balance on 30-06-2026 + Total Income − Total Expenditure'}
          </div>
        </div>
      </div>

      {/* Success Notification Notice */}
      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            {isUrdu
              ? 'فروغِ تعلیم فنڈ (FTF) کے کوائف اور اخراجات کامیابی سے محفوظ ہو گئے!'
              : 'FTF financial statement & vouchers updated successfully!'}
          </span>
        </div>
      )}

      {/* 2. FTF Account & Balance Settings (The 4 Official Requested Things Form) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-800" />
              <span>
                {isUrdu
                  ? 'فروغِ تعلیم فنڈ (FTF) کوائف و آمدن و اخراجات کی تفصیل'
                  : 'FTF Statement: Income, Expenditure & Balances (30-06-2026 to Date)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu
                ? 'موجودہ بیلنس خودکار طریقے سے: (30-06-2026 کا بقایا + کل آمدن) منہا کل اخراجات کے تحت شمار ہوتا ہے۔'
                : 'Current Balance is automatically computed: Balance on 30-06-2026 + Total Income − Total Expenditure.'}
            </p>
          </div>
        </div>

        {canEdit ? (
          <form onSubmit={handleSaveBalances} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Field 1: Balance on 30-06-2026 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isUrdu ? '1. بقایا برائے 30-06-2026 (PKR) *' : '1. Balance on 30-06-2026 (PKR) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={balanceForm.balanceOn30June2026}
                    onChange={e =>
                      setBalanceForm({ ...balanceForm, balanceOn30June2026: Number(e.target.value) })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isUrdu ? 'مالی سال کا سابقہ بقایا' : 'Carryover balance as of 30-06-2026'}
                </span>
              </div>

              {/* Field 2: Total Income (30-06-2026 to current date) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-emerald-800">
                    {isUrdu ? '2. کل آمدن (30-06-2026 تا حال) *' : '2. Total Income (30-06-2026 to date) *'}
                  </label>
                  {txTotals.incomeFromTx > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setBalanceForm({ ...balanceForm, totalIncome: txTotals.incomeFromTx })
                      }
                      className="text-[10px] text-emerald-700 hover:underline cursor-pointer"
                      title="Use sum of collection vouchers"
                    >
                      Use Vouchers (Rs. {txTotals.incomeFromTx.toLocaleString()})
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-emerald-600 font-mono">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={balanceForm.totalIncome}
                    onChange={e =>
                      setBalanceForm({ ...balanceForm, totalIncome: Number(e.target.value) })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold text-emerald-900 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-emerald-50/40"
                  />
                </div>
                <span className="text-[10px] text-emerald-700 mt-1 block">
                  {isUrdu ? 'موصولہ فیس، چندہ اور دیگر آمدنی' : 'Income received from 30-06-2026 onwards'}
                </span>
              </div>

              {/* Field 3: Total Expenditure (30-06-2026 to current date) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-rose-800">
                    {isUrdu ? '3. کل اخراجات (30-06-2026 تا حال) *' : '3. Total Expenditure (30-06-2026 to date) *'}
                  </label>
                  <label className="text-[10px] text-slate-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={balanceForm.overrideExpenditure}
                      onChange={e =>
                        setBalanceForm({ ...balanceForm, overrideExpenditure: e.target.checked })
                      }
                      className="rounded text-rose-600 focus:ring-rose-500 w-3 h-3"
                    />
                    <span>Manual Edit</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-rose-500 font-mono">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    required
                    disabled={!balanceForm.overrideExpenditure && txTotals.spentFromTx > 0}
                    value={
                      balanceForm.overrideExpenditure
                        ? balanceForm.totalExpenditure
                        : (txTotals.spentFromTx > 0 ? txTotals.spentFromTx : balanceForm.totalExpenditure)
                    }
                    onChange={e =>
                      setBalanceForm({ ...balanceForm, totalExpenditure: Number(e.target.value) })
                    }
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      !balanceForm.overrideExpenditure && txTotals.spentFromTx > 0
                        ? 'bg-slate-100 text-rose-800 border-slate-300 cursor-not-allowed'
                        : 'bg-rose-50/40 text-rose-900 border-rose-300'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {!balanceForm.overrideExpenditure && txTotals.spentFromTx > 0
                    ? `Auto-computed from ${ftfData.transactions.filter(t => t.type === 'expenditure').length} expenditure vouchers`
                    : 'Expenditure disbursed from 30-06-2026 onwards'}
                </span>
              </div>

              {/* Field 4: Current Balance (Computed Result) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isUrdu ? '4. موجودہ بقایا (Current Balance)' : '4. Current Balance (Computed)'}
                </label>
                <div
                  className={`px-3 py-2 rounded-lg border font-mono font-black text-sm flex items-center justify-between ${
                    liveCurrentBalance >= 0
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-100/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <span>Rs. {liveCurrentBalance.toLocaleString()}</span>
                  <span className="text-[10px] font-sans font-bold px-1.5 py-0.2 rounded bg-white/70">
                    {liveCurrentBalance >= 0 ? 'Surplus' : 'Deficit'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Rs. {liveBalance30June.toLocaleString()} + Rs. {liveTotalIncome.toLocaleString()} − Rs. {liveExpenditure.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'فروغِ تعلیم فنڈ گوشوارہ محفوظ کریں' : 'Save FTF Financial Statement'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-sans block text-[11px]">Balance on 30-06-2026:</span>
              <strong className="text-slate-900 text-sm">Rs. {(ftfData.balanceOn30June2026 || 0).toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-emerald-700 font-sans block text-[11px]">Total Income:</span>
              <strong className="text-emerald-900 text-sm">Rs. {(ftfData.totalIncome || 0).toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <span className="text-rose-700 font-sans block text-[11px]">Total Expenditure:</span>
              <strong className="text-rose-900 text-sm">Rs. {(ftfData.totalExpenditure || 0).toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-blue-700 font-sans block text-[11px]">Current Balance:</span>
              <strong className="text-blue-900 text-sm">Rs. {(ftfData.currentBalance || 0).toLocaleString()}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 3. Committee & Official Bank Account Header */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">
              {isUrdu ? 'سکول کونسل و فروغِ تعلیم فنڈ کمیٹی:' : 'Authorized FTF School Council Committee:'}
            </span>
            <div className="text-slate-600 mt-0.5">
              {(ftfData.committeeMembers || ['School Head Teacher', 'Parent Representative', 'Senior Teacher']).join(' · ')}
            </div>
          </div>
        </div>
        <div className="text-slate-500 font-mono text-[11px] self-start sm:self-auto">
          Bank Account: {ftfData.accountNumber || `FTF-${school.emisCode}`} ({ftfData.bankName || 'NBP Pindi Gheb'})
        </div>
      </div>

      {/* 4. Transactions & Receipts Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isUrdu ? 'فروغِ تعلیم فنڈ رجسٹر و واؤچرز' : 'FTF Receipts & Expenditure Ledger'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'آمدن (وصولیاں) اور ہم نصابی سرگرمیوں / طلباء بہبود کے تمام مصدقہ واؤچرز'
                : 'Collections and disbursements recorded between 30-06-2026 and current date'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowAddTx(!showAddTx)}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isUrdu ? 'نیا واؤچر درج کریں' : 'New FTF Voucher'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Filter:</span>
            <button
              type="button"
              onClick={() => setTxTypeFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                txTypeFilter === 'all'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'bg-white border text-slate-700 hover:bg-slate-100'
              }`}
            >
              All ({ftfData.transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setTxTypeFilter('collection')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                txTypeFilter === 'collection'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'bg-white border text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              Collections / Receipts ({ftfData.transactions.filter(t => t.type === 'collection').length})
            </button>
            <button
              type="button"
              onClick={() => setTxTypeFilter('expenditure')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                txTypeFilter === 'expenditure'
                  ? 'bg-rose-800 text-white font-bold'
                  : 'bg-white border text-rose-800 hover:bg-rose-50'
              }`}
            >
              Expenditures ({ftfData.transactions.filter(t => t.type === 'expenditure').length})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search voucher or description..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
            />
          </div>
        </div>

        {/* Add Entry Drawer */}
        {showAddTx && (
          <form onSubmit={handleAddTransaction} className="p-5 bg-emerald-50/40 border-b border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>{isUrdu ? 'فروغِ تعلیم فنڈ نیا واؤچر / رسید' : 'Record New FTF Receipt or Expenditure'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddTx(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Type *</label>
                <select
                  value={newTx.type}
                  onChange={e => setNewTx({ ...newTx, type: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 bg-white"
                >
                  <option value="collection">Receipt / Collection (+)</option>
                  <option value="expenditure">Expenditure (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={newTx.date}
                  onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Receipt / Voucher No *</label>
                <input
                  type="text"
                  required
                  value={newTx.voucherNo}
                  onChange={e => setNewTx({ ...newTx, voucherNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTx.amount || ''}
                  onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                  placeholder="e.g. 5000"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Description / Head Teacher Remarks *
                </label>
                <input
                  type="text"
                  required
                  value={newTx.description}
                  onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                  placeholder="e.g. Monthly FTF collection from Class 1-5 or Co-curricular sports prizes"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddTx(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Save to FTF Register
              </button>
            </div>
          </form>
        )}

        {/* Edit Transaction Drawer */}
        {editingTx && (
          <form onSubmit={handleUpdateTransaction} className="p-5 bg-amber-50/70 border-b border-amber-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>{isUrdu ? 'واؤچر میں ترمیم کریں' : `Edit FTF Voucher: ${editingTx.voucherNo}`}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={editingTx.date}
                  onChange={e => setEditingTx({ ...editingTx, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Type *</label>
                <select
                  value={editingTx.type}
                  onChange={e => setEditingTx({ ...editingTx, type: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-600 bg-white"
                >
                  <option value="collection">Collection (آمدن +)</option>
                  <option value="expenditure">Expenditure (خرچ -)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Receipt / Voucher No *</label>
                <input
                  type="text"
                  required
                  value={editingTx.voucherNo}
                  onChange={e => setEditingTx({ ...editingTx, voucherNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingTx.amount || ''}
                  onChange={e => setEditingTx({ ...editingTx, amount: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Description / Remarks *
                </label>
                <input
                  type="text"
                  required
                  value={editingTx.description}
                  onChange={e => setEditingTx({ ...editingTx, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Update FTF Entry
              </button>
            </div>
          </form>
        )}

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Receipt / Voucher</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 font-mono text-right">Amount (PKR)</th>
                {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="py-8 text-center text-slate-400">
                    {isUrdu ? 'کوئی اندراج موجود نہیں ہے۔' : 'No FTF transactions recorded yet.'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {tx.voucherNo}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {tx.type === 'collection' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Collection (+)
                        </span>
                      ) : (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          Expenditure (-)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800">
                      {tx.description}
                    </td>
                    <td className={`py-2.5 px-4 font-mono font-bold text-right whitespace-nowrap ${
                      tx.type === 'collection' ? 'text-emerald-800' : 'text-rose-700'
                    }`}>
                      {tx.type === 'collection' ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
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
                            title="Edit Entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTxId(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Entry"
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTxId !== null}
        title={isUrdu ? 'اندراج حذف کریں' : 'Delete FTF Transaction'}
        message={
          isUrdu
            ? 'کیا آپ واقعی فروغِ تعلیم فنڈ کے اس اندراج کو رجسٹر سے حذف کرنا چاہتے ہیں؟'
            : 'Are you sure you want to delete this FTF collection/expense record from the register?'
        }
        confirmText={isUrdu ? 'حذف کریں' : 'Delete Entry'}
        cancelText={isUrdu ? 'منسوخ کریں' : 'Cancel'}
        onConfirm={handleExecuteDeleteTx}
        onCancel={() => setDeleteTxId(null)}
      />
    </div>
  );
};
