'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export type AnimeCardField = 'watchStatus' | 'score' | 'episodes' | 'airingStatus' | 'year' | 'season' | 'genres' | 'type';

interface AnimeCardCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFields: AnimeCardField[];
  onSave: (fields: AnimeCardField[]) => void;
}

// These will be created inside component to use translations

export default function AnimeCardCustomizationModal({
  isOpen,
  onClose,
  selectedFields,
  onSave,
}: AnimeCardCustomizationModalProps) {
  const { t } = useLanguage();
  const [fields, setFields] = useState<AnimeCardField[]>(selectedFields);

  const availableFields: { value: AnimeCardField; label: string; description: string }[] = [
    { value: 'watchStatus', label: t('anime.watchStatus'), description: t('anime.watchStatusBadge') },
    { value: 'score', label: t('anime.score'), description: 'Rating score with star icon' },
    { value: 'episodes', label: t('anime.episodesLabel'), description: 'Episodes watched / total episodes' },
    { value: 'airingStatus', label: t('anime.airingStatus'), description: t('anime.airingStatusDesc') },
    { value: 'year', label: t('anime.year'), description: 'Release year' },
    { value: 'season', label: t('anime.season'), description: t('anime.seasonDesc') },
    { value: 'genres', label: t('anime.genres'), description: t('anime.genresDesc') },
    { value: 'type', label: t('anime.type'), description: t('anime.typeDesc') },
  ];

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
    <Modal isOpen={isOpen} onClose={onClose} title={t('anime.customizeCardDisplay')} size="md">
      <div className="space-y-4">
        <p className="text-sm text-foreground-muted">
          {t('anime.selectFieldsToDisplay')} {fields.length}
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
              {t('anime.selectAtLeast4Fields')}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={fields.length < 4 || fields.length > 5}
          >
            {t('anime.savePreferences')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

