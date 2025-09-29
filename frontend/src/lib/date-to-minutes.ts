// Utility function to extract minutes from a PostgresInterval object

interface PostgresInterval {
	years: number;
	months: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

export function durationToMinutes(duration: unknown): number {
	const objectDuration = duration as PostgresInterval;

    const minutes: number = (objectDuration.minutes ?? 0) + (objectDuration.hours ?? 0) * 60;

    return minutes;
}
