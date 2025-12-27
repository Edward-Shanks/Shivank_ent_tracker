'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Camera, Save, X, Mail, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          avatar: avatar || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      setSuccess(true);
      await refreshUser();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    setError(null);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          </div>
          <p className="text-foreground-muted">Manage your profile information</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8">
            {/* Avatar Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-4">
                Profile Picture
              </label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {avatar && avatar.trim() ? (
                    <div className="relative group">
                      <img
                        src={avatar}
                        alt={username}
                        className="w-24 h-24 rounded-full ring-4 ring-primary/20 object-cover shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-4 ring-primary/20 shadow-lg">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Camera className="w-4 h-4" />}
                    onClick={handleAvatarClick}
                  >
                    {avatar ? 'Change Avatar' : 'Upload Avatar'}
                  </Button>
                  {avatar && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      Remove Avatar
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-foreground-muted">
                    JPG, PNG or GIF. Max size 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Username Section */}
            <div className="mb-6">
              <Input
                label="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Email Section (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-foreground-muted" />
                </div>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground-muted cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-foreground-muted mt-2">
                Email cannot be changed
              </p>
            </div>

            {/* Account Created Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-2">
                Member Since
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Calendar className="w-5 h-5 text-foreground-muted" />
                </div>
                <input
                  type="text"
                  value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                  disabled
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground-muted cursor-not-allowed"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500"
              >
                Profile updated successfully!
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                disabled={isSaving || !username.trim()}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

