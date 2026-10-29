import { BracketData, BracketMatch, Team, TournamentRound } from '../types';

/**
 * Creates a new Single Elimination bracket structure for 4, 8, or 16 teams
 */
export function generateSingleEliminationBracket(
  size: 4 | 8 | 16,
  participatingTeams: Team[],
  hasThirdPlace: boolean = true,
  bracketName: string = 'ROS Legacy Championship Bracket'
): BracketData {
  const roundNamesMap: Record<number, string[]> = {
    4: ['Semi-Finals', 'Grand Finals'],
    8: ['Quarter-Finals', 'Semi-Finals', 'Grand Finals'],
    16: ['Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Grand Finals'],
  };

  const roundNames = roundNamesMap[size];
  const numRounds = roundNames.length;
  const rounds: TournamentRound[] = [];

  // Seed participating teams into the first round
  const seededTeamIds = participatingTeams.map((t) => t.id);

  let currentRoundMatchCount = size / 2;

  for (let rIndex = 0; rIndex < numRounds; rIndex++) {
    const roundName = roundNames[rIndex];
    const matches: BracketMatch[] = [];

    for (let mIndex = 0; mIndex < currentRoundMatchCount; mIndex++) {
      const matchId = `m-r${rIndex}-m${mIndex}`;
      let t1: string | null = null;
      let t2: string | null = null;

      if (rIndex === 0) {
        // First round seeds
        t1 = seededTeamIds[mIndex * 2] || null;
        t2 = seededTeamIds[mIndex * 2 + 1] || null;
      }

      // Compute next match link if not finals
      let nextMatchId: string | undefined = undefined;
      let nextMatchSlot: 1 | 2 | undefined = undefined;

      if (rIndex < numRounds - 1) {
        const nextRoundIndex = rIndex + 1;
        const nextMatchIndex = Math.floor(mIndex / 2);
        nextMatchId = `m-r${nextRoundIndex}-m${nextMatchIndex}`;
        nextMatchSlot = (mIndex % 2 === 0 ? 1 : 2) as 1 | 2;
      }

      matches.push({
        id: matchId,
        roundIndex: rIndex,
        matchIndex: mIndex,
        roundName,
        team1Id: t1,
        team2Id: t2,
        score1: null,
        score2: null,
        winnerId: null,
        status: 'upcoming',
        nextMatchId,
        nextMatchSlot,
      });
    }

    rounds.push({ name: roundName, matches });
    currentRoundMatchCount = currentRoundMatchCount / 2;
  }

  // 3rd place match
  let thirdPlaceMatch: BracketMatch | undefined = undefined;
  if (hasThirdPlace) {
    thirdPlaceMatch = {
      id: 'm-third-place',
      roundIndex: numRounds - 1,
      matchIndex: 1,
      roundName: '3rd Place Decider',
      team1Id: null,
      team2Id: null,
      score1: null,
      score2: null,
      winnerId: null,
      status: 'upcoming',
      isThirdPlaceMatch: true,
    };
  }

  return {
    id: `bracket-${Date.now()}`,
    name: bracketName,
    size,
    hasThirdPlace,
    rounds,
    thirdPlaceMatch,
    updatedAt: Date.now(),
  };
}

/**
 * Updates a match result and automatically advances the winner to next round,
 * and if applicable, sends semi-final losers to the 3rd place match!
 */
export function updateBracketMatch(
  bracket: BracketData,
  matchId: string,
  updates: {
    score1: number | null;
    score2: number | null;
    winnerId: string | null;
    status: 'upcoming' | 'live' | 'completed';
    team1Id?: string | null;
    team2Id?: string | null;
  }
): BracketData {
  const newRounds = bracket.rounds.map((round) => ({
    ...round,
    matches: round.matches.map((m) => ({ ...m })),
  }));

  let newThirdPlace = bracket.thirdPlaceMatch ? { ...bracket.thirdPlaceMatch } : undefined;

  // Check if it's the 3rd place match being updated
  if (bracket.thirdPlaceMatch && matchId === bracket.thirdPlaceMatch.id) {
    newThirdPlace = {
      ...bracket.thirdPlaceMatch,
      ...updates,
      team1Id: updates.team1Id !== undefined ? updates.team1Id : bracket.thirdPlaceMatch.team1Id,
      team2Id: updates.team2Id !== undefined ? updates.team2Id : bracket.thirdPlaceMatch.team2Id,
    };

    return {
      ...bracket,
      rounds: newRounds,
      thirdPlaceMatch: newThirdPlace,
      updatedAt: Date.now(),
    };
  }

  // Find targeted match in regular rounds
  let foundMatch: BracketMatch | null = null;

  for (let r = 0; r < newRounds.length; r++) {
    for (let m = 0; m < newRounds[r].matches.length; m++) {
      if (newRounds[r].matches[m].id === matchId) {
        foundMatch = newRounds[r].matches[m];
        Object.assign(foundMatch, updates);
        break;
      }
    }
    if (foundMatch) break;
  }

  if (!foundMatch) return bracket;

  const winnerId = foundMatch.winnerId;

  // Auto-advance winner to the next round if linked
  if (foundMatch.nextMatchId && foundMatch.nextMatchSlot) {
    const nextMatchId = foundMatch.nextMatchId;
    const slot = foundMatch.nextMatchSlot;

    for (let r = 0; r < newRounds.length; r++) {
      for (let m = 0; m < newRounds[r].matches.length; m++) {
        if (newRounds[r].matches[m].id === nextMatchId) {
          const target = newRounds[r].matches[m];
          if (slot === 1) {
            target.team1Id = winnerId;
          } else {
            target.team2Id = winnerId;
          }
          // Reset child match status/scores if team changed or winner cleared
          if (!winnerId) {
            target.score1 = null;
            target.score2 = null;
            target.winnerId = null;
            target.status = 'upcoming';
          }
          break;
        }
      }
    }
  }

  // If this was a semi-final match and we have a 3rd place match, send loser to 3rd place match!
  const semiFinalRoundIndex = newRounds.length - 2;
  if (
    bracket.hasThirdPlace &&
    newThirdPlace &&
    foundMatch.roundIndex === semiFinalRoundIndex &&
    foundMatch.team1Id &&
    foundMatch.team2Id
  ) {
    const loserId =
      winnerId === foundMatch.team1Id
        ? foundMatch.team2Id
        : winnerId === foundMatch.team2Id
        ? foundMatch.team1Id
        : null;

    if (foundMatch.matchIndex === 0) {
      newThirdPlace.team1Id = loserId;
    } else if (foundMatch.matchIndex === 1) {
      newThirdPlace.team2Id = loserId;
    }
  }

  return {
    ...bracket,
    rounds: newRounds,
    thirdPlaceMatch: newThirdPlace,
    updatedAt: Date.now(),
  };
}

