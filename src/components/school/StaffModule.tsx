import React, { useState, useEffect } from 'react';
import { School, StaffSummaryData, TeacherStaff } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getStaff, saveStaff } from '../../services/storage';
import { GraduationCap, Plus, Trash2, Save, Check, UserCheck, AlertCircle, Phone, Briefcase } from 'lucide-react';

interface StaffModuleProps {
  school: School;
}

export const StaffModule: React.FC<StaffModuleProps> = ({ school }) => {
  const { isAEO, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [staffData, setStaffData] = useState<StaffSummaryData>(() => getStaff(school.emisCode));
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // New Teacher form
  const [newTeacher, setNewTeacher] = useState<Partial<TeacherStaff>>({
    name: '',
    cnic: '',
    personalNo: '',
    designation: 'PST',
    bps: 14,
    category: 'Teaching',
    gender: 'Male',
    qualification: 'B.Sc, B.Ed',
    subjectSpecialization: 'General',
    dateOfJoining: '2018-09-01',
    presentStationJoining: '2021-09-01',
    phone: '',
    status: 'Present'
  });

  useEffect(() => {
    setStaffData(getStaff(school.emisCode));
  }, [school.emisCode]);

  const canEdit = isAEO || (currentUser?.role === 'school_user' && currentUser.schoolEmisCode === school.emisCode);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !currentUser) return;

    const teacher: TeacherStaff = {
      id: 'tch_' + Date.now(),
      name: newTeacher.name || '',
      cnic: newTeacher.cnic || '',
      personalNo: newTeacher.personalNo || '',
      designation: newTeacher.designation || 'PST',
      bps: Number(newTeacher.bps) || 14,
      category: newTeacher.category || 'Teaching',
      gender: newTeacher.gender || 'Male',
      qualification: newTeacher.qualification || '',
      subjectSpecialization: newTeacher.subjectSpecialization || '',
      dateOfJoining: newTeacher.dateOfJoining || '',
      presentStationJoining: newTeacher.presentStationJoining || '',
      phone: newTeacher.phone || '',
      status: newTeacher.status || 'Present'
    };

    const updatedTeachers = [teacher, ...staffData.teachers];
    const updated = {
      ...staffData,
      teachers: updatedTeachers
    };

    saveStaff(updated, currentUser);
    setStaffData(getStaff(school.emisCode));
    setShowAddTeacher(false);
    setNewTeacher({
      name: '',
      cnic: '',
      personalNo: '',
      designation: 'PST',
      bps: 14,
      category: 'Teaching',
      gender: 'Male',
      qualification: 'B.Sc, B.Ed',
      subjectSpecialization: 'General',
      dateOfJoining: '2018-09-01',
      presentStationJoining: '2021-09-01',
      phone: '',
      status: 'Present'
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleDeleteTeacher = (id: string) => {
    if (!currentUser || !canEdit) return;
    const confirmDelete = window.confirm(
      isUrdu ? 'کیا آپ اس استاد/ملازم کا نام فہرست سے نکالنا چاہتے ہیں؟' : 'Remove this staff member from school roster?'
    );
    if (!confirmDelete) return;

    const updated = {
      ...staffData,
      teachers: staffData.teachers.filter(t => t.id !== id)
    };
    saveStaff(updated, currentUser);
    setStaffData(getStaff(school.emisCode));
  };

  const handleUpdateSanctioned = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    saveStaff(staffData, currentUser);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Staff Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'منظور شدہ تدریسی آسامیاں' : 'Sanctioned Teaching Posts'}
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {staffData.sanctionedTeaching}
          </div>
          <div className="text-xs text-slate-500 mt-1">Govt SNE Allocation</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'موجود تدریسی اساتذہ' : 'Filled Teaching Posts'}
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            {staffData.filledTeaching}
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            Active in school roster
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'خالی تدریسی آسامیاں' : 'Vacant Teaching Posts'}
          </div>
          <div className={`text-2xl font-black font-mono ${staffData.vacantTeaching > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {staffData.vacantTeaching}
          </div>
          <div className="text-xs text-rose-700 mt-1 font-medium">
            {staffData.vacantTeaching > 0
              ? isUrdu ? 'نئے استاد کی تعیناتی مطلوب ہے' : 'Vacancies need recruitment/transfer'
              : isUrdu ? 'تمام آسامیاں پر ہیں' : '100% Filled'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isUrdu ? 'نان ٹیچنگ عملہ (درجہ چہارم)' : 'Non-Teaching Staff'}
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {staffData.filledNonTeaching} / {staffData.sanctionedNonTeaching}
          </div>
          <div className="text-xs text-slate-500 mt-1">Class IV, Naib Qasid, Sweeper</div>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{isUrdu ? 'اساتذہ و عملہ کا ریکارڈ محفوظ ہو گیا!' : 'Staff information updated successfully!'}</span>
        </div>
      )}

      {/* Sanctioned Posts Adjustments (AEO Admin) */}
      {isAEO && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            {isUrdu ? 'اے ای او ایڈمن: منظور شدہ اسامیوں کی ترتیب (SNE Sanctioned Posts)' : 'AEO Authorization: SNE Sanctioned Posts Allocation'}
          </h3>
          <form onSubmit={handleUpdateSanctioned} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sanctioned Teaching</label>
              <input
                type="number"
                min="1"
                value={staffData.sanctionedTeaching}
                onChange={e => setStaffData({ ...staffData, sanctionedTeaching: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sanctioned Non-Teaching</label>
              <input
                type="number"
                min="0"
                value={staffData.sanctionedNonTeaching}
                onChange={e => setStaffData({ ...staffData, sanctionedNonTeaching: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
              />
            </div>
            <div className="flex items-end md:col-span-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded transition-colors"
              >
                {isUrdu ? 'آسامیاں اپ ڈیٹ کریں' : 'Update Sanctioned Quota'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isUrdu ? 'اساتذہ و ملازمین تفصیلی فہرست' : 'Teaching & Non-Teaching Staff Roster'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'پرسنل نمبر، شناختی کارڈ، تعلیمی قابلیت اور رابطہ' : 'Verified credentials with SED Punjab personal numbers'}
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddTeacher(!showAddTeacher)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'نیا استاد / ملازم شامل کریں' : 'Add Staff Member'}</span>
            </button>
          )}
        </div>

        {/* Add Teacher Form Drawer */}
        {showAddTeacher && (
          <form onSubmit={handleAddTeacher} className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {isUrdu ? 'نئے ملازم کے کوائف درج کریں' : 'New Teacher / Staff Profile'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newTeacher.name}
                  onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  placeholder="e.g. Muhammad Asif"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">CNIC (13 Digits)</label>
                <input
                  type="text"
                  required
                  value={newTeacher.cnic}
                  onChange={e => setNewTeacher({ ...newTeacher, cnic: e.target.value })}
                  placeholder="37102-XXXXXXX-X"
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Personal No (SED)</label>
                <input
                  type="text"
                  required
                  value={newTeacher.personalNo}
                  onChange={e => setNewTeacher({ ...newTeacher, personalNo: e.target.value })}
                  placeholder="e.g. 31089922"
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Designation</label>
                <select
                  value={newTeacher.designation}
                  onChange={e => setNewTeacher({ ...newTeacher, designation: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                >
                  <option value="PST">PST (Primary School Teacher)</option>
                  <option value="EST (Science)">EST (Science)</option>
                  <option value="EST (General)">EST (General)</option>
                  <option value="EST (English)">EST (English)</option>
                  <option value="EST (Math)">EST (Math)</option>
                  <option value="SST (Science)">SST (Science)</option>
                  <option value="SST (Arts)">SST (Arts)</option>
                  <option value="Headmaster">Headmaster</option>
                  <option value="Headmistress">Headmistress</option>
                  <option value="Qari">Qari / Arabic Teacher</option>
                  <option value="DPE">DPE (Physical Education)</option>
                  <option value="Naib Qasid">Naib Qasid</option>
                  <option value="Class IV">Class IV Support</option>
                  <option value="Chowkidar">Chowkidar / Guard</option>
                  <option value="Sweeper">Sweeper</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scale (BPS)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTeacher.bps}
                  onChange={e => setNewTeacher({ ...newTeacher, bps: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newTeacher.category}
                  onChange={e => setNewTeacher({ ...newTeacher, category: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                >
                  <option value="Teaching">Teaching</option>
                  <option value="Non-Teaching">Non-Teaching</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Academic & Professional</label>
                <input
                  type="text"
                  value={newTeacher.qualification}
                  onChange={e => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
                  placeholder="e.g. M.Sc Chemistry, B.Ed"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={newTeacher.phone}
                  onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  placeholder="0300-XXXXXXX"
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTeacher(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold"
              >
                Save Staff Record
              </button>
            </div>
          </form>
        )}

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Designation & BPS</th>
                <th className="py-3 px-4">Personal No.</th>
                <th className="py-3 px-4">CNIC</th>
                <th className="py-3 px-4">Qualification</th>
                <th className="py-3 px-4">Station Joining</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                {canEdit && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {staffData.teachers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    {isUrdu ? 'کوئی استاد درج نہیں ہے۔' : 'No staff members added yet.'}
                  </td>
                </tr>
              ) : (
                staffData.teachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {teacher.name}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-slate-800">{teacher.designation}</span>
                      <span className="text-slate-400 ml-1">(BPS-{teacher.bps})</span>
                      <div className="text-[10px] text-slate-500">{teacher.category}</div>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-emerald-800">
                      {teacher.personalNo}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {teacher.cnic}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {teacher.qualification}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {teacher.presentStationJoining}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {teacher.phone}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                        {teacher.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove Teacher"
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
