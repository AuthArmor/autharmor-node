export interface IAuthenticationRequest {
    auth_request_id: string;
    auth_validation_token: string;
    user_id: string;
    timeout_in_seconds: number;
    timeout_utc_datetime: string;
}

export interface IAuthenticatorAuthenticationRequest extends IAuthenticationRequest {
    visual_verify_value: string | null;
    push_message_sent: boolean;
    qr_code_data: string | null;
    response_code: number;
    response_message: string | null;
}

export interface IWebAuthnAuthenticationRequest {
    auth_request_id: string;
    fido2_json_options: string;
    aa_guid: string;
}
