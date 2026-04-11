const data = require("../prescription_engine_data.json");
const fs = require("fs");
const path = require("path");

const profiles = data.student_profiles;
const prescriptions = data.prescriptions;
const keys = Object.keys(prescriptions).filter((k) => profiles[k]);

function esc(str) {
  return str.replace(/'/g, "''");
}

const sqls = keys.map((k) => {
  const p = esc(JSON.stringify(profiles[k]));
  const w = esc(JSON.stringify(prescriptions[k].workouts));
  const split =
    prescriptions[k].workout_split ||
    Object.keys(prescriptions[k].workouts || {});
  const splitArr =
    "ARRAY[" + split.map((s) => "'" + esc(s) + "'").join(",") + "]::TEXT[]";
  return `INSERT INTO prescription_examples (student_key, student_profile, workouts, workout_split) VALUES ('${esc(k)}', '${p}'::jsonb, '${w}'::jsonb, ${splitArr}) ON CONFLICT (student_key) DO UPDATE SET student_profile = EXCLUDED.student_profile, workouts = EXCLUDED.workouts, workout_split = EXCLUDED.workout_split;`;
});

// Write each to a separate file
sqls.forEach((sql, i) => {
  fs.writeFileSync(
    path.join(__dirname, `import-${i}.sql`),
    sql
  );
});

console.log(`Generated ${sqls.length} individual SQL files.`);
// Also output the keys for reference
keys.forEach((k, i) => console.log(`  ${i}: ${k}`));
