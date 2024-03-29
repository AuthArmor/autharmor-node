import { fetch, HeadersInit, RequestInit } from "undici";
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
    IMagicLinkRegistration,
    RegistrationResultsByAuthenticationMethod,
    IApiError
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
    IValidateAuthenticationRequest,
    IValidateRegistrationRequest
} from "./requests";
import { TokenAcquisitionError } from "./errors/TokenAcquisitionError";
import { ICredential } from "./models/ICredential";
import { IUserCredentialsList } from "./models/IUserCredentialsList";

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
            `/auth/${encodeURIComponent(authMethod)}/validate`,
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
        return await this.fetchAsync<IAuthInfo>(`/auth/${encodeURIComponent(authRequestId)}`);
    }

    public async listUsersAsync(
        pagingOptions: IPagingRequest<IUserProfile>,
        usernameFilter?: string
    ): Promise<IUsersList> {
        const filterParams = new URLSearchParams();

        if (usernameFilter !== undefined) {
            filterParams.append("username", usernameFilter);
        }

        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IUsersList>(`/users?${filterParams}&${pagingQuery}`, "get");
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
            `/users/${encodeURIComponent(userId)}/authenticator/register/start`,
            "post"
        );
    }

    public async startAuthenticatorRegistrationForExistingUserByUsernameAsync(
        username: string
    ): Promise<IAuthenticatorUserRegistration> {
        const usernameQuery = this.getUsernameQuery(username);

        return await this.fetchAsync<IAuthenticatorUserRegistration>(
            `/users/${blankUserId}/authenticator/register/start?${usernameQuery}`,
            "post"
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

    public async finishWebAuthnUserRegistrationAsync(
        registrationId: string,
        {
            authArmorSignature,
            webAuthnClientId,
            authenticatorResponseData,
            fido2RegistrationData
        }: IFinishWebAuthnRegistrationRequest
    ): Promise<IRegistrationResult> {
        return await this.fetchAsync<IRegistrationResult>(
            `/users/webauthn/registrations/${encodeURIComponent(registrationId)}/finish`,
            "post",
            {
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
            `/users/${encodeURIComponent(userId)}/registrations/webauthn/start`,
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
        registrationId: string,
        {
            authArmorSignature,
            webAuthnClientId,
            authenticatorResponseData,
            fido2RegistrationData
        }: IFinishWebAuthnRegistrationRequest
    ): Promise<IRegistrationResult> {
        return await this.fetchAsync<IRegistrationResult>(
            `/users/${encodeURIComponent(userId)}/registrations/webauthn/${encodeURIComponent(
                registrationId
            )}/finish`,
            "post",
            {
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
        const usernameQuery = this.getUsernameQuery(username);

        return await this.fetchAsync<IWebAuthnUserRegistration>(
            `/users/${blankUserId}/registrations/webauthn/start?${usernameQuery}`,
            "post",
            {
                webauthn_client_id: webAuthnClientId,
                attachment_type: webAuthnAttachmentType,
                timeout_in_seconds: timeoutSeconds
            }
        );
    }

    public async finishWebAuthnRegistrationForExistingUserByUsernameAsync(
        username: string,
        registrationId: string,
        {
            authArmorSignature,
            webAuthnClientId,
            authenticatorResponseData,
            fido2RegistrationData
        }: IFinishWebAuthnRegistrationRequest
    ): Promise<IRegistrationResult> {
        const usernameQuery = this.getUsernameQuery(username);

        return await this.fetchAsync<IRegistrationResult>(
            `/users/${blankUserId}/registrations/webauthn/${encodeURIComponent(
                registrationId
            )}/finish?${usernameQuery}`,
            "post",
            {
                aa_sig: authArmorSignature,
                webauthn_client_id: webAuthnClientId,
                authenticator_response_data: authenticatorResponseData,
                fido2_registration_data: fido2RegistrationData
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
            `/users/${encodeURIComponent(userId)}/registrations/magiclink_email/start`,
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
        const usernameQuery = this.getUsernameQuery(username);

        return await this.fetchAsync<IMagicLinkRegistration>(
            `/users/${blankUserId}/registrations/magiclink_email/start?${usernameQuery}`,
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
            `/users/${encodeURIComponent(userId)}/magiclink_email/update/start`,
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

    public async updateMagicLinkEmailForExistingUserByUsernameAsync(
        username: string,
        {
            emailAddress,
            redirectUrl,
            actionName = null,
            shortMessage = null,
            timeoutSeconds = null
        }: IUpdateMagicLinkEmailForUserRequest
    ): Promise<IMagicLinkRegistration> {
        const usernameQuery = this.getUsernameQuery(username);

        return await this.fetchAsync<IMagicLinkRegistration>(
            `/users/${blankUserId}/magiclink_email/update/start?${usernameQuery}`,
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

    public async validateRegistrationAsync<TAuthMethod extends "authenticator" | "webauthn" | "magiclink_email">(
        authMethod: TAuthMethod,
        registrationId: string,
        { validationToken }: IValidateRegistrationRequest
    ): Promise<RegistrationResultsByAuthenticationMethod[TAuthMethod]> {
        return await this.fetchAsync<RegistrationResultsByAuthenticationMethod[TAuthMethod]>(
            `/users/registrations/${encodeURIComponent(authMethod)}/${encodeURIComponent(
                registrationId
            )}/validate`,
            "post",
            {
                registration_validation_token: validationToken
            }
        );
    }

    public async getUserByIdAsync(userId: string): Promise<IUser> {
        return await this.fetchAsync<IUser>(`/users/${encodeURIComponent(userId)}`);
    }

    public async getUserByUsernameAsync(username: string): Promise<IUser> {
        const usernameQuery = this.getUsernameQuery(username);

        return await this.fetchAsync<IUser>(`/users/${blankUserId}?${usernameQuery}`, "get");
    }

    public async updateUserAsync(
        userId: string,
        { username = null }: IUpdateUserRequest
    ): Promise<IUserProfile> {
        return await this.fetchAsync<IUserProfile>(`/users/${encodeURIComponent(userId)}`, "put", {
            new_username: username
        });
    }

    public async updateUserByUsernameAsync(
        username: string,
        { username: newUsername = null }: IUpdateUserRequest
    ): Promise<IUserProfile> {
        const usernameQuery = this.getUsernameQuery(username);

        return await this.fetchAsync<IUserProfile>(
            `/users/${blankUserId}?${usernameQuery}`,
            "put",
            {
                new_username: newUsername
            }
        );
    }

    public async getUserAuthHistoryAsync(
        userId: string,
        pagingOptions: IPagingRequest<IAuthInfo>
    ): Promise<IAuthHistory> {
        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IAuthHistory>(
            `/users/${encodeURIComponent(userId)}/auth_history?${pagingQuery}`
        );
    }

    public async getUserAuthHistoryByUsernameAsync(
        username: string,
        pagingOptions: IPagingRequest<IAuthInfo>
    ): Promise<IAuthHistory> {
        const usernameQuery = this.getUsernameQuery(username);
        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IAuthHistory>(
            `/users/${encodeURIComponent(
                blankUserId
            )}/auth_history?${usernameQuery}&${pagingQuery}`,
            "get"
        );
    }

    public async getUserCredentialsAsync(
        userId: string,
        pagingOptions: IPagingRequest<ICredential>
    ): Promise<IUserCredentialsList> {
        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IUserCredentialsList>(
            `/users/${encodeURIComponent(userId)}/credentials?${pagingQuery}`
        );
    }

    public async getUserCredentialsByUsernameAsync(
        username: string,
        pagingOptions: IPagingRequest<ICredential>
    ): Promise<IUserCredentialsList> {
        const usernameQuery = this.getUsernameQuery(username);
        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IUserCredentialsList>(
            `/users/${encodeURIComponent(blankUserId)}/credentials?${usernameQuery}&${pagingQuery}`
        );
    }

    public async getUserCredentialByIdAsync(
        userId: string,
        credentialId: string
    ): Promise<ICredential> {
        return await this.fetchAsync<ICredential>(
            `/users/${encodeURIComponent(userId)}/credentials/${encodeURIComponent(credentialId)}`
        );
    }

    public async getUserCredentialByIdByUsernameAsync(
        username: string,
        credentialId: string
    ): Promise<ICredential> {
        const usernameQuery = this.getUsernameQuery(username);

        return await this.fetchAsync<ICredential>(
            `/users/${encodeURIComponent(blankUserId)}/credentials/${encodeURIComponent(
                credentialId
            )}?${usernameQuery}`
        );
    }

    public async getUserCredentialsForAuthMethodAsync(
        userId: string,
        authMethod: "authenticator" | "webauthn" | "magiclink_email",
        pagingOptions: IPagingRequest<ICredential>
    ): Promise<IUserCredentialsList> {
        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IUserCredentialsList>(
            `/users/${encodeURIComponent(userId)}/credentials/${encodeURIComponent(
                authMethod
            )}?${pagingQuery}`
        );
    }

    public async getUserCredentialsForAuthMethodByUsernameAsync(
        username: string,
        authMethod: "authenticator" | "webauthn" | "magiclink_email",
        pagingOptions: IPagingRequest<ICredential>
    ): Promise<IUserCredentialsList> {
        const usernameQuery = this.getUsernameQuery(username);
        const pagingQuery = this.getPagingQuery(pagingOptions);

        return await this.fetchAsync<IUserCredentialsList>(
            `/users/${encodeURIComponent(blankUserId)}/credentials/${encodeURIComponent(
                authMethod
            )}?${usernameQuery}&${pagingQuery}`
        );
    }

    public async disableUserCredentialAsync(
        userId: string,
        credentialId: string
    ): Promise<ICredential> {
        return await this.fetchAsync<ICredential>(
            `/users/${encodeURIComponent(userId)}/credentials/${encodeURIComponent(
                credentialId
            )}/disable`,
            "post"
        );
    }

    public async disableUserCredentialByUsernameAsync(
        username: string,
        credentialId: string
    ): Promise<ICredential> {
        const usernameQuery = this.getUsernameQuery(username);

        return await this.fetchAsync<ICredential>(
            `/users/${encodeURIComponent(blankUserId)}/credentials/${encodeURIComponent(
                credentialId
            )}/disable?${usernameQuery}`,
            "post"
        );
    }

    private getUsernameQuery(username: string): string {
        const searchParams = new URLSearchParams();

        searchParams.append("username", username);

        return searchParams.toString();
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
            const errorBody = (await response.json()) as IApiError;

            throw new ApiError(errorBody);
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
        const bodyParams = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.configuration.clientId,
            client_secret: this.configuration.clientSecret
        });

        const response = await fetch(`${this.logInBaseUrl}/connect/token`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: bodyParams.toString()
        });

        if (!response.ok) {
            const errorBody = (await response.json()) as { error: string };

            throw new TokenAcquisitionError(errorBody.error);
        }

        const authTokenInfo = (await response.json()) as IAuthTokenInfo;

        return authTokenInfo;
    }
}
