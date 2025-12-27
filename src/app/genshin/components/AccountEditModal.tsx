'use client';

import React, { useState, useEffect } from 'react';
import { GenshinAccount } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AccountEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: GenshinAccount;
  onSave: (updates: Partial<GenshinAccount>) => void;
}

export default function AccountEditModal({
  isOpen,
  onClose,
  account,
  onSave,
}: AccountEditModalProps) {
  const [formData, setFormData] = useState({
    adventureRank: account.adventureRank,
    worldLevel: account.worldLevel,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        adventureRank: account.adventureRank,
        worldLevel: account.worldLevel,
      });
    }
  }, [account, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      adventureRank: formData.adventureRank,
      worldLevel: formData.worldLevel,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Account Info" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Adventure Rank"
          type="number"
          min="1"
          max="60"
          value={formData.adventureRank}
          onChange={(e) => setFormData({ ...formData, adventureRank: parseInt(e.target.value) || 1 })}
          required
        />
        <Input
          label="World Level"
          type="number"
          min="0"
          max="8"
          value={formData.worldLevel}
          onChange={(e) => setFormData({ ...formData, worldLevel: parseInt(e.target.value) || 0 })}
          required
        />
        <div className="flex gap-3 justify-end pt-4 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

