import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToMany,
	Unique,
} from "typeorm";

import { Appointment } from "../appointment/appointment.entity";

@Unique(["email"])
@Entity({ name: "users" })
export class User {
	@PrimaryGeneratedColumn("uuid", { name: "id" })
	id!: string;

	@Column({ name: "name", type: "varchar", nullable: false })
	name!: string;

	@Column({ name: "email", type: "varchar", nullable: false })
	email!: string;

	@Column({ name: "phone_number", type: "varchar", nullable: false })
	phoneNumber!: string;

	@Column({ name: "hashed_password", type: "varchar", nullable: false })
	hashedPassword!: string;

	@OneToMany(() => Appointment, (appointment) => appointment.user, {
		cascade: true,
		eager: true,
	})
	appointments?: Appointment[];

	constructor(
		name: string,
		email: string,
		phoneNumber: string,
		hashedPassword: string,
	) {
		this.name = name;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.hashedPassword = hashedPassword;
	}
}
