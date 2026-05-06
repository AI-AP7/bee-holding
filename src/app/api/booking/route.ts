import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { addHoursToTime, buildSquareStartAt, calculateBookingTotals, isLikelyExactAddress, normalizeAddress, type BookingServiceType, type FleetVehicle } from "@/lib/limo";
import { getSquareAccessToken, getSupabaseServiceKey } from "@/lib/server-env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = getSupabaseServiceKey();
const squareEnvironment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";
const squareAccessToken = getSquareAccessToken();
const squareLocationId = process.env.SQUARE_LOCATION_ID || "";
const bookingTimeZone = process.env.BOOKING_TIME_ZONE || "America/New_York";

const squareApiBase =
  squareEnvironment === "production"
    ? "https://connect.squareup.com/v2"
    : "https://connect.squareupsandbox.com/v2";

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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

type AvailabilityResult = {
  available?: boolean;
  reason?: string;
  status?: string;
};

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

async function assertVehicleAvailable(vehicleId: string, date: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("check_vehicle_availability", {
    p_vehicle_id: vehicleId,
    p_date: date,
  });

  if (error) {
    console.error("Failed to check availability:", error);
    throw new Error("Availability could not be verified.");
  }

  const availability = data as AvailabilityResult | null;
  if (!availability?.available) {
    return availability?.reason || availability?.status || "Vehicle is not available for the selected date.";
  }

  return null;
}

function publicBookingResponse(booking: Record<string, unknown>) {
  return {
    id: booking.id,
    vehicle_id: booking.vehicle_id,
    square_customer_id: booking.square_customer_id,
    booking_date: booking.booking_date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    service_type: booking.service_type,
    service_area: booking.service_area,
    total_hours: booking.total_hours,
    total_price: booking.total_price,
    status: booking.status,
  };
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
      pickupLocation: rawPickupLocation,
      dropoffLocation: rawDropoffLocation,
      specialRequests,
    } = body;
    const pickupLocation = normalizeAddress(rawPickupLocation);
    const dropoffLocation = normalizeAddress(rawDropoffLocation);

    if (!vehicleId || !date || !time || !serviceType || !serviceArea || !customerName || !customerEmail || !customerPhone || !pickupLocation) {
      return NextResponse.json({ error: "Missing required booking fields." }, { status: 400 });
    }

    if (!isLikelyExactAddress(pickupLocation)) {
      return NextResponse.json(
        { error: "Pickup location must be a full street address with city and state." },
        { status: 400 }
      );
    }

    if (serviceType === "point_to_point" && !dropoffLocation) {
      return NextResponse.json({ error: "Dropoff location is required for point-to-point service." }, { status: 400 });
    }

    if (serviceType === "point_to_point" && !isLikelyExactAddress(dropoffLocation)) {
      return NextResponse.json(
        { error: "Dropoff location must be a full street address with city and state." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
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

    const effectiveHours = serviceType === "hourly" ? Math.max(hours, vehicle.min_hours) : 1;
    const startAt = buildSquareStartAt(date, time, bookingTimeZone);
    const availabilityError = await assertVehicleAvailable(vehicle.id, date);

    if (availabilityError) {
      return NextResponse.json({ error: availabilityError }, { status: 409 });
    }

    const squareCustomerId = await findOrCreateSquareCustomer(body);
    const totalPrice = calculateBookingTotals(vehicle, serviceType, serviceArea, effectiveHours, 0).total;

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
      total_price: totalPrice,
      status: "pending_payment",
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

    return NextResponse.json({
      success: true,
      booking: publicBookingResponse(booking as Record<string, unknown>),
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
    const email = searchParams.get("email");

    if (!bookingId) {
      return NextResponse.json({ error: "Missing id parameter." }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("booking_references")
      .select("id, booking_date, start_time, end_time, service_type, service_area, total_hours, total_price, status, customer_email, vehicles(name)")
      .eq("id", bookingId)
      .eq("customer_email", email)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const safeBooking = { ...(data as Record<string, unknown>) };
    delete safeBooking.customer_email;
    return NextResponse.json({ success: true, booking: safeBooking });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
