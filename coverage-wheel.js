window.PowerballCoverageWheel = (() => {
  function countConsecutive(numbers) {
    let count = 0;
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === numbers[i - 1] + 1) count++;
    }
    return count;
  }

  function lineScore(candidate, existingLines, options = {}) {
    const sorted = [...candidate].sort((a, b) => a - b);
    const odd = sorted.filter(n => n % 2).length;
    const low = sorted.filter(n => n <= 34).length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const consecutive = countConsecutive(sorted);

    let score = 100;
    if (options.balanceOddEven !== false) score -= Math.abs(odd - 2.5) * 7;
    score -= Math.abs(low - 2.5) * 5;
    score -= Math.abs(sum - 175) * 0.12;
    if (options.avoidConsecutive !== false) score -= consecutive * 8;

    existingLines.forEach(line => {
      const overlap = candidate.filter(n => line.includes(n)).length;
      score -= overlap * overlap * 4;
    });

    return score;
  }

  function chooseBest(pool, existingLines, usage, options) {
    let best = null;
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < 400; attempt++) {
      const weighted = [...pool].sort((a, b) => {
        const ua = usage.get(a) || 0;
        const ub = usage.get(b) || 0;
        if (ua !== ub) return ua - ub;
        return Math.random() - 0.5;
      });

      const candidate = weighted.slice(0, 5).sort((a, b) => a - b);
      const score = lineScore(candidate, existingLines, options) + Math.random() * 5;
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    return best;
  }

  function createWheel(mainPool, lineCount = 7, options = {}) {
    const lines = [];
    const usage = new Map(mainPool.map(n => [n, 0]));

    for (let i = 0; i < lineCount; i++) {
      const line = chooseBest(mainPool, lines, usage, options);
      line.forEach(n => usage.set(n, (usage.get(n) || 0) + 1));
      lines.push(line);
    }

    return lines;
  }

  function summarize(lines) {
    const flat = lines.flat();
    const unique = new Set(flat);
    const counts = new Map();
    flat.forEach(n => counts.set(n, (counts.get(n) || 0) + 1));

    let pairRepeats = 0;
    const pairCounts = new Map();
    lines.forEach(line => {
      for (let i = 0; i < line.length; i++) {
        for (let j = i + 1; j < line.length; j++) {
          const key = `${line[i]}-${line[j]}`;
          pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
        }
      }
    });
    pairCounts.forEach(value => { if (value > 1) pairRepeats += value - 1; });

    const odd = flat.filter(n => n % 2).length;
    const low = flat.filter(n => n <= 34).length;

    return {
      uniqueMain: unique.size,
      totalSlots: flat.length,
      pairRepeats,
      oddPercent: Math.round((odd / flat.length) * 100),
      lowPercent: Math.round((low / flat.length) * 100),
      maxUsage: Math.max(...counts.values())
    };
  }

  return { createWheel, summarize, lineScore };
})();
