import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm'

@Entity({name: "services"})
export class Service {

    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ name: "service_name", type: "varchar", nullable: false })
    serviceName!: string;

    @Column({ name: "service_duration", type: "interval", nullable: false })
    serviceDuration!: string;
    
    constructor(
        serviceName: string,
        serviceDuration: string
    ) {
        this.serviceName = serviceName;
        this.serviceDuration = serviceDuration;
    };

}