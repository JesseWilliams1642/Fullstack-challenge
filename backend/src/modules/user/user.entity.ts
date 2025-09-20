import { Appointment } from "../appointment/appointment.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique } from 'typeorm'

@Unique(['email'])
@Entity({name: "users"})
export class User {

    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ name: "name", type: "varchar", nullable: false })
    name!: string;

    @Column({ name: "email", type: "varchar", nullable: false })
    email!: string;

    @Column({ name: "hashed_password", type: "varchar", nullable: false })
    hashedPassword!: string;
    
    @OneToMany(() => Appointment, appointment => appointment.user)
    appointments?: Appointment[]

    constructor(
        name: string,
        email: string,
        hashedPassword: string
    ) {
        this.name = name;
        this.email = email;
        this.hashedPassword = hashedPassword;
    };

}