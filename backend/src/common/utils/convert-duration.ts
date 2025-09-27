interface PostgresInterval {

    years: number,
    months: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,

}

export function durationToMilliseconds(duration: unknown): number {
    
    const objectDuration = duration as PostgresInterval;

    const MS_PER_SECOND = 1000;
    const MS_PER_MINUTE = MS_PER_SECOND * 60;
    const MS_PER_HOUR = MS_PER_MINUTE * 60;
    const MS_PER_DAY = MS_PER_HOUR * 24;
    const MS_PER_MONTH = MS_PER_DAY * 30.44; 
    const MS_PER_YEAR = MS_PER_DAY * 365.25; 

    const newDuration: number = (objectDuration.seconds ?? 0) * MS_PER_SECOND  
                                + (objectDuration.minutes ?? 0) * MS_PER_MINUTE
                                + (objectDuration.hours ?? 0) * MS_PER_HOUR 
                                + (objectDuration.days ?? 0) * MS_PER_DAY
                                + (objectDuration.months ?? 0) * MS_PER_MONTH 
                                + (objectDuration.years ?? 0) * MS_PER_YEAR;
                            

    return newDuration;

}