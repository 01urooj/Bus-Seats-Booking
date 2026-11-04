import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bus,
  CalendarDays,
  Check,
  Clock,
  Download,
  Info,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  Ticket as TicketIcon,
  Users,
} from "lucide-react";
import {
  cityMap,
  extraOptions,
  formatClock,
  formatDate,
  formatDuration,
  operatorMap,
  priceBreakdown,
  type Ticket,
} from "@/data";
import { QrGlyph } from "./ui";

const confettiColors = ["#d7ff4f", "#cdf170", "#f2f3ec", "#2f7a5f", "#d7ff4f"];
const confetti = Array.from({ length: 30 }, (_, i) => ({
  x: `${(i * 37 + 9) % 100}%`,
  color: confettiColors[i % confettiColors.length],
  drift: `${((i * 29) % 160) - 80}px`,
  spin: `${180 + ((i * 97) % 540)}deg`,
  duration: `${1.7 + ((i * 13) % 12) / 10}s`,
  delay: `${((i * 7) % 14) / 14}s`,
}));

export function TicketView({
  ticket,
  onHome,
  onTrips,
  onBookAnother,
}: {
  ticket: Ticket;
  onHome: () => void;
  onTrips: () => void;
  onBookAnother: () => void;
}) {
  const { trip } = ticket;
  const op = operatorMap[trip.operatorId];
  const fare = priceBreakdown(trip, ticket.seats, ticket.extras, ticket.promo);
  const delta = Math.max(
    0,
    Math.round(
      (new Date(trip.arriveISO).setHours(0, 0, 0, 0) -
        new Date(trip.departISO).setHours(0, 0, 0, 0)) /
        86400000,
    ),
  );

  const download = () => {
    const lines = [
      "WAYFARE COACH — E-TICKET",
      "================================",
      `Booking reference: ${ticket.ref}`,
      `Status: CONFIRMED`,
      "",
      `${cityMap[trip.from].name} → ${cityMap[trip.to].name}`,
      `${formatDate(trip.date, "long")}`,
      `Departs ${formatClock(trip.departISO)} · Arrives ${formatClock(trip.arriveISO)}${
        delta > 0 ? ` (+${delta} day)` : ""
      }`,
      `Operator: ${op.name} · ${trip.busType}`,
      `Duration: ${formatDuration(trip.durationMins)}`,
      "",
      `Boarding point: ${ticket.boarding}`,
      `Seats: ${ticket.seats.join(", ")}`,
      "",
      "Passengers",
      "--------------------------------",
      ...ticket.passengers.map((p) => `${p.seat}  ${p.name}${p.age ? ` · age ${p.age}` : ""}`),
      "",
      `Total paid: $${ticket.total}`,
      `Lead traveller: ${ticket.contact.name} · ${ticket.contact.phone}`,
      "",
      "Arrive 10 minutes before departure with photo ID.",
      "Need help? hello@wayfare.co · 1 800 555 0148",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ticket.ref}-wayfare-ticket.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const addToCalendar = () => {
    const start = new Date(trip.departISO);
    const end = new Date(trip.arriveISO);
    const stamp = (d: Date) => {
      const p = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(
        d.getMinutes(),
      )}00`;
    };
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wayfare Coach//EN",
      "BEGIN:VEVENT",
      `UID:${ticket.ref}@wayfare.co`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:Wayfare coach ${cityMap[trip.from].name} → ${cityMap[trip.to].name}`,
      `LOCATION:${ticket.boarding}, ${cityMap[trip.from].name}`,
      `DESCRIPTION:Booking ${ticket.ref}. Seats ${ticket.seats.join(", ")}. ${op.name}.`,
      "BEGIN:VALARM",
      "TRIGGER:-PT45M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Coach departs in 45 minutes",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ticket.ref}-wayfare.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-16">
      <div className="relative overflow-hidden bg-forest px-5 pb-24 pt-10 text-sand sm:px-8 sm:pt-12 lg:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-10 size-64 rounded-full border border-sand/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #f2f3ec 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {confetti.map((piece, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={
                {
                  "--x": piece.x,
                  "--c": piece.color,
                  "--drift": piece.drift,
                  "--spin": piece.spin,
                  "--dur": piece.duration,
                  "--delay": piece.delay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div className="relative mx-auto w-full max-w-[1080px]">
          <button
            onClick={onTrips}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand/20 px-3 py-1.5 text-[10.5px] font-semibold text-sand/80 transition-colors hover:bg-sand hover:text-forest"
          >
            <ArrowLeft className="size-3.5" />
            My trips
          </button>
          <div className="stamp pointer-events-none absolute right-10 top-8 hidden size-[96px] place-items-center rounded-full border-2 border-gold/70 bg-forest/40 text-gold backdrop-blur-sm lg:grid">
            <div className="text-center">
              <Check className="mx-auto size-5" strokeWidth={3} />
              <p className="mt-1 font-display text-[13px] font-bold tracking-[0.14em]">CONFIRMED</p>
              <p className="mt-0.5 text-[6px] font-bold tracking-[0.22em] text-gold/70">
                WAYFARE · E-TICKET
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-forest">
                <Check className="size-3" strokeWidth={3} />
                Seats confirmed
              </p>
              <h1 className="mt-3 max-w-[600px] text-balance font-display text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
                You're going to{" "}
                <span className="text-gold">{cityMap[trip.to].name}.</span>
              </h1>
              <p className="mt-3 max-w-[440px] text-[11.5px] leading-relaxed text-sand/60">
                Your e-ticket is saved below and on its way to{" "}
                <span className="font-semibold text-sand/85">{ticket.contact.email}</span>. Show the
                QR code at boarding.
              </p>
            </div>
            <div className="rounded-xl border border-sand/20 bg-sand/[0.06] px-4 py-3 text-right">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-sand/50">
                Booking reference
              </p>
              <p className="mt-1 font-mono text-[16px] font-bold tracking-wider text-gold">
                {ticket.ref}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-16 w-full max-w-[1080px] px-5 sm:px-8 lg:px-10">
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_330px]">
          {/* ticket */}
          <div
            className="ticket animate-rise overflow-hidden rounded-[20px] border border-forest/12 bg-paper shadow-[0_30px_60px_-40px_rgba(15,51,42,0.6)]"
            style={{ "--notch-top": "73%", "--notch-color": "#f2f3ec" } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-3 border-b border-forest/10 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[9px] bg-forest text-sand">
                  <Bus className="size-3.5" />
                </span>
                <div>
                  <p className="font-display text-[14px] font-semibold leading-none text-forest">wayfare</p>
                  <p className="mt-0.5 text-[6.5px] font-bold uppercase tracking-[0.26em] text-muted">
                    E-ticket
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-moss px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-forest">
                <span className="size-1.5 rounded-full bg-[#3d7d55]" />
                Confirmed
              </span>
            </div>

            <div className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[9.5px] font-semibold text-muted">
                  {formatDate(trip.date, "long")} · {formatClock(trip.departISO)}
                </p>
                <p className="text-[9.5px] font-semibold text-muted">{op.name}</p>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted">From</p>
                  <p className="mt-1 font-display text-[38px] font-semibold leading-none tracking-[-0.04em] text-forest">
                    {cityMap[trip.from].code}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-forest/75">{cityMap[trip.from].name}</p>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center">
                    <span className="size-1.5 rounded-full border border-forest/40" />
                    <span className="route-dash h-px flex-1" />
                    <Bus className="mx-1 size-4 text-forest/40" />
                    <span className="route-dash h-px flex-1" />
                    <span className="size-1.5 rounded-full bg-gold" />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[8.5px] font-semibold text-muted">
                    <span>{formatClock(trip.departISO)}</span>
                    <span>{formatDuration(trip.durationMins)}</span>
                    <span>{formatClock(trip.arriveISO)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted">To</p>
                  <p className="mt-1 font-display text-[38px] font-semibold leading-none tracking-[-0.04em] text-forest">
                    {cityMap[trip.to].code}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-forest/75">
                    {cityMap[trip.to].name}
                    {delta > 0 ? ` (+${delta}d)` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-sand/80 p-3 sm:grid-cols-4">
                {[
                  { label: "Seats", value: ticket.seats.join(" · "), icon: TicketIcon },
                  { label: "Travellers", value: `${ticket.passengers.length}`, icon: Users },
                  { label: "Coach", value: trip.busType, icon: Bus },
                  { label: "Duration", value: formatDuration(trip.durationMins), icon: Clock },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-[0.1em] text-muted">
                      <item.icon className="size-2.5" />
                      {item.label}
                    </p>
                    <p className="mt-1 text-[10.5px] font-bold text-forest">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-forest/10 px-3 py-2.5">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-forest" />
                <div>
                  <p className="text-[7.5px] font-bold uppercase tracking-[0.1em] text-muted">
                    Boarding point
                  </p>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-forest">{ticket.boarding}</p>
                  <p className="mt-0.5 text-[9px] text-muted">
                    {cityMap[trip.from].name} · arrive 10 minutes before departure
                  </p>
                </div>
              </div>
            </div>

            <div className="perf-line mx-5" />

            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted">
                  Passenger{ticket.passengers.length > 1 ? "s" : ""}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {ticket.passengers.map((p) => (
                    <li key={p.seat} className="flex items-center gap-2 text-[10.5px]">
                      <span className="grid size-4 place-items-center rounded bg-moss text-[7.5px] font-bold text-forest">
                        {p.seat}
                      </span>
                      <span className="font-semibold text-forest">{p.name}</span>
                      {p.age && <span className="text-[9px] text-muted">· {p.age}y</span>}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 flex items-center gap-1.5 text-[8.5px] text-muted">
                  <ShieldCheck className="size-3 text-[#3d7d55]" />
                  Photo ID may be requested at boarding
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative overflow-hidden rounded-md border border-forest/10 bg-white p-1">
                  <QrGlyph value={ticket.ref} className="size-[74px]" />
                  <span className="scan-line" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-mono text-[11px] font-bold tracking-wider text-forest">{ticket.ref}</p>
                  <p className="mt-0.5 text-[8px] text-muted">Scan at boarding</p>
                  <div className="mt-1 flex h-4 items-end gap-[2px]" aria-hidden="true">
                    {Array.from({ length: 22 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-[2px] bg-forest"
                        style={{ height: `${8 + ((i * 7) % 9)}px`, opacity: i % 4 === 0 ? 0.45 : 0.9 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* sidebar */}
          <div className="space-y-4">
            <div className="rounded-[18px] border border-forest/12 bg-paper p-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted">
                  Fare summary
                </p>
                <span className="text-[9px] font-semibold text-forest/60">
                  {ticket.promo ? ticket.promo : "Standard"}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-[10.5px]">
                <div className="flex justify-between text-muted">
                  <span>{ticket.seats.length} × seat fares</span>
                  <span>${fare.seatTotal}</span>
                </div>
                {ticket.extras.length > 0 && (
                  <div className="space-y-1 border-t border-dashed border-forest/15 pt-2">
                    {ticket.extras.map((id) => {
                      const extra = extraOptions.find((e) => e.id === id);
                      const price = extra?.perSeat
                        ? (extra.price ?? 0) * ticket.seats.length
                        : (extra?.price ?? 0);
                      return (
                        <div key={id} className="flex justify-between text-muted">
                          <span>{extra?.title}</span>
                          <span>${price}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {fare.discount > 0 && (
                  <div className="flex justify-between font-semibold text-[#3d7d55]">
                    <span>Promo {ticket.promo}</span>
                    <span>−${fare.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Taxes & fees</span>
                  <span>${fare.taxes + fare.fees}</span>
                </div>
                <div className="mt-2 flex items-end justify-between border-t border-forest/12 pt-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-forest">
                    Total paid
                  </span>
                  <span className="font-display text-[26px] font-semibold leading-none text-forest">
                    ${ticket.total}
                  </span>
                </div>
                <p className="text-right text-[8px] text-muted">Taxes & fees included</p>
              </div>
            </div>

            <div className="rounded-[18px] border border-forest/12 bg-paper p-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted">
                Your ticket
              </p>
              <div className="mt-2.5 space-y-2">
                <button
                  onClick={download}
                  className="group flex w-full items-center justify-between rounded-full bg-forest py-2 pl-4 pr-2 text-[11px] font-semibold text-sand transition-colors hover:bg-forest-soft"
                >
                  <span className="flex items-center gap-2">
                    <Download className="size-3.5" />
                    Download ticket
                  </span>
                  <span className="grid size-7 place-items-center rounded-full bg-gold text-forest">
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:rotate-45" />
                  </span>
                </button>
                <button
                  onClick={addToCalendar}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-forest/15 py-2.5 text-[10.5px] font-semibold text-forest transition-colors hover:bg-moss/40"
                >
                  <CalendarDays className="size-3.5" />
                  Add to calendar
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-forest/15 py-2.5 text-[10.5px] font-semibold text-forest transition-colors hover:bg-moss/40"
                >
                  <Printer className="size-3.5" />
                  Print ticket
                </button>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[8.5px] leading-relaxed text-muted">
                <Info className="mt-0.5 size-3 shrink-0" />
                Demo ticket — stored in this browser only, no email is actually sent.
              </p>
            </div>

            <div className="rounded-[18px] border border-forest/12 bg-moss/40 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-forest">
                <Sparkles className="size-3.5 text-gold" />
                Travel line
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-forest/65">
                Need us? We're on the phone 7am–11pm daily.
              </p>
              <div className="mt-2 space-y-1.5 text-[9.5px]">
                <a href="tel:+18005550148" className="flex items-center gap-1.5 font-semibold text-forest hover:underline">
                  <Phone className="size-3" />
                  1 800 555 0148
                </a>
                <a href="mailto:hello@wayfare.co" className="flex items-center gap-1.5 font-semibold text-forest hover:underline">
                  <Mail className="size-3" />
                  hello@wayfare.co
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-[18px] border border-forest/12 bg-paper px-4 py-4 sm:flex-row sm:items-center">
          <p className="text-[10.5px] text-muted">
            <span className="font-bold text-forest">All set.</span> Your seats are held and
            confirmed — nothing else to do before boarding.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onTrips}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-3.5 py-2 text-[10.5px] font-semibold text-forest hover:bg-moss/30"
            >
              <TicketIcon className="size-3.5" />
              View my trips
            </button>
            <button
              onClick={onBookAnother}
              className="group inline-flex items-center gap-1.5 rounded-full bg-forest py-1.5 pl-3.5 pr-1.5 text-[10.5px] font-semibold text-sand"
            >
              Book another
              <span className="grid size-6 place-items-center rounded-full bg-gold text-forest">
                <ArrowRight className="size-3" />
              </span>
            </button>
          </div>
        </div>

        <button
          onClick={onHome}
          className="mt-4 inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-forest/60 hover:text-forest"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </button>
      </div>
    </div>
  );
}
