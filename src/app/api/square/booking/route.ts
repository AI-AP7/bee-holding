import { NextRequest, NextResponse } from "next/server";

const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";

const SQUARE_API_BASE = SQUARE_ENV === "production"
  ? "https://connect.squareup.com/v2"
  : "https://connect.squareupsandbox.com/v2";

interface CreateBookingRequest {
  customerId?: string;
  customerNote?: string;
  startAt: string;
  serviceVariationId: string;
  teamMemberId?: string;
  locationId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      customerNote,
      startAt,
      serviceVariationId,
      teamMemberId,
      locationId = SQUARE_LOCATION_ID,
    } = body as CreateBookingRequest;

    if (!startAt || !serviceVariationId) {
      return NextResponse.json(
        { error: "Missing required fields: startAt, serviceVariationId" },
        { status: 400 }
      );
    }

    const bookingRequest = {
      booking: {
        customer_id: customerId,
        customer_note: customerNote || "",
        start_at: startAt,
        location_id: locationId,
        appointment_segments: [
          {
            service_variation_id: serviceVariationId,
            team_member_id: teamMemberId || "PUBLIC",
            start_at: startAt,
            duration_minutes: 60,
            service_note: "",
          },
        ],
      },
    };

    const response = await fetch(`${SQUARE_API_BASE}/bookings`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Square booking error:", data);
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || "Failed to create booking" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      booking: data.booking,
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(`${SQUARE_API_BASE}/bookings/${bookingId}`, {
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || "Failed to fetch booking" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      booking: data.booking,
    });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
