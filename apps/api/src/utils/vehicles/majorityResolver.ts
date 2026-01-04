import { VehicleSubmission } from "@generated/prisma/client";
import { FieldConsensus } from "~modules/vehicles/vehicle.model";

function majorityVote<T>(values: (T | null)[]): FieldConsensus<T> {
  const votes = new Map<T, number>();
  let total = 0;

  for (const v of values) {
    if (v === null) continue;
    total++;
    votes.set(v, (votes.get(v) ?? 0) + 1);
  }

  if (votes.size === 0) {
    return { value: null, confidence: 0, votes: 0 };
  }

  let winner: T | null = null;
  let max = 0;

  for (const [value, count] of votes) {
    if (count > max) {
      winner = value;
      max = count;
    }
  }

  return {
    value: winner,
    confidence: max / total,
    votes: max
  };
}

function resolveRequired<T>(
  consensusValue: T | null,
  submissions: VehicleSubmission[],
  field: keyof VehicleSubmission
  ): T {
  if (consensusValue != null) return consensusValue;

  // fallback: most recent active submission
  const fallback = submissions.find(s => s.isActive && s[field] != null);

  if (!fallback) {
    throw new Error(`Cannot resolve required field: ${String(field)}`);
  }

  return fallback[field] as T;
}

function computeOverallConfidence(fields: Record<string, { confidence: number }>) {
  const values = Object.values(fields).map(f => f.confidence);
  if (!values.length) return 0;

  return values.reduce((a, b) => a + b, 0) / values.length;
}


export { majorityVote, resolveRequired, computeOverallConfidence }