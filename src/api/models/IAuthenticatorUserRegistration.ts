export interface IAuthenticatorUserRegistration {
    registration_id: string;
    registration_validation_token: string;
    username: string;
    date_expires: string;
    auth_method: string | null;
    qr_code_data: string;
}
