import { DataSource } from "typeorm";
import { Appointment } from "./appointment.entity";

export const AppointmentProvider = {

    provide: "APPOINTMENT_REPOSITORY",
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Appointment),
    inject: ['DATA_SOURCE']

};
