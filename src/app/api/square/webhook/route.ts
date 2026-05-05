import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { addHoursToTime } from "@/lib/limo";

const squareEnvironment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
const squareWebhookKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";
const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN || "";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const squareApiBase =
  squareEnvironment === "production"
    ? "https://connect.squareup.com/v2"
    : "https://connect.squareupsandbox.com/v2";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SquareWebhookEvent {
  type: string;
  data: {
    id: string;
  };
}

interface SquareBooking {
  id: string;
  customer_id?: string;
  customer_note?: string;
  start_at: string;
  location_id?: string;
  status?: string;
  appointment_segments?: Array<{
    service_variation_id?: string;
    duration_minutes?: number;
  }>;
}

function verifyWebhookSignature(signature: string, body: string, url: string) {
  if (!squareWebhookKey) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", squareWebhookKey)
    .update(`${url}${body}`)
    .digest("base64");

  return signature === expectedSignature;
}

async function getSquareBooking(bookingId: string): Promise<SquareBooking | null> {
  const response = await fetch(`${squareApiBase}/bookings/${bookingId}`, {
    headers: {
      "Square-Version": "2024-01-18",
      Authorization: `Bearer ${squareAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch booking from Square:", await response.text());
    return null;
  }

  const data = (await response.json()) as { booking?: SquareBooking };
  return data.booking || null;
}

async function resolveVehicleId(serviceVariationId?: string | null) {
  if (!serviceVariationId) {
    return null;
  }

  const { data } = await supabase
    .from("vehicles")
    .select("id")
    .eq("square_service_variation_id", serviceVariationId)
    .maybeSingle();

  return data?.id ?? null;
}

function normalizeBookingStatus(state?: string) {
  switch (state) {
    case "ACCEPTED":
      return "confirmed";
    case "CANCELLED_BY_CUSTOMER":
    case "CANCELLED_BY_MERCHANT":
    case "DECLINED":
    case "NO_SHOW":
      return "cancelled";
    default:
      return "pending";
  }
}

async function syncBooking(bookingId: string) {
  const booking = await getSquareBooking(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const startDate = new Date(booking.start_at);
  const blockDate = startDate.toISOString().slice(0, 10);
  const startTime = startDate.toISOString().slice(11, 19);
  const durationMinutes = booking.appointment_segments?.[0]?.duration_minutes ?? 60;
  const durationHours = Math.max(1, Math.round(durationMinutes / 60));
  const serviceVariationId = booking.appointment_segments?.[0]?.service_variation_id ?? null;
  const vehicleId = await resolveVehicleId(serviceVariationId);
  const normalizedStatus = normalizeBookingStatus(booking.status);

  const bookingReference = {
    vehicle_id: vehicleId,
    square_booking_id: bookingId,
    square_customer_id: booking.customer_id ?? null,
    booking_date: blockDate,
    start_time: startTime,
    end_time: addHoursToTime(startTime.slice(0, 5), durationHours),
    service_type: durationHours > 1 ? "hourly" : "point_to_point",
    status: normalizedStatus,
    notes: booking.customer_note ?? null,
    total_hours: durationHours,
  };

  const { error: bookingError } = await supabase
    .from("booking_references")
    .upsert(bookingReference, { onConflict: "square_booking_id" });

  if (bookingError) {
    console.error("Failed to upsert booking reference:", bookingError);
    return NextResponse.json({ error: "Failed to sync booking reference." }, { status: 500 });
  }

  if (vehicleId && normalizedStatus !== "cancelled") {
    const { error: blockError } = await supabase.from("availability_blocks").upsert(
      {
        vehicle_id: vehicleId,
        block_date: blockDate,
        block_type: "booking",
        square_booking_id: bookingId,
        start_time: startTime,
        end_time: addHoursToTime(startTime.slice(0, 5), durationHours),
        buffer_minutes: 60,
        notes: booking.customer_note ?? null,
      },
      { onConflict: "vehicle_id,block_date,square_booking_id" }
    );

    if (blockError) {
      console.error("Failed to upsert availability block:", blockError);
      return NextResponse.json({ error: "Failed to sync availability block." }, { status: 500 });
    }
  }

  if (normalizedStatus === "cancelled") {
    await supabase.from("availability_blocks").delete().eq("square_booking_id", bookingId);
  }

  return NextResponse.json({ received: true });
}

export async function POST(request: NextRequest) {
  try {
    if (!squareWebhookKey || !squareAccessToken || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Webhook integration is not configured." }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get("x-square-hmacsha256-signature") || "";

    if (!verifyWebhookSignature(signature, body, request.url)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    const event = JSON.parse(body) as SquareWebhookEvent;
    switch (event.type) {
      case "booking.created":
      case "booking.updated":
      case "booking.cancelled":
        return await syncBooking(event.data.id);
      default:
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
