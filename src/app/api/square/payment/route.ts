import { NextRequest, NextResponse } from "next/server";

const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";

const SQUARE_API_BASE = SQUARE_ENV === "production"
  ? "https://connect.squareup.com/v2"
  : "https://connect.squareupsandbox.com/v2";

interface PaymentRequest {
  sourceId: string;
  amount: number;
  idempotencyKey: string;
  customerId?: string;
  note?: string;
  bookingId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, amount, idempotencyKey, customerId, note, bookingId } = body as PaymentRequest;

    if (!sourceId || !amount || !idempotencyKey) {
      return NextResponse.json(
        { error: "Missing required fields: sourceId, amount, idempotencyKey" },
        { status: 400 }
      );
    }

    const paymentRequest = {
      idempotency_key: idempotencyKey,
      location_id: SQUARE_LOCATION_ID,
      source_id: sourceId,
      amount_money: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: "USD",
      },
      customer_id: customerId,
      reference_id: bookingId,
      note: note || "Limo Booking Payment",
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
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || "Payment failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      payment: data.payment,
    });
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
