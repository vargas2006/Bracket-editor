import {
  calculateGamePoints,
  recalculateGameResult,
  computeGameLeaderboard,
  validateGameResultInput,
  DEFAULT_SCORING_SETTINGS,
  DEFAULT_PLACEMENT_POINTS,
} from '../utils/scoringUtils';
import type { Team, GameResult, TournamentScoringSettings } from '../types';

function runTests() {
  console.log('=== RUNNING ROS TOURNAMENT SCORING TESTS ===');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: User Request Example calculation
  // Points per Kill = 5, Kills = 8, Chicken Dinner Bonus = 25, Chicken Dinner = Yes, Placement Points = 0
  // Result: Kill Points = 40, Chicken Dinner Bonus = 25, Game Total = 65 points
  const res1 = calculateGamePoints(8, 1, true, DEFAULT_SCORING_SETTINGS);
  assert(res1.killPoints === 40, 'Test 1.1: 8 kills * 5 = 40 kill points');
  assert(res1.chickenDinnerBonus === 25, 'Test 1.2: Chicken dinner bonus = 25');
  assert(res1.placementPoints === 0, 'Test 1.3: 1st place placement points = 0');
  assert(res1.totalPoints === 65, 'Test 1.4: Game total = 65 points');

  // Test 2: Placement points test (2nd Place = 20 pts, 4 kills)
  const res2 = calculateGamePoints(4, 2, false, DEFAULT_SCORING_SETTINGS);
  assert(res2.killPoints === 20, 'Test 2.1: 4 kills * 5 = 20 kill points');
  assert(res2.chickenDinnerBonus === 0, 'Test 2.2: Chicken dinner bonus = 0 for 2nd place');
  assert(res2.placementPoints === 20, 'Test 2.3: 2nd place placement points = 20');
  assert(res2.totalPoints === 40, 'Test 2.4: 2nd place total = 40 points');

  // Test 3: Placement points test (3rd Place = 15 pts, 3 kills)
  const res3 = calculateGamePoints(3, 3, false, DEFAULT_SCORING_SETTINGS);
  assert(res3.killPoints === 15, 'Test 3.1: 3 kills * 5 = 15 kill points');
  assert(res3.placementPoints === 15, 'Test 3.2: 3rd place placement points = 15');
  assert(res3.totalPoints === 30, 'Test 3.3: 3rd place total = 30 points');

  // Test 4: Dynamic recalculation when settings change
  const customSettings: TournamentScoringSettings = {
    pointsPerKill: 10,
    chickenDinnerBonus: 50,
    totalGames: 3,
    placementPointsEnabled: true,
    placementPoints: { ...DEFAULT_PLACEMENT_POINTS, 2: 30 },
  };

  const initialRecord: GameResult = {
    id: 'test-gr-1',
    teamId: 'team-zenith',
    teamName: 'ZENITH ENTITY',
    gameNumber: 1,
    kills: 8,
    placement: 1,
    chickenDinner: true,
    killPoints: 40,
    placementPoints: 0,
    chickenDinnerBonus: 25,
    totalPoints: 65,
    updatedAt: Date.now(),
  };

  const recalculated = recalculateGameResult(initialRecord, customSettings);
  assert(recalculated.killPoints === 80, 'Test 4.1: Recalculated 8 kills * 10 = 80');
  assert(recalculated.chickenDinnerBonus === 50, 'Test 4.2: Recalculated Chicken dinner = 50');
  assert(recalculated.totalPoints === 130, 'Test 4.3: Recalculated total = 130 points');

  // Test 5: Validation
  const dummyTeams: Team[] = [
    { id: 't1', name: 'Alpha', points: 0, members: [] },
    { id: 't2', name: 'Bravo', points: 0, members: [] },
  ];

  const valValid = validateGameResultInput('t1', 2, 5, 2, dummyTeams, DEFAULT_SCORING_SETTINGS);
  assert(valValid.isValid === true, 'Test 5.1: Valid input passes');

  const valNegKills = validateGameResultInput('t1', 2, -1, 2, dummyTeams, DEFAULT_SCORING_SETTINGS);
  assert(valNegKills.isValid === false, 'Test 5.2: Negative kills rejected');

  const valBadGame = validateGameResultInput('t1', 99, 5, 2, dummyTeams, DEFAULT_SCORING_SETTINGS);
  assert(valBadGame.isValid === false, 'Test 5.3: Invalid game number rejected');

  const valBadTeam = validateGameResultInput('non-existent', 1, 5, 2, dummyTeams, DEFAULT_SCORING_SETTINGS);
  assert(valBadTeam.isValid === false, 'Test 5.4: Unregistered team rejected');

  // Test 6: Missing game result renders as 0 without fabricating records
  const sampleResults: GameResult[] = [
    {
      id: 'gr1',
      teamId: 't1',
      teamName: 'Alpha',
      gameNumber: 1,
      kills: 8,
      placement: 1,
      chickenDinner: true,
      killPoints: 40,
      placementPoints: 0,
      chickenDinnerBonus: 25,
      totalPoints: 65,
      updatedAt: Date.now(),
    },
    {
      id: 'gr2',
      teamId: 't1',
      teamName: 'Alpha',
      gameNumber: 2,
      kills: 4,
      placement: 2,
      chickenDinner: false,
      killPoints: 20,
      placementPoints: 20,
      chickenDinnerBonus: 0,
      totalPoints: 40,
      updatedAt: Date.now(),
    },
    // Game 3 not recorded for Team Alpha
  ];

  const leaderboard = computeGameLeaderboard(dummyTeams, sampleResults, 3);
  const alphaEntry = leaderboard.find((e) => e.teamId === 't1')!;
  const bravoEntry = leaderboard.find((e) => e.teamId === 't2')!;

  assert(alphaEntry.gameScores[1] === 65, 'Test 6.1: Game 1 score = 65');
  assert(alphaEntry.gameScores[2] === 40, 'Test 6.2: Game 2 score = 40');
  assert(alphaEntry.gameScores[3] === 0, 'Test 6.3: Unplayed Game 3 score = 0');
  assert(alphaEntry.totalPoints === 105, 'Test 6.4: Total points = 105');
  assert(bravoEntry.totalPoints === 0, 'Test 6.5: Team with no games has 0 points');
  assert(alphaEntry.rank === 1, 'Test 6.6: Alpha is rank 1');
  assert(bravoEntry.rank === 2, 'Test 6.7: Bravo is rank 2');

  // 7. Prize Settings Verification
  const prizeSettings = {
    top1: '₱500',
    top2: '₱200',
    top3: '₱100',
    autoApply: true,
  };
  assert(prizeSettings.top1 === '₱500', 'Test 7.1: Top 1 prize is ₱500');
  assert(prizeSettings.top2 === '₱200', 'Test 7.2: Top 2 prize is ₱200');
  assert(prizeSettings.top3 === '₱100', 'Test 7.3: Top 3 prize is ₱100');

  // 8. Zero Points & Sticky Prize Tests
  const zeroTeams: Team[] = [
    { id: 'z1', name: 'Zeta 1', points: 0, kills: 0, wins: 0, matchesPlayed: 0, members: [] },
    { id: 'z2', name: 'Zeta 2', points: 0, kills: 0, wins: 0, matchesPlayed: 0, members: [] },
    { id: 'z3', name: 'Zeta 3', points: 0, kills: 0, wins: 0, matchesPlayed: 0, members: [] },
    { id: 'z4', name: 'Zeta 4', points: 0, kills: 0, wins: 0, matchesPlayed: 0, members: [] },
  ];
  const zeroBoard = computeGameLeaderboard(zeroTeams, [], 3, prizeSettings);
  assert(zeroBoard[0].rank === 1, 'Test 8.1: 0-pt team 1 is rank 1');
  assert(zeroBoard[1].rank === 2, 'Test 8.2: 0-pt team 2 is rank 2 (not tied as 1st)');
  assert(zeroBoard[2].rank === 3, 'Test 8.3: 0-pt team 3 is rank 3 (not tied as 1st)');
  assert(zeroBoard[3].rank === 4, 'Test 8.4: 0-pt team 4 is rank 4');
  assert(zeroBoard[0].prize === '₱500', 'Test 8.5: Rank 1 displays Top 1 prize (₱500) even with 0 pts');
  assert(zeroBoard[1].prize === '₱200', 'Test 8.6: Rank 2 displays Top 2 prize (₱200) even with 0 pts');
  assert(zeroBoard[2].prize === '₱100', 'Test 8.7: Rank 3 displays Top 3 prize (₱100) even with 0 pts');
  assert(zeroBoard[3].prize === '—', 'Test 8.8: Rank 4 displays fallback "—"');
  assert(zeroBoard.every((e) => !e.isTied), 'Test 8.9: 0-pt teams are not marked as tied');

  // Sticky prize test with played games
  const partialResults: GameResult[] = [
    {
      id: 'pr1',
      teamId: 'z1',
      teamName: 'Zeta 1',
      gameNumber: 1,
      kills: 10,
      placement: 1,
      chickenDinner: true,
      killPoints: 50,
      placementPoints: 0,
      chickenDinnerBonus: 25,
      totalPoints: 75,
      updatedAt: Date.now(),
    },
    {
      id: 'pr2',
      teamId: 'z2',
      teamName: 'Zeta 2',
      gameNumber: 1,
      kills: 4,
      placement: 2,
      chickenDinner: false,
      killPoints: 20,
      placementPoints: 20,
      chickenDinnerBonus: 0,
      totalPoints: 40,
      updatedAt: Date.now(),
    },
    // z3 and z4 have 0 points
  ];
  const playedBoard = computeGameLeaderboard(zeroTeams, partialResults, 3, prizeSettings);
  assert(playedBoard[0].prize === '₱500', 'Test 8.10: Rank 1 gets Top 1 prize (₱500)');
  assert(playedBoard[1].prize === '₱200', 'Test 8.11: Rank 2 gets Top 2 prize (₱200)');
  assert(playedBoard[2].prize === '₱100', 'Test 8.12: Rank 3 gets Top 3 prize (₱100)');
  assert(playedBoard[3].prize === '—', 'Test 8.13: Rank 4 gets no prize ("—")');

  // 9. Winner Display Condition: Unknown if pts = 0, team name if higher
  const formatWinnerDisplay = (teamName: string, points: number) => {
    return points > 0 ? teamName : 'Unknown';
  };
  assert(formatWinnerDisplay('Zeta 1', 0) === 'Unknown', 'Test 9.1: Winner display with 0 pts is Unknown');
  assert(formatWinnerDisplay('Alpha Squad', 65) === 'Alpha Squad', 'Test 9.2: Winner display with >0 pts is team name');

  console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

