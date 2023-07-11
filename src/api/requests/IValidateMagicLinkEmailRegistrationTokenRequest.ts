export interface IValidateMagicLinkEmailRegistrationTokenRequest {
    validationToken: string;
    ipAddress?: string | null;
    userAgent?: string | null;
}
