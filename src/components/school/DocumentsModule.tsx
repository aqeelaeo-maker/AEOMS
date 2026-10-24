import React, { useState } from 'react';
import { School, DocumentUpload } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getDocuments, addDocument, deleteDocument, toggleDocumentVerification } from '../../services/storage';
import {
  FileCheck,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface DocumentsModuleProps {
  school: School;
}

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({ school }) => {
  const { isAEO, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [documents, setDocuments] = useState<DocumentUpload[]>(() => getDocuments(school.emisCode));
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<DocumentUpload | null>(null);
  const [deleteTargetDocId, setDeleteTargetDocId] = useState<string | null>(null);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentUpload['category']>('building_photo');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');

  const canEdit = isAEO || (currentUser?.role === 'school_user' && currentUser.schoolEmisCode === school.emisCode);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileUrl || !currentUser) return;

    const newDoc: DocumentUpload = {
      id: 'doc_' + Date.now(),
      schoolEmisCode: school.emisCode,
      title,
      category,
      fileDataUrl: fileUrl,
      fileName: fileName || 'uploaded_evidence.jpg',
      fileSizeKb: Math.round(fileUrl.length / 1024),
      uploadedAt: new Date().toISOString(),
      verified: isAEO, // Auto-verified if uploaded by AEO officer
      verifiedBy: isAEO ? currentUser.displayName : undefined,
      notes
    };

    addDocument(newDoc, currentUser);
    setDocuments(getDocuments(school.emisCode));
    setShowUploadModal(false);
    setTitle('');
    setFileUrl('');
    setFileName('');
    setNotes('');
  };

  const handleExecuteDelete = () => {
    if (!currentUser || !canEdit || !deleteTargetDocId) return;
    deleteDocument(deleteTargetDocId, currentUser);
    setDocuments(getDocuments(school.emisCode));
    setDeleteTargetDocId(null);
  };

  const handleToggleVerification = (docId: string) => {
    if (!currentUser || !isAEO) return;
    toggleDocumentVerification(docId, currentUser, 'Audited and verified by AEO office inspection team.');
    setDocuments(getDocuments(school.emisCode));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isUrdu ? 'دستاویزات، بلز اور تصویری شواہد' : 'Document Evidence & Photographic Verifications'}
            </h2>
            <p className="text-xs text-slate-500">
              {school.name} (EMIS: {school.emisCode}) · {documents.length} {isUrdu ? 'دستاویزات منسلک ہیں' : 'files attached'}
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>{isUrdu ? 'نئی دستاویز / تصویر اپ لوڈ کریں' : 'Upload Evidence Document'}</span>
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {isUrdu ? 'سکول تصدیقی ثبوت اپ لوڈ کریں' : 'Upload Official Evidence / Photo'}
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document / Photo Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Boundary Wall Front Photo, Paid Electricity Bill Sep 2026"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evidence Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="building_photo">School Building / Boundary Wall Photograph</option>
                  <option value="utility_bill">Paid Utility Bill (IESCO/Gas/Water)</option>
                  <option value="nsb_register">NSB Cash Book / Expenditure Voucher Scan</option>
                  <option value="ftf_register">FTF Register / Bank Statement Scan</option>
                  <option value="attendance_sheet">Staff & Student Attendance Register Sheet</option>
                  <option value="inspection_dossier">AEO / Dy. DEO Inspection Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select File or Camera Photo (Images / PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {fileUrl && (
                <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-center">
                  <span className="text-xs text-emerald-800 font-semibold block mb-1">
                    ✓ File Ready: {fileName}
                  </span>
                  {fileUrl.startsWith('data:image') && (
                    <img src={fileUrl} alt="Preview" className="max-h-36 mx-auto rounded object-contain" />
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Verification Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Verified with original school council register"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold"
                >
                  Save & Attach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {documents.map(doc => {
          const isImage = doc.fileDataUrl.startsWith('data:image') || doc.fileDataUrl.includes('photo-') || doc.fileDataUrl.endsWith('.jpg') || doc.fileDataUrl.endsWith('.png');

          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Media Preview or Icon Header */}
                <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer group"
                  onClick={() => setSelectedPreviewDoc(doc)}
                >
                  {isImage ? (
                    <img
                      src={doc.fileDataUrl}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs font-mono text-slate-600 block truncate max-w-[200px]">
                        {doc.fileName}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                    <Eye className="w-4 h-4" />
                    <span>View Evidence</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {doc.title}
                    </h4>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="capitalize">{doc.category.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className="font-mono">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>

                  {doc.notes && (
                    <p className="mt-2 text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200/70">
                      "{doc.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer: Status & Actions */}
              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
                <div className="flex items-center gap-1.5">
                  {doc.verified ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Pending Audit
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isAEO && (
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(doc.id)}
                      className="px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 rounded border border-emerald-300 transition-colors"
                    >
                      {doc.verified ? 'Revoke' : 'Verify'}
                    </button>
                  )}

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setDeleteTargetDocId(doc.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image / Evidence Full Preview Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{selectedPreviewDoc.title}</h3>
                <p className="text-xs text-slate-400">{selectedPreviewDoc.fileName}</p>
              </div>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950">
              {selectedPreviewDoc.fileDataUrl.startsWith('data:image') ||
              selectedPreviewDoc.fileDataUrl.includes('photo-') ||
              selectedPreviewDoc.fileDataUrl.endsWith('.jpg') ? (
                <img
                  src={selectedPreviewDoc.fileDataUrl}
                  alt={selectedPreviewDoc.title}
                  className="max-h-[65vh] object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="p-12 text-center text-white">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold">{selectedPreviewDoc.fileName}</p>
                  <p className="text-xs text-slate-400 mt-1">Official Document File</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-mono">
                Uploaded: {new Date(selectedPreviewDoc.uploadedAt).toLocaleString()}
              </span>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium text-xs hover:bg-slate-900"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Document Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteTargetDocId !== null}
        title={isUrdu ? 'دستاویز حذف کریں' : 'Delete Document Evidence'}
        message={
          isUrdu
            ? 'کیا آپ واقعی اس تصدیقی ثبوت/دستاویز کو مستقل طور پر حذف کرنا چاہتے ہیں؟'
            : 'Are you sure you want to permanently delete this document evidence?'
        }
        confirmText={isUrdu ? 'حذف کریں' : 'Delete Document'}
        cancelText={isUrdu ? 'منسوخ کریں' : 'Cancel'}
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteTargetDocId(null)}
      />
    </div>
  );
};
