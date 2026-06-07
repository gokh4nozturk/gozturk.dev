"use client";

import { cn } from "@lib/utils";
import { ChevronRight, CircleCheck, CircleDot, CircleX, Clock, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
const RADIUS = 8; // px connector corner radius
const GAP = 10; // px vertical approach into a marker after a turn
const center = (level) => level * INDENT + MARKER / 2;

const lineCls = "absolute z-0 border-p3-border dark:border-p3-border-dark";

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
 * Vertical line + rounded turn leaving this marker toward the next visible row.
 * Straight when the level is unchanged; an elbow (stopping a corner-radius short
 * of the next marker, so the next row's incoming corner completes the curve)
 * when stepping into or out of a nesting level.
 */
function OutgoingLine({ level, nextLevel, top }) {
  if (nextLevel == null) return null;
  const c = center(level);

  if (nextLevel === level) {
    return (
      <span aria-hidden className={cn(lineCls, "border-l")} style={{ bottom: 0, left: c, top }} />
    );
  }

  const n = center(nextLevel);
  if (nextLevel > level) {
    // step right: vertical (border-l) at c, floor turning right toward n
    return (
      <span
        aria-hidden
        className={cn(lineCls, "rounded-bl-[8px] border-b border-l")}
        style={{ bottom: 0, left: c, top, width: n - RADIUS - c }}
      />
    );
  }
  // step left: vertical (border-r) at c, floor turning left toward n.
  // Right edge is c + 1 so the 1px border lands on the same column as border-l.
  return (
    <span
      aria-hidden
      className={cn(lineCls, "rounded-br-[8px] border-r border-b")}
      style={{ bottom: 0, left: n + RADIUS, top, width: c + 1 - RADIUS - n }}
    />
  );
}

/**
 * Rounded turn arriving at this marker from the previous row, plus a short
 * vertical drop into the marker — only when the previous row sat at a different
 * level. This is the second half of an elbow and gives the marker breathing
 * room from the curve.
 */
function IncomingLine({ level, prevLevel }) {
  if (prevLevel == null || prevLevel === level) return null;
  const c = center(level);

  if (prevLevel < level) {
    // arrived from the left (stepping in): top-right rounded corner.
    // Right edge is c + 1 so the 1px border lands on the same column as border-l.
    return (
      <span
        aria-hidden
        className={cn(lineCls, "rounded-tr-[8px] border-t border-r")}
        style={{ height: GAP, left: c - RADIUS, top: 0, width: RADIUS + 1 }}
      />
    );
  }
  // arrived from the right (stepping out): top-left rounded corner
  return (
    <span
      aria-hidden
      className={cn(lineCls, "rounded-tl-[8px] border-t border-l")}
      style={{ height: GAP, left: c, top: 0, width: RADIUS }}
    />
  );
}

function Row({ row, prevLevel, nextLevel }) {
  const { item, level, isGroup, open, onToggle } = row;
  const stepped = prevLevel != null && prevLevel !== level;
  const markerTop = stepped ? GAP : 0;

  return (
    <div
      className="relative flex items-start gap-2"
      style={{ paddingLeft: level * INDENT, paddingTop: markerTop }}
    >
      <IncomingLine level={level} prevLevel={prevLevel} />
      <OutgoingLine level={level} nextLevel={nextLevel} top={markerTop + MARKER} />

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
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  const rows = flatten(items, openIds, 0, "", []);

  return (
    <div className={cn("flex flex-col", className)}>
      <AnimatePresence initial={false}>
        {rows.map((row, i) => (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            key={row.key}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Row
              nextLevel={i < rows.length - 1 ? rows[i + 1].level : null}
              prevLevel={i > 0 ? rows[i - 1].level : null}
              row={{ ...row, onToggle: () => toggle(row.key) }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
