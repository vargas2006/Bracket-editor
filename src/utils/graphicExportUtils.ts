import type { GameLeaderboardEntry, LeaderboardEntry, TournamentSettings } from '../types';
import { formatPrize, formatOrdinal } from './leaderboardUtils';

export interface GraphicExportOptions {
  mode: 'gameMatrix' | 'standings';
  showPodium: boolean;
  showScoringRules: boolean;
  showCaptain: boolean;
  showPrize: boolean;
  maxTeams: number; // e.g. 8, 12, 16, or 999 for all
}

/**
 * Safely draws a rounded rectangle on Canvas 2D
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | [number, number, number, number],
  fill?: string | CanvasGradient,
  stroke?: string | CanvasGradient,
  lineWidth: number = 1
) {
  ctx.save();
  ctx.beginPath();

  const r = typeof radius === 'number'
    ? [radius, radius, radius, radius]
    : radius;

  const [tl, tr, br, bl] = r;

  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Truncates text with ellipsis if it exceeds maxWidth
 */
export function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

/**
 * Renders the clean, high-definition tournament graphic leaderboard onto a canvas.
 * Clean, sharp, solid colors with zero color-bleeding or blurred gradients.
 */
export function renderLeaderboardToCanvas(
  canvas: HTMLCanvasElement,
  entries: LeaderboardEntry[],
  gameEntries: GameLeaderboardEntry[],
  totalGames: number,
  settings: TournamentSettings,
  options: GraphicExportOptions
) {
  const width = 1600;
  const paddingX = 50;
  const contentWidth = width - paddingX * 2; // 1500px

  const displayEntries = (options.mode === 'gameMatrix' ? gameEntries : entries).slice(
    0,
    options.maxTeams
  );

  const hasTeams = displayEntries.length > 0;
  const showPodium = options.showPodium && hasTeams;
  const showScoringRules = options.showScoringRules;

  // Layout sizing
  const headerHeight = 175;
  const podiumHeight = showPodium ? 124 : 0;
  const scoringRulesHeight = showScoringRules ? 48 : 0;
  const tableHeaderHeight = 46;
  const rowHeight = 60;
  const footerHeight = 65;
  const spacingBetweenSections = 16;

  const tableBodyHeight = hasTeams
    ? displayEntries.length * rowHeight
    : 130; // empty state height

  const totalHeight =
    headerHeight +
    (showPodium ? podiumHeight + spacingBetweenSections : 0) +
    (showScoringRules ? scoringRulesHeight + spacingBetweenSections : 0) +
    tableHeaderHeight +
    tableBodyHeight +
    spacingBetweenSections +
    footerHeight +
    25; // bottom margin

  canvas.width = width;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Crisp text rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. SOLID CLEAN DARK BACKGROUND (No fuzzy radial gradients or color bleeding)
  ctx.fillStyle = '#0b0e14';
  ctx.fillRect(0, 0, width, totalHeight);

  // 2. CLEAN OUTER FRAME
  drawRoundedRect(ctx, 4, 4, width - 8, totalHeight - 8, 14, undefined, '#1e2538', 1.5);

  // 3. HEADER SECTION
  let currentY = 46;

  // Header Badge Pill: ⚔️ RULES OF SURVIVAL • ROS COMMUNITY
  const badgeText = '⚔️ RULES OF SURVIVAL • ROS COMMUNITY';
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

  // Header Right: Date & Verification Pill
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

  // Main Tournament Title (Clean solid white)
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const competitionTitle = (settings.competitionName || 'RULES OF SURVIVAL').toUpperCase();
  ctx.fillText(competitionTitle, paddingX, currentY);

  // Subtitle + Metadata Tags
  currentY += 28;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const subtitle = `${(settings.seasonOrStage || 'ROS COMMUNITY TOURNAMENT').toUpperCase()} • STANDINGS & MATCH RESULTS`;
  ctx.fillText(subtitle, paddingX, currentY);

  // Scoring Settings Values
  const scoring = settings.scoring;
  const ptsPerKill = scoring?.pointsPerKill ?? settings.pointsPerKill ?? 5;
  const cdBonus = scoring?.chickenDinnerBonus ?? settings.pointsForChickenDinner ?? 25;
  const prizes = settings.prizes;

  // Right-aligned stats badges (Clean solid dark badges)
  const statTags = [
    `🎮 ${totalGames} GAMES`,
    `⚔️ ${ptsPerKill} PTS/KILL`,
    `🍗 +${cdBonus} CD BONUS`,
    `🛡️ ${displayEntries.length} TEAMS`,
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

  currentY += 32;

  // 4. TOP 3 PODIUM CARDS BANNER (Clean solid cards, no fuzzy color glow)
  if (showPodium) {
    const top1 = options.mode === 'gameMatrix' ? gameEntries[0] : entries[0];
    const top2 = options.mode === 'gameMatrix' ? gameEntries[1] : entries[1];
    const top3 = options.mode === 'gameMatrix' ? gameEntries[2] : entries[2];

    const cardGap = 16;
    const cardWidth = (contentWidth - cardGap * 2) / 3;
    const cardY = currentY;
    const cardHeight = 124;

    // Helper to draw a clean podium card
    const drawPodiumCard = (
      cardX: number,
      cardYPos: number,
      cardW: number,
      cardH: number,
      place: 1 | 2 | 3,
      entry?: any
    ) => {
      if (!entry) return;

      const teamName = entry.teamName || entry.name || 'Unknown';
      const points = entry.totalPoints ?? entry.points ?? 0;
      const kills = entry.totalKills ?? entry.kills ?? 0;
      const wins = entry.totalChickenDinners ?? entry.wins ?? 0;
      const logo = entry.logo || (place === 1 ? '👑' : place === 2 ? '🥈' : '🥉');

      // Determine prize: stays anchored to rank 1 to 4, displayed immediately
      const prize =
        entry.prize && entry.prize !== '—'
          ? entry.prize
          : place === 1
          ? prizes?.top1 || '₱500'
          : place === 2
          ? prizes?.top2 || '₱200'
          : place === 3
          ? prizes?.top3 || '₱100'
          : place === 4 && prizes?.top4 && prizes?.top4 !== '—'
          ? prizes?.top4
          : '—';

      let borderColor = '#2d3748';
      let cardBg = '#111522';
      let labelBg = '#161d2d';
      let labelText = '#94a3b8';
      let titleLabel = `${formatOrdinal(place).toUpperCase()} PLACE`;
      let pointsColor = '#ffffff';

      if (place === 1) {
        borderColor = '#d97706';
        cardBg = '#141a29';
        labelBg = '#261e12';
        labelText = '#fbbf24';
        titleLabel = '👑 1ST PLACE CHAMPION';
        pointsColor = '#fbbf24';
      } else if (place === 2) {
        borderColor = '#475569';
        cardBg = '#111522';
        labelBg = '#1a2233';
        labelText = '#cbd5e1';
        titleLabel = '🥈 2ND PLACE';
        pointsColor = '#e2e8f0';
      } else if (place === 3) {
        borderColor = '#78350f';
        cardBg = '#111522';
        labelBg = '#221910';
        labelText = '#f59e0b';
        titleLabel = '🥉 3RD PLACE';
        pointsColor = '#f59e0b';
      }

      // Draw clean solid card (NO radial glow or blurred leaks)
      drawRoundedRect(ctx, cardX, cardYPos, cardW, cardH, 12, cardBg, borderColor, place === 1 ? 2 : 1);

      // Logo Box (Clean solid dark box)
      const logoBoxSize = 56;
      const logoBoxX = cardX + 16;
      const logoBoxY = cardYPos + (cardH - logoBoxSize) / 2;
      drawRoundedRect(
        ctx,
        logoBoxX,
        logoBoxY,
        logoBoxSize,
        logoBoxSize,
        10,
        '#0d101a',
        borderColor,
        1
      );
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(logo, logoBoxX + logoBoxSize / 2, logoBoxY + logoBoxSize / 2 + 1);

      // Content Middle
      const textX = logoBoxX + logoBoxSize + 14;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // Placement Pill
      ctx.font = 'bold 11px monospace';
      const labelW = ctx.measureText(titleLabel).width + 14;
      drawRoundedRect(ctx, textX, cardYPos + 18, labelW, 19, 4, labelBg, borderColor, 0.5);
      ctx.fillStyle = labelText;
      ctx.fillText(titleLabel, textX + 7, cardYPos + 32);

      // Team Name (Clean bold white)
      ctx.fillStyle = '#ffffff';
      ctx.font = place === 1 ? '900 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const maxNameW = cardW - 215;
      ctx.fillText(truncateText(ctx, teamName, maxNameW), textX, cardYPos + 57);

      // Stats line: Kills • Chicken Dinners
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 11px monospace';
      ctx.fillText(`${kills} Kills  •  ${wins} Wins 👑`, textX, cardYPos + 76);

      // Prize Badge in Card
      if (prize && prize !== '—') {
        const prizeLabel = `🎁 PRIZE: ${prize}`;
        ctx.font = 'bold 11px monospace';
        const pw = ctx.measureText(prizeLabel).width + 12;
        drawRoundedRect(ctx, textX, cardYPos + 87, pw, 18, 4, '#06291e', '#059669', 1);
        ctx.fillStyle = '#34d399';
        ctx.fillText(prizeLabel, textX + 6, cardYPos + 100);
      }

      // Points on Right (Sharp monospace numbers)
      const rightX = cardX + cardW - 18;
      ctx.textAlign = 'right';
      ctx.fillStyle = pointsColor;
      ctx.font = place === 1 ? '900 30px monospace' : '800 26px monospace';
      ctx.fillText(`${points}`, rightX, cardYPos + 62);

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('TOTAL PTS', rightX, cardYPos + 78);
    };

    // Render 2nd, 1st, 3rd in classic podium order
    drawPodiumCard(paddingX, cardY, cardWidth, cardHeight, 2, top2);
    drawPodiumCard(paddingX + cardWidth + cardGap, cardY, cardWidth, cardHeight, 1, top1);
    drawPodiumCard(paddingX + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 3, top3);

    currentY += cardHeight + spacingBetweenSections;
  }

  // 5. TOURNAMENT SCORING SYSTEM & RULES BANNER (Solid, crisp banner)
  if (showScoringRules) {
    const bannerY = currentY;
    const bannerH = 46;

    drawRoundedRect(
      ctx,
      paddingX,
      bannerY,
      contentWidth,
      bannerH,
      10,
      '#101422',
      '#1e2538',
      1
    );

    // Left Tag: SCORING RULES
    const tagX = paddingX + 16;
    drawRoundedRect(ctx, tagX, bannerY + 10, 124, 26, 5, '#161b26', '#2d3748', 1);
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡ SCORING RULES', tagX + 62, bannerY + 23);

    // Rule items
    const rulesStartY = bannerY + 23;
    ctx.textBaseline = 'middle';

    // 1. Kill Points Rule
    let curX = tagX + 142;
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';
    const killRuleText = `⚔️ KILLS: ${ptsPerKill} PTS / KILL`;
    ctx.fillText(killRuleText, curX, rulesStartY);
    curX += ctx.measureText(killRuleText).width + 18;

    // Divider
    ctx.fillStyle = '#475569';
    ctx.fillText('•', curX, rulesStartY);
    curX += 14;

    // 2. Chicken Dinner Rule
    ctx.fillStyle = '#fbbf24';
    const cdRuleText = `👑 CHICKEN DINNER: +${cdBonus} PTS`;
    ctx.fillText(cdRuleText, curX, rulesStartY);
    curX += ctx.measureText(cdRuleText).width + 18;

    // Divider
    ctx.fillStyle = '#475569';
    ctx.fillText('•', curX, rulesStartY);
    curX += 14;

    // 3. Placement Points Rule
    const placementEnabled = scoring?.placementPointsEnabled ?? true;
    const p2 = scoring?.placementPoints?.[2] ?? 20;
    const p3 = scoring?.placementPoints?.[3] ?? 15;
    const p4 = scoring?.placementPoints?.[4] ?? 10;
    const placeRuleText = placementEnabled
      ? `🎯 PLACEMENT: 2nd +${p2} • 3rd +${p3} • 4th +${p4}`
      : '🎯 PLACEMENT: Kills + CD Only';

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(placeRuleText, curX, rulesStartY);

    // 4. Right side: Tournament Prize Pool
    const top1Prize = prizes?.top1 || '₱500';
    const top2Prize = prizes?.top2 || '₱200';
    const top3Prize = prizes?.top3 || '₱100';
    const prizeSummaryText = `🏆 PRIZES: 1st ${top1Prize}  •  2nd ${top2Prize}  •  3rd ${top3Prize}`;

    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(prizeSummaryText, paddingX + contentWidth - 18, rulesStartY);

    currentY += bannerH + spacingBetweenSections;
  }

  // 6. THE LEADERBOARD TABLE CONTAINER (Solid dark panel)
  const tableContainerY = currentY;
  const tableContainerHeight = tableHeaderHeight + tableBodyHeight;

  drawRoundedRect(
    ctx,
    paddingX,
    tableContainerY,
    contentWidth,
    tableContainerHeight,
    12,
    '#0e121e',
    '#1e2538',
    1.5
  );

  // Table Column Definitions
  interface ColumnDef {
    key: string;
    label: string;
    width: number;
    align: 'left' | 'center' | 'right';
    headerX: number;
  }

  const columns: ColumnDef[] = [];

  if (options.mode === 'gameMatrix') {
    // Placement
    columns.push({ key: 'rank', label: 'RANK', width: 90, align: 'center', headerX: paddingX + 45 });
    // Team Name
    columns.push({ key: 'team', label: 'TEAM NAME & ROSTER', width: 360, align: 'left', headerX: paddingX + 110 });

    // Game Columns
    const gameColWidth = Math.min(85, Math.max(60, Math.floor(450 / totalGames)));
    let curX = paddingX + 470;
    for (let g = 1; g <= totalGames; g++) {
      columns.push({ key: `game_${g}`, label: `G${g}`, width: gameColWidth, align: 'center', headerX: curX + gameColWidth / 2 });
      curX += gameColWidth;
    }

    // Total Kills
    columns.push({ key: 'kills', label: 'KILLS', width: 90, align: 'center', headerX: curX + 45 });
    curX += 90;

    // Total Chicken Dinners
    columns.push({ key: 'wins', label: 'WINS 👑', width: 100, align: 'center', headerX: curX + 50 });
    curX += 100;

    // Total Points (Bold)
    columns.push({ key: 'points', label: 'TOTAL PTS', width: 130, align: 'right', headerX: curX + 110 });
    curX += 130;

    // Prize
    if (options.showPrize) {
      columns.push({ key: 'prize', label: 'PRIZE', width: contentWidth - (curX - paddingX), align: 'left', headerX: curX + 25 });
    }
  } else {
    // Overall Standings Mode
    columns.push({ key: 'rank', label: 'PLACEMENT', width: 120, align: 'center', headerX: paddingX + 60 });
    columns.push({ key: 'team', label: 'TEAM NAME', width: 440, align: 'left', headerX: paddingX + 140 });
    columns.push({ key: 'captain', label: 'CAPTAIN & SQUAD', width: 320, align: 'left', headerX: paddingX + 600 });
    columns.push({ key: 'kills', label: 'KILLS', width: 110, align: 'center', headerX: paddingX + 960 });
    columns.push({ key: 'wins', label: 'CHICKEN DINNERS', width: 150, align: 'center', headerX: paddingX + 1100 });
    columns.push({ key: 'prize', label: 'PRIZE', width: 160, align: 'left', headerX: paddingX + 1240 });
    columns.push({ key: 'points', label: 'POINTS', width: 160, align: 'right', headerX: paddingX + contentWidth - 30 });
  }

  // Draw Table Header Bar (Solid dark surface)
  drawRoundedRect(
    ctx,
    paddingX,
    tableContainerY,
    contentWidth,
    tableHeaderHeight,
    [12, 12, 0, 0],
    '#141926',
    '#1e2538',
    1
  );

  // Render Table Header Text
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.textBaseline = 'middle';

  for (const col of columns) {
    ctx.textAlign = col.align;
    ctx.fillText(col.label, col.headerX, tableContainerY + tableHeaderHeight / 2);
  }

  // 7. RENDER ROWS (Solid alternating backgrounds, clean text)
  let rowY = tableContainerY + tableHeaderHeight;

  if (!hasTeams) {
    // Empty state
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(
      'NO TOURNAMENT TEAMS REGISTERED YET',
      paddingX + contentWidth / 2,
      rowY + 45
    );
    ctx.font = '12px monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText(
      'Add teams in the Teams or Admin tab to generate the tournament leaderboard graphic.',
      paddingX + contentWidth / 2,
      rowY + 70
    );
  } else {
    displayEntries.forEach((rawEntry, idx) => {
      const isLast = idx === displayEntries.length - 1;
      const rank = (rawEntry as any).rank ?? (rawEntry as any).placement ?? idx + 1;
      const totalPoints = (rawEntry as any).totalPoints ?? (rawEntry as any).points ?? 0;
      const isTop1 = rank === 1 && totalPoints > 0;
      const isTop2 = rank === 2 && totalPoints > 0;
      const isTop3 = rank === 3 && totalPoints > 0;

      const teamName = (rawEntry as any).teamName || (rawEntry as any).name || 'Unknown';
      const tag = rawEntry.tag;
      const logo = rawEntry.logo || '🛡️';
      const members = rawEntry.members || [];
      const captain = members.find((m) => m.isCaptain);
      const totalKills = (rawEntry as any).totalKills ?? (rawEntry as any).kills ?? 0;
      const totalWins = (rawEntry as any).totalChickenDinners ?? (rawEntry as any).wins ?? 0;

      // Prize fallback: stays anchored to rank 1 to 4, displayed immediately
      const prize =
        rawEntry.prize && rawEntry.prize !== '—'
          ? formatPrize(rawEntry.prize)
          : rank === 1
          ? prizes?.top1 || '₱500'
          : rank === 2
          ? prizes?.top2 || '₱200'
          : rank === 3
          ? prizes?.top3 || '₱100'
          : rank === 4 && prizes?.top4 && prizes?.top4 !== '—'
          ? prizes?.top4
          : '—';

      // Clean solid row backgrounds (No bleeding colors)
      let rowBg = idx % 2 === 0 ? '#101420' : '#0d101a';
      if (isTop1) rowBg = '#141a28';
      else if (isTop2) rowBg = '#111624';
      else if (isTop3) rowBg = '#121520';

      drawRoundedRect(
        ctx,
        paddingX,
        rowY,
        contentWidth,
        rowHeight,
        isLast ? [0, 0, 12, 12] : 0,
        rowBg,
        undefined
      );

      // Clean subtle row divider line
      if (!isLast) {
        ctx.strokeStyle = '#1a2233';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(paddingX, rowY + rowHeight);
        ctx.lineTo(paddingX + contentWidth, rowY + rowHeight);
        ctx.stroke();
      }

      // Left Accent Strip for Top 3 (Crisp clean bar)
      if (isTop1) {
        drawRoundedRect(ctx, paddingX, rowY + 6, 4, rowHeight - 12, 2, '#d97706');
      } else if (isTop2) {
        drawRoundedRect(ctx, paddingX, rowY + 6, 4, rowHeight - 12, 2, '#94a3b8');
      } else if (isTop3) {
        drawRoundedRect(ctx, paddingX, rowY + 6, 4, rowHeight - 12, 2, '#b45309');
      }

      // 1. Placement / Rank Badge
      const rankCol = columns.find((c) => c.key === 'rank');
      if (rankCol) {
        const badgeSize = 32;
        const badgeX = rankCol.headerX - badgeSize / 2;
        const badgeY = rowY + (rowHeight - badgeSize) / 2;

        if (isTop1) {
          drawRoundedRect(
            ctx,
            badgeX,
            badgeY,
            badgeSize,
            badgeSize,
            7,
            '#261e12',
            '#d97706',
            1.5
          );
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fbbf24';
          ctx.font = '900 13px monospace';
          ctx.fillText('1st', badgeX + badgeSize / 2, badgeY + badgeSize / 2);
        } else if (isTop2) {
          drawRoundedRect(
            ctx,
            badgeX,
            badgeY,
            badgeSize,
            badgeSize,
            7,
            '#1c2433',
            '#94a3b8',
            1.5
          );
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 13px monospace';
          ctx.fillText('2nd', badgeX + badgeSize / 2, badgeY + badgeSize / 2);
        } else if (isTop3) {
          drawRoundedRect(
            ctx,
            badgeX,
            badgeY,
            badgeSize,
            badgeSize,
            7,
            '#221910',
            '#b45309',
            1.5
          );
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 13px monospace';
          ctx.fillText('3rd', badgeX + badgeSize / 2, badgeY + badgeSize / 2);
        } else {
          drawRoundedRect(
            ctx,
            badgeX,
            badgeY,
            badgeSize,
            badgeSize,
            7,
            '#151b26',
            '#273042',
            1
          );
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(formatOrdinal(rank), badgeX + badgeSize / 2, badgeY + badgeSize / 2);
        }
      }

      // 2. Team Name & Logo & Captain
      const teamCol = columns.find((c) => c.key === 'team');
      if (teamCol) {
        const teamX = teamCol.headerX;

        // Avatar
        const avatarSize = 34;
        const avatarY = rowY + (rowHeight - avatarSize) / 2;
        drawRoundedRect(
          ctx,
          teamX,
          avatarY,
          avatarSize,
          avatarSize,
          7,
          '#0d111a',
          isTop1 ? '#d97706' : '#273042',
          1
        );
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '17px sans-serif';
        ctx.fillText(logo, teamX + avatarSize / 2, avatarY + avatarSize / 2 + 1);

        // Name + Tag
        const nameX = teamX + avatarSize + 12;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        ctx.fillStyle = isTop1 ? '#ffffff' : '#f1f5f9';
        ctx.font = isTop1
          ? '900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          : 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        const nameY = options.showCaptain && captain ? rowY + 25 : rowY + rowHeight / 2 + 5;
        const maxTextW = teamCol.width - avatarSize - 80;
        const dispName = truncateText(ctx, teamName, maxTextW);
        ctx.fillText(dispName, nameX, nameY);

        // Tag
        if (tag) {
          const nameWidth = ctx.measureText(dispName).width;
          const tagX = nameX + nameWidth + 8;
          ctx.font = 'bold 10px monospace';
          const tagW = ctx.measureText(tag).width + 10;
          drawRoundedRect(ctx, tagX, nameY - 12, tagW, 16, 3, '#1a2233', '#2d3748', 1);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(tag, tagX + 5, nameY);
        }

        // Captain IGN under team name
        if (options.showCaptain && captain) {
          ctx.fillStyle = '#64748b';
          ctx.font = '600 11px monospace';
          ctx.fillText(`👑 Capt: ${captain.ign}`, nameX, rowY + 43);
        }
      }

      // If Standings Mode: Captain Column
      if (options.mode === 'standings') {
        const captCol = columns.find((c) => c.key === 'captain');
        if (captCol) {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px monospace';
          const captText = captain ? `👑 ${captain.ign} (+${members.length - 1} members)` : `${members.length} members`;
          ctx.fillText(truncateText(ctx, captText, captCol.width - 20), captCol.headerX, rowY + rowHeight / 2);
        }
      }

      // Game Matrix Columns (G1, G2, G3...)
      if (options.mode === 'gameMatrix') {
        const gameResults = (rawEntry as GameLeaderboardEntry).gameResults || {};
        const gameScores = (rawEntry as GameLeaderboardEntry).gameScores || {};

        for (let g = 1; g <= totalGames; g++) {
          const gCol = columns.find((c) => c.key === `game_${g}`);
          if (!gCol) continue;

          const res = gameResults[g];
          const score = gameScores[g] ?? 0;
          const hasScore = !!res;

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (hasScore) {
            ctx.font = res.chickenDinner ? '900 14px monospace' : 'bold 14px monospace';
            ctx.fillStyle = res.chickenDinner ? '#fbbf24' : '#e2e8f0';

            const scoreText = res.chickenDinner ? `${score} 👑` : `${score}`;
            ctx.fillText(scoreText, gCol.headerX, rowY + rowHeight / 2);
          } else {
            ctx.font = '600 12px monospace';
            ctx.fillStyle = '#475569';
            ctx.fillText('0', gCol.headerX, rowY + rowHeight / 2);
          }
        }
      }

      // Kills Column
      const killsCol = columns.find((c) => c.key === 'kills');
      if (killsCol) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`${totalKills}`, killsCol.headerX, rowY + rowHeight / 2);
      }

      // Wins Column
      const winsCol = columns.find((c) => c.key === 'wins');
      if (winsCol) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = totalWins > 0 ? '#fbbf24' : '#475569';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(totalWins > 0 ? `${totalWins} 👑` : '0', winsCol.headerX, rowY + rowHeight / 2);
      }

      // Prize Column
      if (options.showPrize) {
        const prizeCol = columns.find((c) => c.key === 'prize');
        if (prizeCol) {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';

          if (prize && prize !== '—') {
            const pw = ctx.measureText(prize).width + 16;
            drawRoundedRect(
              ctx,
              prizeCol.headerX,
              rowY + (rowHeight - 22) / 2,
              pw,
              22,
              5,
              '#06291e',
              '#059669',
              1
            );
            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(prize, prizeCol.headerX + 8, rowY + rowHeight / 2);
          } else {
            ctx.fillStyle = '#475569';
            ctx.font = '12px monospace';
            ctx.fillText('—', prizeCol.headerX, rowY + rowHeight / 2);
          }
        }
      }

      // Total Points Column
      const pointsCol = columns.find((c) => c.key === 'points');
      if (pointsCol) {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        let ptsColor = '#ffffff';
        if (isTop1) ptsColor = '#fbbf24';
        else if (isTop2) ptsColor = '#e2e8f0';
        else if (isTop3) ptsColor = '#f59e0b';

        ctx.fillStyle = ptsColor;
        ctx.font = isTop1 ? '900 19px monospace' : 'bold 17px monospace';
        ctx.fillText(`${totalPoints}`, pointsCol.headerX, rowY + rowHeight / 2);

        // PTS label
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = isTop1 ? '#d97706' : '#64748b';
        ctx.fillText(' PTS', pointsCol.headerX + 24, rowY + rowHeight / 2);
      }

      rowY += rowHeight;
    });
  }

  // 8. FOOTER SECTION (Solid dark panel)
  const footerY = totalHeight - footerHeight - 12;
  drawRoundedRect(
    ctx,
    paddingX,
    footerY,
    contentWidth,
    footerHeight,
    10,
    '#0e121e',
    '#1e2538',
    1
  );

  ctx.textBaseline = 'middle';
  const footerMidY = footerY + footerHeight / 2;

  // Left: Verification & Branding
  ctx.textAlign = 'left';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('⚔️ RULES OF SURVIVAL • ROS COMMUNITY', paddingX + 20, footerMidY - 7);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.fillText('ROS COMMUNITY TOURNAMENT RECORDS • MATCH RESULTS CONFIRMED', paddingX + 20, footerMidY + 9);

  // Center: Scoring rule summary
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 11px monospace';
  ctx.fillText(
    `Rule: ${ptsPerKill} pts/kill • +${cdBonus} Chicken Dinner bonus • Ranked by Total Points`,
    width / 2,
    footerMidY
  );

  // Right: Generation timestamp & Portal branding
  ctx.textAlign = 'right';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('RULES OF SURVIVAL COMMUNITY', width - paddingX - 20, footerMidY - 7);

  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  ctx.fillText(`Exported: ${new Date().toLocaleString()}`, width - paddingX - 20, footerMidY + 9);
}
