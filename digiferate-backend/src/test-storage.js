import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const { data, error } = await supabase.storage.listBuckets();

if (error) {
  console.error("Supabase Storage connection failed:", error.message);
  process.exit(1);
}

console.log("Supabase Storage connected successfully!");
console.log("Available buckets:", data.map((bucket) => bucket.name));