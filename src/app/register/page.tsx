'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedThemeToggler } from '@/components/ui/ThemeToggler';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(email, password);
      if (result.success) {
        setSuccess(true);
        // Redirect immediately after successful registration (user is already logged in via cookies)
        router.push('/');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-accent-cyan/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear' as const,
          }}
        />
      </div>

      {/* Theme Toggle - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute top-6 right-6 z-50"
      >
        <AnimatedThemeToggler />
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Title */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-cyan via-primary to-accent-purple mb-6 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join{' '}
            <span className="bg-gradient-to-r from-primary via-accent-cyan to-accent-purple bg-clip-text text-transparent">
              NexaVerse
            </span>
          </motion.h1>
          <motion.p
            className="text-foreground-muted text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Create your account and start tracking your entertainment
          </motion.p>
        </motion.div>

        {/* Register Card */}
        <motion.div
          variants={cardVariants}
          className="glass-strong rounded-2xl p-8 shadow-2xl border border-foreground/10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground-muted"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    className={`w-5 h-5 transition-colors ${
                      isFocused === 'email'
                        ? 'text-primary'
                        : 'text-foreground-muted'
                    }`}
                  />
                </div>
                <motion.input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
                {isFocused === 'email' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-primary/50 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                )}
              </div>
              <p className="text-xs text-foreground-muted">Your username will be derived from your email</p>
            </motion.div>

            {/* Password Input */}
            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground-muted"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    className={`w-5 h-5 transition-colors ${
                      isFocused === 'password'
                        ? 'text-primary'
                        : 'text-foreground-muted'
                    }`}
                  />
                </div>
                <motion.input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Create a password (min. 6 characters)"
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground-muted hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
                {isFocused === 'password' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-primary/50 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                )}
              </div>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground-muted"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    className={`w-5 h-5 transition-colors ${
                      isFocused === 'confirmPassword'
                        ? 'text-primary'
                        : 'text-foreground-muted'
                    }`}
                  />
                </div>
                <motion.input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setIsFocused('confirmPassword')}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground-muted hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
                {isFocused === 'confirmPassword' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-primary/50 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                )}
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm"
              >
                Account created successfully! Redirecting...
              </motion.div>
            )}

            {/* Register Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-accent-cyan via-primary to-accent-purple shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isSubmitting && !isLoading ? { scale: 1.02, boxShadow: '0 10px 30px rgba(0, 240, 255, 0.4)' } : {}}
                whileTap={!isSubmitting && !isLoading ? { scale: 0.98 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-hover via-accent-cyan to-primary-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                      />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <motion.div
                        initial={{ x: -5, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>

            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="relative flex items-center py-4"
            >
              <div className="flex-1 border-t border-foreground/20" />
              <span className="px-4 text-sm text-foreground-muted">or</span>
              <div className="flex-1 border-t border-foreground/20" />
            </motion.div>

            {/* Sign In Link */}
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <p className="text-foreground-muted text-sm">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-hover font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-8"
        >
          <p className="text-foreground-muted text-sm">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
