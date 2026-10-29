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

export interface TournamentSettings {
  competitionName: string;
  seasonOrStage: string;
  pointsPerKill: number;
  pointsForChickenDinner: number;
  adminPin: string;
}

