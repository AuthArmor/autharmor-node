export interface IValidateRegistrationRequest {
    validationToken: string;
}

export interface IValidateMagicLinkEmailRegistrationRequest extends IValidateRegistrationRequest {
    ipAddress?: string | null;
    userAgent?: string | null;
}
