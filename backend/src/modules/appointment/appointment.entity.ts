import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, OneToMany } from 'typeorm'
import { User } from '../user/user.entity';
import { Staff } from '../staff/staff.entity';
import { Service } from '../service/service.entity';

@Entity({name: "appointments"})
export class Appointment {

    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ name: "start_timestamp", type: "timestamptz", nullable: false })
    startTimestamp!: Date;

    @ManyToOne(() => Service)
    service!: Service;

    @ManyToOne(() => User, user => user.appointments)
    user!: User;

    @ManyToOne(() => Staff, staff => staff.appointments)
    staff!: Staff;

    constructor(
        startTimestamp: Date,
        service: Service,
        user: User,
        staff: Staff
    ) {
        this.startTimestamp = startTimestamp;
        this.service = service;
        this.user = user;
        this.staff = staff;
    };

}