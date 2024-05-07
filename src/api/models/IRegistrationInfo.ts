import { AuthMethod } from "./IAuthMethod";

export interface IRegistrationInfo {
    registration_status_name: string;
    registration_status_code: number;
    auth_method: AuthMethod;
}
