"use client";

import { cn } from "@lib/utils";
import { ChevronRight, CircleCheck, CircleDot, CircleX, Clock, Plus } from "lucide-react";
import { useState } from "react";

/**
 * Status → icon + color mapping for leaf timeline events.
 * Colors lean on raw palette tokens (with dark variants) since these are
 * semantic states, not theme surface colors.
 */
const STATUS = {
  error: { className: "text-red-500 dark:text-red-400", icon: CircleX },
  info: { className: "text-neutral-400 dark:text-neutral-500", icon: CircleDot },
  pending: { className: "text-amber-500 dark:text-amber-400", icon: Clock },
  success: { className: "text-green-600 dark:text-green-400", icon: CircleCheck },
  warning: { className: "text-amber-500 dark:text-amber-400", icon: CircleDot },
};

const INDENT = 22; // px each nesting level shifts right
const MARKER = 18; // px marker size
const center = (level) => level * INDENT + MARKER / 2;

function EventMarker({ status }) {
  const { icon: Icon, className } = STATUS[status] ?? STATUS.info;
  return <Icon className={cn("size-[18px]", className)} strokeWidth={2} />;
}

function GroupToggle({ open, onClick }) {
  return (
    <button
      aria-expanded={open}
      aria-label={open ? "Collapse group" : "Expand group"}
      className="flex size-[18px] items-center justify-center rounded-full border border-p3-border bg-p3-background-light text-neutral-500 transition-colors hover:text-p3-text dark:border-p3-border-dark dark:bg-p3-background-dark dark:hover:text-p3-text-dark"
      onClick={onClick}
      type="button"
    >
      <Plus className={cn("size-3 transition-transform", open && "rotate-45")} strokeWidth={2.5} />
    </button>
  );
}

/**
 * A single connector running from this row's marker to the next visible row's
 * marker. Straight when the level is unchanged; a rounded elbow when entering
 * (step right) or leaving (step left) a nesting level — together these form one
 * continuous line that weaves into and out of nested groups.
 */
function Connector({ level, nextLevel }) {
  const c = center(level);
  const n = center(nextLevel);
  const base = "absolute z-0 border-p3-border dark:border-p3-border-dark";

  if (nextLevel === level) {
    return (
      <span
        aria-hidden
        className={cn(base, "border-l")}
        style={{ bottom: 0, left: c, top: MARKER }}
      />
    );
  }
  if (nextLevel > level) {
    return (
      <span
        aria-hidden
        className={cn(base, "rounded-bl-[10px] border-b border-l")}
        style={{ bottom: 0, left: c, top: MARKER, width: n - c }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(base, "rounded-br-[10px] border-r border-b")}
      style={{ bottom: 0, left: n, top: MARKER, width: c - n }}
    />
  );
}

function Row({ row, nextLevel }) {
  const { item, level, isGroup, open, onToggle } = row;

  return (
    <div className="relative flex items-start gap-2" style={{ paddingLeft: level * INDENT }}>
      {nextLevel != null && <Connector level={level} nextLevel={nextLevel} />}

      <div className="relative z-10 shrink-0">
        {isGroup ? (
          <GroupToggle onClick={onToggle} open={open} />
        ) : (
          <EventMarker status={item.status} />
        )}
      </div>

      <div className="min-w-0 flex-1 pb-4">
        {isGroup ? (
          <button className="flex items-center gap-1.5 text-left" onClick={onToggle} type="button">
            {item.title && (
              <span className="font-medium text-p3-text text-sm dark:text-p3-text-dark">
                {item.title}
              </span>
            )}
            <span className="text-neutral-400 text-xs">
              {item.title
                ? `${item.children.length} events`
                : `${item.children.length} more events`}
            </span>
            <ChevronRight
              className={cn("size-3.5 text-neutral-400 transition-transform", open && "rotate-90")}
            />
          </button>
        ) : (
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="font-medium text-p3-text text-sm dark:text-p3-text-dark">
                {item.title}
              </span>
              {item.time && <span className="text-neutral-400 text-xs">{item.time}</span>}
            </div>
            {item.description && (
              <p className="text-neutral-500 text-xs dark:text-neutral-400">{item.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Collect keys of groups that should start open. */
function collectOpen(items, parentKey, acc) {
  items.forEach((item, i) => {
    const key = item.id ?? `${parentKey}/${i}`;
    if (Array.isArray(item.children) && item.children.length > 0) {
      if (item.defaultOpen) acc.add(key);
      collectOpen(item.children, key, acc);
    }
  });
  return acc;
}

/** Flatten the visible tree (respecting open state) into ordered rows. */
function flatten(items, openIds, level, parentKey, acc) {
  items.forEach((item, i) => {
    const key = item.id ?? `${parentKey}/${i}`;
    const isGroup = Array.isArray(item.children) && item.children.length > 0;
    const open = isGroup && openIds.has(key);
    acc.push({ isGroup, item, key, level, open });
    if (open) flatten(item.children, openIds, level + 1, key, acc);
  });
  return acc;
}

/**
 * Timeline — renders a (optionally nested) timeline of events as one continuous
 * line that weaves into and out of collapsible groups.
 *
 * @param {Object[]} items - event nodes
 * @param {string}   items[].title       - event label (omit on a group to render "N more events")
 * @param {string}  [items[].time]       - pre-formatted relative time, e.g. "1m ago"
 * @param {string}  [items[].description]
 * @param {('error'|'success'|'warning'|'pending'|'info')} [items[].status] - leaf marker
 * @param {Object[]} [items[].children]  - nested events; turns the node into a collapsible group
 * @param {boolean} [items[].defaultOpen]
 */
export function Timeline({ items = [], className }) {
  const [openIds, setOpenIds] = useState(() => collectOpen(items, "", new Set()));

  const toggle = (key) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const rows = flatten(items, openIds, 0, "", []);

  return (
    <div className={cn("flex flex-col", className)}>
      {rows.map((row, i) => (
        <Row
          key={row.key}
          nextLevel={i < rows.length - 1 ? rows[i + 1].level : null}
          row={{ ...row, onToggle: () => toggle(row.key) }}
        />
      ))}
    </div>
  );
}
