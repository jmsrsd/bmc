// Temperature helpers per TESTING.md §2.1

export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32)
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round(((fahrenheit - 32) * 5) / 9)
}

export function validateSetpoint(value: number): { valid: boolean; error?: string } {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: 'Must be a number' }
  }
  if (value < 16) return { valid: false, error: 'Below minimum 16°C' }
  if (value > 30) return { valid: false, error: 'Above maximum 30°C' }
  return { valid: true }
}
