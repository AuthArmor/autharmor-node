export interface IAuthenticatorUserRegistration {
    registration_id: string;
    username: string;
    date_expires: string;
    auth_method: string | null;
    qr_code_data: string;
}
