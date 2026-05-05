import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const SQUARE_API_BASE = SQUARE_ENV === "production"
  ? "https://connect.squareup.com/v2"
  : "https://connect.squareupsandbox.com/v2";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface PaymentRequest {
  sourceId: string;
  idempotencyKey: string;
  bookingId: string;
}

type AvailabilityResult = {
  available?: boolean;
  reason?: string;
  status?: string;
};

async function assertBookingStillAvailable(vehicleId: string, bookingDate: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("check_vehicle_availability", {
    p_vehicle_id: vehicleId,
    p_date: bookingDate,
  });

  if (error) {
    console.error("Failed to recheck availability before payment:", error);
    throw new Error("Availability could not be verified before payment.");
  }

  const availability = data as AvailabilityResult | null;
  if (!availability?.available) {
    return availability?.reason || availability?.status || "Vehicle is no longer available for this date.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  let reservedSquareBookingId: string | null = null;

  try {
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Payment configuration is incomplete." }, { status: 500 });
    }

    const supabase = getSupabase();
    const body = await request.json();
    const { sourceId, idempotencyKey, bookingId } = body as PaymentRequest;

    if (!sourceId || !idempotencyKey || !bookingId) {
      return NextResponse.json(
        { error: "Missing required fields: sourceId, idempotencyKey, bookingId" },
        { status: 400 }
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("booking_references")
      .select("id, vehicle_id, square_booking_id, booking_date, start_time, end_time, square_customer_id, total_price, status, notes")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status !== "pending_payment") {
      return NextResponse.json({ error: "Booking is not awaiting payment." }, { status: 409 });
    }

    const availabilityError = await assertBookingStillAvailable(booking.vehicle_id, booking.booking_date);
    if (availabilityError) {
      return NextResponse.json({ error: availabilityError }, { status: 409 });
    }

    const reservationBlock = {
      vehicle_id: booking.vehicle_id,
      block_date: booking.booking_date,
      block_type: "reserved",
      square_booking_id: booking.square_booking_id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      buffer_minutes: 60,
      notes: booking.notes || null,
    };

    const { error: reservationError } = await supabase.from("availability_blocks").insert(reservationBlock);

    if (reservationError) {
      console.error("Failed to reserve booking before payment:", reservationError);
      return NextResponse.json({ error: "Vehicle is no longer available for this date." }, { status: 409 });
    }
    reservedSquareBookingId = booking.square_booking_id;

    const amount = Number(booking.total_price);
    if (!Number.isFinite(amount) || amount <= 0) {
      await supabase.from("availability_blocks").delete().eq("square_booking_id", booking.square_booking_id);
      return NextResponse.json({ error: "Booking amount is invalid." }, { status: 409 });
    }

    const paymentRequest = {
      idempotency_key: idempotencyKey,
      location_id: SQUARE_LOCATION_ID,
      source_id: sourceId,
      amount_money: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: "USD",
      },
      customer_id: booking.square_customer_id || undefined,
      reference_id: bookingId,
      note: `Limo booking payment ${bookingId}`,
    };

    const response = await fetch(`${SQUARE_API_BASE}/payments`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Square payment error:", data);
      await supabase.from("availability_blocks").delete().eq("square_booking_id", booking.square_booking_id);
      reservedSquareBookingId = null;
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || "Payment failed" },
        { status: response.status }
      );
    }

    const { error: updateError } = await supabase
      .from("booking_references")
      .update({ status: "confirmed" })
      .eq("id", bookingId)
      .eq("status", "pending_payment");

    if (updateError) {
      console.error("Failed to confirm paid booking:", updateError);
      return NextResponse.json({ error: "Payment succeeded, but booking confirmation failed." }, { status: 500 });
    }

    const { error: blockError } = await supabase
      .from("availability_blocks")
      .update({ block_type: "booking" })
      .eq("square_booking_id", booking.square_booking_id);

    if (blockError) {
      console.error("Failed to reserve paid booking availability:", blockError);
      return NextResponse.json({ error: "Payment succeeded, but availability could not be reserved." }, { status: 500 });
    }
    reservedSquareBookingId = null;

    const payment = data.payment as { id?: string; status?: string; amount_money?: unknown; receipt_url?: string };

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount_money: payment.amount_money,
        receipt_url: payment.receipt_url,
      },
    });
  } catch (error) {
    if (reservedSquareBookingId) {
      const supabase = getSupabase();
      await supabase.from("availability_blocks").delete().eq("square_booking_id", reservedSquareBookingId);
    }
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
