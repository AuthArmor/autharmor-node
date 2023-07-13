import { IAuthDetails } from "./IAuthDetails";

export interface IAuthResponseDetails {
    auth_history_id: string;
    result_code: AuthResponseCode;
    result_message: string | null;
    authorized: boolean;
    auth_details: IAuthDetails;
}

export enum AuthResponseCode {
    Pending = 0,
    Declined = 3,
    TimedOut = 5,
    Succeeded = 8
}
