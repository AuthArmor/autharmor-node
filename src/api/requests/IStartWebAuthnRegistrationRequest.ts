export interface IStartWebAuthnRegistrationRequest {
    webAuthnClientId: string;
    webAuthnAttachmentType?: WebAuthnAttachmentType;
    timeoutSeconds?: number | null;
}

export interface IStartWebAuthnUserRegistrationRequest extends IStartWebAuthnRegistrationRequest {
    username?: string | null;
    emailAddress?: string | null;
}

export type WebAuthnAttachmentType = "Any" | "Platform" | "CrossPlatform";
