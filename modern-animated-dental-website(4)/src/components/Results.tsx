import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bus,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import {
  amenityLabels,
  boardingPoints,
  buildTrips,
  cityMap,
  dayDelta,
  formatClock,
  formatDate,
  formatDuration,
  operatorMap,
  promos,
  type OperatorId,
  type Search as SearchState,
  type Trip,
} from "@/data";
import { cn } from "@/utils/cn";
import { SearchPanel } from "./SearchPanel";
import { amenityIcons, Pill, Stars } from "./ui";

const timeOptions = [
  { id: "any", label: "Any time", sub: "All departures" },
  { id: "morning", label: "Morning", sub: "5am – 12pm" },
  { id: "afternoon", label: "Afternoon", sub: "12pm – 6pm" },
  { id: "evening", label: "Evening", sub: "After 6pm" },
] as const;

type TimeId = (typeof timeOptions)[number]["id"];

const sortOptions = [
  { id: "recommended", label: "Recommended" },
  { id: "price", label: "Lowest price" },
  { id: "depart", label: "Earliest departure" },
  { id: "rating", label: "Top rated" },
] as const;

type SortId = (typeof sortOptions)[number]["id"];

function hourOf(trip: Trip) {
  return new Date(trip.departISO).getHours();
}

export function Results({
  search,
  onChange,
  onSearch,
  onBack,
  onSelectTrip,
  onTrips,
}: {
  search: SearchState;
  onChange: (patch: Partial<SearchState>) => void;
  onSearch: () => void;
  onBack: () => void;
  onSelectTrip: (trip: Trip) => void;
  onTrips: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [sort, setSort] = useState<SortId>("recommended");
  const [time, setTime] = useState<TimeId>("any");
  const [selectedOps, setSelectedOps] = useState<OperatorId[]>([]);
  const [priceCap, setPriceCap] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);

  const trips = useMemo(() => buildTrips(search), [search]);
  const ceiling = useMemo(
    () => Math.max(...trips.map((t) => t.price), 20),
    [trips],
  );
  const cap = priceCap ?? ceiling;
  const cheapest = useMemo(
    () => Math.min(...trips.map((t) => t.price)),
    [trips],
  );

  const filtered = useMemo(() => {
    let list = trips.filter((trip) => {
      if (trip.price > cap) return false;
      if (selectedOps.length > 0 && !selectedOps.includes(trip.operatorId)) return false;
      const hour = hourOf(trip);
      if (time === "morning" && hour >= 12) return false;
      if (time === "afternoon" && (hour < 12 || hour >= 18)) return false;
      if (time === "evening" && hour < 18) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "depart") return a.departISO.localeCompare(b.departISO);
      if (sort === "rating") {
        return operatorMap[b.operatorId].rating - operatorMap[a.operatorId].rating;
      }
      const aBest = a.price <= cheapest ? -1 : 0;
      const bBest = b.price <= cheapest ? -1 : 0;
      return aBest - bBest;
    });
    return list;
  }, [trips, cap, selectedOps, time, sort, cheapest]);

  const toggleOp = (id: OperatorId) => {
    setSelectedOps((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id],
    );
  };

  const reset = () => {
    setSort("recommended");
    setTime("any");
    setSelectedOps([]);
    setPriceCap(null);
  };

  const activeFilters =
    (time !== "any" ? 1 : 0) +
    selectedOps.length +
    (priceCap !== null && priceCap < ceiling ? 1 : 0);

  const FilterPanel = ({ compactView = false }: { compactView?: boolean }) => (
    <div className={cn("space-y-5", compactView && "pb-2")}>
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted">
          Departure time
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          {timeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setTime(option.id)}
              aria-pressed={time === option.id}
              className={cn(
                "rounded-xl border px-2.5 py-2 text-left transition-colors",
                time === option.id
                  ? "border-forest bg-forest text-sand"
                  : "border-forest/12 bg-paper text-forest hover:border-forest/30",
              )}
            >
              <span className="block text-[10.5px] font-bold">{option.label}</span>
              <span
                className={cn(
                  "block text-[8.5px]",
                  time === option.id ? "text-sand/55" : "text-muted",
                )}
              >
                {option.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted">
            Max fare
          </p>
          <span className="text-[10px] font-bold text-forest">${cap}</span>
        </div>
        <input
          type="range"
          min={cheapest}
          max={ceiling}
          value={cap}
          onChange={(e) => setPriceCap(Number(e.target.value))}
          aria-label="Maximum fare per seat"
          className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-forest/15 accent-forest"
        />
        <div className="mt-1 flex justify-between text-[8.5px] text-muted">
          <span>${cheapest}</span>
          <span>${ceiling}</span>
        </div>
      </div>

      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted">
          Coach company
        </p>
        <div className="mt-2.5 space-y-1">
          {Array.from(new Set(trips.map((t) => t.operatorId))).map((id) => {
            const op = operatorMap[id];
            const active = selectedOps.includes(id);
            return (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 transition-colors hover:bg-moss/30"
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-[4px] border transition-colors",
                    active ? "border-forest bg-forest text-sand" : "border-forest/25",
                  )}
                >
                  {active && <Check className="size-3" strokeWidth={3} />}
                </span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleOp(id)}
                  className="sr-only"
                />
                <span className="flex-1 truncate text-[11px] font-semibold text-forest/85">
                  {op.name}
                </span>
                <span className="text-[9px] text-muted">{op.rating}★</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-gold-soft/60 p-3">
        <p className="flex items-center gap-1.5 text-[9.5px] font-bold text-forest">
          <Sparkles className="size-3" />
          Save on this route
        </p>
        <p className="mt-1 text-[9.5px] leading-relaxed text-forest/70">
          Use{" "}
          <button
            onClick={() => {
              void navigator.clipboard?.writeText("WANDER10");
            }}
            className="rounded bg-paper/70 px-1 py-0.5 font-mono font-bold underline decoration-dotted"
          >
            WANDER10
          </button>{" "}
          for 10% off at checkout.
        </p>
      </div>

      {activeFilters > 0 && (
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-clay hover:underline"
        >
          <RefreshCw className="size-3" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="pb-20">
      {/* route header */}
      <div className="border-b border-forest/10 bg-paper">
        <div className="mx-auto w-full max-w-[1320px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-3 py-1.5 text-[10.5px] font-semibold text-forest transition-colors hover:bg-forest hover:text-sand"
            >
              <ArrowLeft className="size-3.5" />
              New search
            </button>
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
              {formatDate(search.date, "long")}
            </span>
            <span className="hidden h-3 w-px bg-forest/15 sm:block" />
            <span className="hidden items-center gap-1.5 text-[9.5px] font-medium text-muted sm:flex">
              <Ticket className="size-3" />
              {search.passengers} {search.passengers === 1 ? "traveller" : "travellers"}
            </span>
            <button
              onClick={onTrips}
              className="ml-auto hidden items-center gap-1.5 text-[10.5px] font-semibold text-forest/70 hover:text-forest sm:flex"
            >
              My trips
              <ArrowUpRight className="size-3.5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h1 className="font-display text-[clamp(1.9rem,4.2vw,2.9rem)] font-semibold leading-none tracking-[-0.04em] text-forest">
                {cityMap[search.from].name}
              </h1>
              <span className="hidden items-center gap-1.5 pb-1 sm:flex">
                <span className="route-dash h-px w-6 sm:w-10" />
                <Bus className="size-4 text-forest/45" />
                <span className="route-dash h-px w-6 sm:w-10" />
              </span>
              <h1 className="font-display text-[clamp(1.9rem,4.2vw,2.9rem)] font-semibold leading-none tracking-[-0.04em] text-forest">
                {cityMap[search.to].name}
              </h1>
            </div>
            <button
              onClick={() => setEditing((v) => !v)}
              className="group inline-flex items-center gap-2 rounded-full bg-forest py-1.5 pl-4 pr-1.5 text-[11.5px] font-semibold text-sand transition-colors hover:bg-forest-soft"
            >
              <SlidersHorizontal className="size-3.5" />
              Modify search
              <span className="grid size-7 place-items-center rounded-full bg-gold text-forest transition-transform group-hover:rotate-45">
                <ArrowUpRight className="size-3" />
              </span>
            </button>
          </div>

          {editing && (
            <div className="mt-5 animate-rise">
              <SearchPanel
                search={search}
                onChange={onChange}
                onSubmit={() => {
                  setEditing(false);
                  onSearch();
                }}
                variant="compact"
              />
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3d7d55] opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[#3d7d55]" />
              </span>
              {trips.length} live departures
            </span>
            <span>Fares include taxes & one checked bag</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-forest/70" />
              Free cancellation up to 24h
            </span>
            <span className="ml-auto hidden items-center gap-1.5 font-semibold text-forest/75 md:flex">
              <Sparkles className="size-3 text-gold" />
              {promos[0].label} with {promos[0].code}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1320px] px-5 pt-6 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
          {/* sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[18px] border border-forest/10 bg-sand p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                </p>
                {activeFilters > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-forest text-[9px] font-bold text-sand">
                    {activeFilters}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <FilterPanel />
              </div>
            </div>
          </aside>

          <div>
            {/* results toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11.5px] text-muted">
                <span className="font-bold text-forest">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "coach" : "coaches"} match your filters
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFilters(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-3 py-2 text-[10.5px] font-semibold text-forest lg:hidden"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                  {activeFilters > 0 && (
                    <span className="grid size-4 place-items-center rounded-full bg-forest text-[8px] font-bold text-sand">
                      {activeFilters}
                    </span>
                  )}
                </button>
                <div className="relative">
                  <select
                    aria-label="Sort departures"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortId)}
                    className="appearance-none rounded-full border border-forest/15 bg-paper py-2 pl-3.5 pr-8 text-[10.5px] font-semibold text-forest focus:outline-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        Sort: {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filtered.map((trip, index) => {
                const op = operatorMap[trip.operatorId];
                const isCheapest = trip.price === cheapest;
                const isExpanded = expanded === trip.id;
                const delta = dayDelta(trip.departISO, trip.arriveISO);
                return (
                  <article
                    key={`${trip.id}-${sort}-${time}-${cap}-${selectedOps.join("")}`}
                    className="hover-zoom animate-rise overflow-hidden rounded-[18px] border border-forest/12 bg-paper transition-colors hover:border-forest/25 hover:shadow-[0_22px_44px_-30px_rgba(6,30,23,0.5)]"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-forest text-[8px] font-extrabold text-sand">
                          {op.initials}
                        </span>
                        <span className="text-[11.5px] font-bold text-forest">
                          {op.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9.5px] text-muted">
                          <Stars size={9} className="text-[#d78f28]" />
                          {op.rating}
                          <span className="text-muted/60">({op.reviews.toLocaleString()})</span>
                        </span>
                        <span className="rounded-full bg-moss/60 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.06em] text-forest/75">
                          {trip.busType}
                        </span>
                        {isCheapest && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-[0.06em] text-forest">
                            <Sparkles className="size-2.5" />
                            Best fare
                          </span>
                        )}
                        {trip.seatsLeft <= 9 && (
                          <span className="ml-auto rounded-full bg-clay/10 px-2 py-0.5 text-[8.5px] font-bold text-clay">
                            Only {trip.seatsLeft} seats left
                          </span>
                        )}
                      </div>

                      <div className="mt-3.5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div className="flex items-start gap-4 sm:gap-6">
                          <div>
                            <p className="font-display text-[25px] font-semibold leading-none tracking-tight text-forest sm:text-[28px]">
                              {formatClock(trip.departISO)}
                            </p>
                            <p className="mt-1 text-[10px] font-semibold text-forest/70">
                              {cityMap[trip.from].name}
                            </p>
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="relative flex items-center">
                              <span className="size-1.5 rounded-full border border-forest/40 bg-paper" />
                              <span className="route-dash route-dash-live h-px flex-1" />
                              <Bus className="mx-1 size-3.5 text-forest/35" />
                              <span className="route-dash route-dash-live h-px flex-1" />
                              <span className="size-1.5 rounded-full bg-gold" />
                            </div>
                            <p className="mt-1.5 text-center text-[9px] font-medium text-muted">
                              {formatDuration(trip.durationMins)} ·{" "}
                              {trip.stops === 0 ? "Direct" : `${trip.stops} stop`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-[25px] font-semibold leading-none tracking-tight text-forest sm:text-[28px]">
                              {formatClock(trip.arriveISO)}
                              {delta > 0 && (
                                <span className="align-super text-[9px] font-bold text-clay">
                                  +{delta}
                                </span>
                              )}
                            </p>
                            <p className="mt-1 text-[10px] font-semibold text-forest/70">
                              {cityMap[trip.to].name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-end justify-between gap-3 border-t border-forest/8 pt-3 sm:min-w-[170px] sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                          <div className="sm:text-right">
                            <p className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                              From / seat
                            </p>
                            <p className="font-display text-[26px] font-semibold leading-none text-forest">
                              ${trip.price}
                            </p>
                          </div>
                          <button
                            onClick={() => onSelectTrip(trip)}
                            className="group inline-flex items-center gap-2 rounded-full bg-forest py-1.5 pl-4 pr-1.5 text-[11px] font-semibold text-sand transition-colors hover:bg-forest-soft"
                          >
                            Choose seats
                            <span className="grid size-7 place-items-center rounded-full bg-gold text-forest transition-transform group-hover:rotate-45">
                              <ArrowRight className="size-3.5" />
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {trip.amenities.slice(0, 4).map((a) => {
                          const Icon = amenityIcons[a];
                          return (
                            <span
                              key={a}
                              title={amenityLabels[a]}
                              className="inline-flex items-center gap-1 rounded-full border border-forest/10 px-2 py-1 text-[9px] font-medium text-forest/65"
                            >
                              <Icon className="size-3" />
                              {amenityLabels[a]}
                            </span>
                          );
                        })}
                        {trip.amenities.length > 4 && (
                          <span className="rounded-full bg-sand-deep px-2 py-1 text-[9px] font-semibold text-muted">
                            +{trip.amenities.length - 4}
                          </span>
                        )}
                        <button
                          onClick={() => setExpanded(isExpanded ? null : trip.id)}
                          aria-expanded={isExpanded}
                          className="ml-auto inline-flex items-center gap-1 text-[9.5px] font-semibold text-forest/65 hover:text-forest"
                        >
                          {isExpanded ? "Hide details" : "Trip details"}
                          <ChevronDown
                            className={cn(
                              "size-3.5 transition-transform",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="animate-rise border-t border-forest/10 bg-sand/70 px-4 py-4 sm:px-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted">
                              <MapPin className="size-3" />
                              Boarding in {cityMap[trip.from].name}
                            </p>
                            <ul className="mt-2 space-y-1.5">
                              {boardingPoints[trip.from].slice(0, 2).map((point) => (
                                <li
                                  key={point}
                                  className="flex items-start gap-1.5 text-[10.5px] text-forest/75"
                                >
                                  <span className="mt-1 size-1 rounded-full bg-gold" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted">
                              <Clock className="size-3" />
                              Good to know
                            </p>
                            <ul className="mt-2 space-y-1.5 text-[10.5px] text-forest/75">
                              <li className="flex items-start gap-1.5">
                                <Check className="mt-0.5 size-3 shrink-0 text-[#5a9e6f]" />
                                Arrive 10 minutes early — seats are held 15 min.
                              </li>
                              <li className="flex items-start gap-1.5">
                                <Check className="mt-0.5 size-3 shrink-0 text-[#5a9e6f]" />
                                One 23kg bag + carry-on included.
                              </li>
                              <li className="flex items-start gap-1.5">
                                <Check className="mt-0.5 size-3 shrink-0 text-[#5a9e6f]" />
                                Free cancellation up to 24h before departure.
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-forest/10 pt-3">
                          <Pill tone="paper" className="border border-forest/10">
                            <ShieldCheck className="size-3" />
                            {op.note}
                          </Pill>
                          <button
                            onClick={() => onSelectTrip(trip)}
                            className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-bold text-forest hover:underline"
                          >
                            Pick a seat on this coach
                            <ArrowUpRight className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {filtered.length === 0 && (
                <div className="rounded-[18px] border border-dashed border-forest/20 bg-paper px-6 py-14 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-moss text-forest">
                    <Bus className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-[22px] font-semibold text-forest">
                    No coaches match those filters
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-[320px] text-[11px] leading-relaxed text-muted">
                    Try widening your fare or departure window — there are
                    usually seats on every coach.
                  </p>
                  <button
                    onClick={reset}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[11px] font-semibold text-sand"
                  >
                    <RefreshCw className="size-3.5" />
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-forest/10 bg-paper px-4 py-3.5 sm:flex-row sm:items-center">
              <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-forest/70">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest" />
                <span>
                  <span className="font-bold text-forest">Book with confidence.</span>{" "}
                  Real seats, transparent totals and human support until you arrive.
                </span>
              </p>
              <button
                onClick={onTrips}
                className="inline-flex shrink-0 items-center gap-1.5 text-[10.5px] font-bold text-forest hover:underline"
              >
                Already booked?
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* mobile filters */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-forest/45 backdrop-blur-sm"
            onClick={() => setMobileFilters(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-rise overflow-y-auto rounded-t-[26px] bg-sand p-5 pb-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[22px] font-semibold text-forest">
                Refine your search
              </h2>
              <button
                onClick={() => setMobileFilters(false)}
                aria-label="Close filters"
                className="grid size-9 place-items-center rounded-full border border-forest/15 text-forest"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5">
              <FilterPanel compactView />
            </div>
            <button
              onClick={() => setMobileFilters(false)}
              className="mt-4 flex w-full items-center justify-between rounded-full bg-forest py-3 pl-5 pr-2 text-[12px] font-semibold text-sand"
            >
              Show {filtered.length} coaches
              <span className="grid size-8 place-items-center rounded-full bg-gold text-forest">
                <ArrowRight className="size-3.5" />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
