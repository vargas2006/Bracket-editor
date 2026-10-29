import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { DEFAULT_PLACEMENT_POINTS } from '../../utils/scoringUtils';
import {
  Crosshair,
  Trophy,
  Gamepad2,
  ListOrdered,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Layers,
} from 'lucide-react';

export const ScoringSettingsPanel: React.FC = () => {
  const { settings, updateScoringSettings, isAdmin, showToast } = useTournament();
  const currentScoring = settings.scoring;

  const [pointsPerKill, setPointsPerKill] = useState<number>(currentScoring?.pointsPerKill ?? 5);
  const [chickenDinnerBonus, setChickenDinnerBonus] = useState<number>(currentScoring?.chickenDinnerBonus ?? 25);
  const [totalGames, setTotalGames] = useState<number>(currentScoring?.totalGames ?? 5);
  const [placementPointsEnabled, setPlacementPointsEnabled] = useState<boolean>(
    currentScoring?.placementPointsEnabled ?? true
  );
  const [placementPoints, setPlacementPoints] = useState<Record<number, number>>(
    currentScoring?.placementPoints ?? DEFAULT_PLACEMENT_POINTS
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if context changes
  useEffect(() => {
    if (currentScoring) {
      setPointsPerKill(currentScoring.pointsPerKill);
      setChickenDinnerBonus(currentScoring.chickenDinnerBonus);
      setTotalGames(currentScoring.totalGames);
      setPlacementPointsEnabled(currentScoring.placementPointsEnabled);
      setPlacementPoints(currentScoring.placementPoints);
    }
  }, [currentScoring]);

  if (!isAdmin) {
    return null;
  }

  const handlePlacementChange = (place: number, value: number) => {
    setPlacementPoints((prev) => ({
      ...prev,
      [place]: Math.max(0, value || 0),
    }));
  };

  const handleResetDefaults = () => {
    setPointsPerKill(5);
    setChickenDinnerBonus(25);
    setTotalGames(5);
    setPlacementPointsEnabled(true);
    setPlacementPoints(DEFAULT_PLACEMENT_POINTS);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessNotice(null);

    // Validate inputs
    if (pointsPerKill < 0 || isNaN(pointsPerKill)) {
      setValidationError('Points per kill must be a non-negative number.');
      return;
    }
    if (chickenDinnerBonus < 0 || isNaN(chickenDinnerBonus)) {
      setValidationError('Chicken dinner bonus must be a non-negative number.');
      return;
    }
    if (totalGames < 1 || isNaN(totalGames) || !Number.isInteger(totalGames)) {
      setValidationError('Number of tournament games must be an integer between 1 and 20.');
      return;
    }

    updateScoringSettings({
      pointsPerKill: Number(pointsPerKill),
      chickenDinnerBonus: Number(chickenDinnerBonus),
      totalGames: Number(totalGames),
      placementPointsEnabled,
      placementPoints,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    showToast(
      'Scoring rules saved & applied! All existing game scores have been recalculated.',
      'success',
      'Rules Saved!'
    );
    setSuccessNotice('Scoring rules saved & applied! All existing game scores have been recalculated.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="bg-[#111520] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Tournament Scoring Settings</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                Admin Config
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure points per kill, chicken dinner bonus, number of tournament games, and finishing placements.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {validationError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Multipliers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Points Per Kill */}
          <div className="bg-[#0b0e14] border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-rose-400" />
                Points Per Kill
              </label>
              <span className="text-[10px] font-mono text-slate-500">Default: 5</span>
            </div>
            <input
              type="number"
              min="0"
              step="1"
              value={pointsPerKill}
              onChange={(e) => setPointsPerKill(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-[#121623] border border-slate-700 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-slate-500">
              Each elimination awards this many points to the squad.
            </p>
          </div>

          {/* Chicken Dinner Bonus */}
          <div className="bg-[#0b0e14] border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Chicken Dinner Bonus
              </label>
              <span className="text-[10px] font-mono text-slate-500">Default: 25</span>
            </div>
            <input
              type="number"
              min="0"
              step="1"
              value={chickenDinnerBonus}
              onChange={(e) => setChickenDinnerBonus(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-[#121623] border border-slate-700 rounded-lg text-amber-300 font-mono font-bold text-base focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Bonus points awarded to the squad that wins the match.
            </p>
          </div>

          {/* Number of Tournament Games */}
          <div className="bg-[#0b0e14] border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                Tournament Games
              </label>
              <span className="text-[10px] font-mono text-slate-500">1 — 20</span>
            </div>
            <input
              type="number"
              min="1"
              max="20"
              step="1"
              value={totalGames}
              onChange={(e) => setTotalGames(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-[#121623] border border-slate-700 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-slate-500">
              Total number of games (Game 1, Game 2, etc.) shown on the leaderboard.
            </p>
          </div>
        </div>

        {/* Placement Points Section */}
        <div className="bg-[#0b0e14] border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-rose-400" />
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Finishing Position Placement Points
              </label>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                checked={placementPointsEnabled}
                onChange={(e) => setPlacementPointsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
              <span>Enable Placement Scoring</span>
            </label>
          </div>

          <p className="text-[11px] text-slate-400">
            Define point rewards based on match finishing positions (e.g. 2nd Place = 20 pts, 3rd Place = 15 pts).
          </p>

          {placementPointsEnabled && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((place) => (
                <div key={place} className="bg-[#121623] border border-slate-700 p-2.5 rounded-lg text-center">
                  <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    {place === 1
                      ? '1st Place'
                      : place === 2
                      ? '2nd Place'
                      : place === 3
                      ? '3rd Place'
                      : `${place}th Place`}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={placementPoints[place] ?? 0}
                    onChange={(e) => handlePlacementChange(place, Number(e.target.value))}
                    className="w-full px-2 py-1 bg-[#0b0e14] border border-slate-600 rounded text-center text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                  <span className="block text-[9px] text-slate-500 mt-1">pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Calculation Example Preview */}
        <div className="p-3.5 bg-gradient-to-r from-rose-950/20 via-slate-900/40 to-slate-900/40 border border-rose-500/30 rounded-xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="text-slate-300 font-semibold">Current Scoring Formula Preview:</span>{' '}
              <span className="text-slate-400">
                (Kills × <strong className="text-white">{pointsPerKill}</strong>) +{' '}
                (Chicken Dinner = <strong className="text-amber-400">+{chickenDinnerBonus}</strong>) +{' '}
                (Placement Points)
              </span>
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
            e.g. 8 kills + Chicken Dinner = <strong>{8 * pointsPerKill + chickenDinnerBonus} pts</strong>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              isSaved
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 ring-2 ring-emerald-400'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>✓ Scoring Rules Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Scoring Settings & Recalculate</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

