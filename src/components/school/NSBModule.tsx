import React, { useState, useEffect } from 'react';
import { School, NSBData, NSBTransaction, NSBHead } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getNSB, saveNSB } from '../../services/storage';
import { Coins, Plus, Trash2, Save, Check, Receipt, Building, ArrowDownRight, ArrowUpRight } from 'lucide-react';

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
  const { isAEO, isSupervisor, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [nsbData, setNsbData] = useState<NSBData>(() => getNSB(school.emisCode));
  const [showAddTx, setShowAddTx] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

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

  useEffect(() => {
    const data = getNSB(school.emisCode);
    setNsbData(data);
  }, [school.emisCode]);

  const canEdit = isAEO || (currentUser?.role === 'school_user' && currentUser.schoolEmisCode === school.emisCode);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || newTx.amount <= 0 || !newTx.description || !currentUser) return;

    const tx: NSBTransaction = {
      id: 'nsb_tx_' + Date.now(),
      date: newTx.date || new Date().toISOString().slice(0, 10),
      voucherNo: newTx.voucherNo || `V-NSB-${Date.now()}`,
      head: (newTx.head as NSBHead) || 'School Cleaning & Hygiene',
      description: newTx.description || '',
      amount: Number(newTx.amount),
      vendorName: newTx.vendorName || '',
      receiptNumber: newTx.receiptNumber || '',
      createdAt: new Date().toISOString()
    };

    const updatedTransactions = [tx, ...nsbData.transactions];
    const updated = {
      ...nsbData,
      transactions: updatedTransactions
    };

    saveNSB(updated, currentUser);
    setNsbData(getNSB(school.emisCode));
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
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleDeleteTransaction = (txId: string) => {
    if (!currentUser || !canEdit) return;
    const confirmDelete = window.confirm(
      isUrdu ? 'کیا آپ اس واؤچر کو رجسٹر سے حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to remove this voucher?'
    );
    if (!confirmDelete) return;

    const updated = {
      ...nsbData,
      transactions: nsbData.transactions.filter(t => t.id !== txId)
    };
    saveNSB(updated, currentUser);
    setNsbData(getNSB(school.emisCode));
  };

  const handleUpdateAllocations = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    saveNSB(nsbData, currentUser);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'کل موصولہ فنڈز (بمعہ سابقہ بقایا)' : 'Total Funds Available'}
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            Rs. {nsbData.totalReceived.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isUrdu ? 'سالانہ منظوری:' : 'Annual Quota:'} Rs. {nsbData.totalAnnualAllocation.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'کل مصدقہ اخراجات' : 'Total Spent'}
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            Rs. {nsbData.totalExpenditure.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {nsbData.transactions.length} {isUrdu ? 'واؤچرز درج' : 'audited vouchers'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'موجودہ خالص بقایا (بیلنس)' : 'Current Unspent Balance'}
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            Rs. {nsbData.currentBalance.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            {nsbData.totalReceived > 0
              ? Math.round((nsbData.currentBalance / nsbData.totalReceived) * 100)
              : 0}% {isUrdu ? 'بیلنس دستیاب' : 'funds remaining'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'نامزد بینک اکاؤنٹ' : 'Bank Account Details'}
          </div>
          <div className="text-xs font-bold text-slate-900 truncate">
            {nsbData.bankName}
          </div>
          <div className="text-xs font-mono text-slate-600 truncate mt-1">
            {nsbData.accountNumber}
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{isUrdu ? 'نان سیلری بجٹ ڈیٹا محفوظ ہو گیا!' : 'NSB financial statement updated successfully!'}</span>
        </div>
      )}

      {/* NSB Allocations Config (For AEO or School) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          {isUrdu ? 'سہ ماہی فنڈز اقساط (Quarters Allocation)' : 'Quarterly Installments Allocation'}
        </h3>
        <form onSubmit={handleUpdateAllocations} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Opening Balance</label>
            <input
              type="number"
              disabled={!canEdit}
              value={nsbData.openingBalance}
              onChange={e => setNsbData({ ...nsbData, openingBalance: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Q1 Installment</label>
            <input
              type="number"
              disabled={!canEdit}
              value={nsbData.q1Funds}
              onChange={e => setNsbData({ ...nsbData, q1Funds: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Q2 Installment</label>
            <input
              type="number"
              disabled={!canEdit}
              value={nsbData.q2Funds}
              onChange={e => setNsbData({ ...nsbData, q2Funds: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Q3 Installment</label>
            <input
              type="number"
              disabled={!canEdit}
              value={nsbData.q3Funds}
              onChange={e => setNsbData({ ...nsbData, q3Funds: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>
          <div className="flex items-end">
            {canEdit && (
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded transition-colors"
              >
                {isUrdu ? 'اقساط اپ ڈیٹ کریں' : 'Update Tranches'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Head-wise Expenditure Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          {isUrdu ? 'ہیڈ وار اخراجات کی تفصیل (Govt. Prescribed Budget Heads)' : 'Expenditures by Prescribed Budget Head'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {NSB_HEADS.map(head => {
            const spentOnHead = nsbData.expendituresByHead?.[head] || 0;
            return (
              <div key={head} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
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

      {/* Vouchers Register & Add Transaction */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isUrdu ? 'اخراجات کیش بک اور واؤچرز رجسٹر' : 'NSB Cash Book & Vouchers Register'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'تمام ادائیگیوں کے تصدیق شدہ بلز اور رسیدیں' : 'Auditable payment records with vendor receipts'}
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddTx(!showAddTx)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'نیا واؤچر درج کریں' : 'Record Expenditure'}</span>
            </button>
          )}
        </div>

        {/* Add Transaction Drawer */}
        {showAddTx && (
          <form onSubmit={handleAddTransaction} className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {isUrdu ? 'نئے واؤچر کی تفصیلات درج کریں' : 'New Expenditure Entry'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newTx.date}
                  onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Voucher Number</label>
                <input
                  type="text"
                  required
                  value={newTx.voucherNo}
                  onChange={e => setNewTx({ ...newTx, voucherNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Budget Head</label>
                <select
                  value={newTx.head}
                  onChange={e => setNewTx({ ...newTx, head: e.target.value as NSBHead })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                >
                  {NSB_HEADS.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount (PKR)</label>
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vendor / Payee Name</label>
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Receipt / Invoice No.</label>
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
                  Purpose / Itemized Description
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTx(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold"
              >
                Save Voucher to Register
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
                {canEdit && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {nsbData.transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {isUrdu ? 'ابھی کوئی واؤچر درج نہیں ہے۔' : 'No expenditure transactions recorded yet.'}
                  </td>
                </tr>
              ) : (
                nsbData.transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {tx.voucherNo}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {tx.head}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 max-w-xs truncate">
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
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Voucher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
