// ===== USER TYPES =====
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

// ===== ANIME TYPES =====
export type AnimeType = 'Anime' | 'Donghua';
export type AiringStatus = 'YTA' | 'Airing' | 'Completed';
export type WatchStatus = 'YTW' | 'Watching' | 'Watch Later' | 'Completed' | 'On Hold' | 'Dropped';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Anime {
  id: string;
  title: string;
  titleJapanese?: string;
  animeOtherName?: string;
  animeType?: AnimeType;
  airingStatus?: AiringStatus;
  watchStatus: WatchStatus;
  websiteLink?: string;
  episodeOn?: DayOfWeek;
  coverImage: string;
  bannerImage?: string;
  episodes: number;
  episodesWatched: number;
  score?: number;
  genres: string[];
  synopsis?: string;
  season?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

// ===== MOVIE TYPES =====
export type MovieStatus = 'watched' | 'planning' | 'rewatching';
export type ReviewType = 'Good' | 'Okay' | 'Onetime watch' | 'Not Good';

export interface Movie {
  id: string;
  title: string;
  posterImage: string;
  backdropImage?: string;
  releaseDate: string;
  status: MovieStatus;
  reviewType?: ReviewType;
  genres: string[];
  synopsis?: string;
  notes?: string;
}

// ===== K-DRAMA TYPES =====
export type KDramaStatus = 'watching' | 'completed' | 'planning' | 'dropped' | 'on-hold';

export interface KDrama {
  id: string;
  title: string;
  titleKorean?: string;
  posterImage: string;
  episodes: number;
  episodesWatched: number;
  status: KDramaStatus;
  score?: number;
  genres: string[];
  synopsis?: string;
  network?: string;
  year?: number;
  cast?: string[];
  notes?: string;
}

// ===== GAME TYPES =====
export type GameStatus = 'playing' | 'completed' | 'planning' | 'dropped' | 'on-hold';
export type GamePlatform = 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo' | 'Mobile' | 'Other';

export interface Game {
  id: string;
  title: string;
  coverImage: string;
  platform: GamePlatform[];
  status: GameStatus;
  gameType?: string;
  downloadUrl?: string;
  genres: string[];
  releaseDate?: string;
  notes?: string;
}

// ===== GENSHIN TYPES =====
export type GenshinElement = 'Pyro' | 'Hydro' | 'Anemo' | 'Electro' | 'Dendro' | 'Cryo' | 'Geo';
export type GenshinWeapon = 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst';
export type GenshinRarity = 4 | 5;

export interface GenshinCharacter {
  id: string;
  name: string;
  element: GenshinElement;
  weapon: GenshinWeapon;
  rarity: GenshinRarity;
  constellation: number;
  level: number;
  friendship: number;
  image: string;
  obtained: boolean;
  tier?: string;
  type?: string;
  type2?: string;
  buildNotes?: string;
}

export interface GenshinAccount {
  uid: string;
  adventureRank: number;
  worldLevel: number;
  characters: GenshinCharacter[];
  primogems: number;
  intertwined: number;
  acquaint: number;
}

// ===== CREDENTIALS TYPES =====
export type CredentialCategory = 'streaming' | 'gaming' | 'social' | 'email' | 'finance' | 'shopping' | 'other';

export interface Credential {
  id: string;
  name: string;
  category: CredentialCategory;
  username?: string;
  email?: string;
  password: string;
  url?: string;
  notes?: string;
  lastUpdated: string;
  icon?: string;
}

// ===== WEBSITE TYPES =====
export type WebsiteCategory = 'anime' | 'movies' | 'gaming' | 'productivity' | 'social' | 'news' | 'tools' | 'other';

export interface Website {
  id: string;
  name: string;
  url: string;
  category: WebsiteCategory;
  description?: string;
  favicon?: string;
  isFavorite: boolean;
  lastVisited?: string;
}

// ===== STATS TYPES =====
export interface AnimeStats {
  totalAnime: number;
  totalEpisodes: number;
  meanScore: number;
  watchStatusCounts: {
    ytw: number;
    watching: number;
    watchLater: number;
    completed: number;
    onHold: number;
    dropped: number;
  };
  airingStatusCounts: {
    yta: number;
    airing: number;
    completed: number;
  };
  genreDistribution: { name: string; value: number }[];
  scoreDistribution: { score: number; count: number }[];
  monthlyActivity: { month: string; count: number }[];
}

export interface DashboardStats {
  anime: { total: number; watching: number };
  movies: { total: number; watched: number };
  kdrama: { total: number; watching: number };
  games: { total: number; playing: number };
}

