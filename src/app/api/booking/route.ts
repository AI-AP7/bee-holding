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
      .eq("slug", vehicleSlug || "")
      .eq("id", vehicleId)
      .eq("is_active", true)
      .single();

    const vehicle = vehicleResult.data;

    const squareBookingId = `pending_${Date.now()}`;
    const bookingRef = {
      vehicle_id: vehicle?.id || vehicleId,
      square_booking_id: squareBookingId,
      customer_name: customerName,
      customer_email: customerEmail,
      booking_date: date,
      start_time: time,
      end_time: serviceType === "hourly" ? `${parseInt(time.split(":")[0]) + 4}:00` : time,
      service_type: serviceType,
      service_area: serviceArea,
      pickup_location: pickupLocation || null,
      dropoff_location: dropoffLocation || null,
      total_hours: serviceType === "hourly" ? 4 : 1,
      total_price: vehicle?.four_hour_block_local || 510,
      status: "pending",
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
      end_time: serviceType === "hourly" ? `${parseInt(time.split(":")[0]) + 4}:00` : time,
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
      message: "Booking request received. We'll contact you shortly to confirm.",
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
