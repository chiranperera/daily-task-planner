function normalize(s: string): string {
  return s.toLowerCase().trim()
    .replace(/es$/, '')
    .replace(/s$/, '')
    .replace(/ies$/, 'y')
    .replace(/[^a-z0-9]/g, '');
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function findDuplicates(newName: string, existingNames: string[], excludeId?: string): string | null {
  const norm = normalize(newName);
  for (const existing of existingNames) {
    if (excludeId && existing === excludeId) continue;
    const existNorm = normalize(existing);
    if (existNorm === norm) return existing;
    if (norm.length > 3 && existNorm.length > 3) {
      const dist = levenshtein(norm, existNorm);
      const maxLen = Math.max(norm.length, existNorm.length);
      if (dist / maxLen <= 0.25) return existing;
    }
  }
  return null;
}
