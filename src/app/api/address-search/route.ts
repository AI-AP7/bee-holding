import { NextRequest, NextResponse } from "next/server";
import { normalizeAddress } from "@/lib/limo";

const tomtomApiKey = process.env.TOMTOM_API_KEY || "";

type TomTomSearchResponse = {
  results?: Array<{
    id?: string;
    type?: string;
    address?: {
      freeformAddress?: string;
      municipality?: string;
      countrySubdivision?: string;
    };
    position?: {
      lat: number;
      lon: number;
    };
  }>;
};

export async function GET(request: NextRequest) {
  try {
    if (!tomtomApiKey) {
      return NextResponse.json({ error: "TomTom address search is not configured." }, { status: 500 });
    }

    const query = normalizeAddress(request.nextUrl.searchParams.get("q"));
    if (query.length < 3) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const url = new URL(`https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json`);
    url.searchParams.set("key", tomtomApiKey);
    url.searchParams.set("countrySet", "US");
    url.searchParams.set("limit", "5");
    url.searchParams.set("typeahead", "true");
    url.searchParams.set("idxSet", "Addr,PAD");

    const response = await fetch(url);
    const data = (await response.json()) as TomTomSearchResponse;

    if (!response.ok) {
      return NextResponse.json({ error: "Address search failed." }, { status: response.status || 502 });
    }

    const suggestions = (data.results || [])
      .map((result) => ({
        id: result.id || result.address?.freeformAddress || "",
        address: result.address?.freeformAddress || "",
        city: result.address?.municipality || "",
        state: result.address?.countrySubdivision || "",
      }))
      .filter((suggestion) => suggestion.address);

    return NextResponse.json({ success: true, suggestions });
  } catch {
    return NextResponse.json({ error: "Address search failed." }, { status: 502 });
  }
}
