import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { addHoursToTime, buildSquareStartAt, calculateBasePrice, type BookingServiceType, type FleetVehicle } from "@/lib/limo";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const squareEnvironment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN || "";
const squareLocationId = process.env.SQUARE_LOCATION_ID || "";
const bookingTimeZone = process.env.BOOKING_TIME_ZONE || "America/New_York";

const squareApiBase =
  squareEnvironment === "production"
    ? "https://connect.squareup.com/v2"
    : "https://connect.squareupsandbox.com/v2";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface BookingRequest {
  vehicleId: string;
  date: string;
  time: string;
  hours?: number;
  serviceType: BookingServiceType;
  serviceArea: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  specialRequests?: string;
}

interface SquareCustomer {
  id: string;
}

function validateEnvironment() {
  if (!supabaseUrl || !supabaseServiceKey || !squareAccessToken || !squareLocationId) {
    return "Missing required server environment variables.";
  }

  return null;
}

async function findOrCreateSquareCustomer(input: BookingRequest) {
  const customerSearchResponse = await fetch(`${squareApiBase}/customers/search`, {
    method: "POST",
    headers: {
      "Square-Version": "2024-01-18",
      Authorization: `Bearer ${squareAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        filter: {
          email_address: {
            exact: input.customerEmail,
          },
        },
      },
    }),
  });

  const searchData = (await customerSearchResponse.json()) as { customers?: SquareCustomer[]; errors?: Array<{ detail?: string }> };
  if (!customerSearchResponse.ok) {
    throw new Error(searchData.errors?.[0]?.detail || "Failed to search Square customers.");
  }

  const existingCustomer = searchData.customers?.[0];
  if (existingCustomer) {
    return existingCustomer.id;
  }

  const [givenName, ...familyNameParts] = input.customerName.trim().split(/\s+/);
  const familyName = familyNameParts.join(" ");

  const createCustomerResponse = await fetch(`${squareApiBase}/customers`, {
    method: "POST",
    headers: {
      "Square-Version": "2024-01-18",
      Authorization: `Bearer ${squareAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      given_name: givenName,
      family_name: familyName || undefined,
      email_address: input.customerEmail,
      phone_number: input.customerPhone,
    }),
  });

  const createData = (await createCustomerResponse.json()) as { customer?: SquareCustomer; errors?: Array<{ detail?: string }> };
  if (!createCustomerResponse.ok || !createData.customer?.id) {
    throw new Error(createData.errors?.[0]?.detail || "Failed to create Square customer.");
  }

  return createData.customer.id;
}

export async function POST(request: NextRequest) {
  try {
    const environmentError = validateEnvironment();
    if (environmentError) {
      return NextResponse.json({ error: environmentError }, { status: 500 });
    }

    const body = (await request.json()) as BookingRequest;
    const {
      vehicleId,
      date,
      time,
      hours = 4,
      serviceType,
      serviceArea,
      customerName,
      customerEmail,
      customerPhone,
      pickupLocation,
      dropoffLocation,
      specialRequests,
    } = body;

    if (!vehicleId || !date || !time || !serviceType || !serviceArea || !customerName || !customerEmail || !customerPhone || !pickupLocation) {
      return NextResponse.json({ error: "Missing required booking fields." }, { status: 400 });
    }

    if (serviceType === "point_to_point" && !dropoffLocation) {
      return NextResponse.json({ error: "Dropoff location is required for point-to-point service." }, { status: 400 });
    }

    const { data: vehicleRecord, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId)
      .eq("is_active", true)
      .single();

    const vehicle = vehicleRecord as FleetVehicle | null;

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    if (!vehicle.square_service_variation_id) {
      return NextResponse.json(
        { error: `Vehicle "${vehicle.name}" is missing a Square service mapping.` },
        { status: 409 }
      );
    }

    const squareCustomerId = await findOrCreateSquareCustomer(body);
    const effectiveHours = serviceType === "hourly" ? Math.max(hours, vehicle.min_hours) : 1;
    const startAt = buildSquareStartAt(date, time, bookingTimeZone);

    const bookingResponse = await fetch(`${squareApiBase}/bookings`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        Authorization: `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        booking: {
          customer_id: squareCustomerId,
          location_id: squareLocationId,
          start_at: startAt,
          appointment_segments: [
            {
              service_variation_id: vehicle.square_service_variation_id,
              team_member_id: "PUBLIC",
              duration_minutes: effectiveHours * 60,
              service_note: serviceType === "point_to_point" ? "Point-to-point service" : "Hourly service",
            },
          ],
          customer_note: [
            `Vehicle: ${vehicle.name}`,
            `Area: ${serviceArea}`,
            `Pickup: ${pickupLocation}`,
            dropoffLocation ? `Dropoff: ${dropoffLocation}` : "",
            specialRequests ? `Notes: ${specialRequests}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        },
      }),
    });

    const bookingData = (await bookingResponse.json()) as {
      booking?: { id: string };
      errors?: Array<{ detail?: string }>;
    };
    if (!bookingResponse.ok || !bookingData.booking?.id) {
      return NextResponse.json(
        { error: bookingData.errors?.[0]?.detail || "Square rejected the booking." },
        { status: bookingResponse.status || 502 }
      );
    }

    const bookingRecord = {
      vehicle_id: vehicle.id,
      square_booking_id: bookingData.booking.id,
      square_customer_id: squareCustomerId,
      customer_name: customerName,
      customer_email: customerEmail,
      booking_date: date,
      start_time: `${time}:00`,
      end_time: addHoursToTime(time, effectiveHours),
      service_type: serviceType,
      service_area: serviceArea,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation || null,
      total_hours: effectiveHours,
      total_price: calculateBasePrice(vehicle, serviceType, serviceArea, effectiveHours),
      status: "confirmed",
      notes: specialRequests || null,
    };

    const { data: booking, error: bookingInsertError } = await supabase
      .from("booking_references")
      .insert(bookingRecord)
      .select()
      .single();

    if (bookingInsertError || !booking) {
      console.error("Failed to insert booking reference:", bookingInsertError);
      return NextResponse.json({ error: "Booking was created in Square but could not be saved locally." }, { status: 500 });
    }

    const { error: blockError } = await supabase.from("availability_blocks").insert({
      vehicle_id: vehicle.id,
      block_date: date,
      block_type: "booking",
      square_booking_id: bookingData.booking.id,
      start_time: `${time}:00`,
      end_time: addHoursToTime(time, effectiveHours),
      buffer_minutes: 60,
      notes: specialRequests || null,
    });

    if (blockError) {
      console.error("Failed to insert availability block:", blockError);
      return NextResponse.json({ error: "Booking saved, but availability could not be reserved locally." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking created and ready for payment.",
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

    if (!bookingId) {
      return NextResponse.json({ error: "Missing id parameter." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("booking_references")
      .select("*, vehicles(name)")
      .eq("id", bookingId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
