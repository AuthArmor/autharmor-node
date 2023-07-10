import fetch, { HeadersInit, RequestInit } from "node-fetch";
import { environment } from "../environment";
import { IAuthArmorClientConfiguration } from "./config";
import { ISystemClock, NativeSystemClock } from "../infrastructure";
import {
    IAuthInfo,
    IAuthTokenInfo,
    IAuthenticatorAuthenticationRequest,
    IFinishedWebAuthnAuthenticationRequest,
    IMagicLinkEmailAuthenticationRequest,
    IUser,
    IUserProfile,
    IWebAuthnAuthenticationRequest
} from "./models";
import { ApiError } from "./errors";
import {
    IFinishWebAuthnAuthenticationRequest,
    IStartAuthenticatorAuthenticationRequest,
    IStartMagicLinkEmailAuthenticationRequest,
    IStartWebAuthnAuthenticationRequest
} from "./requests";
import { IAuthenticationValidation } from "./models/IAuthenticationValidation";
import { IValidateAuthenticationRequest } from "./requests/IValidateAuthenticationRequest";

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
    }: IStartWebAuthnAuthenticationRequest): Promise<IWebAuthnAuthenticationRequest> {
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

    public async finishWebAuthnAuthenticationAsync({
        requestId = null,
        webAuthnClientId = null,
        authenticatorResponseData = null,
        authArmorSignature = null
    }: IFinishWebAuthnAuthenticationRequest): Promise<IFinishedWebAuthnAuthenticationRequest> {
        return await this.fetchAsync<IFinishedWebAuthnAuthenticationRequest>(
            "/auth/webauthn/start",
            "post",
            {
                auth_request_id: requestId,
                webauthn_client_id: webAuthnClientId,
                authenticator_response_data: authenticatorResponseData,
                aa_sig: authArmorSignature
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
            "/auth/magiclink_email/start",
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

    public async validateAuthenticationAsync(
        authMethod: "authenticator" | "webauthn" | "magiclink_email",
        {
            requestId,
            validationToken,
            ipAddress = null,
            userAgent = null,
            nonce = null
        }: IValidateAuthenticationRequest
    ): Promise<IAuthenticationValidation> {
        return await this.fetchAsync<IAuthenticationValidation>(
            `/auth/${authMethod}/validate`,
            "post",
            {
                auth_request_id: requestId,
                auth_validation_token: validationToken,
                ip_address: ipAddress,
                user_agent: userAgent,
                nonce
            }
        );
    }

    public async getAuthInfoAsync(authRequestId: string): Promise<IAuthInfo> {
        return await this.fetchAsync<IAuthInfo>(`/auth/${authRequestId}`);
    }

    public async getUserByIdAsync(userId: string): Promise<IUser> {
        return await this.fetchAsync<IUser>(`/users/${userId}`);
    }

    public async getUserByUsernameAsync(username: string): Promise<IUser> {
        return await this.fetchAsync<IUser>(`/users/00000000-0000-0000-0000-000000000000`, "get", undefined, {
            "X-AuthArmor-UsernameValue": username
        });
    }

    private async fetchAsync<TResponse, TPayload extends {} = {}>(
        relativeUrl: string,
        method: "get" | "post" = "get",
        payload?: TPayload,
        headers?: Record<string, string>
    ): Promise<TResponse> {
        await this.ensureAuthTokenValidity();

        const url = `${this.apiBaseUrl}${relativeUrl}`;

        const finalHeaders: HeadersInit = {
            ...headers,
            Accept: "application/json",
            Authorization: `${this.currentAuthToken.token_type} ${this.currentAuthToken.access_token}`
        };

        const body = payload !== undefined ? JSON.stringify(payload ?? {}) : null;

        if (body !== null) {
            finalHeaders["Content-Type"] = "application/json";
        }

        const options: RequestInit = {
            method,
            headers: finalHeaders,
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
