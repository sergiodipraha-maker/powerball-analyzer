window.PowerballCorePool = (() => {
  const MAIN_MAX = 69;
  const PB_MAX = 26;

  function buildStats(draws, key, maxNumber) {
    const stats = Array.from({ length: maxNumber }, (_, i) => ({
      number: i + 1,
      count: 0,
      lastSeenIndex: Number.POSITIVE_INFINITY,
      weighted: 0
    }));

    draws.forEach((draw, index) => {
      const values = key === "main" ? draw.main : [draw.powerball];
      values.forEach((number) => {
        const item = stats[number - 1];
        if (!item) return;
        item.count += 1;
        if (item.lastSeenIndex === Number.POSITIVE_INFINITY) item.lastSeenIndex = index;
        item.weighted += Math.exp(-index / 35);
      });
    });

    const maxCount = Math.max(1, ...stats.map(x => x.count));
    const maxWeighted = Math.max(1, ...stats.map(x => x.weighted));

    return stats.map(item => ({
      ...item,
      frequencyScore: item.count / maxCount,
      recencyScore: item.lastSeenIndex === Number.POSITIVE_INFINITY
        ? 0
        : Math.exp(-item.lastSeenIndex / 25),
      weightedScore: item.weighted / maxWeighted
    }));
  }

  function deterministicJitter(number, salt = 0) {
    const x = Math.sin(number * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function rank(stats, salt = 0) {
    return stats
      .map(item => ({
        ...item,
        score:
          item.frequencyScore * 0.35 +
          item.recencyScore * 0.25 +
          item.weightedScore * 0.30 +
          deterministicJitter(item.number, salt) * 0.10
      }))
      .sort((a, b) => b.score - a.score);
  }

  function buildMainPool(draws, size = 18, salt = Date.now() % 10000) {
    if (!Array.isArray(draws) || draws.length < 10) {
      return shuffle(Array.from({ length: MAIN_MAX }, (_, i) => i + 1))
        .slice(0, size)
        .sort((a, b) => a - b);
    }
    return rank(buildStats(draws, "main", MAIN_MAX), salt)
      .slice(0, size)
      .map(x => x.number)
      .sort((a, b) => a - b);
  }

  function buildPowerballPool(draws, size = 8, salt = Date.now() % 10000) {
    if (!Array.isArray(draws) || draws.length < 10) {
      return shuffle(Array.from({ length: PB_MAX }, (_, i) => i + 1))
        .slice(0, size);
    }
    return rank(buildStats(draws, "powerball", PB_MAX), salt + 17)
      .slice(0, size)
      .map(x => x.number);
  }

  function shuffle(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  return { buildMainPool, buildPowerballPool, buildStats, shuffle };
})();
