import { AuthRequestStatusId } from "./AuthRequestStatusId";
import { IAuthResponseDetails } from "./IAuthResponseDetails";

export interface IAuthenticationValidation {
    auth_request_status_id: AuthRequestStatusId;
    auth_request_status_name: string | null;
    validate_auth_response_details: IValidateAuthResponseDetails;
}

export interface IValidateAuthResponseDetails extends IAuthResponseDetails {
    context_data: Record<string, string | number | boolean> | null;
}
