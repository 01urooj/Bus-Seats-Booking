import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Armchair,
  BedDouble,
  Coffee,
  CupSoda,
  Toilet,
  Tv,
  Usb,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { hashString, type AmenityKey } from "@/data";
import { cn } from "@/utils/cn";

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dir =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
        ? "reveal-right"
        : direction === "scale"
          ? "reveal-scale"
          : "";

  return (
    <div
      ref={ref}
      id={id}
      className={cn("reveal", dir, className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function BusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="4" y="3" width="16" height="16" rx="4" />
      <path d="M4 11h16M8 3v8M16 3v8" />
      <path d="M7 19v2M17 19v2" />
      <circle cx="8" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Logo({
  inverted = false,
  className,
  onClick,
}: {
  inverted?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Wayfare — back to home"
      className={cn("group inline-flex items-center gap-2.5 text-left", className)}
    >
      <span
        className={cn(
          "relative grid size-10 shrink-0 place-items-center rounded-[13px] transition-transform duration-500 group-hover:-rotate-6",
          inverted ? "bg-sand text-forest" : "bg-forest text-sand",
        )}
      >
        <BusMark className="size-[22px]" />
        <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-current bg-gold text-gold" />
      </span>
      <span className="flex flex-col">
        <span
          className={cn(
            "font-display text-[24px] font-semibold leading-none tracking-[-0.03em]",
            inverted ? "text-sand" : "text-forest",
          )}
        >
          wayfare
        </span>
        <span
          className={cn(
            "mt-1 text-[7.5px] font-bold uppercase leading-none tracking-[0.28em]",
            inverted ? "text-sand/50" : "text-muted",
          )}
        >
          Coach
        </span>
      </span>
    </button>
  );
}

export const amenityIcons: Record<AmenityKey, LucideIcon> = {
  wifi: Wifi,
  usb: Usb,
  water: CupSoda,
  recliner: Armchair,
  washroom: Toilet,
  entertainment: Tv,
  blanket: BedDouble,
  snack: Coffee,
};

export function Stars({
  size = 12,
  className,
  value = 5,
}: {
  size?: number;
  className?: string;
  value?: number;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < Math.round(value) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8l-5.8 3.1 1.1-6.5L2.6 9.8l6.5-.9L12 3z" />
        </svg>
      ))}
    </span>
  );
}

export function QrGlyph({ value, className }: { value: string; className?: string }) {
  const size = 21;
  const seed = hashString(value);
  const cells: boolean[] = [];
  let state = seed || 123456789;
  for (let i = 0; i < size * size; i += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    cells.push(state % 100 > 48);
  }
  const finder = (x: number, y: number) => {
    const pattern = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ];
    const out: { x: number; y: number }[] = [];
    pattern.forEach((row, ry) =>
      row.forEach((on, rx) => {
        if (on) out.push({ x: x + rx, y: y + ry });
      }),
    );
    return out;
  };
  const finders = [
    ...finder(0, 0),
    ...finder(size - 5, 0),
    ...finder(0, size - 5),
  ];
  const finderZones = new Set<string>();
  finders.forEach(({ x, y }) => {
    for (let dx = -1; dx <= 5; dx += 1) {
      for (let dy = -1; dy <= 5; dy += 1) {
        finderZones.add(`${x + dx},${y + dy}`);
      }
    }
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`QR ticket code ${value}`}
    >
      <rect width={size} height={size} fill="white" />
      {cells.map((on, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        if (!on || finderZones.has(`${x},${y}`)) return null;
        return <rect key={i} x={x} y={y} width="1" height="1" fill="#061e17" />;
      })}
      {finders.map((f) => (
        <rect
          key={`${f.x}-${f.y}`}
          x={f.x}
          y={f.y}
          width="1"
          height="1"
          fill="#061e17"
        />
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect
          key={`barcode-${i}`}
          x={0.5 + i * 1.45}
          y={0.2}
          width={i % 3 === 0 ? 0.55 : 0.3}
          height={0.5}
          fill="#061e17"
        />
      ))}
    </svg>
  );
}

export function Pill({
  children,
  tone = "moss",
  className,
}: {
  children: ReactNode;
  tone?: "moss" | "gold" | "forest" | "paper" | "outline";
  className?: string;
}) {
  const tones = {
    moss: "bg-moss text-forest",
    gold: "bg-gold-soft text-forest",
    forest: "bg-forest text-sand",
    paper: "bg-paper text-forest",
    outline: "border border-forest/15 text-forest/70",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RouteLine({
  from,
  to,
  className,
}: {
  from: string;
  to: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)} aria-hidden="true">
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        <span className="size-1.5 rounded-full bg-forest" />
        {from}
      </span>
      <span className="route-dash route-dash-live h-px flex-1" />
      <BusMark className="size-3.5 text-forest/40" />
      <span className="route-dash route-dash-live h-px flex-1" />
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        {to}
        <span className="size-1.5 rounded-full bg-gold" />
      </span>
    </div>
  );
}

/** Animated number that counts up once it enters the viewport. */
export function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1500,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(value * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            run();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Full-screen animated transition shown while searching for departures. */
export function RouteLoader({ from, to }: { from: string; to: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[75] flex flex-col items-center justify-center bg-forest px-6 text-sand"
      style={{ animation: "fadeIn .25s ease both" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f2f3ec 1px, transparent 1px), linear-gradient(to bottom, #f2f3ec 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative w-full max-w-[380px]">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-sand/80">
            {from}
          </span>
          <span className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em] text-gold">
            <span className="size-1.5 animate-pulse rounded-full bg-gold" />
            Finding coaches
          </span>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-gold">
            {to}
          </span>
        </div>

        <div className="relative mt-6 h-10">
          <div className="route-dash absolute inset-x-0 top-1/2 h-px opacity-40" />
          <span className="absolute left-0 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-sand" />
          <span className="absolute right-0 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_16px_rgba(215,255,79,0.9)]" />
          <span
            className="absolute top-1/2 -translate-y-1/2 text-gold"
            style={{ animation: "busRun .85s cubic-bezier(.4,0,.2,1) forwards" }}
          >
            <BusMark className="size-7" />
          </span>
        </div>

        <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="loader-track h-full rounded-full bg-gold" />
        </div>
        <p className="mt-4 text-center text-[10.5px] text-sand/45">
          Checking live seat maps across 5 coach partners…
        </p>
      </div>
    </div>
  );
}
