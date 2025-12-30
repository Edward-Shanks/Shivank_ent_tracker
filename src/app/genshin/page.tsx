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
} from 'lucide-react';
import { useData } from '@/context/DataContext';
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
    Cyro: '/images/logo/Cryo.png', // Note: database uses "Cyro" but file is "Cryo"
    Geo: '/images/logo/Geo.png',
  };
  return elementImageMap[normalized] || null;
};

export default function GenshinPage() {
  const { genshinAccount, updateGenshinCharacter, deleteGenshinCharacter, updateGenshinAccount } = useData();
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  const [selectedElement, setSelectedElement] = useState<GenshinElement | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<import('@/types').GenshinCharacter | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [isAccountEditModalOpen, setIsAccountEditModalOpen] = useState(false);
  const [cardFields, setCardFields] = useState<CardField[]>(DEFAULT_CARD_FIELDS);

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
    <div className="min-h-screen bg-animated" key={`genshin-${language}`}>
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
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('genshin.collection')}
              </h1>
              <p className="text-lg text-white/70 mb-4">
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {viewMode === 'insights' ? t('genshin.insights') : t('genshin.collection')}
            </h1>
            <p className="text-foreground-muted mt-1">
              {viewMode === 'insights'
                ? t('genshin.insights')
                : `${account.characters.length} ${t('genshin.collection')}`}
            </p>
          </div>

          {/* View Toggle & Add Button */}
          <div className="flex items-center gap-2">
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
                  // Case-insensitive filtering for element stats
                  const elementCharacters = account.characters.filter((c) => 
                    c.element?.toLowerCase() === element.toLowerCase()
                  );
                  const totalCount = elementCharacters.length;
                  const ownedCount = elementCharacters.filter((c) => c.obtained).length;
                  
                  return (
                    <motion.div
                      key={element}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card hover className="p-4 text-center">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                          style={{ backgroundColor: `${elementColors[element]}20` }}
                        >
                          <div style={{ color: elementColors[element] }}>
                            {elementIcons[element]}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1" style={{ color: elementColors[element] }}>
                          {totalCount}
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">
                          {elementTranslations[element]}
                        </div>
                        <div className="text-xs text-foreground-muted">
                          {ownedCount} {t('genshin.owned')}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <GenshinInsights />
            </motion.div>
          ) : (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8"
              style={{
                backgroundColor: 'transparent',
                minHeight: 'calc(100vh - 200px)',
              }}
            >
              {/* Element Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
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

              {/* Characters Grid */}
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
                      className="p-0 overflow-hidden cursor-pointer"
                      onClick={() => handleCardClick(character)}
                    >
                      {/* Character Image */}
                      <div
                        className="relative aspect-[3/4]"
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
                      </div>

                      {/* Character Info */}
                      <div className="p-3">
                        <h3 className="font-semibold text-foreground truncate">
                          {character.name}
                        </h3>
                        <div className="mt-2 space-y-2">
                          {cardFields.includes('weapon') && (
                            <div className="flex items-center gap-1 text-sm text-foreground-muted">
                              {weaponIcons[character.weapon]}
                              {character.weapon}
                            </div>
                          )}
                          {cardFields.includes('constellation') && (
                            <div className="flex items-center justify-end">
                              <Badge size="sm" variant="secondary">
                                C{character.constellation}
                              </Badge>
                            </div>
                          )}
                          {cardFields.includes('friendship') && (
                            <div>
                              <div className="flex justify-between text-xs text-foreground-muted mb-1">
                                <span>{t('genshin.friendship')}</span>
                                <span>{character.friendship}/10</span>
                              </div>
                              <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${(character.friendship / 10) * 100}%`,
                                    backgroundColor: getElementColor(character.element),
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {cardFields.includes('level') && (
                            <div className="text-xs text-foreground-muted">
                              {t('genshin.level')}: {character.level}
                            </div>
                          )}
                          {cardFields.includes('rarity') && (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: character.rarity }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                          )}
                          {cardFields.includes('element') && (
                            <div className="flex items-center gap-1 text-xs text-foreground-muted">
                              {getElementImage(character.element) ? (
                                <div className="w-3 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'transparent' }}>
                                  <img
                                    src={getElementImage(character.element)!}
                                    alt={normalizeElement(character.element)}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <ElementIcon element={normalizeElement(character.element)} size={12} style={{ color: getElementColor(character.element) }} />
                              )}
                              {elementTranslations[normalizeElement(character.element)]}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
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
