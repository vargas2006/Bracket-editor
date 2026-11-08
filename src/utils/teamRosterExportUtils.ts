import type { Team, TournamentSettings } from '../types';
import { formatPrize } from './leaderboardUtils';
import { isImageLogo } from '../components/Common/TeamLogo';
import {
  drawRoundedRect,
  truncateText,
  drawLogoOnCanvas,
  canvasImageCache,
} from './graphicExportUtils';

export type TotalPagesMode = 1 | 2 | 3;

export interface TeamRosterExportOptions {
  totalPages: TotalPagesMode; // 1, 2, or 3 pages
  activePage: number; // 1-based page number (1, 2, or 3)
  columns?: 2 | 3;
  showPrize?: boolean;
}

/**
 * Splits teams into 1, 2, or 3 pages as evenly as possible.
 */
export function splitTeamsIntoPages(
  teams: Team[],
  totalPages: TotalPagesMode
): Team[][] {
  if (totalPages === 1 || teams.length === 0) {
    return [teams];
  }

  const count = teams.length;
  const baseSize = Math.floor(count / totalPages);
  const remainder = count % totalPages;

  const pages: Team[][] = [];
  let startIndex = 0;

  for (let i = 0; i < totalPages; i++) {
    // Distribute remainder items to earlier pages
    const pageSize = baseSize + (i < remainder ? 1 : 0);
    pages.push(teams.slice(startIndex, startIndex + pageSize));
    startIndex += pageSize;
  }

  return pages;
}

/**
 * Preload all team logos into the shared canvas image cache.
 */
export async function preloadTeamLogos(teams: Team[]): Promise<void> {
  const imageLogos = teams
    .map((t) => t.logo)
    .filter((l): l is string => Boolean(l && isImageLogo(l)));

  if (imageLogos.length === 0) return;

  await Promise.all(
    imageLogos.map(
      (src) =>
        new Promise<void>((resolve) => {
          if (canvasImageCache.has(src) && canvasImageCache.get(src)!.complete) {
            resolve();
            return;
          }
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            canvasImageCache.set(src, img);
            resolve();
          };
          img.onerror = () => {
            resolve(); // Fallback emoji will be used safely
          };
          img.src = src;
        })
    )
  );
}

/**
 * Renders the tournament teams and squad rosters onto an offscreen canvas.
 * Perfectly mirrors the design in Teams & Rosters Directory.
 */
export function renderTeamRosterToCanvas(
  canvas: HTMLCanvasElement,
  teams: Team[],
  settings: TournamentSettings,
  options: TeamRosterExportOptions
): { totalPages: number; currentPageTeams: Team[] } {
  const pages = splitTeamsIntoPages(teams, options.totalPages);
  const totalPages = pages.length;
  const pageIndex = Math.max(0, Math.min(options.activePage - 1, totalPages - 1));
  const displayTeams = pages[pageIndex] || [];

  const width = 1920;
  const paddingX = 60;
  const contentWidth = width - paddingX * 2; // 1800px

  // Grid Columns (Default: 3 columns matching Teams & Rosters view)
  const numCols: number = options.columns || (displayTeams.length <= 4 ? 2 : 3);
  const colGap = numCols === 2 ? 28 : 22;
  const cardWidth = (contentWidth - (numCols - 1) * colGap) / numCols;

  // Sizing & Heights
  const maxMembersInBatch = Math.max(
    2,
    ...displayTeams.map((t) => t.members.length)
  );
  const otherMembersCount = Math.max(1, maxMembersInBatch - 1);

  const hasAnyPrize =
    options.showPrize !== false &&
    displayTeams.some((t) => t.prize && t.prize.trim() !== '' && t.prize !== '—');

  const logoSize = numCols === 2 ? 145 : 135;

  // Calculate card height to comfortably fit logo, captain, and players
  const cardHeight = Math.max(
    logoSize + (displayTeams.some((t) => t.tag) ? 68 : 46),
    18 +
      24 +
      20 +
      (hasAnyPrize ? 28 : 0) +
      22 +
      32 +
      otherMembersCount * 30 +
      16 +
      30 +
      14
  );

  const rowGap = 24;
  const numRows = Math.max(1, Math.ceil(displayTeams.length / numCols));

  const headerHeight = 165;
  const footerHeight = 65;
  const gridHeight =
    displayTeams.length === 0
      ? 180
      : numRows * cardHeight + (numRows - 1) * rowGap;

  const totalHeight = headerHeight + 20 + gridHeight + 24 + footerHeight + 20;

  canvas.width = width;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { totalPages, currentPageTeams: displayTeams };
  }

  // Crisp graphic rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. SOLID DARK ESPORTS BACKGROUND
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, width, totalHeight);

  // 2. OUTER FRAME
  drawRoundedRect(ctx, 4, 4, width - 8, totalHeight - 8, 16, undefined, '#1e2538', 1.5);

  // 3. POSTER HEADER
  let currentY = 46;

  // Header Badge Pill
  const badgeText = '⚔️ RULES OF SURVIVAL • OFFICIAL SQUAD ROSTER DIRECTORY';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const badgeWidth = ctx.measureText(badgeText).width + 30;
  drawRoundedRect(
    ctx,
    paddingX,
    currentY,
    badgeWidth,
    26,
    6,
    '#161b26',
    '#2d3748',
    1
  );
  ctx.fillStyle = '#f43f5e';
  ctx.fillText(badgeText, paddingX + 15, currentY + 17);

  // Verified Date Pill (Top Right)
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  ctx.font = 'bold 12px monospace';
  const dateWidth = ctx.measureText(`VERIFIED: ${dateStr}`).width + 24;
  drawRoundedRect(
    ctx,
    width - paddingX - dateWidth,
    currentY,
    dateWidth,
    26,
    6,
    '#161b26',
    '#2d3748',
    1
  );
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`VERIFIED: ${dateStr}`, width - paddingX - dateWidth + 12, currentY + 17);

  currentY += 44;

  // Tournament Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const competitionTitle = (
    settings.competitionName || 'RULES OF SURVIVAL CHAMPIONS CUP 2026'
  ).toUpperCase();
  ctx.fillText(competitionTitle, paddingX, currentY);

  // Subtitle
  currentY += 28;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const subtitle = `TEAMS & SQUADS ROSTER DIRECTORY • ${
    settings.seasonOrStage || 'COMMUNITY TOURNAMENT'
  }`.toUpperCase();
  ctx.fillText(subtitle, paddingX, currentY);

  // Right-aligned Metadata Tags
  const totalPlayers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const statTags = [
    `🛡️ ${teams.length} SQUADS`,
    `👥 ${totalPlayers} PLAYERS`,
    totalPages > 1
      ? `📄 PAGE ${pageIndex + 1} OF ${totalPages} (${displayTeams.length} TEAMS)`
      : `📄 FULL DIRECTORY (1 PAGE)`,
  ];

  let tagX = width - paddingX;
  ctx.font = 'bold 11px monospace';
  for (let i = statTags.length - 1; i >= 0; i--) {
    const tag = statTags[i];
    const tw = ctx.measureText(tag).width + 16;
    tagX -= tw;
    drawRoundedRect(
      ctx,
      tagX,
      currentY - 18,
      tw,
      24,
      5,
      '#131722',
      '#273042',
      1
    );
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(tag, tagX + 8, currentY - 2);
    tagX -= 8;
  }

  currentY += 36;

  // 4. TEAMS GRID
  if (displayTeams.length === 0) {
    drawRoundedRect(
      ctx,
      paddingX,
      currentY,
      contentWidth,
      140,
      12,
      '#111520',
      '#1e293b',
      1
    );
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NO SQUADS FOUND FOR THIS PAGE', width / 2, currentY + 65);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Register squads and player rosters to generate this directory.', width / 2, currentY + 95);
    ctx.textAlign = 'left';
    currentY += 150;
  } else {
    for (let i = 0; i < displayTeams.length; i++) {
      const team = displayTeams[i];
      const col = i % numCols;
      const row = Math.floor(i / numCols);

      const cardX = paddingX + col * (cardWidth + colGap);
      const cardY = currentY + row * (cardHeight + rowGap);

      // Card Background (Matches TeamsPage #111520 with subtle border)
      drawRoundedRect(
        ctx,
        cardX,
        cardY,
        cardWidth,
        cardHeight,
        14,
        '#111520',
        '#1e293b',
        1
      );

      // Top subtle accent line on card
      drawRoundedRect(
        ctx,
        cardX + 1,
        cardY + 1,
        cardWidth - 2,
        3,
        [3, 3, 0, 0],
        '#e11d48'
      );

      // LEFT COLUMN: Team Logo & Tag
      const logoX = cardX + 16;
      const logoY = cardY + 18;

      // Logo container box (Square box #090c13 with #334155 border)
      drawRoundedRect(
        ctx,
        logoX,
        logoY,
        logoSize,
        logoSize,
        14,
        '#090c13',
        '#334155',
        1.5
      );

      // Render logo with rounded corners
      drawLogoOnCanvas(ctx, team.logo || '', logoX + 3, logoY + 3, logoSize - 6, '🛡️');

      // Tag pill below logo (if exists)
      if (team.tag && team.tag.trim() !== '') {
        const tagText = team.tag.trim().toUpperCase();
        ctx.font = 'bold 11px monospace';
        const tagTextWidth = ctx.measureText(tagText).width;
        const tagW = Math.min(logoSize, tagTextWidth + 14);
        const tagXPos = logoX + (logoSize - tagW) / 2;
        const tagYPos = logoY + logoSize + 10;

        drawRoundedRect(
          ctx,
          tagXPos,
          tagYPos,
          tagW,
          22,
          5,
          '#1e293b',
          'rgba(244, 63, 94, 0.4)',
          1
        );
        ctx.fillStyle = '#f43f5e';
        ctx.textAlign = 'center';
        ctx.fillText(tagText, tagXPos + tagW / 2, tagYPos + 15);
        ctx.textAlign = 'left';
      }

      // RIGHT COLUMN: Team Info & Squad Members
      const rightX = logoX + logoSize + 16;
      const rightWidth = cardX + cardWidth - 16 - rightX;
      let innerY = cardY + 22;

      // Team Name (Bold uppercase)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const safeName = truncateText(ctx, team.name, rightWidth);
      ctx.fillText(safeName, rightX, innerY);

      // Stats Line: Points • Kills • Wins (Matching screenshot)
      innerY += 20;
      ctx.font = 'bold 12px monospace';

      // 🏆 X pts
      ctx.fillStyle = '#fbbf24';
      const ptsText = `🏆 ${team.points} pts`;
      ctx.fillText(ptsText, rightX, innerY);
      const ptsWidth = ctx.measureText(ptsText).width;

      // •
      ctx.fillStyle = '#475569';
      ctx.fillText(' • ', rightX + ptsWidth, innerY);
      const dot1Width = ctx.measureText(' • ').width;

      // X Kills
      ctx.fillStyle = '#cbd5e1';
      const killsText = `${team.kills ?? 0} Kills`;
      ctx.fillText(killsText, rightX + ptsWidth + dot1Width, innerY);
      const killsWidth = ctx.measureText(killsText).width;

      // •
      ctx.fillStyle = '#475569';
      ctx.fillText(' • ', rightX + ptsWidth + dot1Width + killsWidth, innerY);
      const dot2Width = ctx.measureText(' • ').width;

      // X Wins
      ctx.fillStyle = '#cbd5e1';
      const winsText = `${team.wins ?? 0} Wins`;
      ctx.fillText(winsText, rightX + ptsWidth + dot1Width + killsWidth + dot2Width, innerY);

      // Prize pill (Matching green screenshot pill: 🎁 Prize: ₱X)
      if (
        options.showPrize !== false &&
        team.prize &&
        team.prize.trim() !== '' &&
        team.prize !== '—'
      ) {
        innerY += 10;
        const prizeLabel = `🎁 Prize: ${formatPrize(team.prize)}`;
        ctx.font = 'bold 11px sans-serif';
        const prizeW = Math.min(rightWidth, ctx.measureText(prizeLabel).width + 18);
        drawRoundedRect(
          ctx,
          rightX,
          innerY,
          prizeW,
          22,
          6,
          'rgba(5, 150, 105, 0.16)',
          'rgba(16, 185, 129, 0.35)',
          1
        );
        ctx.fillStyle = '#34d399';
        ctx.fillText(prizeLabel, rightX + 9, innerY + 15);
        innerY += 22;
      } else if (hasAnyPrize) {
        // Keep rows aligned
        innerY += 28;
      }

      // Squad Members Header Line (👥 SQUAD MEMBERS  2 PLAYERS)
      innerY += 16;
      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('👥 SQUAD MEMBERS', rightX, innerY);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#64748b';
      const countLabel = `${team.members.length} PLAYERS`;
      const countWidth = ctx.measureText(countLabel).width;
      ctx.fillText(countLabel, rightX + rightWidth - countWidth, innerY);

      // Captain Row
      const captain = team.members.find((m) => m.isCaptain);
      const otherMembers = team.members.filter((m) => !m.isCaptain);

      innerY += 6;
      if (captain) {
        drawRoundedRect(
          ctx,
          rightX,
          innerY,
          rightWidth,
          26,
          6,
          'rgba(245, 158, 11, 0.12)',
          'rgba(245, 158, 11, 0.35)',
          1
        );

        // Captain IGN
        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 11px monospace';
        const captainLabel = truncateText(ctx, `👑 ${captain.ign}`, rightWidth - 85);
        ctx.fillText(captainLabel, rightX + 8, innerY + 17);

        // Captain Badge
        const capBadgeText = 'CAPTAIN';
        ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const capBadgeW = ctx.measureText(capBadgeText).width + 10;
        const capBadgeX = rightX + rightWidth - capBadgeW - 6;

        drawRoundedRect(
          ctx,
          capBadgeX,
          innerY + 4,
          capBadgeW,
          18,
          4,
          'rgba(120, 53, 15, 0.85)',
          'rgba(245, 158, 11, 0.5)',
          1
        );
        ctx.fillStyle = '#fde68a';
        ctx.textAlign = 'center';
        ctx.fillText(capBadgeText, capBadgeX + capBadgeW / 2, innerY + 16);
        ctx.textAlign = 'left';

        // Optional captain role (e.g. IGL)
        if (captain.role && captain.role.toLowerCase() !== 'captain') {
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#fbbf24';
          const roleW = ctx.measureText(captain.role).width;
          ctx.fillText(captain.role, capBadgeX - roleW - 6, innerY + 16);
        }
      }

      // Other Squad Members
      innerY += 30;
      for (const member of otherMembers) {
        drawRoundedRect(
          ctx,
          rightX,
          innerY,
          rightWidth,
          24,
          5,
          '#0a0d14',
          '#1e293b',
          1
        );

        // Member IGN
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '600 11px monospace';
        const memberLabel = truncateText(ctx, `👤 ${member.ign}`, rightWidth - 75);
        ctx.fillText(memberLabel, rightX + 8, innerY + 16);

        // Member Role
        if (member.role) {
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#64748b';
          const roleW = ctx.measureText(member.role).width;
          ctx.fillText(member.role, rightX + rightWidth - roleW - 8, innerY + 16);
        }

        innerY += 28;
      }

      // CARD FOOTER DIVIDER & LABELS (Pinned to bottom of card)
      const cardFooterY = cardY + cardHeight - 28;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + 16, cardFooterY);
      ctx.lineTo(cardX + cardWidth - 16, cardFooterY);
      ctx.stroke();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('ROS Legacy Division', cardX + 16, cardFooterY + 18);

      const idText = `ID: ${team.id.replace('team-', '')}`;
      const idW = ctx.measureText(idText).width;
      ctx.fillText(idText, cardX + cardWidth - 16 - idW, cardFooterY + 18);
    }

    currentY += numRows * (cardHeight + rowGap);
  }

  // 5. POSTER FOOTER
  ctx.strokeStyle = '#1e2538';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, totalHeight - footerHeight);
  ctx.lineTo(width - paddingX, totalHeight - footerHeight);
  ctx.stroke();

  const footerTextY = totalHeight - footerHeight + 35;
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('RULES OF SURVIVAL ESPORTS • OFFICIAL SQUADS & ROSTERS DIRECTORY', paddingX, footerTextY);

  const discordText = 'JOIN DISCORD: discord.gg/6CzpykTdQC';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText(discordText, width / 2, footerTextY);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#f43f5e';
  const pageFooterLabel =
    totalPages > 1
      ? `PAGE ${pageIndex + 1} OF ${totalPages}`
      : 'COMPLETE DIRECTORY (1 PAGE)';
  ctx.fillText(pageFooterLabel, width - paddingX, footerTextY);
  ctx.textAlign = 'left';

  return { totalPages, currentPageTeams: displayTeams };
}
