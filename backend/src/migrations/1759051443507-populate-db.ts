import { MigrationInterface, QueryRunner } from "typeorm";
import { hashPassword } from "../common/utils";

export class PopulateDb1759051443507 implements MigrationInterface {
	name = "PopulateDb1759051443507";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Seed users
		const users = [
			{
				name: "Customer 1",
				email: "customer1@sampleassist.com",
				hashedPassword: await hashPassword("password@123"),
			},
			{
				name: "Customer 2",
				email: "customer2@sampleassist.com",
				hashedPassword: await hashPassword("password@123"),
			},
			{
				name: "Admin",
				email: "admin@sampleassist.com",
				hashedPassword: await hashPassword("admin@123"),
			},
		];

		for (const user of users) {
			await queryRunner.query(
				`INSERT INTO "users" ("name", "email", "hashed_password") VALUES ($1, $2, $3)`,
				[user.name, user.email, user.hashedPassword],
			);
		}

		console.log("✅ Test users inserted.");

		// Seed services
		const services = [
			{ 
				serviceName: "Haircut", 
				serviceDuration: "30m", 
				serviceDescription: "Professional cuts for personal and business", 
				serviceImage: "https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800"
			},
			{ 
				serviceName: "Hair Styling", 
				serviceDuration: "45m", 
				serviceDescription: "Professional styling for special occasions", 
				serviceImage: "https://images.pexels.com/photos/3992865/pexels-photo-3992865.jpeg?auto=compress&cs=tinysrgb&w=800"
			},
			{
				serviceName: "Hair Colouring",
				serviceDuration: "90m",
				serviceDescription: "Indepth consultation to determine what is best for your hair", 
				serviceImage: "https://images.pexels.com/photos/3992855/pexels-photo-3992855.jpeg?auto=compress&cs=tinysrgb&w=800"
			},
			{ 
				serviceName: "Consultation", 
				serviceDuration: "15m", 
				serviceDescription: "Hair dying and natural-looking highlights with expert technique", 
				serviceImage: "https://images.pexels.com/photos/3992871/pexels-photo-3992871.jpeg?auto=compress&cs=tinysrgb&w=800"
			},
			{
				serviceName: "Deep Conditioning Treatment",
				serviceDuration: "60m",
				serviceDescription: "Deep conditioning and repair treatment", 
				serviceImage: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800"
			}
		];

		for (const service of services) {
			await queryRunner.query(
				`INSERT INTO "services" ("service_name", "service_duration", "service_description", "service_image") VALUES ($1, $2, $3, $4)`,
				[service.serviceName, service.serviceDuration, service.serviceDescription, service.serviceImage],
			);
		}

		console.log("✅ Test services inserted.");

		// Seed staff
		await queryRunner.query(
			`INSERT INTO "staff" ("name", "days_working", "start_time", "shift_duration", "break_time", "break_duration", "buffer_period") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			[
				"Jesse",
				[true, true, true, true, true, false, false],
				"9h",
				"8h",
				"12h",
				"1h",
				"15m",
			],
		);

		console.log("✅ Test staff inserted.");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DELETE FROM "staff" WHERE "name" = 'Jesse'`);

		await queryRunner.query(
			`DELETE FROM "services" WHERE "service_name" IN ($1, $2, $3, $4, $5)`,
			[
				"Haircut",
				"Hair Styling",
				"Hair Colouring",
				"Consultation",
				"Deep Conditioning Treatment",
			],
		);

		await queryRunner.query(`DELETE FROM "users" WHERE "email" IN ($1, $2, $3)`, [
			"customer1@sampleassist.com",
			"customer2@sampleassist.com",
			"admin@sampleassist.com",
		]);

		console.log("↩️ Rolled back seeded data.");
	}
}
