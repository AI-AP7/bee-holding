import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Vehicle = {
  id: string;
  name: string;
  slug: string;
  type: "stretch_limo" | "suv" | "sedan";
  description: string | null;
  capacity: number;
  luggage_capacity: number;
  hourly_rate_local: number;
  hourly_rate_distance: number;
  four_hour_block_local: number | null;
  four_hour_block_distance: number | null;
  image_url: string | null;
  features: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceArea = {
  id: string;
  state_code: string;
  state_name: string;
  county: string | null;
  base_fee: number;
  is_active: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  vehicle_id: string | null;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  source: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
};

export type AvailabilityStatus = {
  available: boolean;
  vehicle: string;
  status: "ready" | "reserved" | "unavailable";
  reason?: string;
};

export async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getVehicleBySlug(
  slug: string
): Promise<Vehicle | null> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
}

export async function getServiceAreas(): Promise<ServiceArea[]> {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*")
    .eq("is_active", true)
    .order("base_fee", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getReviews(
  featured: boolean = false,
  limit: number = 10
): Promise<Review[]> {
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (featured) {
    query = query.eq("is_featured", true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function checkAvailability(
  vehicleId: string,
  date: string
): Promise<AvailabilityStatus> {
  const { data, error } = await supabase.rpc("check_vehicle_availability", {
    p_vehicle_id: vehicleId,
    p_date: date,
  });

  if (error) {
    return { available: false, vehicle: "", status: "unavailable", reason: error.message };
  }

  return data;
}

export async function getAvailabilityForDateRange(
  vehicleIds: string[],
  startDate: string,
  endDate: string
): Promise<Record<string, Record<string, AvailabilityStatus>>> {
  const results: Record<string, Record<string, AvailabilityStatus>> = {};

  const { data, error } = await supabase
    .from("availability_blocks")
    .select("*, vehicles(name)")
    .in("vehicle_id", vehicleIds)
    .gte("block_date", startDate)
    .lte("block_date", endDate)
    .neq("block_type", "unavailable");

  if (error) throw error;

  // Initialize all vehicles as available for all dates in range
  for (const vehicleId of vehicleIds) {
    results[vehicleId] = {};
  }

  // Mark unavailable dates
  if (data) {
    for (const block of data) {
      const dateStr = block.block_date;
      if (!results[block.vehicle_id]) {
        results[block.vehicle_id] = {};
      }
      results[block.vehicle_id][dateStr] = {
        available: false,
        vehicle: block.vehicles?.name || "",
        status: block.block_type === "booking" ? "reserved" : "unavailable",
      };
    }
  }

  return results;
}
