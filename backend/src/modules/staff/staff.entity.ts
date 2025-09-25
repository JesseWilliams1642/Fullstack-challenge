import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Appointment } from '../appointment/appointment.entity';

@Entity({name: "staff"})
export class Staff {

    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ name: "name", type: "varchar", nullable: false })
    name!: string;

    @ManyToOne(() => Appointment, appointment => appointment.staff)
    appointments!: Appointment[];

    @Column({ name: "start_time", type: "time", nullable: false })
    startTime!: string;

    @Column({ name: "shift_duration", type: "interval" })
    shiftDuration!: number;

    @Column({ name: "break_time", type: "time", nullable: false })
    breakTime!: string;

    @Column({ name: "break_duration", type: "interval", nullable: false })
    breakDuration!: number;

    @Column({ name: "buffer_period", type: "interval", nullable: false })
    bufferPeriod!: number;

    constructor(
        name: string,
        startTime: string,
        shiftDuration: number,
        breakTime: string,
        breakDuration: number
    ) {
        this.name = name;
        this.appointments = [];
        this.startTime = startTime;
        this.shiftDuration = shiftDuration;
        this.breakTime = breakTime;
        this.breakDuration = breakDuration;
    };

}