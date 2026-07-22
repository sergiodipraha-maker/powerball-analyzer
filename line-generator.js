window.PowerballLineGenerator = (() => {
  function randomUnique(max, count) {
    const set = new Set();
    while (set.size < count) set.add(1 + Math.floor(Math.random() * max));
    return [...set].sort((a, b) => a - b);
  }

  function generate(draws, settings = {}) {
    const strategy = settings.strategy || "balanced";
    const lineCount = settings.lineCount || 7;

    if (strategy === "random") {
      return Array.from({ length: lineCount }, () => ({
        main: randomUnique(69, 5),
        powerball: 1 + Math.floor(Math.random() * 26)
      }));
    }

    let poolSize = Number(settings.poolSize || 18);
    if (strategy === "coverage") poolSize = Math.max(poolSize, 21);

    const salt = Math.floor(Math.random() * 1_000_000);
    const mainPool = PowerballCorePool.buildMainPool(draws, poolSize, salt);
    const pbPool = PowerballCorePool.buildPowerballPool(draws, Math.min(10, lineCount + 2), salt);

    const mainLines = PowerballCoverageWheel.createWheel(mainPool, lineCount, settings);
    const pbUsage = new Map();
    const lines = mainLines.map((main, index) => {
      const candidates = [...pbPool].sort((a, b) => {
        const diff = (pbUsage.get(a) || 0) - (pbUsage.get(b) || 0);
        return diff !== 0 ? diff : Math.random() - 0.5;
      });
      const powerball = candidates[index % candidates.length];
      pbUsage.set(powerball, (pbUsage.get(powerball) || 0) + 1);
      return { main, powerball };
    });

    return lines;
  }

  return { generate, randomUnique };
})();
