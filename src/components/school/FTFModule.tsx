import React, { useState, useEffect } from 'react';
import { School, FTFData, FTFTransaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getFTF, saveFTF } from '../../services/storage';
import { Receipt, Plus, Trash2, Check, ArrowDownRight, ArrowUpRight, Users, ShieldCheck } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface FTFModuleProps {
  school: School;
}

export const FTFModule: React.FC<FTFModuleProps> = ({ school }) => {
  const { isDyDEO, isAEO, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [ftfData, setFtfData] = useState<FTFData>(() => getFTF(school.emisCode));
  const [showAddTx, setShowAddTx] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  // New Transaction
  const [newTx, setNewTx] = useState<Partial<FTFTransaction>>({
    date: new Date().toISOString().slice(0, 10),
    type: 'collection',
    description: '',
    amount: 0,
    voucherNo: `FTF-${(ftfData.transactions.length + 1).toString().padStart(2, '0')}`,
    approvedByCommittee: true
  });

  useEffect(() => {
    setFtfData(getFTF(school.emisCode));
  }, [school.emisCode]);

  const canEdit = isDyDEO || isAEO || (currentUser?.role === 'school_user' && currentUser.schoolEmisCode === school.emisCode);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || newTx.amount <= 0 || !newTx.description || !currentUser) return;

    const tx: FTFTransaction = {
      id: 'ftf_tx_' + Date.now(),
      date: newTx.date || new Date().toISOString().slice(0, 10),
      type: newTx.type || 'collection',
      description: newTx.description || '',
      amount: Number(newTx.amount),
      voucherNo: newTx.voucherNo || `FTF-${Date.now()}`,
      approvedByCommittee: true,
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...ftfData,
      transactions: [tx, ...ftfData.transactions]
    };

    saveFTF(updated, currentUser);
    setFtfData(getFTF(school.emisCode));
    setShowAddTx(false);
    setNewTx({
      date: new Date().toISOString().slice(0, 10),
      type: 'collection',
      description: '',
      amount: 0,
      voucherNo: `FTF-${(updated.transactions.length + 1).toString().padStart(2, '0')}`,
      approvedByCommittee: true
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleExecuteDeleteTx = () => {
    if (!deleteTxId || !currentUser || !canEdit) return;
    const updated = {
      ...ftfData,
      transactions: ftfData.transactions.filter(t => t.id !== deleteTxId)
    };
    saveFTF(updated, currentUser);
    setFtfData(getFTF(school.emisCode));
    setDeleteTxId(null);
  };

  return (
    <div className="space-y-6">
      {/* FTF Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'سابقہ بقایا (Opening Balance)' : 'Opening Balance'}
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            Rs. {ftfData.openingBalance.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Financial Year 2026-27</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'کل موصولہ فنڈز (Collections)' : 'Total Collections'}
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            Rs. {ftfData.totalCollected.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Student FTF contributions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'اخراجات (Expenditures)' : 'Total Spent'}
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            Rs. {ftfData.totalExpenditure.toLocaleString()}
          </div>
          <div className="text-xs text-rose-700 mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Approved by FTF Committee</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'خالص دستیاب بیلنس' : 'Net FTF Balance'}
          </div>
          <div className="text-2xl font-black font-mono text-blue-900">
            Rs. {ftfData.currentBalance.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 truncate mt-1">
            {ftfData.bankName}
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{isUrdu ? 'فروغِ تعلیم فنڈ محفوظ ہو گیا!' : 'FTF record updated successfully!'}</span>
        </div>
      )}

      {/* Committee & Policy Box */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">
              {isUrdu ? 'سکول کونسل و فروغِ تعلیم فنڈ کمیٹی:' : 'Authorized FTF School Council Committee:'}
            </span>
            <div className="text-slate-600 mt-0.5">
              {ftfData.committeeMembers.join(' · ')}
            </div>
          </div>
        </div>
        <div className="text-slate-500 font-mono text-[11px] self-start sm:self-auto">
          Account: {ftfData.accountNumber}
        </div>
      </div>

      {/* Transactions Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isUrdu ? 'فروغِ تعلیم فنڈ رجسٹر و رسیدات' : 'FTF Ledger & Receipts Register'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'ماہانہ وصولیاں اور ہم نصابی سرگرمیوں پر اخراجات' : 'Monthly fee deposits and co-curricular student welfare disbursements'}
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddTx(!showAddTx)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'نیا اندراج کریں' : 'New FTF Entry'}</span>
            </button>
          )}
        </div>

        {/* Add Entry Drawer */}
        {showAddTx && (
          <form onSubmit={handleAddTransaction} className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {isUrdu ? 'فروغ تعلیم فنڈ اندراج' : 'Record FTF Receipt or Expenditure'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Type</label>
                <select
                  value={newTx.type}
                  onChange={e => setNewTx({ ...newTx, type: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                >
                  <option value="collection">Receipt / Collection (+)</option>
                  <option value="expenditure">Expenditure (-)</option>
                </select>
              </div>

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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Receipt / Voucher No</label>
                <input
                  type="text"
                  required
                  value={newTx.voucherNo}
                  onChange={e => setNewTx({ ...newTx, voucherNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTx.amount || ''}
                  onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                  placeholder="e.g. 5000"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Description / Head Teacher Remarks
                </label>
                <input
                  type="text"
                  required
                  value={newTx.description}
                  onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                  placeholder="e.g. Monthly FTF collection from classes or drinking water dispenser repairs"
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
                Save to FTF Register
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
                {canEdit && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {ftfData.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {isUrdu ? 'کوئی اندراج موجود نہیں ہے۔' : 'No FTF transactions recorded yet.'}
                  </td>
                </tr>
              ) : (
                ftfData.transactions.map(tx => (
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
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTxId(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Entry"
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
