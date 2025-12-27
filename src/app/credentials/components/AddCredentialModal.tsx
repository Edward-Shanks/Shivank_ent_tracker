'use client';

import React, { useState } from 'react';
import { CredentialCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useData } from '@/context/DataContext';

interface AddCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories: { value: CredentialCategory; label: string }[] = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'social', label: 'Social' },
  { value: 'email', label: 'Email' },
  { value: 'finance', label: 'Finance' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

export default function AddCredentialModal({ isOpen, onClose }: AddCredentialModalProps) {
  const { addCredential } = useData();
  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as CredentialCategory,
    email: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCredential({
        name: formData.name,
        category: formData.category,
        email: formData.email || undefined,
        username: formData.username || undefined,
        password: formData.password,
        url: formData.url || undefined,
        notes: formData.notes || undefined,
        lastUpdated: new Date().toISOString(),
      });
      // Reset form
      setFormData({
        name: '',
        category: 'other',
        email: '',
        username: '',
        password: '',
        url: '',
        notes: '',
      });
      onClose();
    } catch (error) {
      console.error('Error adding credential:', error);
      alert('Failed to add credential. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Credential" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Service Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Netflix, Steam"
          />
          <Dropdown
            label="Category"
            options={categories}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as CredentialCategory })}
            required
          />
          <Input
            label="Email (optional)"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@example.com"
          />
          <Input
            label="Username (optional)"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="username"
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="Enter password"
          />
          <Input
            label="Website URL (optional)"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com/login"
          />
        </div>
        <Input
          label="Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes"
        />
        <div className="flex gap-3 justify-end pt-4 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Credential
          </Button>
        </div>
      </form>
    </Modal>
  );
}

