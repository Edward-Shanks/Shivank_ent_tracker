'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Search, Eye, EyeOff, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Input primitives (shadcn-structured: forwardRef + cn + data-slot).
 * Keeps the project's `input-glass` identity and the previous field API
 * (`label`, `error`, `leftIcon`, `rightIcon`) so call sites are unchanged.
 * `Select` remains a native-<select> convenience wrapper; the Radix Select
 * composition is intentionally a separate follow-up track.
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            data-slot="input"
            aria-invalid={error ? true : undefined}
            className={cn(
              'w-full input-glass focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus-visible:ring-red-500/30',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ onSearch, className, ...props }: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch((e.target as HTMLInputElement).value);
    }
  };

  return (
    <Input
      type="search"
      leftIcon={<Search className="w-4 h-4" />}
      onKeyDown={handleKeyDown}
      className={className}
      {...props}
    />
  );
}

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function PasswordInput({ label, error, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Input
      type={showPassword ? 'text' : 'password'}
      label={label}
      error={error}
      rightIcon={
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword(!showPassword)}
          className="hover:text-foreground transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
      {...props}
    />
  );
}

interface SelectProps {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
  value?: string | number | readonly string[];
  /**
   * Event-style handler, kept API-compatible with the previous native <select>
   * wrapper. Only `event.target.value` is populated (Radix Select emits a
   * string value, which is adapted into a minimal change-event shape).
   */
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

/**
 * Select — backed by the Radix Select primitive (keyboard nav, typeahead,
 * focus management, portal, aria) while preserving the previous event-style
 * API so existing call sites (`value` + `onChange={(e) => e.target.value}`)
 * are unchanged. Styled with the project's `input-glass` identity.
 */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    { label, options, error, className, id, value, onChange, placeholder, disabled, required, name },
    ref
  ) => {
    const reactId = React.useId();
    const selectId = id ?? reactId;
    const stringValue = value != null ? String(value) : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1.5"
          >
            {label}
          </label>
        )}
        <SelectPrimitive.Root
          value={stringValue}
          disabled={disabled}
          required={required}
          name={name}
          onValueChange={(v) =>
            onChange?.({
              target: { value: v },
              currentTarget: { value: v },
            } as unknown as React.ChangeEvent<HTMLSelectElement>)
          }
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={selectId}
            data-slot="select"
            aria-invalid={error ? true : undefined}
            className={cn(
              'w-full input-glass cursor-pointer pr-3 flex items-center justify-between gap-2 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500',
              className
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="w-4 h-4 text-foreground-muted shrink-0" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={8}
              className="z-[100] max-h-64 overflow-hidden rounded-lg p-1 shadow-2xl origin-[var(--radix-select-content-transform-origin)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              style={{
                minWidth: 'var(--radix-select-trigger-width)',
                backgroundColor: 'var(--popover)',
                color: 'var(--popover-foreground)',
                border: '1px solid var(--modal-border)',
              }}
            >
              <SelectPrimitive.Viewport className="p-0">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md py-2.5 pr-8 pl-3 text-sm text-foreground outline-none data-[highlighted]:bg-foreground/10 data-[state=checked]:bg-primary/20 data-[state=checked]:text-primary"
                  >
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
                      <Check className="w-4 h-4 text-primary" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
