import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from '../../context/TournamentContext';
import type { LeaderboardEntry, GameLeaderboardEntry, TournamentSettings } from '../../types';
import {
  renderLeaderboardToCanvas,
  type GraphicExportOptions,
} from '../../utils/graphicExportUtils';
import { isImageLogo } from '../Common/TeamLogo';
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
  Table,
  Layers,
  FileText,
} from 'lucide-react';

interface LeaderboardImageExportProps {
  entries?: LeaderboardEntry[];
  gameEntries?: GameLeaderboardEntry[];
  totalGames?: number;
  settings?: TournamentSettings;
  initialMode?: 'gameMatrix' | 'standings' | 'grid';
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardImageExport: React.FC<LeaderboardImageExportProps> = ({
  entries: propEntries,
  gameEntries: propGameEntries,
  totalGames: propTotalGames,
  settings: propSettings,
  initialMode = 'gameMatrix',
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
    mode: initialMode,
    showPodium: true,
    showScoringRules: true,
    showCaptain: true,
    showPrize: true,
    maxTeams: 16,
    pageCount: 1,
    activePage: 1,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Hidden offscreen canvas for rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync mode if initialMode changes on modal open
  useEffect(() => {
    if (isOpen && initialMode) {
      setOptions((prev) => ({ ...prev, mode: initialMode }));
    }
  }, [isOpen, initialMode]);

  // Keep activePage valid within bounds
  useEffect(() => {
    if (options.activePage && options.pageCount && options.activePage > options.pageCount) {
      setOptions((prev) => ({ ...prev, activePage: 1 }));
    }
  }, [options.pageCount, options.activePage]);

  // Re-render canvas whenever settings or options change
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    const render = () => {
      if (!isMounted || !canvas) return;
      try {
        renderLeaderboardToCanvas(canvas, entries, gameEntries, totalGames, settings, options);
        setPreviewDataUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Failed to generate preview canvas:', err);
      }
    };

    // Immediate initial render
    render();

    // Preload any image logos if present, then re-render once loaded
    const imageLogos = (entries || [])
      .map((e) => e.logo)
      .concat((gameEntries || []).map((g) => g.logo))
      .filter((l): l is string => Boolean(l && isImageLogo(l)));

    if (imageLogos.length > 0) {
      Promise.all(
        imageLogos.map(
          (src) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = src;
            })
        )
      ).then(() => {
        if (isMounted) {
          render();
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, entries, gameEntries, totalGames, settings, options]);

  if (!isOpen) return null;

  const downloadCanvasAsPNG = (canvas: HTMLCanvasElement, filenameSuffix: string) => {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    const safeCompName = (settings.competitionName || 'tournament')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    a.download = `ros_${safeCompName}_${filenameSuffix}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = () => {
    setIsGenerating(true);
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    renderLeaderboardToCanvas(canvas, entries, gameEntries, totalGames, settings, options);

    const suffix =
      options.mode === 'grid'
        ? (options.pageCount || 1) > 1
          ? `grid_page_${options.activePage || 1}_of_${options.pageCount}`
          : 'grid_poster'
        : options.mode === 'gameMatrix'
        ? 'matrix'
        : 'standings';

    downloadCanvasAsPNG(canvas, suffix);

    setIsGenerating(false);
    tournament.showToast('High-resolution tournament image downloaded!', 'success', 'Image Exported');
  };

  // Download all pages sequentially for multi-page Grid View
  const handleDownloadAllPages = async () => {
    setIsGenerating(true);
    const offscreen = document.createElement('canvas');
    const totalP = options.pageCount || 1;

    for (let p = 1; p <= totalP; p++) {
      renderLeaderboardToCanvas(offscreen, entries, gameEntries, totalGames, settings, {
        ...options,
        activePage: p,
      });
      downloadCanvasAsPNG(offscreen, `grid_page_${p}_of_${totalP}`);

      if (p < totalP) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    setIsGenerating(false);
    tournament.showToast(
      `All ${totalP} pages of Leaderboard Grid downloaded successfully!`,
      'success',
      'All Pages Exported'
    );
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
          tournament.showToast('Tournament image copied to clipboard!', 'success', 'Image Copied');
          setTimeout(() => setCopied(false), 2500);
        } else {
          handleDownload();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#0e121d] border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[94vh] overflow-hidden">
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
                Official tournament visual graphic with Game Matrix, Standings, or Cards Grid View.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-[#0a0d15] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* View Mode Toggle: Game Matrix, Standings, Grid View */}
          <div className="flex items-center bg-[#121624] p-1 rounded-lg border border-slate-800 gap-1">
            <button
              onClick={() => setOptions((prev) => ({ ...prev, mode: 'gameMatrix' }))}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                options.mode === 'gameMatrix'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Game Matrix</span>
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
              <span>Standings Table</span>
            </button>
            <button
              onClick={() => setOptions((prev) => ({ ...prev, mode: 'grid' }))}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                options.mode === 'grid'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View Cards</span>
            </button>
          </div>

          {/* Grid View Page Options (1 Page, 2 Pages, 3 Pages) */}
          {options.mode === 'grid' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                Pages:
              </span>
              <div className="flex items-center bg-[#121624] p-1 rounded-lg border border-slate-800 gap-1">
                <button
                  onClick={() => setOptions((prev) => ({ ...prev, pageCount: 1, activePage: 1 }))}
                  className={`px-2.5 py-1 rounded font-bold text-xs transition-all ${
                    (options.pageCount || 1) === 1
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1 Page
                </button>
                <button
                  onClick={() => setOptions((prev) => ({ ...prev, pageCount: 2, activePage: 1 }))}
                  className={`px-2.5 py-1 rounded font-bold text-xs transition-all ${
                    options.pageCount === 2
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2 Pages
                </button>
                <button
                  onClick={() => setOptions((prev) => ({ ...prev, pageCount: 3, activePage: 1 }))}
                  className={`px-2.5 py-1 rounded font-bold text-xs transition-all ${
                    options.pageCount === 3
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3 Pages
                </button>
              </div>

              {/* Sub-page preview tabs if 2 or 3 pages */}
              {(options.pageCount || 1) > 1 && (
                <div className="flex items-center bg-[#121624] p-1 rounded-lg border border-amber-500/30 gap-1 ml-1">
                  {Array.from({ length: options.pageCount || 1 }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => setOptions((prev) => ({ ...prev, activePage: pNum }))}
                      className={`px-2.5 py-1 rounded font-bold text-xs transition-all ${
                        (options.activePage || 1) === pNum
                          ? 'bg-amber-500 text-black font-black'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      P{pNum}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
              <span className="font-semibold text-[11px]">Points Rules</span>
            </label>

            {/* Prize Badges Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#121624] px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300">
              <input
                type="checkbox"
                checked={options.showPrize}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, showPrize: e.target.checked }))
                }
                className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
              />
              <span className="font-semibold text-[11px]">Prize</span>
            </label>
          </div>
        </div>

        {/* Canvas Preview Container */}
        <div className="flex-1 p-4 sm:p-6 bg-[#080a10] overflow-auto flex items-center justify-center min-h-[380px] max-h-[58vh]">
          {previewDataUrl ? (
            <div className="relative group shadow-2xl rounded-xl border border-slate-800/80 overflow-hidden max-w-full">
              <img
                src={previewDataUrl}
                alt="Tournament Leaderboard Graphic Preview"
                className="w-full h-auto object-contain max-h-[54vh] select-none block"
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/75 backdrop-blur text-[10px] font-mono text-slate-400 border border-slate-700 pointer-events-none">
                {options.mode === 'grid'
                  ? (options.pageCount || 1) > 1
                    ? `GRID VIEW: PAGE ${options.activePage || 1} OF ${options.pageCount}`
                    : 'GRID VIEW: 1 PAGE POSTER'
                  : options.mode === 'gameMatrix'
                  ? 'GAME MATRIX VIEW'
                  : 'STANDINGS VIEW'}
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
            <span>
              {options.mode === 'grid'
                ? (options.pageCount || 1) > 1
                  ? `Grid View: Split evenly into ${options.pageCount} pages.`
                  : 'Grid View: All teams formatted as responsive tournament cards on 1 continuous poster.'
                : 'Ready to share on Discord, Facebook, or social channels.'}
            </span>
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
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            {options.mode === 'grid' && (options.pageCount || 1) > 1 ? (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="px-4 py-2 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-600 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Page {options.activePage || 1}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAllPages}
                  disabled={isGenerating}
                  className="px-5 py-2 text-xs sm:text-sm font-black bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All ({options.pageCount} Pages)</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="px-5 py-2 text-xs sm:text-sm font-black bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isGenerating
                    ? 'Rendering HD...'
                    : options.mode === 'grid'
                    ? 'Download Grid Poster (1 Page)'
                    : 'Download HD Image (PNG)'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
