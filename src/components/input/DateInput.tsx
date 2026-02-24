"use client";

import { useRef, useCallback, type KeyboardEvent, type ChangeEvent } from "react";

interface DateInputProps {
  value: string; // YYYY-MM-DD or partial
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

/**
 * Custom date input with separate Year / Month / Day fields.
 * Replaces native `<input type="date">` for consistent cross-browser behavior.
 * - Accepts numeric keyboard input immediately (no picker delay)
 * - Auto-advances focus when a segment is filled
 * - Supports backspace to navigate back to previous segment
 * - Outputs YYYY-MM-DD format
 */
export function DateInput({ value, onChange, className, required }: DateInputProps) {
  const parts = value ? value.split("-") : ["", "", ""];
  const year = parts[0] || "";
  const month = parts[1] || "";
  const day = parts[2] || "";

  const yearRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  const buildValue = useCallback(
    (y: string, m: string, d: string) => {
      if (!y && !m && !d) {
        onChange("");
        return;
      }
      onChange(`${y}-${m}-${d}`);
    },
    [onChange],
  );

  const handleYear = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    buildValue(v, month, day);
    if (v.length === 4) monthRef.current?.focus();
  };

  const handleMonth = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 2);
    // Clamp month to 01-12
    if (v.length === 2) {
      const n = parseInt(v, 10);
      if (n > 12) v = "12";
      if (n < 1) v = "01";
    }
    // Auto-advance if first digit > 1 (can't be valid month start)
    if (v.length === 1 && parseInt(v, 10) > 1) {
      v = "0" + v;
    }
    buildValue(year, v, day);
    if (v.length === 2) dayRef.current?.focus();
  };

  const handleDay = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 2);
    // Clamp day to 01-31
    if (v.length === 2) {
      const n = parseInt(v, 10);
      if (n > 31) v = "31";
      if (n < 1) v = "01";
    }
    // Auto-pad if first digit > 3
    if (v.length === 1 && parseInt(v, 10) > 3) {
      v = "0" + v;
    }
    buildValue(year, month, v);
  };

  // Backspace on empty field → focus previous
  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    prevRef: React.RefObject<HTMLInputElement | null> | null,
  ) => {
    if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "" && prevRef?.current) {
      prevRef.current.focus();
    }
  };

  const fieldClass =
    "bg-transparent text-center text-text-primary placeholder:text-text-tertiary focus:outline-none";

  return (
    <div
      className={`flex items-center bg-bg-elevated border border-border rounded-xl px-4 py-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 transition ${className || ""}`}
    >
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        placeholder="YYYY"
        value={year}
        onChange={handleYear}
        onKeyDown={(e) => handleKeyDown(e, null)}
        maxLength={4}
        required={required}
        aria-label="Year"
        className={`${fieldClass} w-12`}
      />
      <span className="text-text-tertiary mx-0.5">/</span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        value={month}
        onChange={handleMonth}
        onKeyDown={(e) => handleKeyDown(e, yearRef)}
        maxLength={2}
        aria-label="Month"
        className={`${fieldClass} w-8`}
      />
      <span className="text-text-tertiary mx-0.5">/</span>
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        placeholder="DD"
        value={day}
        onChange={handleDay}
        onKeyDown={(e) => handleKeyDown(e, monthRef)}
        maxLength={2}
        aria-label="Day"
        className={`${fieldClass} w-8`}
      />
    </div>
  );
}
