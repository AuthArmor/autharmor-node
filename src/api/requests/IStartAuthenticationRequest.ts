import { IOriginLocationData } from "../models";

export interface IStartAuthenticationRequest {
    userId?: string | null;
    username?: string | null;
    timeoutSeconds?: number | null;
    originLocationData?: IOriginLocationData | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    nonce?: string | null;
}

export interface IStartAuthenticatorAuthenticationRequest extends IStartAuthenticationRequest {
    sendPushNotification?: boolean;
    useVisualVerify?: boolean;
    actionName?: string | null;
    shortMessage?: string | null;
}

export interface IStartWebAuthnAuthenticationRequest extends IStartAuthenticationRequest {
    webAuthnClientId: string;
    actionName?: string | null;
    shortMessage?: string | null;
}
