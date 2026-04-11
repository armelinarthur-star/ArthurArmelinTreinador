/**
 * Import prescription_engine_data.json into Supabase prescription_examples table.
 *
 * Usage: node scripts/import-prescriptions.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, "../prescription_engine_data.json");
const data = JSON.parse(readFileSync(dataPath, "utf-8"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const profiles = data.student_profiles;
const prescriptions = data.prescriptions;

// Only import students that have both a profile AND a prescription
const studentKeys = Object.keys(prescriptions).filter(
  (key) => profiles[key]
);

console.log(`Found ${studentKeys.length} students with prescriptions to import.\n`);

let successCount = 0;

for (const key of studentKeys) {
  const profile = profiles[key];
  const prescription = prescriptions[key];

  const row = {
    student_key: key,
    student_profile: profile,
    workouts: prescription.workouts,
    workout_split: prescription.workout_split,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/prescription_examples`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(row),
  });

  if (res.ok) {
    console.log(`  ✓ ${key} (${profile.name})`);
    successCount++;
  } else {
    const err = await res.text();
    console.error(`  ✗ ${key}: ${err}`);
  }
}

console.log(`\nDone: ${successCount}/${studentKeys.length} imported.`);
