export interface IFinishWebAuthnAuthenticationRequest {
    requestId: string | null;
    webAuthnClientId: string | null;
    authenticatorResponseData?: string | null;
    authArmorSignature?: string | null;
}
