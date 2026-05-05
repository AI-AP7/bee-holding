import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN || "";
const squareEnv = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || "sandbox";

const squareApiBase = squareEnv === "production"
  ? "https://connect.squareup.com/v2"
  : "https://connect.squareupsandbox.com/v2";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type SquareCatalogObject = {
  appointments_service_data?: {
    name?: string;
    service_variation_id?: string;
  };
  item_data?: {
    variations?: Array<{
      id: string;
      item_variation_data?: {
        name?: string;
      };
    }>;
  };
};

type SquareServiceMatch = {
  name: string;
  id: string;
};

async function syncSquareServices() {
  console.log("🚀 Starting Square to Supabase sync...");

  try {
    // 1. Fetch Square Catalog (Services)
    console.log("📦 Fetching Square services...");
    const squareResponse = await fetch(`${squareApiBase}/catalog/list?types=APPOINTMENTS_SERVICE`, {
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
      },
    });

    const squareData = (await squareResponse.json()) as { objects?: SquareCatalogObject[] };
    if (!squareData.objects) {
      console.log("❌ No services found in Square.");
      return;
    }

    // Map Square services by name
    const squareServices = squareData.objects.flatMap((obj): SquareServiceMatch[] => {
      const name = obj.appointments_service_data?.name;
      if (!name) {
        return [];
      }

      const serviceVariationId = obj.appointments_service_data?.service_variation_id;

      return obj.item_data?.variations?.map((variation) => ({
        name: `${name} - ${variation.item_variation_data?.name || "Default"}`,
        id: variation.id,
      })) || (serviceVariationId ? [{ name, id: serviceVariationId }] : []);
    });

    console.log(`✅ Found ${squareServices.length} service variations in Square.`);

    // 2. Fetch Supabase Vehicles
    const { data: vehicles, error: vError } = await supabase
      .from("vehicles")
      .select("id, name");

    if (vError) throw vError;
    console.log(`✅ Found ${vehicles?.length} vehicles in Supabase.`);

    // 3. Match and Update
    for (const vehicle of vehicles || []) {
      const match = squareServices.find((s) => s.name.toLowerCase() === vehicle.name.toLowerCase());

      if (match) {
        console.log(`🔄 Matching vehicle "${vehicle.name}" with Square service "${match.name}"...`);
        const { error: uError } = await supabase
          .from("vehicles")
          .update({ square_service_variation_id: match.id })
          .eq("id", vehicle.id);

        if (uError) {
          console.error(`❌ Failed to update ${vehicle.name}:`, uError.message);
        } else {
          console.log(`✨ Updated ${vehicle.name} with ID: ${match.id}`);
        }
      } else {
        console.log(`⚠️ No match found for vehicle: ${vehicle.name}`);
      }
    }

    console.log("🏁 Sync complete.");
  } catch (error) {
    console.error("💥 Sync failed:", error);
  }
}

syncSquareServices();
