export interface IWebAuthnUserRegistration {
    registration_id: string;
    fido2_json_options: string;
    aa_guid: string | null;
}
