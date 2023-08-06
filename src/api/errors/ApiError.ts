import { IApiError } from "../models";

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly message: string;
    public readonly trackingId: string;

    public constructor(public readonly rawError: IApiError) {
        super(`[${rawError.error_code}] ${rawError.error_message}`);

        this.statusCode = rawError.error_code;
        this.message = rawError.error_message;
        this.trackingId = rawError.tracking_id;
    }
}