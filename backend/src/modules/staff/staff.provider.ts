import { DataSource } from "typeorm";
import { Staff } from "./staff.entity";

export const StaffProvider = {
	provide: "STAFF_REPOSITORY",
	useFactory: (dataSource: DataSource) => dataSource.getRepository(Staff),
	inject: ["DATA_SOURCE"],
};
