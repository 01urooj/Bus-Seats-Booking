/**
 * Images are discovered at build time. If a local asset is unavailable for any
 * reason we fall back to a hosted photo, so the app always builds and renders.
 */
const localAssets = import.meta.glob("./assets/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const asset = (name: string, fallback: string) =>
  localAssets[`./assets/${name}.jpg`] ?? fallback;

const px = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export type CityCode = "SFO" | "LAX" | "SAN" | "SBA" | "SEA" | "PDX" | "LAS";

export const imagery = {
  hero: asset("hero-coach", px(31310052, 1200, 800)),
  interior: asset("interior", px(20849154, 1100, 800)),
  cities: {
    SFO: asset("city-sf", px(29536601, 700, 520)),
    LAX: asset("city-la", px(2816168, 700, 520)),
    SAN: asset("city-sd", px(2984224, 700, 520)),
    SBA: asset("city-sb", px(2017109, 700, 520)),
    SEA: asset("city-seattle", px(28933961, 700, 520)),
    PDX: asset("city-portland", px(18173818, 700, 520)),
    LAS: asset("city-vegas", px(36790388, 700, 520)),
  } as Record<CityCode, string>,
};

export type City = {
  code: CityCode;
  name: string;
  short: string;
  state: string;
  tagline: string;
};

export const cities: City[] = [
  {
    code: "SFO",
    name: "San Francisco",
    short: "San Francisco",
    state: "CA",
    tagline: "Fog, bridges and sourdough",
  },
  {
    code: "LAX",
    name: "Los Angeles",
    short: "Los Angeles",
    state: "CA",
    tagline: "Palm trees and late sunsets",
  },
  {
    code: "SAN",
    name: "San Diego",
    short: "San Diego",
    state: "CA",
    tagline: "72 miles of coastline",
  },
  {
    code: "SBA",
    name: "Santa Barbara",
    short: "Santa Barbara",
    state: "CA",
    tagline: "Red tiles, Pacific air",
  },
  {
    code: "SEA",
    name: "Seattle",
    short: "Seattle",
    state: "WA",
    tagline: "Coffee, water, mountains",
  },
  {
    code: "PDX",
    name: "Portland",
    short: "Portland",
    state: "OR",
    tagline: "Rivers, bridges and rose gardens",
  },
  {
    code: "LAS",
    name: "Las Vegas",
    short: "Las Vegas",
    state: "NV",
    tagline: "Neon nights, desert mornings",
  },
];

export const cityMap = Object.fromEntries(
  cities.map((c) => [c.code, c]),
) as Record<CityCode, City>;

export type Search = {
  from: CityCode;
  to: CityCode;
  date: string;
  passengers: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function isoDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const defaultSearch: Search = {
  from: "SFO",
  to: "LAX",
  date: isoDate(1),
  passengers: 2,
};

export function parseDate(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

export function formatDate(iso: string, style: "short" | "long" | "chip" = "short") {
  const d = parseDate(iso);
  if (style === "long") {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
  if (style === "chip") {
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function relativeDay(iso: string) {
  if (iso === isoDate(0)) return "Today";
  if (iso === isoDate(1)) return "Tomorrow";
  return formatDate(iso, "chip");
}

const MILES: Record<string, number> = {
  "SFO-LAX": 382,
  "SFO-SAN": 502,
  "SFO-SBA": 293,
  "SFO-SEA": 808,
  "SFO-PDX": 635,
  "SFO-LAS": 570,
  "LAX-SAN": 120,
  "LAX-SBA": 95,
  "LAX-SEA": 1135,
  "LAX-PDX": 960,
  "LAX-LAS": 270,
  "SAN-SBA": 215,
  "SAN-SEA": 1255,
  "SAN-PDX": 1080,
  "SAN-LAS": 330,
  "SBA-SEA": 1050,
  "SBA-PDX": 875,
  "SBA-LAS": 330,
  "SEA-PDX": 175,
  "SEA-LAS": 1110,
  "PDX-LAS": 940,
};

export function milesBetween(a: CityCode, b: CityCode) {
  return MILES[`${a}-${b}`] ?? MILES[`${b}-${a}`] ?? 400;
}

export function routeStats(a: CityCode, b: CityCode) {
  const miles = milesBetween(a, b);
  const stops = Math.max(0, Math.round(miles / 220) - 1);
  const minutes = Math.round(((miles / 55) * 60) / 5) * 5 + 25 + stops * 12;
  const base = Math.max(16, Math.round(miles * 0.075 + 9));
  return { miles, stops, minutes, base };
}

export function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dayDelta(departISO: string, arriveISO: string) {
  const a = new Date(departISO);
  const b = new Date(arriveISO);
  const dayA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const dayB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((dayB - dayA) / 86400000);
}

export function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type OperatorId =
  | "wayfare"
  | "coastal"
  | "sierra"
  | "metrolux"
  | "nightowl";

export type Operator = {
  id: OperatorId;
  name: string;
  initials: string;
  rating: number;
  reviews: number;
  tag: string;
  note: string;
};

export const operators: Operator[] = [
  {
    id: "wayfare",
    name: "Wayfare Coach",
    initials: "WF",
    rating: 4.9,
    reviews: 2148,
    tag: "Flagship",
    note: "Our own fleet · most legroom",
  },
  {
    id: "coastal",
    name: "Coastal Liner",
    initials: "CL",
    rating: 4.7,
    reviews: 1186,
    tag: "Coastal",
    note: "Ocean-view routes",
  },
  {
    id: "sierra",
    name: "Sierra Express",
    initials: "SE",
    rating: 4.5,
    reviews: 942,
    tag: "Best value",
    note: "Simple, reliable seats",
  },
  {
    id: "metrolux",
    name: "MetroLux",
    initials: "ML",
    rating: 4.8,
    reviews: 1563,
    tag: "Business",
    note: "1 + 2 seating",
  },
  {
    id: "nightowl",
    name: "Night Owl",
    initials: "NO",
    rating: 4.6,
    reviews: 728,
    tag: "Overnight",
    note: "Reclining sleeper berths",
  },
];

export const operatorMap = Object.fromEntries(
  operators.map((o) => [o.id, o]),
) as Record<OperatorId, Operator>;

export type AmenityKey =
  | "wifi"
  | "usb"
  | "water"
  | "recliner"
  | "washroom"
  | "entertainment"
  | "blanket"
  | "snack";

export const amenityLabels: Record<AmenityKey, string> = {
  wifi: "Free Wi-Fi",
  usb: "USB-C & power",
  water: "Bottled water",
  recliner: "Reclining seat",
  washroom: "Onboard washroom",
  entertainment: "Personal screen",
  blanket: "Blanket & pillow",
  snack: "Complimentary snack",
};

export type Layout = "2x2" | "1x2" | "2x1";

export type BusType = "Luxury Coach" | "Business Class" | "Sleeper";

export type Trip = {
  id: string;
  operatorId: OperatorId;
  from: CityCode;
  to: CityCode;
  date: string;
  departISO: string;
  arriveISO: string;
  durationMins: number;
  price: number;
  seatsLeft: number;
  busType: BusType;
  layout: Layout;
  amenities: AmenityKey[];
  stops: number;
  load: number;
};

const busFor = (index: number, durationMins: number): BusType => {
  if (durationMins >= 500) return index % 2 === 0 ? "Sleeper" : "Luxury Coach";
  if (durationMins >= 260) return index % 3 === 1 ? "Business Class" : "Luxury Coach";
  return index % 2 === 0 ? "Luxury Coach" : "Business Class";
};

const layoutFor = (bus: BusType): Layout =>
  bus === "Sleeper" ? "2x1" : bus === "Business Class" ? "1x2" : "2x2";

const amenitiesFor = (bus: BusType, op: OperatorId): AmenityKey[] => {
  const base: AmenityKey[] = ["wifi", "usb", "water"];
  if (bus === "Luxury Coach") return [...base, "recliner", "washroom", op === "wayfare" ? "entertainment" : "snack"];
  if (bus === "Business Class") return [...base, "recliner", "snack", "entertainment"];
  return [...base, "blanket", "washroom", "recliner"];
};

export const seatLayouts: Record<Layout, { rows: number; premiumRows: number }> = {
  "2x2": { rows: 10, premiumRows: 2 },
  "1x2": { rows: 9, premiumRows: 2 },
  "2x1": { rows: 9, premiumRows: 2 },
};

export function seatMatrix(layout: Layout): (string | null)[][] {
  const { rows } = seatLayouts[layout];
  const letters =
    layout === "2x2"
      ? [["A", "B"], [null], ["C", "D"]]
      : layout === "1x2"
        ? [["A"], [null], ["B", "C"]]
        : [["A", "B"], [null], ["C"]];
  return Array.from({ length: rows }, (_, r) =>
    letters.flatMap((block) =>
      block.map((letter) => (letter === null ? null : `${r + 1}${letter}`)),
    ),
  );
}

export function allSeatCodes(layout: Layout) {
  return seatMatrix(layout).flat().filter((s): s is string => Boolean(s));
}

export function isPremiumSeat(code: string) {
  const row = Number(code.replace(/\D/g, ""));
  return row <= 2;
}

export function seatPrice(trip: Trip, code: string) {
  return trip.price + (isPremiumSeat(code) ? 7 : 0);
}

export function occupiedFor(id: string, layout: Layout, load: number) {
  const random = mulberry32(hashString(id));
  const occupied = new Set<string>();
  allSeatCodes(layout).forEach((code) => {
    if (random() < load) occupied.add(code);
  });
  return occupied;
}

const times = [
  { t: "06:15", mult: 0.9 },
  { t: "08:40", mult: 1 },
  { t: "11:05", mult: 1.04 },
  { t: "13:30", mult: 0.97 },
  { t: "16:20", mult: 1.08 },
  { t: "19:10", mult: 1.02 },
  { t: "22:40", mult: 0.94 },
];

export function buildTrips(search: Search): Trip[] {
  const { from, to, date } = search;
  const stats = routeStats(from, to);
  const seed = hashString(`${from}${to}${date}`);
  const weekday = parseDate(date).getDay();
  const weekend = weekday === 5 || weekday === 0 ? 1.08 : 1;

  return times.map((slot, i) => {
    const op = operators[(seed + i * 3) % operators.length];
    const depart = new Date(`${date}T${slot.t}:00`);
    const variance = ((seed >> (i + 2)) % 3) * 5;
    const durationMins = stats.minutes + (i % 3 === 0 ? 0 : variance);
    const arrive = new Date(depart.getTime() + durationMins * 60000);
    const busType = busFor(i, durationMins);
    const layout = layoutFor(busType);
    const price = Math.round(stats.base * slot.mult * weekend);
    const id = `${from}-${to}-${date}-${i}`;
    const load = 0.24 + ((hashString(id) % 27) / 100);
    const occupied = occupiedFor(id, layout, load);
    const seatsLeft = allSeatCodes(layout).length - occupied.size;

    return {
      id,
      operatorId: op.id,
      from,
      to,
      date,
      departISO: depart.toISOString(),
      arriveISO: arrive.toISOString(),
      durationMins,
      price,
      seatsLeft,
      busType,
      layout,
      amenities: amenitiesFor(busType, op.id),
      stops: stats.stops,
      load,
    };
  });
}

export const popularRoutes: {
  from: CityCode;
  to: CityCode;
  tag: string;
  tone: "gold" | "moss" | "paper";
}[] = [
  { from: "SFO", to: "LAX", tag: "Most booked", tone: "gold" },
  { from: "LAX", to: "LAS", tag: "Weekend escape", tone: "paper" },
  { from: "LAX", to: "SAN", tag: "Quick coastal hop", tone: "moss" },
  { from: "SEA", to: "PDX", tag: "City to city", tone: "paper" },
  { from: "SFO", to: "SBA", tag: "Scenic run", tone: "moss" },
  { from: "SFO", to: "SEA", tag: "Overnight sleeper", tone: "gold" },
];

export const boardingPoints: Record<CityCode, string[]> = {
  SFO: ["5th & Mission — Downtown", "SFO Airport — Terminal 2 curb", "Oakland — 12th St Station"],
  LAX: ["Union Station — Patsaouras Plaza", "Santa Monica — 4th & Colorado", "LAX Airport — Terminal 1"],
  SAN: ["Santa Fe Depot — Downtown", "Old Town Transit Center", "La Jolla — UTC Westfield"],
  SBA: ["Santa Barbara Amtrak Station", "State Street — 800 block", "Goleta — Hollister Ave"],
  SEA: ["King Street Station — South Entrance", "Capitol Hill — Broadway & Pike", "SEA Airport — Thruway stop"],
  PDX: ["Union Station — NW 6th", "Pioneer Courthouse Square", "PDX Airport — Departures"],
  LAS: ["Resorts World — Level 1", "The STRAT — Main Entrance", "McCarran — Terminal 3"],
};

export const extraOptions = [
  {
    id: "flex",
    title: "Flexi fare",
    note: "Change or cancel free up to 2 hours before departure.",
    price: 6,
    perSeat: true,
  },
  {
    id: "bag",
    title: "Extra checked bag",
    note: "One additional 23kg bag in the hold.",
    price: 9,
    perSeat: false,
  },
  {
    id: "insure",
    title: "Journey protection",
    note: "Full refund if you can't travel, for any reason.",
    price: 4,
    perSeat: true,
  },
] as const;

export type Promo = {
  code: string;
  type: "percent" | "flat";
  value: number;
  label: string;
};

export const promos: Promo[] = [
  { code: "WANDER10", type: "percent", value: 10, label: "10% off your journey" },
  { code: "FIRSTRIDE", type: "flat", value: 8, label: "$8 off — first ride" },
  { code: "COASTAL", type: "percent", value: 15, label: "15% off coastal routes" },
];

export const reviews = [
  {
    quote:
      "Booked the overnight to Seattle at 11pm and was asleep by midnight. The seat map made it easy to grab a solo window — exactly what a tall person needs.",
    name: "Maya Ellison",
    initials: "ME",
    route: "San Francisco → Seattle",
    date: "2 weeks ago",
    rating: 5,
  },
  {
    quote:
      "The boarding reminder included a real-time delay update before the driver even knew. Turned a tight connection into a calm one.",
    name: "Daniel Okafor",
    initials: "DO",
    route: "Los Angeles → Las Vegas",
    date: "1 month ago",
    rating: 5,
  },
  {
    quote:
      "Three of us, three seats together chosen in about ten seconds. Fare breakdown with no surprise fees at checkout — rare and appreciated.",
    name: "Priya Raman",
    initials: "PR",
    route: "San Diego → Santa Barbara",
    date: "3 weeks ago",
    rating: 5,
  },
];

export const faqs = [
  {
    q: "How does seat selection work?",
    a: "After you choose a departure, you'll see the exact live seat map for that coach. Tap any free seat to select it — window, aisle and extra-legroom seats are labelled clearly. You can pick up to four seats per booking, and we hold them while you complete checkout.",
  },
  {
    q: "Can I change or cancel my ticket?",
    a: "Every ticket can be cancelled for a 75% refund up to 24 hours before departure. Add the Flexi fare at checkout and you can change the date or cancel free of charge up to 2 hours before you travel, with the full amount returned to your original payment method.",
  },
  {
    q: "How much luggage can I bring?",
    a: "Each passenger gets one carry-on (up to 7kg) and one checked bag (up to 23kg) free. Extra bags can be added during checkout for $9, or brought to the door for $14 if space allows. Bicycles and surfboards travel for $12 when booked ahead.",
  },
  {
    q: "Do I need to print my ticket?",
    a: "No — a digital ticket on your phone is all you need. The boarding crew scans the QR code at the door. If you prefer paper, use the print option on your ticket and show it at the station.",
  },
  {
    q: "Where does the bus pick up?",
    a: "Each city page lists real stops with walking notes and a live map pin. Choose your preferred boarding point at checkout and arrive at least 10 minutes before departure; the coach cannot wait past the scheduled time.",
  },
  {
    q: "Can I bring my pet?",
    a: "Small pets travel free in a carrier on all Wayfare Coach journeys, and one well-behaved dog may sit at your feet if the seat beside you is unsold. Registered assistance animals are always welcome with no notice needed.",
  },
];

export const steps = [
  {
    n: "01",
    title: "Search your route",
    copy: "Pick a city pair and date. We scan every partner coach and show real seats, not estimates.",
  },
  {
    n: "02",
    title: "Choose your exact seat",
    copy: "Window, aisle, extra legroom or a laid-back sleeper berth. It's your call, on a live map.",
  },
  {
    n: "03",
    title: "Ride, ticket in hand",
    copy: "A QR ticket lands in your inbox instantly, with boarding notes and live coach updates.",
  },
];

export type Passenger = {
  seat: string;
  name: string;
  age: string;
  gender: string;
};

export type Ticket = {
  ref: string;
  trip: Trip;
  passengers: Passenger[];
  boarding: string;
  contact: { name: string; email: string; phone: string };
  extras: string[];
  promo: string | null;
  total: number;
  createdAt: string;
  seats: string[];
};

export function priceBreakdown(
  trip: Trip,
  seats: string[],
  extras: string[],
  promo: string | null,
) {
  const seatTotal = seats.reduce((sum, s) => sum + seatPrice(trip, s), 0);
  const extrasTotal = extras.reduce((sum, id) => {
    const extra = extraOptions.find((e) => e.id === id);
    if (!extra) return sum;
    return sum + (extra.perSeat ? extra.price * seats.length : extra.price);
  }, 0);
  const subtotal = seatTotal + extrasTotal;
  const promoDef = promos.find((p) => p.code === promo);
  const discount = promoDef
    ? promoDef.type === "percent"
      ? Math.round((seatTotal * promoDef.value) / 100)
      : Math.min(promoDef.value, seatTotal)
    : 0;
  const fees = Math.round(subtotal > 0 ? seats.length * 1.5 : 0);
  const taxes = Math.round((subtotal - discount) * 0.06);
  const total = Math.max(0, subtotal - discount + fees + taxes);
  return { seatTotal, extrasTotal, subtotal, discount, fees, taxes, total };
}

export function makeReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `WF-${out}`;
}
