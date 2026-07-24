import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
  );
}

console.log(
  "Supabase URL:",
  supabaseUrl
);

console.log(
  "Supabase key exists:",
  !!supabaseAnonKey
);

export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  );