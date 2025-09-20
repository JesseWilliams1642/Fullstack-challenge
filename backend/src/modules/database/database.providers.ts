import { DataSource } from 'typeorm';

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {

            const port: number = Number(process.env.DB_PORT) || 5555;
            if (isNaN(port)) throw new Error("Port is not a valid number!");

            const dataSource = new DataSource({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: port,
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'db',
                entities: [],
                synchronize: true,
                logging: true
            })
        }
    }
];