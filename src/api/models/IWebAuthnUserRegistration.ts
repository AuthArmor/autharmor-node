export interface IWebAuthnUserRegistration {
    registration_id: string;
    registration_validation_token: string;
    fido2_json_options: string;
    aa_sig: string | null;
}
