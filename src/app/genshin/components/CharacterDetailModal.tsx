'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Star, Shield, Swords, Sparkles } from 'lucide-react';
import { GenshinCharacter, GenshinWeapon } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ElementIcon } from '@/components/genshin/ElementIcon';

interface CharacterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: GenshinCharacter;
  onEdit: () => void;
  onDelete: () => void;
  elementColors: Record<string, string>;
}

const weaponIcons: Record<GenshinWeapon, React.ReactNode> = {
  Sword: <Swords className="w-5 h-5" />,
  Claymore: <Shield className="w-5 h-5" />,
  Polearm: <Swords className="w-5 h-5" />,
  Bow: <Swords className="w-5 h-5" />,
  Catalyst: <Sparkles className="w-5 h-5" />,
};

export default function CharacterDetailModal({
  isOpen,
  onClose,
  character,
  onEdit,
  onDelete,
  elementColors,
}: CharacterDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="relative">
        {/* Character Image Header */}
        <div
          className="relative h-64 -mx-6 -mt-6 mb-6"
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
                className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold"
                style={{
                  backgroundColor: `${elementColors[character.element]}30`,
                  color: elementColors[character.element],
                }}
              >
                {character.name.charAt(0)}
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Character Name and Rarity */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              {Array.from({ length: character.rarity }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white">{character.name}</h2>
          </div>
        </div>

        {/* Character Details */}
        <div className="space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <div className="text-sm text-foreground-muted mb-1">Element</div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: elementColors[character.element] }}
                >
                  <ElementIcon element={character.element} size={16} className="text-white" />
                </div>
                <span className="font-semibold text-foreground">{character.element}</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="text-sm text-foreground-muted mb-1">Weapon</div>
              <div className="flex items-center gap-2">
                {weaponIcons[character.weapon]}
                <span className="font-semibold text-foreground">{character.weapon}</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="text-sm text-foreground-muted mb-1">Level</div>
              <div className="text-2xl font-bold text-foreground">Lv.{character.level}</div>
            </div>

            <div className="glass-card p-4">
              <div className="text-sm text-foreground-muted mb-1">Constellation</div>
              <div className="text-2xl font-bold text-foreground">C{character.constellation}</div>
            </div>

            <div className="glass-card p-4">
              <div className="text-sm text-foreground-muted mb-1">Friendship</div>
              <div className="text-2xl font-bold text-foreground">{character.friendship}/10</div>
              <div className="h-2 bg-foreground/10 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(character.friendship / 10) * 100}%`,
                    backgroundColor: elementColors[character.element],
                  }}
                />
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="text-sm text-foreground-muted mb-1">Rarity</div>
              <div className="flex items-center gap-1">
                {Array.from({ length: character.rarity }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="ml-2 text-foreground">{character.rarity}★</span>
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          {(character.tier || character.type || character.type2) && (
            <div className="glass-card p-4">
              <div className="text-sm text-foreground-muted mb-3">Additional Info</div>
              <div className="flex flex-wrap gap-2">
                {character.tier && (
                  <Badge variant="secondary">Tier: {character.tier}</Badge>
                )}
                {character.type && (
                  <Badge variant="secondary">Type: {character.type}</Badge>
                )}
                {character.type2 && (
                  <Badge variant="secondary">Type 2: {character.type2}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Build Notes */}
          {character.buildNotes && (
            <div className="glass-card p-4">
              <div className="text-sm text-foreground-muted mb-2">Build Notes</div>
              <p className="text-foreground whitespace-pre-wrap">{character.buildNotes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-foreground/10">
            <Button
              variant="secondary"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={onEdit}
              className="flex-1"
            >
              Edit Character
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={onDelete}
              className="flex-1"
              style={{ color: '#ef4444' }}
            >
              Delete Character
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

