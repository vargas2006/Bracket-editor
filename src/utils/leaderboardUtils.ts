import { Team, LeaderboardEntry, GameLeaderboardEntry } from '../types';

/**
 * Computes standard competition ranking (1224 rule) based purely on points.
 * Secondary tiebreaker uses kills, then wins, then alphabetical order.
 * If points are identical, both teams receive the same placement number.
 */
export function computeLeaderboard(teams: Team[]): LeaderboardEntry[] {
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

  const result: LeaderboardEntry[] = [];
  let currentPlacement = 1;

  for (let i = 0; i < sorted.length; i++) {
    const currentTeam = sorted[i];

    if (i > 0 && currentTeam.points === sorted[i - 1].points) {
      const prevPlacement = result[i - 1].placement;
      result[i - 1].isTied = true;
      result.push({
        ...currentTeam,
        placement: prevPlacement,
        isTied: true,
        tiebreakerNote: currentTeam.kills !== undefined ? `${currentTeam.kills} Kills` : undefined,
      });
    } else {
      currentPlacement = i + 1;
      result.push({
        ...currentTeam,
        placement: currentPlacement,
        isTied: false,
      });
    }
  }

  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].points === result[i + 1].points) {
      result[i].isTied = true;
      result[i + 1].isTied = true;
    }
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
