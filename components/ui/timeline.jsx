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

function EventMarker({ status }) {
  const { icon: Icon, className } = STATUS[status] ?? STATUS.info;
  return (
    <span className="absolute top-0.5 left-0 flex size-[18px] items-center justify-center bg-p3-background">
      <Icon className={cn("size-[18px]", className)} strokeWidth={2} />
    </span>
  );
}

function GroupToggle({ open, onClick }) {
  return (
    <button
      aria-expanded={open}
      className="absolute top-0.5 left-0 flex size-[18px] items-center justify-center rounded-full border border-p3-border bg-p3-background text-neutral-500 transition-colors hover:text-p3-text"
      onClick={onClick}
      type="button"
    >
      <Plus className={cn("size-3 transition-transform", open && "rotate-45")} strokeWidth={2.5} />
    </button>
  );
}

function TimelineItem({ item, isLast }) {
  const isGroup = Array.isArray(item.children) && item.children.length > 0;
  const [open, setOpen] = useState(item.defaultOpen ?? false);

  return (
    <li className="relative pl-7">
      {/* connector line */}
      {!isLast && (
        <span aria-hidden className="absolute top-5 bottom-0 left-[8px] w-px bg-p3-border" />
      )}

      {isGroup ? (
        <GroupToggle onClick={() => setOpen((v) => !v)} open={open} />
      ) : (
        <EventMarker status={item.status} />
      )}

      {isGroup ? (
        <div>
          <button
            className="group flex items-center gap-1.5 text-left"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {item.title && <span className="font-medium text-p3-text text-sm">{item.title}</span>}
            <span className="text-neutral-400 text-xs">
              {item.title
                ? `${item.children.length} events`
                : `${item.children.length} more events`}
            </span>
            <ChevronRight
              className={cn("size-3.5 text-neutral-400 transition-transform", open && "rotate-90")}
            />
          </button>

          {open && (
            <ul className="mt-2 space-y-4">
              {item.children.map((child, i) => (
                <TimelineItem
                  isLast={i === item.children.length - 1}
                  item={child}
                  key={child.id ?? i}
                />
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-p3-text text-sm">{item.title}</span>
            {item.time && <span className="text-neutral-400 text-xs">{item.time}</span>}
          </div>
          {item.description && (
            <p className="text-neutral-500 text-xs dark:text-neutral-400">{item.description}</p>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * Timeline — renders a (optionally nested) timeline of events.
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
  return (
    <ul className={cn("space-y-4", className)}>
      {items.map((item, i) => (
        <TimelineItem isLast={i === items.length - 1} item={item} key={item.id ?? i} />
      ))}
    </ul>
  );
}
