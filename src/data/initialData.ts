import { Team, BracketData, TournamentSettings, GameResult } from '../types';
import { DEFAULT_SCORING_SETTINGS, calculateGamePoints } from '../utils/scoringUtils';
import { generateSingleEliminationBracket } from '../utils/bracketUtils';

export const INITIAL_SETTINGS: TournamentSettings = {
  competitionName: 'ROS LEGACY CHAMPIONS CUP 2026',
  seasonOrStage: 'GRAND FINALS STAGE',
  pointsPerKill: 5,
  pointsForChickenDinner: 25,
  adminPin: '1234',
  scoring: DEFAULT_SCORING_SETTINGS,
};

// Clean slate: Initially empty so user can enter their own data
export const INITIAL_TEAMS: Team[] = [];
export const INITIAL_GAME_RESULTS: GameResult[] = [];

// Sample data kept for optional demo restore
export const SAMPLE_TEAMS: Team[] = [
  {
    id: 'team-zenith',
    name: 'ZENITH ENTITY',
    tag: 'ZE',
    logo: '⚡',
    points: 135,
    prize: '₱1,000',
    wins: 2,
    kills: 15,
    matchesPlayed: 3,
    members: [
      { id: 'p1', ign: 'ZE_Viper', isCaptain: true, role: 'IGL / Sniper' },
      { id: 'p2', ign: 'ZE_Shadow', isCaptain: false, role: 'Assault / Rusher' },
      { id: 'p3', ign: 'ZE_Kuro', isCaptain: false, role: 'Fragger' },
      { id: 'p4', ign: 'ZE_Chronos', isCaptain: false, role: 'Support / Medic' },
    ],
  },
  {
    id: 'team-kinos',
    name: 'KINOS',
    tag: 'KNS',
    logo: '👑',
    points: 115,
    prize: 'In-game rewards',
    wins: 1,
    kills: 12,
    matchesPlayed: 3,
    members: [
      { id: 'p5', ign: 'Kinos_Ace', isCaptain: true, role: 'IGL' },
      { id: 'p6', ign: 'Kinos_Raven', isCaptain: false, role: 'Sniper' },
      { id: 'p7', ign: 'Kinos_Nova', isCaptain: false, role: 'Entry Fragger' },
      { id: 'p8', ign: 'Kinos_Zephyr', isCaptain: false, role: 'Flanker' },
    ],
  },
  {
    id: 'team-krex',
    name: 'KREX E X',
    tag: 'KREX',
    logo: '🔥',
    points: 110,
    prize: '—',
    wins: 1,
    kills: 11,
    matchesPlayed: 3,
    members: [
      { id: 'p9', ign: 'KREX_Roxas', isCaptain: true, role: 'Captain' },
      { id: 'p10', ign: 'KREX_Dante', isCaptain: false, role: 'Marksman' },
      { id: 'p11', ign: 'KREX_Venom', isCaptain: false, role: 'Rusher' },
      { id: 'p12', ign: 'KREX_Blaze', isCaptain: false, role: 'Recon' },
    ],
  },
  {
    id: 'team-blacklist',
    name: 'BLACKLIST LEGACY',
    tag: 'BLCK',
    logo: '💀',
    points: 95,
    prize: '—',
    wins: 0,
    kills: 9,
    matchesPlayed: 3,
    members: [
      { id: 'p13', ign: 'BLCK_Apex', isCaptain: true, role: 'IGL' },
      { id: 'p14', ign: 'BLCK_Hades', isCaptain: false, role: 'Assault' },
      { id: 'p15', ign: 'BLCK_Ghost', isCaptain: false, role: 'Sniper' },
      { id: 'p16', ign: 'BLCK_Specter', isCaptain: false, role: 'Support' },
    ],
  },
  {
    id: 'team-omega',
    name: 'OMEGA VANGUARD',
    tag: 'OMG',
    logo: '🛡️',
    points: 82,
    prize: '—',
    wins: 0,
    kills: 8,
    matchesPlayed: 3,
    members: [
      { id: 'p17', ign: 'OMG_Titan', isCaptain: true, role: 'Captain' },
      { id: 'p18', ign: 'OMG_Reaper', isCaptain: false, role: 'Fragger' },
      { id: 'p19', ign: 'OMG_Vortex', isCaptain: false, role: 'Scout' },
      { id: 'p20', ign: 'OMG_Frost', isCaptain: false, role: 'Support' },
    ],
  },
  {
    id: 'team-eclipse',
    name: 'ECLIPSE GAMING',
    tag: 'ECL',
    logo: '🌘',
    points: 70,
    prize: '—',
    wins: 0,
    kills: 7,
    matchesPlayed: 3,
    members: [
      { id: 'p21', ign: 'ECL_Lunar', isCaptain: true, role: 'IGL' },
      { id: 'p22', ign: 'ECL_Solar', isCaptain: false, role: 'Fragger' },
      { id: 'p23', ign: 'ECL_Nebula', isCaptain: false, role: 'Sniper' },
      { id: 'p24', ign: 'ECL_Cosmo', isCaptain: false, role: 'Rusher' },
    ],
  },
  {
    id: 'team-arctic',
    name: 'ARCTIC WOLVES',
    tag: 'ARC',
    logo: '🐺',
    points: 58,
    prize: '—',
    wins: 0,
    kills: 5,
    matchesPlayed: 3,
    members: [
      { id: 'p25', ign: 'ARC_Blizzard', isCaptain: true, role: 'Captain' },
      { id: 'p26', ign: 'ARC_Fang', isCaptain: false, role: 'Rusher' },
      { id: 'p27', ign: 'ARC_Glacier', isCaptain: false, role: 'Sniper' },
      { id: 'p28', ign: 'ARC_Prowler', isCaptain: false, role: 'Support' },
    ],
  },
  {
    id: 'team-phantom',
    name: 'PHANTOM SYNDICATE',
    tag: 'PHN',
    logo: '👻',
    points: 44,
    prize: '—',
    wins: 0,
    kills: 4,
    matchesPlayed: 3,
    members: [
      { id: 'p29', ign: 'PHN_Wraith', isCaptain: true, role: 'IGL' },
      { id: 'p30', ign: 'PHN_Mirage', isCaptain: false, role: 'Scout' },
      { id: 'p31', ign: 'PHN_Spook', isCaptain: false, role: 'Fragger' },
      { id: 'p32', ign: 'PHN_Phantom', isCaptain: false, role: 'Support' },
    ],
  },
];

function createGameResult(
  teamId: string,
  teamName: string,
  gameNumber: number,
  kills: number,
  placement: number,
  chickenDinner: boolean
): GameResult {
  const pts = calculateGamePoints(kills, placement, chickenDinner, DEFAULT_SCORING_SETTINGS);
  return {
    id: `gr_${teamId}_g${gameNumber}`,
    teamId,
    teamName,
    gameNumber,
    kills,
    placement,
    chickenDinner,
    killPoints: pts.killPoints,
    placementPoints: pts.placementPoints,
    chickenDinnerBonus: pts.chickenDinnerBonus,
    totalPoints: pts.totalPoints,
    updatedAt: Date.now(),
  };
}

export const SAMPLE_GAME_RESULTS: GameResult[] = [
  createGameResult('team-zenith', 'ZENITH ENTITY', 1, 8, 1, true),
  createGameResult('team-kinos', 'KINOS', 1, 3, 2, false),
  createGameResult('team-krex', 'KREX E X', 1, 4, 3, false),
  createGameResult('team-blacklist', 'BLACKLIST LEGACY', 1, 4, 4, false),
  createGameResult('team-omega', 'OMEGA VANGUARD', 1, 3, 5, false),
  createGameResult('team-eclipse', 'ECLIPSE GAMING', 1, 2, 6, false),
  createGameResult('team-arctic', 'ARCTIC WOLVES', 1, 1, 7, false),
  createGameResult('team-phantom', 'PHANTOM SYNDICATE', 1, 0, 8, false),

  createGameResult('team-zenith', 'ZENITH ENTITY', 2, 4, 2, false),
  createGameResult('team-kinos', 'KINOS', 2, 7, 1, true),
  createGameResult('team-krex', 'KREX E X', 2, 3, 4, false),
  createGameResult('team-blacklist', 'BLACKLIST LEGACY', 2, 3, 3, false),
  createGameResult('team-omega', 'OMEGA VANGUARD', 2, 4, 5, false),
  createGameResult('team-eclipse', 'ECLIPSE GAMING', 2, 3, 6, false),
  createGameResult('team-arctic', 'ARCTIC WOLVES', 2, 2, 7, false),
  createGameResult('team-phantom', 'PHANTOM SYNDICATE', 2, 2, 8, false),

  createGameResult('team-zenith', 'ZENITH ENTITY', 3, 3, 3, false),
  createGameResult('team-kinos', 'KINOS', 3, 2, 4, false),
  createGameResult('team-krex', 'KREX E X', 3, 5, 1, true),
  createGameResult('team-blacklist', 'BLACKLIST LEGACY', 3, 4, 2, false),
  createGameResult('team-omega', 'OMEGA VANGUARD', 3, 3, 6, false),
  createGameResult('team-eclipse', 'ECLIPSE GAMING', 3, 2, 5, false),
  createGameResult('team-arctic', 'ARCTIC WOLVES', 3, 2, 8, false),
  createGameResult('team-phantom', 'PHANTOM SYNDICATE', 3, 2, 7, false),
];

export function generateInitialBracket(teams: Team[]): BracketData {
  if (!teams || teams.length === 0) {
    return generateSingleEliminationBracket(8, [], true, 'ROS Legacy Championship - Bracket');
  }

  const t = teams.map((team) => team.id);
  const qfMatches = [
    {
      id: 'm-qf-1',
      roundIndex: 0,
      matchIndex: 0,
      roundName: 'Quarter-Finals',
      team1Id: t[0] || null,
      team2Id: t[7] || null,
      score1: 2,
      score2: 0,
      winnerId: t[0] || null,
      status: 'completed' as const,
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 1 as const,
    },
    {
      id: 'm-qf-2',
      roundIndex: 0,
      matchIndex: 1,
      roundName: 'Quarter-Finals',
      team1Id: t[3] || null,
      team2Id: t[4] || null,
      score1: 2,
      score2: 1,
      winnerId: t[3] || null,
      status: 'completed' as const,
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 2 as const,
    },
    {
      id: 'm-qf-3',
      roundIndex: 0,
      matchIndex: 2,
      roundName: 'Quarter-Finals',
      team1Id: t[1] || null,
      team2Id: t[6] || null,
      score1: 2,
      score2: 0,
      winnerId: t[1] || null,
      status: 'completed' as const,
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 1 as const,
    },
    {
      id: 'm-qf-4',
      roundIndex: 0,
      matchIndex: 3,
      roundName: 'Quarter-Finals',
      team1Id: t[2] || null,
      team2Id: t[5] || null,
      score1: 2,
      score2: 1,
      winnerId: t[2] || null,
      status: 'completed' as const,
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 2 as const,
    },
  ];

  const sfMatches = [
    {
      id: 'm-sf-1',
      roundIndex: 1,
      matchIndex: 0,
      roundName: 'Semi-Finals',
      team1Id: t[0] || null,
      team2Id: t[3] || null,
      score1: 2,
      score2: 1,
      winnerId: t[0] || null,
      status: 'completed' as const,
      nextMatchId: 'm-fn-1',
      nextMatchSlot: 1 as const,
    },
    {
      id: 'm-sf-2',
      roundIndex: 1,
      matchIndex: 1,
      roundName: 'Semi-Finals',
      team1Id: t[1] || null,
      team2Id: t[2] || null,
      score1: 2,
      score2: 0,
      winnerId: t[1] || null,
      status: 'completed' as const,
      nextMatchId: 'm-fn-1',
      nextMatchSlot: 2 as const,
    },
  ];

  const fnMatches = [
    {
      id: 'm-fn-1',
      roundIndex: 2,
      matchIndex: 0,
      roundName: 'Grand Finals',
      team1Id: t[0] || null,
      team2Id: t[1] || null,
      score1: null,
      score2: null,
      winnerId: null,
      status: 'live' as const,
    },
  ];

  const thirdPlaceMatch = {
    id: 'm-tp-1',
    roundIndex: 2,
    matchIndex: 1,
    roundName: '3rd Place Decider',
    team1Id: t[3] || null,
    team2Id: t[2] || null,
    score1: 1,
    score2: 2,
    winnerId: t[2] || null,
    status: 'completed' as const,
    isThirdPlaceMatch: true,
  };

  return {
    id: 'bracket-main',
    name: 'ROS Legacy Champions Cup 2026 - Main Bracket',
    size: 8,
    hasThirdPlace: true,
    rounds: [
      { name: 'Quarter-Finals', matches: qfMatches },
      { name: 'Semi-Finals', matches: sfMatches },
      { name: 'Grand Finals', matches: fnMatches },
    ],
    thirdPlaceMatch,
    updatedAt: Date.now(),
  };
}
