"use client";

/**
 * @author: @dorianbaffier
 * @description: Account Menu (Kokonut UI) - adapted for Nivara Design System
 * @version: 2.0.0
 * @date: 2026-10-14
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Settings,
  Sun,
  User,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  type Transition,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface Account {
  id: string;
  name: string;
  email: string;
  /** Shown in the avatar. Defaults to the first letters of `name`. */
  initials?: string;
  /** Plain label shown in the menu header, such as "Pro" or "Counsellor". */
  plan?: string;
}

export type AccountStatus = "online" | "away" | "busy";
export type AccountTheme = "light" | "dark" | "system";

export interface ProfileMenuItem {
  label: string;
  icon?: ReactNode;
  /** Quiet text on the right, such as a plan name or a shortcut. */
  value?: string;
  /** Renders the item as a link. Without it the item is a button. */
  href?: string;
  /** Opens `href` in a new tab. */
  external?: boolean;
  onSelect?: () => void;
  highlight?: boolean;
}

export interface ProfileDropdownProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  accounts?: Account[];
  defaultAccountId?: string;
  onAccountChange?: (account: Account) => void;
  onAddAccount?: () => void;
  /** Menu entries between the settings rows and Switch account. */
  items?: ProfileMenuItem[];
  /** Controlled theme. Leave it out to keep the choice in local state. */
  theme?: AccountTheme;
  defaultTheme?: AccountTheme;
  onThemeChange?: (theme: AccountTheme) => void;
  status?: AccountStatus;
  defaultStatus?: AccountStatus;
  onStatusChange?: (status: AccountStatus) => void;
  /** Called once Sign out has been held for `holdDuration` ms. */
  onSignOut?: () => void;
  holdDuration?: number;
  isHeroDark?: boolean;
  triggerClassName?: string;
  showSignOut?: boolean;
  showStatus?: boolean;
  showTheme?: boolean;
  avatarOnly?: boolean;
}

const SAMPLE_ACCOUNTS: Account[] = [
  { id: "personal", name: "Maya Ortega", email: "maya@ortega.me", plan: "Pro" },
  {
    id: "studio",
    name: "Fieldwork Studio",
    email: "team@fieldwork.studio",
    plan: "Team",
  },
];

const SAMPLE_ITEMS: ProfileMenuItem[] = [
  { label: "Profile", icon: <User className="size-4" /> },
  { label: "Settings", icon: <Settings className="size-4" />, value: "⌘," },
  { label: "Billing", icon: <CreditCard className="size-4" /> },
];

const STATUSES: {
  id: AccountStatus;
  label: string;
  name: string;
  dot: string;
}[] = [
  { id: "online", label: "Online", name: "Online", dot: "bg-emerald-500" },
  { id: "away", label: "Away", name: "Away", dot: "bg-amber-500" },
  { id: "busy", label: "DND", name: "Do not disturb", dot: "bg-rose-500" },
];

const THEMES = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
] as const;

// Nature-inspired palette avatar tones matching Nivara
const AVATAR_TONES = [
  "bg-[#1C3A13] text-[#FAF8F4]",
  "bg-[#536044] text-[#FAF8F4]",
  "bg-[#2F302B] text-[#FAF8F4]",
  "bg-[#4A6B3D] text-[#FAF8F4]",
];

const WHITESPACE = /\s+/;
const PANEL_W = 296;
const RADIUS = 18;
const SPRING: Transition = { type: "spring", duration: 0.3, bounce: 0 };
const INDICATOR_SPRING: Transition = {
  type: "spring",
  duration: 0.25,
  bounce: 0,
};
const INSTANT: Transition = { duration: 0 };
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const NAV_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
]);

const ITEM_CLASS =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left text-xs font-medium text-[#2F302B] outline-none transition-colors duration-100 hover:bg-[#1C3A13]/5 focus:bg-[#1C3A13]/10 focus:text-forest dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800";

type Phase = "closed" | "open" | "closing";
type Page = "main" | "accounts";
type Via = "pointer" | "keyboard";

function initialsOf(account: Account) {
  if (account.initials) {
    return account.initials;
  }
  return account.name
    .split(WHITESPACE)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function viaOf(event: MouseEvent): Via {
  return event.detail === 0 ? "keyboard" : "pointer";
}

function menuItems(root: HTMLElement | null) {
  if (!root) {
    return [];
  }
  return Array.from(root.querySelectorAll<HTMLElement>("[data-menu-item]"));
}

function sideTarget(items: HTMLElement[], current: HTMLElement, step: number) {
  const row = items.filter((item) => item.dataset.row === current.dataset.row);
  if (row.length < 2) {
    return;
  }
  const index = row.indexOf(current);
  return row[(index + step + row.length) % row.length];
}

function rowTarget(items: HTMLElement[], current: HTMLElement, step: number) {
  const rows = [...new Set(items.map((item) => item.dataset.row))];
  const index = rows.indexOf(current.dataset.row);
  const next = rows[(index + step + rows.length) % rows.length];
  const candidates = items.filter((item) => item.dataset.row === next);
  return (
    candidates.find((item) => item.getAttribute("aria-checked") === "true") ??
    candidates[0]
  );
}

function nextTarget(
  items: HTMLElement[],
  active: Element | null,
  key: string
): HTMLElement | undefined {
  if (key === "Home") {
    return items[0];
  }
  if (key === "End") {
    return items.at(-1);
  }
  const current = items.find((item) => item === active);
  if (!current) {
    return key === "ArrowUp" ? items.at(-1) : items[0];
  }
  if (key === "ArrowLeft" || key === "ArrowRight") {
    return sideTarget(items, current, key === "ArrowRight" ? 1 : -1);
  }
  return rowTarget(items, current, key === "ArrowDown" ? 1 : -1);
}

function useControllable<T>(
  value: T | undefined,
  fallback: T,
  onChange?: (next: T) => void
) {
  const [local, setLocal] = useState(fallback);
  const set = (next: T) => {
    setLocal(next);
    onChange?.(next);
  };
  return [value ?? local, set] as const;
}

function Avatar({
  account,
  tone,
  className,
}: {
  account: Account;
  tone: number;
  status?: AccountStatus;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 select-none place-items-center rounded-full font-bold text-[11px] tracking-wide shadow-xs",
        AVATAR_TONES[tone % AVATAR_TONES.length],
        className
      )}
    >
      {initialsOf(account)}
    </span>
  );
}

function Identity({
  uid,
  shared,
  account,
  tone,
  status,
  transition,
  stacked,
  isHeroDark,
  avatarOnly,
}: {
  uid: string;
  shared: boolean;
  account: Account;
  tone: number;
  status: AccountStatus;
  transition: Transition;
  stacked: boolean;
  isHeroDark?: boolean;
  avatarOnly?: boolean;
}) {
  const hidden = shared ? undefined : "invisible";
  return (
    <span
      className={cn(
        "flex min-w-0",
        stacked ? "flex-col items-start gap-2.5" : "items-center gap-2"
      )}
    >
      <motion.span
        className={cn("relative z-20 block shrink-0", hidden)}
        key={shared ? "avatar-shared" : "avatar-static"}
        layoutId={shared ? `${uid}-avatar` : undefined}
        transition={transition}
      >
        <Avatar
          account={account}
          className={stacked ? "size-9 text-xs" : "size-8 sm:size-9 text-xs"}
          status={status}
          tone={tone}
        />
      </motion.span>
      {!avatarOnly && (
        <span className="flex min-w-0 flex-col text-left">
          <motion.span
            className={cn(
              "relative z-20 block truncate font-medium text-sm text-[#2F302B] dark:text-zinc-100",
              hidden
            )}
            key={shared ? "name-shared" : "name-static"}
            layoutId={shared ? `${uid}-name` : undefined}
            transition={transition}
          >
            {account.name}
          </motion.span>
          {account.email ? (
            <motion.span
              className={cn(
                "relative z-20 block truncate font-mono text-[11px] text-[#6F6D63] dark:text-zinc-400",
                hidden
              )}
              key={shared ? "email-shared" : "email-static"}
              layoutId={shared ? `${uid}-email` : undefined}
              transition={transition}
            >
              {account.email}
            </motion.span>
          ) : null}
        </span>
      )}
    </span>
  );
}

function Separator() {
  return (
    <hr className="mx-2.5 my-1.5 h-px border-0 bg-[#1C3A13]/10 dark:bg-zinc-800" />
  );
}

function HoldSignOut({
  duration,
  onComplete,
}: {
  duration: number;
  onComplete: (via: Via) => void;
}) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const [nudge, setNudge] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const nudgeTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(nudgeTimer.current);
    },
    []
  );

  const start = (via: Via) => {
    if (timer.current !== undefined || done) {
      return;
    }
    window.clearTimeout(nudgeTimer.current);
    setNudge(false);
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setHolding(false);
      setDone(true);
      onComplete(via);
    }, duration);
  };

  const cancel = () => {
    if (timer.current === undefined) {
      return;
    }
    window.clearTimeout(timer.current);
    timer.current = undefined;
    setHolding(false);
    setNudge(true);
    nudgeTimer.current = window.setTimeout(() => setNudge(false), 1400);
  };

  const label = (
    <>
      <LogOut className="size-3.5 text-[#536044]" />
      <span className="flex-1 font-semibold text-[#536044]">Sign out</span>
      <span className="text-[10px] font-mono opacity-60">
        {nudge ? "Keep holding" : "Hold"}
      </span>
    </>
  );

  return (
    <button
      className={cn(ITEM_CLASS, "relative touch-none select-none text-[#536044] hover:bg-[#536044]/10")}
      data-menu-item=""
      data-row="sign-out"
      onBlur={cancel}
      onClick={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!event.repeat) {
            start("keyboard");
          }
        }
      }}
      onKeyUp={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          cancel();
        }
      }}
      onPointerCancel={cancel}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        start("pointer");
      }}
      onPointerUp={cancel}
      role="menuitem"
      tabIndex={-1}
      type="button"
    >
      {label}
      <span className="sr-only">, press and hold to confirm</span>
      {/* Botanical progress fill */}
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center gap-2.5 rounded-[12px] bg-[#536044] px-2.5 text-[#FAF8F4]"
        style={{
          clipPath:
            holding || done
              ? "inset(0 0 0 0 round 12px)"
              : "inset(0 100% 0 0 round 12px)",
          transition: holding
            ? `clip-path ${duration}ms linear`
            : "clip-path 240ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function StatusRow({
  status,
  onChange,
}: {
  status: AccountStatus;
  onChange: (status: AccountStatus) => void;
}) {
  return (
    <fieldset
      aria-label="Status"
      className="m-0 flex min-w-0 items-center justify-between border-0 py-1 pr-1 pl-2.5"
    >
      <span className="text-xs font-mono text-[#6F6D63] uppercase tracking-wider">Status</span>
      <span className="flex gap-1">
        {STATUSES.map((entry) => {
          const checked = entry.id === status;
          return (
            <button
              aria-checked={checked}
              aria-label={entry.name}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-mono text-[#6F6D63] outline-none transition-colors duration-100 hover:bg-[#1C3A13]/5 aria-checked:text-[#1C3A13] aria-checked:font-bold"
              data-menu-item=""
              data-row="status"
              key={entry.id}
              onClick={() => onChange(entry.id)}
              role="menuitemradio"
              tabIndex={-1}
              type="button"
            >
              <span
                className={cn(
                  "size-1.5 rounded-full transition-colors duration-200",
                  checked ? entry.dot : "bg-zinc-300 dark:bg-zinc-600"
                )}
              />
              {entry.label}
            </button>
          );
        })}
      </span>
    </fieldset>
  );
}

function ThemeRow({
  uid,
  theme,
  onChange,
  reduced,
}: {
  uid: string;
  theme: AccountTheme;
  onChange: (theme: AccountTheme) => void;
  reduced: boolean;
}) {
  return (
    <fieldset
      aria-label="Theme"
      className="m-0 flex min-w-0 items-center justify-between border-0 py-1 pr-1 pl-2.5"
    >
      <span className="text-xs font-mono text-[#6F6D63] uppercase tracking-wider">Theme</span>
      <span className="flex rounded-[10px] bg-stone p-0.5">
        {THEMES.map(({ id, label, Icon }) => {
          const checked = id === theme;
          return (
            <button
              aria-checked={checked}
              aria-label={label}
              className="relative grid h-6 w-8 place-items-center rounded-md text-[#6F6D63] outline-none transition-colors duration-150 hover:text-[#1C3A13] aria-checked:text-[#1C3A13]"
              data-menu-item=""
              data-row="theme"
              key={id}
              onClick={() => onChange(id)}
              role="menuitemradio"
              tabIndex={-1}
              type="button"
            >
              {checked ? (
                <motion.span
                  className="absolute inset-0 rounded-md bg-white shadow-xs"
                  layoutId={`${uid}-theme`}
                  transition={reduced ? INSTANT : INDICATOR_SPRING}
                />
              ) : null}
              <Icon className="relative size-3" />
            </button>
          );
        })}
      </span>
    </fieldset>
  );
}

function LinkItem({
  item,
  index,
  onSelect,
}: {
  item: ProfileMenuItem;
  index: number;
  onSelect: (event: MouseEvent, run?: () => void) => void;
}) {
  const inner = (
    <>
      <span className="text-[#1C3A13] shrink-0">{item.icon}</span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.value ? (
        <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-stone text-[#6F6D63] shrink-0">
          {item.value}
        </span>
      ) : null}
    </>
  );
  const common = {
    className: cn(
      ITEM_CLASS,
      item.highlight && "bg-[#536044]/15 text-[#1C3A13] hover:bg-[#536044]/25 font-semibold"
    ),
    "data-menu-item": "",
    "data-row": `item-${index}`,
    onClick: (event: MouseEvent) => onSelect(event, item.onSelect),
    role: "menuitem",
    tabIndex: -1,
  } as const;

  if (item.href) {
    return (
      <a
        {...common}
        href={item.href}
        {...(item.external && { rel: "noopener noreferrer", target: "_blank" })}
      >
        {inner}
      </a>
    );
  }
  return (
    <button {...common} type="button">
      {inner}
    </button>
  );
}

export default function ProfileDropdown({
  accounts = SAMPLE_ACCOUNTS,
  defaultAccountId,
  onAccountChange,
  onAddAccount,
  items = SAMPLE_ITEMS,
  theme: themeProp,
  defaultTheme = "light",
  onThemeChange,
  status: statusProp,
  defaultStatus = "online",
  onStatusChange,
  onSignOut,
  holdDuration = 1000,
  isHeroDark = false,
  triggerClassName,
  showSignOut = true,
  showStatus = true,
  showTheme = true,
  avatarOnly = false,
  className,
  ...props
}: ProfileDropdownProps) {
  const uid = useId();
  const reduced = useReducedMotion() === true;
  const [phase, setPhase] = useState<Phase>("closed");
  const [instant, setInstant] = useState(false);
  const [page, setPage] = useState<Page>("main");
  const [openSeq, setOpenSeq] = useState(0);
  const [accountId, setAccountId] = useState(
    defaultAccountId ?? accounts[0]?.id
  );
  const [theme, setTheme] = useControllable(
    themeProp,
    defaultTheme,
    onThemeChange
  );
  const [status, setStatus] = useControllable(
    statusProp,
    defaultStatus,
    onStatusChange
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const accountsRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("closed");
  phaseRef.current = phase;

  const openIntent = useRef<{
    focus: "first" | "last" | "menu";
    resume: boolean;
  }>({ focus: "menu", resume: false });
  const pageFocus = useRef<"first" | "switch" | null>(null);
  const closeSeq = useRef(0);
  const targetH = useRef(0);

  const pageX = useMotionValue(0);
  const pageTransform = useMotionTemplate`translate3d(${pageX}px, 0, 0)`;

  const account = accounts.find((entry) => entry.id === accountId) ??
    accounts[0] ?? { id: "guest", name: "Guest", email: "" };
  const tone = Math.max(0, accounts.indexOf(account));
  const others = accounts.filter((entry) => entry.id !== account.id);
  const sharedTransition = instant ? INSTANT : SPRING;
  const sharedInPanel = phase === "open";
  const menuId = `${uid}-menu`;

  const pageEl = (target: Page) =>
    target === "main" ? mainRef.current : accountsRef.current;

  const openMenu = (via: Via, focus: "first" | "last" | "menu") => {
    if (phaseRef.current === "open") {
      return;
    }
    openIntent.current = { focus, resume: false };
    closeSeq.current += 1;
    setInstant(via === "keyboard" || reduced);
    setPage("main");
    setPhase("open");
    setOpenSeq((seq) => seq + 1);
  };

  const closeMenu = (via: Via, returnFocus: boolean) => {
    if (phaseRef.current !== "open") {
      return;
    }
    const trigger = triggerRef.current;
    if (returnFocus) {
      trigger?.focus({ preventScroll: true });
    }
    setInstant(via === "keyboard" || reduced);
    setPhase("closed");
  };

  const goTo = (target: Page) => {
    pageFocus.current = target === "accounts" ? "first" : "switch";
    setPage(target);
  };

  const select = (event: MouseEvent, run?: () => void) => {
    run?.();
    closeMenu(viaOf(event), true);
  };

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const main = mainRef.current;
    if (openSeq === 0 || phaseRef.current !== "open" || !trigger || !main) {
      return;
    }
    pageX.jump(0);
    const list = menuItems(main);
    const targets = {
      first: list[0],
      last: list.at(-1),
      menu: main.querySelector<HTMLElement>("[role=menu]"),
    };
    targets[openIntent.current.focus]?.focus({ preventScroll: true });
  }, [openSeq]);

  useEffect(() => {
    const el = pageEl(page);
    if (phaseRef.current !== "open" || !el) {
      return;
    }
    const x = page === "main" ? 0 : -PANEL_W;
    if (reduced) {
      pageX.jump(x);
    } else {
      animate(pageX, x, SPRING);
    }
    const intent = pageFocus.current;
    pageFocus.current = null;
    if (intent === "first") {
      menuItems(el)[0]?.focus({ preventScroll: true });
    } else if (intent === "switch") {
      el.querySelector<HTMLElement>("[data-switch]")?.focus({
        preventScroll: true,
      });
    }
  }, [page, reduced]);

  // Outside click listener to dismiss
  useEffect(() => {
    if (phase !== "open") {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        closeMenu("pointer", false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown as any);
    return () => window.removeEventListener("pointerdown", onPointerDown as any);
  }, [phase]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu("keyboard", event.key === "ArrowDown" ? "first" : "last");
    }
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu("keyboard", true);
      return;
    }
    if (event.key === "Tab") {
      closeMenu("keyboard", false);
      return;
    }
    if (!NAV_KEYS.has(event.key)) {
      return;
    }
    event.preventDefault();
    const target = nextTarget(
      menuItems(pageEl(page)),
      document.activeElement,
      event.key
    );
    target?.focus({ preventScroll: true });
  };

  return (
    <div
      className={cn(
        "relative isolate inline-block",
        phase !== "closed" && "z-50",
        className
      )}
      ref={wrapperRef}
      {...props}
    >
      <button
        aria-controls={sharedInPanel ? menuId : undefined}
        aria-expanded={sharedInPanel}
        aria-haspopup="menu"
        aria-label={account.name || "Account Menu"}
        className={cn(
          avatarOnly
            ? "flex items-center justify-center rounded-full p-0.5 sm:p-1 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-forest"
            : "flex w-auto items-center gap-2 rounded-full p-1.5 pr-3 text-left outline-none transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-forest",
          isHeroDark
            ? "border border-snow/20 bg-snow/10 hover:bg-snow/20 text-snow backdrop-blur-xs shadow-xs"
            : "border border-forest/15 bg-ivory hover:bg-snow text-earth shadow-2xs",
          triggerClassName
        )}
        onClick={(event) => {
          const via = viaOf(event);
          if (phase === "open") {
            closeMenu(via, false);
          } else {
            openMenu(via, via === "keyboard" ? "first" : "menu");
          }
        }}
        onKeyDown={onTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <span className={cn("min-w-0", !avatarOnly && "flex-1")}>
          <Identity
            account={account}
            avatarOnly={avatarOnly}
            isHeroDark={isHeroDark}
            shared={!sharedInPanel}
            stacked={false}
            status={status}
            tone={tone}
            transition={sharedTransition}
            uid={uid}
          />
        </span>
        {!avatarOnly && (
          <ChevronsUpDown
            aria-hidden="true"
            className={cn(
              "size-3.5 shrink-0 transition-opacity duration-150",
              isHeroDark ? "text-snow/70" : "text-[#6F6D63]",
              phase !== "closed" && "opacity-0"
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {phase === "open" && (
          <motion.div
            key="profile-dropdown-panel"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="pointer-events-auto absolute top-0 right-0 z-50 rounded-[22px] border border-[#1C3A13]/12 bg-[#FCFCF7] shadow-[0_16px_40px_rgba(28,58,19,0.14),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden dark:bg-zinc-900 dark:border-zinc-800"
            style={{ width: PANEL_W }}
            onKeyDown={onPanelKeyDown}
          >
            <motion.div
              className="flex w-max items-start"
              style={{ transform: pageTransform }}
            >
              <div
                className={cn(
                  "shrink-0 p-2 pb-3.5 transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  page !== "main" && "opacity-0"
                )}
                inert={page !== "main"}
                ref={mainRef}
                style={{ width: PANEL_W }}
              >
                <div className="flex items-center justify-between px-2.5 pt-2.5 pb-2.5 border-b border-[#1C3A13]/10 mb-1">
                  <Identity
                    account={account}
                    shared={sharedInPanel}
                    stacked={false}
                    status={status}
                    tone={tone}
                    transition={sharedTransition}
                    uid={uid}
                  />
                  {account.plan ? (
                    <span className="shrink-0 pt-0.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest/10 text-forest font-semibold">
                      {account.plan}
                    </span>
                  ) : null}
                </div>

                <div
                  aria-label={account.name}
                  className="outline-none"
                  id={menuId}
                  role="menu"
                  tabIndex={-1}
                >
                  {showStatus && <StatusRow onChange={setStatus} status={status} />}
                  {showTheme && (
                    <ThemeRow
                      onChange={setTheme}
                      reduced={reduced}
                      theme={theme}
                      uid={uid}
                    />
                  )}
                  {(showStatus || showTheme) && <Separator />}

                  {/* Navigation Items (Sanctuary, Contact Us, 24/7 Support, Register Institution, Portal links) */}
                  <div className="space-y-0.5">
                    {items.map((item, index) => (
                      <LinkItem
                        index={index}
                        item={item}
                        key={item.label}
                        onSelect={select}
                      />
                    ))}
                  </div>

                  {accounts.length > 1 ? (
                    <>
                      <Separator />
                      <button
                        aria-expanded={page === "accounts"}
                        aria-haspopup="menu"
                        className={ITEM_CLASS}
                        data-menu-item=""
                        data-row="switch"
                        data-switch=""
                        onClick={() => goTo("accounts")}
                        role="menuitem"
                        tabIndex={-1}
                        type="button"
                      >
                        <span className="flex -space-x-1.5">
                          {others.slice(0, 2).map((entry) => (
                            <Avatar
                              account={entry}
                              className="size-5 text-[7px] tracking-normal ring-2 ring-white"
                              key={entry.id}
                              tone={accounts.indexOf(entry)}
                            />
                          ))}
                        </span>
                        <span className="flex-1">Switch account</span>
                        <ChevronRight className="size-4 text-[#6F6D63]" />
                      </button>
                    </>
                  ) : null}

                  {showSignOut && (
                    <>
                      <Separator />
                      <HoldSignOut
                        duration={holdDuration}
                        onComplete={(via) => {
                          onSignOut?.();
                          closeMenu(via, true);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Sub-page: Switch accounts */}
              <div
                className={cn(
                  "shrink-0 p-2 pb-3.5 transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  page !== "accounts" && "opacity-0"
                )}
                inert={page !== "accounts"}
                ref={accountsRef}
                style={{ width: PANEL_W }}
              >
                <div
                  aria-label="Switch account"
                  className="outline-none"
                  role="menu"
                  tabIndex={-1}
                >
                  <button
                    className={cn(ITEM_CLASS, "gap-1.5 pl-1.5 font-medium")}
                    data-menu-item=""
                    data-row="back"
                    onClick={() => goTo("main")}
                    role="menuitem"
                    tabIndex={-1}
                    type="button"
                  >
                    <ChevronLeft className="size-4 text-[#6F6D63]" />
                    <span className="sr-only">Back to </span>
                    Switch account
                  </button>
                  <Separator />
                  {accounts.map((entry, index) => {
                    const checked = entry.id === account.id;
                    return (
                      <button
                        aria-checked={checked}
                        className={ITEM_CLASS}
                        data-menu-item=""
                        data-row={`account-${entry.id}`}
                        key={entry.id}
                        onClick={() => {
                          if (!checked) {
                            setAccountId(entry.id);
                            onAccountChange?.(entry);
                          }
                          goTo("main");
                        }}
                        role="menuitemradio"
                        tabIndex={-1}
                        type="button"
                      >
                        <Avatar
                          account={entry}
                          className="size-7"
                          status={checked ? status : undefined}
                          tone={index}
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[#2F302B]">
                            {entry.name}
                          </span>
                          <span className="truncate text-[10px] font-mono text-[#6F6D63]">
                            {entry.email}
                          </span>
                        </span>
                        {checked ? (
                          <Check className="size-4 text-forest" />
                        ) : null}
                      </button>
                    );
                  })}
                  {onAddAccount && (
                    <>
                      <Separator />
                      <button
                        className={ITEM_CLASS}
                        data-menu-item=""
                        data-row="add"
                        onClick={(event) => select(event, onAddAccount)}
                        role="menuitem"
                        tabIndex={-1}
                        type="button"
                      >
                        <span className="grid size-7 place-items-center rounded-full border border-zinc-300 border-dashed text-zinc-400">
                          <Plus className="size-3.5" />
                        </span>
                        Add account
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
