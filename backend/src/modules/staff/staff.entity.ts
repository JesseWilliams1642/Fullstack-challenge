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

    @Column({ name: "days_working", type: "boolean", array: true, nullable: false })
    daysWorking!: boolean[];

    @Column({ name: "start_time", type: "time", nullable: false })
    startTime!: string;

    @Column({ name: "shift_duration", type: "interval" })
    shiftDuration!: string;

    @Column({ name: "break_time", type: "time", nullable: false })
    breakTime!: string;

    @Column({ name: "break_duration", type: "interval", nullable: false })
    breakDuration!: string;

    @Column({ name: "buffer_period", type: "interval", nullable: false })
    bufferPeriod!: string;

    constructor(
        name: string,
        daysWorking: boolean[],
        startTime: string,
        shiftDuration: string,
        breakTime: string,
        breakDuration: string,
        bufferPeriod: string,
        appointments: Appointment[] = []
    ) {
        this.name = name;
        this.daysWorking = daysWorking;
        this.startTime = startTime;
        this.shiftDuration = shiftDuration;
        this.breakTime = breakTime;
        this.breakDuration = breakDuration;
        this.bufferPeriod = bufferPeriod;
        this.appointments = appointments;
    };

}