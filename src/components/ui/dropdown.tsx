'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { cn } from '@/lib/utils';

/**
 * Dropdown — custom single/multi-select form control.
 *
 * Rebuilt on the Radix Popover primitive (outside-click dismissal, escape,
 * focus return, portal, aria) while preserving the exact original public API
 * (`options | value | onChange(value) | placeholder | multiple | label |
 * required | className`) so all existing call sites are unchanged.
 */

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  label?: string;
  required?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  label,
  required = false,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  const getDisplayText = () => {
    if (multiple) {
      const selectedCount = Array.isArray(value) ? value.length : 0;
      if (selectedCount === 0) return placeholder;
      if (selectedCount === 1) {
        const selected = options.find((opt) => value.includes(opt.value));
        return selected?.label || placeholder;
      }
      return `${selectedCount} selected`;
    }
    const selected = options.find((opt) => opt.value === value);
    return selected?.label || placeholder;
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen} modal>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full input-glass text-left hover:bg-foreground/10 transition-colors flex items-center justify-between focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
              isOpen && 'bg-foreground/10 border-foreground/30'
            )}
          >
            <span className="text-xs sm:text-sm truncate">{getDisplayText()}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-foreground-muted transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="max-h-64 overflow-y-auto border-foreground/20 rounded-lg"
          style={{ width: 'var(--radix-popover-trigger-width)' } as React.CSSProperties}
          onOpenAutoFocus={(e) => {
            // Keep focus on the trigger; options remain tab/keyboard reachable.
            e.preventDefault();
          }}
        >
          {options.map((option) => {
            const selected = isSelected(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors focus-visible:outline-none focus-visible:bg-foreground/10',
                  selected ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-foreground/10'
                )}
              >
                {multiple ? (
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center',
                      selected ? 'bg-primary border-primary' : 'border-foreground/30 bg-transparent'
                    )}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                ) : (
                  selected && <Check className="w-4 h-4 text-primary" />
                )}
                <span className="text-sm font-medium flex-1">{option.label}</span>
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}
