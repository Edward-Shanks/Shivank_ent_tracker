'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export type CardField = 'weapon' | 'constellation' | 'friendship' | 'level' | 'rarity' | 'element';

interface CardCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFields: CardField[];
  onSave: (fields: CardField[]) => void;
}

const availableFields: { value: CardField; label: string; description: string }[] = [
  { value: 'weapon', label: 'Weapon', description: 'Character weapon type' },
  { value: 'constellation', label: 'Constellation', description: 'Constellation level (C0-C6)' },
  { value: 'friendship', label: 'Friendship', description: 'Friendship level with progress bar' },
  { value: 'level', label: 'Level', description: 'Character level' },
  { value: 'rarity', label: 'Rarity', description: 'Star rating' },
  { value: 'element', label: 'Element', description: 'Element type icon' },
];

export default function CardCustomizationModal({
  isOpen,
  onClose,
  selectedFields,
  onSave,
}: CardCustomizationModalProps) {
  const [fields, setFields] = useState<CardField[]>(selectedFields);

  useEffect(() => {
    setFields(selectedFields);
  }, [selectedFields, isOpen]);

  const toggleField = (field: CardField) => {
    if (fields.includes(field)) {
      if (fields.length > 1) {
        setFields(fields.filter((f) => f !== field));
      }
    } else {
      if (fields.length < 4) {
        setFields([...fields, field]);
      }
    }
  };

  const handleSave = () => {
    if (fields.length >= 3 && fields.length <= 4) {
      onSave(fields);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Card Display" size="md">
      <div className="space-y-4">
        <p className="text-sm text-foreground-muted">
          Select 3-4 fields to display on character cards. Currently selected: {fields.length}
        </p>

        <div className="space-y-2">
          {availableFields.map((field) => {
            const isSelected = fields.includes(field.value);
            const isDisabled = !isSelected && fields.length >= 4;

            return (
              <label
                key={field.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : isDisabled
                    ? 'border-foreground/10 bg-foreground/5 opacity-50 cursor-not-allowed'
                    : 'border-foreground/20 bg-foreground/5 hover:bg-foreground/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleField(field.value)}
                  disabled={isDisabled}
                  className="w-4 h-4 rounded border-foreground/20 bg-foreground/10 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{field.label}</div>
                  <div className="text-xs text-foreground-muted">{field.description}</div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    {fields.indexOf(field.value) + 1}
                  </div>
                )}
              </label>
            );
          })}
        </div>

        {fields.length < 3 && (
          <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <p className="text-sm text-yellow-400">
              Please select at least 3 fields to display on cards.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={fields.length < 3 || fields.length > 4}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </Modal>
  );
}

