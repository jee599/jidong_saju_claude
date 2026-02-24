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

/* ─── props ─── */
interface DateInputProps {
  value: string; // YYYY-MM-DD or ""
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

/* ─── helpers ─── */
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function startDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDisplay(value: string): string {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
}

function parseValue(value: string): { year: number; month: number; day: number } | null {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { year: parts[0], month: parts[1] - 1, day: parts[2] };
}

/* ─── year range for dropdown ─── */
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1920;
const MAX_YEAR = CURRENT_YEAR;

/* ─── component ─── */
export function DateInput({ value, onChange, className, required }: DateInputProps) {
  const parsed = parseValue(value);
  const today = useMemo(() => new Date(), []);

  // Calendar view state
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear() - 30);
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());
  const [mode, setMode] = useState<"calendar" | "year">("calendar");
  const [focusedDay, setFocusedDay] = useState<number | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Sync view when value changes externally
  useEffect(() => {
    const p = parseValue(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMode("calendar");
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
        setMode("calendar");
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  /* ─── navigation ─── */
  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => Math.max(MIN_YEAR, y - 1));
        return 11;
      }
      return m - 1;
    });
    setFocusedDay(null);
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => Math.min(MAX_YEAR, y + 1));
        return 0;
      }
      return m + 1;
    });
    setFocusedDay(null);
  }, []);

  /* ─── select a day ─── */
  const selectDay = useCallback(
    (day: number) => {
      const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
      onChange(dateStr);
      setOpen(false);
      setMode("calendar");
      // Return focus to trigger
      setTimeout(() => triggerRef.current?.focus(), 0);
    },
    [viewYear, viewMonth, onChange],
  );

  /* ─── select a year (from year picker) ─── */
  const selectYear = useCallback((y: number) => {
    setViewYear(y);
    setMode("calendar");
  }, []);

  /* ─── keyboard navigation in calendar grid ─── */
  const totalDays = daysInMonth(viewYear, viewMonth);

  const handleCalendarKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const current = focusedDay ?? parsed?.day ?? 1;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (current > 1) setFocusedDay(current - 1);
          else prevMonth();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (current < totalDays) setFocusedDay(current + 1);
          else nextMonth();
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
          selectDay(current);
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
    [focusedDay, parsed, totalDays, prevMonth, nextMonth, selectDay],
  );

  /* ─── build calendar grid ─── */
  const startDay = startDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const isSelected = (day: number) =>
    parsed !== null &&
    parsed.year === viewYear &&
    parsed.month === viewMonth &&
    parsed.day === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const isFocused = (day: number) => focusedDay === day;

  /* ─── year picker grid ─── */
  const yearPageSize = 12;
  const [yearPageStart, setYearPageStart] = useState(
    Math.floor(((parsed?.year ?? CURRENT_YEAR - 30) - MIN_YEAR) / yearPageSize) * yearPageSize + MIN_YEAR,
  );
  const yearPageEnd = Math.min(yearPageStart + yearPageSize - 1, MAX_YEAR);
  const yearRange: number[] = [];
  for (let y = yearPageStart; y <= yearPageEnd; y++) yearRange.push(y);

  // Reset year page when opening year mode
  useEffect(() => {
    if (mode === "year") {
      const centered = Math.floor((viewYear - MIN_YEAR) / yearPageSize) * yearPageSize + MIN_YEAR;
      setYearPageStart(centered);
    }
  }, [mode, viewYear]);

  /* ─── render ─── */
  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setMode("calendar");
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="생년월일 선택"
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
          {value ? formatDisplay(value) : "날짜를 선택하세요"}
        </span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 ml-auto text-text-tertiary shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
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

      {/* Calendar popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={calendarRef}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label="달력"
            className="absolute z-50 left-0 right-0 mt-2 bg-bg-elevated border border-border rounded-xl shadow-elevation-3 overflow-hidden"
          >
            {mode === "calendar" ? (
              /* ─── Calendar view ─── */
              <div>
                {/* Header: month/year nav */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-subtle">
                  <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="이전 달"
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("year")}
                    aria-label="연도 선택"
                    className="text-sm font-semibold text-text-primary hover:text-brand transition px-2 py-1 rounded-lg hover:bg-brand-muted"
                  >
                    {viewYear}년 {MONTHS[viewMonth]}
                  </button>

                  <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="다음 달"
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 px-2 pt-2">
                  {WEEKDAYS.map((wd, i) => (
                    <div
                      key={wd}
                      className={`text-center text-[10px] font-medium pb-1.5 ${
                        i === 0 ? "text-danger" : i === 6 ? "text-info" : "text-text-tertiary"
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
                  aria-label={`${viewYear}년 ${MONTHS[viewMonth]}`}
                  tabIndex={0}
                  onKeyDown={handleCalendarKeyDown}
                >
                  {cells.map((day, i) =>
                    day === null ? (
                      <div key={`empty-${i}`} className="h-9" />
                    ) : (
                      <button
                        key={day}
                        type="button"
                        role="gridcell"
                        aria-selected={isSelected(day)}
                        aria-current={isToday(day) ? "date" : undefined}
                        tabIndex={-1}
                        onClick={() => selectDay(day)}
                        className={`h-9 rounded-lg text-sm transition-all relative
                          ${isSelected(day)
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
                      setViewYear(today.getFullYear());
                      setViewMonth(today.getMonth());
                    }}
                    className="w-full text-[11px] text-text-tertiary hover:text-brand py-1 transition"
                  >
                    오늘: {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일
                  </button>
                </div>
              </div>
            ) : (
              /* ─── Year picker view ─── */
              <div>
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setYearPageStart((s) => Math.max(MIN_YEAR, s - yearPageSize))}
                    disabled={yearPageStart <= MIN_YEAR}
                    aria-label="이전 연도"
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <span className="text-sm font-semibold text-text-primary">
                    {yearPageStart} – {yearPageEnd}
                  </span>
                  <button
                    type="button"
                    onClick={() => setYearPageStart((s) => Math.min(MAX_YEAR - yearPageSize + 1, s + yearPageSize))}
                    disabled={yearPageEnd >= MAX_YEAR}
                    aria-label="다음 연도"
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sunken transition disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-3">
                  {yearRange.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => selectYear(y)}
                      className={`py-2.5 rounded-lg text-sm transition-all
                        ${y === viewYear
                          ? "bg-brand text-white font-semibold shadow-brand"
                          : "text-text-primary hover:bg-bg-sunken"
                        }
                      `}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                <div className="px-3 pb-2">
                  <button
                    type="button"
                    onClick={() => setMode("calendar")}
                    className="w-full text-[11px] text-text-tertiary hover:text-brand py-1 transition"
                  >
                    달력으로 돌아가기
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
