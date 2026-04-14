import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
const SQUARE_WEBHOOK_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";

const SQUARE_API_BASE = SQUARE_ENV === "production"
  ? "https://connect.squareup.com/v2"
  : "https://connect.squareupsandbox.com/v2";

interface SquareWebhookEvent {
  merchant_id: string;
  type: string;
  event_id: string;
  created_at: string;
  data: {
    type: string;
    id: string;
  };
}

interface SquareBooking {
  id: string;
  customer_id: string;
  customer_note: string;
  start_at: string;
  end_at: string;
  location_id: string;
  state: string;
  service_variation_id: string;
  appointment_segments: Array<{
    service_variation_id: string;
    team_member_id: string;
    start_at: string;
    duration_minutes: number;
    service_note: string;
  }>;
}

function verifyWebhookSignature(
  signature: string,
  body: string,
  url: string
): boolean {
  if (!SQUARE_WEBHOOK_KEY) return true;

  const signatureBase = `${url}${body}`;
  const expectedSignature = crypto
    .createHmac("sha256", SQUARE_WEBHOOK_KEY)
    .update(signatureBase)
    .digest("base64");

  return signature === expectedSignature;
}

async function getSquareBooking(bookingId: string): Promise<SquareBooking | null> {
  try {
    const response = await fetch(`${SQUARE_API_BASE}/bookings/${bookingId}`, {
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch booking from Square:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.booking || null;
  } catch (error) {
    console.error("Error fetching Square booking:", error);
    return null;
  }
}

async function getVehicleFromServiceVariation(serviceVariationId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${SQUARE_API_BASE}/catalog/list?types=ITEM_VARIATION`,
      {
        headers: {
          "Square-Version": "2024-01-18",
          "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const variation = data.objects?.find(
      (obj: { id: string }) => obj.id === serviceVariationId
    );

    return variation?.item_variation_data?.name || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-square-hmacsha256-signature") || "";
    const url = request.url;

    if (!verifyWebhookSignature(signature, body, url)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event: SquareWebhookEvent = JSON.parse(body);
    const eventType = event.type;

    console.log(`Received Square webhook: ${eventType}`, event.data);

    switch (eventType) {
      case "booking.created":
        return await handleBookingCreated(event.data.id);
      
      case "booking.updated":
        return await handleBookingUpdated(event.data.id);
      
      case "booking.cancelled":
        return await handleBookingCancelled(event.data.id);
      
      default:
        console.log(`Unhandled event type: ${eventType}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleBookingCreated(bookingId: string) {
  const booking = await getSquareBooking(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const startDate = new Date(booking.start_at);
  const endDate = new Date(booking.end_at);
  const blockDate = startDate.toISOString().split("T")[0];
  const startTime = startDate.toTimeString().split(" ")[0];
  const endTime = endDate.toTimeString().split(" ")[0];

  const serviceVariationId = booking.appointment_segments?.[0]?.service_variation_id;
  const vehicleName = serviceVariationId 
    ? await getVehicleFromServiceVariation(serviceVariationId) 
    : null;

  const bookingData = {
    vehicle_id: null, // Will be matched by vehicle name in production
    square_booking_id: bookingId,
    customer_name: "Guest Customer", // Will be updated via customer_id
    booking_date: blockDate,
    start_time: startTime,
    end_time: endTime,
    service_type: "hourly",
    status: booking.state === "ACCEPTED" ? "confirmed" : "pending",
    square_customer_id: booking.customer_id,
    notes: booking.customer_note,
    total_price: null, // Calculated separately
  };

  console.log("Booking created:", bookingData);

  return NextResponse.json({
    received: true,
    booking: bookingData,
    vehicle: vehicleName,
  });
}

async function handleBookingUpdated(bookingId: string) {
  const booking = await getSquareBooking(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const statusMap: Record<string, string> = {
    PENDING: "pending",
    ACCEPTED: "confirmed",
    CANCELLED_BY_CUSTOMER: "cancelled",
    CANCELLED_BY_MERCHANT: "cancelled",
    DECLINED: "cancelled",
    NO_SHOW: "cancelled",
  };

  const bookingData = {
    square_booking_id: bookingId,
    status: statusMap[booking.state] || "pending",
    updated_at: new Date().toISOString(),
  };

  console.log("Booking updated:", bookingData);

  return NextResponse.json({
    received: true,
    update: bookingData,
  });
}

async function handleBookingCancelled(bookingId: string) {
  console.log("Booking cancelled:", bookingId);

  return NextResponse.json({
    received: true,
    action: "cancelled",
    booking_id: bookingId,
  });
}
