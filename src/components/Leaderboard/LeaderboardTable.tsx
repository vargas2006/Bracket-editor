import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import type { LeaderboardEntry, Team, GameLeaderboardEntry } from '../../types';
import { formatPrize, formatOrdinal, exportToCSV } from '../../utils/leaderboardUtils';
import { RosterPopover } from './RosterPopover';
import { LeaderboardImageExport } from './LeaderboardImageExport';
import { ConfirmModal } from '../Common/ConfirmModal';
import { TeamLogo } from '../Common/TeamLogo';
import {
  Trophy,
  Medal,
  ChevronDown,
  ChevronRight,
  Crown,
  Search,
  RotateCcw,
  Download,
  Image as ImageIcon,
  Trash2,
  Eye,
  Users,
  Gift,
  LayoutGrid,
  ListOrdered,
  Crosshair,
  Flame,
  Info,
  Check,
  Table,
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
    deleteTeam,
    resetLeaderboardPoints,
    showToast,
  } = useTournament();

  const scoring = settings.scoring;
  const totalGames = scoring?.totalGames ?? 5;

  // View mode: 'gameMatrix' (Game 1, 2, 3... table), 'standings' (Overall table), 'grid' (Cards grid view)
  const [tableMode, setTableMode] = useState<'gameMatrix' | 'standings' | 'grid'>('gameMatrix');

  const [expandedTeamIds, setExpandedTeamIds] = useState<Record<string, boolean>>({});
  const [activeHoverTeamId, setActiveHoverTeamId] = useState<string | null>(null);
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

  const getRankBadge = (rank: number, points?: number) => {
    // If team has 0 points, render a clean neutral ordinal rank badge (no winner trophies)
    if (points === 0) {
      return (
        <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 font-mono font-bold text-xs">
          {formatOrdinal(rank)}
        </div>
      );
    }

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
  const hasAnyPoints = gameLeaderboard.some((t) => t.totalPoints > 0);

  return (
    <div className="space-y-6">
      {/* Top 3 Podium Cards Banner (Grand Esports Podium with Big Logos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        {/* 2nd Place Card (Runner-up) */}
        {top2 && (
          <div className="order-2 md:order-1 relative bg-gradient-to-b from-slate-700/25 via-[#131724] to-[#0c0f18] border-2 border-slate-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-slate-950/50 flex flex-col items-center text-center overflow-hidden transition-all duration-200 group">
            {/* Ambient Silver Glow */}
            <div className="absolute top-0 inset-x-0 h-28 bg-slate-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Placement Badge */}
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-500/50 text-slate-200 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow">
                <Medal className="w-3.5 h-3.5 text-slate-300" />
                2nd Place
              </span>
              {top2.totalPoints > 0 && top2.isTied && (
                <span className="text-[10px] font-mono bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600 font-bold">
                  TIED
                </span>
              )}
            </div>

            {/* Big Logo Picture */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-[#090c13] border-2 border-slate-400/60 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shadow-slate-700/20 overflow-hidden relative my-2 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <TeamLogo
                logo={top2.totalPoints > 0 ? (top2.logo || '🥈') : '❓'}
                name={top2.teamName}
                fallback="🥈"
                className="w-full h-full text-4xl sm:text-5xl"
              />
            </div>

            {/* Team Name */}
            <h4 className="text-base sm:text-lg font-black text-white tracking-wide truncate max-w-full mt-2">
              {top2.totalPoints > 0 ? top2.teamName : 'Unknown'}
            </h4>
            {top2.tag && top2.totalPoints > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700 mt-1">
                {top2.tag}
              </span>
            )}

            {/* Total Points */}
            <div className="my-2 text-center">
              <div className="text-3xl sm:text-4xl font-black font-mono text-slate-200 tracking-tight leading-none">
                {top2.totalPoints}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                Total Points
              </div>
            </div>

            {/* Stats & Prize */}
            <div className="w-full pt-3 border-t border-slate-800/80 flex flex-col items-center gap-2 mt-auto">
              <div className="text-xs text-slate-300 font-mono flex items-center gap-2 flex-wrap justify-center font-semibold">
                {top2.totalPoints > 0 ? (
                  <>
                    <span>{top2.totalKills} Kills</span>
                    <span>•</span>
                    <span>{top2.totalChickenDinners} Wins 👑</span>
                  </>
                ) : (
                  <span className="text-slate-500 font-normal">Waiting for results...</span>
                )}
              </div>

              {top2.prize && top2.prize !== '—' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-md">
                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  {formatPrize(top2.prize)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 1st Place Card (Elevated Champion Tower) */}
        {top1 && (
          <div className="order-1 md:order-2 relative bg-gradient-to-b from-amber-500/25 via-[#151928] to-[#0c0f18] border-2 border-amber-500/70 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-950/60 flex flex-col items-center text-center overflow-hidden md:-translate-y-3 md:scale-105 z-10 transition-all duration-200 group">
            {/* Ambient Gold Glow */}
            <div className="absolute top-0 inset-x-0 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Placement Badge */}
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-amber-950/50">
                <Crown className="w-4 h-4 text-amber-400" />
                1st Place Champion
              </span>
              {top1.totalPoints > 0 && top1.isTied && (
                <span className="text-[10px] font-mono bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded border border-amber-500/40 font-bold">
                  TIED
                </span>
              )}
            </div>

            {/* Big Logo Picture */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl bg-[#090c13] border-2 border-amber-400/80 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl shadow-amber-500/25 overflow-hidden relative my-2 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 ring-4 ring-amber-500/10">
              <TeamLogo
                logo={top1.totalPoints > 0 ? (top1.logo || '👑') : '❓'}
                name={top1.teamName}
                fallback="👑"
                className="w-full h-full text-5xl sm:text-6xl"
              />
            </div>

            {/* Team Name */}
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-wide truncate max-w-full mt-2">
              {top1.totalPoints > 0 ? top1.teamName : 'Unknown'}
            </h3>
            {top1.tag && top1.totalPoints > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-amber-500/30 mt-1">
                {top1.tag}
              </span>
            )}

            {/* Total Points */}
            <div className="my-2.5 text-center">
              <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 tracking-tight leading-none">
                {top1.totalPoints}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-500/80 mt-1">
                Total Points
              </div>
            </div>

            {/* Stats & Prize */}
            <div className="w-full pt-3 border-t border-slate-800/80 flex flex-col items-center gap-2 mt-auto">
              <div className="text-xs text-amber-200 font-mono flex items-center gap-2 flex-wrap justify-center font-semibold">
                {top1.totalPoints > 0 ? (
                  <>
                    <span>{top1.totalKills} Kills</span>
                    <span>•</span>
                    <span>{top1.totalChickenDinners} Wins 👑</span>
                  </>
                ) : (
                  <span className="text-slate-400 font-normal">Waiting for match results...</span>
                )}
              </div>

              {top1.prize && top1.prize !== '—' && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-md">
                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  {formatPrize(top1.prize)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 3rd Place Card */}
        {top3 && (
          <div className="order-3 relative bg-gradient-to-b from-amber-900/30 via-[#131724] to-[#0c0f18] border-2 border-amber-800/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/40 flex flex-col items-center text-center overflow-hidden transition-all duration-200 group">
            {/* Ambient Bronze Glow */}
            <div className="absolute top-0 inset-x-0 h-28 bg-amber-700/10 rounded-full blur-2xl pointer-events-none" />

            {/* Placement Badge */}
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow">
                <Medal className="w-3.5 h-3.5 text-amber-600" />
                3rd Place
              </span>
              {top3.totalPoints > 0 && top3.isTied && (
                <span className="text-[10px] font-mono bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/50 font-bold">
                  TIED
                </span>
              )}
            </div>

            {/* Big Logo Picture */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-[#090c13] border-2 border-amber-700/60 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shadow-amber-900/20 overflow-hidden relative my-2 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <TeamLogo
                logo={top3.totalPoints > 0 ? (top3.logo || '🥉') : '❓'}
                name={top3.teamName}
                fallback="🥉"
                className="w-full h-full text-4xl sm:text-5xl"
              />
            </div>

            {/* Team Name */}
            <h4 className="text-base sm:text-lg font-black text-white tracking-wide truncate max-w-full mt-2">
              {top3.totalPoints > 0 ? top3.teamName : 'Unknown'}
            </h4>
            {top3.tag && top3.totalPoints > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-500 font-bold border border-slate-700 mt-1">
                {top3.tag}
              </span>
            )}

            {/* Total Points */}
            <div className="my-2 text-center">
              <div className="text-3xl sm:text-4xl font-black font-mono text-amber-500 tracking-tight leading-none">
                {top3.totalPoints}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-600/80 mt-1">
                Total Points
              </div>
            </div>

            {/* Stats & Prize */}
            <div className="w-full pt-3 border-t border-slate-800/80 flex flex-col items-center gap-2 mt-auto">
              <div className="text-xs text-amber-300/90 font-mono flex items-center gap-2 flex-wrap justify-center font-semibold">
                {top3.totalPoints > 0 ? (
                  <>
                    <span>{top3.totalKills} Kills</span>
                    <span>•</span>
                    <span>{top3.totalChickenDinners} Wins 👑</span>
                  </>
                ) : (
                  <span className="text-slate-500 font-normal">Waiting for results...</span>
                )}
              </div>

              {top3.prize && top3.prize !== '—' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-md">
                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  {formatPrize(top3.prize)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar: Mode Toggle, Search, Roster Mode, Admin Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#111520] border border-slate-800/80 p-3 rounded-xl shadow-lg">
        {/* Left: Mode Toggle (Game Matrix vs Standings vs Grid View) */}
        <div className="flex items-center bg-[#0a0d14] p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto flex-wrap gap-1">
          <button
            onClick={() => setTableMode('gameMatrix')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
              tableMode === 'gameMatrix'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Game Matrix</span>
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
            <span>Standings Table</span>
          </button>

          <button
            onClick={() => setTableMode('grid')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
              tableMode === 'grid'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
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
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              title="Reset all team points and game results to 0"
              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Points</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 1. TOURNAMENT GAMES MATRIX LEADERBOARD (Reference Format)   */}
      {/* ========================================================== */}
      {tableMode === 'gameMatrix' && (
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
                  <th className="py-3.5 px-4 text-center min-w-[110px] w-28">Total Points</th>
                  <th className="py-3.5 px-4 text-center hidden lg:table-cell min-w-[120px] w-32">Prize</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right w-20">Admin</th>}
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
                    const isTop1 = entry.rank === 1 && entry.totalPoints > 0;
                    const isTop2 = entry.rank === 2 && entry.totalPoints > 0;
                    const isTop3 = entry.rank === 3 && entry.totalPoints > 0;
                    const isExpanded = !!expandedTeamIds[entry.teamId];
                    const captain = entry.members.find((m) => m.isCaptain);

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
                              {getRankBadge(entry.rank, entry.totalPoints)}
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

                              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-800/80 border border-slate-700/60 text-base">
                                <TeamLogo logo={entry.logo} name={entry.teamName} className="w-full h-full text-base" />
                              </div>

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
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5 font-mono">
                              <span
                                className={`font-black text-base ${
                                  isTop1
                                    ? 'text-amber-400'
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
                          <td className="py-3 px-4 text-center whitespace-nowrap hidden lg:table-cell">
                            <div className="flex items-center justify-center">
                              {entry.prize && entry.prize.trim() !== '' && entry.prize !== '—' ? (
                                <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20 min-w-[80px]">
                                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                                  {formatPrize(entry.prize)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center text-slate-600 font-mono text-xs w-[80px]">
                                  —
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Admin Controls */}
                          {isAdmin && (
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end">
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
      )}

      {/* ========================================================== */}
      {/* 2. OVERALL STANDINGS & PRIZES TABLE                        */}
      {/* ========================================================== */}
      {tableMode === 'standings' && (
        <div className="bg-[#10141f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0b0e15] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4 w-24 text-center">Placement</th>
                  <th className="py-3.5 px-4">Team Name</th>
                  <th className="py-3.5 px-4 text-center hidden sm:table-cell">Kills / Wins</th>
                  <th className="py-3.5 px-4 text-center min-w-[110px] w-28">Points</th>
                  <th className="py-3.5 px-4 text-center min-w-[120px] w-32">Prize</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right w-20">Admin</th>}
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
                    const isTop1 = entry.placement === 1 && entry.points > 0;
                    const isTop2 = entry.placement === 2 && entry.points > 0;
                    const isTop3 = entry.placement === 3 && entry.points > 0;
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
                              {getRankBadge(entry.placement, entry.points)}
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

                              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-800/80 border border-slate-700/60 text-base">
                                <TeamLogo logo={entry.logo} name={entry.name} className="w-full h-full text-base" />
                              </div>

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
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5 font-mono">
                              <span
                                className={`font-black text-base ${
                                  isTop1
                                    ? 'text-amber-400'
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
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              {entry.prize && entry.prize.trim() !== '' && entry.prize !== '—' ? (
                                <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20 min-w-[80px]">
                                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                                  {formatPrize(entry.prize)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center text-slate-600 font-mono text-xs w-[80px]">
                                  —
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Admin Action Buttons */}
                          {isAdmin && (
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end">
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

      {/* ========================================================== */}
      {/* 3. GRID VIEW (Responsive Team Cards Layout)                */}
      {/* ========================================================== */}
      {tableMode === 'grid' && (
        <div>
          {filteredGameEntries.length === 0 ? (
            <div className="py-16 text-center bg-[#10141f] border border-dashed border-slate-800 rounded-2xl p-8 text-slate-500">
              No teams found matching "{searchQuery}"
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredGameEntries.map((entry) => {
                const isTop1 = entry.rank === 1 && entry.totalPoints > 0;
                const isTop2 = entry.rank === 2 && entry.totalPoints > 0;
                const isTop3 = entry.rank === 3 && entry.totalPoints > 0;
                const isExpanded = !!expandedTeamIds[entry.teamId];
                const captain = entry.members.find((m) => m.isCaptain);

                return (
                  <div
                    key={entry.teamId}
                    className={`bg-[#10141f] border rounded-2xl p-4 shadow-xl flex flex-col justify-between group transition-all duration-200 relative overflow-hidden ${
                      isTop1
                        ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/[0.08] via-[#10141f] to-[#0d101a] shadow-amber-950/30'
                        : isTop2
                        ? 'border-slate-400/50 bg-gradient-to-b from-slate-300/[0.05] via-[#10141f] to-[#0d101a]'
                        : isTop3
                        ? 'border-amber-700/50 bg-gradient-to-b from-amber-800/[0.05] via-[#10141f] to-[#0d101a]'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Accent Strip */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        isTop1
                          ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                          : isTop2
                          ? 'bg-gradient-to-r from-slate-300 to-slate-500'
                          : isTop3
                          ? 'bg-gradient-to-r from-amber-600 to-amber-800'
                          : 'bg-transparent group-hover:bg-rose-500/50'
                      } transition-colors`}
                    />

                    <div>
                      {/* Card Header: Rank Badge & Prize / Actions */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          {getRankBadge(entry.rank, entry.totalPoints)}
                          {entry.isTied && (
                            <span
                              title={`Tied on points (${entry.tiebreakerNote || ''})`}
                              className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                            >
                              TIED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {entry.prize && entry.prize.trim() !== '' && entry.prize !== '—' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20 shadow-sm">
                              <Gift className="w-3 h-3 text-emerald-400" />
                              {formatPrize(entry.prize)}
                            </span>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => setTeamToDelete({ id: entry.teamId, name: entry.teamName })}
                              title="Delete Team"
                              className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/40 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Prominent Team Logo */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto my-2 rounded-2xl bg-[#090c13] border-2 border-slate-700/80 group-hover:border-rose-500/50 flex items-center justify-center text-4xl shadow-xl shadow-black/50 overflow-hidden relative group-hover:scale-105 transition-all duration-200">
                        <TeamLogo logo={entry.logo} name={entry.teamName} className="w-full h-full text-4xl" />
                      </div>

                      {/* Team Name, Tag & Captain */}
                      <div className="text-center mt-2 min-w-0">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <h4
                            className={`font-black text-base tracking-wide truncate max-w-full ${
                              isTop1
                                ? 'text-amber-300'
                                : isTop2
                                ? 'text-slate-200'
                                : isTop3
                                ? 'text-amber-400'
                                : 'text-white group-hover:text-rose-400 transition-colors'
                            }`}
                          >
                            {entry.teamName}
                          </h4>
                          {entry.tag && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded border border-slate-700">
                              {entry.tag}
                            </span>
                          )}
                        </div>

                        {captain && (
                          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5 truncate">
                            <Crown className="w-3 h-3 text-amber-400/80 shrink-0" />
                            <span className="truncate">Captain: {captain.ign}</span>
                          </div>
                        )}
                      </div>

                      {/* Total Points & Kills / Wins Banner */}
                      <div className="mt-3 p-2.5 rounded-xl bg-[#0c0f18] border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Points</div>
                          <div className="text-xl font-black font-mono text-white flex items-center gap-1">
                            <span className={isTop1 ? 'text-amber-400' : isTop2 ? 'text-slate-200' : isTop3 ? 'text-amber-500' : 'text-white'}>
                              {entry.totalPoints}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">PTS</span>
                          </div>
                        </div>

                        <div className="text-right text-xs font-mono text-slate-300 space-y-0.5">
                          <div>
                            <span className="text-emerald-400 font-bold">{entry.totalKills}</span> Kills
                          </div>
                          <div>
                            <span className="text-amber-400 font-bold">{entry.totalChickenDinners}</span> Wins 👑
                          </div>
                        </div>
                      </div>

                      {/* Games Matrix Row */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                        <div className="text-[9px] font-mono text-slate-400 uppercase font-bold mb-1 flex items-center justify-between">
                          <span>Match Breakdown</span>
                          <span>{totalGames} Matches</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                          {Array.from({ length: totalGames }, (_, i) => i + 1).map((g) => {
                            const pts = entry.gameScores[g];
                            const hasPlayed = pts !== undefined;
                            return (
                              <div
                                key={g}
                                className={`py-1 rounded bg-[#080b11] border ${
                                  pts && pts > 0
                                    ? 'border-rose-500/40 text-rose-300 font-bold'
                                    : hasPlayed
                                    ? 'border-slate-800 text-slate-400'
                                    : 'border-slate-800/50 text-slate-600'
                                }`}
                                title={`Game ${g}: ${pts !== undefined ? pts : 0} pts`}
                              >
                                <div className="text-[8px] text-slate-400">G{g}</div>
                                <div>{pts !== undefined ? pts : '-'}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Roster Section (Expandable) */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-rose-400" />
                          Roster ({entry.members.length})
                        </span>
                        <button
                          onClick={() => toggleExpand(entry.teamId)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
                        >
                          {isExpanded ? 'Collapse' : 'View'}
                          {isExpanded ? <ChevronDown className="w-3 h-3 text-rose-400" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </div>

                      {isExpanded ? (
                        <div className="space-y-1 mt-1 max-h-36 overflow-y-auto pr-1">
                          {entry.members.map((player) => (
                            <div
                              key={player.id}
                              className={`p-1.5 rounded-lg border text-xs flex items-center justify-between ${
                                player.isCaptain
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                  : 'bg-[#090c13] border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                {player.isCaptain ? (
                                  <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                ) : (
                                  <span className="w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
                                )}
                                <span className="font-mono font-semibold truncate text-[11px]">{player.ign}</span>
                              </div>
                              <span
                                className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                  player.isCaptain ? 'bg-amber-950/80 text-amber-400' : 'text-slate-400'
                                }`}
                              >
                                {player.isCaptain ? 'Captain' : player.role || 'Member'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {entry.members.slice(0, 3).map((player) => (
                            <span
                              key={player.id}
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border truncate max-w-[90px] ${
                                player.isCaptain
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : 'bg-[#0c0f18] text-slate-300 border-slate-800'
                              }`}
                              title={player.ign}
                            >
                              {player.isCaptain ? '👑 ' : ''}{player.ign}
                            </span>
                          ))}
                          {entry.members.length > 3 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/60">
                              +{entry.members.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <LeaderboardImageExport
        entries={leaderboard}
        gameEntries={gameLeaderboard}
        totalGames={totalGames}
        settings={settings}
        initialMode={tableMode}
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
