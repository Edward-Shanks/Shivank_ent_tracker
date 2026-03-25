'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Camera, Save, X, Mail, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useThemePalette } from '@/context/ThemePaletteContext';
import { PALETTES } from '@/lib/theme-palettes';

type Plan = 'free' | 'pro' | 'premium';

interface NotificationSettings {
  watchlistEnabled: boolean;
  recommendationsEnabled: boolean;
  seasonalEnabled: boolean;
  animeWatchlist: boolean;
  moviesWatchlist: boolean;
  gamesBacklog: boolean;
  genshinReminders: boolean;
  websitesReminders: boolean;
  adminRecommendations: boolean;
  weeklyRecap: boolean;
  seasonalReleases: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { paletteId, setPaletteId, palette } = useThemePalette();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notificationToast, setNotificationToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPlan = useMemo<Plan>(() => {
    const raw = ((user as any)?.plan ?? 'free') as unknown;
    const plan = String(raw).toLowerCase().trim();
    if (plan.includes('premium')) return 'premium';
    if (plan === 'pro' || plan.includes('pro')) return 'pro';
    return 'free';
  }, [user]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    watchlistEnabled: true,
    recommendationsEnabled: true,
    seasonalEnabled: true,
    animeWatchlist: true,
    moviesWatchlist: true,
    gamesBacklog: true,
    genshinReminders: false,
    websitesReminders: false,
    adminRecommendations: true,
    weeklyRecap: true,
    seasonalReleases: true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nv_notification_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotificationSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    setNotificationSettings((prev) => {
      const next: NotificationSettings = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('nv_notification_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setNotificationToast(true);
    setTimeout(() => setNotificationToast(false), 2000);
  };

  useEffect(() => {
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
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

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
      setTimeout(() => setSuccess(false), 2000);
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
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
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
          <p className="text-sm text-foreground-muted mb-1">
            Update your account details, plan, and notifications.
          </p>
          <p className="text-xs text-foreground-muted">
            Profile  •  Plan &amp; Billing  •  Notifications
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* TOP ROW: Account + Notifications */}
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Account card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-7"
            >
              <Card className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Account</h2>
                </div>

                {/* Avatar + buttons */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center mb-6">
                  <div className="relative">
                    {avatar && avatar.trim() ? (
                      <div className="relative group">
                        <img
                          src={avatar}
                          alt={username}
                          className="w-24 h-24 rounded-full ring-4 ring-primary/20 object-cover shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-4 ring-primary/20 shadow-lg">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Camera className="w-4 h-4" />}
                        onClick={handleAvatarClick}
                      >
                        {avatar ? 'Change avatar' : 'Upload avatar'}
                      </Button>
                      {avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="text-xs text-foreground-muted hover:text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-foreground-muted">
                      JPG, PNG or GIF up to 5MB.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {/* Username */}
                <div className="mb-4">
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

                {/* Email + member since */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
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
                    <p className="text-xs text-foreground-muted mt-1">
                      Email can’t be changed from here.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Member since
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Calendar className="w-5 h-5 text-foreground-muted" />
                      </div>
                      <input
                        type="text"
                        value={
                          user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'N/A'
                        }
                        disabled
                        className="w-full pl-11 pr-4 py-3 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Inline feedback */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/40 text-primary text-sm"
                  >
                    Profile updated.
                  </motion.div>
                )}

                {/* Save / cancel row */}
                <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
                  <Button
                    variant="secondary"
                    onClick={() => router.back()}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    leftIcon={<Save className="w-4 h-4" />}
                    onClick={handleSave}
                    disabled={isSaving || !username.trim()}
                  >
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Notifications (adjacent to Account on desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5"
            >
              <Card className="p-6 sm:p-7 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
                    <p className="text-sm text-foreground-muted">Decide how NexaVerse reaches out.</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm flex-1">
                  {/* Watchlist alerts */}
                  <div className="rounded-lg border border-foreground/10 bg-background-secondary/80 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-foreground">Watchlist alerts</h3>
                        <p className="text-xs text-foreground-muted">
                          Get nudges to continue anime, shows, and games.
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-foreground-muted">Enable</span>
                        <input
                          type="checkbox"
                          className="rounded border-foreground/30"
                          checked={notificationSettings.watchlistEnabled}
                          onChange={() => handleToggleSetting('watchlistEnabled')}
                        />
                      </label>
                    </div>
                    <div className="mt-3 space-y-2">
                      {[
                        { key: 'animeWatchlist' as const, label: 'Anime watchlist reminders' },
                        { key: 'moviesWatchlist' as const, label: 'Movies & K-Drama watchlist' },
                        { key: 'gamesBacklog' as const, label: 'Games backlog nudges' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md ${
                            notificationSettings.watchlistEnabled ? '' : 'opacity-60'
                          }`}
                        >
                          <span>{item.label}</span>
                          <input
                            type="checkbox"
                            className="rounded border-foreground/30"
                            checked={notificationSettings[item.key]}
                            disabled={!notificationSettings.watchlistEnabled}
                            onChange={() => handleToggleSetting(item.key)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="rounded-lg border border-foreground/10 bg-background-secondary/80 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-foreground">Recommendations</h3>
                        <p className="text-xs text-foreground-muted">
                          Simple “because you watched/played” suggestions.
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-foreground-muted">Enable</span>
                        <input
                          type="checkbox"
                          className="rounded border-foreground/30"
                          checked={notificationSettings.recommendationsEnabled}
                          onChange={() => handleToggleSetting('recommendationsEnabled')}
                        />
                      </label>
                    </div>
                    <div className="mt-3 space-y-2">
                      <label
                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md ${
                          notificationSettings.recommendationsEnabled ? '' : 'opacity-60'
                        }`}
                      >
                        <span>Admin picks &amp; recommendations</span>
                        <input
                          type="checkbox"
                          className="rounded border-foreground/30"
                          checked={notificationSettings.adminRecommendations}
                          disabled={!notificationSettings.recommendationsEnabled}
                          onChange={() => handleToggleSetting('adminRecommendations')}
                        />
                      </label>
                      <label
                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md ${
                          notificationSettings.recommendationsEnabled ? '' : 'opacity-60'
                        }`}
                      >
                        <span>Weekly recap</span>
                        <input
                          type="checkbox"
                          className="rounded border-foreground/30"
                          checked={notificationSettings.weeklyRecap}
                          disabled={!notificationSettings.recommendationsEnabled}
                          onChange={() => handleToggleSetting('weeklyRecap')}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Seasonal & reminders */}
                  <div className="rounded-lg border border-foreground/10 bg-background-secondary/80 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-foreground">Seasonal &amp; reminders</h3>
                        <p className="text-xs text-foreground-muted">
                          Light reminders for releases &amp; check-ins.
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-foreground-muted">Enable</span>
                        <input
                          type="checkbox"
                          className="rounded border-foreground/30"
                          checked={notificationSettings.seasonalEnabled}
                          onChange={() => handleToggleSetting('seasonalEnabled')}
                        />
                      </label>
                    </div>

                    <div className="mt-3 space-y-2">
                      <label
                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md ${
                          notificationSettings.seasonalEnabled ? '' : 'opacity-60'
                        }`}
                      >
                        <span>Seasonal releases</span>
                        <input
                          type="checkbox"
                          className="rounded border-foreground/30"
                          checked={notificationSettings.seasonalReleases}
                          disabled={!notificationSettings.seasonalEnabled}
                          onChange={() => handleToggleSetting('seasonalReleases')}
                        />
                      </label>
                      <label
                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md ${
                          notificationSettings.seasonalEnabled ? '' : 'opacity-60'
                        }`}
                      >
                        <span>Genshin account &amp; events</span>
                        <input
                          type="checkbox"
                          className="rounded border-foreground/30"
                          checked={notificationSettings.genshinReminders}
                          disabled={!notificationSettings.seasonalEnabled}
                          onChange={() => handleToggleSetting('genshinReminders')}
                        />
                      </label>
                      <label
                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md ${
                          notificationSettings.seasonalEnabled ? '' : 'opacity-60'
                        }`}
                      >
                        <span>Website/tool reminders</span>
                        <input
                          type="checkbox"
                          className="rounded border-foreground/30"
                          checked={notificationSettings.websitesReminders}
                          disabled={!notificationSettings.seasonalEnabled}
                          onChange={() => handleToggleSetting('websitesReminders')}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-foreground-muted">
                  These preferences are saved for this browser only right now.
                </p>
              </Card>
            </motion.div>

            {/* Plan & Billing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-12"
            >
              <Card className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Plan &amp; Billing</h2>
                    <p className="text-sm text-foreground-muted">
                      Choose the tier that matches how you use NexaVerse.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                    {currentPlan === 'premium'
                      ? 'Premium plan'
                      : currentPlan === 'pro'
                      ? 'Pro plan'
                      : 'Free plan'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Free */}
                  <div className="relative p-4 rounded-xl border border-foreground/10 bg-background-secondary flex flex-col">
                    {currentPlan === 'free' && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/30">
                        Current plan
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-foreground">Free</h3>
                    <p className="text-xs text-foreground-muted mb-2">For getting started</p>
                    <p className="text-sm font-medium text-foreground mb-3">$0 / month</p>
                    <ul className="text-xs text-foreground-muted space-y-1.5 flex-1">
                      <li>Track up to 500 anime, movies &amp; games</li>
                      <li>Basic stats &amp; manual entry</li>
                      <li>My Statistics overview</li>
                    </ul>
                    <Button
                      variant={currentPlan === 'free' ? 'secondary' : 'primary'}
                      disabled={currentPlan === 'free'}
                      className="mt-3 w-full"
                    >
                      {currentPlan === 'free' ? 'Current plan' : 'Switch to Free'}
                    </Button>
                  </div>

                  {/* Pro */}
                  <div className={`relative p-4 rounded-xl border flex flex-col ${currentPlan === 'pro' ? 'border-primary/60 bg-primary/5' : 'border-foreground/10 bg-background-secondary'}`}>
                    <div className="absolute top-3 right-3 flex gap-1">
                      {currentPlan === 'pro' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
                          Current plan
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-background-secondary text-primary border border-primary/40">
                        Most popular
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Pro</h3>
                    <p className="text-xs text-foreground-muted mb-2">For serious trackers</p>
                    <p className="text-sm font-medium text-foreground mb-3">$6 / month</p>
                    <ul className="text-xs text-foreground-muted space-y-1.5 flex-1">
                      <li>Unlimited tracking across all collections</li>
                      <li>Advanced analytics &amp; custom dashboards</li>
                      <li>Year-in-review &amp; AI recommendations</li>
                      <li>Data import &amp; export</li>
                    </ul>
                    <Button
                      variant={currentPlan === 'pro' ? 'primary' : 'secondary'}
                      className="mt-3 w-full"
                    >
                      {currentPlan === 'pro'
                        ? 'Manage billing'
                        : currentPlan === 'premium'
                        ? 'Change to Pro'
                        : 'Upgrade to Pro'}
                    </Button>
                  </div>

                  {/* Premium */}
                  <div className={`relative p-4 rounded-xl border flex flex-col ${currentPlan === 'premium' ? 'border-primary/60 bg-primary/5' : 'border-foreground/10 bg-background-secondary'}`}>
                    {currentPlan === 'premium' && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
                        Current plan
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-foreground">Premium</h3>
                    <p className="text-xs text-foreground-muted mb-2">6 Month Plan</p>
                    <p className="text-sm font-medium text-foreground mb-3">$30 (Save 20%)</p>
                    <ul className="text-xs text-foreground-muted space-y-1.5 flex-1">
                      <li>Everything in Pro</li>
                      <li>Smart backlog &amp; goal tracking</li>
                      <li>Custom themes &amp; social sharing</li>
                      <li>Priority feature access</li>
                    </ul>
                    <Button
                      variant={currentPlan === 'premium' ? 'primary' : 'secondary'}
                      className="mt-3 w-full"
                    >
                      {currentPlan === 'premium'
                        ? 'Manage billing'
                        : 'Upgrade to Premium'}
                    </Button>
                  </div>
                </div>
                <button className="mt-2 text-xs text-foreground-muted hover:text-primary text-left">
                  View all plan features
                </button>
              </Card>
            </motion.div>
          </div>

          {/* LEFT COLUMN: Color palette */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-12"
          >
            <Card className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Color palette</h2>
                  <p className="text-sm text-foreground-muted">
                    Pick a vibe for your whole NexaVerse dashboard.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                  {palette.name}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PALETTES.map((p) => {
                  const active = p.id === paletteId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaletteId(p.id)}
                      className={`text-left rounded-xl border p-3 transition-colors ${
                        active ? 'border-primary/60 ring-2 ring-primary/20' : 'border-foreground/10 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="text-sm font-semibold text-foreground">{p.name}</div>
                        {active && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                            Selected
                          </span>
                        )}
                      </div>

                      {/* Visual preview */}
                      <div
                        className="rounded-lg border"
                        style={{
                          background: p.colors.background,
                          borderColor: p.colors.border,
                        }}
                      >
                        <div className="p-3">
                          <div className="text-xs font-bold" style={{ color: p.colors.textPrimary }}>
                            Your dashboard
                          </div>
                          <div className="text-[10px] mt-1" style={{ color: p.colors.textSecondary }}>
                            Cards, text & charts
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-10 rounded-full"
                              style={{ background: p.colors.primary }}
                            />
                            <span
                              className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                background: p.colors.primary,
                                color: p.colors.background,
                              }}
                            >
                              Accent
                            </span>
                          </div>

                          <div
                            className="mt-3 rounded-md border p-2 text-[10px]"
                            style={{
                              background: p.colors.surface,
                              borderColor: p.colors.border,
                              color: p.colors.textPrimary,
                            }}
                          >
                            Sample KPI
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Notification toast */}
        {notificationToast && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="rounded-lg bg-background-secondary shadow-lg border border-foreground/10 px-4 py-2 text-xs text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Notification preferences updated.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

