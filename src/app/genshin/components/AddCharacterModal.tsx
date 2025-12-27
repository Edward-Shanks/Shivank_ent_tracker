'use client';

import React, { useState } from 'react';
import { GenshinElement, GenshinWeapon, GenshinRarity } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { ElementIcon } from '@/components/genshin/ElementIcon';
import { useData } from '@/context/DataContext';

interface AddCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const elements: { value: GenshinElement; label: string }[] = [
  { value: 'Pyro', label: 'Pyro' },
  { value: 'Hydro', label: 'Hydro' },
  { value: 'Anemo', label: 'Anemo' },
  { value: 'Electro', label: 'Electro' },
  { value: 'Dendro', label: 'Dendro' },
  { value: 'Cryo', label: 'Cryo' },
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
  Cryo: '#93c5fd',
  Geo: '#f59e0b',
};

const getElementColor = (element: GenshinElement): string => {
  return elementColors[element];
};

export default function AddCharacterModal({ isOpen, onClose }: AddCharacterModalProps) {
  const { addGenshinCharacter } = useData();
  const [formData, setFormData] = useState({
    name: '',
    element: 'Pyro' as GenshinElement,
    weapon: 'Polearm' as GenshinWeapon,
    rarity: 5 as GenshinRarity,
    tier: '',
    type: '',
    type2: '',
    level: 1,
    obtained: 'yes' as 'yes' | 'no',
    constellation: 0,
    image: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addGenshinCharacter({
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
      });
      // Reset form
      setFormData({
        name: '',
        element: 'Pyro',
        weapon: 'Polearm',
        rarity: 5,
        tier: '',
        type: '',
        type2: '',
        level: 1,
        obtained: 'yes',
        constellation: 0,
        image: '',
      });
      onClose();
    } catch (error) {
      console.error('Error adding character:', error);
      alert('Failed to add character. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Character" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Character Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              Element <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${getElementColor(formData.element)}20`,
                }}
              >
                <ElementIcon
                  element={formData.element}
                  size={28}
                  className="text-foreground"
                  style={{ color: getElementColor(formData.element) }}
                />
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
        </div>
        <Input
          label="Image URL"
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
        />
        <div className="flex gap-3 justify-end pt-4 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Character
          </Button>
        </div>
      </form>
    </Modal>
  );
}

