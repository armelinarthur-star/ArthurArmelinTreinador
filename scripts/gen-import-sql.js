const data = require("../prescription_engine_data.json");
const fs = require("fs");
const path = require("path");

const profiles = data.student_profiles;
const prescriptions = data.prescriptions;
const keys = Object.keys(prescriptions).filter((k) => profiles[k]);

function esc(str) {
  return str.replace(/'/g, "''");
}

const values = keys
  .map((k) => {
    const p = esc(JSON.stringify(profiles[k]));
    const w = esc(JSON.stringify(prescriptions[k].workouts));
    const split = prescriptions[k].workout_split || Object.keys(prescriptions[k].workouts || {});
    const splitArr =
      "ARRAY[" +
      split.map((s) => "'" + esc(s) + "'").join(",") +
      "]::TEXT[]";
    return `('${esc(k)}', '${p}'::jsonb, '${w}'::jsonb, ${splitArr})`;
  })
  .join(",\n");

const sql = `INSERT INTO prescription_examples (student_key, student_profile, workouts, workout_split) VALUES
${values}
ON CONFLICT (student_key) DO UPDATE SET student_profile = EXCLUDED.student_profile, workouts = EXCLUDED.workouts, workout_split = EXCLUDED.workout_split;`;

fs.writeFileSync(path.join(__dirname, "import-sql.sql"), sql);
console.log(`SQL written (${sql.length} chars, ${keys.length} rows)`);
