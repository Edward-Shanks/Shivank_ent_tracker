'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Trash2,
  Edit,
  Shield,
  Tv,
  Gamepad2,
  Mail,
  CreditCard,
  ShoppingBag,
  MoreHorizontal,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { CredentialCategory } from '@/types';
import { Card, StatCard } from '@/components/ui/Card';
import { Button, IconButton } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import AddCredentialModal from './components/AddCredentialModal';

const categoryConfig: Record<CredentialCategory, { icon: React.ReactNode; color: string; label: string }> = {
  streaming: { icon: <Tv className="w-4 h-4" />, color: '#e50914', label: 'Streaming' },
  gaming: { icon: <Gamepad2 className="w-4 h-4" />, color: '#22c55e', label: 'Gaming' },
  social: { icon: <MoreHorizontal className="w-4 h-4" />, color: '#3b82f6', label: 'Social' },
  email: { icon: <Mail className="w-4 h-4" />, color: '#f97316', label: 'Email' },
  finance: { icon: <CreditCard className="w-4 h-4" />, color: '#eab308', label: 'Finance' },
  shopping: { icon: <ShoppingBag className="w-4 h-4" />, color: '#ec4899', label: 'Shopping' },
  other: { icon: <MoreHorizontal className="w-4 h-4" />, color: '#6b7280', label: 'Other' },
};

export default function CredentialsPage() {
  const { credentials } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CredentialCategory | 'all'>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch =
      cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cred.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const categoryCounts = (Object.keys(categoryConfig) as CredentialCategory[]).map((cat) => ({
    category: cat,
    count: credentials.filter((c) => c.category === cat).length,
  }));

  return (
    <div className="min-h-screen bg-animated">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16">
        <div className="absolute inset-0 gradient-radial opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Shield className="w-5 h-5 text-purple-500" />
              <span className="text-foreground-muted">Secure Vault</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Credential Manager
            </h1>
            <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
              Securely store and manage your passwords and account credentials
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={KeyRound}
              label="Total Credentials"
              value={credentials.length}
              color="#8b5cf6"
            />
            <StatCard
              icon={Tv}
              label="Streaming"
              value={credentials.filter((c) => c.category === 'streaming').length}
              color="#e50914"
            />
            <StatCard
              icon={Gamepad2}
              label="Gaming"
              value={credentials.filter((c) => c.category === 'gaming').length}
              color="#22c55e"
            />
            <StatCard
              icon={Mail}
              label="Other"
              value={credentials.filter((c) => !['streaming', 'gaming'].includes(c.category)).length}
              color="#3b82f6"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Saved Credentials</h2>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Credential
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-purple-500 text-white'
                : 'glass text-foreground-muted hover:text-foreground'
            }`}
          >
            All
          </button>
          {(Object.keys(categoryConfig) as CredentialCategory[]).map((cat) => {
            const config = categoryConfig[cat];
            const count = credentials.filter((c) => c.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat
                    ? 'text-white'
                    : 'glass text-foreground-muted hover:text-foreground'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat ? config.color : undefined,
                }}
              >
                {config.icon}
                {config.label}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchInput
            placeholder="Search credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Credentials Grid */}
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCredentials.map((cred, index) => {
            const config = categoryConfig[cred.category];
            const isPasswordVisible = visiblePasswords.has(cred.id);

            return (
              <motion.div
                key={cred.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 h-full">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <div style={{ color: config.color }}>{config.icon}</div>
                      </div>

                      {/* Title and Badge */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{cred.name}</h3>
                          <Badge size="sm" style={{ backgroundColor: `${config.color}20`, color: config.color, borderColor: `${config.color}30` }}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {cred.url && (
                          <IconButton
                            icon={<ExternalLink className="w-4 h-4" />}
                            label="Open website"
                            onClick={() => window.open(cred.url, '_blank')}
                          />
                        )}
                        <IconButton
                          icon={<Edit className="w-4 h-4" />}
                          label="Edit"
                        />
                        <IconButton
                          icon={<Trash2 className="w-4 h-4" />}
                          label="Delete"
                          className="hover:text-red-500"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      {/* Email/Username */}
                      {(cred.email || cred.username) && (
                        <div className="space-y-1">
                          <span className="text-xs text-foreground-muted">
                            {cred.email ? 'Email' : 'Username'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground text-sm flex-1 truncate">
                              {cred.email || cred.username}
                            </span>
                            <IconButton
                              icon={<Copy className="w-3 h-3" />}
                              label="Copy"
                              size="sm"
                              onClick={() => copyToClipboard(cred.email || cred.username || '')}
                            />
                          </div>
                        </div>
                      )}

                      {/* Password */}
                      <div className="space-y-1">
                        <span className="text-xs text-foreground-muted">Password</span>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-mono text-sm flex-1">
                            {isPasswordVisible ? cred.password : '••••••••••••'}
                          </span>
                          <IconButton
                            icon={isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            label="Toggle visibility"
                            size="sm"
                            onClick={() => togglePasswordVisibility(cred.id)}
                          />
                          <IconButton
                            icon={<Copy className="w-3 h-3" />}
                            label="Copy"
                            size="sm"
                            onClick={() => copyToClipboard(cred.password)}
                          />
                        </div>
                      </div>

                      {/* Last Updated */}
                      <p className="text-xs text-foreground-muted pt-2 border-t border-foreground/10">
                        Last updated: {new Date(cred.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredCredentials.length === 0 && (
          <div className="text-center py-16">
            <KeyRound className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No credentials found
            </h3>
            <p className="text-foreground-muted">
              Try adjusting your search or add a new credential
            </p>
          </div>
        )}
      </div>

      {/* Add Credential Modal */}
      <AddCredentialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

