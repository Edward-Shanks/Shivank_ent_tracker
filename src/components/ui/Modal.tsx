'use client';

import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl max-h-[90vh]',
  xl: 'max-w-4xl max-h-[95vh]',
  full: 'max-w-[95vw] h-[90vh]',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-md"
            style={{ backgroundColor: 'var(--modal-backdrop)' }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizeStyles[size]} ${size === 'xl' ? 'h-[95vh]' : ''} rounded-2xl overflow-hidden flex flex-col`}
            style={{
              background: 'var(--modal-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--modal-border)',
              boxShadow: 'var(--modal-shadow)',
            }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-foreground/10">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
                <IconButton
                  icon={<X className="w-4 h-4 sm:w-5 sm:h-5" />}
                  label="Close"
                  onClick={onClose}
                />
              </div>
            )}

            {/* Body */}
            <div className={`flex-1 ${
              size === 'full' 
                ? 'p-3 sm:p-4 md:p-6 overflow-y-auto' 
                : size === 'xl' 
                ? 'px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6' 
                : size === 'lg' 
                ? 'px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 overflow-y-auto' 
                : 'p-3 sm:p-4 md:p-6'
            }`}>
              {children}
            </div>

            {/* Close button if no title */}
            {!title && (
              <div className="absolute top-4 right-4">
                <IconButton
                  icon={<X className="w-5 h-5" />}
                  label="Close"
                  onClick={onClose}
                  variant="secondary"
                />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-foreground-muted mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={variant === 'danger' ? 'btn-primary bg-red-600 hover:bg-red-700' : 'btn-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

