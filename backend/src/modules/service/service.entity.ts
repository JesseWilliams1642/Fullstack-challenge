import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: "services"})
export class Service {

    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ name: "service_name", type: "varchar", nullable: false })
    serviceName!: string;

    @Column({ name: "service_duration", type: "interval", nullable: false })
    serviceDuration!: string;

    @Column({ name: "service_description", type: "varchar", nullable: false })
    serviceDescription!: string;
    
    constructor(
        serviceName: string,
        serviceDuration: string,
        serviceDescription: string
    ) {
        this.serviceName = serviceName;
        this.serviceDuration = serviceDuration;
        this.serviceDescription = serviceDescription;
    };

}