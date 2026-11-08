import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import type { Team } from '../../types';
import { formatPrize } from '../../utils/leaderboardUtils';
import { TeamModal } from './TeamModal';
import { ConfirmModal } from '../Common/ConfirmModal';
import { TeamLogo } from '../Common/TeamLogo';
import {
  Plus,
  Crown,
  Trophy,
  Gift,
  Search,
  Edit2,
  Trash2,
  User,
  Users,
} from 'lucide-react';

export const TeamsPage: React.FC = () => {
  const { teams, isAdmin, addTeam, updateTeam, deleteTeam } = useTournament();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const filteredTeams = teams.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = t.name.toLowerCase().includes(q) || (t.tag && t.tag.toLowerCase().includes(q));
    const memberMatch = t.members.some((m) => m.ign.toLowerCase().includes(q));
    return nameMatch || memberMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111520] border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Community Rosters
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {teams.length} Teams Registered
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider mt-1">
            Teams & Rosters Directory
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team or player IGN..."
              className="w-full pl-9 pr-3 py-2 bg-[#0b0e15] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Team
            </button>
          )}
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTeams.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-[#111520] border border-dashed border-slate-800 rounded-2xl p-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-3xl">
              🛡️
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              {search.trim() ? `No teams found matching "${search}"` : 'No Teams Registered Yet'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search.trim()
                ? 'Try a different search keyword.'
                : 'Start your tournament by registering your squads and player rosters.'}
            </p>
            {isAdmin && !search.trim() && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-rose-900/40"
              >
                <Plus className="w-4 h-4" />
                Register First Team
              </button>
            )}
          </div>
        ) : (
          filteredTeams.map((team) => {
            const captain = team.members.find((m) => m.isCaptain);
            const otherMembers = team.members.filter((m) => !m.isCaptain);

            return (
              <div
                key={team.id}
                className="bg-[#111520] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Split Layout: Left = Logo Picture (Red area), Right = Info & Members (Yellow area) */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Left: Big Team Logo Picture (Red circled area) */}
                    <div className="w-full sm:w-36 md:w-40 flex-shrink-0 flex flex-col items-center">
                      <div className="w-full aspect-square rounded-2xl bg-[#090c13] border-2 border-slate-700/80 group-hover:border-rose-500/40 flex items-center justify-center text-5xl shadow-xl shadow-black/40 overflow-hidden relative transition-colors duration-200">
                        <TeamLogo
                          logo={team.logo}
                          name={team.name}
                          className="w-full h-full text-5xl"
                        />
                      </div>

                      {team.tag && (
                        <div className="mt-2 text-center w-full">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-rose-400 font-bold border border-rose-500/20 inline-block truncate max-w-full">
                            {team.tag}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Team Info, Stats & Member Names (Yellow lines area) */}
                    <div className="flex-1 min-w-0 w-full flex flex-col">
                      {/* Top Header: Team Name & Admin Actions */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-base sm:text-lg tracking-wide group-hover:text-rose-400 transition-colors truncate">
                            {team.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono flex-wrap">
                            <span className="flex items-center gap-1 text-amber-400 font-bold">
                              <Trophy className="w-3.5 h-3.5" />
                              {team.points} pts
                            </span>
                            <span>•</span>
                            <span>{team.kills ?? 0} Kills</span>
                            <span>•</span>
                            <span>{team.wins ?? 0} Wins</span>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => setEditingTeam(team)}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Edit Team & Roster"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setTeamToDelete(team)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete Team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Prize Banner if assigned */}
                      {team.prize && team.prize.trim() !== '' && team.prize !== '—' && (
                        <div className="mb-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <Gift className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Prize: {formatPrize(team.prize)}</span>
                        </div>
                      )}

                      {/* Member Names Section (Yellow lines in screenshot) */}
                      <div className="space-y-1.5 mt-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-rose-400" />
                            Squad Members
                          </span>
                          <span className="text-slate-500">{team.members.length} Players</span>
                        </div>

                        {/* Captain */}
                        {captain && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                              <span className="font-bold text-amber-200 font-mono truncate">
                                {captain.ign}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {captain.role && (
                                <span className="text-[10px] text-amber-400/80">{captain.role}</span>
                              )}
                              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                                Captain
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Other squad members */}
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                          {otherMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0a0d14] border border-slate-800 text-xs text-slate-300"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                <span className="font-mono text-slate-200 truncate">{member.ign}</span>
                              </div>
                              {member.role && (
                                <span className="text-[9px] text-slate-500 font-medium truncate ml-1 flex-shrink-0">
                                  {member.role}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer summary */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>ROS Legacy Division</span>
                  <span>ID: {team.id.replace('team-', '')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Team Modal */}
      <TeamModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => addTeam(data)}
      />

      {/* Edit Team Modal */}
      <TeamModal
        team={editingTeam}
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        onSave={(data) => {
          if (editingTeam) updateTeam(editingTeam.id, data);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!teamToDelete}
        title={`Delete Team "${teamToDelete?.name}"?`}
        message="Are you sure you want to delete this team and their entire player roster? This cannot be undone."
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
