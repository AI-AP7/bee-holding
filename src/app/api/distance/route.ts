import { NextRequest, NextResponse } from "next/server";
import { normalizeAddress } from "@/lib/limo";

const tomtomApiKey = process.env.TOMTOM_API_KEY || "";

type TomTomSearchResponse = {
  results?: Array<{
    address?: {
      freeformAddress?: string;
    };
    position?: {
      lat: number;
      lon: number;
    };
  }>;
};

type TomTomRouteResponse = {
  routes?: Array<{
    summary?: {
      lengthInMeters?: number;
      travelTimeInSeconds?: number;
    };
  }>;
};

async function geocodeAddress(address: string) {
  const url = new URL(`https://api.tomtom.com/search/2/search/${encodeURIComponent(address)}.json`);
  url.searchParams.set("key", tomtomApiKey);
  url.searchParams.set("countrySet", "US");
  url.searchParams.set("limit", "1");

  const response = await fetch(url);
  const data = (await response.json()) as TomTomSearchResponse;

  if (!response.ok) {
    throw new Error("Address lookup failed.");
  }

  const result = data.results?.[0];
  if (!result?.position) {
    throw new Error("Address could not be found.");
  }

  return result.position;
}

async function getDrivingDistance(origin: string, destination: string) {
  const [originPosition, destinationPosition] = await Promise.all([
    geocodeAddress(origin),
    geocodeAddress(destination),
  ]);
  const routeLocations = `${originPosition.lat},${originPosition.lon}:${destinationPosition.lat},${destinationPosition.lon}`;
  const url = new URL(`https://api.tomtom.com/routing/1/calculateRoute/${routeLocations}/json`);
  url.searchParams.set("key", tomtomApiKey);
  url.searchParams.set("routeRepresentation", "summaryOnly");
  url.searchParams.set("travelMode", "car");

  const response = await fetch(url);
  const data = (await response.json()) as TomTomRouteResponse;

  if (!response.ok) {
    throw new Error("Mileage could not be calculated.");
  }

  const summary = data.routes?.[0]?.summary;
  if (!summary?.lengthInMeters) {
    throw new Error("Mileage could not be calculated for those addresses.");
  }

  const miles = summary.lengthInMeters / 1609.344;
  const minutes = summary.travelTimeInSeconds ? Math.round(summary.travelTimeInSeconds / 60) : null;
  return {
    miles,
    distanceText: `${miles.toFixed(1)} mi`,
    durationText: minutes ? `${minutes} min` : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!tomtomApiKey) {
      return NextResponse.json({ error: "TomTom mileage calculation is not configured." }, { status: 500 });
    }

    const body = (await request.json()) as { pickupLocation?: string; dropoffLocation?: string };
    const pickupLocation = normalizeAddress(body.pickupLocation);
    const dropoffLocation = normalizeAddress(body.dropoffLocation);

    if (!pickupLocation || !dropoffLocation) {
      return NextResponse.json({ error: "Pickup and destination addresses are required." }, { status: 400 });
    }

    const distance = await getDrivingDistance(pickupLocation, dropoffLocation);

    return NextResponse.json({ success: true, ...distance });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mileage could not be calculated.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
