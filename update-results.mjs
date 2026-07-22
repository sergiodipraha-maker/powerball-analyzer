/**
 * Powerball results updater.
 *
 * This starter intentionally does not scrape an undocumented endpoint.
 * Add an official/authorised JSON or CSV source in POWERBALL_RESULTS_URL.
 *
 * Expected remote JSON:
 * {
 *   "draws": [
 *     {"date":"2026-07-22","main":[1,2,3,4,5],"powerball":6}
 *   ]
 * }
 */

import fs from "node:fs";

const target = new URL("../data/powerball-results.json", import.meta.url);
const sourceUrl = process.env.POWERBALL_RESULTS_URL;

if (!sourceUrl) {
  console.log("POWERBALL_RESULTS_URL is not configured; keeping existing historical file.");
  process.exit(0);
}

const response = await fetch(sourceUrl, {
  headers: { "user-agent": "powerball-analyzer/1.0" }
});
if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);

const remote = await response.json();
if (!Array.isArray(remote.draws)) throw new Error("Remote payload must contain a draws array");

const current = JSON.parse(fs.readFileSync(target, "utf8"));
const merged = new Map();

for (const draw of [...(current.draws || []), ...remote.draws]) {
  merged.set(draw.date, {
    date: draw.date,
    main: [...draw.main].map(Number).sort((a, b) => a - b),
    powerball: Number(draw.powerball)
  });
}

current.draws = [...merged.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
current.last_updated = new Date().toISOString();
fs.writeFileSync(target, JSON.stringify(current, null, 2) + "\n");
console.log(`Stored ${current.draws.length} draws.`);
