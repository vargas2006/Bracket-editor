import { Team, LeaderboardEntry, GameLeaderboardEntry, TournamentPrizeSettings } from '../types';

/**
 * Computes standard competition ranking (1224 rule) based purely on points.
 * Secondary tiebreaker uses kills, then wins, then alphabetical order.
 * If teams have 0 points, they are sequentially ranked (never tie all at 1st).
 * Only teams with points > 0 can tie if their points, kills, and wins are all equal.
 * Prizes are strictly sticky to the 3 highest points teams with points > 0.
 */
export function computeLeaderboard(
  teams: Team[],
  prizeSettings?: TournamentPrizeSettings
): LeaderboardEntry[] {
  const sorted = [...teams].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    const killsDiff = (b.kills ?? 0) - (a.kills ?? 0);
    if (killsDiff !== 0) return killsDiff;

    const winsDiff = (b.wins ?? 0) - (a.wins ?? 0);
    if (winsDiff !== 0) return winsDiff;

    return a.name.localeCompare(b.name);
  });

  const activePrizes = prizeSettings || {
    top1: '₱500',
    top2: '₱200',
    top3: '₱100',
    autoApply: true,
  };

  const result: LeaderboardEntry[] = [];
  let currentPlacement = 1;

  for (let i = 0; i < sorted.length; i++) {
    const currentTeam = sorted[i];
    const prevTeam = sorted[i - 1];

    const isTiedWithPrev =
      i > 0 &&
      currentTeam.points > 0 &&
      currentTeam.points === prevTeam.points &&
      (currentTeam.kills ?? 0) === (prevTeam.kills ?? 0) &&
      (currentTeam.wins ?? 0) === (prevTeam.wins ?? 0);

    let placement = i + 1;
    let isTied = false;

    if (isTiedWithPrev) {
      placement = result[i - 1].placement;
      isTied = true;
      result[i - 1].isTied = true;
    } else {
      currentPlacement = i + 1;
      placement = currentPlacement;
    }

    // Dynamic sticky prize:
    // Stays pinned to ranks 1 to 4, displayed immediately even with 0 points
    let prize = '—';
    if (placement === 1 && activePrizes.top1) prize = activePrizes.top1;
    else if (placement === 2 && activePrizes.top2) prize = activePrizes.top2;
    else if (placement === 3 && activePrizes.top3) prize = activePrizes.top3;
    else if (placement === 4 && activePrizes.top4 && activePrizes.top4 !== '—') prize = activePrizes.top4;
    else prize = '—';

    result.push({
      ...currentTeam,
      placement,
      isTied,
      prize,
      tiebreakerNote: isTied && currentTeam.kills !== undefined ? `${currentTeam.kills} Kills` : undefined,
    });
  }

  return result;
}

export function formatOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Formats prize string or returns fallback dash
 */
export function formatPrize(prize?: string): string {
  if (!prize || prize.trim() === '' || prize.trim() === '-') {
    return '—';
  }
  return prize;
}

/**
 * Generates and downloads a CSV of the leaderboard with Game 1, Game 2, etc. columns
 */
export function exportToCSV(
  entries: LeaderboardEntry[],
  competitionName: string,
  gameEntries?: GameLeaderboardEntry[],
  totalGames: number = 5
) {
  let headers: string[] = [];
  let rows: string[] = [];

  if (gameEntries && gameEntries.length > 0) {
    const gameCols = Array.from({ length: totalGames }, (_, i) => `Game ${i + 1}`);
    headers = ['Rank', 'Team Name', 'Tag', ...gameCols, 'Total Points', 'Total Kills', 'Chicken Dinners', 'Prize', 'Players'];

    rows = gameEntries.map((e) => {
      const gameScores = Array.from({ length: totalGames }, (_, i) => e.gameScores[i + 1] ?? 0);
      const playerList = e.members.map((m) => m.ign + (m.isCaptain ? ' (C)' : '')).join('; ');
      const prize = formatPrize(e.prize);

      return [
        `"${formatOrdinal(e.rank)}${e.isTied ? ' (Tied)' : ''}"`,
        `"${e.teamName.replace(/"/g, '""')}"`,
        `"${e.tag || ''}"`,
        ...gameScores,
        e.totalPoints,
        e.totalKills,
        e.totalChickenDinners,
        `"${prize.replace(/"/g, '""')}"`,
        `"${playerList.replace(/"/g, '""')}"`,
      ].join(',');
    });
  } else {
    headers = ['Placement', 'Team Name', 'Tag', 'Points', 'Prize', 'Wins', 'Kills', 'Captain', 'Players'];
    rows = entries.map((e) => {
      const captain = e.members.find((m) => m.isCaptain)?.ign || 'N/A';
      const playerList = e.members.map((m) => m.ign + (m.isCaptain ? ' (C)' : '')).join('; ');
      const prize = formatPrize(e.prize);

      return [
        `"${formatOrdinal(e.placement)}${e.isTied ? ' (Tied)' : ''}"`,
        `"${e.name.replace(/"/g, '""')}"`,
        `"${e.tag || ''}"`,
        e.points,
        `"${prize.replace(/"/g, '""')}"`,
        e.wins ?? 0,
        e.kills ?? 0,
        `"${captain.replace(/"/g, '""')}"`,
        `"${playerList.replace(/"/g, '""')}"`,
      ].join(',');
    });
  }

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = competitionName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `${safeName}_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
