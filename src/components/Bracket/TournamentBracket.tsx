import React, { useState, useMemo } from 'react';
import { useTournament } from '../../context/TournamentContext';
import type { BracketMatch, Team } from '../../types';
import { MatchCard } from './MatchCard';
import { MatchEditModal } from './MatchEditModal';
import { BracketSettingsModal } from './BracketSettingsModal';
import {
  Trophy,
  Settings,
  Info,
  Medal,
} from 'lucide-react';

export const TournamentBracket: React.FC = () => {
  const { bracket, teams, isAdmin, updateBracketMatch, regenerateBracket } = useTournament();

  const [activeMatchToEdit, setActiveMatchToEdit] = useState<BracketMatch | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [mobileActiveRound, setMobileActiveRound] = useState<number>(0);

  // Quick lookup for teams
  const teamsMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  // Check if grand champion crowned
  const grandFinalMatch = bracket.rounds[bracket.rounds.length - 1]?.matches[0];
  const championTeam = grandFinalMatch?.winnerId ? teamsMap.get(grandFinalMatch.winnerId) : null;

  // Check 3rd place winner
  const bronzeWinner = bracket.thirdPlaceMatch?.winnerId
    ? teamsMap.get(bracket.thirdPlaceMatch.winnerId)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111520] border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Single Elimination
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {bracket.size} Teams • {bracket.rounds.length} Rounds
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider mt-1">
            {bracket.name}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors shadow-md"
            >
              <Settings className="w-4 h-4 text-rose-400" />
              Bracket Setup
            </button>
          )}
        </div>
      </div>

      {/* Champion Podium if Grand Final is decided */}
      {championTeam && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 border border-amber-300">
                {championTeam.logo || '👑'}
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center justify-center md:justify-start gap-1">
                  <Trophy className="w-4 h-4" />
                  TOURNAMENT CHAMPION CROWNED
                </div>
                <h3 className="text-2xl font-black text-white mt-0.5">{championTeam.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Captain: {championTeam.members.find((m) => m.isCaptain)?.ign || 'N/A'} • Prize:{' '}
                  {championTeam.prize || 'Champion Title'}
                </p>
              </div>
            </div>

            {bronzeWinner && (
              <div className="bg-[#0b0e14]/80 border border-amber-700/40 px-4 py-2 rounded-xl flex items-center gap-2 text-xs">
                <Medal className="w-4 h-4 text-amber-600" />
                <span className="text-slate-400">3rd Place Winner:</span>
                <span className="font-bold text-amber-400">{bronzeWinner.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Round Tabs (for small screens) */}
      <div className="block lg:hidden bg-[#0c0f16] p-1 rounded-xl border border-slate-800">
        <div className="flex gap-1 overflow-x-auto">
          {bracket.rounds.map((round, rIdx) => (
            <button
              key={rIdx}
              onClick={() => setMobileActiveRound(rIdx)}
              className={`flex-1 py-2 px-3 text-xs font-bold uppercase rounded-lg transition-all whitespace-nowrap ${
                mobileActiveRound === rIdx
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {round.name}
            </button>
          ))}
          {bracket.hasThirdPlace && bracket.thirdPlaceMatch && (
            <button
              onClick={() => setMobileActiveRound(bracket.rounds.length)}
              className={`flex-1 py-2 px-3 text-xs font-bold uppercase rounded-lg transition-all whitespace-nowrap ${
                mobileActiveRound === bracket.rounds.length
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3rd Place
            </button>
          )}
        </div>
      </div>

      {/* Main Connected Bracket Tree (Horizontal Scrollable container) */}
      <div className="bg-[#0e121d] border border-slate-800/80 rounded-2xl p-6 shadow-2xl overflow-x-auto min-h-[500px]">
        {/* Helper hint */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-6 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-rose-400" />
            <span>
              {isAdmin
                ? 'Click any match card to enter scores, select winners, or reseed teams.'
                : 'Interactive bracket tree: Click match cards to view matchup details.'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Scroll horizontally to navigate rounds &rarr;
          </span>
        </div>

        {/* Desktop Connected Bracket Tree */}
        <div className="hidden lg:flex items-stretch gap-12 min-w-max pb-8 pt-2">
          {bracket.rounds.map((round, rIndex) => (
            <div key={rIndex} className="flex flex-col w-64">
              {/* Round Header */}
              <div className="mb-6 text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  {round.name}
                </span>
              </div>

              {/* Matches column with dynamic vertical spacing */}
              <div className="flex-1 flex flex-col justify-around gap-8">
                {round.matches.map((match) => (
                  <div key={match.id} className="relative flex items-center">
                    <MatchCard
                      match={match}
                      teamsMap={teamsMap}
                      isAdmin={isAdmin}
                      onEditMatch={setActiveMatchToEdit}
                    />

                    {/* Bracket Connector lines for non-finals */}
                    {rIndex < bracket.rounds.length - 1 && (
                      <div className="absolute left-full top-1/2 w-12 h-0.5 bg-slate-700 pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Third Place Match column */}
          {bracket.hasThirdPlace && bracket.thirdPlaceMatch && (
            <div className="flex flex-col w-64 border-l border-slate-800/80 pl-12">
              <div className="mb-6 text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  Bronze Match
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 mb-3 text-[11px] text-amber-400 text-center">
                  Semi-Final Losers Decider
                </div>
                <MatchCard
                  match={bracket.thirdPlaceMatch}
                  teamsMap={teamsMap}
                  isAdmin={isAdmin}
                  onEditMatch={setActiveMatchToEdit}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile View: Display selected round */}
        <div className="block lg:hidden">
          {mobileActiveRound < bracket.rounds.length ? (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  {bracket.rounds[mobileActiveRound].name}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bracket.rounds[mobileActiveRound].matches.map((match) => (
                  <div key={match.id} className="flex justify-center">
                    <MatchCard
                      match={match}
                      teamsMap={teamsMap}
                      isAdmin={isAdmin}
                      onEditMatch={setActiveMatchToEdit}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // 3rd place on mobile
            bracket.thirdPlaceMatch && (
              <div className="space-y-4 flex flex-col items-center">
                <div className="text-center mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    3rd Place Decider
                  </span>
                </div>
                <MatchCard
                  match={bracket.thirdPlaceMatch}
                  teamsMap={teamsMap}
                  isAdmin={isAdmin}
                  onEditMatch={setActiveMatchToEdit}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Modals */}
      <MatchEditModal
        match={activeMatchToEdit}
        teams={teams}
        isOpen={!!activeMatchToEdit}
        isAdmin={isAdmin}
        onClose={() => setActiveMatchToEdit(null)}
        onSave={(matchId, updates) => updateBracketMatch(matchId, updates)}
      />

      <BracketSettingsModal
        isOpen={isSettingsModalOpen}
        teams={teams}
        onClose={() => setIsSettingsModalOpen(false)}
        onGenerate={(size, teamIds, hasThirdPlace) =>
          regenerateBracket(size, teamIds, hasThirdPlace)
        }
      />
    </div>
  );
};
