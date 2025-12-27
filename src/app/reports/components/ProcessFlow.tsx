'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, ArrowRight, Sparkles } from 'lucide-react';

interface ProcessFlowProps {
  currentStep: number;
  categorySelected: boolean;
  filtersApplied: boolean;
  canExport: boolean;
}

export default function ProcessFlow({
  currentStep,
  categorySelected,
  filtersApplied,
  canExport,
}: ProcessFlowProps) {
  const steps = [
    { id: 1, label: 'Select Category', icon: Circle },
    { id: 2, label: 'Apply Filters', icon: Circle },
    { id: 3, label: 'Export Report', icon: Circle },
  ];

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const shouldBurst = (stepId: number) => {
    if (stepId === 1) return categorySelected;
    if (stepId === 2) return filtersApplied;
    if (stepId === 3) return canExport;
    return false;
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting Lines */}
        {steps.map((step, index) => {
          if (index === steps.length - 1) return null;
          const isActive = step.id < currentStep;
          // Calculate line position: starts at center of current step, ends at center of next step
          const stepWidth = 100 / steps.length;
          const currentStepCenter = (index * stepWidth) + (stepWidth / 2);
          const nextStepCenter = ((index + 1) * stepWidth) + (stepWidth / 2);
          const lineStart = `${currentStepCenter}%`;
          const lineWidth = `${nextStepCenter - currentStepCenter}%`;
          
          return (
            <div
              key={`line-${step.id}`}
              className="absolute top-6 h-0.5 z-0"
              style={{
                left: lineStart,
                width: lineWidth,
              }}
            >
              <motion.div
                className={`h-full ${isActive ? 'bg-red-500' : 'bg-foreground/10'}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isActive ? 1 : 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                style={{ 
                  transformOrigin: 'left',
                  boxShadow: isActive ? '0 0 8px rgba(239, 68, 68, 0.3), 0 0 16px rgba(239, 68, 68, 0.2)' : 'none',
                }}
              />
            </div>
          );
        })}

        {/* Steps */}
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          const isBursting = shouldBurst(step.id);

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1 relative z-10"
            >
              {/* Step Node */}
              <motion.div
                className="relative"
                animate={
                  isBursting && status === 'active'
                    ? {
                        scale: [1, 1.3, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 0.6,
                  repeat: isBursting && status === 'active' ? Infinity : 0,
                  repeatDelay: 1,
                }}
              >
                {/* Burst Effect */}
                {isBursting && status === 'active' && (
                  <>
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={`burst-${i}`}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `radial-gradient(circle, rgba(235, 255, 251, 0.25) 0%, rgba(167, 243, 208, 0.12) 50%, transparent 70%)`,
                          boxShadow: `0 0 8px rgba(235, 255, 251, 0.15), 0 0 16px rgba(167, 243, 208, 0.12)`,
                        }}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{
                          scale: [0, 2.5, 3.5],
                          opacity: [0.4, 0.2, 0],
                          rotate: (i * 360) / 12,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.08,
                          ease: 'easeOut' as const,
                        }}
                      />
                    ))}
                    {/* Central Sparkle */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0.7, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    >
                      <Sparkles 
                        className="w-4 h-4" 
                        style={{ 
                          color: '#EBFFFB',
                          filter: 'drop-shadow(0 0 3px rgba(235, 255, 251, 0.3)) drop-shadow(0 0 6px rgba(167, 243, 208, 0.2)) drop-shadow(0 0 9px rgba(167, 243, 208, 0.1))',
                        }} 
                      />
                    </motion.div>
                  </>
                )}

                {/* Step Circle */}
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    status === 'completed'
                      ? 'bg-red-500 border-red-500'
                      : status === 'active'
                      ? 'bg-red-500/20 border-red-500'
                      : 'bg-foreground/5 border-foreground/20'
                  }`}
                  style={
                    status === 'active'
                      ? {
                          boxShadow: '0 0 10px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.2)',
                        }
                      : status === 'completed'
                      ? {
                          boxShadow: '0 0 8px rgba(239, 68, 68, 0.25)',
                        }
                      : {}
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status === 'completed' ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <Icon
                      className={`w-6 h-6 ${
                        status === 'active'
                          ? 'text-red-500'
                          : 'text-foreground-muted'
                      }`}
                      style={
                        status === 'active'
                          ? { filter: 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.4))' }
                          : {}
                      }
                    />
                  )}
                </motion.div>

                {/* Pulse Effect for Active Step */}
                {status === 'active' && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 dark:border-cyan-400/40"
                    style={{
                      borderColor: '#EBFFFB',
                      boxShadow: '0 0 8px rgba(235, 255, 251, 0.2), 0 0 16px rgba(167, 243, 208, 0.15), 0 0 24px rgba(167, 243, 208, 0.08)',
                    }}
                    animate={{
                      scale: [1, 1.5, 1.5],
                      opacity: [0.3, 0, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>

              {/* Step Label */}
              <motion.div className="mt-3 text-center relative">
                <p
                  className={`text-sm font-medium ${
                    status === 'active' ? 'text-foreground' : 'text-foreground-muted'
                  }`}
                >
                  {step.label}
                </p>
                {/* Prompt Message for Active Step */}
                <AnimatePresence>
                  {status === 'active' && isBursting && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.8 }}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                    >
                      <motion.div
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-white"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          boxShadow: '0 0 10px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.2)',
                        }}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        {step.id === 1 && 'Select a category ↓'}
                        {step.id === 2 && 'Choose a filter ↓'}
                        {step.id === 3 && 'Ready to export!'}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

