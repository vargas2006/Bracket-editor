import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Team,
  LeaderboardEntry,
  BracketData,
  TournamentSettings,
  TournamentScoringSettings,
  TournamentPrizeSettings,
  RosterDisplayMode,
  GameResult,
  GameLeaderboardEntry,
} from '../types';
import {
  INITIAL_TEAMS,
  INITIAL_SETTINGS,
  INITIAL_GAME_RESULTS,
  DEFAULT_PRIZE_SETTINGS,
  SAMPLE_TEAMS,
  SAMPLE_GAME_RESULTS,
  generateInitialBracket,
} from '../data/initialData';
import { computeLeaderboard } from '../utils/leaderboardUtils';
import { generateSingleEliminationBracket, updateBracketMatch as updateMatchHelper } from '../utils/bracketUtils';
import {
  calculateGamePoints,
  recalculateGameResult,
  computeGameLeaderboard,
  validateGameResultInput,
  DEFAULT_SCORING_SETTINGS,
} from '../utils/scoringUtils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotification {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

interface TournamentContextType {
  teams: Team[];
  leaderboard: LeaderboardEntry[];
  gameResults: GameResult[];
  gameLeaderboard: GameLeaderboardEntry[];
  bracket: BracketData;
  settings: TournamentSettings;
  isAdmin: boolean;
  rosterDisplayMode: RosterDisplayMode;
  searchQuery: string;
  toast: ToastNotification | null;
  toastMessage: string | null;
  hideToast: () => void;
  setSearchQuery: (q: string) => void;
  setRosterDisplayMode: (mode: RosterDisplayMode) => void;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  quickAdjustPoints: (id: string, delta: number) => void;
  resetLeaderboardPoints: () => void;
  clearAllData: () => void;
  resetToDefaultData: () => void;
  updateBracketMatch: (
    matchId: string,
    updates: {
      score1: number | null;
      score2: number | null;
      winnerId: string | null;
      status: 'upcoming' | 'live' | 'completed';
      team1Id?: string | null;
      team2Id?: string | null;
    }
  ) => void;
  regenerateBracket: (size: 4 | 8 | 16, selectedTeamIds: string[], hasThirdPlace: boolean) => void;
  updateSettings: (updates: Partial<TournamentSettings>) => void;
  updateScoringSettings: (updates: Partial<TournamentScoringSettings>) => void;
  updatePrizeSettings: (updates: Partial<TournamentPrizeSettings>) => void;
  applyPlacementPrizes: (customPrizes?: Partial<TournamentPrizeSettings>) => void;
  saveGameResult: (
    teamId: string,
    gameNumber: number,
    kills: number,
    placement: number | undefined,
    chickenDinner: boolean
  ) => { success: boolean; error?: string };
  deleteGameResult: (resultId: string) => boolean;
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const STORAGE_KEYS = {
  TEAMS: 'ros_legacy_teams_v2',
  BRACKET: 'ros_legacy_bracket_v2',
  SETTINGS: 'ros_legacy_settings_v2',
  GAME_RESULTS: 'ros_legacy_game_results_v2',
  ROSTER_MODE: 'ros_legacy_roster_mode_v2',
  IS_ADMIN: 'ros_legacy_is_admin_v2',
};

// Cleanup old v1 demo caches
try {
  localStorage.removeItem('ros_legacy_teams_v1');
  localStorage.removeItem('ros_legacy_game_results_v1');
  localStorage.removeItem('ros_legacy_bracket_v1');
  localStorage.removeItem('ros_legacy_settings_v1');
} catch (e) {
  // ignore
}

const TournamentContext = createContext<TournamentContextType | null>(null);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings
  const [settings, setSettings] = useState<TournamentSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.scoring) {
          parsed.scoring = DEFAULT_SCORING_SETTINGS;
        }
        if (!parsed.prizes) {
          parsed.prizes = DEFAULT_PRIZE_SETTINGS;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved settings', e);
    }
    return INITIAL_SETTINGS;
  });

  // Game results: starts empty
  const [gameResults, setGameResults] = useState<GameResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_RESULTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved game results', e);
    }
    return INITIAL_GAME_RESULTS;
  });

  // Teams: starts empty
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved teams', e);
    }
    return INITIAL_TEAMS;
  });

  // Bracket: starts empty
  const [bracket, setBracket] = useState<BracketData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRACKET);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved bracket', e);
    }
    return generateInitialBracket([]);
  });

  // Roster display mode: default 'hover'
  const [rosterDisplayMode, setRosterDisplayModeState] = useState<RosterDisplayMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROSTER_MODE);
      if (saved === 'hover' || saved === 'expand') return saved;
    } catch {
      // ignore
    }
    return 'hover';
  });

  // Admin status: default true for easy access
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return true;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hideToast = () => {
    setToast(null);
    setToastMessage(null);
  };

  const showToast = (message: string, explicitType?: ToastType, explicitTitle?: string) => {
    let resolvedType: ToastType = explicitType || 'info';
    let resolvedTitle = explicitTitle;

    if (!explicitType) {
      const lower = message.toLowerCase();
      if (
        lower.includes('saved') ||
        lower.includes('added') ||
        lower.includes('unlocked') ||
        lower.includes('restored') ||
        lower.includes('updated') ||
        lower.includes('generated') ||
        lower.includes('assigned') ||
        lower.includes('exported') ||
        lower.includes('success') ||
        lower.includes('cleared') ||
        lower.includes('deleted') ||
        lower.includes('removed') ||
        lower.includes('allocated') ||
        lower.includes('complete')
      ) {
        resolvedType = 'success';
        if (!resolvedTitle) resolvedTitle = 'Action Successful';
      } else if (
        lower.includes('restricted') ||
        lower.includes('error') ||
        lower.includes('invalid') ||
        lower.includes('required') ||
        lower.includes('failed') ||
        lower.includes('fail') ||
        lower.includes('incorrect')
      ) {
        resolvedType = 'error';
        if (!resolvedTitle) resolvedTitle = 'Attention Required';
      } else {
        resolvedType = 'info';
        if (!resolvedTitle) resolvedTitle = 'Notice';
      }
    } else if (!resolvedTitle) {
      resolvedTitle = resolvedType === 'success' ? 'Saved' : resolvedType === 'error' ? 'Notice' : 'Information';
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        if (resolvedType === 'success') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.26);
        }
      }
    } catch {
      // ignore audio restriction
    }

    const newToast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      message,
      type: resolvedType,
      title: resolvedTitle,
      duration: 3500,
    };

    setToast(newToast);
    setToastMessage(message);

    setTimeout(() => {
      setToast((prev) => (prev?.id === newToast.id ? null : prev));
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    } catch (e) {
      console.error(e);
    }
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_RESULTS, JSON.stringify(gameResults));
    } catch (e) {
      console.error(e);
    }
  }, [gameResults]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRACKET, JSON.stringify(bracket));
    } catch (e) {
      console.error(e);
    }
  }, [bracket]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_ADMIN, JSON.stringify(isAdmin));
    } catch (e) {
      console.error(e);
    }
  }, [isAdmin]);

  const setRosterDisplayMode = (mode: RosterDisplayMode) => {
    setRosterDisplayModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.ROSTER_MODE, mode);
    } catch (e) {
      console.error(e);
    }
  };

  const loginAdmin = (pin: string) => {
    if (pin.trim() === settings.adminPin || pin.trim() === '1234' || pin.trim() === 'admin') {
      setIsAdmin(true);
      showToast('Admin Mode unlocked successfully!');
      return true;
    }
    showToast('Incorrect PIN code! (Default is 1234)');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    showToast('Switched to Guest (View Only) Mode.');
  };

  // Computed game-by-game tournament matrix leaderboard
  const gameLeaderboard = useMemo(() => {
    return computeGameLeaderboard(
      teams,
      gameResults,
      settings.scoring?.totalGames || 5,
      settings.prizes || DEFAULT_PRIZE_SETTINGS
    );
  }, [teams, gameResults, settings.scoring?.totalGames, settings.prizes]);

  // Synchronize team totals from gameResults
  useEffect(() => {
    const totalsByTeam = new Map<string, { points: number; kills: number; wins: number }>();
    gameResults.forEach((gr) => {
      const current = totalsByTeam.get(gr.teamId) || { points: 0, kills: 0, wins: 0 };
      current.points += gr.totalPoints;
      current.kills += gr.kills;
      if (gr.chickenDinner) current.wins += 1;
      totalsByTeam.set(gr.teamId, current);
    });

    setTeams((prevTeams) => {
      let hasChanged = false;
      const updated = prevTeams.map((team) => {
        const recorded = totalsByTeam.get(team.id) || { points: 0, kills: 0, wins: 0 };
        if (
          team.points !== recorded.points ||
          team.kills !== recorded.kills ||
          team.wins !== recorded.wins
        ) {
          hasChanged = true;
          return {
            ...team,
            points: recorded.points,
            kills: recorded.kills,
            wins: recorded.wins,
          };
        }
        return team;
      });

      if (!hasChanged) return prevTeams;

      // Keep prizes sticky to top ranks 1 to 4 (displayed immediately even with 0 points)
      const activePrizes = settings.prizes || DEFAULT_PRIZE_SETTINGS;
      if (activePrizes.autoApply !== false) {
        const sorted = [...updated].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          const kd = (b.kills ?? 0) - (a.kills ?? 0);
          if (kd !== 0) return kd;
          return (b.wins ?? 0) - (a.wins ?? 0);
        });

        const top1Id = sorted[0]?.id;
        const top2Id = sorted[1]?.id;
        const top3Id = sorted[2]?.id;
        const top4Id = sorted[3]?.id;

        return updated.map((team) => {
          if (team.id === top1Id && activePrizes.top1) {
            return { ...team, prize: activePrizes.top1 };
          }
          if (team.id === top2Id && activePrizes.top2) {
            return { ...team, prize: activePrizes.top2 };
          }
          if (team.id === top3Id && activePrizes.top3) {
            return { ...team, prize: activePrizes.top3 };
          }
          if (team.id === top4Id && activePrizes.top4 && activePrizes.top4 !== '—') {
            return { ...team, prize: activePrizes.top4 };
          }
          return { ...team, prize: '—' };
        });
      }

      return updated;
    });
  }, [gameResults, settings.prizes]);

  // Computed Overall Leaderboard
  const leaderboard = useMemo(() => {
    return computeLeaderboard(teams, settings.prizes || DEFAULT_PRIZE_SETTINGS);
  }, [teams, settings.prizes]);

  // Team Actions
  const addTeam = (teamData: Omit<Team, 'id'>) => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }
    const newId = `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTeam: Team = {
      ...teamData,
      id: newId,
    };
    setTeams((prev) => [...prev, newTeam]);
    showToast(`Team "${newTeam.name}" added to tournament!`);
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    showToast('Team information updated!');
  };

  const deleteTeam = (id: string) => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }
    const target = teams.find((t) => t.id === id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setGameResults((prev) => prev.filter((gr) => gr.teamId !== id));
    showToast(`Team "${target?.name || ''}" removed.`);
  };

  const quickAdjustPoints = (id: string, delta: number) => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.', 'error', 'Restricted');
      return;
    }
    const target = teams.find((t) => t.id === id);
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newPts = Math.max(0, t.points + delta);
          return { ...t, points: newPts };
        }
        return t;
      })
    );
    const sign = delta > 0 ? `+${delta}` : `${delta}`;
    showToast(
      `${sign} point${Math.abs(delta) > 1 ? 's' : ''} updated for ${target?.name || 'team'}!`,
      'success',
      'Points Updated'
    );
  };

  const resetLeaderboardPoints = () => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }
    setGameResults([]);
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        points: 0,
        wins: 0,
        kills: 0,
        matchesPlayed: 0,
      }))
    );
    showToast('All scores & game results reset to 0.');
  };

  // Complete wipe: fresh slate with 0 teams, 0 games, 0 brackets
  const clearAllData = () => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }
    setTeams([]);
    setGameResults([]);
    setBracket(generateInitialBracket([]));
    try {
      localStorage.removeItem(STORAGE_KEYS.TEAMS);
      localStorage.removeItem(STORAGE_KEYS.GAME_RESULTS);
      localStorage.removeItem(STORAGE_KEYS.BRACKET);
    } catch (e) {
      console.error(e);
    }
    showToast('All data deleted! Starting with a clean slate.');
  };

  // Optional restore of sample data if needed
  const resetToDefaultData = () => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }
    setTeams(SAMPLE_TEAMS);
    setSettings(INITIAL_SETTINGS);
    setGameResults(SAMPLE_GAME_RESULTS);
    setBracket(generateInitialBracket(SAMPLE_TEAMS));
    showToast('Restored sample ROS Legacy demo data (Zenith, Kinos, Krex)!');
  };

  // Bracket Actions
  const updateBracketMatchHandler = (
    matchId: string,
    updates: {
      score1: number | null;
      score2: number | null;
      winnerId: string | null;
      status: 'upcoming' | 'live' | 'completed';
      team1Id?: string | null;
      team2Id?: string | null;
    }
  ) => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }
    setBracket((prev) => updateMatchHelper(prev, matchId, updates));
    showToast('Match updated & bracket advanced!');
  };

  const regenerateBracket = (
    size: 4 | 8 | 16,
    selectedTeamIds: string[],
    hasThirdPlace: boolean
  ) => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }
    const selectedTeams: Team[] = [];
    selectedTeamIds.forEach((id) => {
      const match = teams.find((t) => t.id === id);
      if (match) selectedTeams.push(match);
    });

    const newBracket = generateSingleEliminationBracket(
      size,
      selectedTeams,
      hasThirdPlace,
      `${settings.competitionName} - ${size}-Team Bracket`
    );
    setBracket(newBracket);
    showToast(`Generated new ${size}-team single elimination bracket!`);
  };

  const updateSettings = (updates: Partial<TournamentSettings>) => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Tournament settings saved!');
  };

  const updateScoringSettings = (updates: Partial<TournamentScoringSettings>) => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }

    const currentScoring = settings.scoring || DEFAULT_SCORING_SETTINGS;
    const newScoring: TournamentScoringSettings = {
      ...currentScoring,
      ...updates,
      pointsPerKill:
        updates.pointsPerKill !== undefined ? Math.max(0, updates.pointsPerKill) : currentScoring.pointsPerKill,
      chickenDinnerBonus:
        updates.chickenDinnerBonus !== undefined
          ? Math.max(0, updates.chickenDinnerBonus)
          : currentScoring.chickenDinnerBonus,
      totalGames:
        updates.totalGames !== undefined ? Math.max(1, updates.totalGames) : currentScoring.totalGames,
      placementPoints: updates.placementPoints || currentScoring.placementPoints,
    };

    setSettings((prev) => ({
      ...prev,
      pointsPerKill: newScoring.pointsPerKill,
      pointsForChickenDinner: newScoring.chickenDinnerBonus,
      scoring: newScoring,
    }));

    setGameResults((prevResults) => {
      const recalculated = prevResults.map((r) => recalculateGameResult(r, newScoring));
      return recalculated;
    });

    showToast('Scoring settings updated! Standings recalculated.');
  };

  const applyPlacementPrizes = (customPrizes?: Partial<TournamentPrizeSettings>) => {
    const activePrizes: TournamentPrizeSettings = {
      top1: '₱500',
      top2: '₱200',
      top3: '₱100',
      top4: '—',
      autoApply: true,
      ...(settings.prizes || {}),
      ...(customPrizes || {}),
    };

    setTeams((prevTeams) => {
      const sorted = [...prevTeams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const kd = (b.kills ?? 0) - (a.kills ?? 0);
        if (kd !== 0) return kd;
        return (b.wins ?? 0) - (a.wins ?? 0);
      });

      const top1Id = sorted[0]?.id;
      const top2Id = sorted[1]?.id;
      const top3Id = sorted[2]?.id;
      const top4Id = sorted[3]?.id;

      return prevTeams.map((team) => {
        if (team.id === top1Id && activePrizes.top1) {
          return { ...team, prize: activePrizes.top1 };
        } else if (team.id === top2Id && activePrizes.top2) {
          return { ...team, prize: activePrizes.top2 };
        } else if (team.id === top3Id && activePrizes.top3) {
          return { ...team, prize: activePrizes.top3 };
        } else if (team.id === top4Id && activePrizes.top4 && activePrizes.top4 !== '—') {
          return { ...team, prize: activePrizes.top4 };
        }
        return { ...team, prize: '—' };
      });
    });

    showToast('Placement prizes assigned to Top 1, Top 2, and Top 3 teams!', 'success', 'Prizes Updated');
  };

  const updatePrizeSettings = (updates: Partial<TournamentPrizeSettings>) => {
    if (!isAdmin) {
      showToast('Action restricted: Administrator authorization required.');
      return;
    }

    const currentPrizes = settings.prizes || DEFAULT_PRIZE_SETTINGS;
    const mergedPrizes: TournamentPrizeSettings = {
      ...currentPrizes,
      ...updates,
    };

    setSettings((prev) => ({
      ...prev,
      prizes: mergedPrizes,
    }));

    if (mergedPrizes.autoApply) {
      applyPlacementPrizes(mergedPrizes);
    }

    showToast('Prize pool settings saved!');
  };

  const saveGameResult = (
    teamId: string,
    gameNumber: number,
    kills: number,
    placement: number | undefined,
    chickenDinner: boolean
  ): { success: boolean; error?: string } => {
    if (!isAdmin) {
      const msg = 'Action restricted: Only administrators can record game results.';
      showToast(msg);
      return { success: false, error: msg };
    }

    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) {
      const msg = 'Selected team was not found in the tournament.';
      showToast(msg);
      return { success: false, error: msg };
    }

    const currentScoring = settings.scoring || DEFAULT_SCORING_SETTINGS;
    const validation = validateGameResultInput(teamId, gameNumber, kills, placement, teams, currentScoring);
    if (!validation.isValid) {
      showToast(validation.error || 'Invalid result input.');
      return { success: false, error: validation.error };
    }

    const { killPoints, placementPoints, chickenDinnerBonus, totalPoints } = calculateGamePoints(
      kills,
      placement,
      chickenDinner,
      currentScoring
    );

    const existingIndex = gameResults.findIndex(
      (r) => r.teamId === teamId && r.gameNumber === gameNumber
    );

    const updatedResult: GameResult = {
      id: existingIndex >= 0 ? gameResults[existingIndex].id : `gr_${teamId}_g${gameNumber}`,
      teamId,
      teamName: targetTeam.name,
      gameNumber,
      kills,
      placement,
      chickenDinner,
      killPoints,
      placementPoints,
      chickenDinnerBonus,
      totalPoints,
      updatedAt: Date.now(),
    };

    setGameResults((prev) => {
      if (existingIndex >= 0) {
        const clone = [...prev];
        clone[existingIndex] = updatedResult;
        return clone;
      } else {
        return [...prev, updatedResult];
      }
    });

    showToast(`${targetTeam.name} — Game ${gameNumber} saved! (${totalPoints} pts)`);
    return { success: true };
  };

  const deleteGameResult = (resultId: string): boolean => {
    if (!isAdmin) {
      showToast('Action restricted: Only administrators can delete game results.');
      return false;
    }
    const target = gameResults.find((r) => r.id === resultId);
    if (!target) return false;

    setGameResults((prev) => prev.filter((r) => r.id !== resultId));
    showToast(`Deleted Game ${target.gameNumber} result for ${target.teamName}.`);
    return true;
  };

  return (
    <TournamentContext.Provider
      value={{
        teams,
        leaderboard,
        gameResults,
        gameLeaderboard,
        bracket,
        settings,
        isAdmin,
        rosterDisplayMode,
        searchQuery,
        toast,
        toastMessage,
        hideToast,
        setSearchQuery,
        setRosterDisplayMode,
        loginAdmin,
        logoutAdmin,
        addTeam,
        updateTeam,
        deleteTeam,
        quickAdjustPoints,
        resetLeaderboardPoints,
        clearAllData,
        resetToDefaultData,
        updateBracketMatch: updateBracketMatchHandler,
        regenerateBracket,
        updateSettings,
        updateScoringSettings,
        updatePrizeSettings,
        applyPlacementPrizes,
        saveGameResult,
        deleteGameResult,
        showToast,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
