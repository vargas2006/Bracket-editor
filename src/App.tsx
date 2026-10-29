import React, { useState } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Navbar } from './components/Navbar';
import { LeaderboardTable } from './components/Leaderboard/LeaderboardTable';
import { TournamentBracket } from './components/Bracket/TournamentBracket';
import { TeamsPage } from './components/Teams/TeamsPage';
import { AdminPanel } from './components/Admin/AdminPanel';
import { Toast } from './components/Common/Toast';
import { BrowserStorageNoticeModal } from './components/Common/BrowserStorageNoticeModal';
import { DiscordIcon } from './components/Common/DiscordIcon';
import {
  Flame,
  Shield,
  Crown,
  Trophy,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'bracket' | 'teams' | 'admin'>('leaderboard');
  const [isStorageNoticeOpen, setIsStorageNoticeOpen] = useState(() => {
    try {
      return localStorage.getItem('ros_storage_reminder_dismissed') !== 'true';
    } catch {
      return true;
    }
  });
  const { settings, leaderboard, teams } = useTournament();

  const totalPoints = teams.reduce((acc, t) => acc + t.points, 0);
  const topTeam = leaderboard[0];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hero Tournament Header Banner */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#121624] via-[#0d101a] to-[#090b10] py-6 sm:py-8 overflow-hidden">
        {/* Subtle background glow accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  <Flame className="w-3.5 h-3.5" />
                  {settings.seasonOrStage || 'ROS COMMUNITY TOURNAMENT'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Battle Royale Tournament Series
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight font-sans">
                {settings.competitionName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Rules of Survival (ROS) community tournament rankings, live match
                scoring, team rosters, and bracket progression.
              </p>
            </div>

            {/* Quick Community Stats Chips */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {topTeam && (
                <div className="bg-[#121622] border border-amber-500/30 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">#1 Standing</div>
                    <div className="text-xs font-bold text-amber-300 truncate max-w-[120px]">
                      {topTeam.name}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#121622] border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
                <Trophy className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Points</div>
                  <div className="text-xs font-bold text-white font-mono">{totalPoints} PTS</div>
                </div>
              </div>

              <div className="bg-[#121622] border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
                <Shield className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Squads</div>
                  <div className="text-xs font-bold text-white font-mono">{teams.length} Teams</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'leaderboard' && <LeaderboardTable />}
        {activeTab === 'bracket' && <TournamentBracket />}
        {activeTab === 'teams' && <TeamsPage />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#07090e] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-300">RULES OF SURVIVAL</span>
            <span>•</span>
            <span className="text-slate-400">ROS COMMUNITY</span>
            <span>•</span>
            <span>Tournament & Bracket Management System</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
            <a
              href="https://discord.gg/6CzpykTdQC"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#5865F2]/20 hover:bg-[#5865F2] text-[#7289da] hover:text-white border border-[#5865F2]/30 transition-all font-sans font-semibold text-xs"
            >
              <DiscordIcon className="w-3.5 h-3.5 fill-current" />
              <span>Join Discord</span>
            </a>
            <span>•</span>
            <span>Admin PIN: 1234</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsStorageNoticeOpen(true)}
              className="hover:text-amber-400 hover:underline flex items-center gap-1 transition-colors text-slate-400 font-mono text-[11px]"
              title="Tingnan ang Browser Storage Paalala"
            >
              <span>Autosave Active (Paalala)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Browser Local Storage Warning Modal */}
      <BrowserStorageNoticeModal
        isOpen={isStorageNoticeOpen}
        onClose={() => setIsStorageNoticeOpen(false)}
      />

      {/* Global Toast */}
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}

export default App;
