// Postgres Interval type 
// This is how Postgres converts e.g. "9h" to an object 

export interface PostgresInterval {
	years?: number;
	months?: number;
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
}