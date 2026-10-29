import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { DEFAULT_PRIZE_SETTINGS } from '../../data/initialData';
import {
  Gift,
  Trophy,
  Medal,
  Award,
  Save,
  CheckCircle2,
  RotateCcw,
  Sliders,
  DollarSign,
} from 'lucide-react';

export const PrizeSettingsPanel: React.FC = () => {
  const {
    settings,
    updatePrizeSettings,
    applyPlacementPrizes,
    isAdmin,
    gameLeaderboard,
    leaderboard,
    showToast,
  } = useTournament();

  const currentPrizes = settings.prizes || DEFAULT_PRIZE_SETTINGS;

  const [top1, setTop1] = useState(currentPrizes.top1 || '₱500');
  const [top2, setTop2] = useState(currentPrizes.top2 || '₱200');
  const [top3, setTop3] = useState(currentPrizes.top3 || '₱100');
  const [top4, setTop4] = useState(currentPrizes.top4 || '—');
  const [autoApply, setAutoApply] = useState(currentPrizes.autoApply ?? true);

  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (settings.prizes) {
      setTop1(settings.prizes.top1 || '₱500');
      setTop2(settings.prizes.top2 || '₱200');
      setTop3(settings.prizes.top3 || '₱100');
      setTop4(settings.prizes.top4 || '—');
      setAutoApply(settings.prizes.autoApply ?? true);
    }
  }, [settings.prizes]);

  if (!isAdmin) return null;

  // Calculate approximate total prize pool by extracting numbers
  const extractAmount = (val: string): number => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const totalPrizePool =
    extractAmount(top1) + extractAmount(top2) + extractAmount(top3) + extractAmount(top4);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updatePrizeSettings({
      top1: top1.trim() || '₱500',
      top2: top2.trim() || '₱200',
      top3: top3.trim() || '₱100',
      top4: top4.trim() || '—',
      autoApply,
    });

    if (autoApply) {
      applyPlacementPrizes({
        top1: top1.trim() || '₱500',
        top2: top2.trim() || '₱200',
        top3: top3.trim() || '₱100',
        top4: top4.trim() || '—',
      });
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    showToast('Prize pool saved & assigned to tournament standings!', 'success', 'Prizes Saved!');
    setSuccessNotice('Prize pool saved & assigned to tournament standings!');
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleResetDefaults = () => {
    setTop1('₱500');
    setTop2('₱200');
    setTop3('₱100');
    setTop4('—');
    setAutoApply(true);
    updatePrizeSettings(DEFAULT_PRIZE_SETTINGS);
    setSuccessNotice('Prizes reset to defaults: Top 1: ₱500, Top 2: ₱200, Top 3: ₱100.');
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const activeTeamsCount = gameLeaderboard.length > 0 ? gameLeaderboard.length : leaderboard.length;

  return (
    <div className="bg-[#111520] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Tournament Prize Pool Settings</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                Prizes & Rewards
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set cash rewards or in-game prizes for Top 1, Top 2, Top 3, and display them on the leaderboard & image export.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Prize Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Top 1 Prize */}
          <div className="bg-[#0b0e14] border-2 border-amber-500/40 p-4 rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                1st Place (Champion)
              </label>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                Gold
              </span>
            </div>
            <input
              type="text"
              value={top1}
              onChange={(e) => setTop1(e.target.value)}
              placeholder="e.g. ₱500 or 500"
              required
              className="w-full px-3 py-2 bg-[#121623] border border-amber-500/50 rounded-lg text-amber-300 font-mono font-black text-lg focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
            />
            <p className="text-[11px] text-slate-400">
              Prize for tournament tournament leader / champion.
            </p>
          </div>

          {/* Top 2 Prize */}
          <div className="bg-[#0b0e14] border border-slate-600/70 p-4 rounded-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-slate-300" />
                2nd Place (Runner-Up)
              </label>
              <span className="text-[10px] font-mono bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                Silver
              </span>
            </div>
            <input
              type="text"
              value={top2}
              onChange={(e) => setTop2(e.target.value)}
              placeholder="e.g. ₱200 or 200"
              required
              className="w-full px-3 py-2 bg-[#121623] border border-slate-600 rounded-lg text-slate-200 font-mono font-black text-lg focus:outline-none focus:border-slate-400 transition-colors"
            />
            <p className="text-[11px] text-slate-400">
              Prize for 2nd finishing position.
            </p>
          </div>

          {/* Top 3 Prize */}
          <div className="bg-[#0b0e14] border border-amber-800/60 p-4 rounded-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-amber-600" />
                3rd Place
              </label>
              <span className="text-[10px] font-mono bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded">
                Bronze
              </span>
            </div>
            <input
              type="text"
              value={top3}
              onChange={(e) => setTop3(e.target.value)}
              placeholder="e.g. ₱100 or 100"
              required
              className="w-full px-3 py-2 bg-[#121623] border border-amber-800/80 rounded-lg text-amber-500 font-mono font-black text-lg focus:outline-none focus:border-amber-600 transition-colors"
            />
            <p className="text-[11px] text-slate-400">
              Prize for 3rd finishing position.
            </p>
          </div>

          {/* Top 4 / Consolation (Optional) */}
          <div className="bg-[#0b0e14] border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-slate-400" />
                4th Place (Optional)
              </label>
              <span className="text-[10px] font-mono text-slate-500">Optional</span>
            </div>
            <input
              type="text"
              value={top4}
              onChange={(e) => setTop4(e.target.value)}
              placeholder="e.g. ₱50 or —"
              className="w-full px-3 py-2 bg-[#121623] border border-slate-700 rounded-lg text-slate-300 font-mono font-semibold text-lg focus:outline-none focus:border-slate-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              Optional prize or leave as "—".
            </p>
          </div>
        </div>

        {/* Total Prize Pool Summary Banner & Auto-Assign Switch */}
        <div className="p-4 bg-[#0a0d15] border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Estimated Prize Pool</div>
              <div className="text-xl font-black font-mono text-emerald-400 flex items-center gap-1">
                <span>₱{totalPrizePool.toLocaleString()}</span>
                <span className="text-xs font-normal text-slate-400">Total Distribution</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={autoApply}
                onChange={(e) => setAutoApply(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span className="font-semibold">Auto-distribute prizes to Top teams based on live standings</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              isSaved
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60 ring-2 ring-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>✓ Prize Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Prize Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

