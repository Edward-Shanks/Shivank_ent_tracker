'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export type AnimeCardField = 'status' | 'score' | 'episodes' | 'airingStatus' | 'watchStatus' | 'year' | 'season' | 'genres' | 'type';

interface AnimeCardCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFields: AnimeCardField[];
  onSave: (fields: AnimeCardField[]) => void;
}

const availableFields: { value: AnimeCardField; label: string; description: string }[] = [
  { value: 'status', label: 'Status', description: 'Watch status badge (Watching, Completed, etc.)' },
  { value: 'score', label: 'Score', description: 'Rating score with star icon' },
  { value: 'episodes', label: 'Episodes', description: 'Episodes watched / total episodes' },
  { value: 'airingStatus', label: 'Airing Status', description: 'Airing status (Airing, Completed, Yet To Air)' },
  { value: 'watchStatus', label: 'Watch Status', description: 'Watch status (Watching, Completed, Yet To Watch, etc.)' },
  { value: 'year', label: 'Year', description: 'Release year' },
  { value: 'season', label: 'Season', description: 'Airing season (Spring, Winter, etc.)' },
  { value: 'genres', label: 'Genres', description: 'Genre tags' },
  { value: 'type', label: 'Type', description: 'Anime type (Anime, Donghua)' },
];

export default function AnimeCardCustomizationModal({
  isOpen,
  onClose,
  selectedFields,
  onSave,
}: AnimeCardCustomizationModalProps) {
  const [fields, setFields] = useState<AnimeCardField[]>(selectedFields);

  useEffect(() => {
    setFields(selectedFields);
  }, [selectedFields, isOpen]);

  const toggleField = (field: AnimeCardField) => {
    if (fields.includes(field)) {
      if (fields.length > 1) {
        setFields(fields.filter((f) => f !== field));
      }
    } else {
      if (fields.length < 5) {
        setFields([...fields, field]);
      }
    }
  };

  const handleSave = () => {
    if (fields.length >= 4 && fields.length <= 5) {
      onSave(fields);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Anime Card Display" size="md">
      <div className="space-y-4">
        <p className="text-sm text-foreground-muted">
          Select 4-5 fields to display on anime cards. Currently selected: {fields.length}
        </p>

        <div className="space-y-2">
          {availableFields.map((field) => {
            const isSelected = fields.includes(field.value);
            const isDisabled = !isSelected && fields.length >= 5;

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

        {fields.length < 4 && (
          <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <p className="text-sm text-yellow-400">
              Please select at least 4 fields to display on cards.
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
            disabled={fields.length < 4 || fields.length > 5}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </Modal>
  );
}

