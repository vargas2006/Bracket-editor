import React, { useState, useEffect, useMemo } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { calculateGamePoints } from '../../utils/scoringUtils';
import { ConfirmModal } from '../Common/ConfirmModal';
import {
  Trophy,
  Crosshair,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Crown,
  Check,
  Gamepad2,
  Flame,
  Layers,
  Trash2,
} from 'lucide-react';

interface RowState {
  kills: number;
  placement: number | '';
  chickenDinner: boolean;
  isModified: boolean;
  isSaved: boolean;
}

export const GameResultEntryPanel: React.FC = () => {
  const { teams, gameResults, settings, saveGameResult, deleteGameResult, isAdmin, showToast } =
    useTournament();
  const scoring = settings.scoring;
  const totalGames = scoring?.totalGames ?? 5;

  // Selected tournament game tab (Game 1, Game 2, Game 3...)
  const [activeGame, setActiveGame] = useState<number>(1);

  // Row states mapped by teamId
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Button interaction states
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isBatchSaved, setIsBatchSaved] = useState(false);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);

  // Populate row states whenever activeGame or gameResults or teams change
  useEffect(() => {
    const newStates: Record<string, RowState> = {};

    teams.forEach((team) => {
      const existing = gameResults.find(
        (r) => r.teamId === team.id && r.gameNumber === activeGame
      );

      if (existing) {
        newStates[team.id] = {
          kills: existing.kills,
          placement: existing.placement ?? '',
          chickenDinner: existing.chickenDinner,
          isModified: false,
          isSaved: true,
        };
      } else {
        newStates[team.id] = {
          kills: 0,
          placement: '',
          chickenDinner: false,
          isModified: false,
          isSaved: false,
        };
      }
    });

    setRowStates(newStates);
  }, [activeGame, teams, gameResults]);

  if (!isAdmin) {
    return null;
  }

  // Update a team's row input
  const handleRowChange = (teamId: string, updates: Partial<RowState>) => {
    setRowStates((prev) => {
      const current = prev[teamId] || {
        kills: 0,
        placement: '',
        chickenDinner: false,
        isModified: false,
        isSaved: false,
      };

      const next = { ...current, ...updates, isModified: true };

      // If Chicken Dinner is checked, only 1 team can have Chicken Dinner in a Battle Royale game
      if (updates.chickenDinner === true) {
        next.placement = 1;
        const updatedAll: Record<string, RowState> = {};
        Object.keys(prev).forEach((id) => {
          if (id === teamId) {
            updatedAll[id] = next;
          } else if (prev[id].chickenDinner) {
            updatedAll[id] = { ...prev[id], chickenDinner: false, isModified: true };
          } else {
            updatedAll[id] = prev[id];
          }
        });
        return updatedAll;
      }

      return {
        ...prev,
        [teamId]: next,
      };
    });
  };

  // Save a single row
  const handleSaveSingleRow = (teamId: string) => {
    const row = rowStates[teamId];
    if (!row) return;

    setErrorMessage(null);
    setSavingRowId(teamId);

    const placementVal =
      row.placement !== '' && !isNaN(Number(row.placement))
        ? Number(row.placement)
        : undefined;

    const res = saveGameResult(
      teamId,
      activeGame,
      Number(row.kills) || 0,
      placementVal,
      row.chickenDinner
    );

    setTimeout(() => {
      setSavingRowId(null);
      if (res.success) {
        setRowStates((prev) => ({
          ...prev,
          [teamId]: {
            ...prev[teamId],
            isModified: false,
            isSaved: true,
          },
        }));
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    }, 150);
  };

  // Save ALL teams for the active game
  const handleSaveAllTeams = () => {
    setErrorMessage(null);
    setIsSavingAll(true);

    setTimeout(() => {
      let successCount = 0;
      let failedError: string | null = null;

      teams.forEach((team) => {
        const row = rowStates[team.id];
        if (!row) return;

        const placementVal =
          row.placement !== '' && !isNaN(Number(row.placement))
            ? Number(row.placement)
            : undefined;

        const res = saveGameResult(
          team.id,
          activeGame,
          Number(row.kills) || 0,
          placementVal,
          row.chickenDinner
        );

        if (res.success) {
          successCount++;
        } else if (res.error && !failedError) {
          failedError = res.error;
        }
      });

      setIsSavingAll(false);

      if (failedError) {
        setErrorMessage(failedError);
      } else {
        setIsBatchSaved(true);
        setTimeout(() => setIsBatchSaved(false), 2600);
        showToast(
          `All ${successCount} teams saved successfully for Game ${activeGame}!`,
          'success',
          'Game Saved!'
        );
        setRowStates((prev) => {
          const next: Record<string, RowState> = {};
          Object.keys(prev).forEach((id) => {
            next[id] = { ...prev[id], isModified: false, isSaved: true };
          });
          return next;
        });
      }
    }, 250);
  };

  // Clear all results for this active game
  const handleClearActiveGame = () => {
    teams.forEach((team) => {
      const existing = gameResults.find(
        (r) => r.teamId === team.id && r.gameNumber === activeGame
      );
      if (existing) {
        deleteGameResult(existing.id);
      }
    });

    setRowStates((prev) => {
      const next: Record<string, RowState> = {};
      teams.forEach((team) => {
        next[team.id] = {
          kills: 0,
          placement: '',
          chickenDinner: false,
          isModified: false,
          isSaved: false,
        };
      });
      return next;
    });

    setClearConfirmOpen(false);
    showToast(`Cleared all team records for Game ${activeGame}.`);
  };

  // Count how many teams have saved results in this game
  const savedCountForActiveGame = teams.filter((t) =>
    gameResults.some((r) => r.teamId === t.id && r.gameNumber === activeGame)
  ).length;

  return (
    <div className="bg-[#111520] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Game Result Entry Console</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Table Matrix
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter match kills and placements for all teams at once. Points are calculated live in each row.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setClearConfirmOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Clear all results for this game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Game {activeGame}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Game Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[#0b0e14] p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold uppercase text-slate-400 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            Select Game:
          </span>
          {Array.from({ length: totalGames }, (_, i) => i + 1).map((g) => {
            const hasData = teams.some((t) =>
              gameResults.some((r) => r.teamId === t.id && r.gameNumber === g)
            );

            return (
              <button
                key={g}
                type="button"
                onClick={() => setActiveGame(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeGame === g
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : 'bg-[#121623] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>Game {g}</span>
                {hasData && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Has saved results" />
                )}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 px-2">
          <span>
            Saved: <strong className="text-white">{savedCountForActiveGame}</strong> / {teams.length} Teams
          </span>
          <span>•</span>
          <span className="text-amber-400">
            Rules: {scoring.pointsPerKill} pts/Kill | +{scoring.chickenDinnerBonus} CD
          </span>
        </div>
      </div>

      {/* Full Rows and Columns Table (All Teams Laid Out) */}
      <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0e121d] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[180px]">Team Name</th>
                <th className="py-3 px-3 text-center min-w-[130px]">
                  <span className="flex items-center justify-center gap-1">
                    <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                    Kills
                  </span>
                </th>
                <th className="py-3 px-3 text-center min-w-[100px]">Placement</th>
                <th className="py-3 px-3 text-center min-w-[140px]">
                  <span className="flex items-center justify-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Chicken Dinner
                  </span>
                </th>
                <th className="py-3 px-3 text-center min-w-[80px] hidden md:table-cell text-[10px]">
                  Kill Pts
                </th>
                <th className="py-3 px-3 text-center min-w-[80px] hidden md:table-cell text-[10px]">
                  Place Pts
                </th>
                <th className="py-3 px-3 text-center min-w-[80px] hidden md:table-cell text-[10px]">
                  CD Bonus
                </th>
                <th className="py-3 px-4 text-right min-w-[100px]">Game Total</th>
                <th className="py-3 px-3 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No teams registered yet. Add teams first in the Teams tab!
                  </td>
                </tr>
              ) : (
                teams.map((team, idx) => {
                  const row = rowStates[team.id] || {
                    kills: 0,
                    placement: '',
                    chickenDinner: false,
                    isModified: false,
                    isSaved: false,
                  };

                  const placementNum =
                    row.placement !== '' && !isNaN(Number(row.placement))
                      ? Number(row.placement)
                      : undefined;

                  const calc = calculateGamePoints(
                    row.kills,
                    placementNum,
                    row.chickenDinner,
                    scoring
                  );

                  return (
                    <tr
                      key={team.id}
                      className={`transition-colors duration-150 ${
                        row.chickenDinner
                          ? 'bg-amber-500/[0.06] hover:bg-amber-500/[0.10]'
                          : row.isModified
                          ? 'bg-rose-500/[0.03] hover:bg-rose-500/[0.06]'
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Row Number */}
                      <td className="py-3 px-3 text-center font-mono text-xs text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Team Name & Tag */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl flex-shrink-0 select-none">
                            {team.logo || '🛡️'}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-xs sm:text-sm tracking-wide">
                                {team.name}
                              </span>
                              {team.tag && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-800 text-rose-400 rounded border border-rose-500/20 font-bold">
                                  {team.tag}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              Captain: {team.members.find((m) => m.isCaptain)?.ign || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kills Input (with quick - / + buttons) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1 bg-[#121623] border border-slate-700/80 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleRowChange(team.id, {
                                kills: Math.max(0, row.kills - 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={row.kills}
                            onChange={(e) =>
                              handleRowChange(team.id, {
                                kills: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="w-12 text-center bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleRowChange(team.id, {
                                kills: row.kills + 1,
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Placement Input */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          step="1"
                          placeholder="-"
                          value={row.placement}
                          onChange={(e) =>
                            handleRowChange(team.id, {
                              placement: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          className="w-16 py-1 text-center bg-[#121623] border border-slate-700 rounded-lg text-white font-mono font-bold text-xs focus:outline-none focus:border-rose-500"
                        />
                      </td>

                      {/* Chicken Dinner Button Toggle */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            handleRowChange(team.id, {
                              chickenDinner: !row.chickenDinner,
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto ${
                            row.chickenDinner
                              ? 'bg-amber-500 text-black border border-amber-400 shadow-md shadow-amber-950/40 scale-105'
                              : 'bg-[#121623] text-slate-400 hover:text-white border border-slate-700/80 hover:border-slate-600'
                          }`}
                        >
                          <Crown className={`w-3.5 h-3.5 ${row.chickenDinner ? 'text-black' : 'text-amber-400'}`} />
                          <span>{row.chickenDinner ? 'WINNER 👑' : 'No'}</span>
                        </button>
                      </td>

                      {/* Kill Points (Live Breakdown) */}
                      <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-xs text-slate-300">
                        {calc.killPoints}
                      </td>

                      {/* Placement Points (Live Breakdown) */}
                      <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-xs text-sky-400">
                        {calc.placementPoints > 0 ? `+${calc.placementPoints}` : '0'}
                      </td>

                      {/* CD Bonus (Live Breakdown) */}
                      <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-xs text-amber-400">
                        {calc.chickenDinnerBonus > 0 ? `+${calc.chickenDinnerBonus}` : '0'}
                      </td>

                      {/* Game Total Points (Live Computed) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <span
                            className={`font-black font-mono text-sm sm:text-base ${
                              row.chickenDinner
                                ? 'text-amber-400'
                                : calc.totalPoints > 0
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {calc.totalPoints}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-slate-500">PTS</span>
                        </div>
                      </td>

                      {/* Row Action / Save Button */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={savingRowId === team.id}
                          onClick={() => handleSaveSingleRow(team.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto active:scale-95 ${
                            savingRowId === team.id
                              ? 'bg-slate-700 text-slate-300'
                              : row.isModified
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40 animate-pulse'
                              : row.isSaved
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50 shadow-sm shadow-emerald-950/30'
                              : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                        >
                          {savingRowId === team.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : row.isModified ? (
                            <>
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </>
                          ) : row.isSaved ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Batch Save Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400">
          💡 <span className="font-semibold text-slate-300">Pro-tip:</span> You can edit multiple
          teams directly in the table, then click{' '}
          <strong className="text-rose-400">"Save All Teams"</strong> to update the tournament
          leaderboard in one go!
        </div>

        <button
          type="button"
          disabled={isSavingAll}
          onClick={handleSaveAllTeams}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
            isBatchSaved
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 ring-2 ring-emerald-400'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
          }`}
        >
          {isSavingAll ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Records...</span>
            </>
          ) : isBatchSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-200 stroke-[3]" />
              <span>✓ All Teams Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Teams for Game {activeGame}</span>
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal to Clear Game */}
      <ConfirmModal
        isOpen={clearConfirmOpen}
        title={`Reset all scores for Game ${activeGame}?`}
        message={`Are you sure you want to clear and reset the recorded results for all teams in Game ${activeGame}? This will recalculate the leaderboard.`}
        confirmLabel="Reset Game"
        onConfirm={handleClearActiveGame}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </div>
  );
};
