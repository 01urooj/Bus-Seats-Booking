import { useState } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronDown,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import {
  cities,
  formatDate,
  isoDate,
  relativeDay,
  type CityCode,
  type Search as SearchState,
} from "@/data";
import { cn } from "@/utils/cn";

function FieldShell({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 px-4 py-2.5", className)}>
      <p className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.14em] text-muted">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-0.5">
      {children}
      <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
    </div>
  );
}

const selectText = "w-full cursor-pointer appearance-none bg-transparent pr-5 font-semibold text-forest focus:outline-none";

export function SearchPanel({
  search,
  onChange,
  onSubmit,
  variant = "hero",
  submitLabel = "Search coaches",
  className,
}: {
  search: SearchState;
  onChange: (patch: Partial<SearchState>) => void;
  onSubmit: () => void;
  variant?: "hero" | "compact";
  submitLabel?: string;
  className?: string;
}) {
  const [error, setError] = useState("");
  const compact = variant === "compact";

  const swap = () => onChange({ from: search.to, to: search.from });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.from === search.to) {
      setError("Pick two different cities — you're already there.");
      return;
    }
    if (!search.date) {
      setError("Choose a travel date to see departures.");
      return;
    }
    setError("");
    onSubmit();
  };

  const textSize = compact ? "text-[12.5px]" : "text-[15px]";

  return (
    <div
      className={cn(
        "rounded-[22px] border border-forest/10 bg-paper p-2 shadow-[0_30px_60px_-36px_rgba(15,51,42,0.55)]",
        className,
      )}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative grid grid-cols-2 gap-1",
          compact
            ? "lg:grid-cols-[1fr_auto_1fr_0.9fr_0.8fr_auto]"
            : "sm:gap-0 lg:grid-cols-[1.12fr_auto_1.08fr_0.92fr_0.82fr_auto]",
        )}
      >
        <FieldShell label="Leaving from" icon={<MapPin className="size-2.5" />}>
          <SelectWrap>
            <label htmlFor="search-from" className="sr-only">
              Leaving from
            </label>
            <select
              id="search-from"
              value={search.from}
              onChange={(e) => onChange({ from: e.target.value as CityCode })}
              className={cn(selectText, textSize)}
            >
              {cities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name} ({city.code})
                </option>
              ))}
            </select>
          </SelectWrap>
        </FieldShell>

        <div className="hidden items-center px-1 lg:flex">
          <button
            type="button"
            onClick={swap}
            aria-label="Swap departure and destination"
            className="grid size-8 place-items-center rounded-full border border-forest/12 bg-sand-deep text-forest transition-all duration-300 hover:rotate-180 hover:border-forest hover:bg-forest hover:text-sand"
          >
            <ArrowLeftRight className="size-3.5" />
          </button>
        </div>

        <FieldShell label="Going to" icon={<MapPin className="size-2.5" />}>
          <SelectWrap>
            <label htmlFor="search-to" className="sr-only">
              Going to
            </label>
            <select
              id="search-to"
              value={search.to}
              onChange={(e) => onChange({ to: e.target.value as CityCode })}
              className={cn(selectText, textSize)}
            >
              {cities
                .filter((c) => c.code !== search.from)
                .map((city) => (
                  <option key={city.code} value={city.code}>
                    {city.name} ({city.code})
                  </option>
                ))}
            </select>
          </SelectWrap>
        </FieldShell>

        <FieldShell label="Travel date" icon={<CalendarDays className="size-2.5" />}>
          <input
            id="search-date"
            aria-label="Travel date"
            type="date"
            min={isoDate(0)}
            max={isoDate(120)}
            value={search.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className={cn(
              "mt-0.5 w-full cursor-pointer bg-transparent font-semibold text-forest focus:outline-none",
              textSize,
            )}
          />
        </FieldShell>

        <FieldShell label="Travellers" icon={<Users className="size-2.5" />}>
          <SelectWrap>
            <label htmlFor="search-passengers" className="sr-only">
              Passengers
            </label>
            <select
              id="search-passengers"
              value={search.passengers}
              onChange={(e) => onChange({ passengers: Number(e.target.value) })}
              className={cn(selectText, textSize)}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "traveller" : "travellers"}
                </option>
              ))}
            </select>
          </SelectWrap>
        </FieldShell>

        <div className="col-span-2 p-1 lg:col-span-1">
          <button
            type="submit"
            className={cn(
              "btn-shine group flex w-full items-center justify-center gap-2.5 rounded-[15px] bg-forest font-semibold text-sand transition-all duration-300 hover:bg-forest-soft active:scale-[0.985]",
              compact ? "h-[46px] px-4 text-[12px]" : "h-[58px] px-5 text-[13px]",
            )}
          >
            <Search className="size-4" />
            <span className="whitespace-nowrap">
              {compact ? "Update" : submitLabel}
            </span>
            <span className="hidden size-7 place-items-center rounded-full bg-gold text-forest transition-transform duration-300 group-hover:rotate-45 lg:grid">
              <Search className="size-3.5" />
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={swap}
          aria-label="Swap departure and destination"
          className="absolute left-1/2 top-[30px] z-10 grid size-7 -translate-x-1/2 place-items-center rounded-full border-2 border-paper bg-moss-deep text-forest shadow-sm transition-all duration-300 hover:rotate-180 hover:bg-gold lg:hidden"
        >
          <ArrowLeftRight className="size-3" />
        </button>
      </form>

      {!compact && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 pb-1.5 pt-1">
          <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
            Quick pick
          </span>
          {[0, 1, 2, 7].map((offset) => {
            const iso = isoDate(offset);
            const active = search.date === iso;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => onChange({ date: iso })}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 active:scale-95",
                  active
                    ? "bg-forest text-sand"
                    : "bg-sand-deep text-forest/65 hover:bg-moss",
                )}
              >
                {offset === 0
                  ? "Today"
                  : offset === 7
                    ? formatDate(iso, "chip")
                    : relativeDay(iso)}
              </button>
            );
          })}
          <span className="ml-auto hidden items-center gap-1.5 text-[9.5px] font-medium text-muted sm:flex">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3d7d55] opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#3d7d55]" />
            </span>
            Live availability · 120+ daily departures
          </span>
        </div>
      )}

      {error && (
        <p role="alert" className="px-4 pb-2 pt-1 text-[10.5px] font-semibold text-clay">
          {error}
        </p>
      )}
    </div>
  );
}
