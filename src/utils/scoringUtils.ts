import { GameResult, TournamentScoringSettings, TournamentPrizeSettings, Team, GameLeaderboardEntry } from '../types';

export const DEFAULT_PLACEMENT_POINTS: Record<number, number> = {
  1: 0, // Usually covered by Chicken Dinner bonus, or configurable
  2: 20,
  3: 15,
  4: 10,
  5: 7,
  6: 5,
  7: 3,
  8: 1,
};

export const DEFAULT_SCORING_SETTINGS: TournamentScoringSettings = {
  pointsPerKill: 5,
  chickenDinnerBonus: 25,
  totalGames: 5,
  placementPointsEnabled: true,
  placementPoints: DEFAULT_PLACEMENT_POINTS,
};

/**
 * Calculates the exact points breakdown for a single game
 */
export function calculateGamePoints(
  kills: number,
  placement: number | undefined,
  chickenDinner: boolean,
  settings: TournamentScoringSettings
): {
  killPoints: number;
  placementPoints: number;
  chickenDinnerBonus: number;
  totalPoints: number;
} {
  const safeKills = Math.max(0, Math.floor(kills || 0));
  const killPoints = safeKills * settings.pointsPerKill;
  const chickenDinnerBonus = chickenDinner ? settings.chickenDinnerBonus : 0;

  let placementPoints = 0;
  if (settings.placementPointsEnabled && placement && placement > 0) {
    placementPoints = settings.placementPoints[placement] ?? 0;
  }

  const totalPoints = killPoints + chickenDinnerBonus + placementPoints;

  return {
    killPoints,
    placementPoints,
    chickenDinnerBonus,
    totalPoints,
  };
}

/**
 * Recalculates an existing GameResult using updated scoring settings
 */
export function recalculateGameResult(
  result: GameResult,
  settings: TournamentScoringSettings
): GameResult {
  const { killPoints, placementPoints, chickenDinnerBonus, totalPoints } = calculateGamePoints(
    result.kills,
    result.placement,
    result.chickenDinner,
    settings
  );

  return {
    ...result,
    killPoints,
    placementPoints,
    chickenDinnerBonus,
    totalPoints,
    updatedAt: Date.now(),
  };
}

/**
 * Validates result input data
 */
export function validateGameResultInput(
  teamId: string,
  gameNumber: number,
  kills: number,
  placement: number | undefined,
  teams: Team[],
  settings: TournamentScoringSettings
): { isValid: boolean; error?: string } {
  if (!teamId || !teams.some((t) => t.id === teamId)) {
    return { isValid: false, error: 'A valid participating team must be selected.' };
  }

  if (!Number.isInteger(gameNumber) || gameNumber < 1 || gameNumber > settings.totalGames) {
    return {
      isValid: false,
      error: `Game number must be between 1 and ${settings.totalGames}.`,
    };
  }

  if (isNaN(kills) || !Number.isInteger(kills) || kills < 0) {
    return { isValid: false, error: 'Kills must be a non-negative integer (0 or greater).' };
  }

  if (placement !== undefined && placement !== null) {
    if (isNaN(placement) || !Number.isInteger(placement) || placement < 1) {
      return { isValid: false, error: 'Final placement must be a positive integer (1st, 2nd, etc.).' };
    }
  }

  return { isValid: true };
}

/**
 * Computes game-by-game tournament matrix leaderboard
 * Follows the tiebreaker rule: Total Points descending -> Total Kills -> Total Chicken Dinners
 */
export function computeGameLeaderboard(
  teams: Team[],
  results: GameResult[],
  totalGames: number,
  prizeSettings?: TournamentPrizeSettings
): GameLeaderboardEntry[] {
  // Map of teamId + gameNumber -> GameResult
  const resultMap = new Map<string, GameResult>();
  results.forEach((r) => {
    resultMap.set(`${r.teamId}_g${r.gameNumber}`, r);
  });

  const entries: GameLeaderboardEntry[] = teams.map((team) => {
    const gameScores: Record<number, number> = {};
    const gameResults: Record<number, GameResult | undefined> = {};
    let totalPoints = 0;
    let totalKills = 0;
    let totalChickenDinners = 0;

    for (let g = 1; g <= totalGames; g++) {
      const res = resultMap.get(`${team.id}_g${g}`);
      gameResults[g] = res;
      if (res) {
        gameScores[g] = res.totalPoints;
        totalPoints += res.totalPoints;
        totalKills += res.kills;
        if (res.chickenDinner) {
          totalChickenDinners += 1;
        }
      } else {
        // Missing result: display 0 points without fabricating a record
        gameScores[g] = 0;
      }
    }

    return {
      teamId: team.id,
      teamName: team.name,
      tag: team.tag,
      logo: team.logo,
      members: team.members,
      prize: '—',
      gameScores,
      gameResults,
      totalPoints,
      totalKills,
      totalChickenDinners,
      rank: 1,
      isTied: false,
    };
  });

  // Sort descending: totalPoints -> totalKills -> totalChickenDinners -> teamName
  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.totalKills !== a.totalKills) {
      return b.totalKills - a.totalKills;
    }
    if (b.totalChickenDinners !== a.totalChickenDinners) {
      return b.totalChickenDinners - a.totalChickenDinners;
    }
    return a.teamName.localeCompare(b.teamName);
  });

  // Rank with standard competition ranking:
  // If teams have 0 points, assign sequential ranks 1, 2, 3... (never tie everyone at 1st).
  // Only teams with points > 0 can tie when all metrics are identical.
  let currentRank = 1;
  for (let i = 0; i < entries.length; i++) {
    const curr = entries[i];
    if (i > 0) {
      const prev = entries[i - 1];
      const isIdentical =
        curr.totalPoints > 0 &&
        curr.totalPoints === prev.totalPoints &&
        curr.totalKills === prev.totalKills &&
        curr.totalChickenDinners === prev.totalChickenDinners;

      if (isIdentical) {
        curr.rank = prev.rank;
        curr.isTied = true;
        prev.isTied = true;
        curr.tiebreakerNote = `${curr.totalKills}K / ${curr.totalChickenDinners}CD`;
        prev.tiebreakerNote = `${prev.totalKills}K / ${prev.totalChickenDinners}CD`;
      } else {
        currentRank = i + 1;
        curr.rank = currentRank;
      }
    } else {
      curr.rank = 1;
    }
  }

  // Dynamic sticky prizes:
  // Prizes stay locked to top ranks (1 to 4) and are displayed immediately even if 0 points
  const activePrizes = prizeSettings || {
    top1: '₱500',
    top2: '₱200',
    top3: '₱100',
    top4: '—',
    autoApply: true,
  };

  entries.forEach((entry) => {
    if (entry.rank === 1 && activePrizes.top1) {
      entry.prize = activePrizes.top1;
    } else if (entry.rank === 2 && activePrizes.top2) {
      entry.prize = activePrizes.top2;
    } else if (entry.rank === 3 && activePrizes.top3) {
      entry.prize = activePrizes.top3;
    } else if (entry.rank === 4 && activePrizes.top4 && activePrizes.top4 !== '—') {
      entry.prize = activePrizes.top4;
    } else {
      entry.prize = '—';
    }
  });

  return entries;
}

