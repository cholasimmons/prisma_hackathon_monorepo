import leven from 'leven';
import { pickMajority } from './majorityResolver';

const KNOWN_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Mitsubishi',
  'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Audi', 'Tesla',
  'Land Rover', 'Suzuki', 'Peugeot', 'Jaguar', 'Aston Martin', 'Fiat', 'Leyland',
  'MAN', 'Scania', 'Lexus', 'Infiniti', 'Volvo'
] as const;

const MAX_DISTANCE_RATIO = 0.25
// 25% difference allowed; tune this

function normalizeMake(input: string) {
  const raw = input.trim()
  const lower = raw.toLowerCase()

  let bestMatch: string | null = null
  let bestDistance = Infinity

  for (const make of KNOWN_MAKES) {
    const distance = leven(lower, make.toLowerCase())
    if (distance < bestDistance) {
      bestDistance = distance
      bestMatch = make
    }
  }

  if (!bestMatch) {
    return {
      value: raw,
      corrected: false,
      confidence: 0
    }
  }

  const ratio = bestDistance / bestMatch.length

  if (ratio <= MAX_DISTANCE_RATIO) {
    return {
      value: bestMatch,
      corrected: bestMatch !== raw,
      confidence: 1 - ratio
    }
  }

  // Too far-fetched → let it through untouched
  return {
    value: raw,
    corrected: false,
    confidence: 0
  }
}


export { pickMajority, normalizeMake, KNOWN_MAKES }