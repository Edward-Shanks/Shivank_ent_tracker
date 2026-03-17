'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Star,
  Swords,
  Shield,
  Wind,
  Flame,
  Droplets,
  Leaf,
  Snowflake,
  Zap,
  Mountain,
  Plus,
  LayoutGrid,
  BarChart3,
  Settings,
  Edit,
  Lightbulb,
  Share2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { GenshinElement, GenshinWeapon } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ElementIcon } from '@/components/genshin/ElementIcon';
import GenshinInsights from './components/GenshinInsights';
import AddCharacterModal from './components/AddCharacterModal';
import CharacterDetailModal from './components/CharacterDetailModal';
import EditCharacterModal from './components/EditCharacterModal';
import CardCustomizationModal, { CardField } from './components/CardCustomizationModal';
import AccountEditModal from './components/AccountEditModal';

type ViewMode = 'insights' | 'collection';

const elementColors: Record<GenshinElement, string> = {
  Pyro: '#ef4444',
  Hydro: '#3b82f6',
  Anemo: '#22d3ee',
  Electro: '#a855f7',
  Dendro: '#22c55e',
  Cyro: '#93c5fd',
  Geo: '#f59e0b',
};

// Legacy icons for filter buttons (keeping for compatibility)
const elementIcons: Record<GenshinElement, React.ReactNode> = {
  Pyro: <Flame className="w-4 h-4" />,
  Hydro: <Droplets className="w-4 h-4" />,
  Anemo: <Wind className="w-4 h-4" />,
  Electro: <Zap className="w-4 h-4" />,
  Dendro: <Leaf className="w-4 h-4" />,
  Cyro: <Snowflake className="w-4 h-4" />,
  Geo: <Mountain className="w-4 h-4" />,
};

const weaponIcons: Record<GenshinWeapon, React.ReactNode> = {
  Sword: <Swords className="w-4 h-4" />,
  Claymore: <Shield className="w-4 h-4" />,
  Polearm: <Swords className="w-4 h-4" />,
  Bow: <Swords className="w-4 h-4" />,
  Catalyst: <Sparkles className="w-4 h-4" />,
};

const CARD_FIELDS_STORAGE_KEY = 'genshin_card_fields';
const DEFAULT_CARD_FIELDS: CardField[] = ['weapon', 'constellation', 'friendship'];

// Helper function to normalize element names (capitalize first letter)
const normalizeElement = (element: string): GenshinElement => {
  if (!element) return 'Pyro'; // Default fallback
  return (element.charAt(0).toUpperCase() + element.slice(1).toLowerCase()) as GenshinElement;
};

// Helper function to get element color safely
const getElementColor = (element: string): string => {
  const normalized = normalizeElement(element);
  return elementColors[normalized] || elementColors.Pyro;
};

// Helper function to get element image path
const getElementImage = (element: string): string | null => {
  const normalized = normalizeElement(element);
  const elementImageMap: Record<GenshinElement, string | null> = {
    Pyro: '/images/logo/Pyro.png',
    Hydro: '/images/logo/Hydro.png',
    Anemo: '/images/logo/Anemo.png',
    Electro: '/images/logo/Electro.png',
    Dendro: '/images/logo/Dendro.png',
    Cyro: '/images/logo/Cyro.png', // Note: database uses "Cyro" but file is "cyro"
    Geo: '/images/logo/Geo.png',
  };
  return elementImageMap[normalized] || null;
};

export default function GenshinPage() {
  const { user } = useAuth();
  const { genshinAccount, updateGenshinCharacter, deleteGenshinCharacter, updateGenshinAccount } = useData();
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  const [selectedElement, setSelectedElement] = useState<GenshinElement | 'all'>('all');
  const [coachMode, setCoachMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<import('@/types').GenshinCharacter | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [isAccountEditModalOpen, setIsAccountEditModalOpen] = useState(false);
  const [cardFields, setCardFields] = useState<CardField[]>(DEFAULT_CARD_FIELDS);
  const username = user?.username || 'Traveler';

  // Load card customization from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CARD_FIELDS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3 && parsed.length <= 4) {
          setCardFields(parsed);
        }
      } catch (e) {
        // Use default if parsing fails
      }
    }
  }, []);

  const handleCardClick = (character: import('@/types').GenshinCharacter) => {
    setSelectedCharacter(character);
    setIsDetailModalOpen(true);
  };

  const handleEdit = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedCharacter && window.confirm(`${t('genshin.deleteCharacter')} ${selectedCharacter.name}?`)) {
      try {
        await deleteGenshinCharacter(selectedCharacter.id);
        setIsDetailModalOpen(false);
        setSelectedCharacter(null);
      } catch (error) {
        console.error('Error deleting character:', error);
        alert(t('msg.failedDelete'));
      }
    }
  };

  const handleSaveEdit = async (updates: Partial<import('@/types').GenshinCharacter>) => {
    if (selectedCharacter) {
      try {
        await updateGenshinCharacter(selectedCharacter.id, updates);
        setSelectedCharacter({ ...selectedCharacter, ...updates });
      } catch (error) {
        console.error('Error updating character:', error);
        alert(t('msg.failedUpdate'));
      }
    }
  };

  const handleSaveCustomization = (fields: CardField[]) => {
    setCardFields(fields);
    localStorage.setItem(CARD_FIELDS_STORAGE_KEY, JSON.stringify(fields));
  };

  // Use default account structure if no account exists
  const account = genshinAccount || {
    uid: '',
    adventureRank: 1,
    worldLevel: 0,
    characters: [],
    primogems: 0,
    intertwined: 0,
    acquaint: 0,
  };

  const filteredCharacters = useMemo(() => {
    if (selectedElement === 'all') {
      return account.characters;
    }
    // Case-insensitive filtering to handle any case mismatches in database
    return account.characters.filter((c) => 
      c.element?.toLowerCase() === selectedElement.toLowerCase()
    );
  }, [account.characters, selectedElement]);

  // Memoize element translations to ensure they update when language changes
  const elementTranslations = useMemo(() => {
    const translations: Record<GenshinElement, string> = {} as Record<GenshinElement, string>;
    (Object.keys(elementColors) as GenshinElement[]).forEach((element) => {
      const translationKey = `element.${element.toLowerCase()}`;
      const translated = t(translationKey);
      // If translation returns the key itself (not found) or is empty, use the element name
      translations[element] = (translated && translated !== translationKey) ? translated : element;
    });
    return translations;
  }, [language, t]);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${viewMode === 'insights' ? 'bg-gradient-to-b from-background-tertiary/80 to-background' : 'bg-animated'}`}
      key={`genshin-${language}`}
    >
      {/* Insights Hero Strip - Only in Insights View */}
      {viewMode === 'insights' && (
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 h-48"
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 40%, #06b6d4 70%, #0e7490 100%)',
              opacity: 0.95,
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\' fill=\'%23fff\' fill-opacity=\'.06\'/%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
                  {t('genshin.insights')}
                </h1>
                <p className="text-white/90 mt-1 text-sm md:text-base">
                  Advanced Genshin analytics for your roster
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white text-sm font-medium"
              >
                <span className="truncate max-w-[120px]">{username}</span>
                <span className="text-white/70">·</span>
                <span>AR {account.adventureRank}</span>
                <span className="text-white/70">·</span>
                <span>{account.characters.length} characters</span>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Only in Collection View */}
      {viewMode === 'collection' && (
        <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
          {/* Background Gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #065f46 0%, #10b981 50%, #34d399 100%)',
            }}
          />
          {/* Background Image */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/images/logo/Bluebg.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'local',
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {t('genshin.collection')}
              </h1>
              <p className="text-lg text-foreground-muted mb-4">
                {account.characters.length} {t('genshin.collection')}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-sm bg-foreground/10 text-foreground backdrop-blur-sm flex items-center gap-2 group">
                  Adventure Rank {account.adventureRank}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAccountEditModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-foreground/20 rounded"
                    title={t('genshin.editAdventureRank')}
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-foreground/10 text-foreground backdrop-blur-sm flex items-center gap-2 group">
                  World Level {account.worldLevel}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAccountEditModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-foreground/20 rounded"
                    title={t('genshin.editWorldLevel')}
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {viewMode === 'collection' && (
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('genshin.collection')}
              </h1>
              <p className="text-foreground-muted mt-1">
                {account.characters.length} {t('genshin.collection')}
              </p>
            </div>
          )}
          {viewMode === 'insights' && <div />}

          {/* View Toggle & Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="glass rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('insights')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'insights'
                    ? 'text-white'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
                style={viewMode === 'insights' ? {
                  background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                } : {}}
              >
                <BarChart3 className="w-4 h-4" />
                {t('view.insights')}
              </button>
              <button
                onClick={() => setViewMode('collection')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'collection'
                    ? 'text-white'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
                style={viewMode === 'collection' ? {
                  background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                } : {}}
              >
                <LayoutGrid className="w-4 h-4" />
                {t('view.collection')}
              </button>
            </div>
            {viewMode === 'insights' && (
              <>
                <button
                  onClick={() => setCoachMode(!coachMode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    coachMode ? 'bg-amber-500/20 text-amber-600 border border-amber-500/40' : 'glass text-foreground-muted hover:text-foreground border border-foreground/10'
                  }`}
                  title="Recommended next steps based on your roster"
                >
                  <Lightbulb className="w-4 h-4" />
                  Coach
                </button>
                <Button
                  variant="secondary"
                  leftIcon={<Share2 className="w-4 h-4" />}
                  onClick={() => {
                    const event = new CustomEvent('genshin-share-insight');
                    window.dispatchEvent(event);
                  }}
                >
                  Share Insight Card
                </Button>
              </>
            )}
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
              }}
            >
              {t('genshin.addCharacter')}
            </Button>
            {viewMode === 'collection' && (
              <Button
                variant="secondary"
                leftIcon={<Settings className="w-4 h-4" />}
                onClick={() => setIsCustomizationModalOpen(true)}
                title={t('genshin.customizeCard')}
              >
                Customize
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'insights' ? (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Element Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                {(Object.keys(elementColors) as GenshinElement[]).map((element) => {
                  const elementCharacters = account.characters.filter((c) => 
                    c.element?.toLowerCase() === element.toLowerCase()
                  );
                  const totalCount = elementCharacters.length;
                  const ownedCount = elementCharacters.filter((c) => c.obtained).length;
                  const color = elementColors[element];
                  const totalInGame = 7; // approximate per element for progress bar
                  const pct = totalInGame > 0 ? Math.min(100, (totalCount / totalInGame) * 100) : 0;
                  return (
                    <motion.div
                      key={element}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="relative rounded-xl border-2 border-transparent transition-[box-shadow,border-color] duration-300 hover:shadow-lg"
                      style={{ ['--glow' as string]: color }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${color}40`;
                        e.currentTarget.style.boxShadow = `0 8px 24px ${color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <Card className="p-4 text-center relative overflow-hidden">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <div style={{ color }}>
                            {elementIcons[element]}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1" style={{ color }}>
                          {totalCount}
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">
                          {elementTranslations[element]}
                        </div>
                        <div className="text-xs text-foreground-muted mb-2">
                          {ownedCount} {t('genshin.owned')}
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <GenshinInsights coachMode={coachMode} />
            </motion.div>
          ) : (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Sticky element filter header */}
              <div className="sticky top-4 z-10 bg-animated/80 backdrop-blur-md rounded-xl px-3 sm:px-4 pt-3 pb-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedElement('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedElement === 'all'
                        ? 'text-background'
                        : 'glass text-foreground-muted hover:text-foreground'
                    }`}
                    style={selectedElement === 'all' ? {
                      backgroundColor: 'var(--foreground)',
                      color: 'var(--background)',
                    } : undefined}
                  >
                    {t('genshin.all')}
                  </button>
                  {(Object.keys(elementColors) as GenshinElement[]).map((element) => (
                    <button
                      key={element}
                      onClick={() => setSelectedElement(element)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                        selectedElement === element
                          ? 'text-white'
                          : 'glass text-foreground-muted hover:text-foreground'
                      }`}
                      style={{
                        backgroundColor: selectedElement === element ? elementColors[element] : undefined,
                      }}
                    >
                      {elementIcons[element]}
                      {elementTranslations[element]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Characters Grid with scroll */}
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-1 genshin-scroll-area">
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                >
                  {filteredCharacters.map((character, index) => (
                    <motion.div
                      key={character.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                    <Card 
                      hover 
                      className="p-0 overflow-hidden cursor-pointer flex flex-col h-full"
                      onClick={() => handleCardClick(character)}
                    >
                      {/* Character Image - fixed aspect */}
                      <div
                        className="relative aspect-[3/4] flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${getElementColor(character.element)}40 0%, ${getElementColor(character.element)}10 100%)`,
                        }}
                      >
                        {character.image && character.image.trim() ? (
                          <img
                            src={character.image}
                            alt={character.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                              style={{
                                backgroundColor: `${getElementColor(character.element)}30`,
                                color: getElementColor(character.element),
                              }}
                            >
                              {character.name.charAt(0)}
                            </div>
                          </div>
                        )}

                        {/* Rarity Stars */}
                        <div className="absolute top-2 left-2 flex">
                          {Array.from({ length: character.rarity }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 text-yellow-400 fill-yellow-400"
                            />
                          ))}
                        </div>

                        {/* Element Badge */}
                        {getElementImage(character.element) ? (
                          <div
                            className="absolute top-2 right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                            style={{ 
                              backgroundColor: 'transparent',
                              boxShadow: `0 0 15px ${getElementColor(character.element)}80`,
                            }}
                          >
                            <img
                              src={getElementImage(character.element)!}
                              alt={normalizeElement(character.element)}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className="absolute top-2 right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                            style={{ 
                              backgroundColor: getElementColor(character.element),
                              boxShadow: `0 0 15px ${getElementColor(character.element)}80`,
                            }}
                          >
                            <ElementIcon 
                              element={normalizeElement(character.element)} 
                              size={24} 
                              className="text-white"
                              style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }}
                            />
                          </div>
                        )}

                        {/* Level Badge */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded backdrop-blur-sm text-sm font-medium level-badge">
                          Lv.{character.level}
                        </div>

                        {/* Role/Tier chip - high-investment (C6 + friendship 10) gets prominent label */}
                        {character.constellation >= 6 && character.friendship >= 10 && (
                          <div
                            className="absolute bottom-2 left-2 px-2 py-1 rounded-md text-[10px] font-semibold backdrop-blur-sm border border-white/30"
                            style={{
                              backgroundColor: `${getElementColor(character.element)}cc`,
                              color: 'white',
                            }}
                          >
                            {(character.tier || character.type || 'Main').replace(/\/.*/, '')}
                          </div>
                        )}
                        {/* Subtle label for others with tier/type set */}
                        {!(character.constellation >= 6 && character.friendship >= 10) && (character.tier || character.type) && (
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium bg-foreground/20 backdrop-blur-sm text-foreground">
                            {(character.tier || character.type || '').replace(/\/.*/, '').slice(0, 12)}
                          </div>
                        )}
                      </div>

                      {/* Compact info: name + single row (weapon, Lv · F) + friendship bar */}
                      <div className="p-2.5 flex flex-col min-h-[72px] flex-1">
                        <h3 className="font-semibold text-foreground truncate text-sm">
                          {character.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-foreground-muted">
                          <span className="flex items-center gap-1">
                            {weaponIcons[character.weapon]}
                          </span>
                          <span>
                            Lv.{character.level} · F {character.friendship}/10
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-foreground/10 rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(character.friendship / 10) * 100}%`,
                              backgroundColor: getElementColor(character.element),
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Character Modal */}
      <AddCharacterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <>
          <CharacterDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedCharacter(null);
            }}
            character={selectedCharacter}
            onEdit={handleEdit}
            onDelete={handleDelete}
            elementColors={elementColors}
          />
          <EditCharacterModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCharacter(null);
            }}
            character={selectedCharacter}
            onSave={handleSaveEdit}
          />
        </>
      )}

      {/* Card Customization Modal */}
      <CardCustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={() => setIsCustomizationModalOpen(false)}
        selectedFields={cardFields}
        onSave={handleSaveCustomization}
      />

      {/* Account Edit Modal */}
      <AccountEditModal
        isOpen={isAccountEditModalOpen}
        onClose={() => setIsAccountEditModalOpen(false)}
        account={account}
        onSave={async (updates) => {
          try {
            await updateGenshinAccount(updates);
          } catch (error) {
            console.error('Error updating account:', error);
            alert('Failed to update account. Please try again.');
          }
        }}
      />
    </div>
  );
}
