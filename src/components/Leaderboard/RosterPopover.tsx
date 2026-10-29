import React from 'react';
import type { Player } from '../../types';
import { Crown, User, Trophy, Gift } from 'lucide-react';
import { formatPrize } from '../../utils/leaderboardUtils';

interface RosterPopoverProps {
  teamName: string;
  tag?: string;
  logo?: string;
  points: number;
  prize?: string;
  members: Player[];
  placement?: number;
}

export const RosterPopover: React.FC<RosterPopoverProps> = ({
  teamName,
  tag,
  logo,
  points,
  prize,
  members,
  placement,
}) => {
  const captain = members.find((m) => m.isCaptain);
  const otherMembers = members.filter((m) => !m.isCaptain);

  return (
    <div className="w-72 bg-[#121622] border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md text-left pointer-events-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
          {logo || '🛡️'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white truncate">{teamName}</h4>
            {tag && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-rose-400 font-bold border border-rose-500/20">
                {tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
              <Trophy className="w-3.5 h-3.5" />
              {points} pts
            </span>
            {placement && (
              <span className="text-[11px] font-medium text-slate-400">
                Rank #{placement}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Prize snippet if set */}
      {prize && prize !== '—' && (
        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
          <Gift className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span className="truncate font-medium">Prize: {formatPrize(prize)}</span>
        </div>
      )}

      {/* Roster list */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Active Roster</span>
          <span className="text-slate-500">{members.length} Players</span>
        </div>

        {captain && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="font-bold text-amber-200 font-mono truncate">{captain.ign}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
              Captain
            </span>
          </div>
        )}

        {otherMembers.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0e111a] border border-slate-800 text-xs text-slate-300"
          >
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <span className="font-mono text-slate-200 truncate">{player.ign}</span>
            </div>
            {player.role && (
              <span className="text-[10px] text-slate-400 font-medium">{player.role}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
