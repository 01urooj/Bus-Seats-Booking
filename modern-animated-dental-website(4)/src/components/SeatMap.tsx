import { useMemo, useState } from "react";
import { Accessibility, Armchair, DoorOpen, Sparkles, Star } from "lucide-react";
import {
  isPremiumSeat,
  occupiedFor,
  seatLayouts,
  seatMatrix,
  seatPrice,
  type Trip,
} from "@/data";
import { cn } from "@/utils/cn";

function rowsFromMatrix(matrix: (string | null)[][]) {
  return matrix.map((row) => {
    const blocks: string[][] = [];
    row.forEach((cell) => {
      if (cell === null) {
        blocks.push([]);
      } else {
        if (blocks.length === 0) blocks.push([]);
        blocks[blocks.length - 1].push(cell);
      }
    });
    return blocks;
  });
}

export function SeatMap({
  trip,
  maxSeats,
  selected,
  onChange,
}: {
  trip: Trip;
  maxSeats: number;
  selected: string[];
  onChange: (seats: string[]) => void;
}) {
  const [limitMessage, setLimitMessage] = useState("");
  const occupied = useMemo(
    () => occupiedFor(trip.id, trip.layout, trip.load),
    [trip],
  );
  const matrix = useMemo(() => seatMatrix(trip.layout), [trip.layout]);
  const rows = useMemo(() => rowsFromMatrix(matrix), [matrix]);
  const seatConfig = seatLayouts[trip.layout];
  const totalSeats = rows.flat().flat().length;

  const toggle = (code: string) => {
    if (occupied.has(code)) return;
    if (selected.includes(code)) {
      onChange(selected.filter((s) => s !== code));
      setLimitMessage("");
      return;
    }
    if (selected.length >= maxSeats) {
      setLimitMessage(
        `You're booking ${maxSeats} ${maxSeats === 1 ? "seat" : "seats"}. Deselect one to choose another.`,
      );
      return;
    }
    setLimitMessage("");
    onChange([...selected, code]);
  };

  const freeCount = rows.flat().flat().filter((code) => !occupied.has(code)).length;

  const autoPick = (count: number) => {
    if (count > freeCount) return;
    // Prefer a contiguous run of free seats sitting together in the same block.
    const runs: string[][] = [];
    rows.forEach((blocks) => {
      blocks.forEach((block) => {
        const free = block.filter((code) => !occupied.has(code));
        for (let start = 0; start + count <= free.length; start += 1) {
          const run = free.slice(start, start + count);
          const positions = run.map((code) => block.indexOf(code));
          const together = positions.every(
            (position, i) => i === 0 || position === positions[i - 1] + 1,
          );
          if (together) runs.push(run);
        }
      });
    });
    const fallback = rows
      .flatMap((blocks) => blocks.flat())
      .filter((code) => !occupied.has(code));
    const picked = runs[0] ?? fallback.slice(0, count);
    if (picked.length === count) {
      setLimitMessage("");
      onChange(picked);
    }
  };

  const seatDescription = (code: string, isWindow: boolean) =>
    `Seat ${code}, ${isWindow ? "window" : "aisle"}, ${
      isPremiumSeat(code) ? "extra legroom, " : ""
    }$${seatPrice(trip, code)}`;

  return (
    <div className="rounded-[20px] border border-forest/12 bg-paper p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
            <Armchair className="size-3.5" />
            Choose your seats
          </p>
          <p className="mt-1 text-[9.5px] text-muted">
            Live map · {totalSeats} seats · choose up to {maxSeats} together
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[9px] font-bold",
            selected.length === maxSeats
              ? "bg-moss text-forest"
              : "bg-sand-deep text-muted",
          )}
        >
          {selected.length} of {maxSeats} selected
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {[
          { label: "Available", className: "border-forest/25 bg-paper" },
          { label: "Selected", className: "border-forest bg-forest" },
          { label: "Taken", className: "border-transparent bg-sand-deep" },
          {
            label: "Extra legroom",
            className: "border-gold bg-gold-soft",
          },
        ].map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5 text-[9px] text-muted">
            <span className={cn("size-3 rounded-[3px] border", item.className)} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 rounded-lg bg-sand/70 px-2 py-1.5">
        <span className="mr-0.5 inline-flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
          <Sparkles className="size-2.5 text-[#7a8a2e]" />
          Quick pick
        </span>
        {[2, 3, 4].filter((n) => n <= maxSeats).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => autoPick(n)}
            disabled={freeCount < n}
            className="rounded-full border border-forest/15 bg-paper px-2.5 py-1 text-[9px] font-bold text-forest transition-colors hover:border-forest hover:bg-forest hover:text-sand disabled:cursor-not-allowed disabled:opacity-40"
          >
            {n} together
          </button>
        ))}
        <span className="ml-auto hidden text-[8.5px] text-muted sm:block">
          Travellers adjust to your seats
        </span>
      </div>

      <div className="mt-3 rounded-[22px] border border-forest/12 bg-sand p-2.5 sm:p-3">
        {/* front of coach */}
        <div className="mb-2.5 flex items-center justify-between rounded-xl border border-forest/10 bg-paper px-3 py-2">
          <span className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-muted">
            <span className="grid size-4 place-items-center rounded-full border border-forest/25">
              <Accessibility className="size-2.5" />
            </span>
            Driver
          </span>
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted/70">
            Front of coach
          </span>
          <span className="flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-muted">
            Door
            <DoorOpen className="size-3.5" />
          </span>
        </div>

        <div className="mx-auto w-full max-w-[330px] space-y-1.5 sm:max-w-[360px]">
          {rows.map((blocks, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <span className="w-3 shrink-0 text-right text-[8px] font-semibold tabular-nums text-muted/50">
                {rowIndex + 1}
              </span>
              {blocks.map((block, blockIndex) => (
                <div key={`block-${rowIndex}-${blockIndex}`} className="flex items-center gap-1.5">
                  {block.map((code, seatIndex) => {
                    const isWindow =
                      (blockIndex === 0 && seatIndex === 0) ||
                      (blockIndex === blocks.length - 1 &&
                        seatIndex === block.length - 1);
                    const isOccupied = occupied.has(code);
                    const isSelected = selected.includes(code);
                    const premium = isPremiumSeat(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggle(code)}
                        disabled={isOccupied}
                        aria-pressed={isSelected}
                        aria-label={
                          isOccupied
                            ? `Seat ${code} unavailable`
                            : `${seatDescription(code, isWindow)}${isSelected ? ", selected" : ""}`
                        }
                        style={{
                          animationDelay: `${Math.min(360, (rowIndex * 5 + blockIndex * 2 + seatIndex) * 12)}ms`,
                        }}
                        className={cn(
                          "seat-shell seat-in relative grid size-8 place-items-center rounded-t-[8px] rounded-b-[3px] border text-[8.5px] font-bold sm:size-9 sm:text-[9px]",
                          isOccupied &&
                            "cursor-not-allowed border-forest/10 bg-forest/10 text-forest/30",
                          !isOccupied &&
                            !isSelected &&
                            (premium
                              ? "border-gold/70 bg-gold-soft text-forest hover:border-gold"
                              : "border-forest/20 bg-paper text-forest/75 hover:border-forest/50"),
                          isSelected &&
                            "seat-picked border-forest bg-forest text-sand shadow-[0_5px_12px_-4px_rgba(15,51,42,0.6)] ring-2 ring-sand ring-offset-1 ring-offset-forest/20",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute inset-x-1 top-1 h-[2px] rounded-full",
                            isSelected
                              ? "bg-sand/40"
                              : isOccupied
                                ? "bg-forest/15"
                                : "bg-current opacity-25",
                          )}
                        />
                        {isOccupied ? "×" : code}
                        {premium && !isOccupied && (
                          <Star
                            className={cn(
                              "absolute -right-0.5 -top-0.5 size-2",
                              isSelected ? "fill-gold text-gold" : "fill-gold text-gold",
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                  {blockIndex < blocks.length - 1 && (
                    <span className="relative w-3.5 sm:w-6" aria-hidden="true">
                      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-forest/10" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between rounded-lg border border-forest/10 bg-paper px-3 py-1.5">
          <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-muted">
            Rear of coach
          </span>
          <span className="inline-flex items-center gap-1 text-[8.5px] font-medium text-forest">
            <Sparkles className="size-2.5" />
            Rows 1–{seatConfig.premiumRows}: extra legroom +$7
          </span>
        </div>
      </div>

      {limitMessage && (
        <p role="status" className="mt-3 rounded-lg bg-gold-soft px-3 py-2 text-[10px] font-semibold text-forest">
          {limitMessage}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {selected.length === 0 ? (
          <p className="text-[9.5px] text-muted">
            Tap any free seat above. Window seats are marked by position.
          </p>
        ) : (
          selected.map((seat) => (
            <span
              key={seat}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-2.5 py-1 text-[9.5px] font-bold text-sand"
            >
              Seat {seat}
              <span className="text-gold">${seatPrice(trip, seat)}</span>
              <button
                onClick={() => toggle(seat)}
                aria-label={`Remove seat ${seat}`}
                className="text-sand/50 transition-colors hover:text-sand"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
