const SPIN_KEY = 'deliciosa_has_spun';
const SPIN_RESULT_KEY = 'deliciosa_spin_result';

export function hasSpunBefore(): boolean {
  return localStorage.getItem(SPIN_KEY) === 'true';
}

export function markAsSpun(): void {
  localStorage.setItem(SPIN_KEY, 'true');
}

export function getSavedSpinResult(): string | null {
  return localStorage.getItem(SPIN_RESULT_KEY);
}

export function clearSpinData(): void {
  localStorage.removeItem(SPIN_KEY);
  localStorage.removeItem(SPIN_RESULT_KEY);
}
