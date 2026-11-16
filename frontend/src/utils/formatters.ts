export function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString()}`;
}

export function formatWeight(kg: number, unit: "kg" | "mon" | "tonne" = "kg"): string {
  if (unit === "tonne") return `${(kg / 1000).toFixed(1)} Tonne`;
  if (unit === "mon") return `${(kg / 40).toFixed(1)} Mon`;
  return `${kg.toLocaleString()} kg`;
}

export function formatTimeRemaining(endTime: string): {
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
} {
  const diff = new Date(endTime).getTime() - new Date().getTime();
  if (diff <= 0) {
    return { minutes: 0, seconds: 0, isExpired: true, formatted: "Ended" };
  }
  const totalSec = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return {
    minutes,
    seconds,
    isExpired: false,
    formatted: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
  };
}

