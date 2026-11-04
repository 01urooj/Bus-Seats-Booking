import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Armchair,
  Bus,
  Check,
  Clock,
  Coffee,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
  Usb,
  Wifi,
} from "lucide-react";
import {
  cities,
  cityMap,
  faqs,
  formatDate,
  formatDuration,
  imagery,
  operators,
  popularRoutes,
  reviews,
  routeStats,
  steps,
  type CityCode,
  type Search as SearchState,
} from "@/data";
import { cn } from "@/utils/cn";
import { SearchPanel } from "./SearchPanel";
import { Counter, Pill, Reveal, RouteLine, Stars } from "./ui";

function scrollToSearch() {
  document.getElementById("search")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

const trustStats = [
  { value: 12, suffix: "k+", decimals: 0, label: "Riders every week" },
  { value: 4.9, suffix: "/5", decimals: 1, label: "Average journey rating" },
  { value: 120, suffix: "+", decimals: 0, label: "Departures a day" },
  { value: 96.4, suffix: "%", decimals: 1, label: "On-time arrivals" },
];

const features = [
  {
    icon: Armchair,
    title: "Legroom you can stretch into",
    copy: "34 inches as standard, 38 in Business Class. Recline without apologising to the row behind.",
  },
  {
    icon: Usb,
    title: "Power and Wi-Fi, every mile",
    copy: "USB-C at every seat and free onboard Wi-Fi good enough for a call or a film.",
  },
  {
    icon: ShieldCheck,
    title: "One clear price",
    copy: "Your seat, your bags and taxes included. No booking surprises at the door.",
  },
  {
    icon: MapPin,
    title: "Stops where you actually are",
    copy: "Downtown terminals and airport curbs, with live tracking so you never guess.",
  },
];

export function Home({
  search,
  onChange,
  onSearch,
  onRoute,
  onBook,
}: {
  search: SearchState;
  onChange: (patch: Partial<SearchState>) => void;
  onSearch: () => void;
  onRoute: (from: CityCode, to: CityCode) => void;
  onBook: () => void;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const heroFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroFrameRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        el.style.transform = `translate3d(0, ${y * 0.05}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const featured = popularRoutes[0];
  const featuredStats = routeStats(featured.from, featured.to);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section
        className="relative overflow-hidden bg-forest pb-12 pt-8 text-sand sm:pt-12"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
        }}
      >
        <div
          aria-hidden="true"
          className="glow-mouse pointer-events-none absolute inset-0 transition-opacity duration-500"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-0 size-[460px] rounded-full bg-gold/12 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-24 size-[460px] rounded-full bg-[#1c6b52]/45 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f2f3ec 1px, transparent 1px), linear-gradient(to bottom, #f2f3ec 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        <div className="relative mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
            <div className="relative z-10">
              <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1 pl-1.5 pr-3.5 backdrop-blur">
                <span className="grid size-6 place-items-center rounded-full bg-gold text-forest">
                  <Sparkles className="size-3.5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-sand/85">
                  New sleeper coaches to Seattle
                </span>
                <span className="h-3 w-px bg-white/20" />
                <span className="text-[10px] font-bold text-sand/45">7 cities</span>
              </div>

              <h1 className="mt-6 font-display text-[clamp(3rem,6.6vw,5.4rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-sand">
                <span className="text-reveal">
                  <span style={{ "--d": "120ms" } as React.CSSProperties}>
                    Your seat to
                  </span>
                </span>
                <span className="text-reveal">
                  <span style={{ "--d": "260ms" } as React.CSSProperties}>
                    <span className="relative inline-block">
                      <span className="absolute inset-x-[-0.06em] bottom-[0.04em] top-[0.18em] -rotate-1 rounded-[10px] bg-gold" />
                      <span className="relative text-forest">somewhere</span>
                    </span>{" "}
                    new.
                  </span>
                </span>
              </h1>

              <p
                className="animate-rise mt-6 max-w-[440px] text-pretty text-[14px] leading-[1.75] text-sand/60 sm:text-[15px]"
                style={{ animationDelay: "180ms" }}
              >
                Compare every coach, pick the exact seat you want, and ride the
                West Coast in comfort — from $16 one way.
              </p>

              <div
                className="animate-rise mt-7 flex flex-wrap items-center gap-x-5 gap-y-3"
                style={{ animationDelay: "260ms" }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {reviews.map((r, i) => (
                      <span
                        key={r.name}
                        className={cn(
                          "grid size-8 place-items-center rounded-full border-2 border-forest text-[9px] font-bold",
                          i === 0
                            ? "bg-gold text-forest"
                            : i === 1
                              ? "bg-moss-deep text-forest"
                              : "bg-[#1d4d3f] text-sand",
                        )}
                      >
                        {r.initials}
                      </span>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Stars size={10} className="text-[#d78f28]" />
                      <span className="text-[11px] font-bold text-sand">4.9</span>
                    </div>
                    <p className="text-[10px] text-sand/45">12,480 verified riders</p>
                  </div>
                </div>
                <span className="hidden h-8 w-px bg-white/12 sm:block" />
                <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-sand/70">
                  <ShieldCheck className="size-4 text-gold" />
                  Free cancellation up to 24h
                </p>
              </div>
            </div>

            {/* hero visual */}
            <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
              <div ref={heroFrameRef} className="will-change-transform">
              <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-forest-soft shadow-[0_40px_90px_-40px_rgba(0,0,0,0.85)]">
                <img
                  src={imagery.hero}
                  alt="A Wayfare coach on a coastal highway at golden hour"
                  className="h-[300px] w-full animate-rise object-cover sm:h-[380px] lg:h-[420px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/5 to-forest/25" />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/70 px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-sand backdrop-blur-md">
                    <span className="size-1.5 rounded-full bg-gold" />
                    Live seat maps
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/95 px-3 py-1.5 text-[9.5px] font-bold text-forest">
                    <Bus className="size-3" />
                    Coach 412
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                  <div>
                    <p className="font-display text-[19px] font-semibold leading-none text-sand sm:text-[25px]">
                      The Pacific Coastliner
                    </p>
                    <RouteLine
                      from="SFO"
                      to="LAX"
                      className="mt-2.5 hidden sm:flex [&_*]:!text-sand/60 [&_.route-dash]:opacity-40"
                    />
                  </div>
                  <button
                    onClick={scrollToSearch}
                    aria-label="Search the Pacific Coastliner route"
                    className="group grid size-11 shrink-0 place-items-center rounded-full bg-gold text-forest transition-transform duration-300 hover:rotate-45"
                  >
                    <ArrowUpRight className="size-5" />
                  </button>
                </div>
              </div>
              </div>

              {/* floating boarding pass */}
              <div className="absolute -left-2 -top-5 z-20 hidden w-[210px] -rotate-[6deg] rounded-xl bg-paper p-3 shadow-[0_24px_50px_-20px_rgba(15,51,42,0.5)] sm:block lg:-left-8">
                <div className="flex items-center justify-between">
                  <p className="text-[7.5px] font-extrabold uppercase tracking-[0.2em] text-clay">
                    Boarding pass
                  </p>
                  <Bus className="size-3.5 text-forest" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted">From</p>
                    <p className="font-display text-[19px] font-semibold leading-none text-forest">SFO</p>
                  </div>
                  <svg viewBox="0 0 60 12" className="mx-1 h-3 flex-1" aria-hidden="true">
                    <path d="M2 6h52" stroke="#061e17" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="54" cy="6" r="2" fill="#d7ff4f" />
                  </svg>
                  <div className="text-right">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted">To</p>
                    <p className="font-display text-[19px] font-semibold leading-none text-forest">LAX</p>
                  </div>
                </div>
                <div className="perf-line mt-2.5 grid grid-cols-3 gap-1 pt-2">
                  {[
                    ["Date", formatDate(search.date, "chip")],
                    ["Departs", "06:15"],
                    ["Seat", "4A"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[6.5px] font-semibold uppercase tracking-wider text-muted">
                        {label}
                      </p>
                      <p className="mt-0.5 text-[9px] font-bold text-forest">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* floating seat picker */}
              <div className="absolute -bottom-5 right-2 z-20 hidden w-[186px] rotate-[4deg] rounded-xl border border-forest/10 bg-paper p-3 shadow-[0_24px_50px_-20px_rgba(15,51,42,0.45)] sm:right-5 sm:block">
                <p className="text-[7.5px] font-extrabold uppercase tracking-[0.18em] text-muted">
                  Pick your seat
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {["1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D"].map((seat, i) => (
                    <span
                      key={seat}
                      className={cn(
                        "grid h-5 place-items-center rounded-t-[4px] rounded-b-[2px] text-[7px] font-bold",
                        i === 0
                          ? "bg-gold text-forest"
                          : i === 5 || i === 6
                            ? "bg-sand-deep text-muted/50 line-through"
                            : "border border-forest/15 text-forest/70",
                      )}
                    >
                      {seat}
                    </span>
                  ))}
                </div>
                <p className="mt-2 flex items-center gap-1 text-[8px] font-semibold text-forest/75">
                  <Sparkles className="size-2.5 text-gold" />
                  Window seats still free
                </p>
              </div>
            </div>
          </div>

          {/* search */}
          <div id="search" className="relative z-20 mt-12 scroll-mt-28 sm:mt-14">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-[9.5px] text-gold">Book in 60 seconds</p>
                <h2 className="mt-1 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-none tracking-[-0.03em] text-sand">
                  Where are you headed?
                </h2>
              </div>
              <p className="hidden max-w-[210px] text-right text-[10.5px] leading-relaxed text-sand/45 sm:block">
                Seats, bags and taxes included. No fees at the door.
              </p>
            </div>
            <SearchPanel search={search} onChange={onChange} onSubmit={onSearch} />
          </div>

          {/* operator strip */}
          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/12 pt-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-sand/40">
              Coaches by
            </p>
            {operators.map((op) => (
              <div key={op.id} className="flex items-center gap-1.5">
                <span className="grid size-5 place-items-center rounded-full bg-white/10 text-[7px] font-extrabold text-sand">
                  {op.initials}
                </span>
                <span className="font-display text-[13px] font-medium text-sand/55">
                  {op.name}
                </span>
              </div>
            ))}
            <span className="ml-auto hidden items-center gap-1.5 text-[9.5px] font-medium text-sand/45 md:flex">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-gold" />
              </span>
              Every partner vetted for safety & punctuality
            </span>
          </div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="border-y border-forest/20 bg-gold">
        <div className="mx-auto grid w-full max-w-[1320px] grid-cols-2 divide-forest/20 px-5 sm:grid-cols-4 sm:divide-x sm:px-8 lg:px-10">
          {trustStats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70}>
              <div className="flex items-center justify-center gap-2.5 px-2 py-5 text-center sm:py-6">
                <Counter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  className="font-display text-[clamp(1.6rem,2.8vw,2.2rem)] font-semibold leading-none tracking-[-0.04em] text-forest tabular-nums"
                />
                <p className="max-w-[86px] text-left text-[8.5px] font-bold uppercase leading-[1.4] tracking-[0.1em] text-forest/60">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- ROUTES ---------------- */}
      <section id="routes" className="relative overflow-hidden py-20 sm:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <Reveal>
                <p className="eyebrow flex items-center gap-2 text-clay">
                  <span className="h-px w-7 bg-clay" />
                  Popular routes
                </p>
              </Reveal>
              <Reveal delay={70}>
                <h2 className="mt-4 max-w-[560px] text-balance font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-forest">
                  Where to next?
                </h2>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <div className="flex items-center gap-4">
                <p className="max-w-[240px] text-[11px] leading-relaxed text-muted">
                  Six of the West Coast's best-loved runs, with seats from $16.
                </p>
                <button
                  onClick={scrollToSearch}
                  className="group inline-flex items-center gap-2 rounded-full border border-forest/20 py-2 pl-4 pr-2 text-[11.5px] font-semibold text-forest transition-colors hover:border-forest hover:bg-forest hover:text-sand"
                >
                  All routes
                  <span className="grid size-7 place-items-center rounded-full bg-forest text-sand transition-colors group-hover:bg-gold group-hover:text-forest">
                    <ArrowRight className="size-3.5" />
                  </span>
                </button>
              </div>
            </Reveal>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-11 lg:grid-cols-3">
            {popularRoutes.map((route, i) => {
              const stats = routeStats(route.from, route.to);
              return (
                <Reveal key={`${route.from}-${route.to}`} delay={(i % 3) * 90}>
                  <button
                    onClick={() => onRoute(route.from, route.to)}
                    className="group lift block w-full overflow-hidden rounded-[20px] border border-forest/10 bg-paper text-left hover:border-forest/25 hover:shadow-[0_26px_50px_-30px_rgba(15,51,42,0.5)]"
                  >
                    <div className="relative h-[150px] overflow-hidden">
                      <img
                        src={imagery.cities[route.to]}
                        alt={`${cityMap[route.to].name}, ${cityMap[route.to].state}`}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest/75 via-forest/10 to-forest/10" />
                      <span
                        className={cn(
                          "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[8.5px] font-extrabold uppercase tracking-[0.1em]",
                          route.tone === "gold"
                            ? "bg-gold text-forest"
                            : route.tone === "moss"
                              ? "bg-moss text-forest"
                              : "bg-paper/95 text-forest",
                        )}
                      >
                        {route.tag}
                      </span>
                      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
                        <p className="font-display text-[20px] font-semibold leading-none text-sand">
                          {cityMap[route.to].name}
                        </p>
                        <span className="rounded-full bg-sand/15 px-2 py-1 text-[8.5px] font-semibold text-sand backdrop-blur-md">
                          {cityMap[route.to].state}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-forest/80">
                            <span className="size-1.5 rounded-full bg-forest shadow-[0_0_0_3px_rgba(6,30,23,0.08)]" />
                            {cityMap[route.from].name}
                            <ArrowRight className="size-3 text-muted" />
                            {cityMap[route.to].name}
                          </p>
                          <p className="mt-1.5 flex items-center gap-3 text-[10px] text-muted">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatDuration(stats.minutes)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Bus className="size-3" />
                              {stats.stops === 0 ? "Direct" : `${stats.stops} stop`}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                            From
                          </p>
                          <p className="font-display text-[22px] font-semibold leading-none text-forest">
                            ${stats.base}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-forest/8 pt-2.5">
                        <span className="text-[9.5px] font-medium text-muted">
                          {cityMap[route.to].tagline}
                        </span>
                        <span className="grid size-7 place-items-center rounded-full bg-moss text-forest transition-colors group-hover:bg-forest group-hover:text-sand">
                          <ArrowUpRight className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- CITY MARQUEE ---------------- */}
      <div className="overflow-hidden border-y border-forest/10 bg-forest py-4">
        <div className="marquee-mask flex">
          <div className="flex w-max animate-marquee items-center">
            {[0, 1].map((set) => (
              <div key={set} aria-hidden={set === 1} className="flex items-center">
                {cities.map((city) => (
                  <span key={`${set}-${city.code}`} className="flex items-center">
                    <span className="whitespace-nowrap px-5 font-display text-[15px] font-medium tracking-tight text-sand/85">
                      {city.name}
                    </span>
                    <span className="size-1.5 rounded-full bg-gold" />
                  </span>
                ))}
                <span className="whitespace-nowrap px-5 font-display text-[15px] italic text-moss/80">
                  Somewhere is calling
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- ONBOARD ---------------- */}
      <section id="onboard" className="relative overflow-hidden py-20 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/3 size-[380px] rounded-full bg-moss/50 blur-[100px]"
        />
        <div className="relative mx-auto grid w-full max-w-[1320px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-10">
          <Reveal direction="left" className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-[24px] border border-forest/10">
              <img
                src={imagery.interior}
                alt="Inside a Wayfare coach: cream leather seats with green headrests and a wide aisle"
                loading="lazy"
                className="h-[320px] w-full object-cover sm:h-[420px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-forest">
                <span className="size-1.5 rounded-full bg-[#5a9e6f]" />
                Inside the coach
              </span>
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                <p className="font-display text-[22px] font-semibold leading-none text-sand">
                  Calm, quiet, considered.
                </p>
                <span className="rounded-full border border-sand/25 px-2.5 py-1 text-[8.5px] font-semibold text-sand/85 backdrop-blur-md">
                  Walkthrough
                </span>
              </div>
            </div>

            <div className="absolute -right-2 -top-5 z-10 w-[152px] rotate-3 rounded-2xl bg-paper p-3.5 shadow-[0_24px_50px_-24px_rgba(15,51,42,0.5)] sm:-right-4 sm:w-[176px]">
              <div className="flex items-center justify-between">
                <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-muted">
                  Seat pitch
                </p>
                <Armchair className="size-3.5 text-forest" />
              </div>
              <p className="mt-1 font-display text-[30px] font-semibold leading-none tracking-tight text-forest">
                34<span className="text-[14px]">in</span>
              </p>
              <p className="mt-1 text-[9px] leading-snug text-muted">
                As standard — 4 inches more than the average coach.
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2.5 rounded-2xl border border-forest/10 bg-paper px-3.5 py-2.5">
              <span className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-moss text-forest">
                  <Wifi className="size-4" />
                </span>
                <span>
                  <span className="block text-[9.5px] font-bold text-forest">
                    Free onboard Wi-Fi
                  </span>
                  <span className="block text-[8.5px] text-muted">
                    Good for calls, fine for films
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-1 rounded-full bg-sand-deep px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-muted">
                <Usb className="size-2.5" />
                USB-C
              </span>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="eyebrow flex items-center gap-2 text-clay">
                <span className="h-px w-7 bg-clay" />
                Onboard
              </p>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="mt-4 max-w-[520px] text-balance font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-forest">
                Every seat earns its place.
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="mt-5 max-w-[460px] text-pretty text-[13px] leading-[1.8] text-muted sm:text-[14px]">
                Airline legroom, the window you chose, power where you need it
                and a washroom down the aisle. Long-distance coach travel,
                without the compromises.
              </p>
            </Reveal>

            <div className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {features.map((feature, i) => (
                <Reveal key={feature.title} delay={170 + i * 60}>
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-forest/8 text-forest">
                      <feature.icon className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-[12px] font-bold text-forest">{feature.title}</h3>
                      <p className="mt-1 text-[10.5px] leading-[1.65] text-muted">
                        {feature.copy}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={430}>
              <div className="mt-7 flex flex-wrap gap-1.5">
                {[
                  [Wifi, "Wi-Fi"],
                  [Usb, "USB-C"],
                  [Coffee, "Free water"],
                  [Armchair, "Recliner"],
                  [ShieldCheck, "Washroom"],
                ].map(([Icon, label]) => {
                  const ItemIcon = Icon as typeof Wifi;
                  return (
                    <Pill key={label as string} tone="paper" className="border border-forest/10">
                      <ItemIcon className="size-3" />
                      {label as string}
                    </Pill>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={480}>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button
                  onClick={onBook}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-forest py-2 pl-5 pr-2 text-[12px] font-semibold text-sand transition-colors hover:bg-forest-soft"
                >
                  Book a seat from ${featuredStats.base}
                  <span className="grid size-8 place-items-center rounded-full bg-gold text-forest transition-transform group-hover:rotate-45">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </button>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 text-[11.5px] font-semibold text-forest/75 hover:text-forest"
                >
                  How boarding works
                  <ArrowRight className="size-3.5" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how" className="px-5 pb-4 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-[1320px] overflow-hidden rounded-[28px] bg-forest px-5 py-14 text-sand sm:px-10 sm:py-16 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <Reveal>
                <p className="eyebrow flex items-center gap-2 text-gold">
                  <span className="h-px w-7 bg-gold" />
                  How it works
                </p>
              </Reveal>
              <Reveal delay={70}>
                <h2 className="mt-4 text-balance font-display text-[clamp(2.1rem,4.2vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
                  Three steps to
                  <br />
                  <span className="text-gold">your window seat.</span>
                </h2>
              </Reveal>
              <Reveal delay={130}>
                <p className="mt-5 max-w-[330px] text-[12px] leading-[1.8] text-sand/60">
                  No accounts to create, no queues at the station. Just search,
                  choose and go.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <button
                  onClick={scrollToSearch}
                  className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-gold py-2 pl-5 pr-2 text-[12px] font-bold text-forest transition-colors hover:bg-sand"
                >
                  Find my coach
                  <span className="grid size-8 place-items-center rounded-full bg-forest text-sand transition-transform group-hover:rotate-45">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </button>
              </Reveal>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute left-[19px] top-6 hidden h-[calc(100%-3rem)] border-l border-dashed border-sand/25 sm:block"
              />
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <Reveal key={step.n} delay={120 + i * 100}>
                    <div className="relative flex gap-4 rounded-2xl border border-sand/10 bg-sand/[0.045] p-4 sm:gap-5 sm:p-5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold font-display text-[13px] font-bold text-forest sm:size-10">
                        {step.n}
                      </span>
                      <div>
                        <h3 className="font-display text-[19px] font-semibold leading-none">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 max-w-[400px] text-[11px] leading-[1.7] text-sand/55">
                          {step.copy}
                        </p>
                      </div>
                      <span className="ml-auto hidden self-center sm:block">
                        <ArrowRight className="size-4 text-sand/25" />
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
              <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9.5px] text-sand/45">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3 text-gold" /> Instant e-ticket
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3 text-gold" /> Seat held 15 minutes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3 text-gold" /> Card or wallet
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- REVIEWS ---------------- */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <Reveal>
                <p className="eyebrow flex items-center gap-2 text-clay">
                  <span className="h-px w-7 bg-clay" />
                  Rider stories
                </p>
              </Reveal>
              <Reveal delay={70}>
                <h2 className="mt-4 max-w-[560px] text-balance font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-forest">
                  Reviews from the aisle seat.
                </h2>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <div className="flex items-center gap-3 rounded-2xl border border-forest/10 bg-paper px-4 py-3">
                <p className="font-display text-[34px] font-semibold leading-none text-forest">4.9</p>
                <div>
                  <Stars size={11} className="text-[#d78f28]" />
                  <p className="mt-1 text-[9.5px] text-muted">12,480 verified journeys</p>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.name} delay={i * 90}>
                <figure className="relative flex h-full flex-col justify-between rounded-[20px] border border-forest/10 bg-paper p-5 transition-colors hover:border-forest/25">
                  <div>
                    <div className="flex items-center justify-between">
                      <Stars size={12} className="text-[#d78f28]" />
                      <span className="inline-flex items-center gap-1 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                        <ShieldCheck className="size-3 text-[#5a9e6f]" />
                        Verified
                      </span>
                    </div>
                    <blockquote className="mt-4 text-pretty text-[12px] leading-[1.75] text-forest/80">
                      “{review.quote}”
                    </blockquote>
                  </div>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-forest/8 pt-4">
                    <span className="grid size-9 place-items-center rounded-full bg-moss text-[10px] font-extrabold text-forest">
                      {review.initials}
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-forest">{review.name}</p>
                      <p className="text-[9px] text-muted">
                        {review.route} · {review.date}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="border-t border-forest/10 bg-sand-deep/50 py-20 sm:py-24">
        <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10">
          <div>
            <Reveal>
              <p className="eyebrow flex items-center gap-2 text-clay">
                <span className="h-px w-7 bg-clay" />
                Help & answers
              </p>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="mt-4 max-w-[380px] text-balance font-display text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-forest">
                Everything before you board.
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="mt-4 max-w-[300px] text-[11.5px] leading-[1.8] text-muted">
                Straight answers about seats, changes, bags and pets. Still
                unsure? We answer messages in minutes.
              </p>
            </Reveal>
            <Reveal delay={190}>
              <div className="mt-6 overflow-hidden rounded-[18px] border border-forest/10 bg-paper">
                <a
                  href="tel:+18005550148"
                  className="flex items-center gap-3 border-b border-forest/8 p-4 transition-colors hover:bg-moss/25"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-forest text-sand">
                    <Phone className="size-4" />
                  </span>
                  <div>
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-muted">
                      Call us
                    </p>
                    <p className="text-[12px] font-bold text-forest">1 800 555 0148</p>
                  </div>
                  <ArrowUpRight className="ml-auto size-4 text-muted" />
                </a>
                <a
                  href="mailto:hello@wayfare.co"
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-moss/25"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-moss text-forest">
                    <Mail className="size-4" />
                  </span>
                  <div>
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-muted">
                      Email
                    </p>
                    <p className="text-[12px] font-bold text-forest">hello@wayfare.co</p>
                  </div>
                  <ArrowUpRight className="ml-auto size-4 text-muted" />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal direction="right" delay={100}>
            <div className="border-t border-forest/15">
              {faqs.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div key={faq.q} className="border-b border-forest/15">
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-${i}`}
                      className="group flex w-full items-start justify-between gap-5 py-4 text-left"
                    >
                      <span className="flex items-start gap-3 sm:gap-4">
                        <span
                          className={cn(
                            "mt-0.5 font-display text-[10px] font-semibold",
                            open ? "text-clay" : "text-muted/50",
                          )}
                        >
                          0{i + 1}
                        </span>
                        <span
                          className={cn(
                            "max-w-[520px] text-[12.5px] font-bold leading-snug transition-colors sm:text-[13.5px]",
                            open ? "text-forest" : "text-forest/75 group-hover:text-forest",
                          )}
                        >
                          {faq.q}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300",
                          open
                            ? "rotate-45 border-forest bg-forest text-sand"
                            : "border-forest/20 text-forest",
                        )}
                      >
                        <Plus className="size-3.5" />
                      </span>
                    </button>
                    <div
                      id={`faq-${i}`}
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)]",
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-[580px] pb-4 pl-[26px] pr-4 text-pretty text-[11px] leading-[1.8] text-muted sm:pl-[38px]">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[26px] bg-gold px-5 py-12 sm:px-10 sm:py-14 lg:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #061e17 1.2px, transparent 1.2px)",
              backgroundSize: "16px 16px",
            }}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 600 200"
            className="pointer-events-none absolute -right-10 bottom-0 h-48 w-[520px] text-forest/30"
          >
            <path
              d="M0 170C120 140 220 40 330 60s170 100 270 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="7 8"
            />
            <circle cx="330" cy="60" r="7" fill="currentColor" />
          </svg>
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.2em] text-forest/60">
                <span className="size-1.5 rounded-full bg-forest" />
                Coaches leave daily
              </p>
              <h2 className="mt-3 max-w-[760px] text-balance font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-forest">
                Somewhere is calling. Grab the{" "}
                <span className="underline decoration-forest decoration-2 underline-offset-[6px]">
                  window seat.
                </span>
              </h2>
              <p className="mt-4 max-w-[430px] text-[11.5px] leading-[1.75] text-forest/65">
                Seats from $16, taxes included, cancellation covered. Your next
                coastline is a tap away.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={scrollToSearch}
                className="group inline-flex items-center gap-2.5 rounded-full bg-forest py-2 pl-5 pr-2 text-[12px] font-semibold text-sand transition-colors hover:bg-forest-soft"
              >
                <Ticket className="size-3.5" />
                Book a seat
                <span className="grid size-8 place-items-center rounded-full bg-gold text-forest transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </button>
              <button
                onClick={onBook}
                className="inline-flex items-center gap-2 rounded-full border border-forest/40 bg-forest/[0.06] px-4 py-3 text-[11.5px] font-bold text-forest transition-colors hover:bg-forest hover:text-gold"
              >
                Explore routes
              </button>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
