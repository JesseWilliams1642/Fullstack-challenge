// Turn a date into a frontend readable date (e.g. 02/11/2000) and time (e.g. 2:30 pm)

export function dateToStrings(timestamp: Date): [string, string] {
	const day: number = timestamp.getDate();
	const month: number = timestamp.getMonth() + 1;
	const year: number = timestamp.getFullYear();
	const dateString: string = `${day}/${month}/${year}`;

	let hour: number = timestamp.getHours();
	const minute: number = timestamp.getMinutes();
	const suffix: string = hour >= 12 ? "PM" : "AM";
	hour = hour % 12; // So 14 --> 2
	hour = hour ? hour : 12; // Changes 0 --> 12

	// Ensures it adds zeroes to the start if its between 0-9
	const minuteFormatted: string = String(minute).padStart(2, "0");
	const timeString: string = `${hour}:${minuteFormatted} ${suffix}`;

	return [dateString, timeString];
}
