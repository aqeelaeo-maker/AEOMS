import React from 'react';
import { AlertTriangle, Trash2, KeyRound, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  icon?: 'trash' | 'warning' | 'key';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  icon = 'warning',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 transform transition-all animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-rose-100 text-rose-600 border border-rose-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              {icon === 'trash' ? (
                <Trash2 className="w-5 h-5" />
              ) : icon === 'key' ? (
                <KeyRound className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {title}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg -mr-1 -mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all cursor-pointer ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
