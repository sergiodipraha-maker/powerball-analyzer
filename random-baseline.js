window.PowerballRandomBaseline = (() => {
  function matchScore(line, draw) {
    const mainMatches = line.main.filter(n => draw.main.includes(n)).length;
    const pbMatch = line.powerball === draw.powerball;
    return { mainMatches, pbMatch };
  }

  function scoreSet(lines, draw) {
    const matches = lines.map(line => matchScore(line, draw));
    return {
      bestMain: Math.max(...matches.map(x => x.mainMatches)),
      anyPowerball: matches.some(x => x.pbMatch),
      match2Plus: matches.filter(x => x.mainMatches >= 2).length,
      match3Plus: matches.filter(x => x.mainMatches >= 3).length,
      weighted:
        matches.reduce((sum, x) =>
          sum + Math.pow(x.mainMatches, 2) + (x.pbMatch ? 1.5 : 0), 0)
    };
  }

  function aggregate(items) {
    const total = Math.max(1, items.length);
    return {
      draws: items.length,
      avgWeighted: items.reduce((a, x) => a + x.weighted, 0) / total,
      avgBestMain: items.reduce((a, x) => a + x.bestMain, 0) / total,
      powerballRate: items.filter(x => x.anyPowerball).length / total,
      match3Rate: items.filter(x => x.match3Plus > 0).length / total
    };
  }

  function backtest(draws, simulations = 250, warmup = 30) {
    if (!Array.isArray(draws) || draws.length <= warmup) {
      throw new Error(`At least ${warmup + 1} historical draws are required.`);
    }

    const chronological = [...draws].sort((a, b) => new Date(a.date) - new Date(b.date));
    const engineScores = [];
    const baselineRuns = Array.from({ length: simulations }, () => []);

    for (let i = warmup; i < chronological.length; i++) {
      const prior = chronological.slice(0, i).reverse();
      const target = chronological[i];

      const engineLines = PowerballLineGenerator.generate(prior, {
        strategy: "balanced",
        poolSize: 18,
        lineCount: 7,
        avoidConsecutive: true,
        balanceOddEven: true
      });
      engineScores.push(scoreSet(engineLines, target));

      for (let s = 0; s < simulations; s++) {
        const randomLines = PowerballLineGenerator.generate([], {
          strategy: "random",
          lineCount: 7
        });
        baselineRuns[s].push(scoreSet(randomLines, target));
      }
    }

    const engine = aggregate(engineScores);
    const baselineAggregates = baselineRuns.map(aggregate);

    const baseline = {
      draws: engine.draws,
      avgWeighted: baselineAggregates.reduce((a, x) => a + x.avgWeighted, 0) / simulations,
      avgBestMain: baselineAggregates.reduce((a, x) => a + x.avgBestMain, 0) / simulations,
      powerballRate: baselineAggregates.reduce((a, x) => a + x.powerballRate, 0) / simulations,
      match3Rate: baselineAggregates.reduce((a, x) => a + x.match3Rate, 0) / simulations
    };

    return { engine, baseline, simulations, warmup };
  }

  return { matchScore, scoreSet, backtest };
})();
