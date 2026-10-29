import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Team, LeaderboardEntry, BracketData, TournamentSettings, RosterDisplayMode } from '../types';
import { INITIAL_TEAMS, INITIAL_SETTINGS, generateInitialBracket } from '../data/initialData';
import { computeLeaderboard } from '../utils/leaderboardUtils';
import { generateSingleEliminationBracket, updateBracketMatch as updateMatchHelper } from '../utils/bracketUtils';

interface TournamentContextType {
  teams: Team[];
  leaderboard: LeaderboardEntry[];
  bracket: BracketData;
  settings: TournamentSettings;
  isAdmin: boolean;
  rosterDisplayMode: RosterDisplayMode;
  searchQuery: string;
  toastMessage: string | null;
  setSearchQuery: (q: string) => void;
  setRosterDisplayMode: (mode: RosterDisplayMode) => void;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  quickAdjustPoints: (id: string, delta: number) => void;
  resetLeaderboardPoints: () => void;
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
  showToast: (message: string) => void;
}

const STORAGE_KEYS = {
  TEAMS: 'ros_legacy_teams_v1',
  BRACKET: 'ros_legacy_bracket_v1',
  SETTINGS: 'ros_legacy_settings_v1',
  ROSTER_MODE: 'ros_legacy_roster_mode_v1',
  IS_ADMIN: 'ros_legacy_is_admin_v1',
};

const TournamentContext = createContext<TournamentContextType | null>(null);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial teams from localStorage or default
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved teams', e);
    }
    return INITIAL_TEAMS;
  });

  // Settings
  const [settings, setSettings] = useState<TournamentSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved settings', e);
    }
    return INITIAL_SETTINGS;
  });

  // Bracket
  const [bracket, setBracket] = useState<BracketData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRACKET);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved bracket', e);
    }
    return generateInitialBracket(INITIAL_TEAMS);
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

  // Admin status: default true for easy demo access, but full lock/guest support
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return true; // Default admin enabled so testers can immediately test admin tools
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3200);
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

  // Computed Leaderboard with auto-ranking and tie handling
  const leaderboard = useMemo(() => {
    return computeLeaderboard(teams);
  }, [teams]);

  // Actions
  const addTeam = (teamData: Omit<Team, 'id'>) => {
    const newId = `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTeam: Team = {
      ...teamData,
      id: newId,
    };
    setTeams((prev) => [...prev, newTeam]);
    showToast(`Team "${newTeam.name}" added to leaderboard!`);
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    showToast('Team information updated!');
  };

  const deleteTeam = (id: string) => {
    const target = teams.find((t) => t.id === id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
    showToast(`Team "${target?.name || ''}" removed.`);
  };

  const quickAdjustPoints = (id: string, delta: number) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newPts = Math.max(0, t.points + delta);
          return { ...t, points: newPts };
        }
        return t;
      })
    );
  };

  const resetLeaderboardPoints = () => {
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        points: 0,
        wins: 0,
        kills: 0,
        matchesPlayed: 0,
      }))
    );
    showToast('Leaderboard points reset to 0 for new competition!');
  };

  const resetToDefaultData = () => {
    setTeams(INITIAL_TEAMS);
    setSettings(INITIAL_SETTINGS);
    setBracket(generateInitialBracket(INITIAL_TEAMS));
    showToast('Reset to default ROS Legacy community data!');
  };

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
    setBracket((prev) => updateMatchHelper(prev, matchId, updates));
    showToast('Match updated & bracket advanced!');
  };

  const regenerateBracket = (
    size: 4 | 8 | 16,
    selectedTeamIds: string[],
    hasThirdPlace: boolean
  ) => {
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
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Tournament settings saved!');
  };

  return (
    <TournamentContext.Provider
      value={{
        teams,
        leaderboard,
        bracket,
        settings,
        isAdmin,
        rosterDisplayMode,
        searchQuery,
        toastMessage,
        setSearchQuery,
        setRosterDisplayMode,
        loginAdmin,
        logoutAdmin,
        addTeam,
        updateTeam,
        deleteTeam,
        quickAdjustPoints,
        resetLeaderboardPoints,
        resetToDefaultData,
        updateBracketMatch: updateBracketMatchHandler,
        regenerateBracket,
        updateSettings,
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

