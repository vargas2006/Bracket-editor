import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from '../../context/TournamentContext';
import type { Team, TournamentSettings } from '../../types';
import {
  renderTeamRosterToCanvas,
  preloadTeamLogos,
  splitTeamsIntoPages,
  type TeamRosterExportOptions,
  type TotalPagesMode,
} from '../../utils/teamRosterExportUtils';
import {
  Download,
  Copy,
  Check,
  X,
  Image as ImageIcon,
  Layers,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface TeamRosterImageExportProps {
  teams?: Team[];
  settings?: TournamentSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamRosterImageExport: React.FC<TeamRosterImageExportProps> = ({
  teams: propTeams,
  settings: propSettings,
  isOpen,
  onClose,
}) => {
  const tournament = useTournament();
  const teams = propTeams || tournament.teams;
  const settings = propSettings || tournament.settings;

  // Configuration options: 1 Page, 2 Pages, or 3 Pages
  const [totalPagesMode, setTotalPagesMode] = useState<TotalPagesMode>(1);
  const [activePage, setActivePage] = useState<number>(1);
  const [columns, setColumns] = useState<2 | 3>(3);
  const [showPrize, setShowPrize] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pages = splitTeamsIntoPages(teams, totalPagesMode);

  // Keep activePage valid within bounds
  useEffect(() => {
    if (activePage > totalPagesMode) {
      setActivePage(1);
    }
  }, [totalPagesMode, activePage]);

  // Render preview canvas whenever options or teams change
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
        const options: TeamRosterExportOptions = {
          totalPages: totalPagesMode,
          activePage,
          columns,
          showPrize,
        };
        renderTeamRosterToCanvas(canvas, teams, settings, options);
        setPreviewDataUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Failed to generate roster image preview:', err);
      }
    };

    // Immediate initial render
    render();

    // Preload logos and re-render with sharp pictures once loaded
    preloadTeamLogos(teams).then(() => {
      if (isMounted) {
        render();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, teams, settings, totalPagesMode, activePage, columns, showPrize]);

  if (!isOpen) return null;

  // Single page download helper
  const downloadCanvasAsPNG = (
    canvas: HTMLCanvasElement,
    pageLabel: string
  ) => {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    const safeCompName = (settings.competitionName || 'ros_squads')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    a.download = `${safeCompName}_rosters_${pageLabel}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadCurrent = () => {
    setIsGenerating(true);
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    const options: TeamRosterExportOptions = {
      totalPages: totalPagesMode,
      activePage,
      columns,
      showPrize,
    };
    renderTeamRosterToCanvas(canvas, teams, settings, options);

    const label =
      totalPagesMode > 1
        ? `page_${activePage}_of_${totalPagesMode}`
        : 'full_1page';
    downloadCanvasAsPNG(canvas, label);

    setIsGenerating(false);
    tournament.showToast(
      `Squad rosters ${
        totalPagesMode > 1 ? `Page ${activePage} of ${totalPagesMode}` : 'full poster'
      } downloaded!`,
      'success',
      'Image Exported'
    );
  };

  // Download all pages sequentially (Page 1, Page 2, Page 3...)
  const handleDownloadAllPages = async () => {
    setIsGenerating(true);
    const offscreen = document.createElement('canvas');

    for (let p = 1; p <= totalPagesMode; p++) {
      renderTeamRosterToCanvas(offscreen, teams, settings, {
        totalPages: totalPagesMode,
        activePage: p,
        columns,
        showPrize,
      });
      downloadCanvasAsPNG(offscreen, `page_${p}_of_${totalPagesMode}`);

      if (p < totalPagesMode) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    setIsGenerating(false);
    tournament.showToast(
      `All ${totalPagesMode} pages of squad rosters downloaded successfully!`,
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
          tournament.showToast(
            'Squad roster image copied to clipboard!',
            'success',
            'Image Copied'
          );
          setTimeout(() => setCopied(false), 2500);
        } else {
          handleDownloadCurrent();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy roster image to clipboard:', err);
      handleDownloadCurrent();
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
                  Download Squad Rosters Graphic
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HD 1920px POSTER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Rules of Survival squad roster display with logos, stats, and player names.
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
          {/* Page Count Mode Selector: 1 Page, 2 Pages, or 3 Pages */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              Page Count:
            </span>
            <div className="flex items-center bg-[#121624] p-1 rounded-lg border border-slate-800 gap-1">
              <button
                onClick={() => {
                  setTotalPagesMode(1);
                  setActivePage(1);
                }}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                  totalPagesMode === 1
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1 Page (All Teams)</span>
              </button>
              <button
                onClick={() => {
                  setTotalPagesMode(2);
                  setActivePage(1);
                }}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                  totalPagesMode === 2
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2 Pages (50/50 Split)</span>
              </button>
              <button
                onClick={() => {
                  setTotalPagesMode(3);
                  setActivePage(1);
                }}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all ${
                  totalPagesMode === 3
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3 Pages (1/3 Split)</span>
              </button>
            </div>
          </div>

          {/* Sub-page selector when multiple pages are selected */}
          {totalPagesMode > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Preview Page:
              </span>
              <div className="flex items-center bg-[#121624] p-1 rounded-lg border border-amber-500/30 gap-1">
                {pages.map((pTeams, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = activePage === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setActivePage(pNum)}
                      className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-black font-black'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Page {pNum} ({pTeams.length} Teams)
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid Layout & Feature Toggles */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Columns Toggle */}
            <div className="flex items-center bg-[#121624] px-2 py-1 rounded-lg border border-slate-800 text-slate-300 gap-1.5">
              <span className="text-[11px] font-medium text-slate-400">Columns:</span>
              <button
                onClick={() => setColumns(2)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  columns === 2
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                2 Cols
              </button>
              <button
                onClick={() => setColumns(3)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  columns === 3
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                3 Cols
              </button>
            </div>

            {/* Prize Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#121624] px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300">
              <input
                type="checkbox"
                checked={showPrize}
                onChange={(e) => setShowPrize(e.target.checked)}
                className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
              />
              <span className="font-semibold text-[11px]">Show Prize Badges</span>
            </label>
          </div>
        </div>

        {/* Main Preview Container */}
        <div className="flex-1 p-4 sm:p-6 bg-[#080a10] overflow-auto flex items-center justify-center min-h-[380px] max-h-[58vh]">
          {previewDataUrl ? (
            <div className="relative group shadow-2xl rounded-xl border border-slate-800/80 overflow-hidden max-w-full">
              <img
                src={previewDataUrl}
                alt="Squad Roster Graphic Preview"
                className="w-full h-auto object-contain max-h-[54vh] select-none block"
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/75 backdrop-blur text-[10px] font-mono text-slate-400 border border-slate-700 pointer-events-none">
                {totalPagesMode > 1
                  ? `PREVIEW: PAGE ${activePage} OF ${totalPagesMode} (${
                      (pages[activePage - 1] || []).length
                    } SQUADS)`
                  : `PREVIEW: 1 PAGE POSTER (${teams.length} SQUADS)`}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-3" />
              <p className="text-sm font-semibold">Generating high-definition squad graphic...</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#111522] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {totalPagesMode === 1
                ? `1-Page Mode: All ${teams.length} teams fit on one continuous poster.`
                : `${totalPagesMode}-Page Mode: Teams are evenly split into ${totalPagesMode} balanced pages.`}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Copy Button */}
            <button
              onClick={handleCopyToClipboard}
              disabled={isGenerating || !previewDataUrl}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
              title="Copy image to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Multiple Pages Mode (2 or 3 Pages) */}
            {totalPagesMode > 1 ? (
              <>
                <button
                  onClick={handleDownloadCurrent}
                  disabled={isGenerating || !previewDataUrl}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-600 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Page {activePage}</span>
                </button>

                <button
                  onClick={handleDownloadAllPages}
                  disabled={isGenerating || !previewDataUrl}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-rose-900/40 border border-rose-500/50 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All ({totalPagesMode} Pages)</span>
                </button>
              </>
            ) : (
              /* 1-Page Mode: Download Full Poster */
              <button
                onClick={handleDownloadCurrent}
                disabled={isGenerating || !previewDataUrl}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-rose-900/40 border border-rose-500/50 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download Poster (1 Page)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
