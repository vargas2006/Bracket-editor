import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import type { LeaderboardEntry, Team, GameLeaderboardEntry } from '../../types';
import { formatPrize, formatOrdinal, exportToCSV } from '../../utils/leaderboardUtils';
import { RosterPopover } from './RosterPopover';
import { QuickEditModal } from './QuickEditModal';
import { LeaderboardImageExport } from './LeaderboardImageExport';
import { ConfirmModal } from '../Common/ConfirmModal';
import {
  Trophy,
  Medal,
  ChevronDown,
  ChevronRight,
  Crown,
  Search,
  Plus,
  RotateCcw,
  Download,
  Image as ImageIcon,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
  Eye,
  Users,
  Gift,
  LayoutGrid,
  ListOrdered,
  Crosshair,
  Flame,
  Info,
  Check,
} from 'lucide-react';

export const LeaderboardTable: React.FC = () => {
  const {
    leaderboard,
    gameLeaderboard,
    settings,
    isAdmin,
    rosterDisplayMode,
    setRosterDisplayMode,
    searchQuery,
    setSearchQuery,
    quickAdjustPoints,
    updateTeam,
    deleteTeam,
    resetLeaderboardPoints,
    addTeam,
    showToast,
  } = useTournament();

  const scoring = settings.scoring;
  const totalGames = scoring?.totalGames ?? 5;

  // View mode: 'gameMatrix' (Game 1, 2, 3... table) vs 'standings' (Overall Placement & Prize table)
  const [tableMode, setTableMode] = useState<'gameMatrix' | 'standings'>('gameMatrix');

  const [expandedTeamIds, setExpandedTeamIds] = useState<Record<string, boolean>>({});
  const [activeHoverTeamId, setActiveHoverTeamId] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isExportImageOpen, setIsExportImageOpen] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{ id: string; name: string } | null>(null);

  // Filter game leaderboard by search query (team name, tag, or member IGN)
  const filteredGameEntries = gameLeaderboard.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = entry.teamName.toLowerCase().includes(q) || (entry.tag && entry.tag.toLowerCase().includes(q));
    const memberMatch = entry.members.some((m) => m.ign.toLowerCase().includes(q));
    return nameMatch || memberMatch;
  });

  // Filter regular leaderboard
  const filteredStandingsEntries = leaderboard.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = entry.name.toLowerCase().includes(q) || (entry.tag && entry.tag.toLowerCase().includes(q));
    const memberMatch = entry.members.some((m) => m.ign.toLowerCase().includes(q));
    return nameMatch || memberMatch;
  });

  const toggleExpand = (teamId: string) => {
    setExpandedTeamIds((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const handleExportCSV = () => {
    setIsExportingCSV(true);
    exportToCSV(leaderboard, settings.competitionName, gameLeaderboard, totalGames);
    showToast('Tournament leaderboard CSV downloaded successfully!', 'success', 'Export Complete');
    setTimeout(() => setIsExportingCSV(false), 2200);
  };

  const handleQuickAddTeam = () => {
    const num = leaderboard.length + 1;
    addTeam({
      name: `NEW TEAM ${num}`,
      tag: `NT${num}`,
      logo: '🛡️',
      points: 0,
      prize: '—',
      wins: 0,
      kills: 0,
      matchesPlayed: 0,
      members: [
        { id: `p-${Date.now()}-1`, ign: `Captain_${num}`, isCaptain: true, role: 'IGL' },
        { id: `p-${Date.now()}-2`, ign: `Fragger_${num}`, isCaptain: false, role: 'Fragger' },
      ],
    });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center gap-1 font-black text-amber-400">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xs shadow-lg shadow-amber-500/20 border border-amber-300">
            1st
          </div>
          <Trophy className="w-3.5 h-3.5 text-amber-400 hidden sm:inline" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center gap-1 font-bold text-slate-200">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-md border border-slate-100">
            2nd
          </div>
          <Medal className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center gap-1 font-bold text-amber-600">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-black text-xs shadow-md border border-amber-500/50">
            3rd
          </div>
          <Medal className="w-3.5 h-3.5 text-amber-600 hidden sm:inline" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 font-mono font-bold text-xs">
        {formatOrdinal(rank)}
      </div>
    );
  };

  // Top 3 Teams from current active game leaderboard
  const top1 = gameLeaderboard[0];
  const top2 = gameLeaderboard[1];
  const top3 = gameLeaderboard[2];

  return (
    <div className="space-y-6">
      {/* Top 3 Podium Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 2nd Place */}
        {top2 && (
          <div className="order-2 md:order-1 relative bg-gradient-to-b from-slate-800/60 to-[#101420] border border-slate-700/80 rounded-2xl p-4 shadow-xl flex items-center justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-400/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-300/10 border border-slate-300/30 flex items-center justify-center text-2xl flex-shrink-0">
                {top2.logo || '🥈'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    2nd Place
                  </span>
                  {top2.isTied && (
                    <span className="text-[9px] font-mono bg-slate-700 text-slate-300 px-1 rounded">
                      TIED
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white truncate">{top2.teamName}</h4>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span>{top2.totalKills} Kills</span>
                  <span>•</span>
                  <span>{top2.totalChickenDinners} Wins 👑</span>
                  {top2.prize && top2.prize !== '—' && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {formatPrize(top2.prize)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-black font-mono text-slate-200">
                {top2.totalPoints}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Total Points</div>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {top1 && (
          <div className="order-1 md:order-2 relative bg-gradient-to-b from-amber-500/15 via-[#161a28] to-[#0f121d] border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl shadow-amber-950/20 flex items-center justify-between overflow-hidden scale-100 md:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-400/50 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                {top1.logo || '👑'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    Tournament Leader
                  </span>
                  {top1.isTied && (
                    <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                      TIED
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-white truncate">
                  {top1.teamName}
                </h3>
                <div className="text-xs text-amber-300 font-semibold flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono">{top1.totalKills} Kills</span>
                  <span>•</span>
                  <span>{top1.totalChickenDinners} Chicken Dinners 👑</span>
                  {top1.prize && top1.prize !== '—' && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                        <Gift className="w-3 h-3 text-emerald-400" />
                        {formatPrize(top1.prize)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <div className="text-3xl font-black font-mono text-amber-400">
                {top1.totalPoints}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-500/80">
                Total Points
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3 && (
          <div className="order-3 relative bg-gradient-to-b from-amber-900/20 to-[#101420] border border-amber-800/40 rounded-2xl p-4 shadow-xl flex items-center justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-amber-700/10 border border-amber-700/30 flex items-center justify-center text-2xl flex-shrink-0">
                {top3.logo || '🥉'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    3rd Place
                  </span>
                  {top3.isTied && (
                    <span className="text-[9px] font-mono bg-amber-900/40 text-amber-400 px-1 rounded">
                      TIED
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white truncate">{top3.teamName}</h4>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span>{top3.totalKills} Kills</span>
                  <span>•</span>
                  <span>{top3.totalChickenDinners} Wins 👑</span>
                  {top3.prize && top3.prize !== '—' && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {formatPrize(top3.prize)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-black font-mono text-amber-500">
                {top3.totalPoints}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Total Points</div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar: Mode Toggle, Search, Roster Mode, Admin Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#111520] border border-slate-800/80 p-3 rounded-xl shadow-lg">
        {/* Left: Table Mode Toggle (Game-by-Game Matrix vs Standings) */}
        <div className="flex items-center bg-[#0a0d14] p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setTableMode('gameMatrix')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
              tableMode === 'gameMatrix'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Game-by-Game Leaderboard</span>
          </button>

          <button
            onClick={() => setTableMode('standings')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
              tableMode === 'standings'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Overall Standings & Prizes</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams or player IGN..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0b0e15] border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Roster View Switch (Hover vs Expand) */}
          <div className="flex items-center bg-[#0a0d14] p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider px-2 font-bold hidden xl:inline">
              Roster View:
            </span>
            <button
              onClick={() => setRosterDisplayMode('hover')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                rosterDisplayMode === 'hover'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Hover
            </button>
            <button
              onClick={() => setRosterDisplayMode('expand')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                rosterDisplayMode === 'expand'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Expand
            </button>
          </div>

          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            title="Download CSV tournament spreadsheet"
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
              isExportingCSV
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isExportingCSV ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isExportingCSV ? 'Downloaded' : 'CSV'}</span>
          </button>

          <button
            onClick={() => setIsExportImageOpen(true)}
            title="Export graphic image for Discord / Community"
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Image</span>
          </button>

          {/* Admin Controls */}
          {isAdmin && (
            <>
              <button
                onClick={handleQuickAddTeam}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Team
              </button>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                title="Reset all team points and game results to 0"
                className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset Points</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 1. TOURNAMENT GAMES MATRIX LEADERBOARD (Reference Format)   */}
      {/* ========================================================== */}
      {tableMode === 'gameMatrix' ? (
        <div className="bg-[#10141f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0b0e15] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4 w-20 text-center">Rank</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Team</th>

                  {/* Configured Games Columns */}
                  {Array.from({ length: totalGames }, (_, i) => i + 1).map((g) => (
                    <th key={g} className="py-3.5 px-3 text-center min-w-[64px]">
                      Game {g}
                    </th>
                  ))}

                  <th className="py-3.5 px-3 text-center hidden md:table-cell min-w-[64px]">
                    Kills
                  </th>
                  <th className="py-3.5 px-3 text-center hidden md:table-cell min-w-[64px]">
                    Wins
                  </th>
                  <th className="py-3.5 px-4 text-right min-w-[90px]">Total Points</th>
                  <th className="py-3.5 px-4 text-left hidden lg:table-cell">Prize</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right w-24">Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredGameEntries.length === 0 ? (
                  <tr>
                    <td colSpan={totalGames + (isAdmin ? 6 : 5)} className="py-12 text-center text-slate-500">
                      No teams found matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredGameEntries.map((entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;
                    const isExpanded = !!expandedTeamIds[entry.teamId];
                    const captain = entry.members.find((m) => m.isCaptain);
                    const originalTeam = leaderboard.find((t) => t.id === entry.teamId);

                    return (
                      <React.Fragment key={entry.teamId}>
                        <tr
                          className={`transition-colors duration-150 ${
                            isTop1
                              ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08]'
                              : isTop2
                              ? 'bg-slate-200/[0.02] hover:bg-slate-200/[0.05]'
                              : isTop3
                              ? 'bg-amber-800/[0.03] hover:bg-amber-800/[0.06]'
                              : 'hover:bg-slate-800/30'
                          }`}
                        >
                          {/* Rank Column */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {getRankBadge(entry.rank)}
                              {entry.isTied && (
                                <span
                                  title={`Tied on points (${entry.tiebreakerNote || ''})`}
                                  className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20"
                                >
                                  T
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Team Column */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {rosterDisplayMode === 'expand' && (
                                <button
                                  onClick={() => toggleExpand(entry.teamId)}
                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                  title="Toggle player roster"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-rose-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                              )}

                              <span className="text-xl flex-shrink-0 select-none">
                                {entry.logo || '🛡️'}
                              </span>

                              {/* Team Name with Mode A Popover trigger */}
                              <div className="relative group min-w-0">
                                <div
                                  onMouseEnter={() => {
                                    if (rosterDisplayMode === 'hover') {
                                      setActiveHoverTeamId(entry.teamId);
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (rosterDisplayMode === 'hover') {
                                      setActiveHoverTeamId(null);
                                    }
                                  }}
                                  onClick={() => {
                                    if (rosterDisplayMode === 'hover') {
                                      setActiveHoverTeamId((prev) =>
                                        prev === entry.teamId ? null : entry.teamId
                                      );
                                    }
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`font-bold tracking-wide transition-colors ${
                                        isTop1
                                          ? 'text-amber-300 group-hover:text-amber-200'
                                          : 'text-white group-hover:text-rose-400'
                                      }`}
                                    >
                                      {entry.teamName}
                                    </span>
                                    {entry.tag && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800/80 text-slate-400 rounded border border-slate-700/60">
                                        {entry.tag}
                                      </span>
                                    )}
                                  </div>

                                  {captain && (
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Crown className="w-3 h-3 text-amber-400/80" />
                                      <span className="truncate">Captain: {captain.ign}</span>
                                    </div>
                                  )}
                                </div>

                                {rosterDisplayMode === 'hover' &&
                                  activeHoverTeamId === entry.teamId && (
                                    <div className="absolute left-0 top-full mt-2 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                                      <RosterPopover
                                        teamName={entry.teamName}
                                        tag={entry.tag}
                                        logo={entry.logo}
                                        points={entry.totalPoints}
                                        prize={entry.prize}
                                        members={entry.members}
                                        placement={entry.rank}
                                      />
                                    </div>
                                  )}
                              </div>
                            </div>
                          </td>

                          {/* Game 1, Game 2, Game 3 ... Game N Columns */}
                          {Array.from({ length: totalGames }, (_, i) => i + 1).map((g) => {
                            const res = entry.gameResults[g];
                            const pts = entry.gameScores[g] ?? 0;
                            const hasResult = !!res;

                            return (
                              <td
                                key={g}
                                title={
                                  hasResult
                                    ? `Game ${g}: ${res.kills} Kills (${res.killPoints} pts) + Place ${res.placement || '-'} (${res.placementPoints} pts) + CD (${res.chickenDinnerBonus} pts) = ${res.totalPoints} pts`
                                    : `Game ${g}: No result recorded (0 pts)`
                                }
                                className="py-3 px-3 text-center whitespace-nowrap font-mono"
                              >
                                {hasResult ? (
                                  <div className="inline-flex items-center gap-1 font-bold">
                                    <span
                                      className={`text-sm ${
                                        res.chickenDinner ? 'text-amber-400 font-black' : 'text-slate-200'
                                      }`}
                                    >
                                      {pts}
                                    </span>
                                    {res.chickenDinner && (
                                      <span className="text-[10px] text-amber-400" title="Chicken Dinner">
                                        👑
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-600 text-xs font-semibold">0</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Total Kills */}
                          <td className="py-3 px-3 text-center whitespace-nowrap hidden md:table-cell font-mono text-xs text-slate-300">
                            {entry.totalKills}
                          </td>

                          {/* Total Chicken Dinners */}
                          <td className="py-3 px-3 text-center whitespace-nowrap hidden md:table-cell font-mono text-xs text-amber-400">
                            {entry.totalChickenDinners > 0 ? (
                              <span className="inline-flex items-center gap-1 font-bold">
                                {entry.totalChickenDinners} 👑
                              </span>
                            ) : (
                              <span className="text-slate-600">0</span>
                            )}
                          </td>

                          {/* Total Points */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <span
                                className={`font-black font-mono text-base ${
                                  isTop1
                                    ? 'text-amber-400 text-lg'
                                    : isTop2
                                    ? 'text-slate-200'
                                    : isTop3
                                    ? 'text-amber-500'
                                    : 'text-white'
                                }`}
                              >
                                {entry.totalPoints}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                PTS
                              </span>
                            </div>
                          </td>

                          {/* Prize */}
                          <td className="py-3 px-4 text-left whitespace-nowrap hidden lg:table-cell">
                            {entry.prize && entry.prize.trim() !== '' && entry.prize !== '—' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                                <Gift className="w-3 h-3" />
                                {formatPrize(entry.prize)}
                              </span>
                            ) : (
                              <span className="text-slate-600 font-mono text-xs">—</span>
                            )}
                          </td>

                          {/* Admin Controls */}
                          {isAdmin && (
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {originalTeam && (
                                  <button
                                    onClick={() => setEditingTeam(originalTeam)}
                                    title="Edit Team"
                                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    setTeamToDelete({ id: entry.teamId, name: entry.teamName })
                                  }
                                  title="Delete Team"
                                  className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/40 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>

                        {/* Mode B: Expandable Row */}
                        {rosterDisplayMode === 'expand' && isExpanded && (
                          <tr className="bg-[#0b0e16] border-b border-slate-800">
                            <td colSpan={totalGames + (isAdmin ? 6 : 5)} className="py-3 px-6 pl-14">
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-rose-400" />
                                  {entry.teamName} Player Roster ({entry.members.length} Players)
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {entry.members.map((player) => (
                                    <div
                                      key={player.id}
                                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                        player.isCaptain
                                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                          : 'bg-[#121623] border-slate-800 text-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        {player.isCaptain ? (
                                          <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                        ) : (
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                                        )}
                                        <span className="font-mono font-semibold truncate">
                                          {player.ign}
                                        </span>
                                      </div>
                                      <span
                                        className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                          player.isCaptain
                                            ? 'bg-amber-950/80 text-amber-400'
                                            : 'text-slate-500'
                                        }`}
                                      >
                                        {player.isCaptain ? 'Captain' : player.role || 'Member'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================== */
        /* 2. OVERALL STANDINGS & PRIZES TABLE                        */
        /* ========================================================== */
        <div className="bg-[#10141f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0b0e15] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4 w-24 text-center">Placement</th>
                  <th className="py-3.5 px-4">Team Name</th>
                  <th className="py-3.5 px-4 text-center hidden sm:table-cell">Kills / Wins</th>
                  <th className="py-3.5 px-4 text-right">Points</th>
                  <th className="py-3.5 px-4 text-left">Prize</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right w-36">Admin Controls</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredStandingsEntries.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-500">
                      No teams found matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredStandingsEntries.map((entry) => {
                    const isTop1 = entry.placement === 1;
                    const isTop2 = entry.placement === 2;
                    const isTop3 = entry.placement === 3;
                    const isExpanded = !!expandedTeamIds[entry.id];
                    const captain = entry.members.find((m) => m.isCaptain);

                    return (
                      <React.Fragment key={entry.id}>
                        <tr
                          className={`transition-colors duration-150 ${
                            isTop1
                              ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08]'
                              : isTop2
                              ? 'bg-slate-200/[0.02] hover:bg-slate-200/[0.05]'
                              : isTop3
                              ? 'bg-amber-800/[0.03] hover:bg-amber-800/[0.06]'
                              : 'hover:bg-slate-800/30'
                          }`}
                        >
                          {/* Placement Column */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {getRankBadge(entry.placement)}
                              {entry.isTied && (
                                <span
                                  title="Tied with another team on points"
                                  className="text-[9px] font-mono font-bold text-amber-400/90 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20"
                                >
                                  T
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Team Name Column */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {rosterDisplayMode === 'expand' && (
                                <button
                                  onClick={() => toggleExpand(entry.id)}
                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                  title="Toggle player roster"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-rose-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                              )}

                              <span className="text-xl flex-shrink-0 select-none">
                                {entry.logo || '🛡️'}
                              </span>

                              <div className="relative group min-w-0">
                                <div
                                  onMouseEnter={() => {
                                    if (rosterDisplayMode === 'hover') {
                                      setActiveHoverTeamId(entry.id);
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (rosterDisplayMode === 'hover') {
                                      setActiveHoverTeamId(null);
                                    }
                                  }}
                                  onClick={() => {
                                    if (rosterDisplayMode === 'hover') {
                                      setActiveHoverTeamId((prev) =>
                                        prev === entry.id ? null : entry.id
                                      );
                                    }
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`font-bold tracking-wide transition-colors ${
                                        isTop1
                                          ? 'text-amber-300 group-hover:text-amber-200'
                                          : 'text-white group-hover:text-rose-400'
                                      }`}
                                    >
                                      {entry.name}
                                    </span>
                                    {entry.tag && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800/80 text-slate-400 rounded border border-slate-700/60">
                                        {entry.tag}
                                      </span>
                                    )}
                                  </div>

                                  {captain && (
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Crown className="w-3 h-3 text-amber-400/80" />
                                      <span className="truncate">Captain: {captain.ign}</span>
                                    </div>
                                  )}
                                </div>

                                {rosterDisplayMode === 'hover' &&
                                  activeHoverTeamId === entry.id && (
                                    <div className="absolute left-0 top-full mt-2 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                                      <RosterPopover
                                        teamName={entry.name}
                                        tag={entry.tag}
                                        logo={entry.logo}
                                        points={entry.points}
                                        prize={entry.prize}
                                        members={entry.members}
                                        placement={entry.placement}
                                      />
                                    </div>
                                  )}
                              </div>
                            </div>
                          </td>

                          {/* Secondary stats */}
                          <td className="py-3 px-4 text-center hidden sm:table-cell">
                            <span className="font-mono text-xs text-slate-300">
                              {entry.kills ?? 0} Kills / {entry.wins ?? 0} Wins
                            </span>
                          </td>

                          {/* Points Column */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <span
                                className={`font-black font-mono text-base ${
                                  isTop1
                                    ? 'text-amber-400 text-lg'
                                    : isTop2
                                    ? 'text-slate-200'
                                    : isTop3
                                    ? 'text-amber-500'
                                    : 'text-white'
                                }`}
                              >
                                {entry.points}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                PTS
                              </span>
                            </div>
                          </td>

                          {/* Prize Column */}
                          <td className="py-3 px-4 text-left whitespace-nowrap">
                            {entry.prize && entry.prize.trim() !== '' && entry.prize !== '—' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                                <Gift className="w-3.5 h-3.5" />
                                {formatPrize(entry.prize)}
                              </span>
                            ) : (
                              <span className="text-slate-600 font-mono text-xs">—</span>
                            )}
                          </td>

                          {/* Admin Action Buttons */}
                          {isAdmin && (
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => quickAdjustPoints(entry.id, -1)}
                                  title="Subtract 1 point"
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => quickAdjustPoints(entry.id, 1)}
                                  title="Add 1 point"
                                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                  <PlusCircle className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => setEditingTeam(entry)}
                                  title="Edit team"
                                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setTeamToDelete({ id: entry.id, name: entry.name })}
                                  title="Delete team"
                                  className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/40 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>

                        {rosterDisplayMode === 'expand' && isExpanded && (
                          <tr className="bg-[#0b0e16] border-b border-slate-800">
                            <td colSpan={isAdmin ? 6 : 5} className="py-3 px-6 pl-14">
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-rose-400" />
                                  {entry.name} Player Roster ({entry.members.length} Players)
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {entry.members.map((player) => (
                                    <div
                                      key={player.id}
                                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                        player.isCaptain
                                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                          : 'bg-[#121623] border-slate-800 text-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        {player.isCaptain ? (
                                          <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                        ) : (
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                                        )}
                                        <span className="font-mono font-semibold truncate">
                                          {player.ign}
                                        </span>
                                      </div>
                                      <span
                                        className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                          player.isCaptain
                                            ? 'bg-amber-950/80 text-amber-400'
                                            : 'text-slate-500'
                                        }`}
                                      >
                                        {player.isCaptain ? 'Captain' : player.role || 'Member'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <QuickEditModal
        team={editingTeam}
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        onSave={(id, updates) => updateTeam(id, updates)}
      />

      <LeaderboardImageExport
        entries={leaderboard}
        gameEntries={gameLeaderboard}
        totalGames={totalGames}
        settings={settings}
        isOpen={isExportImageOpen}
        onClose={() => setIsExportImageOpen(false)}
      />

      {/* Reset Points Confirmation */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Leaderboard Points & Game Results?"
        message="This action will reset every team's points, kills, and game results to 0 for a brand new competition. Team rosters and prizes will be preserved."
        confirmLabel="Reset Points to 0"
        onConfirm={() => {
          resetLeaderboardPoints();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Delete Team Confirmation */}
      <ConfirmModal
        isOpen={!!teamToDelete}
        title={`Delete "${teamToDelete?.name}"?`}
        message="Are you sure you want to remove this team from the tournament leaderboard? All associated game results will also be deleted."
        confirmLabel="Delete Team"
        onConfirm={() => {
          if (teamToDelete) {
            deleteTeam(teamToDelete.id);
            setTeamToDelete(null);
          }
        }}
        onCancel={() => setTeamToDelete(null)}
      />
    </div>
  );
};
