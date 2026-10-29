import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from '../../context/TournamentContext';
import type { LeaderboardEntry, GameLeaderboardEntry, TournamentSettings } from '../../types';
import {
  renderLeaderboardToCanvas,
  type GraphicExportOptions,
} from '../../utils/graphicExportUtils';
import {
  Download,
  Copy,
  Check,
  X,
  Trophy,
  LayoutGrid,
  ListOrdered,
  Image as ImageIcon,
  SlidersHorizontal,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface LeaderboardImageExportProps {
  entries?: LeaderboardEntry[];
  gameEntries?: GameLeaderboardEntry[];
  totalGames?: number;
  settings?: TournamentSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardImageExport: React.FC<LeaderboardImageExportProps> = ({
  entries: propEntries,
  gameEntries: propGameEntries,
  totalGames: propTotalGames,
  settings: propSettings,
  isOpen,
  onClose,
}) => {
  const tournament = useTournament();

  const entries = propEntries || tournament.leaderboard;
  const gameEntries = propGameEntries || tournament.gameLeaderboard;
  const settings = propSettings || tournament.settings;
  const totalGames = propTotalGames || settings.scoring?.totalGames || 5;

  // Export customization options
  const [options, setOptions] = useState<GraphicExportOptions>({
    mode: 'gameMatrix',
    showPodium: true,
    showScoringRules: true,
    showCaptain: true,
    showPrize: true,
    maxTeams: 16,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Hidden offscreen canvas for rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-render canvas whenever settings or options change
  useEffect(() => {
    if (!isOpen) return;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    try {
      renderLeaderboardToCanvas(canvas, entries, gameEntries, totalGames, settings, options);
      setPreviewDataUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Failed to generate preview canvas:', err);
    }
  }, [isOpen, entries, gameEntries, totalGames, settings, options]);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    renderLeaderboardToCanvas(canvas, entries, gameEntries, totalGames, settings, options);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    const safeCompName = (settings.competitionName || 'tournament')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    a.download = `ros_legacy_${safeCompName}_leaderboard_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setIsGenerating(false);
  };

  const handleCopyToClipboard = async () => {
    let canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } else {
          // Fallback download if clipboard item is not supported
          handleDownload();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      // Fallback to download
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0e121d] border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 bg-[#131726] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 border border-rose-500/50 flex items-center justify-center text-white shadow-lg shadow-rose-950/40">
              <ImageIcon className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  Leaderboard Graphic Export
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HD 1600px ROS COMMUNITY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                High-definition tournament visual for Rules of Survival ROS Community.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-[#0a0d15] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#121624] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setOptions((prev) => ({ ...prev, mode: 'gameMatrix' }))}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                options.mode === 'gameMatrix'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Game-by-Game Board</span>
            </button>
            <button
              onClick={() => setOptions((prev) => ({ ...prev, mode: 'standings' }))}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                options.mode === 'standings'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Overall Standings</span>
            </button>
          </div>

          {/* Feature Toggles */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Top 3 Podium Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#121624] px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300">
              <input
                type="checkbox"
                checked={options.showPodium}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, showPodium: e.target.checked }))
                }
                className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
              />
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-[11px]">Top 3 Podium</span>
            </label>

            {/* Scoring System Rules Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#121624] px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300">
              <input
                type="checkbox"
                checked={options.showScoringRules}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, showScoringRules: e.target.checked }))
                }
                className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
              />
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-semibold text-[11px]">Points Rules Banner</span>
            </label>

            {/* Captain IGN Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#121624] px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300">
              <input
                type="checkbox"
                checked={options.showCaptain}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, showCaptain: e.target.checked }))
                }
                className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
              />
              <span className="font-semibold text-[11px]">Captain IGNs</span>
            </label>

            {/* Prize Column Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#121624] px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300">
              <input
                type="checkbox"
                checked={options.showPrize}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, showPrize: e.target.checked }))
                }
                className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
              />
              <span className="font-semibold text-[11px]">Prize Column</span>
            </label>

            {/* Teams Count Selector */}
            <div className="flex items-center gap-1 bg-[#121624] px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">Rows:</span>
              <select
                value={options.maxTeams}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, maxTeams: Number(e.target.value) }))
                }
                className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
              >
                <option value={8} className="bg-[#121624]">Top 8</option>
                <option value={12} className="bg-[#121624]">Top 12</option>
                <option value={16} className="bg-[#121624]">Top 16</option>
                <option value={32} className="bg-[#121624]">All Teams</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Graphic Canvas Preview */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto bg-[#07090e] flex flex-col items-center justify-center min-h-[360px]">
          {previewDataUrl ? (
            <div className="w-full flex flex-col items-center">
              <div className="relative group max-w-full rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700/60 bg-[#0d101a]">
                <img
                  src={previewDataUrl}
                  alt="Rules of Survival Leaderboard Graphic Preview"
                  className="w-full h-auto object-contain max-h-[58vh] block rounded-lg select-none"
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10 pointer-events-none">
                  1600 × AUTO • HD PNG
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500 py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm">Rendering tournament visual graphic...</p>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-[#111522] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready to share on Discord, Facebook, or Twitter.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-5 py-2 text-xs sm:text-sm font-black bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Rendering HD...' : 'Download HD Image (PNG)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
