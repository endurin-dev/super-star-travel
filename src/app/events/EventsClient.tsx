// src/app/events/EventsClient.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import type { EventItem } from "@/lib/events";

interface Props {
  allEvents: EventItem[];
  parisEvents: EventItem[];
  europeEvents: EventItem[];
  featuredEvents: EventItem[];
}

const COUNTRIES = [
  { value: "", label: "All Countries" },
  { value: "France", label: "🇫🇷 France" },
  { value: "Belgium", label: "🇧🇪 Belgium" },
  { value: "Netherlands", label: "🇳🇱 Netherlands" },
  { value: "Germany", label: "🇩🇪 Germany" },
  { value: "Italy", label: "🇮🇹 Italy" },
  { value: "Spain", label: "🇪🇸 Spain" },
];

type Tab = "all" | "paris" | "europe";

function dedupeById(events: EventItem[]): EventItem[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

export default function EventsClient({
  allEvents,
  parisEvents,
  europeEvents,
  featuredEvents,
}: Props) {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const carouselRef = useRef<HTMLDivElement>(null);

  const baseEvents: EventItem[] =
    activeTab === "paris"
      ? parisEvents
      : activeTab === "europe"
      ? europeEvents
      : allEvents;

  const filtered = useMemo(() => {
    const result = baseEvents.filter((e) => {
      const matchSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.city?.toLowerCase().includes(search.toLowerCase());

      const matchCountry = !country || e.country === country;

      const matchDate =
        !dateFrom || new Date(e.startDate) >= new Date(dateFrom);

      return matchSearch && matchCountry && matchDate;
    });

    // Defensive dedupe in case the source arrays contain overlapping events
    return dedupeById(result);
  }, [baseEvents, search, country, dateFrom]);

  const dedupedFeatured = useMemo(
    () => dedupeById(featuredEvents),
    [featuredEvents]
  );

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

      {/* ── Featured Carousel ───────────────────────────────────── */}
      {dedupedFeatured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-1">
                Highlighted
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                Featured Events
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel("left")}
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {dedupedFeatured.map((event) => (
              <div
                key={event.id}
                className="min-w-[300px] max-w-[300px] snap-start"
              >
                <EventCard event={event} featured />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Tabs + Filters ──────────────────────────────────────── */}
      <section>
        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {(
            [
              { key: "all", label: "All Events" },
              { key: "paris", label: "🗼 Paris" },
              { key: "europe", label: "🌍 Europe" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? "border-sky-600 text-sky-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Country filter */}
          <div className="relative">
            <SlidersHorizontal
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer min-w-[160px]"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition cursor-pointer"
            aria-label="Filter from date"
          />
        </div>

        {/* ── Results count ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {activeTab === "paris"
              ? "Paris Events"
              : activeTab === "europe"
              ? "Europe Events"
              : "Upcoming Events"}
          </h2>
          <span className="text-sm text-slate-400">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* ── Grid ──────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-5xl mb-4">🎭</p>
            <p className="text-xl font-semibold text-slate-700 mb-2">
              No events found
            </p>
            <p className="text-slate-400 text-sm">
              Try adjusting your filters or check back soon for new events.
            </p>
            {(search || country || dateFrom) && (
              <button
                onClick={() => {
                  setSearch("");
                  setCountry("");
                  setDateFrom("");
                }}
                className="mt-5 px-5 py-2 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}