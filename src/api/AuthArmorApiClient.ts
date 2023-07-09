import fetch, { HeadersInit, RequestInit } from "node-fetch";
import { environment } from "../environment";
import { IAuthArmorClientConfiguration } from "./config";
import { ISystemClock, NativeSystemClock } from "../infrastructure";
import { IAuthTokenInfo } from "./models";
import { ApiError } from "./errors";

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
