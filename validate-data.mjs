import fs from "node:fs";

const file = new URL("../data/powerball-results.json", import.meta.url);
const payload = JSON.parse(fs.readFileSync(file, "utf8"));

if (!Array.isArray(payload.draws)) throw new Error("draws must be an array");

const seenDates = new Set();

for (const draw of payload.draws) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draw.date)) {
    throw new Error(`Invalid date: ${draw.date}`);
  }
  if (seenDates.has(draw.date)) throw new Error(`Duplicate date: ${draw.date}`);
  seenDates.add(draw.date);

  if (!Array.isArray(draw.main) || draw.main.length !== 5) {
    throw new Error(`Draw ${draw.date}: exactly five main numbers required`);
  }

  const unique = new Set(draw.main);
  if (unique.size !== 5) throw new Error(`Draw ${draw.date}: duplicate main number`);
  if (draw.main.some(n => !Number.isInteger(n) || n < 1 || n > 69)) {
    throw new Error(`Draw ${draw.date}: main number outside 1-69`);
  }

  if (!Number.isInteger(draw.powerball) || draw.powerball < 1 || draw.powerball > 26) {
    throw new Error(`Draw ${draw.date}: Powerball outside 1-26`);
  }
}

console.log(`Validated ${payload.draws.length} draws.`);
