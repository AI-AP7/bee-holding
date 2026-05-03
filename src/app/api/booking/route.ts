import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface BookingRequest {
  vehicleId: string;
  vehicleSlug?: string;
  date: string;
  time: string;
  serviceType: "hourly" | "point_to_point";
  serviceArea: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  specialRequests?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vehicleId,
      vehicleSlug,
      date,
      time,
      serviceType,
      serviceArea,
      customerName,
      customerEmail,
      customerPhone,
      pickupLocation,
      dropoffLocation,
      specialRequests,
    } = body as BookingRequest;

    if (!vehicleId || !date || !time || !serviceType || !serviceArea || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const vehicleResult = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId)
      .eq("is_active", true)
      .single();

    const vehicle = vehicleResult.data;

    // 1. Handle Square Customer (Find or Create)
    const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
    const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";
    const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";
    const SQUARE_API_BASE = SQUARE_ENV === "production"
      ? "https://connect.squareup.com/v2"
      : "https://connect.squareupsandbox.com/v2";

    let squareCustomerId = "";
    
    // Check if customer exists in Square
    const customerSearchResponse = await fetch(`${SQUARE_API_BASE}/customers/search`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          filter: {
            email_address: { exact: customerEmail }
          }
        }
      })
    });

    const searchData = await customerSearchResponse.json();
    if (searchData.customers && searchData.customers.length > 0) {
      squareCustomerId = searchData.customers[0].id;
    } else {
      // Create new customer
      const createCustomerResponse = await fetch(`${SQUARE_API_BASE}/customers`, {
        method: "POST",
        headers: {
          "Square-Version": "2024-01-18",
          "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          given_name: customerName,
          email_address: customerEmail,
          phone_number: customerPhone,
        })
      });
      const createData = await createCustomerResponse.json();
      if (createData.customer) {
        squareCustomerId = createData.customer.id;
      }
    }

    // 2. Create Square Booking
    // This requires a Service Variation ID. For now, we use a placeholder or check vehicle data
    // In a real scenario, this would be stored in the vehicles table
    const serviceVariationId = vehicle?.square_service_variation_id || "placeholder-variation-id";
    
    // Formatting startAt for Square (ISO format)
    const startAt = `${date}T${time}:00Z`; // Simple ISO format, assuming UTC/Local adjustment is handled
    
    const squareBookingRequest = {
      booking: {
        customer_id: squareCustomerId,
        location_id: SQUARE_LOCATION_ID,
        start_at: startAt,
        appointment_segments: [
          {
            service_variation_id: serviceVariationId,
            team_member_id: "PUBLIC",
            duration_minutes: serviceType === "hourly" ? 240 : 60,
          }
        ],
        customer_note: `Limo Booking: ${vehicle?.name || "Premium Vehicle"}. Area: ${serviceArea}. Notes: ${specialRequests || "None"}`
      }
    };

    const bookingResponse = await fetch(`${SQUARE_API_BASE}/bookings`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(squareBookingRequest)
    });

    const bookingData = await bookingResponse.json();
    const squareBookingId = bookingData.booking?.id || `pending_${Date.now()}`;

    // 3. Save to Supabase
    const bookingRef = {
      vehicle_id: vehicle?.id || vehicleId,
      square_booking_id: squareBookingId,
      square_customer_id: squareCustomerId,
      customer_name: customerName,
      customer_email: customerEmail,
      booking_date: date,
      start_time: time,
      end_time: serviceType === "hourly" ? `${(parseInt(time.split(":")[0]) + 4) % 24}:00` : time,
      service_type: serviceType,
      service_area: serviceArea,
      pickup_location: pickupLocation || null,
      dropoff_location: dropoffLocation || null,
      total_hours: serviceType === "hourly" ? 4 : 1,
      total_price: vehicle?.four_hour_block_local || 510,
      status: bookingData.booking ? "confirmed" : "pending",
      notes: specialRequests || null,
    };

    const { data: booking, error: bookingError } = await supabase
      .from("booking_references")
      .insert(bookingRef)
      .select()
      .single();

    if (bookingError) {
      console.error("Failed to create booking reference:", bookingError);
    }

    const availabilityBlock = {
      vehicle_id: vehicle?.id || vehicleId,
      block_date: date,
      block_type: "booking",
      square_booking_id: squareBookingId,
      start_time: time,
      end_time: serviceType === "hourly" ? `${(parseInt(time.split(":")[0]) + 4) % 24}:00` : time,
      buffer_minutes: 60,
    };

    const { error: blockError } = await supabase
      .from("availability_blocks")
      .insert(availabilityBlock);

    if (blockError) {
      console.error("Failed to create availability block:", blockError);
    }

    return NextResponse.json({
      success: true,
      booking: booking || {
        id: squareBookingId,
        ...bookingRef,
      },
      squareBooking: bookingData.booking,
      message: bookingData.booking 
        ? "Booking confirmed and scheduled in Square." 
        : "Booking received but Square scheduling failed: " + (bookingData.errors?.[0]?.detail || "Unknown error"),
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");
    const email = searchParams.get("email");

    if (bookingId) {
      const { data, error } = await supabase
        .from("booking_references")
        .select("*, vehicles(name)")
        .eq("id", bookingId)
        .single();

      if (error) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      return NextResponse.json({ success: true, booking: data });
    }

    if (email) {
      const { data, error } = await supabase
        .from("booking_references")
        .select("*, vehicles(name)")
        .eq("customer_email", email)
        .order("created_at", { ascending: false });

      if (error) return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
      return NextResponse.json({ success: true, bookings: data });
    }

    return NextResponse.json({ error: "Missing id or email parameter" }, { status: 400 });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
