import React, { useEffect, useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { CheckCircle2, AlertTriangle, Info, X, Sparkles } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, toastMessage, hideToast } = useTournament();
  const [progress, setProgress] = useState(100);

  // Fallback if toast object isn't set but legacy toastMessage is
  const activeToast = toast || (toastMessage ? {
    id: 'legacy',
    message: toastMessage,
    type: 'success' as const,
    title: 'Success',
    duration: 3500,
  } : null);

  useEffect(() => {
    if (!activeToast) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const startTime = Date.now();
    const duration = activeToast.duration || 3500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeToast?.id]);

  if (!activeToast) return null;

  const isSuccess = activeToast.type === 'success';
  const isError = activeToast.type === 'error';
  const isWarning = activeToast.type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm sm:max-w-md w-[calc(100vw-3rem)] pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl p-4 transition-all ${
          isSuccess
            ? 'bg-[#0b1b14]/95 border-emerald-500/50 shadow-emerald-950/60 text-white'
            : isError
            ? 'bg-[#200c12]/95 border-rose-500/50 shadow-rose-950/60 text-white'
            : isWarning
            ? 'bg-[#21160b]/95 border-amber-500/50 shadow-amber-950/60 text-white'
            : 'bg-[#0e1624]/95 border-cyan-500/50 shadow-cyan-950/60 text-white'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {/* Status Icon Badge */}
          <div
            className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center relative ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 ring-4 ring-emerald-500/10'
                : isError
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 ring-4 ring-rose-500/10'
                : isWarning
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 ring-4 ring-amber-500/10'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 ring-4 ring-cyan-500/10'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 animate-in zoom-in-75 duration-200" />}
            {isError && <AlertTriangle className="w-5 h-5 animate-in zoom-in-75 duration-200" />}
            {isWarning && <AlertTriangle className="w-5 h-5 animate-in zoom-in-75 duration-200" />}
            {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 animate-in zoom-in-75 duration-200" />}
          </div>

          {/* Content info */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                  isSuccess
                    ? 'text-emerald-400'
                    : isError
                    ? 'text-rose-400'
                    : isWarning
                    ? 'text-amber-400'
                    : 'text-cyan-400'
                }`}
              >
                {activeToast.title || (isSuccess ? 'SAVED SUCCESSFULLY' : 'NOTIFICATION')}
              </span>
              {isSuccess && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              )}
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-0.5 leading-snug break-words">
              {activeToast.message}
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={hideToast}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Animated Progress Timer Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div
            className={`h-full transition-all duration-75 ease-linear ${
              isSuccess
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : isError
                ? 'bg-gradient-to-r from-rose-500 to-red-400'
                : isWarning
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-cyan-500 to-blue-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
