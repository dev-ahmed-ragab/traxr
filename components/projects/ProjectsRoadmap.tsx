"use client";
/* ─── Traxr · projects roadmap / timeline view ─────────────────────────────────
   Visual Gantt-style timeline for projects:
     • Dynamic timescale grouped by Quarters and Months
     • Horizontal project bars mapped to start_date and target_date
     • Inner progress fill (% completed issues) styled with project color
     • Milestones plotted as diamond markers (◆) along the bar
     • Today marker spanning all rows with snap-to-today button
     • Seamless integration with Traxr design tokens and light/dark theme
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays, ChevronLeft, ChevronRight, CornerRightDown, Hexagon, Milestone as MilestoneIcon,
  Plus, Target,
} from "lucide-react";
import { useSync } from "@/lib/sync/store";
import { HEALTH_LABEL, PROJECT_STATUS_LABEL, displayName } from "@/lib/model";
import { hrefFor, linkProps, navigate } from "@/lib/router";
import { addDaysISO, daysBetween, formatDate, localToday } from "@/lib/format";
import { Avatar } from "@/components/primitives/Avatar";
import { HealthDot, ProjectIcon, ProjectStatusIcon } from "@/components/primitives/icons";
import { Button, IconButton, Tooltip } from "@/components/primitives/controls";
import { pct, type Progress } from "./shared";
import type { Milestone, Project } from "@/lib/types";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_PX = 8; // width of one day in pixels
const ROW_HEIGHT = 48; // row height in pixels
const SIDEBAR_WIDTH = 260; // width of the sticky left project column

interface MonthCol {
  year: number;
  month: number; // 0-11
  label: string;
  quarter: string;
  startDate: string; // YYYY-MM-DD
  days: number;
  width: number;
  startPx: number;
}

/** Compute month columns between minDate and maxDate */
function generateMonths(minDate: string, maxDate: string): { months: MonthCol[]; totalWidth: number; startISO: string } {
  const [startYear, startMonth] = minDate.split("-").map(Number);
  const [endYear, endMonth] = maxDate.split("-").map(Number);

  const months: MonthCol[] = [];
  let currentYear = startYear;
  let currentMonth = startMonth - 1; // 0-indexed
  let currentPx = 0;

  const targetEnd = endYear * 12 + (endMonth - 1);

  while (currentYear * 12 + currentMonth <= targetEnd) {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const width = daysInMonth * DAY_PX;
    const q = Math.floor(currentMonth / 3) + 1;
    const isoMonth = String(currentMonth + 1).padStart(2, "0");
    const startDate = `${currentYear}-${isoMonth}-01`;

    months.push({
      year: currentYear,
      month: currentMonth,
      label: MONTH_NAMES[currentMonth],
      quarter: `Q${q} ${currentYear}`,
      startDate,
      days: daysInMonth,
      width,
      startPx: currentPx,
    });

    currentPx += width;
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return { months, totalWidth: currentPx, startISO: months[0]?.startDate ?? minDate };
}

export default function ProjectsRoadmap({
  projects,
  progress,
}: {
  projects: Project[];
  progress: Record<string, Progress>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const profiles = useSync((s) => s.profiles);
  const allMilestones = useSync((s) => s.project_milestones);
  const today = localToday();

  // Group milestones by project_id
  const milestonesByProject = useMemo(() => {
    const map = new Map<string, Milestone[]>();
    for (const m of Object.values(allMilestones)) {
      const list = map.get(m.project_id);
      if (list) list.push(m);
      else map.set(m.project_id, [m]);
    }
    return map;
  }, [allMilestones]);

  // Determine timeline date bounds
  const { minDate, maxDate } = useMemo(() => {
    const [todayY, todayM] = today.split("-").map(Number);
    // At least 1 month before today and 5 months after today
    let earliest = new Date(todayY, todayM - 2, 1);
    let latest = new Date(todayY, todayM + 5, 0);

    for (const p of projects) {
      if (p.start_date) {
        const d = new Date(p.start_date);
        if (!isNaN(d.getTime()) && d < earliest) earliest = d;
      }
      if (p.target_date) {
        const d = new Date(p.target_date);
        if (!isNaN(d.getTime()) && d > latest) latest = d;
      }
    }

    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    return { minDate: fmt(earliest), maxDate: fmt(latest) };
  }, [projects, today]);

  // Compute scale and columns
  const { months, totalWidth, startISO } = useMemo(
    () => generateMonths(minDate, maxDate),
    [minDate, maxDate],
  );

  // Group months into quarters
  const quarters = useMemo(() => {
    const qList: { label: string; width: number; startPx: number }[] = [];
    for (const m of months) {
      const last = qList[qList.length - 1];
      if (last && last.label === m.quarter) {
        last.width += m.width;
      } else {
        qList.push({ label: m.quarter, width: m.width, startPx: m.startPx });
      }
    }
    return qList;
  }, [months]);

  // Calculate pixel position for any date string (YYYY-MM-DD)
  const getX = (dateStr: string): number => {
    const days = daysBetween(startISO, dateStr);
    return Math.max(0, days * DAY_PX);
  };

  const todayX = getX(today);

  // Scroll to today marker on initial render
  useEffect(() => {
    if (!timelineRef.current) return;
    const targetScroll = Math.max(0, todayX - 300);
    timelineRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, [todayX]);

  const scrollToToday = () => {
    if (!timelineRef.current) return;
    const targetScroll = Math.max(0, todayX - 300);
    timelineRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  const scrollBy = (offset: number) => {
    if (!timelineRef.current) return;
    timelineRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div ref={containerRef} className="flex h-full min-h-0 flex-col overflow-hidden bg-canvas">
      {/* ── Control bar ── */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-line px-3 text-[12.5px] text-dim">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
          <span className="text-faint">·</span>
          <span className="text-faint">Showing {months[0]?.label} {months[0]?.year} – {months[months.length - 1]?.label} {months[months.length - 1]?.year}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="xs" onClick={scrollToToday} className="h-6 px-2 text-xxs font-medium">
            Today
          </Button>
          <div className="flex items-center rounded border border-line bg-raised">
            <button
              type="button"
              onClick={() => scrollBy(-240)}
              className="flex h-5 w-6 items-center justify-center text-faint hover:text-ink transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={13} />
            </button>
            <div className="h-3 w-px bg-line" />
            <button
              type="button"
              onClick={() => scrollBy(240)}
              className="flex h-5 w-6 items-center justify-center text-faint hover:text-ink transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Gantt viewport ── */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Fixed Left Sidebar: Projects List */}
        <div
          className="z-20 shrink-0 border-r border-line bg-surface shadow-[2px_0_8px_rgba(0,0,0,0.03)]"
          style={{ width: SIDEBAR_WIDTH }}
        >
          {/* Header */}
          <div className="flex h-[49px] items-center border-b border-line px-3 text-xxs font-semibold uppercase tracking-wider text-faint">
            Project
          </div>

          {/* Rows */}
          <div className="overflow-hidden">
            {projects.map((p) => {
              const lead = p.lead_id ? profiles[p.lead_id] : null;
              const prog = progress[p.id];
              return (
                <div
                  key={p.id}
                  style={{ height: ROW_HEIGHT }}
                  className="group flex items-center justify-between border-b border-line/60 px-3 transition-colors hover:bg-wash"
                >
                  <a
                    {...linkProps({ kind: "project", id: p.id, tab: "overview" })}
                    className="flex min-w-0 flex-1 items-center gap-2 pr-2"
                  >
                    <ProjectIcon icon={p.icon} color={p.color} size={15} />
                    <span className="truncate text-[13px] font-medium text-ink group-hover:text-accent">
                      {p.name}
                    </span>
                  </a>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {p.health && <HealthDot health={p.health} size={7} />}
                    {p.lead_id && (
                      <Avatar
                        userId={p.lead_id}
                        size={18}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Right Area: Timeline Header + Bars */}
        <div ref={timelineRef} className="relative min-h-0 flex-1 overflow-x-auto overflow-y-auto">
          <div style={{ width: totalWidth, minHeight: "100%" }} className="relative">
            {/* ── Timeline Header (Sticky top) ── */}
            <div className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur-sm">
              {/* Quarters row */}
              <div className="flex h-6 border-b border-line/60 text-[11px] font-semibold text-faint">
                {quarters.map((q, idx) => (
                  <div
                    key={idx}
                    style={{ width: q.width }}
                    className="flex items-center border-r border-line/50 px-2.5 truncate"
                  >
                    {q.label}
                  </div>
                ))}
              </div>
              {/* Months row */}
              <div className="flex h-6 text-xxs font-medium text-dim">
                {months.map((m, idx) => (
                  <div
                    key={idx}
                    style={{ width: m.width }}
                    className="flex items-center border-r border-line/50 px-2.5"
                  >
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Vertical grid lines ── */}
            <div className="pointer-events-none absolute inset-0 top-[49px] flex">
              {months.map((m, idx) => (
                <div
                  key={idx}
                  style={{ width: m.width }}
                  className="h-full border-r border-line/40"
                />
              ))}
            </div>

            {/* ── Today Marker Line ── */}
            {todayX >= 0 && todayX <= totalWidth && (
              <div
                style={{ left: todayX }}
                className="pointer-events-none absolute bottom-0 top-0 z-10 flex flex-col items-center"
              >
                <div className="sticky top-[25px] -mt-1.5 rounded bg-accent px-1.5 py-0.5 text-[9.5px] font-semibold leading-tight text-accent-ink shadow-sm">
                  Today
                </div>
                <div className="w-px flex-1 bg-accent/80 shadow-[0_0_8px_var(--accent)]" />
              </div>
            )}

            {/* ── Project Bars Rows ── */}
            <div className="relative pt-0">
              {projects.map((p) => {
                const prog = progress[p.id];
                const ratio = prog?.ratio ?? 0;
                const pPct = pct(ratio);
                const pMilestones = milestonesByProject.get(p.id) ?? [];

                // Calculate bar bounds
                let barLeft = 0;
                let barWidth = 0;
                let hasDates = Boolean(p.start_date || p.target_date);

                if (p.start_date && p.target_date) {
                  barLeft = getX(p.start_date);
                  barWidth = Math.max(28, getX(p.target_date) - barLeft);
                } else if (p.target_date) {
                  const impliedStart = addDaysISO(p.target_date, -28);
                  barLeft = getX(impliedStart);
                  barWidth = Math.max(28, getX(p.target_date) - barLeft);
                } else if (p.start_date) {
                  barLeft = getX(p.start_date);
                  barWidth = 140; // placeholder 2 weeks
                } else {
                  // Fallback: place in current week
                  barLeft = Math.max(0, todayX - 20);
                  barWidth = 120;
                }

                const projectColor = p.color || "var(--accent)";

                return (
                  <div
                    key={p.id}
                    style={{ height: ROW_HEIGHT }}
                    className="group relative flex items-center border-b border-line/40 px-2 transition-colors hover:bg-wash/40"
                  >
                    {/* The Gantt Bar */}
                    <div
                      style={{
                        left: barLeft,
                        width: barWidth,
                      }}
                      onClick={() => navigate({ kind: "project", id: p.id, tab: "overview" })}
                      className={`absolute flex h-7 cursor-pointer items-center overflow-hidden rounded-md border text-xs shadow-card transition-all hover:scale-[1.01] hover:shadow-pop ${
                        hasDates
                          ? "border-line-strong bg-surface hover:border-accent"
                          : "border-dashed border-faint/60 bg-surface/60 opacity-80"
                      }`}
                    >
                      {/* Inner completion progress bar */}
                      <div
                        style={{
                          width: `${pPct}%`,
                          backgroundColor: projectColor,
                          opacity: 0.22,
                        }}
                        className="absolute inset-y-0 left-0 transition-[width] duration-300 pointer-events-none"
                      />

                      {/* Accent color left pill indicator */}
                      <div
                        style={{ backgroundColor: projectColor }}
                        className="h-full w-1.5 shrink-0"
                      />

                      {/* Content inside the bar */}
                      <div className="relative z-[1] flex min-w-0 flex-1 items-center justify-between gap-1.5 px-2">
                        <span className="truncate text-[12px] font-medium text-ink">
                          {p.name}
                        </span>

                        <div className="flex shrink-0 items-center gap-1.5 text-xxs font-semibold">
                          {p.health && (
                            <span className="hidden sm:inline text-faint">
                              {HEALTH_LABEL[p.health]}
                            </span>
                          )}
                          <span
                            style={{ color: projectColor }}
                            className="tabular-nums"
                          >
                            {pPct}%
                          </span>
                        </div>
                      </div>

                      {/* Milestones diamond markers */}
                      {pMilestones.map((m) => {
                        if (!m.target_date) return null;
                        const mX = getX(m.target_date) - barLeft;
                        if (mX < 0 || mX > barWidth) return null;

                        return (
                          <div
                            key={m.id}
                            style={{ left: mX }}
                            title={`Milestone: ${m.name} (${formatDate(m.target_date)})`}
                            className="absolute -top-1 z-10 -ml-1.5 h-3 w-3 rotate-45 rounded-[1px] border border-surface bg-ink shadow-sm"
                          />
                        );
                      })}
                    </div>

                    {/* Target date label badge right after the bar */}
                    {p.target_date && (
                      <span
                        style={{ left: barLeft + barWidth + 8 }}
                        className="absolute hidden whitespace-nowrap text-[11px] text-faint lg:inline"
                      >
                        {formatDate(p.target_date)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
