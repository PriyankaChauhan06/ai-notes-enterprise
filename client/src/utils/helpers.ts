export function formatTokens(tokens: number) {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }

  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }

  return tokens.toString();
}

export function formatCost(cost: number) {
  return `$${cost.toFixed(4)}`;
}
