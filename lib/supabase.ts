import { createClient } from "@supabase/supabase-js";

/**
 * Server-side client — uses the service role key, bypasses Row Level Security.
 * Only import this in server code (API routes, server components, n8n calls
 * that hit these values via env). NEVER expose this key to the browser.
 */
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check your .env file."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Browser-safe client — uses the public anon key, respects Row Level Security.
 * Safe to import in client components. Only useful once RLS policies are
 * opened up for specific reads; until then, prefer server-side calls.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(url, anonKey);
}