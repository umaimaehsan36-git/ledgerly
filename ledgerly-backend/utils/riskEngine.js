async function calculateRisk(Transaction, accountId, { amount, type, category }) {
  let score = 0;
  const reasons = [];

  if (type !== 'expense') {
    return { score: 0, reasons: [] };
  }

  const pastExpenses = await Transaction.find({ accountId, type: 'expense' });

  if (pastExpenses.length >= 3) {
    const avg = pastExpenses.reduce((sum, t) => sum + t.amount, 0) / pastExpenses.length;
    const ratio = amount / avg;
    if (ratio > 3) {
      const points = Math.min(40, Math.round(ratio * 5));
      score += points;
      reasons.push(`Amount is ${ratio.toFixed(1)}x your average expense (+${points})`);
    }
  }

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentCount = await Transaction.countDocuments({ accountId, createdAt: { $gte: oneMinuteAgo } });
  if (recentCount >= 3) {
    const points = Math.min(30, recentCount * 8);
    score += points;
    reasons.push(`${recentCount} transactions in under a minute (+${points})`);
  }

  const categoryCount = pastExpenses.filter(t => t.category === category).length;
  if (pastExpenses.length >= 5 && categoryCount === 0) {
    score += 15;
    reasons.push(`First-ever transaction in "${category}" category (+15)`);
  }

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    score += 15;
    reasons.push(`Transaction made during unusual hours (12am-5am) (+15)`);
  }

  score = Math.min(100, score);
  return { score, reasons };
}

module.exports = calculateRisk;