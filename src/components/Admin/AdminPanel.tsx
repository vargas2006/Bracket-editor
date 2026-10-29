import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { exportToCSV } from '../../utils/leaderboardUtils';
import { ConfirmModal } from '../Common/ConfirmModal';
import { LeaderboardImageExport } from '../Leaderboard/LeaderboardImageExport';
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  RotateCcw,
  Flame,
  Crosshair,
  Trophy,
  Download,
  Upload,
  Lock,
  KeyRound,
  FileSpreadsheet,
  Image as ImageIcon,
  Save,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    teams,
    leaderboard,
    settings,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    quickAdjustPoints,
    resetLeaderboardPoints,
    resetToDefaultData,
    updateSettings,
    updateTeam,
    showToast,
  } = useTournament();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [pointsInput, setPointsInput] = useState<number>(0);
  const [compName, setCompName] = useState(settings.competitionName);
  const [compStage, setCompStage] = useState(settings.seasonOrStage);
  const [adminPin, setAdminPin] = useState(settings.adminPin);
  const [ptsPerKill, setPtsPerKill] = useState(settings.pointsPerKill);
  const [ptsPerWin, setPtsPerWin] = useState(settings.pointsForChickenDinner);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isRestoreDefaultOpen, setIsRestoreDefaultOpen] = useState(false);
  const [isImageExportOpen, setIsImageExportOpen] = useState(false);

  // Quick PIN login inside the panel if currently guest
  const [unlockPin, setUnlockPin] = useState('');

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      competitionName: compName.trim() || settings.competitionName,
      seasonOrStage: compStage.trim() || settings.seasonOrStage,
      adminPin: adminPin.trim() || '1234',
      pointsPerKill: Number(ptsPerKill) || 1,
      pointsForChickenDinner: Number(ptsPerWin) || 10,
    });
  };

  const handleSetDirectPoints = () => {
    if (!selectedTeam) return;
    updateTeam(selectedTeam.id, { points: Math.max(0, pointsInput) });
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
          localStorage.setItem('ros_legacy_teams_v1', JSON.stringify(data.teams));
          if (data.settings) {
            localStorage.setItem('ros_legacy_settings_v1', JSON.stringify(data.settings));
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
          The Admin Control Center is restricted to authorized community moderators. Enter the PIN
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
    <div className="space-y-6">
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
              Admin Management Console
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Quick Match Scorer / Points Adjuster */}
        <div className="bg-[#111520] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Flame className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Live Battle Royale Match Scorer
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Target Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                const t = teams.find((item) => item.id === e.target.value);
                if (t) setPointsInput(t.points);
              }}
              className="w-full px-3 py-2.5 bg-[#0b0e14] border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-rose-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — Current: {t.points} pts (Kills: {t.kills ?? 0}, Wins: {t.wins ?? 0})
                </option>
              ))}
            </select>
          </div>

          {selectedTeam && (
            <div className="p-4 rounded-xl bg-[#0b0e15] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Selected Team:</span>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedTeam.logo || '🛡️'}</span>
                    <span>{selectedTeam.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Points:</span>
                  <div className="text-2xl font-black font-mono text-amber-400">
                    {selectedTeam.points}
                  </div>
                </div>
              </div>

              {/* Quick 1-click tournament scorers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    quickAdjustPoints(selectedTeam.id, settings.pointsForChickenDinner || 10);
                    updateTeam(selectedTeam.id, { wins: (selectedTeam.wins ?? 0) + 1 });
                    showToast(`+${settings.pointsForChickenDinner || 10} pts & +1 Win recorded for ${selectedTeam.name}!`);
                  }}
                  className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>+10 Chicken Dinner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    quickAdjustPoints(selectedTeam.id, settings.pointsPerKill || 1);
                    updateTeam(selectedTeam.id, { kills: (selectedTeam.kills ?? 0) + 1 });
                  }}
                  className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 hover:border-rose-400 text-rose-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <Crosshair className="w-4 h-4 text-rose-400" />
                  <span>+1 Kill (+1 pt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    quickAdjustPoints(selectedTeam.id, (settings.pointsPerKill || 1) * 5);
                    updateTeam(selectedTeam.id, { kills: (selectedTeam.kills ?? 0) + 5 });
                  }}
                  className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>+5 Squad Kills</span>
                </button>
              </div>

              {/* Direct override input */}
              <div className="pt-2 flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Direct Points Override
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pointsInput}
                    onChange={(e) => setPointsInput(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#121623] border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSetDirectPoints}
                  className="mt-5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
                >
                  Set Value
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Tournament Configuration Settings */}
        <div className="bg-[#111520] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Tournament Configuration
            </h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Points Per Kill
                </label>
                <input
                  type="number"
                  min="0"
                  value={ptsPerKill}
                  onChange={(e) => setPtsPerKill(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Points For 1st (Win)
                </label>
                <input
                  type="number"
                  min="0"
                  value={ptsPerWin}
                  onChange={(e) => setPtsPerWin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
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
              Save Tournament Settings
            </button>
          </form>
        </div>

        {/* 3. Competition Reset & Management */}
        <div className="bg-[#111520] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Competition Reset & Lifecycle
            </h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Quickly wipe scores for a brand new season/competition, or restore the official default demo
            data at any time.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Reset Leaderboard Points to 0</span>
              </div>
              <span className="text-[10px] uppercase font-mono text-amber-400/80">New Season</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRestoreDefaultOpen(true)}
              className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Restore Sample Community Data (Zenith, Kinos, Krex)</span>
              </div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Demo Data</span>
            </button>
          </div>
        </div>

        {/* 4. Export & Backup Center */}
        <div className="bg-[#111520] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Download className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Community Export & Backup
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => exportToCSV(leaderboard, settings.competitionName)}
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
              <span>Export Graphic PNG</span>
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

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Leaderboard Points to 0?"
        message="This will reset all team points, wins, and kills to zero for the start of a new competition season. Team names and rosters are preserved."
        confirmLabel="Reset Points"
        onConfirm={() => {
          resetLeaderboardPoints();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmModal
        isOpen={isRestoreDefaultOpen}
        title="Restore Default ROS Legacy Data?"
        message="This will overwrite current data with the default sample tournament data (including Zenith Entity, Kinos, Krex E X, and initial bracket matches)."
        confirmLabel="Restore Defaults"
        onConfirm={() => {
          resetToDefaultData();
          setIsRestoreDefaultOpen(false);
        }}
        onCancel={() => setIsRestoreDefaultOpen(false)}
      />

      <LeaderboardImageExport
        entries={leaderboard}
        settings={settings}
        isOpen={isImageExportOpen}
        onClose={() => setIsImageExportOpen(false)}
      />
    </div>
  );
};
