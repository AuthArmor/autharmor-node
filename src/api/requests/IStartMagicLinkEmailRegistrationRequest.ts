import { IOriginLocationData } from "../models";

export interface IStartMagicLinkEmailRegistrationRequest {
    emailAddress: string;
    redirectUrl: string;
    actionName?: string | null;
    shortMessage?: string | null;
    timeoutSeconds?: number | null;
    originLocationData?: IOriginLocationData | null;
    ipAddress?: string | null;
    userAgent?: string | null;
}
