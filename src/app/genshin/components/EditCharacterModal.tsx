'use client';

import React, { useState, useEffect } from 'react';
import { GenshinElement, GenshinWeapon, GenshinRarity, GenshinCharacter } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { ElementIcon } from '@/components/genshin/ElementIcon';

interface EditCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: GenshinCharacter;
  onSave: (updates: Partial<GenshinCharacter>) => void;
}

const elements: { value: GenshinElement; label: string }[] = [
  { value: 'Pyro', label: 'Pyro' },
  { value: 'Hydro', label: 'Hydro' },
  { value: 'Anemo', label: 'Anemo' },
  { value: 'Electro', label: 'Electro' },
  { value: 'Dendro', label: 'Dendro' },
  { value: 'Cyro', label: 'Cyro' },
  { value: 'Geo', label: 'Geo' },
];

const weapons: { value: GenshinWeapon; label: string }[] = [
  { value: 'Polearm', label: 'Polearm' },
  { value: 'Sword', label: 'Sword' },
  { value: 'Catalyst', label: 'Catalyst' },
  { value: 'Bow', label: 'Bow' },
  { value: 'Claymore', label: 'Claymore' },
];

const rarities: { value: string; label: string }[] = [
  { value: '4', label: '4★' },
  { value: '5', label: '5★' },
];

const elementColors: Record<GenshinElement, string> = {
  Pyro: '#ef4444',
  Hydro: '#3b82f6',
  Anemo: '#22d3ee',
  Electro: '#a855f7',
  Dendro: '#22c55e',
  Cyro: '#93c5fd',
  Geo: '#f59e0b',
};

const getElementColor = (element: GenshinElement): string => {
  return elementColors[element];
};

// Helper function to get element image path
const getElementImage = (element: GenshinElement): string | null => {
  const elementImageMap: Record<GenshinElement, string | null> = {
    Pyro: '/images/logo/Pyro.png',
    Hydro: '/images/logo/Hydro.png',
    Anemo: '/images/logo/Anemo.png',
    Electro: '/images/logo/Electro.png',
    Dendro: '/images/logo/Dendro.png',
    Cyro: '/images/logo/Cyro.png',
    Geo: '/images/logo/Geo.png',
  };
  return elementImageMap[element] || null;
};

export default function EditCharacterModal({ isOpen, onClose, character, onSave }: EditCharacterModalProps) {
  const [formData, setFormData] = useState({
    name: character.name,
    element: character.element,
    weapon: character.weapon,
    rarity: character.rarity,
    tier: character.tier || '',
    type: character.type || '',
    type2: character.type2 || '',
    level: character.level,
    obtained: character.obtained ? 'yes' as const : 'no' as const,
    constellation: character.constellation,
    image: character.image,
    friendship: character.friendship,
    buildNotes: character.buildNotes || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: character.name,
        element: character.element,
        weapon: character.weapon,
        rarity: character.rarity,
        tier: character.tier || '',
        type: character.type || '',
        type2: character.type2 || '',
        level: character.level,
        obtained: character.obtained ? 'yes' as const : 'no' as const,
        constellation: character.constellation,
        image: character.image,
        friendship: character.friendship,
        buildNotes: character.buildNotes || '',
      });
    }
  }, [character, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      element: formData.element,
      weapon: formData.weapon,
      rarity: formData.rarity,
      tier: formData.tier || undefined,
      type: formData.type || undefined,
      type2: formData.type2 || undefined,
      level: formData.level,
      obtained: formData.obtained === 'yes',
      constellation: formData.constellation,
      image: formData.image,
      friendship: formData.friendship,
      buildNotes: formData.buildNotes || undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Character" size="xl">
      <form onSubmit={handleSubmit} className="space-y-2.5 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Input
            label="Character Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Element <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: 'transparent',
                }}
              >
                {getElementImage(formData.element) ? (
                  <img
                    src={getElementImage(formData.element)!}
                    alt={formData.element}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ElementIcon
                    element={formData.element}
                    size={24}
                    className="text-foreground"
                    style={{ color: getElementColor(formData.element) }}
                  />
                )}
              </div>
              <div className="flex-1">
                <Dropdown
                  options={elements}
                  value={formData.element}
                  onChange={(value) => setFormData({ ...formData, element: value as GenshinElement })}
                  required
                />
              </div>
            </div>
          </div>
          <Input
            label="Tier"
            value={formData.tier}
            onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
          />
          <Dropdown
            label="Weapon"
            options={weapons}
            value={formData.weapon}
            onChange={(value) => setFormData({ ...formData, weapon: value as GenshinWeapon })}
            required
          />
          <Input
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
          <Input
            label="Type 2"
            value={formData.type2}
            onChange={(e) => setFormData({ ...formData, type2: e.target.value })}
          />
          <Input
            label="Character Level"
            type="number"
            min="1"
            max="90"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
            required
          />
          <Dropdown
            label="Character Owned"
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            value={formData.obtained}
            onChange={(value) => setFormData({ ...formData, obtained: value as 'yes' | 'no' })}
            required
          />
          <Input
            label="Constellation"
            type="number"
            min="0"
            max="6"
            value={formData.constellation}
            onChange={(e) => setFormData({ ...formData, constellation: parseInt(e.target.value) || 0 })}
            required
          />
          <Dropdown
            label="Rarity"
            options={rarities}
            value={formData.rarity.toString()}
            onChange={(value) => setFormData({ ...formData, rarity: parseInt(value as string) as GenshinRarity })}
            required
          />
          <Input
            label="Friendship"
            type="number"
            min="0"
            max="10"
            value={formData.friendship}
            onChange={(e) => setFormData({ ...formData, friendship: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
        <Input
          label="Image URL"
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
        />
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Build Notes
          </label>
          <textarea
            value={formData.buildNotes}
            onChange={(e) => setFormData({ ...formData, buildNotes: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-foreground/20 bg-foreground/5 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
            placeholder="Enter build notes or additional information..."
          />
        </div>
        <div className="flex gap-2 justify-end pt-3 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose} className="text-xs sm:text-sm px-3 py-1.5">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="text-xs sm:text-sm px-3 py-1.5">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

