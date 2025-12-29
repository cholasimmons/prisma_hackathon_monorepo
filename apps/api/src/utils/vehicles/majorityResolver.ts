function pickMajority<T extends string | number | boolean>(
  values: (T | null | undefined)[]
): { value: T | null; count: number } {
  const counts = new Map<T, number>()

  for (const v of values) {
    if (v == null) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }

  let winner: T | null = null
  let max = 0

  for (const [value, count] of counts) {
    if (count > max) {
      max = count
      winner = value
    }
  }

  return { value: winner, count: max }
}

export { pickMajority }