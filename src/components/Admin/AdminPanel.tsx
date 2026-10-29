import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { exportToCSV } from '../../utils/leaderboardUtils';
import { ConfirmModal } from '../Common/ConfirmModal';
import { LeaderboardImageExport } from '../Leaderboard/LeaderboardImageExport';
import { ScoringSettingsPanel } from './ScoringSettingsPanel';
import { PrizeSettingsPanel } from './PrizeSettingsPanel';
import { GameResultEntryPanel } from './GameResultEntryPanel';
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  RotateCcw,
  Download,
  Upload,
  Lock,
  KeyRound,
  FileSpreadsheet,
  Image as ImageIcon,
  Save,
  Trash2,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    teams,
    leaderboard,
    gameLeaderboard,
    settings,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    resetLeaderboardPoints,
    clearAllData,
    resetToDefaultData,
    updateSettings,
    showToast,
  } = useTournament();

  const [compName, setCompName] = useState(settings.competitionName);
  const [compStage, setCompStage] = useState(settings.seasonOrStage);
  const [adminPin, setAdminPin] = useState(settings.adminPin);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isRestoreDefaultOpen, setIsRestoreDefaultOpen] = useState(false);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  const [isImageExportOpen, setIsImageExportOpen] = useState(false);

  // Quick PIN login inside the panel if currently guest
  const [unlockPin, setUnlockPin] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      competitionName: compName.trim() || settings.competitionName,
      seasonOrStage: compStage.trim() || settings.seasonOrStage,
      adminPin: adminPin.trim() || '1234',
    });
  };

  const handleExportJSON = () => {
    const backup = {
      teams,
      settings,
      timestamp: Date.now(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ros_legacy_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Tournament backup JSON exported!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.teams && Array.isArray(data.teams)) {
          localStorage.setItem('ros_legacy_teams_v2', JSON.stringify(data.teams));
          if (data.settings) {
            localStorage.setItem('ros_legacy_settings_v2', JSON.stringify(data.settings));
          }
          window.location.reload();
        } else {
          showToast('Invalid backup file format!');
        }
      } catch (err) {
        showToast('Error reading backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[#121622] border border-slate-700/80 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold uppercase tracking-wider text-white">
          Admin Hub Locked
        </h3>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          The Admin Control Center is restricted to authorized tournament admins. Enter the PIN
          below to access administrative tools.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginAdmin(unlockPin);
          }}
          className="space-y-4"
        >
          <input
            type="password"
            value={unlockPin}
            onChange={(e) => setUnlockPin(e.target.value)}
            placeholder="Enter Admin PIN (Default: 1234)"
            className="w-full px-4 py-3 bg-[#0b0e14] border border-slate-700 rounded-xl text-center tracking-widest text-white text-sm focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-rose-900/40 transition-all"
          >
            Unlock Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111520] border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Authorized Admin Session
              </span>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mt-0.5">
              Admin Tournament Management Center
            </h2>
          </div>
        </div>

        <button
          onClick={logoutAdmin}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-2"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Switch to Guest View
        </button>
      </div>

      {/* 1. TOURNAMENT SCORING SETTINGS */}
      <ScoringSettingsPanel />

      {/* 2. TOURNAMENT PRIZE POOL & PLACEMENT PRIZES */}
      <PrizeSettingsPanel />

      {/* 3. GAME RESULT ENTRY CONSOLE */}
      <GameResultEntryPanel />

      {/* 3. GENERAL TOURNAMENT & SECURITY CONFIGURATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tournament Info & PIN Settings */}
        <div className="bg-[#111520] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Competition Info & Security PIN
            </h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Competition Name
              </label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Season / Stage Label
              </label>
              <input
                type="text"
                value={compStage}
                onChange={(e) => setCompStage(e.target.value)}
                placeholder="e.g. GRAND FINALS STAGE"
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                Admin Security PIN
              </label>
              <input
                type="text"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-rose-900/30 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Competition Settings
            </button>
          </form>
        </div>

        {/* 4. Competition Reset & Data Backups */}
        <div className="bg-[#111520] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-3">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Competition Lifecycle & Backups
              </h3>
            </div>

            <div className="space-y-2.5 mb-6">
              {/* Fresh Slate: Clear All Data */}
              <button
                type="button"
                onClick={() => setIsClearAllConfirmOpen(true)}
                className="w-full p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete All Data (Fresh Empty Tournament)</span>
                </div>
                <span className="text-[10px] uppercase font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                  Clean Slate
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Reset Scores & Game Results to 0</span>
                </div>
                <span className="text-[10px] uppercase font-mono text-amber-400/80">New Round</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRestoreDefaultOpen(true)}
                className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Restore Sample Demo Data (Zenith, Kinos, Krex)</span>
                </div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Demo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() =>
                exportToCSV(leaderboard, settings.competitionName, gameLeaderboard, settings.scoring?.totalGames || 5)
              }
              className="p-3 bg-[#0b0e14] hover:bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImageExportOpen(true)}
              className="p-3 bg-[#0b0e14] hover:bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              <ImageIcon className="w-5 h-5 text-rose-400" />
              <span>Export Graphic Image</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="p-3 bg-[#0b0e14] hover:bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-5 h-5 text-amber-400" />
              <span>Backup JSON</span>
            </button>

            <label className="p-3 bg-[#0b0e14] hover:bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-sky-400" />
              <span>Restore JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearAllConfirmOpen}
        title="Delete All Tournament Data (Clean Slate)?"
        message="This will completely remove all registered teams, player rosters, tournament brackets, and recorded game scores so you can input your own community data from scratch."
        confirmLabel="Delete Everything"
        onConfirm={() => {
          clearAllData();
          setIsClearAllConfirmOpen(false);
        }}
        onCancel={() => setIsClearAllConfirmOpen(false)}
      />

      {/* Reset Scores Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Scores to 0?"
        message="This will reset all recorded game results, team points, wins, and kills to zero for the start of a new competition. Team names and rosters are preserved."
        confirmLabel="Reset Scores"
        onConfirm={() => {
          resetLeaderboardPoints();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Restore Demo Data Confirmation Modal */}
      <ConfirmModal
        isOpen={isRestoreDefaultOpen}
        title="Restore Default ROS Legacy Demo Data?"
        message="This will load the sample demo teams (Zenith Entity, Kinos, Krex E X, Game 1-3 scores, and initial bracket matches)."
        confirmLabel="Restore Demo"
        onConfirm={() => {
          resetToDefaultData();
          setIsRestoreDefaultOpen(false);
        }}
        onCancel={() => setIsRestoreDefaultOpen(false)}
      />

      <LeaderboardImageExport
        entries={leaderboard}
        gameEntries={gameLeaderboard}
        totalGames={settings.scoring?.totalGames || 5}
        settings={settings}
        isOpen={isImageExportOpen}
        onClose={() => setIsImageExportOpen(false)}
      />
    </div>
  );
};
