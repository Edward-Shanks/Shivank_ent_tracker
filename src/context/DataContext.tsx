'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Anime,
  Movie,
  KDrama,
  Game,
  GenshinAccount,
  Credential,
  Website,
  AnimeStats,
  DashboardStats,
} from '@/types';
import {
  mockAnime,
  mockMovies,
  mockKDrama,
  mockGames,
  mockGenshinAccount,
  mockCredentials,
  mockWebsites,
} from '@/data/mockData';
import { nanoid } from 'nanoid';

interface DataContextType {
  // Anime
  anime: Anime[];
  addAnime: (anime: Omit<Anime, 'id'>) => void;
  updateAnime: (id: string, updates: Partial<Anime>) => void;
  deleteAnime: (id: string) => void;
  getAnimeStats: () => AnimeStats;
  
  // Movies
  movies: Movie[];
  addMovie: (movie: Omit<Movie, 'id'>) => void;
  updateMovie: (id: string, updates: Partial<Movie>) => void;
  deleteMovie: (id: string) => void;
  
  // K-Drama
  kdrama: KDrama[];
  addKDrama: (drama: Omit<KDrama, 'id'>) => void;
  updateKDrama: (id: string, updates: Partial<KDrama>) => void;
  deleteKDrama: (id: string) => void;
  
  // Games
  games: Game[];
  addGame: (game: Omit<Game, 'id'>) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  
  // Genshin
  genshinAccount: GenshinAccount | null;
  updateGenshinAccount: (updates: Partial<GenshinAccount>) => void;
  addGenshinCharacter: (character: Omit<import('@/types').GenshinCharacter, 'id' | 'friendship'>) => void;
  updateGenshinCharacter: (id: string, updates: Partial<import('@/types').GenshinCharacter>) => void;
  deleteGenshinCharacter: (id: string) => void;
  
  // Credentials
  credentials: Credential[];
  addCredential: (credential: Omit<Credential, 'id'>) => void;
  updateCredential: (id: string, updates: Partial<Credential>) => void;
  deleteCredential: (id: string) => void;
  
  // Websites
  websites: Website[];
  addWebsite: (website: Omit<Website, 'id'>) => void;
  updateWebsite: (id: string, updates: Partial<Website>) => void;
  deleteWebsite: (id: string) => void;
  
  // Dashboard
  getDashboardStats: () => DashboardStats;
  
  // Loading states
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function generateId(): string {
  return nanoid();
}

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize with static mock data
  const [anime, setAnime] = useState<Anime[]>(mockAnime);
  const [movies, setMovies] = useState<Movie[]>(mockMovies);
  const [kdrama, setKDrama] = useState<KDrama[]>(mockKDrama);
  const [games, setGames] = useState<Game[]>(mockGames);
  const [genshinAccount, setGenshinAccount] = useState<GenshinAccount | null>(mockGenshinAccount);
  const [credentials, setCredentials] = useState<Credential[]>(mockCredentials);
  const [websites, setWebsites] = useState<Website[]>(mockWebsites);
  const [isLoading] = useState(false); // No loading needed for static data

  // ===== ANIME FUNCTIONS =====
  const addAnime = (newAnime: Omit<Anime, 'id'>) => {
    setAnime((prev) => [...prev, { ...newAnime, id: generateId() }]);
  };

  const updateAnime = (id: string, updates: Partial<Anime>) => {
    setAnime((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteAnime = (id: string) => {
    setAnime((prev) => prev.filter((item) => item.id !== id));
  };

  const getAnimeStats = (): AnimeStats => {
    const totalEpisodes = anime.reduce((acc, a) => acc + (a.episodesWatched || 0), 0);
    const scoresArray = anime.filter((a) => a.score).map((a) => a.score!);
    const meanScore = scoresArray.length > 0
      ? scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length
      : 0;

    const statusCounts = {
      watching: anime.filter((a) => a.status === 'watching').length,
      completed: anime.filter((a) => a.status === 'completed').length,
      planning: anime.filter((a) => a.status === 'planning').length,
      dropped: anime.filter((a) => a.status === 'dropped').length,
      onHold: anime.filter((a) => a.status === 'on-hold').length,
    };

    const genreMap = new Map<string, number>();
    anime.forEach((a) => {
      a.genres.forEach((genre) => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });
    const genreDistribution = Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
      score: i + 1,
      count: anime.filter((a) => a.score === i + 1).length,
    }));

    const monthlyActivity = [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 8 },
      { month: 'Mar', count: 15 },
      { month: 'Apr', count: 10 },
      { month: 'May', count: 18 },
      { month: 'Jun', count: 14 },
    ];

    return {
      totalAnime: anime.length,
      totalEpisodes,
      meanScore: Math.round(meanScore * 10) / 10,
      ...statusCounts,
      genreDistribution,
      scoreDistribution,
      monthlyActivity,
    };
  };

  // ===== MOVIE FUNCTIONS =====
  const addMovie = (newMovie: Omit<Movie, 'id'>) => {
    setMovies((prev) => [...prev, { ...newMovie, id: generateId() }]);
  };

  const updateMovie = (id: string, updates: Partial<Movie>) => {
    setMovies((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteMovie = (id: string) => {
    setMovies((prev) => prev.filter((item) => item.id !== id));
  };

  // ===== K-DRAMA FUNCTIONS =====
  const addKDrama = (newDrama: Omit<KDrama, 'id'>) => {
    setKDrama((prev) => [...prev, { ...newDrama, id: generateId() }]);
  };

  const updateKDrama = (id: string, updates: Partial<KDrama>) => {
    setKDrama((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteKDrama = (id: string) => {
    setKDrama((prev) => prev.filter((item) => item.id !== id));
  };

  // ===== GAME FUNCTIONS =====
  const addGame = (newGame: Omit<Game, 'id'>) => {
    setGames((prev) => [...prev, { ...newGame, id: generateId() }]);
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    setGames((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteGame = (id: string) => {
    setGames((prev) => prev.filter((item) => item.id !== id));
  };

  // ===== GENSHIN FUNCTIONS =====
  const updateGenshinAccount = (updates: Partial<GenshinAccount>) => {
    if (genshinAccount) {
      setGenshinAccount({ ...genshinAccount, ...updates });
    }
  };

  const addGenshinCharacter = (character: Omit<import('@/types').GenshinCharacter, 'id' | 'friendship'>) => {
    if (genshinAccount) {
      const newCharacter: import('@/types').GenshinCharacter = {
        ...character,
        id: generateId(),
        friendship: 0,
      };
      setGenshinAccount({
        ...genshinAccount,
        characters: [...genshinAccount.characters, newCharacter],
      });
    }
  };

  const updateGenshinCharacter = (id: string, updates: Partial<import('@/types').GenshinCharacter>) => {
    if (genshinAccount) {
      setGenshinAccount({
        ...genshinAccount,
        characters: genshinAccount.characters.map((char) =>
          char.id === id ? { ...char, ...updates } : char
        ),
      });
    }
  };

  const deleteGenshinCharacter = (id: string) => {
    if (genshinAccount) {
      setGenshinAccount({
        ...genshinAccount,
        characters: genshinAccount.characters.filter((char) => char.id !== id),
      });
    }
  };

  // ===== CREDENTIAL FUNCTIONS =====
  const addCredential = (newCredential: Omit<Credential, 'id'>) => {
    setCredentials((prev) => [...prev, { ...newCredential, id: generateId() }]);
  };

  const updateCredential = (id: string, updates: Partial<Credential>) => {
    setCredentials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteCredential = (id: string) => {
    setCredentials((prev) => prev.filter((item) => item.id !== id));
  };

  // ===== WEBSITE FUNCTIONS =====
  const addWebsite = (newWebsite: Omit<Website, 'id'>) => {
    setWebsites((prev) => [...prev, { ...newWebsite, id: generateId() }]);
  };

  const updateWebsite = (id: string, updates: Partial<Website>) => {
    setWebsites((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteWebsite = (id: string) => {
    setWebsites((prev) => prev.filter((item) => item.id !== id));
  };

  // ===== DASHBOARD STATS =====
  const getDashboardStats = (): DashboardStats => ({
    anime: {
      total: anime.length,
      watching: anime.filter((a) => a.status === 'watching').length,
    },
    movies: {
      total: movies.length,
      watched: movies.filter((m) => m.status === 'watched').length,
    },
    kdrama: {
      total: kdrama.length,
      watching: kdrama.filter((k) => k.status === 'watching').length,
    },
    games: {
      total: games.length,
      playing: games.filter((g) => g.status === 'playing').length,
    },
  });

  return (
    <DataContext.Provider
      value={{
        anime,
        addAnime,
        updateAnime,
        deleteAnime,
        getAnimeStats,
        movies,
        addMovie,
        updateMovie,
        deleteMovie,
        kdrama,
        addKDrama,
        updateKDrama,
        deleteKDrama,
        games,
        addGame,
        updateGame,
        deleteGame,
        genshinAccount,
        updateGenshinAccount,
        addGenshinCharacter,
        updateGenshinCharacter,
        deleteGenshinCharacter,
        credentials,
        addCredential,
        updateCredential,
        deleteCredential,
        websites,
        addWebsite,
        updateWebsite,
        deleteWebsite,
        getDashboardStats,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
