import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bus,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Ticket as TicketIcon,
  Trash2,
} from "lucide-react";
import {
  cityMap,
  formatClock,
  formatDate,
  operatorMap,
  parseDate,
  type Ticket,
} from "@/data";
import { QrGlyph } from "./ui";

export function Trips({
  tickets,
  onOpen,
  onHome,
  onSearch,
  onCancel,
}: {
  tickets: Ticket[];
  onOpen: (ticket: Ticket) => void;
  onHome: () => void;
  onSearch: () => void;
  onCancel: (ref: string) => void;
}) {
  const [lookup, setLookup] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  const sorted = [...tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const findTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const code = lookup.trim().toUpperCase();
    const found = tickets.find((t) => t.ref.toUpperCase() === code);
    if (!found) {
      setLookupError("We couldn't find that reference on this device. Check your booking email.");
      return;
    }
    setLookupError("");
    onOpen(found);
  };

  return (
    <div className="pb-20">
      <div className="border-b border-forest/10 bg-paper">
        <div className="mx-auto w-full max-w-[1100px] px-5 py-9 sm:px-8 sm:py-11 lg:px-10">
          <p className="eyebrow flex items-center gap-2 text-clay">
            <span className="h-px w-7 bg-clay" />
            Your journeys
          </p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-[clamp(2rem,4.6vw,3.2rem)] font-semibold leading-none tracking-[-0.04em] text-forest">
                Tickets, all in one place.
              </h1>
              <p className="mt-2 max-w-[420px] text-[11.5px] leading-relaxed text-muted">
                Every booking made on this device is saved here. Show your QR code
                at boarding — no printing required.
              </p>
            </div>
            <form onSubmit={findTicket} className="w-full max-w-[320px]">
              <label htmlFor="lookup" className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.12em] text-muted">
                Find a booking
              </label>
              <div className="flex items-center rounded-full border border-forest/15 bg-sand p-1 pl-3.5 focus-within:border-forest/40">
                <Search className="size-3.5 shrink-0 text-muted" />
                <input
                  id="lookup"
                  value={lookup}
                  onChange={(e) => {
                    setLookup(e.target.value.toUpperCase());
                    setLookupError("");
                  }}
                  placeholder="WF-XXXXXX"
                  className="min-w-0 flex-1 bg-transparent px-2 py-1.5 font-mono text-[11px] text-forest uppercase placeholder:text-muted/50 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Look up booking"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-forest text-sand"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
              {lookupError && (
                <p role="alert" className="mt-1.5 text-[9.5px] leading-snug text-clay">
                  {lookupError}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-5 pt-6 sm:px-8 lg:px-10">
        {sorted.length === 0 ? (
          <div className="relative overflow-hidden rounded-[24px] border border-dashed border-forest/25 bg-paper px-6 py-14 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.5]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(15,51,42,0.08) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-moss text-forest">
                <TicketIcon className="size-6" />
              </span>
              <h2 className="mt-4 font-display text-[24px] font-semibold text-forest">
                No tickets yet — let's fix that.
              </h2>
              <p className="mx-auto mt-1.5 max-w-[340px] text-[11px] leading-relaxed text-muted">
                Book a coach and your e-ticket will appear here, ready to board.
                Seats from $16, taxes included.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={onSearch}
                  className="group inline-flex items-center gap-2 rounded-full bg-forest py-1.5 pl-4 pr-1.5 text-[11px] font-semibold text-sand"
                >
                  <Bus className="size-3.5" />
                  Find a coach
                  <span className="grid size-7 place-items-center rounded-full bg-gold text-forest transition-transform group-hover:rotate-45">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </button>
                <button
                  onClick={onHome}
                  className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-3.5 py-2.5 text-[10.5px] font-semibold text-forest hover:bg-moss/30"
                >
                  Back to home
                </button>
              </div>
              <p className="mx-auto mt-5 max-w-[330px] rounded-lg bg-sand-deep/70 px-3 py-2 text-[8.5px] leading-relaxed text-muted">
                This is a demo site. Bookings are stored locally in your browser and
                are not sent to a server.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((ticket, index) => {
              const op = operatorMap[ticket.trip.operatorId];
              const upcoming = new Date(ticket.trip.departISO) >= new Date();
              return (
                <article
                  key={ticket.ref}
                  className="animate-rise overflow-hidden rounded-[18px] border border-forest/12 bg-paper transition-colors hover:border-forest/25"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                    <div className="flex shrink-0 items-center gap-3 sm:w-[160px]">
                      <div className="flex w-[54px] flex-col items-center rounded-xl bg-forest py-2 text-sand">
                        <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-sand/60">
                          {parseDate(ticket.trip.date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="font-display text-[22px] font-semibold leading-none">
                          {parseDate(ticket.trip.date).getDate()}
                        </span>
                        <span className="mt-1 text-[7.5px] font-semibold text-sand/55">
                          {parseDate(ticket.trip.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.08em] ${
                            upcoming ? "bg-moss text-forest" : "bg-sand-deep text-muted"
                          }`}
                        >
                          <span className={`size-1 rounded-full ${upcoming ? "bg-[#3d7d55]" : "bg-muted"}`} />
                          {upcoming ? "Upcoming" : "Completed"}
                        </span>
                        <p className="mt-1 font-mono text-[9.5px] font-semibold text-muted">
                          {ticket.ref}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-display text-[17px] font-semibold leading-none text-forest">
                          {cityMap[ticket.trip.from].name}
                        </p>
                        <ArrowRight className="size-3.5 text-gold" />
                        <p className="font-display text-[17px] font-semibold leading-none text-forest">
                          {cityMap[ticket.trip.to].name}
                        </p>
                      </div>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatClock(ticket.trip.departISO)} – {formatClock(ticket.trip.arriveISO)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <TicketIcon className="size-3" />
                          Seats {ticket.seats.join(", ")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Bus className="size-3" />
                          {op.name}
                        </span>
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="rounded border border-forest/10 bg-white p-0.5">
                          <QrGlyph value={ticket.ref} className="size-7" />
                        </div>
                        <p className="text-[8.5px] text-muted">
                          {ticket.passengers.length}{" "}
                          {ticket.passengers.length === 1 ? "passenger" : "passengers"} ·{" "}
                          {formatDate(ticket.trip.date, "long")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-forest/8 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <p className="font-display text-[22px] font-semibold leading-none text-forest">
                        ${ticket.total}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setConfirming(ticket.ref)}
                          aria-label={`Cancel booking ${ticket.ref}`}
                          className="grid size-8 place-items-center rounded-full border border-forest/12 text-muted transition-colors hover:border-clay/40 hover:text-clay"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => onOpen(ticket)}
                          className="group inline-flex items-center gap-1.5 rounded-full bg-forest py-1.5 pl-3.5 pr-1.5 text-[10.5px] font-semibold text-sand"
                        >
                          View ticket
                          <span className="grid size-6 place-items-center rounded-full bg-gold text-forest transition-transform group-hover:rotate-45">
                            <ArrowUpRight className="size-3" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {confirming === ticket.ref && (
                    <div className="flex flex-wrap items-center gap-3 border-t border-forest/10 bg-clay/[0.06] px-4 py-3">
                      <p className="flex-1 text-[10px] leading-relaxed text-forest/75">
                        Cancel booking <span className="font-mono font-bold">{ticket.ref}</span>? In
                        this demo the ticket is removed from this browser.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirming(null)}
                          className="rounded-full border border-forest/20 px-3 py-1.5 text-[9.5px] font-semibold text-forest"
                        >
                          Keep ticket
                        </button>
                        <button
                          onClick={() => {
                            onCancel(ticket.ref);
                            setConfirming(null);
                          }}
                          className="rounded-full bg-clay px-3 py-1.5 text-[9.5px] font-bold text-white"
                        >
                          Cancel booking
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-[18px] border border-forest/12 bg-moss/30 p-4">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-forest">
                  <ShieldCheck className="size-3.5" />
                  Good to know before you board
                </p>
                <ul className="mt-2 grid gap-1.5 text-[9.5px] text-forest/70 sm:grid-cols-2">
                  {[
                    "Arrive 10 minutes early",
                    "Photo ID may be requested",
                    "One 23kg bag included",
                    "Free changes up to 24h",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check className="size-3 shrink-0 text-[#3d7d55]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[18px] border border-forest/12 bg-paper p-4">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-forest">
                  <MapPin className="size-3.5" />
                  Boarding point
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-forest/70">
                  {sorted[0].boarding}
                </p>
                <p className="mt-1 text-[8.5px] text-muted">
                  Taken from your most recent ticket — every booking lists its own
                  stop on the e-ticket.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-forest/12 bg-forest px-4 py-4 text-sand">
              <div>
                <p className="flex items-center gap-1.5 font-display text-[17px] font-semibold">
                  <CalendarDays className="size-4 text-gold" />
                  Where to next?
                </p>
                <p className="mt-0.5 text-[9.5px] text-sand/55">
                  Members save 10% with code WANDER10.
                </p>
              </div>
              <button
                onClick={onSearch}
                className="group inline-flex items-center gap-2 rounded-full bg-gold py-1.5 pl-4 pr-1.5 text-[10.5px] font-bold text-forest"
              >
                Plan another trip
                <span className="grid size-7 place-items-center rounded-full bg-forest text-sand transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
