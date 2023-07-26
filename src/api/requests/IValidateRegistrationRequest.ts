export interface IValidateRegistrationRequest {
    validationToken: string;
}

export interface IValidateAuthenticatorRegistrationRequest extends IValidateRegistrationRequest {}

export interface IValidateWebAuthnRegistrationRequest extends IValidateRegistrationRequest {}

export interface IValidateMagicLinkEmailRegistrationRequest extends IValidateRegistrationRequest {
    ipAddress?: string | null;
    userAgent?: string | null;
}
