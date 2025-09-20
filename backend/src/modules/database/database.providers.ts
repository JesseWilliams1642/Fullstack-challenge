import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Appointment } from '../appointment/appointment.entity';

export const databaseProvider = {

    provide: 'DATA_SOURCE',
    useFactory: async () => {

        const port: number = Number(process.env.DB_PORT) || 5432;
        if (isNaN(port)) throw new Error("Database port is not a valid number!");

        const dataSource = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: port,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'db',
            entities: [User, Appointment],
            synchronize: true,
            logging: true

        });

        return dataSource.initialize();

    }

};