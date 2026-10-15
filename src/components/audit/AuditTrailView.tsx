import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getAuditLogs } from '../../services/storage';
import { History, Shield, Search, User, Filter } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { isAEO, isSupervisor } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  const logs = getAuditLogs();

  const filteredLogs = logs.filter(log => {
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      (log.schoolEmisCode && log.schoolEmisCode.includes(search)) ||
      (log.schoolName && log.schoolName.toLowerCase().includes(search.toLowerCase()));

    return matchesModule && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isUrdu ? 'سسٹم آڈٹ ٹریل اور ریکارڈ کی تبدیلیاں' : 'Tamper-Evident System Audit Trail'}
            </h2>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'کلسٹر میں ہر صارف اور سکول کی سرگرمی کا خودکار ریکارڈ' : 'Complete immutable record of all administrative operations, updates, and approvals'}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-white px-3 py-1.5 border border-slate-300 rounded-lg">
          {logs.length} logged events
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Modules</option>
            <option value="Submissions">Submissions & Approvals</option>
            <option value="Enrollment">Enrollment</option>
            <option value="NSB Funds">NSB Funds</option>
            <option value="FTF Funds">FTF Funds</option>
            <option value="Facilities">Facilities</option>
            <option value="Staff">Staff</option>
            <option value="Documents">Documents</option>
            <option value="Authentication">Authentication</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs by action, EMIS, user..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
          />
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-6">Timestamp</th>
              <th className="py-3 px-6">User / Official</th>
              <th className="py-3 px-6">School / EMIS</th>
              <th className="py-3 px-6">Module</th>
              <th className="py-3 px-6">Action & Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-3 px-6 font-mono text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>

                <td className="py-3 px-6 whitespace-nowrap">
                  <div className="font-semibold text-slate-900">{log.userName}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{log.userRole.replace('_', ' ')}</div>
                </td>

                <td className="py-3 px-6 whitespace-nowrap">
                  {log.schoolEmisCode ? (
                    <div>
                      <span className="font-mono font-bold text-emerald-800">{log.schoolEmisCode}</span>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {log.schoolName || ''}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                <td className="py-3 px-6 whitespace-nowrap">
                  <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {log.module}
                  </span>
                </td>

                <td className="py-3 px-6">
                  <div className="font-semibold text-slate-900">{log.action}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{log.details}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
