'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './dialog';
import { IconButton, Button } from './button';
import { cn } from '@/lib/utils';

/**
 * Modal — compatibility wrapper preserving the original custom Modal API
 * (`isOpen | onClose | title | size | scrollable | bodyClassName`) but built
 * on top of the Radix-backed Dialog primitive (./dialog). This gives focus
 * trap, focus return, portal, scroll-lock and aria for free, with no changes
 * required at the ~20 existing call sites.
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  scrollable?: boolean;
  bodyClassName?: string;
}

const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl max-h-[90vh]',
  xl: 'max-w-6xl max-h-[95vh]',
  full: 'max-w-[95vw] h-[90vh]',
};

const bodyPadding: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'p-3 sm:p-4 md:p-6',
  md: 'p-3 sm:p-4 md:p-6',
  lg: 'px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6',
  xl: 'px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6',
  full: 'p-3 sm:p-4 md:p-6',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  scrollable = true,
  bodyClassName = '',
}: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn('p-0 gap-0 flex flex-col overflow-hidden rounded-2xl', sizeStyles[size])}
      >
        {title ? (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-foreground/10">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">
              {title}
            </DialogTitle>
            <IconButton
              icon={<X className="w-4 h-4 sm:w-5 sm:h-5" />}
              label="Close"
              onClick={onClose}
            />
          </div>
        ) : (
          <>
            {/* Radix requires an accessible title; keep it visually hidden. */}
            <DialogTitle className="sr-only">Dialog</DialogTitle>
            <div className="absolute top-4 right-4 z-10">
              <IconButton
                icon={<X className="w-5 h-5" />}
                label="Close"
                onClick={onClose}
                variant="secondary"
              />
            </div>
          </>
        )}

        <div
          className={cn(
            'flex-1',
            bodyPadding[size],
            scrollable ? 'overflow-y-auto' : 'overflow-y-hidden',
            bodyClassName
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
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
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
