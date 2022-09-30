import Http from "axios";
import QueryString from "querystring";
import config from "./config";

interface EnrollCredentialsRequest {
  username: string;
  userId: string;
  signedResponse: any;
}

interface SDKSettings {
  clientId: string;
  clientSecret: string;
  authTimeout?: number;
  polling?: boolean;
  http?: boolean;
  webauthnClientId?: string;
}

interface InviteIdOptions {
  id: string;
}

interface InviteNicknameOptions {
  nickname: string;
}

interface LocationData {
  ip_address?: string;
  latitude?: string;
  longitude?: string;
}

interface AuthSettings {
  nickname: string;
  nonce: string;
  timeout_in_seconds: number;
  origin_location_data: LocationData;
  action_name: string;
  short_msg: string;
  send_push: boolean;
  use_visual_verify: boolean;
}

interface VerifyAuthenticatorRequestArgs {
  type: "AuthArmorAuthenticator";
  requestId: string;
  token: string;
}

interface VerifyMagicLinkRequestArgs {
  type: "MagicLink";
  token: string;
}

interface VerifyWebAuthnRequestArgs {
  type: "WebAuthn";
  token: string;
  requestId: string;
}

interface GetUserArgs {
  userId: string;
}

export default class AuthArmorSDK {
  private clientId: string = "";
  private clientSecret: string = "";
  private tokenExpiration: number = Date.now();
  private token: string | null = null;
  private webauthnClientId?: string;

  constructor({
    clientId,
    clientSecret,
    polling = false,
    http = false,
    webauthnClientId
  }: SDKSettings) {
    this.webauthnClientId = webauthnClientId;

    this.init({
      clientId,
      clientSecret,
      polling: http || polling
    });
  }

  private init({ clientId, clientSecret }: SDKSettings) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async extendToken() {
    if (this.tokenExpiration <= Date.now() + 2 * 60 * 1000) {
      const { data } = await Http.post(
        `${config.loginURL}/connect/token`,
        QueryString.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "client_credentials"
        })
      );
      this.token = data.access_token;
      this.tokenExpiration = Date.now() + 8 * 60 * 1000;
    }
  }

  public async getInviteById({ id }: InviteIdOptions) {
    try {
      await this.extendToken();
      const { data } = await Http.get(`${config.apiUrl}/invite/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });

      return data;
    } catch (err) {
      throw err.response?.data ?? err;
    }
  }

  public async getInvitesByNickname({ nickname }: InviteNicknameOptions) {
    try {
      await this.extendToken();
      const { data } = await Http.get(`${config.apiUrl}/invites/${nickname}`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });

      return data;
    } catch (err) {
      throw err.response?.data ?? err;
    }
  }

  public async startEnrollCredentials({
    username = "",
    userId = "00000000-0000-0000-0000-000000000000",
    timeout = 30000
  }) {
    try {
      await this.extendToken();
      const { data } = await Http.post(
        `${config.apiUrlV3}/users/${userId}/webauthn/register/start`,
        {
          webauthn_client_id: this.webauthnClientId,
          timeout_in_seconds: timeout
        },
        {
          headers: {
            "X-AuthArmor-UsernameValue": username,
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      return data;
    } catch (error) {
      console.error(error.response.data);
      return error;
    }
  }

  public async verifyEnrollCredentials({
    username = "",
    userId = "00000000-0000-0000-0000-000000000000",
    signedResponse
  }: EnrollCredentialsRequest) {
    try {
      await this.extendToken();
      const { data } = await Http.post(
        `${config.apiUrlV3}/users/${userId}/webauthn/register/finish`,
        {
          webauthn_client_id: this.webauthnClientId,
          response: signedResponse
        },
        {
          headers: {
            "X-AuthArmor-UsernameValue": username,
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      return data;
    } catch (error) {
      console.error(error.response.data);
      throw error;
    }
  }

  public async verifyAuthRequest({
    type,
    ...requestData
  }:
    | VerifyAuthenticatorRequestArgs
    | VerifyMagicLinkRequestArgs
    | VerifyWebAuthnRequestArgs) {
    try {
      await this.extendToken();
      const requestTypes = {
        AuthArmorAuthenticator: "authenticator",
        MagicLink: "magiclink",
        WebAuthn: "webauthn"
      };

      const payload: any = {
        auth_validation_token: (requestData as VerifyMagicLinkRequestArgs)
          .token,
        auth_request_id: (requestData as VerifyWebAuthnRequestArgs).requestId
      };

      const { data } = await Http.post(
        `${config.apiUrlV3}/auth/${requestTypes[type]}/validate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      if (data?.validate_auth_response_details?.is_replay) {
        throw new Error("Replayed request detected!");
      }

      if (!data?.validate_auth_response_details?.authorized) {
        throw new Error("Unauthorized user");
      }

      console.log("Request verified, fetching request details...", data);

      const requestDetails =
        data.validate_auth_response_details.auth_details.response_details
          .auth_profile_details;

      return {
        verified: true,
        requestDetails
      };
    } catch (err) {
      console.error(err?.response ?? err);
      throw {
        verified: false,
        error: err?.response?.data ?? err
      };
    }
  }

  public async verifyRegisterRequest({
    type,
    ...requestData
  }:
    | VerifyAuthenticatorRequestArgs
    | VerifyMagicLinkRequestArgs
    | VerifyWebAuthnRequestArgs) {
    try {
      await this.extendToken();
      const requestTypes = {
        AuthArmorAuthenticator: "authenticator",
        MagicLink: "magiclink",
        WebAuthn: "webauthn"
      };

      const payload: any = {
        registration_validation_token: (requestData as VerifyMagicLinkRequestArgs)
          .token,
        auth_request_id: (requestData as VerifyWebAuthnRequestArgs).requestId
      };

      const { data } = await Http.post(
        `${config.apiUrlV3}/users/register/${requestTypes[type]}/validate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      console.log("Request verified, fetching request details...", data);

      return {
        verified: true,
        requestDetails: data
      };
    } catch (err) {
      throw {
        verified: false,
        error: err?.response?.data ?? err
      };
    }
  }

  public async getUserById({ userId }: GetUserArgs) {
    try {
      await this.extendToken();

      const { data } = await Http.get(
        `${config.apiUrlV3}/users/${userId}/validate`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      console.log("User retrieved:", data);

      return data;
    } catch (err) {
      throw {
        verified: false,
        error: err?.response?.data ?? err
      };
    }
  }
}
