import { pgTable, text, integer, real, boolean, timestamp } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Anime table
export const anime = pgTable('anime', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  titleJapanese: text('title_japanese'),
  animeOtherName: text('anime_other_name'),
  animeType: text('anime_type'), // 'Anime' | 'Donghua'
  airingStatus: text('airing_status'), // 'YTA' | 'Airing' | 'Completed'
  watchStatus: text('watch_status').notNull(), // 'YTW' | 'Watching' | 'Watch Later' | 'Completed' | 'On Hold' | 'Dropped'
  websiteLink: text('website_link'),
  episodeOn: text('episode_on'), // Day of week
  coverImage: text('cover_image').notNull(),
  bannerImage: text('banner_image'),
  episodes: integer('episodes').notNull().default(0),
  episodesWatched: integer('episodes_watched').notNull().default(0),
  score: integer('score'), // 1-10
  genres: text('genres').notNull().default('[]'), // JSON array
  synopsis: text('synopsis'),
  season: text('season'),
  year: integer('year'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Movies table
export const movies = pgTable('movies', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  posterImage: text('poster_image').notNull(),
  backdropImage: text('backdrop_image'),
  releaseDate: text('release_date').notNull(),
  status: text('status').notNull(), // 'watched' | 'planning' | 'rewatching'
  reviewType: text('review_type'), // 'Good' | 'Okay' | 'Onetime watch' | 'Not Good'
  genres: text('genres').notNull().default('[]'), // JSON array
  synopsis: text('synopsis'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// K-Drama table
export const kdrama = pgTable('kdrama', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  titleKorean: text('title_korean'),
  posterImage: text('poster_image').notNull(),
  episodes: integer('episodes').notNull().default(0),
  episodesWatched: integer('episodes_watched').notNull().default(0),
  status: text('status').notNull(), // 'watching' | 'completed' | 'planning' | 'dropped' | 'on-hold'
  score: integer('score'), // 1-10
  genres: text('genres').notNull().default('[]'), // JSON array
  synopsis: text('synopsis'),
  network: text('network'),
  year: integer('year'),
  cast: text('cast'), // JSON array
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Games table
export const games = pgTable('games', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  coverImage: text('cover_image').notNull(),
  platform: text('platform').notNull().default('[]'), // JSON array
  status: text('status').notNull(), // 'playing' | 'completed' | 'planning' | 'dropped' | 'on-hold'
  gameType: text('game_type'), // Game type/category
  downloadUrl: text('download_url'), // Download URL
  genres: text('genres').notNull().default('[]'), // JSON array
  releaseDate: text('release_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Genshin Accounts table
export const genshinAccounts = pgTable('genshin_accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  uid: text('uid').notNull(),
  adventureRank: integer('adventure_rank').notNull().default(1),
  worldLevel: integer('world_level').notNull().default(0),
  primogems: integer('primogems').notNull().default(0),
  intertwined: integer('intertwined').notNull().default(0),
  acquaint: integer('acquaint').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Genshin Characters table
export const genshinCharacters = pgTable('genshin_characters', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => genshinAccounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  element: text('element').notNull(), // 'Pyro' | 'Hydro' | 'Anemo' | 'Electro' | 'Dendro' | 'Cryo' | 'Geo'
  weapon: text('weapon').notNull(), // 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst'
  rarity: integer('rarity').notNull(), // 4 | 5
  constellation: integer('constellation').notNull().default(0),
  level: integer('level').notNull().default(1),
  friendship: integer('friendship').notNull().default(0),
  image: text('image').notNull(),
  obtained: boolean('obtained').notNull().default(true),
  tier: text('tier'),
  type: text('type'),
  type2: text('type2'),
  buildNotes: text('build_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Credentials table
export const credentials = pgTable('credentials', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'streaming' | 'gaming' | 'social' | 'email' | 'finance' | 'shopping' | 'other'
  username: text('username'),
  email: text('email'),
  password: text('password').notNull(),
  url: text('url'),
  notes: text('notes'),
  icon: text('icon'),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Websites table
export const websites = pgTable('websites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  category: text('category').notNull(), // 'anime' | 'movies' | 'gaming' | 'productivity' | 'social' | 'news' | 'tools' | 'other'
  description: text('description'),
  favicon: text('favicon'),
  isFavorite: boolean('is_favorite').notNull().default(false),
  lastVisited: timestamp('last_visited'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
