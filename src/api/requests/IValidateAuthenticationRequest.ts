export interface IValidateAuthenticationRequest {
    requestId: string;
    validationToken: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    nonce?: string | null;
}
