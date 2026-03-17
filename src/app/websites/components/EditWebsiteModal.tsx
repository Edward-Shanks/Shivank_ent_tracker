'use client';

import React, { useState, useEffect } from 'react';
import { Website, WebsiteCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useData } from '@/context/DataContext';

interface EditWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  website: Website | null;
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

export default function EditWebsiteModal({ isOpen, onClose, website }: EditWebsiteModalProps) {
  const { updateWebsite } = useData();
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'other' as WebsiteCategory,
    description: '',
    favicon: '',
    isFavorite: false,
  });

  useEffect(() => {
    if (website) {
      setFormData({
        name: website.name,
        url: website.url,
        category: (website.category as WebsiteCategory) || 'other',
        description: website.description || '',
        favicon: website.favicon || '',
        isFavorite: website.isFavorite,
      });
    }
  }, [website]);

  if (!website) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWebsite(website.id, {
        name: formData.name,
        url: formData.url,
        category: formData.category,
        description: formData.description || undefined,
        favicon: formData.favicon || undefined,
        isFavorite: formData.isFavorite,
      });
      onClose();
    } catch (error) {
      console.error('Error updating website:', error);
      alert('Failed to update website. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Website" size="xl">
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
            id="edit_isFavorite"
            checked={formData.isFavorite}
            onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
            className="w-4 h-4 rounded border-foreground/20 bg-foreground/10 text-primary focus:ring-primary"
          />
          <label htmlFor="edit_isFavorite" className="text-sm text-foreground-muted cursor-pointer">
            Mark as favorite
          </label>
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

