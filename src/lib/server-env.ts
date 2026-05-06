export function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
}

export function getSquareAccessToken() {
  return process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_KEY || "";
}
