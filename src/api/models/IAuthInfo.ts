import { AuthRequestStatusId } from "./AuthRequestStatusId";
import { IAuthResponseDetails } from "./IAuthResponseDetails";

export interface IAuthInfo {
    auth_request_status_id: AuthRequestStatusId;
    auth_request_status_name: string | null;
    auth_response: IAuthResponseDetails;
}
