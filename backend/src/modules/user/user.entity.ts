import { Appointment } from "../appointment/appointment.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'

@Entity({name: "userss"})
export class User {

    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id: string;

    @Column({ name: "name", type: "varchar", nullable: false })
    name: string;

    @OneToMany(() => Appointment, appointment => appointment.user)
    appointments: Appointment[]

    constructor(
        name: string
    ) {
        this.name = name;
        this.appointments = [];
    };

}