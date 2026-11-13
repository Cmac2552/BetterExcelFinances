"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void | Promise<void>;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CategoryCombobox({
  value,
  onChange,
  options,
  placeholder = "Select category...",
  disabled = false,
  className,
}: Readonly<CategoryComboboxProps>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      // Focus input after popover mounts
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const trimmedQuery = query.trim();

  const filteredOptions = useMemo(() => {
    if (!trimmedQuery) return options;
    const lower = trimmedQuery.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(lower));
  }, [options, trimmedQuery]);

  const hasExactMatch = useMemo(() => {
    if (!trimmedQuery) return true;
    const lower = trimmedQuery.toLowerCase();
    return options.some((opt) => opt.toLowerCase() === lower);
  }, [options, trimmedQuery]);

  const handleSelect = async (selected: string) => {
    const next = selected.trim();
    if (!next) return;
    setOpen(false);
    if (next !== value) {
      await onChange(next);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-[#1E2228] px-3 py-2 text-sm text-[#f4f0e1] ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-gray-400",
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[240px] p-0 bg-[#f4f0e1] text-slate-900 border border-gray-300 shadow-xl"
      >
        <div className="p-2 border-b border-gray-300">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or type category..."
            className="w-full rounded border border-gray-400 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-900"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (trimmedQuery) {
                  const exact = options.find(
                    (opt) => opt.toLowerCase() === trimmedQuery.toLowerCase()
                  );
                  handleSelect(exact ?? trimmedQuery);
                } else if (filteredOptions.length > 0) {
                  handleSelect(filteredOptions[0]);
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
              }
            }}
          />
        </div>

        <div className="max-h-56 overflow-y-auto p-1">
          {filteredOptions.length === 0 && !trimmedQuery && (
            <div className="px-2 py-3 text-center text-xs text-gray-500">
              No categories available
            </div>
          )}

          {filteredOptions.map((option) => {
            const isSelected = option === value;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-black/10 transition-colors",
                  isSelected && "font-semibold bg-black/5"
                )}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isSelected ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">{option}</span>
              </button>
            );
          })}

          {trimmedQuery && !hasExactMatch && (
            <button
              type="button"
              onClick={() => handleSelect(trimmedQuery)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm font-medium text-emerald-800 hover:bg-emerald-900/10 transition-colors border-t border-gray-300/70 mt-1 pt-2"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Use &ldquo;{trimmedQuery}&rdquo;</span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
