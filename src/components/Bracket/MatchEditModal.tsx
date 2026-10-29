import React, { useState, useEffect } from 'react';
import type { BracketMatch, Team } from '../../types';
import { X, Crown, Swords, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchEditModalProps {
  match: BracketMatch | null;
  teams: Team[];
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onSave: (
    matchId: string,
    updates: {
      score1: number | null;
      score2: number | null;
      winnerId: string | null;
      status: 'upcoming' | 'live' | 'completed';
      team1Id?: string | null;
      team2Id?: string | null;
    }
  ) => void;
}

export const MatchEditModal: React.FC<MatchEditModalProps> = ({
  match,
  teams,
  isOpen,
  isAdmin,
  onClose,
  onSave,
}) => {
  if (!isOpen || !match) return null;

  const [team1Id, setTeam1Id] = useState<string>(match.team1Id || '');
  const [team2Id, setTeam2Id] = useState<string>(match.team2Id || '');
  const [score1, setScore1] = useState<string>(match.score1 !== null ? String(match.score1) : '');
  const [score2, setScore2] = useState<string>(match.score2 !== null ? String(match.score2) : '');
  const [winnerId, setWinnerId] = useState<string | null>(match.winnerId);
  const [status, setStatus] = useState<'upcoming' | 'live' | 'completed'>(match.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setTeam1Id(match.team1Id || '');
    setTeam2Id(match.team2Id || '');
    setScore1(match.score1 !== null ? String(match.score1) : '');
    setScore2(match.score2 !== null ? String(match.score2) : '');
    setWinnerId(match.winnerId);
    setStatus(match.status);
  }, [match]);

  const team1 = teams.find((t) => t.id === team1Id);
  const team2 = teams.find((t) => t.id === team2Id);

  const handleSelectWinner = (selectedId: string) => {
    if (!isAdmin) return;
    setWinnerId(selectedId);
    setStatus('completed');
  };

  const handleResetMatch = () => {
    setScore1('');
    setScore2('');
    setWinnerId(null);
    setStatus('upcoming');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || isSaving || isSaved) {
      onClose();
      return;
    }

    const parsedScore1 = score1.trim() !== '' ? Number(score1) : null;
    const parsedScore2 = score2.trim() !== '' ? Number(score2) : null;

    let computedWinnerId = winnerId;
    if (parsedScore1 !== null && parsedScore2 !== null && !computedWinnerId) {
      if (parsedScore1 > parsedScore2 && team1Id) computedWinnerId = team1Id;
      else if (parsedScore2 > parsedScore1 && team2Id) computedWinnerId = team2Id;
    }

    const finalStatus = computedWinnerId ? 'completed' : status;

    // Confetti celebration if Grand Finals completed
    if (match.roundName.includes('Finals') && !match.isThirdPlaceMatch && computedWinnerId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      onSave(match.id, {
        score1: parsedScore1,
        score2: parsedScore2,
        winnerId: computedWinnerId,
        status: finalStatus,
        team1Id: team1Id || null,
        team2Id: team2Id || null,
      });

      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 450);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#131722] border border-slate-700 rounded-xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              {match.roundName} — {match.isThirdPlaceMatch ? '3rd Place Decider' : `Match ${match.matchIndex + 1}`}
            </h3>
            <p className="text-xs text-slate-400">
              {isAdmin
                ? 'Update match scores, select winner, or edit assigned teams.'
                : 'Match details & player rosters.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Match Status Selector */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Match Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['upcoming', 'live', 'completed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                      status === st
                        ? st === 'live'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                          : st === 'completed'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-700 text-white border-slate-600'
                        : 'bg-[#0b0e14] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teams and Scores */}
          <div className="p-4 rounded-xl bg-[#0b0e15] border border-slate-800 space-y-3">
            {/* Team 1 */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Team 1
                </label>
                {isAdmin ? (
                  <select
                    value={team1Id}
                    onChange={(e) => setTeam1Id(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121623] border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Unassigned (TBD) --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.points} pts)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm font-bold text-white px-3 py-2 bg-[#121623] rounded-lg border border-slate-800">
                    {team1 ? team1.name : 'TBD'}
                  </div>
                )}
              </div>

              <div className="w-20">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">
                  Score
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={!isAdmin}
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  placeholder="0"
                  className="w-full px-2 py-2 bg-[#121623] border border-slate-700 rounded-lg text-white text-center font-mono font-bold text-base focus:outline-none focus:border-rose-500 disabled:opacity-60"
                />
              </div>

              {isAdmin && (
                <button
                  type="button"
                  title="Mark Team 1 as Winner"
                  onClick={() => team1Id && handleSelectWinner(team1Id)}
                  disabled={!team1Id}
                  className={`mt-4 p-2 rounded-lg border transition-colors ${
                    winnerId === team1Id && team1Id
                      ? 'bg-amber-500 text-black border-amber-400 shadow-lg'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-400 disabled:opacity-30'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="text-center text-xs font-mono text-slate-600 font-bold uppercase tracking-widest py-0.5">
              VS
            </div>

            {/* Team 2 */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Team 2
                </label>
                {isAdmin ? (
                  <select
                    value={team2Id}
                    onChange={(e) => setTeam2Id(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121623] border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Unassigned (TBD) --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.points} pts)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm font-bold text-white px-3 py-2 bg-[#121623] rounded-lg border border-slate-800">
                    {team2 ? team2.name : 'TBD'}
                  </div>
                )}
              </div>

              <div className="w-20">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">
                  Score
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={!isAdmin}
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  placeholder="0"
                  className="w-full px-2 py-2 bg-[#121623] border border-slate-700 rounded-lg text-white text-center font-mono font-bold text-base focus:outline-none focus:border-rose-500 disabled:opacity-60"
                />
              </div>

              {isAdmin && (
                <button
                  type="button"
                  title="Mark Team 2 as Winner"
                  onClick={() => team2Id && handleSelectWinner(team2Id)}
                  disabled={!team2Id}
                  className={`mt-4 p-2 rounded-lg border transition-colors ${
                    winnerId === team2Id && team2Id
                      ? 'bg-amber-500 text-black border-amber-400 shadow-lg'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-400 disabled:opacity-30'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {winnerId && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>
                  Winner:{' '}
                  <strong className="text-white">
                    {teams.find((t) => t.id === winnerId)?.name || 'Selected Team'}
                  </strong>
                </span>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setWinnerId(null)}
                  className="text-slate-400 hover:text-white underline text-[11px]"
                >
                  Clear Winner
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isAdmin ? (
              <button
                type="button"
                onClick={handleResetMatch}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Match
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Close
              </button>
              {isAdmin && (
                <button
                  type="submit"
                  disabled={isSaving || isSaved}
                  className={`px-5 py-2 text-xs font-bold rounded-lg shadow-lg transition-all active:scale-95 flex items-center gap-1.5 ${
                    isSaved
                      ? 'bg-emerald-600 text-white shadow-emerald-950/50 ring-2 ring-emerald-400'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 stroke-[2.5]" />
                      <span>✓ Match Saved!</span>
                    </>
                  ) : (
                    <span>Save & Advance Bracket</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
