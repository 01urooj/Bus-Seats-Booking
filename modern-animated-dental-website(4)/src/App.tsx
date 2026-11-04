import { useEffect, useState } from "react";
import { Header, type View } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { Results } from "./components/Results";
import { Booking } from "./components/Booking";
import { TicketView } from "./components/TicketView";
import { Trips } from "./components/Trips";
import { RouteLoader } from "./components/ui";
import {
  defaultSearch,
  type CityCode,
  type Search as SearchState,
  type Ticket,
  type Trip,
} from "./data";

const STORAGE_KEY = "wayfare.tickets.v1";

function loadTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Ticket[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [search, setSearch] = useState<SearchState>(defaultSearch);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(loadTickets);
  const [loading, setLoading] = useState<{ from: CityCode; to: CityCode } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      /* storage may be unavailable — tickets still work in-session */
    }
  }, [tickets]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  const goHome = () => setView("home");
  const openTrips = () => setView("trips");

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goSection = (id: string) => {
    if (view === "home") {
      scrollToId(id);
      return;
    }
    setView("home");
    window.setTimeout(() => scrollToId(id), 120);
  };

  const goBook = () => {
    if (view === "home") {
      scrollToId("search");
      return;
    }
    setView("home");
    window.setTimeout(() => scrollToId("search"), 120);
  };

  const updateSearch = (patch: Partial<SearchState>) => {
    setSearch((prev) => ({ ...prev, ...patch }));
  };

  const withLoader = (action: () => void, from: CityCode, to: CityCode) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      action();
      return;
    }
    setLoading({ from, to });
    window.setTimeout(() => {
      action();
      setLoading(null);
    }, 900);
  };

  const runSearch = () => {
    if (search.from === search.to) return;
    withLoader(() => setView("results"), search.from, search.to);
  };

  const startRoute = (from: CityCode, to: CityCode) => {
    withLoader(() => {
      setSearch((prev) => ({ ...prev, from, to }));
      setView("results");
    }, from, to);
  };

  const selectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setView("booking");
  };

  const completeBooking = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev.filter((t) => t.ref !== newTicket.ref)]);
    setTicket(newTicket);
    setView("ticket");
  };

  const openTicket = (saved: Ticket) => {
    setTicket(saved);
    setView("ticket");
  };

  const cancelTicket = (ref: string) => {
    setTickets((prev) => prev.filter((t) => t.ref !== ref));
    if (ticket?.ref === ref) setTicket(null);
  };

  return (
    <div className="grain min-h-screen bg-sand">
      <a
        href="#main"
        className="sr-only z-[70] rounded-full bg-forest px-5 py-3 text-xs font-semibold text-sand focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <Header
        view={view}
        onHome={goHome}
        onSection={goSection}
        onBook={goBook}
        onTrips={openTrips}
        ticketCount={tickets.length}
      />

      {loading && <RouteLoader from={loading.from} to={loading.to} />}

      <main id="main">
        <div key={`${view}-${ticket?.ref ?? ""}`} className="animate-page">
        {view === "home" && (
          <Home
            search={search}
            onChange={updateSearch}
            onSearch={runSearch}
            onRoute={startRoute}
            onBook={goBook}
          />
        )}

        {view === "results" && (
          <Results
            search={search}
            onChange={updateSearch}
            onSearch={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            onBack={goHome}
            onSelectTrip={selectTrip}
            onTrips={openTrips}
          />
        )}

        {view === "booking" && selectedTrip && (
          <Booking
            key={selectedTrip.id}
            trip={selectedTrip}
            search={search}
            onBack={() => setView("results")}
            onComplete={completeBooking}
            onPartyChange={(count) => updateSearch({ passengers: count })}
          />
        )}

        {view === "ticket" && ticket && (
          <TicketView
            ticket={ticket}
            onHome={goHome}
            onTrips={openTrips}
            onBookAnother={goBook}
          />
        )}

        {view === "trips" && (
          <Trips
            tickets={tickets}
            onOpen={openTicket}
            onHome={goHome}
            onSearch={goBook}
            onCancel={cancelTicket}
          />
        )}
        </div>
      </main>

      {view !== "booking" && (
        <Footer
          onHome={goHome}
          onSection={goSection}
          onRoute={startRoute}
          onTrips={openTrips}
        />
      )}
    </div>
  );
}
