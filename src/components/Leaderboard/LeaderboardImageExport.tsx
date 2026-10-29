import React, { useState } from 'react';
import type { LeaderboardEntry, TournamentSettings } from '../../types';
import { formatPrize, formatOrdinal } from '../../utils/leaderboardUtils';
import { Download, Image as ImageIcon, X } from 'lucide-react';

interface LeaderboardImageExportProps {
  entries: LeaderboardEntry[];
  settings: TournamentSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardImageExport: React.FC<LeaderboardImageExportProps> = ({
  entries,
  settings,
  isOpen,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    const canvas = document.createElement('canvas');
    const width = 1200;
    const rowHeight = 56;
    const headerHeight = 220;
    const footerHeight = 80;
    const height = headerHeight + Math.min(entries.length, 16) * rowHeight + footerHeight;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(0.5, '#101420');
    bgGrad.addColorStop(1, '#07080d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Border glowing accent
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Header graphics
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('RULES OF SURVIVAL LEGACY • OFFICIAL ESPORTS TOURNAMENT', 60, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px sans-serif';
    ctx.fillText(settings.competitionName.toUpperCase(), 60, 110);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px sans-serif';
    ctx.fillText(`${settings.seasonOrStage.toUpperCase()} — OFFICIAL LEADERBOARD RANKINGS`, 60, 145);

    // Table Header bar
    const tableTop = 180;
    ctx.fillStyle = '#171c2b';
    ctx.fillRect(50, tableTop, width - 100, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('PLACEMENT', 70, tableTop + 26);
    ctx.fillText('TEAM NAME', 220, tableTop + 26);
    ctx.fillText('ROSTER (CAPTAIN)', 540, tableTop + 26);
    ctx.fillText('PRIZE', 860, tableTop + 26);
    ctx.fillText('POINTS', 1060, tableTop + 26);

    // Rows
    const displayEntries = entries.slice(0, 16);
    displayEntries.forEach((entry, idx) => {
      const y = tableTop + 40 + idx * rowHeight;

      // Row background
      if (entry.placement === 1) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      } else if (entry.placement === 2) {
        ctx.fillStyle = 'rgba(203, 213, 225, 0.08)';
      } else if (entry.placement === 3) {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.08)';
      } else {
        ctx.fillStyle = idx % 2 === 0 ? 'rgba(18, 22, 34, 0.6)' : 'rgba(11, 14, 23, 0.6)';
      }
      ctx.fillRect(50, y, width - 100, rowHeight - 4);

      // Placement pill
      let rankColor = '#94a3b8';
      let rankText = formatOrdinal(entry.placement);
      if (entry.placement === 1) rankColor = '#fbbf24';
      if (entry.placement === 2) rankColor = '#e2e8f0';
      if (entry.placement === 3) rankColor = '#f59e0b';

      ctx.fillStyle = rankColor;
      ctx.font = 'bold 18px monospace';
      ctx.fillText(rankText, 70, y + 34);

      // Team Name
      ctx.fillStyle = entry.placement <= 3 ? '#ffffff' : '#e2e8f0';
      ctx.font = entry.placement === 1 ? '900 20px sans-serif' : '700 18px sans-serif';
      ctx.fillText(entry.name, 220, y + 34);

      // Captain / roster summary
      const captain = entry.members.find((m) => m.isCaptain)?.ign || 'N/A';
      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.fillText(`C: ${captain} (+${entry.members.length - 1})`, 540, y + 34);

      // Prize
      const prizeText = formatPrize(entry.prize);
      ctx.fillStyle = prizeText !== '—' ? '#34d399' : '#475569';
      ctx.font = '15px sans-serif';
      ctx.fillText(prizeText, 860, y + 34);

      // Points
      ctx.fillStyle = entry.placement === 1 ? '#fbbf24' : '#ffffff';
      ctx.font = '900 22px monospace';
      ctx.fillText(`${entry.points}`, 1060, y + 35);
    });

    // Footer
    const footerY = height - 35;
    ctx.fillStyle = '#475569';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()} • ROS Legacy Community Portal`, 60, footerY);

    // Download PNG
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ros_legacy_leaderboard_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsGenerating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#131722] border border-slate-700 rounded-xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              Export Graphic Leaderboard
            </h3>
            <p className="text-xs text-slate-400">
              Generate a high-definition esports leaderboard image optimized for Discord and community posts.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0c0f16] border border-slate-800 text-xs space-y-2 text-slate-300 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-400">Competition:</span>
            <span className="font-semibold text-white">{settings.competitionName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Included Teams:</span>
            <span className="font-semibold text-white">{entries.length} Teams</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Image Resolution:</span>
            <span className="font-mono text-emerald-400">1200 x Auto HD</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-5 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-rose-900/40 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Rendering...' : 'Download Image (PNG)'}
          </button>
        </div>
      </div>
    </div>
  );
};
