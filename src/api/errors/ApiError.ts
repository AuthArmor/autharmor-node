import { IApiError } from "../models";

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly message: string;
    public readonly trackingId: string;

    public constructor(public readonly rawError: IApiError) {
        super(`[${rawError.errorCode}] ${rawError.errorMessage}`);

        this.statusCode = rawError.errorCode;
        this.message = rawError.errorMessage;
        this.trackingId = rawError.trackingGuid;
    }
}