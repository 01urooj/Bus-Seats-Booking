import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bus,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Tag,
  Ticket,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  boardingPoints,
  cityMap,
  extraOptions,
  formatClock,
  formatDate,
  formatDuration,
  makeReference,
  operatorMap,
  priceBreakdown,
  promos,
  seatPrice,
  type Passenger,
  type Search as SearchState,
  type Ticket as TicketType,
  type Trip,
} from "@/data";
import { cn } from "@/utils/cn";
import { SeatMap } from "./SeatMap";

const stepLabels = ["Seats", "Passengers", "Payment"];

type PassengerForm = { name: string; age: string; gender: string };

const emptyForm: PassengerForm = { name: "", age: "", gender: "" };

const inputBase =
  "w-full rounded-xl border bg-paper px-3 py-2.5 text-[12px] text-forest placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-forest/15";

const MAX_SEATS = 4;

export function Booking({
  trip,
  search,
  onBack,
  onComplete,
  onPartyChange,
}: {
  trip: Trip;
  search: SearchState;
  onBack: () => void;
  onComplete: (ticket: TicketType) => void;
  onPartyChange?: (count: number) => void;
}) {
  const [step, setStep] = useState(0);
  const [seats, setSeats] = useState<string[]>([]);
  const [forms, setForms] = useState<Record<string, PassengerForm>>({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [boarding, setBoarding] = useState(boardingPoints[trip.from][0]);
  const [extras, setExtras] = useState<string[]>([]);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: "ok" | "bad"; text: string } | null>(null);
  const [method, setMethod] = useState<"card" | "wallet">("card");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const op = operatorMap[trip.operatorId];
  const breakdown = useMemo(
    () => priceBreakdown(trip, seats, extras, promo),
    [trip, seats, extras, promo],
  );
  const delta = Math.max(
    0,
    Math.round(
      (new Date(trip.arriveISO).setHours(0, 0, 0, 0) -
        new Date(trip.departISO).setHours(0, 0, 0, 0)) /
        86400000,
    ),
  );

  const setField = (seat: string, key: keyof PassengerForm, value: string) => {
    setForms((prev) => ({
      ...prev,
      [seat]: { ...(prev[seat] ?? emptyForm), [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [`name-${seat}`]: "", [`age-${seat}`]: "" }));
  };

  const updateSeats = (next: string[]) => {
    setSeats(next);
    if (next.length > 0) onPartyChange?.(next.length);
    setForms((prev) => {
      const filtered: Record<string, PassengerForm> = {};
      next.forEach((seat) => {
        filtered[seat] = prev[seat] ?? emptyForm;
      });
      return filtered;
    });
  };

  const validatePassengers = () => {
    const next: Record<string, string> = {};
    seats.forEach((seat) => {
      const form = forms[seat] ?? emptyForm;
      if (!form.name.trim()) next[`name-${seat}`] = "Passenger name required";
      if (form.age && (Number(form.age) < 1 || Number(form.age) > 120)) {
        next[`age-${seat}`] = "Enter an age between 1 and 120";
      }
    });
    if (!contact.name.trim()) next.contactName = "Add a contact name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      next.email = "Enter a valid email for your ticket";
    }
    if (contact.phone.replace(/\D/g, "").length < 7) {
      next.phone = "Enter a phone number we can reach you on";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goPassengers = () => {
    if (seats.length === 0) {
      setErrors({ seats: "Choose at least one seat to continue." });
      return;
    }
    setErrors({});
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPayment = () => {
    if (!validatePassengers()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const found = promos.find((p) => p.code === code);
    if (!found) {
      setPromo(null);
      setPromoMessage({ type: "bad", text: "That code has expired or isn't valid." });
      return;
    }
    setPromo(found.code);
    setPromoMessage({ type: "ok", text: `${found.label} — applied to your fare.` });
  };

  const formatCard = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const pay = () => {
    const next: Record<string, string> = {};
    if (method === "card") {
      if (!card.name.trim()) next.cardName = "Add the name on your card";
      if (card.number.replace(/\s/g, "").length !== 16) {
        next.cardNumber = "Enter a 16-digit card number";
      }
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) next.expiry = "Use MM/YY";
      if (card.cvc.replace(/\D/g, "").length < 3) next.cvc = "3–4 digits";
    }
    if (!terms) next.terms = "Please accept the travel conditions";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setProcessing(true);
    window.setTimeout(() => {
      const passengers: Passenger[] = seats.map((seat) => ({
        seat,
        name: (forms[seat] ?? emptyForm).name.trim(),
        age: (forms[seat] ?? emptyForm).age,
        gender: (forms[seat] ?? emptyForm).gender,
      }));
      onComplete({
        ref: makeReference(),
        trip,
        passengers,
        seats,
        boarding,
        contact: {
          name: contact.name.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
        },
        extras,
        promo,
        total: breakdown.total,
        createdAt: new Date().toISOString(),
      });
    }, 1500);
  };

  const primaryLabel =
    step === 0
      ? seats.length === 0
        ? "Select a seat"
        : `Continue with ${seats.length} ${seats.length === 1 ? "seat" : "seats"}`
      : step === 1
        ? "Continue to payment"
        : `Pay $${breakdown.total} securely`;

  const primaryAction = () => {
    if (step === 0) goPassengers();
    else if (step === 1) goPayment();
    else pay();
  };

  return (
    <div className="pb-28 lg:pb-16">
      {/* header */}
      <div className="border-b border-forest/10 bg-paper">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-3 py-1.5 text-[10.5px] font-semibold text-forest transition-colors hover:bg-forest hover:text-sand"
            >
              <ArrowLeft className="size-3.5" />
              Back to departures
            </button>
            <p className="flex items-center gap-1.5 text-[9.5px] font-medium text-muted">
              <Lock className="size-3" />
              Secure checkout · held for 15 minutes
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-clay">
                {op.name} · {trip.busType}
              </p>
              <h1 className="mt-1.5 font-display text-[clamp(1.7rem,3.8vw,2.6rem)] font-semibold leading-none tracking-[-0.04em] text-forest">
                {cityMap[trip.from].name}
                <span className="mx-2 inline-block align-middle text-[0.55em] text-gold">→</span>
                {cityMap[trip.to].name}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3" />
                  {formatDate(trip.date, "long")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3" />
                  {formatClock(trip.departISO)} – {formatClock(trip.arriveISO)}
                  {delta > 0 ? ` (+${delta} day)` : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3" />
                  {formatDuration(trip.durationMins)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3" />
                  {seats.length || search.passengers}{" "}
                  {(seats.length || search.passengers) === 1 ? "traveller" : "travellers"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors",
                      i === step
                        ? "bg-forest text-sand"
                        : i < step
                          ? "bg-moss text-forest"
                          : "border border-forest/12 text-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-full text-[9px] font-extrabold",
                        i === step
                          ? "bg-gold text-forest"
                          : i < step
                            ? "bg-forest text-sand"
                            : "bg-sand-deep text-muted",
                      )}
                    >
                      {i < step ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="text-[10px] font-bold">{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <span className={cn("h-px w-3 sm:w-5", i < step ? "bg-forest/30" : "bg-forest/12")} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 pt-6 sm:px-8 lg:px-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_370px]">
          {/* main column */}
          <div className="min-w-0">
            {step === 0 && (
              <div className="animate-rise">
                <SeatMap
                  trip={trip}
                  maxSeats={MAX_SEATS}
                  selected={seats}
                  onChange={updateSeats}
                />

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Ticket, title: "Instant e-ticket", copy: "QR ticket in your inbox the moment you pay." },
                    { icon: ShieldCheck, title: "Flexible by default", copy: "Cancel free up to 24h before departure." },
                    { icon: Bus, title: "Guaranteed coach", copy: "If we cancel, you're rebooked or refunded." },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-2.5 rounded-xl border border-forest/10 bg-paper p-3"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-moss text-forest">
                        <item.icon className="size-3.5" />
                      </span>
                      <div>
                        <p className="text-[10.5px] font-bold text-forest">{item.title}</p>
                        <p className="mt-0.5 text-[9px] leading-snug text-muted">{item.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.seats && (
                  <p role="alert" className="mt-4 rounded-xl bg-clay/10 px-3 py-2 text-[10.5px] font-semibold text-clay">
                    {errors.seats}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-forest/10 bg-paper px-4 py-3">
                  <p className="flex items-center gap-2 text-[10px] text-muted">
                    <Info className="size-3.5 shrink-0" />
                    Extra-legroom rows 1–2 cost $7 more. Prices update live.
                  </p>
                  <button
                    onClick={goPassengers}
                    className="group hidden items-center gap-2 rounded-full bg-forest py-1.5 pl-4 pr-1.5 text-[11px] font-semibold text-sand transition-colors hover:bg-forest-soft sm:inline-flex"
                  >
                    Continue
                    <span className="grid size-7 place-items-center rounded-full bg-gold text-forest transition-transform group-hover:rotate-45">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="animate-rise space-y-4">
                <div className="rounded-[20px] border border-forest/12 bg-paper p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
                        <User className="size-3.5" />
                        Who's travelling?
                      </p>
                      <p className="mt-1 text-[9.5px] text-muted">
                        Names must match the photo ID shown at boarding.
                      </p>
                    </div>
                    <span className="rounded-full bg-moss px-2.5 py-1 text-[9px] font-bold text-forest">
                      {seats.length} {seats.length === 1 ? "seat" : "seats"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {seats.map((seat, index) => {
                      const form = forms[seat] ?? emptyForm;
                      return (
                        <div key={seat} className="rounded-xl border border-forest/10 bg-sand/60 p-3.5">
                          <div className="flex items-center justify-between">
                            <p className="flex items-center gap-2 text-[10.5px] font-bold text-forest">
                              <span className="grid size-6 place-items-center rounded-md bg-forest text-[8.5px] text-sand">
                                {seat}
                              </span>
                              Passenger {index + 1}
                              {index === 0 && (
                                <span className="rounded-full bg-gold-soft px-1.5 py-0.5 text-[7.5px] uppercase tracking-wide text-forest">
                                  Lead
                                </span>
                              )}
                            </p>
                            <span className="text-[9px] font-semibold text-muted">${seatPrice(trip, seat)}</span>
                          </div>
                          <div className="mt-3 grid gap-2.5 sm:grid-cols-[1.6fr_0.6fr_0.8fr]">
                            <div>
                              <label htmlFor={`name-${seat}`} className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                                Full name *
                              </label>
                              <input
                                id={`name-${seat}`}
                                value={form.name}
                                onChange={(e) => setField(seat, "name", e.target.value)}
                                placeholder="As on your ID"
                                aria-invalid={Boolean(errors[`name-${seat}`])}
                                className={cn(inputBase, errors[`name-${seat}`] ? "border-clay" : "border-forest/15")}
                              />
                              {errors[`name-${seat}`] && (
                                <p className="mt-1 text-[9px] text-clay">{errors[`name-${seat}`]}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor={`age-${seat}`} className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                                Age
                              </label>
                              <input
                                id={`age-${seat}`}
                                inputMode="numeric"
                                value={form.age}
                                onChange={(e) => setField(seat, "age", e.target.value.replace(/\D/g, "").slice(0, 3))}
                                placeholder="32"
                                className={cn(inputBase, errors[`age-${seat}`] ? "border-clay" : "border-forest/15")}
                              />
                              {errors[`age-${seat}`] && (
                                <p className="mt-1 text-[9px] text-clay">{errors[`age-${seat}`]}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor={`gender-${seat}`} className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                                Gender
                              </label>
                              <div className="relative">
                                <select
                                  id={`gender-${seat}`}
                                  value={form.gender}
                                  onChange={(e) => setField(seat, "gender", e.target.value)}
                                  className={cn(inputBase, "appearance-none border-forest/15 pr-7")}
                                >
                                  <option value="">Select</option>
                                  <option value="female">Female</option>
                                  <option value="male">Male</option>
                                  <option value="other">Other</option>
                                  <option value="private">Prefer not to say</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[20px] border border-forest/12 bg-paper p-4 sm:p-5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
                    <MapPin className="size-3.5" />
                    Boarding point
                  </p>
                  <p className="mt-1 text-[9.5px] text-muted">
                    The coach departs at {formatClock(trip.departISO)} — be there 10 minutes early.
                  </p>
                  <div className="relative mt-3">
                    <select
                      aria-label="Boarding point"
                      value={boarding}
                      onChange={(e) => setBoarding(e.target.value)}
                      className={cn(inputBase, "appearance-none border-forest/15 pr-8 font-semibold")}
                    >
                      {boardingPoints[trip.from].map((point) => (
                        <option key={point} value={point}>
                          {point}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
                  </div>

                  <div className="mt-4 grid gap-2.5 border-t border-forest/10 pt-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                        Contact name *
                      </label>
                      <input
                        id="contact-name"
                        value={contact.name}
                        onChange={(e) => {
                          setContact({ ...contact, name: e.target.value });
                          setErrors({ ...errors, contactName: "" });
                        }}
                        placeholder="Who should we address?"
                        aria-invalid={Boolean(errors.contactName)}
                        className={cn(inputBase, errors.contactName ? "border-clay" : "border-forest/15")}
                      />
                      {errors.contactName && <p className="mt-1 text-[9px] text-clay">{errors.contactName}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                        Email for ticket *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={contact.email}
                        onChange={(e) => {
                          setContact({ ...contact, email: e.target.value });
                          setErrors({ ...errors, email: "" });
                        }}
                        placeholder="you@example.com"
                        aria-invalid={Boolean(errors.email)}
                        className={cn(inputBase, errors.email ? "border-clay" : "border-forest/15")}
                      />
                      {errors.email && <p className="mt-1 text-[9px] text-clay">{errors.email}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="contact-phone" className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                        Mobile number *
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => {
                          setContact({ ...contact, phone: e.target.value });
                          setErrors({ ...errors, phone: "" });
                        }}
                        placeholder="+1 415 555 0123"
                        aria-invalid={Boolean(errors.phone)}
                        className={cn(inputBase, errors.phone ? "border-clay" : "border-forest/15")}
                      />
                      {errors.phone && <p className="mt-1 text-[9px] text-clay">{errors.phone}</p>}
                      <p className="mt-1.5 text-[9px] text-muted">
                        We'll text live boarding updates. No marketing, ever.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setStep(0);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-4 py-2.5 text-[11px] font-semibold text-forest hover:border-forest/40"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back to seats
                  </button>
                  <button
                    onClick={goPayment}
                    className="group inline-flex items-center gap-2 rounded-full bg-forest py-1.5 pl-4 pr-1.5 text-[11px] font-semibold text-sand hover:bg-forest-soft"
                  >
                    Continue to payment
                    <span className="grid size-7 place-items-center rounded-full bg-gold text-forest transition-transform group-hover:rotate-45">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-rise space-y-4">
                <div className="rounded-[20px] border border-forest/12 bg-paper p-4 sm:p-5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
                    <Sparkles className="size-3.5" />
                    Make it flexible
                  </p>
                  <p className="mt-1 text-[9.5px] text-muted">
                    Optional add-ons, priced per booking or per seat.
                  </p>
                  <div className="mt-3 space-y-2">
                    {extraOptions.map((extra) => {
                      const active = extras.includes(extra.id);
                      const price = extra.perSeat ? extra.price * seats.length : extra.price;
                      return (
                        <button
                          key={extra.id}
                          type="button"
                          onClick={() =>
                            setExtras((prev) =>
                              prev.includes(extra.id)
                                ? prev.filter((e) => e !== extra.id)
                                : [...prev, extra.id],
                            )
                          }
                          aria-pressed={active}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                            active
                              ? "border-forest bg-moss/30"
                              : "border-forest/12 bg-sand/40 hover:border-forest/30",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-4 shrink-0 place-items-center rounded-[4px] border",
                              active ? "border-forest bg-forest text-sand" : "border-forest/25",
                            )}
                          >
                            {active && <Check className="size-3" strokeWidth={3} />}
                          </span>
                          <span className="flex-1">
                            <span className="block text-[11px] font-bold text-forest">{extra.title}</span>
                            <span className="block text-[9px] leading-snug text-muted">{extra.note}</span>
                          </span>
                          <span className="shrink-0 text-[10.5px] font-bold text-forest">
                            +${price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[20px] border border-forest/12 bg-paper p-4 sm:p-5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
                    <Tag className="size-3.5" />
                    Promo code
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <input
                      aria-label="Promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Try WANDER10"
                      className={cn(inputBase, "flex-1 border-forest/15 font-mono uppercase tracking-wide")}
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      className="rounded-xl bg-forest px-4 text-[11px] font-semibold text-sand transition-colors hover:bg-forest-soft"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p
                      className={cn(
                        "mt-2 flex items-center gap-1.5 text-[9.5px] font-semibold",
                        promoMessage.type === "ok" ? "text-[#3d7d55]" : "text-clay",
                      )}
                    >
                      {promoMessage.type === "ok" ? <Check className="size-3" /> : <Info className="size-3" />}
                      {promoMessage.text}
                    </p>
                  )}
                  {promo && (
                    <button
                      type="button"
                      onClick={() => {
                        setPromo(null);
                        setPromoInput("");
                        setPromoMessage(null);
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-full bg-moss px-2.5 py-1 text-[9px] font-bold text-forest"
                    >
                      {promo}
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <div className="rounded-[20px] border border-forest/12 bg-paper p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
                      <CreditCard className="size-3.5" />
                      Payment
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-moss px-2 py-1 text-[8.5px] font-bold text-forest">
                      <Lock className="size-2.5" />
                      Encrypted
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { id: "card" as const, label: "Card", icon: CreditCard },
                      { id: "wallet" as const, label: "Wallet", icon: Wallet },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setMethod(option.id)}
                        aria-pressed={method === option.id}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-semibold transition-colors",
                          method === option.id
                            ? "border-forest bg-forest text-sand"
                            : "border-forest/15 text-forest hover:border-forest/35",
                        )}
                      >
                        <option.icon className="size-4" />
                        {option.label}
                        {method === option.id && <Check className="ml-auto size-3.5" />}
                      </button>
                    ))}
                  </div>

                  {method === "card" ? (
                    <div className="mt-3 space-y-2.5">
                      <div>
                        <label htmlFor="card-name" className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                          Name on card *
                        </label>
                        <input
                          id="card-name"
                          value={card.name}
                          onChange={(e) => {
                            setCard({ ...card, name: e.target.value });
                            setErrors({ ...errors, cardName: "" });
                          }}
                          autoComplete="cc-name"
                          placeholder="JAMIE RIVERA"
                          aria-invalid={Boolean(errors.cardName)}
                          className={cn(inputBase, errors.cardName ? "border-clay" : "border-forest/15")}
                        />
                        {errors.cardName && <p className="mt-1 text-[9px] text-clay">{errors.cardName}</p>}
                      </div>
                      <div>
                        <label htmlFor="card-number" className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                          Card number *
                        </label>
                        <input
                          id="card-number"
                          value={card.number}
                          onChange={(e) => {
                            setCard({ ...card, number: formatCard(e.target.value) });
                            setErrors({ ...errors, cardNumber: "" });
                          }}
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="4242 4242 4242 4242"
                          aria-invalid={Boolean(errors.cardNumber)}
                          className={cn(inputBase, "font-mono tracking-wider", errors.cardNumber ? "border-clay" : "border-forest/15")}
                        />
                        {errors.cardNumber && <p className="mt-1 text-[9px] text-clay">{errors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label htmlFor="card-expiry" className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                            Expiry *
                          </label>
                          <input
                            id="card-expiry"
                            value={card.expiry}
                            onChange={(e) => {
                              setCard({ ...card, expiry: formatExpiry(e.target.value) });
                              setErrors({ ...errors, expiry: "" });
                            }}
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            placeholder="MM/YY"
                            aria-invalid={Boolean(errors.expiry)}
                            className={cn(inputBase, "font-mono", errors.expiry ? "border-clay" : "border-forest/15")}
                          />
                          {errors.expiry && <p className="mt-1 text-[9px] text-clay">{errors.expiry}</p>}
                        </div>
                        <div>
                          <label htmlFor="card-cvc" className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                            CVC *
                          </label>
                          <input
                            id="card-cvc"
                            value={card.cvc}
                            onChange={(e) => {
                              setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) });
                              setErrors({ ...errors, cvc: "" });
                            }}
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            placeholder="123"
                            aria-invalid={Boolean(errors.cvc)}
                            className={cn(inputBase, "font-mono", errors.cvc ? "border-clay" : "border-forest/15")}
                          />
                          {errors.cvc && <p className="mt-1 text-[9px] text-clay">{errors.cvc}</p>}
                        </div>
                      </div>
                      <p className="flex items-start gap-1.5 rounded-lg bg-sand/70 px-2.5 py-2 text-[8.5px] leading-relaxed text-muted">
                        <Info className="mt-0.5 size-3 shrink-0" />
                        Demo checkout — no payment is taken. Use any 16-digit number,
                        e.g. 4242 4242 4242 4242.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-forest/12 bg-sand/60 p-3.5">
                      <p className="flex items-center gap-2 text-[10.5px] font-bold text-forest">
                        <Wallet className="size-4" />
                        Wayfare wallet balance
                      </p>
                      <p className="mt-1 text-[9px] leading-relaxed text-muted">
                        You have $150.00 available. The fare will be deducted
                        instantly and a receipt emailed to {contact.email || "your inbox"}.
                      </p>
                      <p className="mt-2 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                        Demo wallet · no real charge
                      </p>
                    </div>
                  )}

                  <label className="mt-3 flex cursor-pointer items-start gap-2 text-[9px] leading-relaxed text-muted">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => {
                        setTerms(e.target.checked);
                        setErrors({ ...errors, terms: "" });
                      }}
                      className="mt-0.5 size-3.5 shrink-0 accent-forest"
                    />
                    <span>
                      I agree to the conditions of carriage and the cancellation
                      policy, and confirm all passenger names are correct.
                    </span>
                  </label>
                  {errors.terms && <p className="mt-1 text-[9px] font-semibold text-clay">{errors.terms}</p>}

                  <button
                    type="button"
                    onClick={pay}
                    disabled={processing}
                    className="btn-shine group mt-3 hidden w-full items-center justify-between rounded-full bg-forest py-2 pl-5 pr-2 text-[12px] font-semibold text-sand transition-colors hover:bg-forest-soft disabled:cursor-wait disabled:opacity-80 sm:flex"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="size-3.5" />
                      {processing ? "Confirming your seats…" : `Pay $${breakdown.total} · ${method === "card" ? "Card" : "Wallet"}`}
                    </span>
                    <span className="grid size-8 place-items-center rounded-full bg-gold text-forest">
                      {processing ? (
                        <span className="size-3.5 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
                      ) : (
                        <ArrowRight className="size-3.5" />
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-forest/65 hover:text-forest"
                  >
                    <ArrowLeft className="size-3" />
                    Back to passenger details
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[20px] border border-forest/12 bg-paper">
              <div className="relative bg-forest px-4 py-4 text-sand">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/10 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.1em]">
                    <Bus className="size-3" />
                    {op.name}
                  </span>
                  <span className="text-[9px] font-semibold text-sand/60">{trip.busType}</span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="font-display text-[24px] font-semibold leading-none">
                      {formatClock(trip.departISO)}
                    </p>
                    <p className="mt-1 text-[9.5px] font-semibold text-sand/60">
                      {cityMap[trip.from].name}
                    </p>
                  </div>
                  <div className="flex flex-1 items-center justify-center pb-1">
                    <span className="h-px flex-1 border-t border-dashed border-sand/30" />
                    <Bus className="mx-1 size-3 text-gold" />
                    <span className="h-px flex-1 border-t border-dashed border-sand/30" />
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[24px] font-semibold leading-none">
                      {formatClock(trip.arriveISO)}
                    </p>
                    <p className="mt-1 text-[9.5px] font-semibold text-sand/60">
                      {cityMap[trip.to].name}
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 text-[8.5px] text-sand/55">
                  <CalendarDays className="size-2.5" />
                  {formatDate(trip.date, "long")} · {formatDuration(trip.durationMins)}
                  {delta > 0 ? ` · arrives +${delta} day` : ""}
                </p>
              </div>

              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted">
                    Your seats
                  </p>
                  <button
                    onClick={() => setStep(0)}
                    className="text-[9px] font-bold text-forest hover:underline"
                  >
                    {seats.length > 0 ? "Edit" : "Choose"}
                  </button>
                </div>
                {seats.length === 0 ? (
                  <p className="mt-2 text-[10px] text-muted">No seats chosen yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {seats.map((seat) => (
                      <li key={seat} className="flex items-center justify-between gap-2 text-[10.5px]">
                        <span className="flex items-center gap-1.5 font-semibold text-forest">
                          <span className="grid size-5 place-items-center rounded bg-moss text-[8px] text-forest">
                            {seat}
                          </span>
                          {forms[seat]?.name?.trim() || `Seat ${seat}`}
                        </span>
                        <span className="font-semibold text-forest/70">${seatPrice(trip, seat)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 space-y-1.5 border-t border-forest/10 pt-3 text-[10.5px]">
                  <div className="flex justify-between text-muted">
                    <span>Seats subtotal</span>
                    <span>${breakdown.seatTotal}</span>
                  </div>
                  {breakdown.extrasTotal > 0 && (
                    <div className="flex justify-between text-muted">
                      <span>Extras</span>
                      <span>${breakdown.extrasTotal}</span>
                    </div>
                  )}
                  {breakdown.discount > 0 && (
                    <div className="flex justify-between font-semibold text-[#3d7d55]">
                      <span>Promo {promo}</span>
                      <span>−${breakdown.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted">
                    <span>Taxes & fees</span>
                    <span>${breakdown.taxes + breakdown.fees}</span>
                  </div>
                  <div className="mt-1 flex items-end justify-between border-t border-dashed border-forest/20 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-forest">
                      Total
                    </span>
                    <span className="font-display text-[24px] font-semibold leading-none text-forest">
                      ${breakdown.total}
                    </span>
                  </div>
                  <p className="text-right text-[8.5px] text-muted">
                    {seats.length || 1} {seats.length === 1 || seats.length === 0 ? "traveller" : "travellers"} · one way
                  </p>
                </div>

                <button
                  onClick={primaryAction}
                  disabled={processing || seats.length === 0}
                  className="group mt-3 hidden w-full items-center justify-between rounded-full bg-forest py-2 pl-4 pr-2 text-[11.5px] font-semibold text-sand transition-colors hover:bg-forest-soft disabled:cursor-not-allowed disabled:bg-forest/25 md:flex"
                >
                  {processing ? "Processing…" : primaryLabel}
                  <span className="grid size-7 place-items-center rounded-full bg-gold text-forest">
                    <ArrowRight className="size-3.5" />
                  </span>
                </button>

                <div className="mt-3 space-y-1.5 border-t border-forest/10 pt-3">
                  {[
                    "Free cancellation up to 24h",
                    "One 23kg bag included",
                    "E-ticket delivered instantly",
                  ].map((note) => (
                    <p key={note} className="flex items-center gap-1.5 text-[8.5px] text-muted">
                      <ShieldCheck className="size-3 shrink-0 text-[#3d7d55]" />
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 hidden items-center justify-center gap-1.5 text-[8.5px] text-muted lg:flex">
              <Lock className="size-2.5" />
              Secure demo checkout · no real payment
            </div>
          </aside>
        </div>
      </div>

      {/* mobile sticky action */}
      <div className="fixed inset-x-3 bottom-3 z-30 flex items-center gap-2 rounded-full border border-sand/20 bg-forest/95 p-1.5 pl-4 shadow-[0_18px_40px_-12px_rgba(15,51,42,0.7)] backdrop-blur md:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-sand/50">
            {seats.length ? `${seats.length} seat${seats.length > 1 ? "s" : ""} · total` : "Total"}
          </p>
          <p className="truncate font-display text-[17px] font-semibold leading-none text-sand">
            ${breakdown.total}
          </p>
        </div>
        <button
          onClick={primaryAction}
          disabled={processing || seats.length === 0}
          className="flex shrink-0 items-center gap-2 rounded-full bg-gold py-2 pl-4 pr-2 text-[11px] font-bold text-forest disabled:opacity-60"
        >
          {processing ? "Processing…" : step === 2 ? "Pay" : step === 1 ? "Payment" : "Continue"}
          <span className="grid size-7 place-items-center rounded-full bg-forest text-sand">
            {processing ? (
              <span className="size-3 animate-spin rounded-full border-2 border-sand/30 border-t-sand" />
            ) : (
              <ArrowUpRight className="size-3.5" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
