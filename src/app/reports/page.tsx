'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Filter,
  Tv,
  Film,
  Gamepad2,
  Sparkles,
  KeyRound,
  Globe,
  Trash2,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Check,
  Circle,
  ArrowLeft,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { 
  AnimeStatus, 
  GameStatus,
  GamePlatform,
  KDramaStatus, 
  MovieStatus,
  GenshinElement,
  GenshinWeapon,
  GenshinRarity,
  CredentialCategory,
  WebsiteCategory,
} from '@/types';
import * as XLSX from 'xlsx';
import ProcessFlow from './components/ProcessFlow';

type ReportCategory = 'anime' | 'shows' | 'games' | 'genshin' | 'credentials' | 'websites';

interface FilterOptions {
  status?: string;
  genre?: string;
  [key: string]: any;
}

export default function ReportsPage() {
  const { 
    anime, 
    movies, 
    kdrama, 
    games, 
    genshinAccount, 
    credentials, 
    websites,
    addAnime,
    addMovie,
    addKDrama,
    addGame,
    addGenshinCharacter,
    addCredential,
    addWebsite,
    deleteAnime,
    deleteMovie,
    deleteKDrama,
    deleteGame,
    deleteGenshinCharacter,
    deleteCredential,
    deleteWebsite,
  } = useData();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('anime');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Bulk Upload Steps
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3>(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadFileData, setUploadFileData] = useState<any[]>([]);
  const [uploadFileColumns, setUploadFileColumns] = useState<string[]>([]);
  const [uploadCategory, setUploadCategory] = useState<ReportCategory | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const categoryConfig = {
    anime: {
      icon: Tv,
      label: 'Anime',
      color: '#ef4444',
      statusOptions: [
        { value: 'all', label: 'All Anime' },
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' },
        { value: 'on-hold', label: 'On Hold' },
        { value: 'dropped', label: 'Dropped' },
        { value: 'ytw', label: 'Yet To Watch' },
        { value: 'watch-later', label: 'Watch Later' },
      ],
    },
    shows: {
      icon: Film,
      label: 'Movies & K-Drama',
      color: '#3b82f6',
      statusOptions: [
        { value: 'all', label: 'All Shows' },
        { value: 'watching', label: 'Watching' },
        { value: 'watched', label: 'Watched' },
        { value: 'completed', label: 'Completed' },
        { value: 'planning', label: 'Planning' },
        { value: 'on-hold', label: 'On Hold' },
        { value: 'dropped', label: 'Dropped' },
        { value: 'rewatching', label: 'Rewatching' },
      ],
    },
    games: {
      icon: Gamepad2,
      label: 'Games',
      color: '#22c55e',
      statusOptions: [
        { value: 'all', label: 'All Games' },
        { value: 'playing', label: 'Playing' },
        { value: 'completed', label: 'Completed' },
        { value: 'planning', label: 'Planning' },
        { value: 'on-hold', label: 'On Hold' },
        { value: 'dropped', label: 'Dropped' },
      ],
    },
    genshin: {
      icon: Sparkles,
      label: 'Genshin Impact',
      color: '#06b6d4',
      statusOptions: [
        { value: 'all', label: 'All Characters' },
        { value: 'obtained', label: 'Owned Characters' },
        { value: 'not-obtained', label: 'Not Owned' },
      ],
    },
    credentials: {
      icon: KeyRound,
      label: 'Credentials',
      color: '#f59e0b',
      statusOptions: [
        { value: 'all', label: 'All Credentials' },
        { value: 'streaming', label: 'Streaming' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'social', label: 'Social' },
        { value: 'other', label: 'Other' },
      ],
    },
    websites: {
      icon: Globe,
      label: 'Websites',
      color: '#ec4899',
      statusOptions: [
        { value: 'all', label: 'All Websites' },
        { value: 'anime', label: 'Anime' },
        { value: 'movies', label: 'Movies' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'productivity', label: 'Productivity' },
        { value: 'social', label: 'Social' },
        { value: 'news', label: 'News' },
        { value: 'tools', label: 'Tools' },
        { value: 'other', label: 'Other' },
      ],
    },
  };

  const filteredData = useMemo(() => {
    const config = categoryConfig[selectedCategory];
    let data: any[] = [];

    switch (selectedCategory) {
      case 'anime':
        data = filters.status && filters.status !== 'all'
          ? anime.filter((a) => a.status === filters.status)
          : anime;
        break;
      case 'shows':
        const allShows = [...movies, ...kdrama];
        data = filters.status && filters.status !== 'all'
          ? allShows.filter((s) => s.status === filters.status)
          : allShows;
        break;
      case 'games':
        data = filters.status && filters.status !== 'all'
          ? games.filter((g) => g.status === filters.status)
          : games;
        break;
      case 'genshin':
        if (genshinAccount) {
          if (filters.status === 'obtained') {
            data = genshinAccount.characters.filter((c) => c.obtained);
          } else if (filters.status === 'not-obtained') {
            data = genshinAccount.characters.filter((c) => !c.obtained);
          } else {
            data = genshinAccount.characters;
          }
        }
        break;
      case 'credentials':
        data = filters.status && filters.status !== 'all'
          ? credentials.filter((c) => c.category === filters.status)
          : credentials;
        break;
      case 'websites':
        data = filters.status && filters.status !== 'all'
          ? websites.filter((w) => w.category === filters.status)
          : websites;
        break;
    }

    return data;
  }, [selectedCategory, filters, anime, movies, kdrama, games, genshinAccount, credentials, websites]);

  const exportToExcel = () => {
    const config = categoryConfig[selectedCategory];
    let worksheetData: any[] = [];

    switch (selectedCategory) {
      case 'anime':
        worksheetData = filteredData.map((item) => ({
          Title: item.title,
          'Other Name': item.animeOtherName || '',
          Type: item.animeType || '',
          'Airing Status': item.airingStatus || '',
          'Watch Status': item.watchStatus || item.status,
          Episodes: item.episodes,
          'Episodes Watched': item.episodesWatched,
          Genres: item.genres?.join(', ') || '',
          'Episode On': item.episodeOn || '',
          'Website Link': item.websiteLink || '',
          Year: item.year || '',
          Season: item.season || '',
        }));
        break;
      case 'shows':
        worksheetData = filteredData.map((item) => ({
          Title: item.title,
          Type: 'year' in item ? 'K-Drama' : 'Movie',
          Status: item.status,
          Genres: item.genres?.join(', ') || '',
          Year: 'year' in item ? item.year : (item.releaseDate ? new Date(item.releaseDate).getFullYear() : ''),
          Episodes: 'episodes' in item ? item.episodes : '',
          'Episodes Watched': 'episodesWatched' in item ? item.episodesWatched : '',
          Network: 'network' in item ? item.network : '',
        }));
        break;
      case 'games':
        worksheetData = filteredData.map((item) => ({
          Title: item.title,
          Status: item.status,
          Platform: item.platform,
          Score: item.score || '',
          'Hours Played': item.hoursPlayed,
          Genres: item.genres?.join(', ') || '',
          'Release Date': item.releaseDate || '',
          Developer: item.developer || '',
          Publisher: item.publisher || '',
        }));
        break;
      case 'genshin':
        worksheetData = filteredData.map((item) => ({
          Name: item.name,
          Element: item.element,
          Weapon: item.weapon,
          Rarity: `${item.rarity}★`,
          Level: item.level,
          Constellation: item.constellation,
          Friendship: item.friendship,
          Owned: item.obtained ? 'Yes' : 'No',
          Tier: item.tier || '',
          Type: item.type || '',
          'Type 2': item.type2 || '',
        }));
        break;
      case 'credentials':
        worksheetData = filteredData.map((item) => ({
          Name: item.name,
          Category: item.category,
          Email: item.email || '',
          Username: item.username || '',
          URL: item.url || '',
          'Last Updated': new Date(item.lastUpdated).toLocaleDateString(),
        }));
        break;
      case 'websites':
        worksheetData = filteredData.map((item) => ({
          Name: item.name,
          URL: item.url,
          Category: item.category || '',
          'Last Visited': item.lastVisited ? new Date(item.lastVisited).toLocaleDateString() : '',
          Notes: item.notes || '',
        }));
        break;
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, config.label);

    const fileName = `${config.label}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleDelete = () => {
    setConfirmDeleteChecked(false);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setIsDeleteModalOpen(false);

    // Delete all filtered items
    try {
      const deleteCount = filteredData.length;
      
      switch (selectedCategory) {
        case 'anime':
          await Promise.all(filteredData.map((item: any) => deleteAnime(item.id)));
          break;
        case 'shows':
          await Promise.all(filteredData.map((item: any) => {
            if ('year' in item) {
              return deleteKDrama(item.id);
            } else {
              return deleteMovie(item.id);
            }
          }));
          break;
        case 'games':
          await Promise.all(filteredData.map((item: any) => deleteGame(item.id)));
          break;
        case 'genshin':
          if (genshinAccount) {
            await Promise.all(filteredData.map((item: any) => deleteGenshinCharacter(item.id)));
          }
          break;
        case 'credentials':
          await Promise.all(filteredData.map((item: any) => deleteCredential(item.id)));
          break;
        case 'websites':
          await Promise.all(filteredData.map((item: any) => deleteWebsite(item.id)));
          break;
      }

      // Show success animation
      setDeletedCount(deleteCount);
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
        setIsDeleting(false);
        setFilters({});
        setDeletedCount(0);
      }, 2000);
    } catch (error) {
      setIsDeleting(false);
      alert('Error deleting items. Please try again.');
    }
  };

  // Download template for selected category
  const downloadTemplate = (category: ReportCategory) => {
    const fields = getPortalFields(category);
    const headers = fields.map(f => f.label);
    
    // Create a sample row with example data
    const sampleRow: any = {};
    fields.forEach(field => {
      switch (field.field) {
        case 'title':
          sampleRow[field.label] = 'Example Title';
          break;
        case 'status':
        case 'watchStatus':
        case 'airingStatus':
          sampleRow[field.label] = category === 'anime' ? 'Watching' : category === 'games' ? 'Playing' : 'Watched';
          break;
        case 'episodes':
        case 'episodesWatched':
          sampleRow[field.label] = '12';
          break;
        case 'score':
          sampleRow[field.label] = '8.5';
          break;
        case 'genres':
          sampleRow[field.label] = 'Action, Adventure';
          break;
        case 'platform':
          sampleRow[field.label] = 'PC';
          break;
        case 'element':
          sampleRow[field.label] = 'Pyro';
          break;
        case 'weapon':
          sampleRow[field.label] = 'Sword';
          break;
        case 'rarity':
          sampleRow[field.label] = '5';
          break;
        case 'level':
          sampleRow[field.label] = '90';
          break;
        case 'constellation':
          sampleRow[field.label] = '0';
          break;
        case 'obtained':
        case 'isFavorite':
          sampleRow[field.label] = 'Yes';
          break;
        case 'name':
          sampleRow[field.label] = category === 'credentials' ? 'Example Service' : category === 'websites' ? 'Example Website' : 'Example Name';
          break;
        case 'url':
          sampleRow[field.label] = 'https://example.com';
          break;
        case 'password':
          sampleRow[field.label] = '********';
          break;
        case 'category':
          sampleRow[field.label] = 'other';
          break;
        default:
          sampleRow[field.label] = '';
      }
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, Object.values(sampleRow)]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Download file
    const categoryName = categoryConfig[category].label;
    XLSX.writeFile(workbook, `${categoryName}_Template.xlsx`);
  };

  // Get portal fields for selected category
  const getPortalFields = (category: ReportCategory): { field: string; label: string; required: boolean }[] => {
    switch (category) {
      case 'anime':
        return [
          { field: 'title', label: 'Title', required: true },
          { field: 'animeOtherName', label: 'Other Name', required: false },
          { field: 'animeType', label: 'Type', required: false },
          { field: 'airingStatus', label: 'Airing Status', required: false },
          { field: 'watchStatus', label: 'Watch Status', required: false },
          { field: 'episodes', label: 'Episodes', required: true },
          { field: 'episodesWatched', label: 'Episodes Watched', required: true },
          { field: 'status', label: 'Status', required: true },
          { field: 'genres', label: 'Genres', required: false },
          { field: 'episodeOn', label: 'Episode On', required: false },
          { field: 'websiteLink', label: 'Website Link', required: false },
          { field: 'year', label: 'Year', required: false },
          { field: 'season', label: 'Season', required: false },
        ];
      case 'shows':
        return [
          { field: 'title', label: 'Title', required: true },
          { field: 'type', label: 'Type (Movie/K-Drama)', required: false },
          { field: 'status', label: 'Status', required: true },
          { field: 'genres', label: 'Genres', required: false },
          { field: 'episodes', label: 'Episodes', required: false },
          { field: 'episodesWatched', label: 'Episodes Watched', required: false },
          { field: 'network', label: 'Network', required: false },
          { field: 'year', label: 'Year', required: false },
          { field: 'releaseDate', label: 'Release Date', required: false },
        ];
      case 'games':
        return [
          { field: 'title', label: 'Title', required: true },
          { field: 'playStatus', label: 'Play Status', required: true },
          { field: 'platform', label: 'Platform', required: true },
          { field: 'gameType', label: 'Game Type', required: false },
          { field: 'downloadUrl', label: 'Download URL', required: false },
          { field: 'genres', label: 'Genres', required: false },
          { field: 'releaseDate', label: 'Release Date', required: false },
          { field: 'notes', label: 'Notes', required: false },
        ];
      case 'genshin':
        return [
          { field: 'name', label: 'Name', required: true },
          { field: 'element', label: 'Element', required: true },
          { field: 'weapon', label: 'Weapon', required: true },
          { field: 'rarity', label: 'Rarity', required: true },
          { field: 'level', label: 'Level', required: true },
          { field: 'constellation', label: 'Constellation', required: true },
          { field: 'obtained', label: 'Owned', required: true },
          { field: 'tier', label: 'Tier', required: false },
          { field: 'type', label: 'Type', required: false },
          { field: 'type2', label: 'Type 2', required: false },
          { field: 'image', label: 'Image URL', required: false },
        ];
      case 'credentials':
        return [
          { field: 'name', label: 'Name', required: true },
          { field: 'category', label: 'Category', required: true },
          { field: 'username', label: 'Username', required: false },
          { field: 'email', label: 'Email', required: false },
          { field: 'password', label: 'Password', required: true },
          { field: 'url', label: 'URL', required: false },
          { field: 'notes', label: 'Notes', required: false },
        ];
      case 'websites':
        return [
          { field: 'name', label: 'Name', required: true },
          { field: 'url', label: 'URL', required: true },
          { field: 'category', label: 'Category', required: true },
          { field: 'isFavorite', label: 'Is Favorite', required: true },
          { field: 'description', label: 'Description', required: false },
          { field: 'favicon', label: 'Favicon', required: false },
          { field: 'lastVisited', label: 'Last Visited', required: false },
        ];
      default:
        return [];
    }
  };

  // Step 1: Handle category selection and template download
  const handleCategorySelectForUpload = (category: ReportCategory) => {
    setUploadCategory(category);
    setUploadError(null);
    // Auto-download template when category is selected
    downloadTemplate(category);
    setUploadStep(2);
  };

  // Step 2: Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!uploadCategory) {
      setUploadError('Please select a category first');
      return;
    }

    setUploadedFile(file);
    setUploadError(null);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let workbook: XLSX.WorkBook;

      if (fileExtension === 'csv') {
        const text = await file.text();
        workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(
          text.split('\n').map((row) => row.split(','))
        );
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      } else {
        const arrayBuffer = await file.arrayBuffer();
        workbook = XLSX.read(arrayBuffer, { type: 'array' });
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Get column names from first row
      const columns = Object.keys(jsonData[0] || {});
      
      setUploadFileData(jsonData);
      setUploadFileColumns(columns);
      setUploadStep(3);
    } catch (error: any) {
      setUploadError(error.message || 'Error reading file. Please check the file format.');
    }
  };

  // Helper function to map row data from template column names to field names
  const mapRowData = (row: any, category: ReportCategory): any => {
    const fields = getPortalFields(category);
    const mapped: any = {};
    
    fields.forEach(field => {
      // Map from template label to field name
      const value = row[field.label];
      if (value !== undefined && value !== null && value !== '') {
        mapped[field.field] = value;
      }
    });
    
    return mapped;
  };

  // Step 3: Confirm upload with progress tracking
  const handleConfirmUpload = async () => {
    if (!uploadCategory || !uploadFileData.length) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({ current: 0, total: uploadFileData.length });

    try {
      let uploadedCount = 0;
      const totalRows = uploadFileData.length;

      // Process rows sequentially to show progress
      for (let i = 0; i < uploadFileData.length; i++) {
        const row = uploadFileData[i];
        setUploadProgress({ current: i + 1, total: totalRows });

        try {
          const mappedRow = mapRowData(row, uploadCategory);

          switch (uploadCategory) {
            case 'anime':
              await addAnime({
                title: mappedRow.title || '',
                animeOtherName: mappedRow.animeOtherName,
                animeType: mappedRow.animeType as any,
                airingStatus: mappedRow.airingStatus as any,
                watchStatus: mappedRow.watchStatus as any,
                episodes: parseInt(mappedRow.episodes || '0'),
                episodesWatched: parseInt(mappedRow.episodesWatched || '0'),
                status: (mappedRow.status || 'watching') as AnimeStatus,
                score: mappedRow.score ? parseFloat(mappedRow.score) : undefined,
                genres: mappedRow.genres ? (Array.isArray(mappedRow.genres) ? mappedRow.genres : String(mappedRow.genres).split(',').map((g: string) => g.trim())) : [],
                episodeOn: mappedRow.episodeOn as any,
                websiteLink: mappedRow.websiteLink,
                year: mappedRow.year ? parseInt(mappedRow.year) : undefined,
                season: mappedRow.season,
                coverImage: '',
              });
              uploadedCount++;
              break;

            case 'shows':
              const type = mappedRow.type || 'Movie';
              if (type === 'K-Drama' || mappedRow.year) {
                await addKDrama({
                  title: mappedRow.title || '',
                  episodes: parseInt(mappedRow.episodes || '0'),
                  episodesWatched: parseInt(mappedRow.episodesWatched || '0'),
                  status: (mappedRow.status || 'watching') as KDramaStatus,
                  score: mappedRow.score ? parseFloat(mappedRow.score) : undefined,
                  genres: mappedRow.genres ? (Array.isArray(mappedRow.genres) ? mappedRow.genres : String(mappedRow.genres).split(',').map((g: string) => g.trim())) : [],
                  year: mappedRow.year ? parseInt(mappedRow.year) : undefined,
                  network: mappedRow.network,
                  posterImage: '',
                });
              } else {
                await addMovie({
                  title: mappedRow.title || '',
                  releaseDate: mappedRow.releaseDate || new Date().toISOString(),
                  status: (mappedRow.status || 'watched') as MovieStatus,
                  genres: mappedRow.genres ? (Array.isArray(mappedRow.genres) ? mappedRow.genres : String(mappedRow.genres).split(',').map((g: string) => g.trim())) : [],
                  posterImage: '',
                });
              }
              uploadedCount++;
              break;

            case 'games':
              await addGame({
                title: mappedRow.title || '',
                platform: mappedRow.platform ? (Array.isArray(mappedRow.platform) ? mappedRow.platform : String(mappedRow.platform).split(',').map((p: string) => p.trim() as GamePlatform)) : ['PC'],
                status: (mappedRow.status || 'playing') as GameStatus,
                gameType: mappedRow.gameType,
                downloadUrl: mappedRow.downloadUrl,
                genres: mappedRow.genres ? (Array.isArray(mappedRow.genres) ? mappedRow.genres : String(mappedRow.genres).split(',').map((g: string) => g.trim())) : [],
                releaseDate: mappedRow.releaseDate,
                notes: mappedRow.notes,
                coverImage: '',
              });
              uploadedCount++;
              break;

            case 'genshin':
              if (genshinAccount) {
                await addGenshinCharacter({
                  name: mappedRow.name || '',
                  element: (mappedRow.element || 'Pyro') as GenshinElement,
                  weapon: (mappedRow.weapon || 'Sword') as GenshinWeapon,
                  rarity: parseInt(String(mappedRow.rarity).replace('★', '') || '5') as GenshinRarity,
                  level: parseInt(mappedRow.level || '1'),
                  constellation: parseInt(mappedRow.constellation || '0'),
                  obtained: mappedRow.obtained === 'Yes' || mappedRow.obtained === true || mappedRow.obtained === 'true' || mappedRow.obtained === 'yes',
                  tier: mappedRow.tier,
                  type: mappedRow.type,
                  type2: mappedRow.type2,
                  image: mappedRow.image || mappedRow['Image URL'] || '',
                });
                uploadedCount++;
              }
              break;

            case 'credentials':
              await addCredential({
                name: mappedRow.name || '',
                category: (mappedRow.category || 'other') as CredentialCategory,
                username: mappedRow.username,
                email: mappedRow.email,
                password: mappedRow.password || '',
                url: mappedRow.url,
                notes: mappedRow.notes,
                lastUpdated: new Date().toISOString(),
              });
              uploadedCount++;
              break;

            case 'websites':
              await addWebsite({
                name: mappedRow.name || '',
                url: mappedRow.url || '',
                category: (mappedRow.category || 'other') as WebsiteCategory,
                isFavorite: mappedRow.isFavorite === 'Yes' || mappedRow.isFavorite === true || mappedRow.isFavorite === 'true' || mappedRow.isFavorite === 'yes',
                lastVisited: mappedRow.lastVisited ? new Date(mappedRow.lastVisited).toISOString() : new Date().toISOString(),
                description: mappedRow.description,
                favicon: mappedRow.favicon,
              });
              uploadedCount++;
              break;
          }
        } catch (err) {
          console.error(`Error processing row ${i + 1}:`, err);
          // Continue processing other rows even if one fails
        }
      }

      setUploadedCount(uploadedCount);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setIsUploading(false);
        setUploadedCount(0);
        setUploadProgress({ current: 0, total: 0 });
        // Reset upload state
        setUploadStep(1);
        setUploadedFile(null);
        setUploadFileData([]);
        setUploadFileColumns([]);
        setUploadCategory(null);
        setFieldMapping({});
      }, 2000);
    } catch (error: any) {
      setUploadError(error.message || 'Error uploading data. Please check your file format.');
      setIsUploading(false);
    }
  };

  // Cancel upload
  const handleCancelUpload = () => {
    setUploadStep(1);
    setUploadedFile(null);
    setUploadFileData([]);
    setUploadFileColumns([]);
    setUploadCategory(null);
    setFieldMapping({});
    setUploadError(null);
  };

  const config = categoryConfig[selectedCategory];
  const Icon = config.icon;

  // Determine current step and flow state
  const categorySelected = !!selectedCategory;
  const filtersApplied = !!filters.status && filters.status !== 'all';
  const canExport = filteredData.length > 0;

  const currentStep = categorySelected
    ? filtersApplied
      ? canExport
        ? 3
        : 2
      : 2
    : 1;

  return (
    <div className="min-h-screen bg-animated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <FileText className="w-6 h-6" style={{ color: config.color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports</h1>
              <p className="text-foreground-muted mt-1">
                Generate and download filtered reports in Excel format
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reports Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Download className="w-6 h-6" style={{ color: config.color }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  Reports Download
                  {currentStep >= 3 && canExport && (
                    <span className="text-red-500 text-lg">✓</span>
                  )}
                </h2>
                <p className="text-foreground-muted mt-1">
                  Generate and download filtered reports in Excel format
                </p>
              </div>
            </div>

            {/* Download Process Flow */}
            <div className="w-full mb-8">
              <ProcessFlow
                currentStep={currentStep}
                categorySelected={categorySelected}
                filtersApplied={filtersApplied}
                canExport={canExport}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1: Select Category */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    {currentStep >= 1 ? '✓ Select Category' : 'Select Category'}
                  </h3>
                  <div className="space-y-2">
                    {(Object.keys(categoryConfig) as ReportCategory[]).map((category) => {
                      const catConfig = categoryConfig[category];
                      const CatIcon = catConfig.icon;
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setFilters({});
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            selectedCategory === category
                              ? 'text-white'
                              : 'text-foreground-muted hover:text-foreground hover:bg-foreground/5'
                          }`}
                          style={
                            selectedCategory === category
                              ? {
                                  background: `linear-gradient(135deg, ${catConfig.color} 0%, ${catConfig.color}dd 100%)`,
                                  boxShadow: `0 0 20px ${catConfig.color}40`,
                                }
                              : {}
                          }
                        >
                          <CatIcon className="w-5 h-5" />
                          <span className="font-medium">{catConfig.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>

              {/* Step 2: Apply Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    {currentStep >= 2 ? '✓ Apply Filters' : 'Apply Filters'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted mb-2">
                        Status
                      </label>
                      <Select
                        options={config.statusOptions}
                        value={filters.status || 'all'}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      />
                    </div>
                    <div className="pt-4 border-t border-foreground/10">
                      <p className="text-sm text-foreground-muted mb-2">
                        Filtered Results: <span className="font-semibold text-foreground">{filteredData.length}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Step 3: Export Report */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    {currentStep >= 3 ? '✓ Export Report' : 'Export Report'}
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: `${config.color}10` }}>
                      <p className="text-sm text-foreground-muted mb-2">Selected Category:</p>
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                        {config.label}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: `${config.color}10` }}>
                      <p className="text-sm text-foreground-muted mb-2">Records to Export:</p>
                      <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
                    </div>
                    <Button
                      variant="primary"
                      leftIcon={<Download className="w-4 h-4" />}
                      onClick={exportToExcel}
                      disabled={filteredData.length === 0 || isDeleting}
                      className="w-full mb-3"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                      }}
                    >
                      Download Excel Report
                    </Button>
                    <Button
                      variant="secondary"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={handleDelete}
                      disabled={filteredData.length === 0 || isDeleting}
                      className="w-full"
                      style={{
                        background: filteredData.length > 0 && !isDeleting
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : undefined,
                        boxShadow: filteredData.length > 0 && !isDeleting
                          ? '0 0 20px rgba(239, 68, 68, 0.4)'
                          : undefined,
                        color: filteredData.length > 0 && !isDeleting ? 'white' : undefined,
                      }}
                    >
                      {isDeleting ? 'Deleting...' : `Delete ${filteredData.length} Record${filteredData.length !== 1 ? 's' : ''}`}
                    </Button>
                    {filteredData.length === 0 && (
                      <p className="text-xs text-foreground-muted text-center mt-3">
                        No data available
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Separator Line */}
        <div className="my-8 flex items-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        {/* Bulk Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Upload className="w-6 h-6" style={{ color: config.color }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  Bulk Upload
                  {uploadStep === 3 && uploadCategory && (
                    <span className="text-green-500 text-lg">✓</span>
                  )}
                </h2>
                <p className="text-foreground-muted mt-1">
                  Upload Excel or CSV files to bulk import data
                </p>
              </div>
            </div>

            {/* Upload Process Flow */}
            <div className="w-full mb-8">
              <div className="flex items-center justify-between relative">
                {/* Connecting Lines */}
                {[1, 2, 3].map((stepId, index) => {
                  if (index === 2) return null;
                  const isActive = stepId < uploadStep;
                  const stepWidth = 100 / 3;
                  const currentStepCenter = (index * stepWidth) + (stepWidth / 2);
                  const nextStepCenter = ((index + 1) * stepWidth) + (stepWidth / 2);
                  const lineStart = `${currentStepCenter}%`;
                  const lineWidth = `${nextStepCenter - currentStepCenter}%`;
                  
                  return (
                    <div
                      key={`upload-line-${stepId}`}
                      className="absolute top-6 h-0.5 z-0"
                      style={{
                        left: lineStart,
                        width: lineWidth,
                      }}
                    >
                      <motion.div
                        className={`h-full ${isActive ? 'bg-green-500' : 'bg-foreground/10'}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isActive ? 1 : 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        style={{ 
                          transformOrigin: 'left',
                          boxShadow: isActive ? '0 0 8px rgba(34, 197, 94, 0.3), 0 0 16px rgba(34, 197, 94, 0.2)' : 'none',
                        }}
                      />
                    </div>
                  );
                })}

                {/* Steps */}
                {[
                  { id: 1, label: 'Download Template' },
                  { id: 2, label: 'Select File' },
                  { id: 3, label: 'Upload Progress' },
                ].map((step, index) => {
                  // Step 1 is only active when file is selected, similar to Apply Filters
                  let status: 'completed' | 'active' | 'pending';
                  if (step.id < uploadStep) {
                    status = 'completed';
                  } else if (step.id === uploadStep) {
                    // Step 1 requires uploadedFile to be active
                    if (step.id === 1) {
                      status = uploadedFile ? 'active' : 'pending';
                    } else if (step.id === 2) {
                      status = uploadCategory ? 'active' : 'pending';
                    } else {
                      status = 'active';
                    }
                  } else {
                    status = 'pending';
                  }
                  
                  // Only burst when status is active (which now requires the condition to be met)
                  const isBursting = status === 'active' && uploadStep === step.id;

                  return (
                    <div
                      key={step.id}
                      className="flex flex-col items-center flex-1 relative z-10"
                    >
                      {/* Step Node */}
                      <motion.div
                        className="relative"
                        animate={
                          isBursting
                            ? {
                                scale: [1, 1.3, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 0.6,
                          repeat: isBursting ? Infinity : 0,
                          repeatDelay: 1,
                        }}
                      >
                        {/* Burst Effect */}
                        {isBursting && (
                          <>
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={`upload-burst-${i}`}
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: `radial-gradient(circle, rgba(235, 255, 251, 0.25) 0%, rgba(167, 243, 208, 0.12) 50%, transparent 70%)`,
                                  boxShadow: `0 0 8px rgba(235, 255, 251, 0.15), 0 0 16px rgba(167, 243, 208, 0.12)`,
                                }}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{
                                  scale: [0, 2.5, 3.5],
                                  opacity: [0.4, 0.2, 0],
                                  rotate: (i * 360) / 12,
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.08,
                                  ease: 'easeOut' as const,
                                }}
                              />
                            ))}
                            {/* Central Sparkle */}
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center"
                              animate={{
                                scale: [1, 1.15, 1],
                                opacity: [0.5, 0.7, 0.5],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                              }}
                            >
                              <Sparkles 
                                className="w-4 h-4" 
                                style={{ 
                                  color: '#EBFFFB',
                                  filter: 'drop-shadow(0 0 3px rgba(235, 255, 251, 0.3)) drop-shadow(0 0 6px rgba(167, 243, 208, 0.2)) drop-shadow(0 0 9px rgba(167, 243, 208, 0.1))',
                                }} 
                              />
                            </motion.div>
                          </>
                        )}

                        {/* Step Circle */}
                        <motion.div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : status === 'active'
                              ? 'bg-green-500/20 border-green-500'
                              : 'bg-foreground/5 border-foreground/20'
                          }`}
                          style={
                            status === 'active'
                              ? {
                                  boxShadow: '0 0 10px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.2)',
                                }
                              : status === 'completed'
                              ? {
                                  boxShadow: '0 0 8px rgba(34, 197, 94, 0.25)',
                                }
                              : {}
                          }
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {status === 'completed' ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : (
                            <Circle
                              className={`w-6 h-6 ${
                                status === 'active'
                                  ? 'text-green-500'
                                  : 'text-foreground-muted'
                              }`}
                              style={
                                status === 'active'
                                  ? { filter: 'drop-shadow(0 0 3px rgba(34, 197, 94, 0.4))' }
                                  : {}
                              }
                            />
                          )}
                        </motion.div>

                        {/* Pulse Effect for Active Step */}
                        {status === 'active' && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 dark:border-cyan-400/40"
                            style={{
                              borderColor: '#EBFFFB',
                              boxShadow: '0 0 8px rgba(235, 255, 251, 0.2), 0 0 16px rgba(167, 243, 208, 0.15), 0 0 24px rgba(167, 243, 208, 0.08)',
                            }}
                            animate={{
                              scale: [1, 1.5, 1.5],
                              opacity: [0.4, 0, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        )}
                      </motion.div>

                      {/* Step Label */}
                      <motion.div className="mt-3 text-center relative">
                        <p
                          className={`text-sm font-medium ${
                            status === 'active' ? 'text-foreground' : 'text-foreground-muted'
                          }`}
                        >
                          {step.label}
                        </p>
                        {/* Prompt Message for Active Step */}
                        <AnimatePresence>
                          {status === 'active' && isBursting && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.8 }}
                              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                            >
                              <motion.div
                                className="px-3 py-1.5 rounded-full text-xs font-medium text-white"
                                style={{
                                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                  boxShadow: '0 0 10px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.2)',
                                }}
                                animate={{
                                  scale: [1, 1.05, 1],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                }}
                              >
                                {step.id === 1 && 'Select category & download template ↓'}
                                {step.id === 2 && 'Select your file ↓'}
                                {step.id === 3 && 'Uploading... ↓'}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 1: Category Selection & Template Download */}
            {uploadStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    {uploadStep > 1 ? '✓ Download Template' : 'Download Template'}
                  </h3>
                  <p className="text-sm text-foreground-muted mb-4">
                    Select a category to download the template file. Fill in the template with your data, then proceed to upload.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.keys(categoryConfig) as ReportCategory[]).map((category) => {
                    const catConfig = categoryConfig[category];
                    const CatIcon = catConfig.icon;
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategorySelectForUpload(category)}
                        className={`p-4 rounded-lg text-left transition-all ${
                          uploadCategory === category
                            ? 'text-white'
                            : 'text-foreground-muted hover:text-foreground hover:bg-white/5'
                        }`}
                        style={
                          uploadCategory === category
                            ? {
                                background: `linear-gradient(135deg, ${catConfig.color} 0%, ${catConfig.color}dd 100%)`,
                                boxShadow: `0 0 20px ${catConfig.color}40`,
                              }
                            : {}
                        }
                      >
                        <CatIcon className="w-6 h-6 mb-2" />
                        <p className="font-medium text-sm">{catConfig.label}</p>
                        <p className="text-xs mt-1 opacity-75">Click to download template</p>
                      </button>
                    );
                  })}
                  </div>
                  {uploadCategory && (
                    <div className="p-4 rounded-lg glass-card mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <p className="text-sm font-medium text-foreground">
                          Template downloaded! Now select your file to upload.
                        </p>
                      </div>
                      <p className="text-xs text-foreground-muted">
                        Category: {categoryConfig[uploadCategory].label}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Step 2: File Selection */}
            {uploadStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      variant="secondary"
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                      onClick={() => {
                        setUploadStep(1);
                        setUploadedFile(null);
                        setUploadFileData([]);
                        setUploadFileColumns([]);
                      }}
                      className="flex-shrink-0"
                    >
                      Back
                    </Button>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      {uploadStep > 2 ? '✓ Select File' : 'Select File'}
                    </h3>
                  </div>
                  {uploadCategory && (() => {
                    const CatIcon = categoryConfig[uploadCategory].icon;
                    return (
                      <div className="p-4 rounded-lg glass-card mb-4">
                        <p className="text-sm text-foreground-muted mb-1">Selected Category:</p>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          <CatIcon className="w-4 h-4" style={{ color: categoryConfig[uploadCategory].color }} />
                          {categoryConfig[uploadCategory].label}
                        </p>
                      </div>
                    );
                  })()}
                  <div className="p-6 rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 transition-colors">
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-foreground-muted" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-foreground font-medium">Click to upload</span>
                      <span className="text-foreground-muted"> or drag and drop</span>
                    </label>
                    <p className="text-sm text-foreground-muted mt-2">
                      Excel (.xlsx, .xls) or CSV files only
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </div>
                  </div>
                  {uploadedFile && (
                    <div className="p-4 rounded-lg glass-card mt-4">
                      <p className="text-sm text-foreground-muted mb-1">Selected File:</p>
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-xs text-foreground-muted mt-1">
                        {(uploadedFile.size / 1024).toFixed(2)} KB • {uploadFileData.length} rows found
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Step 3: Upload Progress */}
            {uploadStep === 3 && uploadCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      variant="secondary"
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                      onClick={() => {
                        if (!isUploading) {
                          setUploadStep(2);
                        }
                      }}
                      className="flex-shrink-0"
                      disabled={isUploading}
                    >
                      Back
                    </Button>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Progress
                    </h3>
                  </div>

                  {uploadedFile && (
                    <div className="p-4 rounded-lg glass-card mb-4">
                      <p className="text-sm text-foreground-muted mb-1">File:</p>
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-xs text-foreground-muted mt-1">
                        {uploadFileData.length} rows to upload
                      </p>
                    </div>
                  )}

                  {!isUploading ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg glass-card">
                        <p className="text-sm text-foreground-muted mb-2">Ready to upload:</p>
                        <p className="text-2xl font-bold text-foreground">{uploadFileData.length}</p>
                        <p className="text-xs text-foreground-muted mt-1">rows will be processed</p>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-foreground/10">
                        <Button
                          variant="secondary"
                          onClick={handleCancelUpload}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          leftIcon={<Upload className="w-4 h-4" />}
                          onClick={handleConfirmUpload}
                          className="flex-1"
                          style={{
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)',
                          }}
                        >
                          Start Upload
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 rounded-lg glass-card">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-foreground-muted mb-1">Uploading...</p>
                            <p className="text-2xl font-bold text-foreground">
                              {uploadProgress.current} / {uploadProgress.total}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-foreground-muted mb-1">Remaining</p>
                            <p className="text-2xl font-bold text-foreground">
                              {uploadProgress.total - uploadProgress.current}
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-foreground/10 rounded-full h-3 overflow-hidden mb-2">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-green-400"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${(uploadProgress.current / uploadProgress.total) * 100}%` 
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        
                        <p className="text-xs text-foreground-muted text-center">
                          {Math.round((uploadProgress.current / uploadProgress.total) * 100)}% complete
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3 p-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                        >
                          <Upload className="w-6 h-6 text-green-500" />
                        </motion.div>
                        <p className="text-foreground-muted">Processing rows...</p>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {uploadError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 mt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-400">{uploadError}</p>
                </div>
              </div>
            )}

          </Card>
        </motion.div>

        {/* Delete Success Animation */}
        <AnimatePresence>
          {deleteSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                className="glass-card p-8 rounded-2xl text-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  backdropFilter: 'blur(20px)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
              >
                <motion.div
                  animate={{
                    scale: [0, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 0.8,
                  }}
                >
                  <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Deleted Successfully!
                </h3>
                <p className="text-foreground-muted">
                  {deletedCount} record{deletedCount !== 1 ? 's' : ''} removed
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Success Animation */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                className="glass-card p-8 rounded-2xl text-center"
                style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  backdropFilter: 'blur(20px)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
              >
                <motion.div
                  animate={{
                    scale: [0, 1.2, 1],
                    rotate: [0, -180, 360],
                  }}
                  transition={{
                    duration: 0.8,
                  }}
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Upload Successful!
                </h3>
                <p className="text-foreground-muted">
                  {uploadedCount} record{uploadedCount !== 1 ? 's' : ''} imported
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setConfirmDeleteChecked(false);
        }}
        title="Confirm Deletion"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">
                Are you sure you want to delete {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}?
              </p>
              <p className="text-sm text-foreground-muted mt-1">
                This action cannot be undone. All filtered {config.label.toLowerCase()} will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg glass-card">
            <p className="text-sm text-foreground-muted mb-2">Selected Category:</p>
            <p className="font-semibold text-foreground flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color: config.color }} />
              {config.label}
            </p>
            {filters.status && filters.status !== 'all' && (
              <>
                <p className="text-sm text-foreground-muted mb-2 mt-3">Filter:</p>
                <p className="font-semibold text-foreground">
                  {config.statusOptions.find((opt) => opt.value === filters.status)?.label || filters.status}
                </p>
              </>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmDeleteChecked}
                onChange={(e) => setConfirmDeleteChecked(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-foreground/30 bg-foreground/10 text-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0 accent-red-500"
              />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">
                  I understand this action cannot be undone
                </p>
                <p className="text-sm text-foreground-muted">
                  By checking this box, I confirm that I want to permanently delete {filteredData.length} record{filteredData.length !== 1 ? 's' : ''} from {config.label.toLowerCase()}.
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-foreground/10">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setConfirmDeleteChecked(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={confirmDelete}
              disabled={!confirmDeleteChecked}
              className="flex-1"
              style={{
                background: confirmDeleteChecked
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                boxShadow: confirmDeleteChecked
                  ? '0 0 20px rgba(239, 68, 68, 0.4)'
                  : 'none',
                opacity: confirmDeleteChecked ? 1 : 0.5,
                cursor: confirmDeleteChecked ? 'pointer' : 'not-allowed',
              }}
            >
              Delete {filteredData.length} Record{filteredData.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

