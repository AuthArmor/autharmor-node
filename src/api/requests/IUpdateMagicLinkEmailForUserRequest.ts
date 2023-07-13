export interface IUpdateMagicLinkEmailForUserRequest {
    emailAddress: string;
    redirectUrl: string;
    actionName?: string | null;
    shortMessage?: string | null;
    timeoutSeconds?: number | null;
}
