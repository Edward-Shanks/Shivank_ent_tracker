'use client';

import React, { useState, useEffect } from 'react';
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
  Cryo: '#93c5fd',
  Geo: '#f59e0b',
};

// Legacy icons for filter buttons (keeping for compatibility)
const elementIcons: Record<GenshinElement, React.ReactNode> = {
  Pyro: <Flame className="w-4 h-4" />,
  Hydro: <Droplets className="w-4 h-4" />,
  Anemo: <Wind className="w-4 h-4" />,
  Electro: <Zap className="w-4 h-4" />,
  Dendro: <Leaf className="w-4 h-4" />,
  Cryo: <Snowflake className="w-4 h-4" />,
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

export default function GenshinPage() {
  const { genshinAccount, updateGenshinCharacter, deleteGenshinCharacter, updateGenshinAccount } = useData();
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
    if (selectedCharacter && window.confirm(`Are you sure you want to delete ${selectedCharacter.name}?`)) {
      try {
        await deleteGenshinCharacter(selectedCharacter.id);
        setIsDetailModalOpen(false);
        setSelectedCharacter(null);
      } catch (error) {
        console.error('Error deleting character:', error);
        alert('Failed to delete character. Please try again.');
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
        alert('Failed to update character. Please try again.');
      }
    }
  };

  const handleSaveCustomization = (fields: CardField[]) => {
    setCardFields(fields);
    localStorage.setItem(CARD_FIELDS_STORAGE_KEY, JSON.stringify(fields));
  };

  if (!genshinAccount) {
    return (
      <div className="min-h-screen bg-animated flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Account Linked</h2>
          <p className="text-foreground-muted">Link your Genshin Impact account to get started</p>
        </div>
      </div>
    );
  }

  const filteredCharacters = selectedElement === 'all'
    ? genshinAccount.characters
    : genshinAccount.characters.filter((c) => c.element === selectedElement);

  return (
    <div className="min-h-screen bg-animated">
      {/* Hero Section - Only in Collection View */}
      {viewMode === 'collection' && (
        <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images8.alphacoders.com/120/1208200.jpg"
              alt="Genshin Impact"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to gradient background if image fails to load
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)';
                  e.currentTarget.style.display = 'none';
                }
              }}
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Character Collection
              </h1>
              <p className="text-lg text-white/70 mb-4">
                {genshinAccount.characters.length} characters in your collection
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-sm bg-foreground/10 text-foreground backdrop-blur-sm flex items-center gap-2 group">
                  Adventure Rank {genshinAccount.adventureRank}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAccountEditModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-foreground/20 rounded"
                    title="Edit Adventure Rank"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-foreground/10 text-foreground backdrop-blur-sm flex items-center gap-2 group">
                  World Level {genshinAccount.worldLevel}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAccountEditModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-foreground/20 rounded"
                    title="Edit World Level"
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
              {viewMode === 'insights' ? 'Genshin Insights' : 'Character Collection'}
            </h1>
            <p className="text-foreground-muted mt-1">
              {viewMode === 'insights'
                ? 'Analytics and statistics for your characters'
                : `${genshinAccount.characters.length} characters in your collection`}
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
                Insights
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
                Collection
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
              Add Character
            </Button>
            {viewMode === 'collection' && (
              <Button
                variant="secondary"
                leftIcon={<Settings className="w-4 h-4" />}
                onClick={() => setIsCustomizationModalOpen(true)}
                title="Customize card display"
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
                  const elementCharacters = genshinAccount.characters.filter((c) => c.element === element);
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
                        <div className="text-sm font-medium text-foreground mb-1">{element}</div>
                        <div className="text-xs text-foreground-muted">
                          {ownedCount} owned
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
                  All
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
                    {element}
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
                          background: `linear-gradient(135deg, ${elementColors[character.element]}40 0%, ${elementColors[character.element]}10 100%)`,
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
                                backgroundColor: `${elementColors[character.element]}30`,
                                color: elementColors[character.element],
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
                        <div
                          className="absolute top-2 right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                          style={{ 
                            backgroundColor: elementColors[character.element],
                            boxShadow: `0 0 15px ${elementColors[character.element]}80`,
                          }}
                        >
                          <ElementIcon 
                            element={character.element} 
                            size={24} 
                            className="text-white"
                            style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }}
                          />
                        </div>

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
                                <span>Friendship</span>
                                <span>{character.friendship}/10</span>
                              </div>
                              <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${(character.friendship / 10) * 100}%`,
                                    backgroundColor: elementColors[character.element],
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {cardFields.includes('level') && (
                            <div className="text-xs text-foreground-muted">
                              Level: {character.level}
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
                              <ElementIcon element={character.element} size={12} style={{ color: elementColors[character.element] }} />
                              {character.element}
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
      {genshinAccount && (
        <AccountEditModal
          isOpen={isAccountEditModalOpen}
          onClose={() => setIsAccountEditModalOpen(false)}
          account={genshinAccount}
          onSave={async (updates) => {
            try {
              await updateGenshinAccount(updates);
            } catch (error) {
              console.error('Error updating account:', error);
              alert('Failed to update account. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
}
