// Error message sent to frontend

export interface ErrorMessage {
	statusCode: number;
    message: string | Object;
    timestamp: string;
}