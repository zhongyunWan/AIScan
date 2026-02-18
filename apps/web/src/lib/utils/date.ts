export function toDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function toDateKey(date: Date): string {
  return toDateOnly(date).toISOString().slice(0, 10);
}

export function parseDateInput(input: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return null;
  }

  const date = new Date(`${input}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf())) {
    return null;
  }

  return toDateOnly(date);
}

export function hoursSince(date?: Date | null): number {
  if (!date) {
    return 120;
  }
  return Math.max(0, (Date.now() - date.valueOf()) / (1000 * 60 * 60));
}
