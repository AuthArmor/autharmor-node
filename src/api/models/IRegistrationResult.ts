export interface IRegistrationResult {
    user_id: string;
    username: string;
}

export interface IAuthenticatorRegistrationResult extends IRegistrationResult {
    device_id: string;
}

export interface IWebAuthnRegistrationResult extends IRegistrationResult {
    device_id: string;
}

export interface IMagicLinkEmailRegistrationResult extends IRegistrationResult {
    magiclink_email_registration_type: MagicLinkEmailRegistrationType;
    email_address: string;
    context_data: Record<string, string | number | boolean>;
}

export type MagicLinkEmailRegistrationType = "new_user" | "new_enrollment" | "change_email";
