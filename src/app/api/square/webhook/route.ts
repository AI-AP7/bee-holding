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

interface SquarePayment {
  id: string;
  status?: string;
  reference_id?: string;
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
  if (!squareWebhookKey || squareWebhookKey === "placeholder-key") {
    return false;
  }

  const expectedSignature = Buffer.from(
    crypto
      .createHmac("sha256", squareWebhookKey)
      .update(`${url}${body}`)
      .digest()
  );
  const receivedSignature = Buffer.from(signature, "base64");

  return (
    receivedSignature.length === expectedSignature.length &&
    crypto.timingSafeEqual(receivedSignature, expectedSignature)
  );
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

async function getSquarePayment(paymentId: string): Promise<SquarePayment | null> {
  const response = await fetch(`${squareApiBase}/payments/${paymentId}`, {
    headers: {
      "Square-Version": "2024-01-18",
      Authorization: `Bearer ${squareAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch payment from Square:", await response.text());
    return null;
  }

  const data = (await response.json()) as { payment?: SquarePayment };
  return data.payment || null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

async function syncPayment(paymentId: string) {
  const payment = await getSquarePayment(paymentId);
  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  if (payment.status !== "COMPLETED" || !payment.reference_id) {
    return NextResponse.json({ received: true });
  }

  let bookingQuery = supabase
    .from("booking_references")
    .select("id, vehicle_id, square_booking_id, booking_date, start_time, end_time, status, notes")
    .eq("square_booking_id", payment.reference_id);

  if (isUuid(payment.reference_id)) {
    bookingQuery = supabase
      .from("booking_references")
      .select("id, vehicle_id, square_booking_id, booking_date, start_time, end_time, status, notes")
      .eq("id", payment.reference_id);
  }

  const { data: booking, error: bookingLookupError } = await bookingQuery.maybeSingle();

  if (bookingLookupError) {
    console.error("Failed to find booking for completed payment:", bookingLookupError);
    return NextResponse.json({ error: "Failed to find booking for completed payment." }, { status: 500 });
  }

  if (!booking || booking.status !== "pending_payment") {
    return NextResponse.json({ received: true });
  }

  const { error: blockError } = await supabase.from("availability_blocks").insert({
    vehicle_id: booking.vehicle_id,
    block_date: booking.booking_date,
    block_type: "booking",
    square_booking_id: booking.square_booking_id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    buffer_minutes: 60,
    notes: booking.notes || null,
  });

  if (blockError) {
    console.error("Failed to reserve paid booking availability from webhook:", blockError);
    return NextResponse.json({ error: "Failed to reserve paid booking availability." }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("booking_references")
    .update({ status: "confirmed" })
    .eq("id", booking.id)
    .eq("status", "pending_payment");

  if (updateError) {
    await supabase.from("availability_blocks").delete().eq("square_booking_id", booking.square_booking_id);
    console.error("Failed to confirm pending booking after payment:", updateError);
    return NextResponse.json({ error: "Failed to confirm booking after payment." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export async function POST(request: NextRequest) {
  try {
    if (!squareWebhookKey || squareWebhookKey === "placeholder-key" || !squareAccessToken || !supabaseUrl || !supabaseServiceKey) {
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
      case "payment.created":
      case "payment.updated":
        return await syncPayment(event.data.id);
      default:
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
