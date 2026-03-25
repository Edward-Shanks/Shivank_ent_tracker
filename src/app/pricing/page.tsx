'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

type PlanId = 'free' | 'pro';

export default function PricingPage() {
  const { user } = useAuth();
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  const currentPlan: PlanId = useMemo(() => {
    return (user as any)?.plan === 'pro' ? 'pro' : 'free';
  }, [user]);

  const startCheckout = async () => {
    setIsStartingCheckout(true);
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to start checkout');
      if (!data?.url) throw new Error('Missing checkout url');
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert('Unable to start billing checkout. Please try again.');
    } finally {
      setIsStartingCheckout(false);
    }
  };

  const openPortal = async () => {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to open billing portal');
      if (!data?.url) throw new Error('Missing portal url');
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert('Unable to open billing portal. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-foreground-muted">Productized tiers</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Plans & Pricing
          </h1>
          <p className="text-foreground-muted max-w-2xl mx-auto">
            Start free. Upgrade to Pro for advanced analytics and shareable statistics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <Card className="p-6 h-full">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Free</h2>
                <p className="text-foreground-muted text-sm mt-1">For personal tracking</p>
              </div>
              <div className="text-2xl font-bold text-foreground">
                $0<span className="text-sm text-foreground-muted font-medium">/mo</span>
              </div>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                'Track anime, shows, games, websites, and Genshin',
                'Core dashboards + insights',
                'Reports export/import',
              ].map((text) => (
                <li key={text} className="flex items-start gap-2 text-foreground-muted">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
              {[
                'My Statistics (Pro-only)',
                'Shareable statistics images (Pro-only)',
              ].map((text) => (
                <li key={text} className="flex items-start gap-2 text-foreground-muted/70">
                  <span className="w-4 h-4 mt-0.5 flex-shrink-0 inline-flex items-center justify-center rounded-full border border-foreground/10">
                    •
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button variant="secondary" className="w-full" disabled={currentPlan === 'free'}>
                {currentPlan === 'free' ? 'Current plan' : 'Downgrade not available'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 h-full relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 10%, rgba(168,85,247,0.6), transparent 55%)' }} />
            <div className="relative">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Pro</h2>
                    <p className="text-foreground-muted text-sm mt-1">For power users</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  $6<span className="text-sm text-foreground-muted font-medium">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 text-sm">
                {[
                  'Pro-only My Statistics page (polished, share-ready)',
                  'Share stats as images (PNG) for socials',
                  'Advanced analytics (activity & consistency)',
                  'Priority improvements to insights',
                ].map((text) => (
                  <li key={text} className="flex items-start gap-2 text-foreground-muted">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                {currentPlan === 'pro' ? (
                  <>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={openPortal}
                    >
                      Manage billing
                    </Button>
                    <Link href="/my-statistics" className="block">
                      <Button variant="secondary" className="w-full">
                        Open My Statistics
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={startCheckout}
                    disabled={isStartingCheckout}
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.35)',
                    }}
                  >
                    {isStartingCheckout ? 'Starting checkout…' : 'Upgrade to Pro'}
                  </Button>
                )}
                <p className="text-xs text-foreground-muted text-center">
                  Recurring billing. Supports Google Pay where available.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center mt-10 text-sm text-foreground-muted">
          <span>Have questions? Check </span>
          <Link href="/reports" className="text-primary hover:underline">Reports</Link>
          <span> for export/import, or upgrade anytime.</span>
        </div>
      </div>
    </div>
  );
}

