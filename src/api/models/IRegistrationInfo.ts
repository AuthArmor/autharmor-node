import { AuthMethod } from "./IAuthMethod";
import { RegistrationRequestStatusCode } from "./RegistrationRequestStatusCode";

export interface IRegistrationInfo {
    registration_status_name: string;
    registration_status_code: RegistrationRequestStatusCode;
    auth_method: AuthMethod;
}
