// src/components/EventCard.tsx
"use client";

import Image from "next/image";
import { Calendar, MapPin, Globe, Star } from "lucide-react";
import type { EventItem } from "@/lib/events";

interface EventCardProps {
  event: EventItem;
  featured?: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventCard({ event, featured = false }: EventCardProps) {
  const fallback =
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"; // Paris

  return (
    <article
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
        featured ? "ring-2 ring-amber-400" : ""
      }`}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Image
          src={event.imageUrl || fallback}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallback;
          }}
        />
        {/* Source badge */}
        <span className="absolute top-3 left-3 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide">
          {event.source === "ticketmaster" ? "Ticketmaster" : "Manual"}
        </span>
        {featured && (
          <span className="absolute top-3 right-3 bg-orange-400 text-orange-950 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star size={10} fill="currentColor" /> Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-sky-500 shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          {(event.city || event.location) && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-sky-500 shrink-0" />
              <span className="line-clamp-1">
                {[event.city, event.country].filter(Boolean).join(", ")}
                {event.location ? ` · ${event.location}` : ""}
              </span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* CTA */}
        {event.websiteUrl && (
          <div className="mt-auto pt-2">
            <a
              href={event.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors"
            >
              <Globe size={14} />
              Learn More
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
