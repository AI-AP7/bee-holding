import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface AvailabilityRequest {
  vehicleId: string;
  date: string;
}

interface DateRangeRequest {
  vehicleIds: string[];
  startDate: string;
  endDate: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, date } = body as AvailabilityRequest;

    if (!vehicleId || !date) {
      return NextResponse.json(
        { error: "Missing required fields: vehicleId, date" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("check_vehicle_availability", {
      p_vehicle_id: vehicleId,
      p_date: date,
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      availability: data,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleIds = searchParams.get("vehicleIds")?.split(",") || [];
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (vehicleIds.length === 0 || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters: vehicleIds, startDate, endDate" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("availability_blocks")
      .select(`
        *,
        vehicles(name, slug)
      `)
      .in("vehicle_id", vehicleIds)
      .gte("block_date", startDate)
      .lte("block_date", endDate)
      .neq("block_type", "unavailable");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const availabilityMap: Record<string, Record<string, { available: boolean; status: string }>> = {};

    for (const vehicleId of vehicleIds) {
      availabilityMap[vehicleId] = {};
    }

    for (const block of data || []) {
      const dateStr = block.block_date;
      if (!availabilityMap[block.vehicle_id]) {
        availabilityMap[block.vehicle_id] = {};
      }
      availabilityMap[block.vehicle_id][dateStr] = {
        available: false,
        status: block.block_type === "booking" ? "reserved" : block.block_type,
      };
    }

    return NextResponse.json({
      success: true,
      availability: availabilityMap,
      blocks: data,
    });
  } catch (error) {
    console.error("Date range availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
