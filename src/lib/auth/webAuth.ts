import Http from "axios";
import QueryString from "querystring";
import config from "../../config";
import { FetchFunction } from "../../helper/fetch";
import { removeUndefined } from "../../helper/removeUndefined";

const baseUrl = (userId: string | null) => ({
  start: `${config.apiUrlV3}/auth/webauthn/start`,
  finish: `${config.apiUrlV3}/auth/webauthn/finish`,
  validate: `${config.apiUrlV3}/auth/webauthn/validate`
});

export interface IauthWebAuth {
  user_id: string;
  username: string;
  webauthn_client_id: string;
  nonce?: string;
  timeout_in_seconds: number;
  origin_location_data?: {
    latitude: string;
    longitude: string;
    ip_address: string;
  };
  action_name: string;
  short_msg: string;
  ip_address?: string;
  user_agent?: string;
}
export interface IfinishWebAuth {
  authenticator_response_data: string;
  aa_sig: string;
  auth_request_id: string;
  webauthn_client_id: string;
}
export interface IvalidateWebAuth {
  auth_validation_token: string;
  auth_request_id: string;
  ip_address?: string;
  user_agent?: string;
  nonce?: string;
}
export const authWebAuth = {
  start: async ({
    user_id,
    username,
    timeout_in_seconds,
    origin_location_data,
    action_name,
    short_msg,
    nonce,
    webauthn_client_id,
    ip_address,
    user_agent
  }: IauthWebAuth) => {
    try {
      const data = await FetchFunction.post(baseUrl(null).start, {
        ...removeUndefined({
          user_id,
          username,
          timeout_in_seconds,
          origin_location_data,
          action_name,
          short_msg,
          nonce,
          webauthn_client_id,
          ip_address,
          user_agent
        })
      });

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  },
  finish: async ({
    authenticator_response_data,
    aa_sig,
    auth_request_id,
    webauthn_client_id
  }: IfinishWebAuth) => {
    try {
      const data = await FetchFunction.post(baseUrl(null).finish, {
        ...removeUndefined({
          authenticator_response_data,
          aa_sig,
          auth_request_id,
          webauthn_client_id
        })
      });

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  },
  validate: async ({
    auth_validation_token,
    auth_request_id,
    ip_address,
    user_agent,
    nonce
  }: IvalidateWebAuth) => {
    try {
      const data = await FetchFunction.post(baseUrl(null).validate, {
        ...removeUndefined({
          auth_validation_token,
          auth_request_id,
          ip_address,
          user_agent,
          nonce
        })
      });

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  }
};
