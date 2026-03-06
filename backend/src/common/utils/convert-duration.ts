import { PostgresInterval } from "../types";

// Utility function to convert PostgresInterval values to milliseconds

export function durationToMilliseconds(duration: PostgresInterval): number {

	const MS_PER_SECOND = 1000;
	const MS_PER_MINUTE = MS_PER_SECOND * 60;
	const MS_PER_HOUR = MS_PER_MINUTE * 60;
	const MS_PER_DAY = MS_PER_HOUR * 24;
	const MS_PER_MONTH = MS_PER_DAY * 30.44;
	const MS_PER_YEAR = MS_PER_DAY * 365.25;

	const newDuration: number =
		(duration.seconds ?? 0) * MS_PER_SECOND +
		(duration.minutes ?? 0) * MS_PER_MINUTE +
		(duration.hours ?? 0) * MS_PER_HOUR +
		(duration.days ?? 0) * MS_PER_DAY +
		(duration.months ?? 0) * MS_PER_MONTH +
		(duration.years ?? 0) * MS_PER_YEAR;

	return newDuration;
}
