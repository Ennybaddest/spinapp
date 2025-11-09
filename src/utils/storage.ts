const SPIN_KEY = 'deliciosa_has_spun';

export function hasSpunBefore(): boolean {
  return localStorage.getItem(SPIN_KEY) === 'true';
}

export function markAsSpun(): void {
  localStorage.setItem(SPIN_KEY, 'true');
}
