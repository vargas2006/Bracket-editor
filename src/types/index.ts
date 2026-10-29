export interface Player {
  id: string;
  ign: string;
  isCaptain: boolean;
  role?: string; // 'Sniper' | 'Fragger' | 'Support' | 'Scout' | 'IGL'
}

export interface Team {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  points: number;
  prize?: string; // e.g. "₱1,000", "In-game rewards", or "" / "—"
  members: Player[];
  wins?: number;
  kills?: number;
  matchesPlayed?: number;
}

export interface LeaderboardEntry extends Team {
  placement: number;
  isTied: boolean;
  tiebreakerNote?: string;
}

export type RosterDisplayMode = 'hover' | 'expand';

export interface BracketMatch {
  id: string;
  roundIndex: number;
  matchIndex: number;
  roundName: string;
  team1Id: string | null;
  team2Id: string | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  status: 'upcoming' | 'live' | 'completed';
  nextMatchId?: string;
  nextMatchSlot?: 1 | 2;
  isThirdPlaceMatch?: boolean;
}

export interface TournamentRound {
  name: string;
  matches: BracketMatch[];
}

export interface BracketData {
  id: string;
  name: string;
  size: 4 | 8 | 16;
  hasThirdPlace: boolean;
  rounds: TournamentRound[];
  thirdPlaceMatch?: BracketMatch;
  updatedAt: number;
}

export interface TournamentScoringSettings {
  pointsPerKill: number; // default: 5
  chickenDinnerBonus: number; // default: 25
  totalGames: number; // default: 5
  placementPointsEnabled: boolean; // default: true
  placementPoints: Record<number, number>; // { 1: 0, 2: 20, 3: 15, 4: 10, ... }
}

export interface TournamentPrizeSettings {
  top1: string; // e.g. "₱500"
  top2: string; // e.g. "₱200"
  top3: string; // e.g. "₱100"
  top4?: string; // e.g. "₱50" or "—"
  autoApply: boolean; // default: true
}

export interface TournamentSettings {
  competitionName: string;
  seasonOrStage: string;
  pointsPerKill: number;
  pointsForChickenDinner: number;
  adminPin: string;
  scoring: TournamentScoringSettings;
  prizes?: TournamentPrizeSettings;
}

export interface GameResult {
  id: string; // e.g. `gr_${teamId}_game${gameNumber}`
  teamId: string;
  teamName: string;
  gameNumber: number;
  kills: number;
  placement?: number;
  chickenDinner: boolean;
  killPoints: number;
  placementPoints: number;
  chickenDinnerBonus: number;
  totalPoints: number;
  updatedAt: number;
}

export interface GameLeaderboardEntry {
  teamId: string;
  teamName: string;
  tag?: string;
  logo?: string;
  members: Player[];
  prize?: string;
  gameScores: Record<number, number>; // gameNumber -> totalPoints (0 if not recorded)
  gameResults: Record<number, GameResult | undefined>;
  totalPoints: number;
  totalKills: number;
  totalChickenDinners: number;
  rank: number;
  isTied: boolean;
  tiebreakerNote?: string;
}
