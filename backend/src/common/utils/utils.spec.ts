import {
	durationToMilliseconds,
	dateToStrings,
	hashPassword,
	comparePassword,
} from "./";

describe("Utility Functions", () => {
	describe("durationToMilliseconds", () => {
		it("should convert seconds correctly", () => {
			const testDuration = {
				seconds: 10,
			};

			let durationMs = durationToMilliseconds(testDuration);
			expect(typeof durationMs).toEqual("number");
			expect(durationMs).toEqual(testDuration.seconds * 1000);
		});

		it("should convert minutes correctly", () => {
			const testDuration = {
				minutes: 10,
			};

			let durationMs = durationToMilliseconds(testDuration);
			expect(typeof durationMs).toEqual("number");
			expect(durationMs).toEqual(testDuration.minutes * 1000 * 60);
		});

		it("should convert hours correctly", () => {
			const testDuration = {
				hours: 10,
			};

			let durationMs = durationToMilliseconds(testDuration);
			expect(typeof durationMs).toEqual("number");
			expect(durationMs).toEqual(testDuration.hours * 1000 * 60 * 60);
		});

		it("should convert days correctly", () => {
			const testDuration = {
				days: 10,
			};

			let durationMs = durationToMilliseconds(testDuration);
			expect(typeof durationMs).toEqual("number");
			expect(durationMs).toEqual(testDuration.days * 1000 * 60 * 60 * 24);
		});

		it("should convert months correctly", () => {
			const testDuration = {
				months: 10,
			};

			let durationMs = durationToMilliseconds(testDuration);
			expect(typeof durationMs).toEqual("number");
			expect(durationMs).toEqual(testDuration.months * 1000 * 60 * 60 * 24 * 30.44);
		});

		it("should convert years correctly", () => {
			const testDuration = {
				years: 10,
			};

			let durationMs = durationToMilliseconds(testDuration);
			expect(typeof durationMs).toEqual("number");
			expect(durationMs).toEqual(testDuration.years * 1000 * 60 * 60 * 24 * 365.25);
		});

		it("should convert complex durations correctly", () => {
			const testDuration = {
				seconds: 30,
				minutes: 2,
				hours: 5,
				days: 15,
				months: 4,
				years: 3,
			};

			let durationMs = durationToMilliseconds(testDuration);
			expect(typeof durationMs).toEqual("number");
			expect(durationMs).toEqual(
				testDuration.seconds 	* 1000 +
				testDuration.minutes 	* 1000 * 60 +
				testDuration.hours 		* 1000 * 60 * 60 +
				testDuration.days 		* 1000 * 60 * 60 * 24 +
				testDuration.months 	* 1000 * 60 * 60 * 24 * 30.44 +
				testDuration.years 		* 1000 * 60 * 60 * 24 * 365.25
			);
		});
	});

	describe("dateToStrings", () => {
		it("should convert a date to a day/month/year string correctly", () => {
			const date = new Date(2026, 2, 25);

			const [dateString, timeString] = dateToStrings(date);
			expect(typeof dateString).toEqual("string");
			expect(dateString).toEqual("25/03/2026");
		});

		it("should convert datetime to an AM time string correctly", () => {
			const date = new Date(2000, 7, 13, 9, 44);

			const [dateString, timeString] = dateToStrings(date);
			expect(typeof dateString).toEqual("string");
			expect(dateString).toEqual("13/08/2000");

			expect(typeof timeString).toEqual("string");
			expect(timeString).toEqual("9:44 AM");
		});

		it("should convert datetime to an PM time string correctly", () => {
			const date = new Date(1991, 11, 23, 15, 2);

			const [dateString, timeString] = dateToStrings(date);
			expect(typeof dateString).toEqual("string");
			expect(dateString).toEqual("23/12/1991");

			expect(typeof timeString).toEqual("string");
			expect(timeString).toEqual("3:02 PM");
		});

		it("should handle midnight correctly", () => {
			const date = new Date(2011, 5, 1, 0, 42);

			const [dateString, timeString] = dateToStrings(date);
			expect(typeof dateString).toEqual("string");
			expect(dateString).toEqual("01/06/2011");

			expect(typeof timeString).toEqual("string");
			expect(timeString).toEqual("12:42 AM");
		});

		it("should handle midday correctly", () => {
			const date = new Date(2100, 0, 19, 12, 4);

			const [dateString, timeString] = dateToStrings(date);
			expect(typeof dateString).toEqual("string");
			expect(dateString).toEqual("19/01/2100");

			expect(typeof timeString).toEqual("string");
			expect(timeString).toEqual("12:04 PM");
		});
	});

	describe("Hash Functions", () => {
		const string1 = "lasfjkl87932nfojhsrr23hfa";
		const string2 = "bpoij0923unvdsoihf0283t3g";

		it("should have an expected hash format", async () => {
			process.env.SALT_ROUNDS = "5";
			const hash = await hashPassword(string1);
			expect(typeof hash).toEqual("string");
			expect(hash.length).toEqual(60);
		});

		it("should be different hashes due to different salts", async () => {
			process.env.SALT_ROUNDS = "5";
			const hash1 = await hashPassword(string1);
			const hash2 = await hashPassword(string1);
			expect(hash1 != hash2).toEqual(true);
		});

		it("should be different hashes for different inputs", async () => {
			process.env.SALT_ROUNDS = "5";
			const hash1 = await hashPassword(string1);
			const hash2 = await hashPassword(string2);
			expect(hash1 != hash2).toEqual(true);
		});

		it("should pass when compared with the same password", async () => {
			process.env.SALT_ROUNDS = "5";
			const hash1 = await hashPassword(string1);
			expect(await comparePassword(string1, hash1)).toEqual(true);
		});

		it("should fail when compared with a differing password", async () => {
			process.env.SALT_ROUNDS = "5";
			const hash1 = await hashPassword(string1);
			expect(await comparePassword(string2, hash1)).toEqual(false);
		});
	});
});
