import fetch, { HeadersInit, RequestInit } from "node-fetch";
import { environment } from "../environment";
import { IAuthArmorClientConfiguration } from "./config";
import { ISystemClock, NativeSystemClock } from "../infrastructure";
import {
    IAuthInfo,
    IAuthTokenInfo,
    IAuthenticatorAuthenticationRequest,
    IMagicLinkEmailAuthenticationRequest,
    IWebAuthnAuthenticationRequest
} from "./models";
import { ApiError } from "./errors";
import {
    IStartAuthenticatorAuthenticationRequest,
    IStartMagicLinkEmailAuthenticationRequest,
    IStartWebAuthnAuthenticationRequest
} from "./requests";

export class AuthArmorApiClient {
    private readonly apiBaseUrl: string;
    private readonly logInBaseUrl: string;

    private currentAuthToken: IAuthTokenInfo = null!;
    private currentAuthTokenIssueTime: number = -1;

    public constructor(
        private readonly configuration: IAuthArmorClientConfiguration,
        private readonly systemClock: ISystemClock = new NativeSystemClock()
    ) {
        this.apiBaseUrl = configuration.apiBaseUrl ?? environment.defaultApiBaseUrl;
        this.logInBaseUrl = configuration.logInBaseUrl ?? environment.defaultLogInBaseUrl;
    }

    public async startAuthenticatorAuthenticationAsync({
        userId = null,
        username = null,
        timeoutSeconds = null,
        originLocationData = null,
        ipAddress = null,
        userAgent = null,
        nonce = null,
        sendPushNotification = false,
        useVisualVerify = false,
        actionName = null,
        shortMessage = null
    }: IStartAuthenticatorAuthenticationRequest): Promise<IAuthenticatorAuthenticationRequest> {
        return await this.fetchAsync<IAuthenticatorAuthenticationRequest>(
            "/auth/authenticator/start",
            "post",
            {
                user_id: userId,
                username,
                timeout_in_seconds: timeoutSeconds,
                origin_location_data: originLocationData,
                ip_address: ipAddress,
                user_agent: userAgent,
                nonce,
                send_push: sendPushNotification,
                use_visual_verify: useVisualVerify,
                action_name: actionName,
                short_msg: shortMessage
            }
        );
    }

    public async startWebAuthnAuthenticationAsync({
        userId = null,
        username = null,
        timeoutSeconds = null,
        originLocationData = null,
        ipAddress = null,
        userAgent = null,
        nonce = null,
        webAuthnClientId,
        actionName = null,
        shortMessage = null
    }: Partial<IStartWebAuthnAuthenticationRequest>): Promise<IWebAuthnAuthenticationRequest> {
        return await this.fetchAsync<IWebAuthnAuthenticationRequest>(
            "/auth/webauthn/start",
            "post",
            {
                user_id: userId,
                username,
                timeout_in_seconds: timeoutSeconds,
                origin_location_data: originLocationData,
                ip_address: ipAddress,
                user_agent: userAgent,
                nonce,
                webauthn_client_id: webAuthnClientId,
                action_name: actionName,
                short_msg: shortMessage
            }
        );
    }

    public async startMagicLinkEmailAuthenticationAsync({
        userId = null,
        username = null,
        timeoutSeconds = null,
        originLocationData = null,
        ipAddress = null,
        userAgent = null,
        nonce = null
    }: IStartMagicLinkEmailAuthenticationRequest): Promise<IMagicLinkEmailAuthenticationRequest> {
        return await this.fetchAsync<IMagicLinkEmailAuthenticationRequest>(
            "/auth/authenticator/start",
            "post",
            {
                user_id: userId,
                username,
                timeout_in_seconds: timeoutSeconds,
                origin_location_data: originLocationData,
                ip_address: ipAddress,
                user_agent: userAgent,
                nonce
            }
        );
    }

    public async getAuthInfoAsync(authRequestId: string): Promise<IAuthInfo> {
        return await this.fetchAsync<IAuthInfo>(`/auth/${authRequestId}`);
    }

    private async fetchAsync<TResponse, TPayload extends {} = {}>(
        relativeUrl: string,
        method: "get" | "post" = "get",
        payload?: TPayload
    ): Promise<TResponse> {
        await this.ensureAuthTokenValidity();

        const url = `${this.apiBaseUrl}${relativeUrl}`;

        const headers: HeadersInit = {
            Authorization: `${this.currentAuthToken.token_type} ${this.currentAuthToken.access_token}`
        };

        const body = payload !== undefined ? JSON.stringify(payload ?? {}) : null;

        if (body !== null) {
            headers["Content-Type"] = "application/json";
        }

        const options: RequestInit = {
            method,
            headers,
            body
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new ApiError(response.status, response.statusText);
        }

        const responseBody = (await response.json()) as TResponse;

        return responseBody;
    }

    private async ensureAuthTokenValidity(): Promise<void> {
        if (
            this.currentAuthToken !== null &&
            this.systemClock.now().getTime() <
                this.currentAuthTokenIssueTime + this.currentAuthToken.expires_in * 1000
        )
            return;

        this.currentAuthTokenIssueTime = this.systemClock.now().getTime();
        this.currentAuthToken = await this.getAuthToken();
    }

    private async getAuthToken(): Promise<IAuthTokenInfo> {
        const searchParams = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.configuration.clientId,
            client_secret: this.configuration.clientSecret
        });

        const response = await fetch(`${this.logInBaseUrl}/connect/token` + searchParams, {
            method: "POST"
        });

        const authTokenInfo = (await response.json()) as IAuthTokenInfo;

        return authTokenInfo;
    }
}
