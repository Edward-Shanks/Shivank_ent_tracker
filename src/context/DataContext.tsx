'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
import { apiClient } from '@/lib/api-client';

interface DataContextType {
  // Anime
  anime: Anime[];
  addAnime: (anime: Omit<Anime, 'id'>) => Promise<void>;
  updateAnime: (id: string, updates: Partial<Anime>) => Promise<void>;
  deleteAnime: (id: string) => Promise<void>;
  getAnimeStats: () => Promise<AnimeStats>;
  
  // Movies
  movies: Movie[];
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<void>;
  updateMovie: (id: string, updates: Partial<Movie>) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
  
  // K-Drama
  kdrama: KDrama[];
  addKDrama: (drama: Omit<KDrama, 'id'>) => Promise<void>;
  updateKDrama: (id: string, updates: Partial<KDrama>) => Promise<void>;
  deleteKDrama: (id: string) => Promise<void>;
  
  // Games
  games: Game[];
  addGame: (game: Omit<Game, 'id'>) => Promise<void>;
  updateGame: (id: string, updates: Partial<Game>) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  
  // Genshin
  genshinAccount: GenshinAccount | null;
  updateGenshinAccount: (updates: Partial<GenshinAccount>) => Promise<void>;
  addGenshinCharacter: (character: Omit<import('@/types').GenshinCharacter, 'id' | 'friendship'>) => Promise<void>;
  updateGenshinCharacter: (id: string, updates: Partial<import('@/types').GenshinCharacter>) => Promise<void>;
  deleteGenshinCharacter: (id: string) => Promise<void>;
  
  // Credentials
  credentials: Credential[];
  addCredential: (credential: Omit<Credential, 'id'>) => Promise<void>;
  updateCredential: (id: string, updates: Partial<Credential>) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  
  // Websites
  websites: Website[];
  addWebsite: (website: Omit<Website, 'id'>) => Promise<void>;
  updateWebsite: (id: string, updates: Partial<Website>) => Promise<void>;
  deleteWebsite: (id: string) => Promise<void>;
  
  // Dashboard
  getDashboardStats: () => Promise<DashboardStats>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [kdrama, setKDrama] = useState<KDrama[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [genshinAccount, setGenshinAccount] = useState<GenshinAccount | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on mount
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [animeData, moviesData, kdramaData, gamesData, genshinData, credentialsData, websitesData] = await Promise.all([
        apiClient.get<Anime[]>('/anime').catch(() => []),
        apiClient.get<Movie[]>('/movies').catch(() => []),
        apiClient.get<KDrama[]>('/kdrama').catch(() => []),
        apiClient.get<Game[]>('/games').catch(() => []),
        apiClient.get<GenshinAccount | null>('/genshin').catch(() => null),
        apiClient.get<Credential[]>('/credentials').catch(() => []),
        apiClient.get<Website[]>('/websites').catch(() => []),
      ]);
      
      setAnime(animeData);
      setMovies(moviesData);
      setKDrama(kdramaData);
      setGames(gamesData);
      setGenshinAccount(genshinData);
      setCredentials(credentialsData);
      setWebsites(websitesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ===== ANIME FUNCTIONS =====
  const addAnime = async (newAnime: Omit<Anime, 'id'>) => {
    try {
      const created = await apiClient.post<Anime>('/anime', newAnime);
      setAnime((prev) => [...prev, created]);
    } catch (err) {
      console.error('Error adding anime:', err);
      throw err;
    }
  };

  const updateAnime = async (id: string, updates: Partial<Anime>) => {
    try {
      const updated = await apiClient.patch<Anime>(`/anime/${id}`, updates);
      setAnime((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error('Error updating anime:', err);
      throw err;
    }
  };

  const deleteAnime = async (id: string) => {
    try {
      await apiClient.delete(`/anime/${id}`);
      setAnime((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting anime:', err);
      throw err;
    }
  };

  const getAnimeStats = async (): Promise<AnimeStats> => {
    try {
      return await apiClient.get<AnimeStats>('/anime/stats');
    } catch (err) {
      console.error('Error fetching anime stats:', err);
      throw err;
    }
  };

  // ===== MOVIE FUNCTIONS =====
  const addMovie = async (newMovie: Omit<Movie, 'id'>) => {
    try {
      const created = await apiClient.post<Movie>('/movies', newMovie);
      setMovies((prev) => [...prev, created]);
    } catch (err) {
      console.error('Error adding movie:', err);
      throw err;
    }
  };

  const updateMovie = async (id: string, updates: Partial<Movie>) => {
    try {
      const updated = await apiClient.patch<Movie>(`/movies/${id}`, updates);
      setMovies((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error('Error updating movie:', err);
      throw err;
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      await apiClient.delete(`/movies/${id}`);
      setMovies((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting movie:', err);
      throw err;
    }
  };

  // ===== K-DRAMA FUNCTIONS =====
  const addKDrama = async (newDrama: Omit<KDrama, 'id'>) => {
    try {
      const created = await apiClient.post<KDrama>('/kdrama', newDrama);
      setKDrama((prev) => [...prev, created]);
    } catch (err) {
      console.error('Error adding k-drama:', err);
      throw err;
    }
  };

  const updateKDrama = async (id: string, updates: Partial<KDrama>) => {
    try {
      const updated = await apiClient.patch<KDrama>(`/kdrama/${id}`, updates);
      setKDrama((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error('Error updating k-drama:', err);
      throw err;
    }
  };

  const deleteKDrama = async (id: string) => {
    try {
      await apiClient.delete(`/kdrama/${id}`);
      setKDrama((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting k-drama:', err);
      throw err;
    }
  };

  // ===== GAME FUNCTIONS =====
  const addGame = async (newGame: Omit<Game, 'id'>) => {
    try {
      const created = await apiClient.post<Game>('/games', newGame);
      setGames((prev) => [...prev, created]);
    } catch (err) {
      console.error('Error adding game:', err);
      throw err;
    }
  };

  const updateGame = async (id: string, updates: Partial<Game>) => {
    try {
      const updated = await apiClient.patch<Game>(`/games/${id}`, updates);
      setGames((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error('Error updating game:', err);
      throw err;
    }
  };

  const deleteGame = async (id: string) => {
    try {
      await apiClient.delete(`/games/${id}`);
      setGames((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting game:', err);
      throw err;
    }
  };

  // ===== GENSHIN FUNCTIONS =====
  const updateGenshinAccount = async (updates: Partial<GenshinAccount>) => {
    try {
      const updated = await apiClient.patch<GenshinAccount>('/genshin', updates);
      setGenshinAccount(updated);
    } catch (err) {
      console.error('Error updating genshin account:', err);
      throw err;
    }
  };

  const addGenshinCharacter = async (character: Omit<import('@/types').GenshinCharacter, 'id' | 'friendship'>) => {
    try {
      const created = await apiClient.post<import('@/types').GenshinCharacter>('/genshin/characters', {
        ...character,
        friendship: 0,
      });
      if (genshinAccount) {
        setGenshinAccount({
          ...genshinAccount,
          characters: [...genshinAccount.characters, created],
        });
      }
    } catch (err) {
      console.error('Error adding genshin character:', err);
      throw err;
    }
  };

  const updateGenshinCharacter = async (id: string, updates: Partial<import('@/types').GenshinCharacter>) => {
    try {
      const updated = await apiClient.patch<import('@/types').GenshinCharacter>(`/genshin/characters/${id}`, updates);
      if (genshinAccount) {
        setGenshinAccount({
          ...genshinAccount,
          characters: genshinAccount.characters.map((char) =>
            char.id === id ? updated : char
          ),
        });
      }
    } catch (err) {
      console.error('Error updating genshin character:', err);
      throw err;
    }
  };

  const deleteGenshinCharacter = async (id: string) => {
    try {
      await apiClient.delete(`/genshin/characters/${id}`);
      if (genshinAccount) {
        setGenshinAccount({
          ...genshinAccount,
          characters: genshinAccount.characters.filter((char) => char.id !== id),
        });
      }
    } catch (err) {
      console.error('Error deleting genshin character:', err);
      throw err;
    }
  };

  // ===== CREDENTIAL FUNCTIONS =====
  const addCredential = async (newCredential: Omit<Credential, 'id'>) => {
    try {
      const created = await apiClient.post<Credential>('/credentials', newCredential);
      setCredentials((prev) => [...prev, created]);
    } catch (err) {
      console.error('Error adding credential:', err);
      throw err;
    }
  };

  const updateCredential = async (id: string, updates: Partial<Credential>) => {
    try {
      const updated = await apiClient.patch<Credential>(`/credentials/${id}`, updates);
      setCredentials((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error('Error updating credential:', err);
      throw err;
    }
  };

  const deleteCredential = async (id: string) => {
    try {
      await apiClient.delete(`/credentials/${id}`);
      setCredentials((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting credential:', err);
      throw err;
    }
  };

  // ===== WEBSITE FUNCTIONS =====
  const addWebsite = async (newWebsite: Omit<Website, 'id'>) => {
    try {
      const created = await apiClient.post<Website>('/websites', newWebsite);
      setWebsites((prev) => [...prev, created]);
    } catch (err) {
      console.error('Error adding website:', err);
      throw err;
    }
  };

  const updateWebsite = async (id: string, updates: Partial<Website>) => {
    try {
      const updated = await apiClient.patch<Website>(`/websites/${id}`, updates);
      setWebsites((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error('Error updating website:', err);
      throw err;
    }
  };

  const deleteWebsite = async (id: string) => {
    try {
      await apiClient.delete(`/websites/${id}`);
      setWebsites((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting website:', err);
      throw err;
    }
  };

  // ===== DASHBOARD STATS =====
  const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
      return await apiClient.get<DashboardStats>('/dashboard/stats');
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      throw err;
    }
  };

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
        error,
        refreshData: fetchAllData,
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
