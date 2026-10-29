import React, { useState } from 'react';
import { Database, AlertTriangle, ShieldAlert, CheckCircle2, X, Download } from 'lucide-react';

interface BrowserStorageNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrowserStorageNoticeModal: React.FC<BrowserStorageNoticeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('ros_storage_reminder_dismissed', 'true');
      } catch {
        // ignore
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111522] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Warning Emblem */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-950/40">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Data Storage Paalala
              </span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-wide text-white mt-0.5">
              Mahalagang Paalala sa Pag-Save
            </h3>
          </div>
        </div>

        {/* Warning Body Content */}
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold mb-0.5">
                Wag i-clear ang Browser Data / Cookies / Cache!
              </strong>
              <span>
                Ang tournament app na ito ay gumagamit ng <strong>Browser Local Storage (Local DB)</strong>.
                Kapag na-clear ang history/cookies ng browser o nagbukas sa Incognito mode,{' '}
                <span className="text-rose-400 font-bold underline">
                  mabubura ang lahat ng na-save na teams, bracket matches, at tournament scores.
                </span>
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0b0e14] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Paano Maging Ligtas ang Tournament Data Mo?</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] sm:text-xs text-slate-400">
              <li>
                Gamitin ang parehong browser sa iyong PC/device sa buong tagal ng tournament.
              </li>
              <li>
                Maaari kang mag-export ng backup copy anumang oras sa{' '}
                <strong className="text-slate-200">Admin Hub &gt; Backup JSON</strong> para may
                offline file ka na pwedeng i-restore kung sakali.
              </li>
            </ul>
          </div>
        </div>

        {/* Checkbox Don't Show Again */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <span>Huwag nang ipakita ulit ang paalalang ito</span>
          </label>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-950/50 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Naiintindihan Ko, Magpatuloy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

