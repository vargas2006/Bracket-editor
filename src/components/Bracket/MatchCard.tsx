import React from 'react';
import type { BracketMatch, Team } from '../../types';
import { Crown, Swords, Edit3 } from 'lucide-react';

interface MatchCardProps {
  match: BracketMatch;
  teamsMap: Map<string, Team>;
  isAdmin: boolean;
  onEditMatch: (match: BracketMatch) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  teamsMap,
  isAdmin,
  onEditMatch,
}) => {
  const team1 = match.team1Id ? teamsMap.get(match.team1Id) : null;
  const team2 = match.team2Id ? teamsMap.get(match.team2Id) : null;

  const isTeam1Winner = match.winnerId && match.team1Id && match.winnerId === match.team1Id;
  const isTeam2Winner = match.winnerId && match.team2Id && match.winnerId === match.team2Id;

  const getStatusBadge = () => {
    if (match.status === 'completed') {
      return (
        <span className="text-[9px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Finished
        </span>
      );
    }
    if (match.status === 'live') {
      return (
        <span className="text-[9px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Live
        </span>
      );
    }
    return (
      <span className="text-[9px] font-medium font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
        Upcoming
      </span>
    );
  };

  return (
    <div
      onClick={() => onEditMatch(match)}
      className={`group relative w-64 bg-[#121622] rounded-xl border transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl ${
        match.status === 'live'
          ? 'border-rose-500/60 shadow-rose-950/20 ring-1 ring-rose-500/30'
          : match.status === 'completed'
          ? 'border-slate-700/80 hover:border-slate-600'
          : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b0e15] border-b border-slate-800/80 rounded-t-xl text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <Swords className="w-3 h-3 text-rose-400" />
          <span>{match.isThirdPlaceMatch ? '3rd Place Decider' : `M${match.matchIndex + 1}`}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {isAdmin && (
            <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-rose-400 transition-colors" />
          )}
        </div>
      </div>

      {/* Matchups */}
      <div className="p-2 space-y-1">
        {/* Team 1 Slot */}
        <div
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
            isTeam1Winner
              ? 'bg-amber-500/10 border border-amber-500/40 text-amber-200 font-bold'
              : team1
              ? 'bg-[#0a0d13] text-slate-200 border border-slate-800/50'
              : 'bg-[#0a0d13]/50 text-slate-500 border border-dashed border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-base select-none flex-shrink-0">
              {team1?.logo || '🛡️'}
            </span>
            <span className="truncate font-semibold tracking-wide">
              {team1 ? team1.name : 'TBD / Winner of Prev'}
            </span>
            {isTeam1Winner && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 font-mono font-bold">
            <span
              className={`text-sm ${
                isTeam1Winner
                  ? 'text-amber-400'
                  : match.score1 !== null
                  ? 'text-white'
                  : 'text-slate-600'
              }`}
            >
              {match.score1 !== null ? match.score1 : '-'}
            </span>
          </div>
        </div>

        {/* Team 2 Slot */}
        <div
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
            isTeam2Winner
              ? 'bg-amber-500/10 border border-amber-500/40 text-amber-200 font-bold'
              : team2
              ? 'bg-[#0a0d13] text-slate-200 border border-slate-800/50'
              : 'bg-[#0a0d13]/50 text-slate-500 border border-dashed border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-base select-none flex-shrink-0">
              {team2?.logo || '🛡️'}
            </span>
            <span className="truncate font-semibold tracking-wide">
              {team2 ? team2.name : 'TBD / Winner of Prev'}
            </span>
            {isTeam2Winner && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 font-mono font-bold">
            <span
              className={`text-sm ${
                isTeam2Winner
                  ? 'text-amber-400'
                  : match.score2 !== null
                  ? 'text-white'
                  : 'text-slate-600'
              }`}
            >
              {match.score2 !== null ? match.score2 : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
