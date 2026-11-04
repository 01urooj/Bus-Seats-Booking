import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bus,
  Menu,
  Phone,
  Ticket,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Logo } from "./ui";

export type View = "home" | "results" | "booking" | "ticket" | "trips";

const links = [
  { label: "Routes", id: "routes" },
  { label: "Onboard", id: "onboard" },
  { label: "How it works", id: "how" },
  { label: "Help", id: "faq" },
];

export function Header({
  view,
  onHome,
  onSection,
  onBook,
  onTrips,
  ticketCount,
}: {
  view: View;
  onHome: () => void;
  onSection: (id: string) => void;
  onBook: () => void;
  onTrips: () => void;
  ticketCount: number;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const section = (id: string) => {
    setOpen(false);
    onSection(id);
  };

  return (
    <>
      <header id="top" className="sticky top-0 z-50">
        <div
          className={cn(
            "overflow-hidden bg-gold text-forest transition-all duration-500",
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
          )}
        >
          <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-4 px-5 py-2.5 text-[10.5px] sm:px-8 lg:px-10">
            <p className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-gold">
                Summer fares
              </span>
              <span className="font-medium text-forest/75">
                20% off coastal routes with code{" "}
                <span className="font-extrabold text-forest">COASTAL</span>
              </span>
            </p>
            <div className="hidden items-center gap-5 text-forest/60 sm:flex">
              <button
                onClick={() => section("how")}
                className="transition-colors hover:text-forest"
              >
                Free cancellation up to 24h
              </button>
              <a
                href="tel:+18005550148"
                className="flex items-center gap-1.5 font-semibold transition-colors hover:text-forest"
              >
                <Phone className="size-3" />
                1 800 555 0148
              </a>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "border-b bg-forest transition-all duration-400",
            scrolled
              ? "border-white/10 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]"
              : "border-white/10",
          )}
        >
          <div className="mx-auto flex h-[70px] w-full max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <Logo inverted onClick={onHome} />

            <nav
              aria-label="Primary"
              className="hidden items-center gap-7 lg:flex"
            >
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => section(link.id)}
                  className="link-underline text-[12.5px] font-semibold text-sand/65 transition-colors hover:text-sand"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onTrips}
                className={cn(
                  "hidden items-center gap-2 rounded-full border px-3.5 py-2.5 text-[11.5px] font-semibold transition-colors sm:flex",
                  view === "trips"
                    ? "border-sand bg-sand text-forest"
                    : "border-white/20 text-sand/85 hover:border-white/50 hover:text-sand",
                )}
              >
                <Ticket className="size-3.5" />
                My trips
                {ticketCount > 0 && (
                  <span className="grid size-4 place-items-center rounded-full bg-gold text-[8.5px] font-extrabold text-forest">
                    {ticketCount}
                  </span>
                )}
              </button>
              <button
                onClick={onBook}
                className="group hidden items-center gap-2.5 rounded-full bg-gold py-1.5 pl-4 pr-1.5 text-[12px] font-bold text-forest transition-all hover:bg-moss-deep md:inline-flex"
              >
                <Bus className="size-3.5" />
                Book a seat
                <span className="grid size-8 place-items-center rounded-full bg-forest text-gold transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </button>
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="grid size-10 place-items-center rounded-full border border-white/25 text-sand transition-colors hover:bg-sand hover:text-forest lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
          <div className="h-[2px] w-full bg-white/10" aria-hidden="true">
            <div
              className="h-full bg-gold transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-0 z-[55] flex flex-col bg-forest text-sand transition-all duration-400 lg:hidden",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Logo inverted onClick={() => { setOpen(false); onHome(); }} />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid size-10 place-items-center rounded-full border border-white/25 text-sand"
          >
            <span className="text-[18px] leading-none">×</span>
          </button>
        </div>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-5 pb-8 pt-2">
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => section(link.id)}
                className="group flex items-center justify-between border-b border-white/10 py-5 text-left"
              >
                <span className="font-display text-[2rem] font-medium leading-none text-sand">
                  {link.label}
                </span>
                <span className="grid size-9 place-items-center rounded-full border border-white/20 text-sand transition-colors group-hover:bg-gold group-hover:text-forest">
                  <ArrowUpRight className="size-4" />
                </span>
              </button>
            ))}
            <button
              onClick={() => { setOpen(false); onTrips(); }}
              className="group flex items-center justify-between border-b border-white/10 py-5 text-left"
            >
              <span className="font-display text-[2rem] font-medium leading-none text-sand">
                My trips
                {ticketCount > 0 && (
                  <span className="ml-2 align-middle text-[11px] font-bold text-gold">
                    {ticketCount}
                  </span>
                )}
              </span>
              <span className="grid size-9 place-items-center rounded-full border border-white/20 text-sand">
                <Ticket className="size-4" />
              </span>
            </button>
          </nav>
          <div className="mt-8 space-y-3">
            <button
              onClick={() => { setOpen(false); onBook(); }}
              className="flex w-full items-center justify-between rounded-full bg-gold px-5 py-4 text-[13px] font-bold text-forest"
            >
              Find your coach
              <span className="grid size-8 place-items-center rounded-full bg-forest text-gold">
                <ArrowUpRight className="size-4" />
              </span>
            </button>
            <a
              href="tel:+18005550148"
              className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-4 text-[12px] font-semibold text-sand/85"
            >
              <span className="flex items-center gap-2">
                <Phone className="size-4 text-gold" />
                Need a hand? 1 800 555 0148
              </span>
              <span className="text-[10px] text-sand/40">7am–11pm</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
