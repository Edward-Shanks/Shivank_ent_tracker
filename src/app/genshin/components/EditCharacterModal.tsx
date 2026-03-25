'use client';

import React, { useState, useEffect } from 'react';
import { GenshinElement, GenshinWeapon, GenshinRarity, GenshinCharacter } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ElementIcon } from '@/components/genshin/ElementIcon';
import { Dropdown } from '@/components/ui/Dropdown';
import { Swords, Shield, Sparkles } from 'lucide-react';

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

const elementColors: Record<GenshinElement, string> = {
  Pyro: '#ef4444',
  Hydro: '#3b82f6',
  Anemo: '#22d3ee',
  Electro: '#a855f7',
  Dendro: '#22c55e',
  Cryo: '#93c5fd',
  Geo: '#f59e0b',
};

const getElementColor = (element: GenshinElement): string => elementColors[element] ?? '#6b7280';

const getElementImage = (element: GenshinElement): string | null => {
  const elementImageMap: Record<GenshinElement, string> = {
    Pyro: '/images/logo/Pyro.png',
    Hydro: '/images/logo/Hydro.png',
    Anemo: '/images/logo/Anemo.png',
    Electro: '/images/logo/Electro.png',
    Dendro: '/images/logo/Dendro.png',
    Cryo: '/images/logo/Cryo.png',
    Geo: '/images/logo/Geo.png',
  };
  return elementImageMap[element] || null;
};

const constellationLabels: Record<number, string> = {
  0: 'C0 – Base',
  1: 'C1',
  2: 'C2 – Strong early',
  3: 'C3',
  4: 'C4',
  5: 'C5',
  6: 'C6 – Max',
};

export default function EditCharacterModal({ isOpen, onClose, character, onSave }: EditCharacterModalProps) {
  const [formData, setFormData] = useState({
    name: character.name,
    title: character.title || '',
    element: character.element,
    weapon: character.weapon,
    rarity: character.rarity,
    roles: character.roles || '',
    modelType: character.modelType || '',
    constellationName: character.constellationName || '',
    birthday: character.birthday || '',
    region: character.region || '',
    specialDish: character.specialDish || '',
    affiliations: character.affiliations || '',
    releaseDate: character.releaseDate || '',
    level: character.level,
    obtained: character.obtained,
    constellation: character.constellation,
    image: character.image,
    wishImage: character.wishImage || '',
    friendship: character.friendship,
    type: character.type || '',
    type2: character.type2 || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: character.name,
        title: character.title || '',
        element: character.element,
        weapon: character.weapon,
        rarity: character.rarity,
        roles: character.roles || '',
        modelType: character.modelType || '',
        constellationName: character.constellationName || '',
        birthday: character.birthday || '',
        region: character.region || '',
        specialDish: character.specialDish || '',
        affiliations: character.affiliations || '',
        releaseDate: character.releaseDate || '',
        level: character.level,
        obtained: character.obtained,
        constellation: character.constellation,
        image: character.image,
        wishImage: character.wishImage || '',
        friendship: character.friendship,
        type: character.type || '',
        type2: character.type2 || '',
      });
    }
  }, [character, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name.trim(),
      title: formData.title.trim() || undefined,
      element: formData.element,
      weapon: formData.weapon,
      rarity: formData.rarity,
      roles: formData.roles.trim() || undefined,
      modelType: formData.modelType.trim() || undefined,
      constellationName: formData.constellationName.trim() || undefined,
      birthday: formData.birthday.trim() || undefined,
      region: formData.region.trim() || undefined,
      specialDish: formData.specialDish.trim() || undefined,
      affiliations: formData.affiliations.trim() || undefined,
      releaseDate: formData.releaseDate.trim() || undefined,
      level: formData.level,
      obtained: formData.obtained,
      constellation: formData.constellation,
      image: formData.image.trim() || '',
      wishImage: formData.wishImage.trim() || undefined,
      friendship: formData.friendship,
      type: formData.type.trim() || undefined,
      type2: formData.type2.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Character" size="xl" scrollable={false} bodyClassName="-mt-2">
      <div
        className="nv-arcana-modal"
        style={
          {
            ['--arcana-accent' as any]: getElementColor(formData.element),
          } as React.CSSProperties
        }
      >
        <div className="nv-arcana-nebula" aria-hidden />

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Block 1: Core */}
          <div className="nv-arcana-card p-4">
            <h3 className="nv-arcana-title">Core</h3>

            <div className="grid grid-cols-1 gap-2.5">
              <Input
                label="Character Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="text-sm py-2"
              />
              <Input
                label="Character Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-sm py-2"
              />
            </div>

            <div className="mt-2.5">
              <label className="block text-xs font-medium text-foreground-muted mb-2">Rarity *</label>
              <div className="flex gap-2">
                {([4, 5] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, rarity: r as GenshinRarity })}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium ${
                      formData.rarity === r ? 'border-amber-500 bg-amber-500/20 text-amber-600' : 'border-foreground/20 text-foreground-muted'
                    }`}
                  >
                    {r}★
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <Dropdown
                label="Element"
                required
                options={elements}
                value={formData.element}
                onChange={(value) => setFormData({ ...formData, element: value as GenshinElement })}
                className="text-sm"
              />
              <Dropdown
                label="Weapon Type"
                required
                options={weapons}
                value={formData.weapon}
                onChange={(value) => setFormData({ ...formData, weapon: value as GenshinWeapon })}
                className="text-sm"
              />
            </div>

            <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <Input
                label="Roles"
                value={formData.roles}
                onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                className="text-sm py-2"
              />
              <Input
                label="Model Type"
                value={formData.modelType}
                onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
                className="text-sm py-2"
              />
              <Input
                label="Constellation Name"
                value={formData.constellationName}
                onChange={(e) => setFormData({ ...formData, constellationName: e.target.value })}
                className="text-sm py-2"
              />
              <Input
                label="Region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="text-sm py-2"
              />
            </div>
          </div>

          {/* Block 2: User Info */}
          <div className="nv-arcana-card p-4">
            <h3 className="nv-arcana-title">User Info</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-foreground-muted mb-2">Character Owned</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, obtained: true })}
                    className={`flex-1 py-1.5 rounded-lg border text-sm font-medium ${formData.obtained ? 'border-primary bg-primary/20 text-primary' : 'border-foreground/20 text-foreground-muted'}`}
                  >
                    Owned
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, obtained: false })}
                    className={`flex-1 py-1.5 rounded-lg border text-sm font-medium ${!formData.obtained ? 'border-primary bg-primary/20 text-primary' : 'border-foreground/20 text-foreground-muted'}`}
                  >
                    Not owned
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-foreground-muted mb-2">Character Level (1–90)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={90}
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                    className="nv-arcana-slider flex-1 h-2 rounded-full appearance-none"
                  />
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Math.min(90, Math.max(1, parseInt(e.target.value) || 1)) })}
                    className="w-16 rounded-lg border border-foreground/20 bg-card px-2 py-1.5 text-sm text-center"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-foreground-muted mb-2">Constellation (C0–C6)</label>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, constellation: c })}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium ${
                        formData.constellation === c ? 'border-primary bg-primary/15 text-primary' : 'border-foreground/20 text-foreground-muted'
                      }`}
                      title={constellationLabels[c]}
                    >
                      C{c}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-foreground-muted mt-1">{constellationLabels[formData.constellation]}</p>
              </div>

              <Input
                label="Friendship (0–10)"
                type="number"
                min={0}
                max={10}
                value={formData.friendship}
                onChange={(e) => setFormData({ ...formData, friendship: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                required
                className="text-sm py-2"
              />
              <div />

              <Input
                label="Role tag 1"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="text-sm py-2"
              />
              <Input
                label="Role tag 2"
                value={formData.type2}
                onChange={(e) => setFormData({ ...formData, type2: e.target.value })}
                className="text-sm py-2"
              />
            </div>
          </div>

          {/* Block 3: Cover + extra */}
          <div className="nv-arcana-card p-4">
            <h3 className="nv-arcana-title">Character Cover & Details</h3>

            <div className="rounded-2xl border border-foreground/10 bg-foreground/5 overflow-hidden">
              <div className="h-40 w-full flex items-center justify-center">
                {formData.image && formData.image.trim() ? (
                  <img
                    src={formData.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center px-4 py-6">
                    <div className="mx-auto w-14 h-14 rounded-2xl border border-foreground/15 bg-foreground/5 flex items-center justify-center">
                      <span className="text-xl font-semibold text-foreground-muted">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : '★'}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-foreground-muted">Cover image preview</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <Input
                label="Image URL (optional)"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="text-sm py-2"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Birthday"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  placeholder="MM-DD"
                  className="text-sm py-2"
                />
                <Input
                  label="Special Dish"
                  value={formData.specialDish}
                  onChange={(e) => setFormData({ ...formData, specialDish: e.target.value })}
                  className="text-sm py-2"
                />
                <Input
                  label="Affiliations"
                  value={formData.affiliations}
                  onChange={(e) => setFormData({ ...formData, affiliations: e.target.value })}
                  className="text-sm py-2"
                />
                <Input
                  label="Release Date"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className="text-sm py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-3 border-t border-foreground/10">
          <Button type="button" variant="ghost" onClick={onClose} className="text-xs sm:text-sm px-3 py-1.5">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="text-xs sm:text-sm px-3 py-1.5">
            Save Changes
          </Button>
        </div>
      </form>
      </div>
    </Modal>
  );
}

