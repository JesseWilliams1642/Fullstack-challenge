import dataSource from "./database.config";

// Set up TypeORM repository and export it

export const databaseProvider = {
	provide: "DATA_SOURCE",
	useFactory: async () => {
		return dataSource.initialize();
	},
};
