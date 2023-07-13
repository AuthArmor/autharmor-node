export interface IFinishWebAuthnRegistrationRequest {
    registrationId: string;
    authArmorSignature: string;
    webAuthnClientId: string;
    authenticatorResponseData: string;
    fido2RegistrationData: string;
}
