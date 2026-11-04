import { useState } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { cities, cityMap, routeStats, type CityCode } from "@/data";
import { Logo } from "./ui";

export function Footer({
  onHome,
  onSection,
  onRoute,
  onTrips,
}: {
  onHome: () => void;
  onSection: (id: string) => void;
  onRoute: (from: CityCode, to: CityCode) => void;
  onTrips: () => void;
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const sections = [
    { label: "Popular routes", id: "routes" },
    { label: "Onboard experience", id: "onboard" },
    { label: "How it works", id: "how" },
    { label: "Help & FAQs", id: "faq" },
  ];

  const support = [
    { label: "Manage a booking", action: onTrips },
    { label: "Cancellation policy", action: () => onSection("faq") },
    { label: "Baggage allowance", action: () => onSection("faq") },
    { label: "Accessibility", action: () => onSection("faq") },
  ];

  return (
    <footer className="relative overflow-hidden bg-forest text-sand">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-10 size-80 rounded-full border border-sand/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-forest-soft opacity-70 blur-[60px]"
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-5 pt-14 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-sand/12 pb-12 lg:grid-cols-[1.5fr_0.7fr_0.8fr_1fr] lg:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Logo inverted onClick={onHome} />
            <p className="mt-5 max-w-[280px] text-[12px] leading-[1.75] text-sand/55">
              Premium intercity coaches, honest prices and a seat you actually
              chose. Riding the West Coast since 2014.
            </p>
            <div className="mt-6">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-sand/45">
                Fare drops & new routes
              </p>
              {subscribed ? (
                <div className="mt-2.5 flex items-center gap-2 rounded-full border border-moss/30 bg-moss/10 px-4 py-3 text-[11px] font-medium text-moss">
                  <Check className="size-3.5" />
                  You're on the list. See you onboard.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setSubscribed(true);
                  }}
                  className="mt-2.5 flex items-center rounded-full border border-sand/20 bg-sand/[0.05] p-1 pl-4 transition-colors focus-within:border-sand/45"
                >
                  <label htmlFor="footer-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 bg-transparent py-2 text-[11px] text-sand placeholder:text-sand/35 focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-gold text-forest transition-transform hover:rotate-45"
                  >
                    <ArrowUpRight className="size-3.5" />
                  </button>
                </form>
              )}
              <p className="mt-2 text-[9px] leading-relaxed text-sand/35">
                One email a month. Unsubscribe in a click.
              </p>
            </div>
          </div>

          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-sand/40">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => onSection(s.id)}
                    className="link-underline text-[11.5px] text-sand/70 transition-colors hover:text-sand"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onHome}
                  className="link-underline text-[11.5px] text-sand/70 transition-colors hover:text-sand"
                >
                  Home
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-sand/40">
              Support
            </p>
            <ul className="mt-4 space-y-2.5">
              {support.map((s) => (
                <li key={s.label}>
                  <button
                    onClick={s.action}
                    className="link-underline text-left text-[11.5px] text-sand/70 transition-colors hover:text-sand"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-sand/40">
              Say hello
            </p>
            <ul className="mt-4 space-y-3 text-[11.5px] text-sand/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold" />
                <span>
                  48 Embarcadero Way
                  <br />
                  San Francisco, CA 94105
                </span>
              </li>
              <li>
                <a
                  href="tel:+18005550148"
                  className="flex items-center gap-2.5 transition-colors hover:text-sand"
                >
                  <Phone className="size-3.5 shrink-0 text-gold" />
                  1 800 555 0148
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@wayfare.co"
                  className="flex items-center gap-2.5 break-all transition-colors hover:text-sand"
                >
                  <Mail className="size-3.5 shrink-0 text-gold" />
                  hello@wayfare.co
                </a>
              </li>
            </ul>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-sand/12 bg-sand/[0.04] px-3 py-2.5 text-[9.5px] leading-relaxed text-sand/55">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-moss" />
              Payments secured with 256-bit encryption. Card details never
              stored.
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-b border-sand/12 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Top route",
              from: "SFO" as CityCode,
              to: "LAX" as CityCode,
            },
            {
              title: "Quick escape",
              from: "LAX" as CityCode,
              to: "LAS" as CityCode,
            },
            {
              title: "Coastal favourite",
              from: "SFO" as CityCode,
              to: "SBA" as CityCode,
            },
            {
              title: "Overnight",
              from: "SFO" as CityCode,
              to: "SEA" as CityCode,
            },
          ].map((route) => (
            <button
              key={route.title}
              onClick={() => onRoute(route.from, route.to)}
              className="group text-left"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-sand/35">
                {route.title}
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-[13px] font-semibold text-sand/85">
                {cityMap[route.from].name}
                <ArrowUpRight className="size-3.5 text-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                {cityMap[route.to].name}
              </p>
              <p className="mt-0.5 text-[10px] text-sand/40">
                from ${routeStats(route.from, route.to).base} · one way
              </p>
            </button>
          ))}
        </div>

        <div className="relative flex items-end justify-between gap-4 pt-9">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-moss">
              <span className="size-1.5 rounded-full bg-gold" />
              Somewhere is calling
            </p>
            <p className="mt-3 select-none font-display text-[clamp(4rem,15vw,12rem)] font-semibold leading-[0.7] tracking-[-0.05em] text-sand">
              wayfare<span className="text-gold">.</span>
            </p>
          </div>
          <div className="hidden shrink-0 flex-col items-end gap-4 pb-2 sm:flex">
            <div className="flex -space-x-2">
              {cities.slice(0, 4).map((c) => (
                <span
                  key={c.code}
                  className="grid size-8 place-items-center rounded-full border-2 border-forest bg-sand/10 text-[8.5px] font-bold text-sand/70"
                >
                  {c.code}
                </span>
              ))}
            </div>
            <p className="text-right text-[10px] leading-relaxed text-sand/40">
              7 cities · 120+ daily departures
              <br />
              California & the Pacific Northwest
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="group grid size-10 place-items-center rounded-full bg-sand/10 text-sand transition-colors hover:bg-sand hover:text-forest"
            >
              <ArrowUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-sand/12 py-5 text-[9.5px] text-sand/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Wayfare Coach Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => onSection("faq")} className="hover:text-sand">
              Privacy
            </button>
            <button onClick={() => onSection("faq")} className="hover:text-sand">
              Terms
            </button>
            <button onClick={() => onSection("faq")} className="hover:text-sand">
              Accessibility
            </button>
            <span className="inline-flex items-center gap-1">
              <span className="size-1 rounded-full bg-moss" />
              Independent, rider-first
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
