"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/dictionary";

/* ─── props ─── */
interface DateInputProps {
  value: string; // YYYY-MM-DD or ""
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

/* ─── helpers (exported for tests) ─── */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function startDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDisplay(
  value: string,
  locale: Locale,
  monthNames: readonly string[],
): string {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  const mi = parseInt(m, 10);
  const di = parseInt(d, 10);
  if (locale === "ko") {
    return `${y}년 ${mi}월 ${di}일`;
  }
  return `${monthNames[mi - 1]} ${di}, ${y}`;
}

export function parseValue(
  value: string,
): { year: number; month: number; day: number } | null {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { year: parts[0], month: parts[1] - 1, day: parts[2] };
}

export function buildDateString(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function buildCalendarGrid(
  year: number,
  month: number,
): (number | null)[] {
  const start = startDayOfMonth(year, month);
  const total = daysInMonth(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

/* ─── year range ─── */
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1920;
const MAX_YEAR = CURRENT_YEAR;

type DateStep = "year" | "month" | "day";

/* ─── component ─── */
export function DateInput({
  value,
  onChange,
  className,
  required,
}: DateInputProps) {
  const t = useTranslations();
  const dp = t.datePicker;
  const parsed = parseValue(value);
  const today = useMemo(() => new Date(), []);

  // Popup state
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<DateStep>(parsed ? "day" : "year");

  // Selection state (separate from final value to allow step-by-step)
  const [selectedYear, setSelectedYear] = useState<number | null>(
    parsed?.year ?? null,
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    parsed?.month ?? null,
  );
  const [focusedDay, setFocusedDay] = useState<number | null>(null);

  // Year pagination
  const yearPageSize = 12;
  const [yearPageStart, setYearPageStart] = useState(() => {
    const base = parsed?.year ?? CURRENT_YEAR - 30;
    return (
      Math.floor((base - MIN_YEAR) / yearPageSize) * yearPageSize + MIN_YEAR
    );
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync when value changes externally
  useEffect(() => {
    const p = parseValue(value);
    if (p) {
      setSelectedYear(p.year);
      setSelectedMonth(p.month);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  /* ─── open popup ─── */
  const openPicker = useCallback(() => {
    const p = parseValue(value);
    if (p) {
      setSelectedYear(p.year);
      setSelectedMonth(p.month);
      setStep("day");
    } else {
      setStep("year");
    }
    setFocusedDay(null);
    setOpen(true);
  }, [value]);

  /* ─── year selection ─── */
  const handleSelectYear = useCallback((y: number) => {
    setSelectedYear(y);
    setStep("month");
  }, []);

  /* ─── month selection ─── */
  const handleSelectMonth = useCallback((m: number) => {
    setSelectedMonth(m);
    setStep("day");
    setFocusedDay(null);
  }, []);

  /* ─── day selection ─── */
  const handleSelectDay = useCallback(
    (day: number) => {
      if (selectedYear === null || selectedMonth === null) return;
      const dateStr = buildDateString(selectedYear, selectedMonth, day);
      onChange(dateStr);
      setOpen(false);
      setTimeout(() => triggerRef.current?.focus(), 0);
    },
    [selectedYear, selectedMonth, onChange],
  );

  /* ─── day grid navigation ─── */
  const dayViewYear = selectedYear ?? today.getFullYear();
  const dayViewMonth = selectedMonth ?? today.getMonth();
  const totalDays = daysInMonth(dayViewYear, dayViewMonth);
  const cells = buildCalendarGrid(dayViewYear, dayViewMonth);

  const handleCalendarKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const current = focusedDay ?? parsed?.day ?? 1;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (current > 1) setFocusedDay(current - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (current < totalDays) setFocusedDay(current + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (current > 7) setFocusedDay(current - 7);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (current + 7 <= totalDays) setFocusedDay(current + 7);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleSelectDay(current);
          break;
        case "Home":
          e.preventDefault();
          setFocusedDay(1);
          break;
        case "End":
          e.preventDefault();
          setFocusedDay(totalDays);
          break;
      }
    },
    [focusedDay, parsed, totalDays, handleSelectDay],
  );

  const isSelected = (day: number) =>
    parsed !== null &&
    parsed.year === dayViewYear &&
    parsed.month === dayViewMonth &&
    parsed.day === day;

  const isToday = (day: number) =>
    today.getFullYear() === dayViewYear &&
    today.getMonth() === dayViewMonth &&
    today.getDate() === day;

  const isFocused = (day: number) => focusedDay === day;

  /* ─── year grid ─── */
  useEffect(() => {
    if (step === "year") {
      const base = selectedYear ?? CURRENT_YEAR - 30;
      setYearPageStart(
        Math.floor((base - MIN_YEAR) / yearPageSize) * yearPageSize + MIN_YEAR,
      );
    }
  }, [step, selectedYear]);

  const yearPageEnd = Math.min(yearPageStart + yearPageSize - 1, MAX_YEAR);
  const yearRange: number[] = [];
  for (let y = yearPageStart; y <= yearPageEnd; y++) yearRange.push(y);

  /* ─── derive locale from dictionary key ─── */
  const locale: Locale = dp.weekdays[0] === "일" ? "ko" : "en";

  /* ─── back arrow icon ─── */
  const BackIcon = (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>
  );

  const ChevronRight = (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  );

  /* ─── render ─── */
  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={dp.selectDate}
        className={`flex items-center w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-left transition
          focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30
          ${open ? "border-brand ring-1 ring-brand/30" : ""}
          ${!value ? "text-text-tertiary" : "text-text-primary"}`}
      >
        {/* Calendar icon */}
        <svg
          className="w-4 h-4 mr-2.5 text-text-tertiary shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
        <span className="text-sm truncate">
          {value
            ? formatDisplay(value, locale, dp.months)
            : dp.selectDate}
        </span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 ml-auto text-text-tertiary shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Hidden native input for form required validation */}
      {required && (
        <input
          type="text"
          required
          value={value}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 opacity-0 pointer-events-none"
        />
      )}

      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label={dp.selectDate}
            className="absolute z-50 left-0 right-0 mt-2 bg-bg-elevated border border-border rounded-xl shadow-elevation-3 overflow-hidden"
          >
            {/* ─── STEP: Year ─── */}
            {step === "year" && (
              <div>
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-subtle">
                  <button
                    type="button"
                    onClick={() =>
                      setYearPageStart((s) =>
                        Math.max(MIN_YEAR, s - yearPageSize),
                      )
                    }
                    disabled={yearPageStart <= MIN_YEAR}
                    aria-label="Previous years"
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition disabled:opacity-30"
                  >
                    {BackIcon}
                  </button>
                  <span className="text-sm font-semibold text-text-primary">
                    {dp.selectYear}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setYearPageStart((s) =>
                        Math.min(MAX_YEAR - yearPageSize + 1, s + yearPageSize),
                      )
                    }
                    disabled={yearPageEnd >= MAX_YEAR}
                    aria-label="Next years"
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition disabled:opacity-30"
                  >
                    {ChevronRight}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-3">
                  {yearRange.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleSelectYear(y)}
                      className={`py-3 rounded-lg text-sm font-medium transition-all active:scale-95
                        ${
                          y === selectedYear
                            ? "bg-brand text-white shadow-brand"
                            : "text-text-primary hover:bg-bg-sunken"
                        }
                      `}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                <div className="px-3 pb-2 text-center">
                  <span className="text-[10px] text-text-tertiary">
                    {yearPageStart} – {yearPageEnd}
                  </span>
                </div>
              </div>
            )}

            {/* ─── STEP: Month ─── */}
            {step === "month" && (
              <div>
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setStep("year")}
                    aria-label={dp.back}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition"
                  >
                    {BackIcon}
                  </button>
                  <span className="text-sm font-semibold text-text-primary">
                    {selectedYear}
                    {dp.yearSuffix} &middot; {dp.selectMonth}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-3">
                  {dp.months.map((monthName, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectMonth(i)}
                      className={`py-3 rounded-lg text-sm font-medium transition-all active:scale-95
                        ${
                          i === selectedMonth &&
                          selectedYear === parsed?.year
                            ? "bg-brand text-white shadow-brand"
                            : "text-text-primary hover:bg-bg-sunken"
                        }
                      `}
                    >
                      {monthName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── STEP: Day ─── */}
            {step === "day" && (
              <div>
                {/* Header: shows selected year + month, with back to month */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setStep("month")}
                    aria-label={dp.back}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition"
                  >
                    {BackIcon}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("year")}
                    className="text-sm font-semibold text-text-primary hover:text-brand transition px-1"
                  >
                    {dayViewYear}
                    {dp.yearSuffix}
                  </button>
                  <span className="text-text-tertiary text-sm">/</span>
                  <button
                    type="button"
                    onClick={() => setStep("month")}
                    className="text-sm font-semibold text-text-primary hover:text-brand transition px-1"
                  >
                    {dp.months[dayViewMonth]}
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 px-2 pt-2">
                  {dp.weekdays.map((wd, i) => (
                    <div
                      key={wd}
                      className={`text-center text-[10px] font-medium pb-1.5 ${
                        i === 0
                          ? "text-danger"
                          : i === 6
                            ? "text-info"
                            : "text-text-tertiary"
                      }`}
                    >
                      {wd}
                    </div>
                  ))}
                </div>

                {/* Day grid */}
                <div
                  className="grid grid-cols-7 gap-0.5 px-2 pb-2"
                  role="grid"
                  aria-label={`${dayViewYear} ${dp.months[dayViewMonth]}`}
                  tabIndex={0}
                  onKeyDown={handleCalendarKeyDown}
                >
                  {cells.map((day, i) =>
                    day === null ? (
                      <div key={`empty-${i}`} className="h-10" />
                    ) : (
                      <button
                        key={day}
                        type="button"
                        role="gridcell"
                        aria-selected={isSelected(day)}
                        aria-current={isToday(day) ? "date" : undefined}
                        tabIndex={-1}
                        onClick={() => handleSelectDay(day)}
                        className={`h-10 rounded-lg text-sm transition-all relative active:scale-95
                          ${
                            isSelected(day)
                              ? "bg-brand text-white font-semibold shadow-brand"
                              : isToday(day)
                                ? "text-brand font-medium ring-1 ring-brand/40"
                                : "text-text-primary hover:bg-bg-sunken"
                          }
                          ${isFocused(day) && !isSelected(day) ? "ring-2 ring-brand/60" : ""}
                          ${i % 7 === 0 && !isSelected(day) ? "text-danger/80" : ""}
                          ${i % 7 === 6 && !isSelected(day) ? "text-info/80" : ""}
                        `}
                      >
                        {day}
                      </button>
                    ),
                  )}
                </div>

                {/* Today shortcut */}
                <div className="px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYear(today.getFullYear());
                      setSelectedMonth(today.getMonth());
                      handleSelectDay(today.getDate());
                    }}
                    className="w-full text-[11px] text-text-tertiary hover:text-brand py-1 transition"
                  >
                    {dp.today}: {locale === "ko"
                      ? `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`
                      : `${dp.months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
