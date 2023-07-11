import fetch, { HeadersInit, RequestInit } from "node-fetch";
import { environment } from "../environment";
import { IAuthArmorClientConfiguration } from "./config";
import { ISystemClock, NativeSystemClock } from "../infrastructure";
import {
    IAuthHistory,
    IAuthInfo,
    IAuthTokenInfo,
    IAuthenticationValidation,
    IAuthenticatorAuthenticationRequest,
    IAuthenticatorUserRegistration,
    IFinishedWebAuthnAuthenticationRequest,
    IMagicLinkEmailAuthenticationRequest,
    IUser,
    IUserProfile,
    IWebAuthnAuthenticationRequest,
    IUsersList,
    IWebAuthnUserRegistration,
    IRegistrationResult,
    IMagicLinkRegistration
} from "./models";
import { ApiError } from "./errors";
import {
    IFinishWebAuthnAuthenticationRequest,
    IFinishWebAuthnRegistrationRequest,
    IPagingRequest,
    IStartAuthenticatorAuthenticationRequest,
    IStartAuthenticatorUserRegistrationRequest,
    IStartMagicLinkEmailAuthenticationRequest,
    IStartMagicLinkEmailRegistrationRequest,
    IStartWebAuthnAuthenticationRequest,
    IStartWebAuthnRegistrationRequest,
    IStartWebAuthnUserRegistrationRequest,
    IUpdateMagicLinkEmailForUserRequest,
    IUpdateUserRequest,
    IValidateAuthenticationRequest
} from "./requests";

const blankUserId = "00000000-0000-0000-0000-000000000000";

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
        nonce = null,
        redirectUrl
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
                nonce,
                auth_redirect_url: redirectUrl
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

    public async listUsersAsync(
        pagingOptions: IPagingRequest<IUserProfile>,
        filter?: string
    ): Promise<IUsersList> {
        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IUsersList>(
            `/users?${pagingQuery}`,
            "get",
            undefined,
            (filter && {
                "X-AuthArmor-UserFilterString": filter
            }) ||
                undefined
        );
    }

    public async startAuthenticatorUserRegistrationAsync({
        username,
        resetAndReinvite = false,
        revokePreviousInvites = false
    }: IStartAuthenticatorUserRegistrationRequest): Promise<IAuthenticatorUserRegistration> {
        return await this.fetchAsync<IAuthenticatorUserRegistration>(
            `/users/authenticator/register/start`,
            "post",
            {
                username,
                reset_and_reinvite: resetAndReinvite,
                revoke_previous_invites: revokePreviousInvites
            }
        );
    }

    public async startAuthenticatorRegistrationForExistingUserAsync(
        userId: string
    ): Promise<IAuthenticatorUserRegistration> {
        return await this.fetchAsync<IAuthenticatorUserRegistration>(
            `/users/${userId}/authenticator/register/start`,
            "post"
        );
    }

    public async startAuthenticatorRegistrationForExistingUserByUsernameAsync(
        username: string
    ): Promise<IAuthenticatorUserRegistration> {
        return await this.fetchAsync<IAuthenticatorUserRegistration>(
            `/users/${blankUserId}/authenticator/register/start`,
            "post",
            undefined,
            {
                "X-AuthArmor-UsernameValue": username
            }
        );
    }

    public async startWebAuthnUserRegistrationAsync({
        username = null,
        emailAddress = null,
        webAuthnClientId,
        webAuthnAttachmentType = "Any",
        timeoutSeconds = null
    }: IStartWebAuthnUserRegistrationRequest): Promise<IWebAuthnUserRegistration> {
        return await this.fetchAsync<IWebAuthnUserRegistration>(
            "/users/webauthn/register/start",
            "post",
            {
                username,
                email_address: emailAddress,
                webauthn_client_id: webAuthnClientId,
                attachment_type: webAuthnAttachmentType,
                timeout_in_seconds: timeoutSeconds
            }
        );
    }

    public async finishWebAuthnUserRegistrationAsync({
        registrationId,
        authArmorSignature,
        webAuthnClientId,
        authenticatorResponseData,
        fido2RegistrationData
    }: IFinishWebAuthnRegistrationRequest): Promise<IRegistrationResult> {
        return await this.fetchAsync<IRegistrationResult>(
            "/users/webauthn/register/finish",
            "post",
            {
                registration_id: registrationId,
                aa_sig: authArmorSignature,
                webauthn_client_id: webAuthnClientId,
                authenticator_response_data: authenticatorResponseData,
                fido2_registration_data: fido2RegistrationData
            }
        );
    }

    public async startWebAuthnRegistrationForExistingUserAsync(
        userId: string,
        {
            webAuthnClientId,
            webAuthnAttachmentType = "Any",
            timeoutSeconds = null
        }: IStartWebAuthnRegistrationRequest
    ) {
        return await this.fetchAsync<IWebAuthnUserRegistration>(
            `/users/${userId}/webauthn/register/start`,
            "post",
            {
                webauthn_client_id: webAuthnClientId,
                attachment_type: webAuthnAttachmentType,
                timeout_in_seconds: timeoutSeconds
            }
        );
    }

    public async finishWebAuthnRegistrationForExistingUserAsync(
        userId: string,
        {
            registrationId,
            authArmorSignature,
            webAuthnClientId,
            authenticatorResponseData,
            fido2RegistrationData
        }: IFinishWebAuthnRegistrationRequest
    ): Promise<IRegistrationResult> {
        return await this.fetchAsync<IRegistrationResult>(
            `/users/${userId}/webauthn/register/finish`,
            "post",
            {
                registration_id: registrationId,
                aa_sig: authArmorSignature,
                webauthn_client_id: webAuthnClientId,
                authenticator_response_data: authenticatorResponseData,
                fido2_registration_data: fido2RegistrationData
            }
        );
    }

    public async startWebAuthnRegistrationForExistingUserByUsernameAsync(
        username: string,
        {
            webAuthnClientId,
            webAuthnAttachmentType = "Any",
            timeoutSeconds = null
        }: IStartWebAuthnRegistrationRequest
    ): Promise<IWebAuthnUserRegistration> {
        return await this.fetchAsync<IWebAuthnUserRegistration>(
            `/users/${blankUserId}/webauthn/register/start`,
            "post",
            {
                webauthn_client_id: webAuthnClientId,
                attachment_type: webAuthnAttachmentType,
                timeout_in_seconds: timeoutSeconds
            },
            {
                "X-AuthArmor-UsernameValue": username
            }
        );
    }

    public async finishWebAuthnRegistrationForExistingUserByUsernameAsync(
        username: string,
        {
            registrationId,
            authArmorSignature,
            webAuthnClientId,
            authenticatorResponseData,
            fido2RegistrationData
        }: IFinishWebAuthnRegistrationRequest
    ): Promise<IRegistrationResult> {
        return await this.fetchAsync<IRegistrationResult>(
            `/users/${blankUserId}/webauthn/register/finish`,
            "post",
            {
                registration_id: registrationId,
                aa_sig: authArmorSignature,
                webauthn_client_id: webAuthnClientId,
                authenticator_response_data: authenticatorResponseData,
                fido2_registration_data: fido2RegistrationData
            },
            {
                "X-AuthArmor-UsernameValue": username
            }
        );
    }

    public async startMagicLinkEmailUserRegistrationAsync({
        emailAddress,
        redirectUrl,
        actionName = null,
        shortMessage = null,
        timeoutSeconds = null,
        originLocationData = null,
        ipAddress = null,
        userAgent = null
    }: IStartMagicLinkEmailRegistrationRequest): Promise<IMagicLinkRegistration> {
        return await this.fetchAsync<IMagicLinkRegistration>(
            "/users/magiclink_email/register/start",
            "post",
            {
                email_address: emailAddress,
                registration_redirect_url: redirectUrl,
                action_name: actionName,
                short_msg: shortMessage,
                timeout_in_seconds: timeoutSeconds,
                origin_location_data: originLocationData,
                ip_address: ipAddress,
                user_agent: userAgent
            }
        );
    }

    public async startMagicLinkEmailRegistrationForExistingUserAsync(
        userId: string,
        {
            emailAddress,
            redirectUrl,
            actionName = null,
            shortMessage = null,
            timeoutSeconds = null,
            originLocationData = null,
            ipAddress = null,
            userAgent = null
        }: IStartMagicLinkEmailRegistrationRequest
    ): Promise<IMagicLinkRegistration> {
        return await this.fetchAsync<IMagicLinkRegistration>(
            `/users/${userId}/magiclink_email/register/start`,
            "post",
            {
                email_address: emailAddress,
                registration_redirect_url: redirectUrl,
                action_name: actionName,
                short_msg: shortMessage,
                timeout_in_seconds: timeoutSeconds,
                origin_location_data: originLocationData,
                ip_address: ipAddress,
                user_agent: userAgent
            }
        );
    }

    public async startMagicLinkEmailRegistrationForExistingUserByUsernameAsync(
        username: string,
        {
            emailAddress,
            redirectUrl,
            actionName = null,
            shortMessage = null,
            timeoutSeconds = null,
            originLocationData = null,
            ipAddress = null,
            userAgent = null
        }: IStartMagicLinkEmailRegistrationRequest
    ): Promise<IMagicLinkRegistration> {
        return await this.fetchAsync<IMagicLinkRegistration>(
            `/users/${blankUserId}/magiclink_email/register/start`,
            "post",
            {
                email_address: emailAddress,
                registration_redirect_url: redirectUrl,
                action_name: actionName,
                short_msg: shortMessage,
                timeout_in_seconds: timeoutSeconds,
                origin_location_data: originLocationData,
                ip_address: ipAddress,
                user_agent: userAgent
            },
            {
                "X-AuthArmor-UsernameValue": username
            }
        );
    }

    public async updateMagicLinkEmailForExistingUserAsync(
        userId: string,
        {
            emailAddress,
            redirectUrl,
            actionName = null,
            shortMessage = null,
            timeoutSeconds = null
        }: IUpdateMagicLinkEmailForUserRequest
    ): Promise<IMagicLinkRegistration> {
        return await this.fetchAsync<IMagicLinkRegistration>(
            `/users/${userId}/magiclink_email/update/start`,
            "post",
            {
                email_address: emailAddress,
                registration_redirect_url: redirectUrl,
                action_name: actionName,
                short_msg: shortMessage,
                timeout_in_seconds: timeoutSeconds
            }
        );
    }

    public async getUserByIdAsync(userId: string): Promise<IUser> {
        return await this.fetchAsync<IUser>(`/users/${userId}`);
    }

    public async getUserByUsernameAsync(username: string): Promise<IUser> {
        return await this.fetchAsync<IUser>(`/users/${blankUserId}`, "get", undefined, {
            "X-AuthArmor-UsernameValue": username
        });
    }

    public async updateUserAsync(
        userId: string,
        { username = null }: IUpdateUserRequest
    ): Promise<IUserProfile> {
        return await this.fetchAsync<IUserProfile>(`/users/${userId}`, "put", {
            new_username: username
        });
    }

    public async updateUserByUsernameAsync(
        username: string,
        { username: newUsername = null }: IUpdateUserRequest
    ): Promise<IUserProfile> {
        return await this.fetchAsync<IUserProfile>(
            `/users/${blankUserId}`,
            "put",
            {
                new_username: newUsername
            },
            {
                "X-AuthArmor-UsernameValue": username
            }
        );
    }

    public async getUserAuthHistoryAsync(
        userId: string,
        pagingOptions: IPagingRequest<IAuthInfo>
    ): Promise<IAuthHistory> {
        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IAuthHistory>(`/users/${userId}/auth_history?${pagingQuery}`);
    }

    public async getUserAuthHistoryByUsernameAsync(
        username: string,
        pagingOptions: IPagingRequest<IAuthInfo>
    ): Promise<IAuthHistory> {
        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IAuthHistory>(
            `/users/${blankUserId}/auth_history?${pagingQuery}`,
            "get",
            undefined,
            {
                "X-AuthArmor-UsernameValue": username
            }
        );
    }

    private getPagingQuery<T>(pagingRequest: IPagingRequest<T>): string {
        const searchParamMappings = {
            pageNumber: "page_number",
            pageSize: "page_size",
            sortDirection: "sort_direction",
            sortColumn: "sort_column"
        };

        const searchParams = new URLSearchParams();

        for (const [requestKey, paramName] of Object.entries(searchParamMappings)) {
            const paramValue = pagingRequest[requestKey as keyof typeof pagingRequest];

            if (paramValue !== undefined) {
                searchParams.append(paramName, paramValue.toString());
            }
        }

        return searchParams.toString();
    }

    private async fetchAsync<TResponse, TPayload extends {} = {}>(
        relativeUrl: string,
        method: "get" | "post" | "put" = "get",
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
