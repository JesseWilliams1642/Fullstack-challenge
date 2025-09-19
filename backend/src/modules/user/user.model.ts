import { Appointment } from "../appointment/appointment.model";

export class User {

    constructor(
        public id: string, 
        public name: string, 
        public appointments: Appointment[]
    ) {};

}