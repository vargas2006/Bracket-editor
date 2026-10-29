import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { AdminLockModal } from './Admin/AdminLockModal';
import { DiscordIcon } from './Common/DiscordIcon';
import {
  Trophy,
  GitBranch,
  Users,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Menu,
  X,
  Sword,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'leaderboard' | 'bracket' | 'teams' | 'admin';
  setActiveTab: (tab: 'leaderboard' | 'bracket' | 'teams' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useTournament();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
    { id: 'bracket' as const, label: 'Tournament Bracket', icon: GitBranch },
    { id: 'teams' as const, label: 'Teams & Rosters', icon: Users },
    { id: 'admin' as const, label: 'Admin Hub', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('leaderboard')}>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-rose-700 to-red-900 border border-rose-500/60 flex items-center justify-center text-white shadow-lg shadow-rose-950/60">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-white uppercase font-sans">
                  RULES OF <span className="text-rose-500">SURVIVAL</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
                  ROS COMMUNITY
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide hidden sm:block">
                COMMUNITY LEADERBOARD & BRACKETS
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#10141f] p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side status & Admin toggle */}
          <div className="flex items-center gap-2.5">
            {/* Discord Community Link */}
            <a
              href="https://discord.gg/6CzpykTdQC"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5865F2]/15 text-[#5865F2] hover:bg-[#5865F2] hover:text-white border border-[#5865F2]/40 shadow-sm transition-all group"
              title="Join Rules of Survival Discord Community"
            >
              <DiscordIcon className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Discord</span>
            </a>

            {/* Admin status pill */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isAdmin
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title={isAdmin ? 'Admin mode active (Click to manage)' : 'Guest view (Click to log in)'}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Admin Mode</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Guest View</span>
                </>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white md:hidden bg-slate-800/80 rounded-lg border border-slate-700"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0e121d] border-b border-slate-800 px-4 py-3 space-y-2 animate-in slide-in-from-top duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800">
            <a
              href="https://discord.gg/6CzpykTdQC"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/20 hover:bg-[#4752c4] transition-all"
            >
              <DiscordIcon className="w-4 h-4 fill-current" />
              <span>Join Discord Server</span>
            </a>
          </div>
        </div>
      )}

      {/* Admin Auth Modal */}
      <AdminLockModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};
