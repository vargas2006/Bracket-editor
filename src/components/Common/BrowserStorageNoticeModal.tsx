import React, { useState } from 'react';
import { Database, AlertTriangle, ShieldAlert, CheckCircle2, X, Download, HardDrive } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/90 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#0c0f18] border-2 border-amber-500/60 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Isara / Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Big Alert Header */}
        <div className="flex items-start sm:items-center gap-4 mb-6 pb-5 border-b border-slate-800">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 shrink-0 shadow-lg shadow-amber-950/40">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Data Storage Reminder
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> Browser Local DB
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
              Wag I-Clear ang Browser Data / Do Not Clear Browser Data
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Mahalagang paalala para sa lahat ng tournament marshals, admins, at players.
            </p>
          </div>
        </div>

        {/* Bilingual Content: 2 Large Side-by-Side Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-6">
          {/* TAGALOG COLUMN */}
          <div className="bg-[#121624] border border-amber-500/30 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇵🇭</span>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 font-mono">
                    Tagalog
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Basahin Ito</span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-200">
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
                  <strong className="block text-rose-300 font-bold text-sm mb-1">
                    ⚠️ WAG NA WAG I-CLEAR ANG BROWSER DATA / COOKIES!
                  </strong>
                  Dito lang sa mismong browser (Local Storage) naka-save ang lahat ng teams, roster, standings, kills, prizes, at bracket matches. Pag nag-clear history o cookies ka, <strong className="text-white underline">mabubura lahat at hindi na maibabalik</strong>.
                </div>

                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold text-sm leading-none mt-0.5">•</span>
                    <span>
                      <strong className="text-white">Iisang Browser Lang:</strong> Gamitin palagi ang iisang browser (Chrome, Edge, Brave, etc.) sa iisang PC o cellphone sa buong tournament.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold text-sm leading-none mt-0.5">•</span>
                    <span>
                      <strong className="text-white">Iwasan ang Incognito:</strong> Wag buksan ang app sa Incognito o Private Mode dahil mawawala agad ang na-input mong scores pagkasara ng tab.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold text-sm leading-none mt-0.5">•</span>
                    <span>
                      <strong className="text-emerald-300">Mag-Backup Palagi:</strong> Pumunta sa <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">Admin Hub &gt; Backup JSON</strong> at i-click ang Export para may naiwang kopya ka sa PC mo kung sakali.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ENGLISH COLUMN */}
          <div className="bg-[#121624] border border-blue-500/30 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-300 font-mono">
                    English
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Important Notice</span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-200">
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200">
                  <strong className="block text-blue-300 font-bold text-sm mb-1">
                    ⚠️ DO NOT CLEAR BROWSING DATA OR CACHE!
                  </strong>
                  All tournament records—team rosters, game points, frags, prizes, and bracket matches—are stored directly in your browser's Local Storage. Clearing site data <strong className="text-white underline">permanently wipes out everything</strong>.
                </div>

                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold text-sm leading-none mt-0.5">•</span>
                    <span>
                      <strong className="text-white">Stick to One Browser:</strong> Always use the same browser and device (Chrome, Edge, Brave, etc.) throughout the entire tournament.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold text-sm leading-none mt-0.5">•</span>
                    <span>
                      <strong className="text-white">Avoid Incognito:</strong> Do not use Private or Incognito windows; your game inputs and match scores will NOT be saved when closed.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold text-sm leading-none mt-0.5">•</span>
                    <span>
                      <strong className="text-emerald-300">Keep Regular Backups:</strong> Head to <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">Admin Hub &gt; Backup JSON</strong> and export a file so you always have an offline copy ready to restore.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
            <span>Huwag nang ipakita ulit ang paalalang ito / Don't show this again</span>
          </label>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-950/60 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span>Naiintindihan Ko / I Understand, Magpatuloy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
