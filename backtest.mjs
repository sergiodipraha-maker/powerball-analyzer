/**
 * CLI placeholder.
 *
 * The production backtest currently runs in the browser because the engine modules are
 * browser globals. A future version can migrate shared logic to ES modules for identical
 * browser/Node execution.
 */

import fs from "node:fs";

const payload = JSON.parse(
  fs.readFileSync(new URL("../data/powerball-results.json", import.meta.url), "utf8")
);

console.log(`Historical draws available: ${payload.draws.length}`);
console.log("Open index.html through GitHub Pages and use the Backtest section.");
