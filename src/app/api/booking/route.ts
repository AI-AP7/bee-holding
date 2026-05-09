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
const tomtomApiKey = process.env.TOMTOM_API_KEY || "";

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
  addOnsTotal?: number;
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

type TomTomSearchResponse = {
  status: string;
  results?: Array<{
    position?: {
      lat: number;
      lon: number;
    };
  }>;
};

type TomTomRouteResponse = {
  routes?: Array<{
    summary?: {
      lengthInMeters?: number;
    };
  }>;
};

type SquareCatalogObjectResponse = {
  object?: {
    version?: number;
  };
  errors?: Array<{ detail?: string }>;
};

function validateEnvironment() {
  if (!supabaseUrl || !supabaseServiceKey || !squareAccessToken || !squareLocationId) {
    return "Missing required server environment variables.";
  }

  if (!tomtomApiKey) {
    return "Missing TomTom API key for mileage calculation.";
  }

  return null;
}

async function calculateDrivingMiles(origin: string, destination: string) {
  const [originPosition, destinationPosition] = await Promise.all([
    geocodeAddress(origin),
    geocodeAddress(destination),
  ]);
  const routeLocations = `${originPosition.lat},${originPosition.lon}:${destinationPosition.lat},${destinationPosition.lon}`;
  const url = new URL(`https://api.tomtom.com/routing/1/calculateRoute/${routeLocations}/json`);
  url.searchParams.set("key", tomtomApiKey);
  url.searchParams.set("routeRepresentation", "summaryOnly");
  url.searchParams.set("travelMode", "car");

  const response = await fetch(url);
  const data = (await response.json()) as TomTomRouteResponse;

  if (!response.ok) {
    throw new Error("Mileage could not be calculated.");
  }

  const lengthInMeters = data.routes?.[0]?.summary?.lengthInMeters;
  if (!lengthInMeters) {
    throw new Error("Mileage could not be calculated for those addresses.");
  }

  return lengthInMeters / 1609.344;
}

async function geocodeAddress(address: string) {
  const url = new URL(`https://api.tomtom.com/search/2/search/${encodeURIComponent(address)}.json`);
  url.searchParams.set("key", tomtomApiKey);
  url.searchParams.set("countrySet", "US");
  url.searchParams.set("limit", "1");

  const response = await fetch(url);
  const data = (await response.json()) as TomTomSearchResponse;

  if (!response.ok) {
    throw new Error("Address lookup failed.");
  }

  const position = data.results?.[0]?.position;
  if (!position) {
    throw new Error("Address could not be found.");
  }

  return position;
}

async function getSquareServiceVariationVersion(serviceVariationId: string) {
  const response = await fetch(`${squareApiBase}/catalog/object/${serviceVariationId}`, {
    headers: {
      "Square-Version": "2024-01-18",
      Authorization: `Bearer ${squareAccessToken}`,
      "Content-Type": "application/json",
    },
  });
  const data = (await response.json()) as SquareCatalogObjectResponse;

  if (!response.ok || !data.object?.version) {
    throw new Error(data.errors?.[0]?.detail || "Square service variation version could not be found.");
  }

  return data.object.version;
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
      addOnsTotal: rawAddOnsTotal = 0,
      specialRequests,
    } = body;
    const pickupLocation = normalizeAddress(rawPickupLocation);
    const dropoffLocation = normalizeAddress(rawDropoffLocation);
    const addOnsTotal = Number(rawAddOnsTotal);

    if (!vehicleId || !date || !time || !serviceType || !serviceArea || !customerName || !customerEmail || !customerPhone || !pickupLocation) {
      return NextResponse.json({ error: "Missing required booking fields." }, { status: 400 });
    }

    if (!isLikelyExactAddress(pickupLocation)) {
      return NextResponse.json(
        { error: "Pickup location must be a full street address with city and state." },
        { status: 400 }
      );
    }

    if (!dropoffLocation) {
      return NextResponse.json({ error: "Destination address is required." }, { status: 400 });
    }

    if (!isLikelyExactAddress(dropoffLocation)) {
      return NextResponse.json(
        { error: "Dropoff location must be a full street address with city and state." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(addOnsTotal) || addOnsTotal < 0) {
      return NextResponse.json({ error: "Add-ons total is invalid." }, { status: 400 });
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
    const destinationMiles = await calculateDrivingMiles(pickupLocation, dropoffLocation);
    const serviceVariationVersion = await getSquareServiceVariationVersion(vehicle.square_service_variation_id);
    const totals = calculateBookingTotals(
      vehicle,
      serviceType,
      serviceArea,
      effectiveHours,
      addOnsTotal,
      destinationMiles
    );
    const totalPrice = totals.total;

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
              service_variation_version: serviceVariationVersion,
              team_member_id: "PUBLIC",
              duration_minutes: effectiveHours * 60,
            },
          ],
          customer_note: [
            `Vehicle: ${vehicle.name}`,
            `Service: ${serviceType === "point_to_point" ? "Point-to-point service" : "Hourly service"}`,
            `Area: ${serviceArea}`,
            `Pickup: ${pickupLocation}`,
            dropoffLocation ? `Dropoff: ${dropoffLocation}` : "",
            `Destination miles: ${destinationMiles.toFixed(1)}`,
            totals.destinationMileageFee > 0 ? `Destination mileage fee: $${totals.destinationMileageFee.toFixed(2)}` : "",
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
        { error: bookingData.errors?.map((error) => error.detail).filter(Boolean).join(" ") || "Square rejected the booking." },
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
      notes: [
        `Destination miles: ${destinationMiles.toFixed(1)}`,
        totals.destinationMileageFee > 0 ? `Destination mileage fee: $${totals.destinationMileageFee.toFixed(2)}` : "",
        addOnsTotal > 0 ? `Add-ons total: $${addOnsTotal.toFixed(2)}` : "",
        specialRequests || "",
      ]
        .filter(Boolean)
        .join("\n") || null,
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
