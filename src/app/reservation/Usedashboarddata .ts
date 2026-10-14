"use client";
// app/reservation/useDashboardData.ts
// Drop this next to your ReservationPage file.
// It fetches live data from the DB via API routes,
// falling back to hardcoded defaults if the API is unavailable.

import { useState, useEffect } from "react";

interface Vehicle {
  id: string; name: string; model: string;
  maxPassengers: number; maxLuggage: number;
  img: string; price: number;
  special?: string; tag?: string;
}

// Fallback defaults (shown while loading or if API fails)
const DEFAULT_PICKUPS: string[] = [
  "Charles de Gaulle (CDG)", "Orly Airport", "Beauvais–Tillé Airport",
  "Paris City Centre", "Disneyland Paris", "Versailles Palace",
  "Montmartre", "Eiffel Tower Area",
];

const DEFAULT_VEHICLES: Vehicle[] = [
  { id:"sedan",   name:"BUSINESS CLASS CAR", model:"Mercedes-Benz E-Class or similar",   maxPassengers:3,  maxLuggage:2,  img:"/images/car.png", price:80,  tag:"Most Popular" },
  { id:"van",     name:"BUSINESS CLASS VAN", model:"Mercedes-Benz V-Class or similar",   maxPassengers:8,  maxLuggage:8,  img:"/images/car.png", price:80,  tag:"Best for Groups", special:"Can accommodate your stroller" },
  { id:"suv",     name:"LUXURY SUV",         model:"Mercedes-Benz GLE or similar",       maxPassengers:5,  maxLuggage:5,  img:"/images/car.png", price:110, tag:"Premium" },
  { id:"minibus", name:"MINIBUS",             model:"Mercedes-Benz Sprinter or similar", maxPassengers:16, maxLuggage:16, img:"/images/car.png", price:150, tag:"Large Groups", special:"Can accommodate multiple strollers & wheelchairs" },
];

const DEFAULT_FEATURES: string[] = [
  "Meet & Greet included", "Door-to-door",
  "Porter service", "Free child seats & boosters",
];

export function useDashboardData() {
  const [pickups,  setPickups]  = useState<string[]>(DEFAULT_PICKUPS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEFAULT_VEHICLES);
  const [features, setFeatures] = useState<string[]>(DEFAULT_FEATURES);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [locRes, vehRes, featRes] = await Promise.all([
          fetch("/api/locations"),
          fetch("/api/vehicles"),
          fetch("/api/features"),
        ]);

        if (locRes.ok) {
          const data = await locRes.json();
          const active = data.filter((l: any) => l.active).map((l: any) => l.name);
          if (active.length > 0) setPickups(active);
        }

        if (vehRes.ok) {
          const data = await vehRes.json();
          const active = data.filter((v: any) => v.active);
          if (active.length > 0) setVehicles(active);
        }

        if (featRes.ok) {
          const data = await featRes.json();
          const active = data.filter((f: any) => f.active).map((f: any) => f.text);
          if (active.length > 0) setFeatures(active);
        }
      } catch (err) {
        console.warn("useDashboardData: using defaults (API error)", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { pickups, vehicles, features, loading };
}