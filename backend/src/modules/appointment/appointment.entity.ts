import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from '../user/user.entity';

@Entity({name: "appointments"})
export class Appointment {

    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ name: "service_type", type: "varchar", nullable: false })
    serviceType!: string;

    @ManyToOne(() => User, user => user.appointments)
    user!: User;

    constructor(
        serviceType: string,
        user: User
    ) {
        this.serviceType = serviceType;
        this.user = user;
    };

}