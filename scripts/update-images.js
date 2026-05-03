import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ydeevwimgccqmsuhjncs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZWV2d2ltZ2NjcW1zdWhqbmNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MjQzOSwiZXhwIjoyMDkxNzQ4NDM5fQ.LqHPpEEcmVLSDf_s_G2rV2NKbLcJhVVgRiibNBkdzsU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateImages() {
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
      console.error(`Error updating ${update.slug}:`, error.message);
    } else {
      console.log(`Updated ${update.slug} to ${update.image_url}`);
    }
  }
}

updateImages();