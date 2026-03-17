'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GenshinElement, GenshinWeapon, GenshinRarity } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ElementIcon } from '@/components/genshin/ElementIcon';
import { useData } from '@/context/DataContext';
import { Swords, Shield, Sparkles } from 'lucide-react';

const GENSHIN_LAST_USED_KEY = 'nv_genshin_last_used';

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
  { value: 'Sword', label: 'Sword' },
  { value: 'Claymore', label: 'Claymore' },
  { value: 'Polearm', label: 'Polearm' },
  { value: 'Bow', label: 'Bow' },
  { value: 'Catalyst', label: 'Catalyst' },
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

const tierOptions = [
  { value: '', label: '—' },
  { value: 'Main DPS', label: 'Main DPS' },
  { value: 'Sub DPS', label: 'Sub DPS' },
  { value: 'Support', label: 'Support' },
  { value: 'Healer', label: 'Healer' },
  { value: 'Flex', label: 'Flex' },
  { value: 'SS', label: 'SS' },
  { value: 'S', label: 'S' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
];

const constellationLabels: Record<number, string> = {
  0: 'C0 – Base',
  1: 'C1',
  2: 'C2 – Strong early',
  3: 'C3',
  4: 'C4',
  5: 'C5',
  6: 'C6 – Max',
};

// Quick-add templates (admin can replace with API later)
const characterTemplates = [
  { name: 'Raiden Shogun', element: 'Electro' as GenshinElement, weapon: 'Polearm' as GenshinWeapon, rarity: 5 as GenshinRarity, image: '' },
  { name: 'Nahida', element: 'Dendro' as GenshinElement, weapon: 'Catalyst' as GenshinWeapon, rarity: 5 as GenshinRarity, image: '' },
  { name: 'Zhongli', element: 'Geo' as GenshinElement, weapon: 'Polearm' as GenshinWeapon, rarity: 5 as GenshinRarity, image: '' },
  { name: 'Furina', element: 'Hydro' as GenshinElement, weapon: 'Sword' as GenshinWeapon, rarity: 5 as GenshinRarity, image: '' },
  { name: 'Kazuha', element: 'Anemo' as GenshinElement, weapon: 'Sword' as GenshinWeapon, rarity: 5 as GenshinRarity, image: '' },
  { name: 'Hu Tao', element: 'Pyro' as GenshinElement, weapon: 'Polearm' as GenshinWeapon, rarity: 5 as GenshinRarity, image: '' },
  { name: 'Yelan', element: 'Hydro' as GenshinElement, weapon: 'Bow' as GenshinWeapon, rarity: 5 as GenshinRarity, image: '' },
  { name: 'Xingqiu', element: 'Hydro' as GenshinElement, weapon: 'Sword' as GenshinWeapon, rarity: 4 as GenshinRarity, image: '' },
  { name: 'Bennett', element: 'Pyro' as GenshinElement, weapon: 'Sword' as GenshinWeapon, rarity: 4 as GenshinRarity, image: '' },
  { name: 'Xiangling', element: 'Pyro' as GenshinElement, weapon: 'Polearm' as GenshinWeapon, rarity: 4 as GenshinRarity, image: '' },
];

const getElementColor = (element: GenshinElement): string => elementColors[element] ?? '#6b7280';

function getLastUsed(): { element: GenshinElement; weapon: GenshinWeapon; rarity: GenshinRarity; tier: string } {
  if (typeof window === 'undefined') return { element: 'Pyro', weapon: 'Sword', rarity: 5, tier: '' };
  try {
    const raw = localStorage.getItem(GENSHIN_LAST_USED_KEY);
    if (!raw) return { element: 'Pyro', weapon: 'Sword', rarity: 5, tier: '' };
    const d = JSON.parse(raw);
    return {
      element: (d.element && elements.some((e) => e.value === d.element)) ? d.element : 'Pyro',
      weapon: (d.weapon && weapons.some((w) => w.value === d.weapon)) ? d.weapon : 'Sword',
      rarity: d.rarity === 4 || d.rarity === 5 ? d.rarity : 5,
      tier: d.tier || '',
    };
  } catch {
    return { element: 'Pyro', weapon: 'Sword', rarity: 5, tier: '' };
  }
}

function defaultForm() {
  const last = getLastUsed();
  return {
    name: '',
    element: last.element,
    weapon: last.weapon,
    rarity: last.rarity,
    tier: last.tier,
    type: '',
    type2: '',
    level: 1,
    friendship: 0,
    obtained: true,
    constellation: 0,
    image: '',
  };
}

export default function AddCharacterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addGenshinCharacter } = useData();
  const [formData, setFormData] = useState(() => defaultForm());
  const addAnotherRef = useRef(false);

  useEffect(() => {
    if (isOpen) setFormData(defaultForm());
  }, [isOpen]);

  const saveLastUsed = () => {
    try {
      localStorage.setItem(GENSHIN_LAST_USED_KEY, JSON.stringify({
        element: formData.element,
        weapon: formData.weapon,
        rarity: formData.rarity,
        tier: formData.tier || undefined,
      }));
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addGenshinCharacter({
        name: formData.name.trim(),
        element: formData.element,
        weapon: formData.weapon,
        rarity: formData.rarity,
        tier: formData.tier || undefined,
        type: formData.type || undefined,
        type2: formData.type2 || undefined,
        level: formData.level,
        friendship: formData.friendship,
        obtained: formData.obtained,
        constellation: formData.constellation,
        image: formData.image.trim() || '',
      });
      saveLastUsed();
      if (addAnotherRef.current) {
        addAnotherRef.current = false;
        setFormData({ ...defaultForm(), name: '', level: 1, constellation: 0, friendship: 0, image: '' });
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error('Error adding character:', err);
      alert(err?.message || 'Failed to add character.');
    }
  };

  const applyTemplate = (t: typeof characterTemplates[0]) => {
    setFormData((prev) => ({
      ...prev,
      name: t.name,
      element: t.element,
      weapon: t.weapon,
      rarity: t.rarity,
      image: t.image || prev.image,
    }));
  };

  const levelChips = [20, 40, 60, 80, 90];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Character" size="xl">
      <p className="text-sm text-foreground-muted mb-4">
        Add or edit a character in your personal collection. Only a few fields are required.
      </p>
      <p className="text-xs text-foreground-muted mb-4">Fields marked * are required.</p>

      {/* Quick add from template */}
      <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <label className="block text-xs font-semibold text-foreground mb-2">Quick add from template</label>
        <select
          className="w-full rounded-lg border border-foreground/20 bg-card px-3 py-2 text-sm text-foreground"
          value=""
          onChange={(e) => {
            const v = e.target.value;
            const t = characterTemplates.find((c) => c.name === v);
            if (t) applyTemplate(t);
          }}
        >
          <option value="">Choose a character to prefill…</option>
          {characterTemplates.map((t) => (
            <option key={t.name} value={t.name}>{t.name} ({t.element}, {t.weapon}, {t.rarity}★)</option>
          ))}
        </select>
      </div>

      <form id="genshin-add-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Core info */}
          <div className="rounded-2xl border border-foreground/10 bg-card/50 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-foreground/10 pb-2">Core info</h3>
            <Input
              label="Character Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Official in-game name"
              required
            />
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Element *</label>
              <div className="flex flex-wrap gap-1.5">
                {elements.map((el) => (
                  <button
                    key={el.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, element: el.value })}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      formData.element === el.value
                        ? 'border-current text-white'
                        : 'border-foreground/20 text-foreground-muted hover:border-foreground/40'
                    }`}
                    style={formData.element === el.value ? { backgroundColor: getElementColor(el.value) } : {}}
                  >
                    <ElementIcon element={el.value} size={16} style={{ color: formData.element === el.value ? '#fff' : getElementColor(el.value) }} />
                    {el.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Rarity *</label>
              <div className="flex gap-2">
                {([4, 5] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, rarity: r })}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium ${
                      formData.rarity === r ? 'border-amber-500 bg-amber-500/20 text-amber-600' : 'border-foreground/20 text-foreground-muted'
                    }`}
                  >
                    {'★'.repeat(r)} {r}★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Character Owned *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, obtained: true })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium ${formData.obtained ? 'border-primary bg-primary/20 text-primary' : 'border-foreground/20 text-foreground-muted'}`}
                >
                  Owned
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, obtained: false })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium ${!formData.obtained ? 'border-primary bg-primary/20 text-primary' : 'border-foreground/20 text-foreground-muted'}`}
                >
                  Not owned
                </button>
              </div>
              <p className="text-xs text-foreground-muted mt-1">Only owned characters appear in some insights.</p>
            </div>
          </div>

          {/* Right: Build */}
          <div className="rounded-2xl border border-foreground/10 bg-card/50 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-foreground/10 pb-2">Build</h3>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Weapon *</label>
              <div className="flex flex-wrap gap-2">
                {weapons.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, weapon: w.value })}
                    className={`p-2.5 rounded-xl border transition-all ${
                      formData.weapon === w.value ? 'border-primary bg-primary/15' : 'border-foreground/20 hover:border-foreground/40'
                    }`}
                    title={w.label}
                  >
                    {w.value === 'Sword' && <Swords className="w-5 h-5 text-foreground-muted" />}
                    {w.value === 'Claymore' && <Shield className="w-5 h-5 text-foreground-muted" />}
                    {w.value === 'Polearm' && <Swords className="w-5 h-5 text-foreground-muted" />}
                    {w.value === 'Bow' && <Swords className="w-5 h-5 text-foreground-muted" />}
                    {w.value === 'Catalyst' && <Sparkles className="w-5 h-5 text-foreground-muted" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-foreground-muted mt-1">{weapons.find((w) => w.value === formData.weapon)?.label}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Character Level (1–90)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={90}
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                  className="flex-1 h-2 rounded-full appearance-none bg-foreground/10 accent-primary"
                />
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: Math.min(90, Math.max(1, parseInt(e.target.value) || 1)) })}
                  className="w-14 rounded-lg border border-foreground/20 bg-card px-2 py-1.5 text-sm text-center"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {levelChips.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData({ ...formData, level: n })}
                    className={`px-2 py-1 rounded text-xs font-medium ${formData.level === n ? 'bg-primary/20 text-primary' : 'bg-foreground/10 text-foreground-muted hover:bg-foreground/15'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Constellation (C0–C6)</label>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, constellation: c })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium ${
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
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Friendship (0–10)</label>
              <input
                type="number"
                min={0}
                max={10}
                value={formData.friendship}
                onChange={(e) => setFormData({ ...formData, friendship: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                className="w-full rounded-lg border border-foreground/20 bg-card px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Role / Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full rounded-lg border border-foreground/20 bg-card px-3 py-2 text-sm text-foreground"
              >
                {tierOptions.map((o) => (
                  <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Metadata - full width */}
        <div className="rounded-2xl border border-foreground/10 bg-card/50 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-foreground/10 pb-2">Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Role tag 1 (optional)"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="e.g. Team role"
            />
            <Input
              label="Role tag 2 (optional)"
              value={formData.type2}
              onChange={(e) => setFormData({ ...formData, type2: e.target.value })}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Image URL (optional)"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Paste render or card art URL"
              />
              <p className="text-xs text-foreground-muted mt-1">Paste render or card art URL (optional).</p>
            </div>
            <div className="w-24 h-32 rounded-xl border border-foreground/20 bg-foreground/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {formData.image && formData.image.trim() ? (
                <img src={formData.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl font-bold text-foreground-muted"
                  style={{ backgroundColor: `${getElementColor(formData.element)}20`, color: getElementColor(formData.element) }}
                >
                  {formData.name ? formData.name.charAt(0) : '?'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-foreground/10">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              addAnotherRef.current = true;
              const form = document.getElementById('genshin-add-form') as HTMLFormElement | null;
              if (!form) return;
              if (typeof form.requestSubmit === 'function') {
                form.requestSubmit();
              } else {
                form.submit();
              }
            }}
          >
            Save & add another
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save character
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
