import { IAuthDetails } from "./IAuthDetails";

export interface IAuthInfo {
    auth_request_status_id: AuthRequestStatusId;
    auth_request_status_name: string | null;
    auth_response: {
        auth_history_id: string;
        result_code: AuthRequestCode;
        result_message: string | null;
        authorized: boolean;
        auth_details: IAuthDetails;
    };
}

export enum AuthRequestStatusId {
    Failed = 2,
    PendingApproval = 3,
    PendingValidation = 4
}

export enum AuthRequestCode {
    Pending = 0,
    Declined = 3,
    TimedOut = 5,
    Succeeded = 8
}
