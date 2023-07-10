export interface IStartWebAuthnUserRegistrationRequest {
    username?: string | null;
    emailAddress?: string | null;
    webAuthnClientId: string;
    webAuthnAttachmentType?: WebAuthnAttachmentType;
    timeoutSeconds?: number | null;
}

export type WebAuthnAttachmentType = "Any" | "Platform" | "CrossPlatform";
