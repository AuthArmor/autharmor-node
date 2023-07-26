export interface IAuthenticationRequest {
    auth_request_id: string;
    user_id: string;
}

export interface IAuthenticatorAuthenticationRequest extends IAuthenticationRequest {
    auth_validation_token: string;
    visual_verify_value: string | null;
    push_message_sent: boolean;
    qr_code_data: string | null;
    response_code: number;
    response_message: string | null;
    timeout_in_seconds: number;
    timeout_utc_datetime: string;
}

export interface IWebAuthnAuthenticationRequest {
    auth_request_id: string;
    fido2_json_options: string;
    aa_guid: string;
}

export interface IFinishedWebAuthnAuthenticationRequest extends IAuthenticationRequest {
    auth_request_id: string;
    auth_validation_token: string | null;
    user_id: string;
    username: string;
}

export interface IMagicLinkEmailAuthenticationRequest extends IAuthenticationRequest {
    timeout_in_seconds: number;
    timeout_utc_datetime: string;
}
