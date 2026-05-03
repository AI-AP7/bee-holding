import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  const updates = [
    { slug: "black-stretch-limo", image_url: "/black_stretch.jpg" },
    { slug: "white-stretch-limo", image_url: "/white_stretch.webp" },
    { slug: "escalade-esv", image_url: "/cadilac_esv.jpg" },
    { slug: "escalade-v", image_url: "/cad_v.jpeg" },
    { slug: "mercedes-s-class", image_url: "/s-class.webp" },
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from("vehicles")
      .update({ image_url: update.image_url })
      .eq("slug", update.slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}