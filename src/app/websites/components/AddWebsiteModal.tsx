'use client';

import React, { useState } from 'react';
import { WebsiteCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useData } from '@/context/DataContext';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories: { value: WebsiteCategory; label: string }[] = [
  { value: 'anime', label: 'Anime' },
  { value: 'movies', label: 'Movies' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'social', label: 'Social' },
  { value: 'news', label: 'News' },
  { value: 'tools', label: 'Tools' },
  { value: 'other', label: 'Other' },
];

export default function AddWebsiteModal({ isOpen, onClose }: AddWebsiteModalProps) {
  const { addWebsite } = useData();
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'other' as WebsiteCategory,
    description: '',
    favicon: '',
    isFavorite: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addWebsite({
        name: formData.name,
        url: formData.url,
        category: formData.category,
        description: formData.description || undefined,
        favicon: formData.favicon || undefined,
        isFavorite: formData.isFavorite,
      });
      // Reset form
      setFormData({
        name: '',
        url: '',
        category: 'other',
        description: '',
        favicon: '',
        isFavorite: false,
      });
      onClose();
    } catch (error) {
      console.error('Error adding website:', error);
      alert('Failed to add website. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Website" size="xl">
      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs sm:text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Input
            label="Website Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter website name"
          />
          <Input
            label="URL"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            placeholder="https://example.com"
          />
          <Dropdown
            label="Category"
            options={categories}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as WebsiteCategory })}
            required
          />
          <Input
            label="Favicon URL (optional)"
            type="url"
            value={formData.favicon}
            onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
            placeholder="https://example.com/favicon.ico"
          />
        </div>
        <Input
          label="Description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the website"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFavorite"
            checked={formData.isFavorite}
            onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
            className="w-4 h-4 rounded border-foreground/20 bg-foreground/10 text-primary focus:ring-primary"
          />
          <label htmlFor="isFavorite" className="text-sm text-foreground-muted cursor-pointer">
            Mark as favorite
          </label>
        </div>
        <div className="flex gap-2 justify-end pt-3 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose} className="text-xs sm:text-sm px-3 py-1.5">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="text-xs sm:text-sm px-3 py-1.5">
            Add Website
          </Button>
        </div>
      </form>
    </Modal>
  );
}

