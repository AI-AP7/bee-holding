import LimoPageClient from "@/components/limo/LimoPageClient";
import { getVehicles } from "@/lib/supabase";

export default async function LimoPage() {
  const vehicles = await getVehicles();

  return <LimoPageClient vehicles={vehicles} />;
}
