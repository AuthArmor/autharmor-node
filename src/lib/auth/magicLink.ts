import Http from "axios";
import QueryString from "querystring";
import config from "../../config";
import { FetchFunction } from "../../helper/fetch";
import { removeUndefined } from "../../helper/removeUndefined";
const baseUrl = (userId: string | null) => ({
  validate: `${config.apiUrlV3}/auth/magiclink_email/validate`,
  start: `${config.apiUrlV3}/auth/magiclink_email/start`
});
export interface context_data_props {
  [key: string]: string;
}
export interface IvalidateAuthMagicLink {
  auth_validation_token: string;
  ip_address?: string;
  user_agent?: string;
  auth_request_id: string;
  nonce?: string;
}
export interface IstartAuthMagicLink {
  user_id: string;
  username: string;
  timeout_in_seconds?: number;
  origin_location_data?: {
    latitude: string;
    longitude: string;
    ip_address: string;
  };
  action_name: string;
  short_msg: string;
  auth_redirect_url: string;
  context_data?: context_data_props;
  ip_address?: string;
  user_agent?: string;
}
export const authMagicLink = {
  validateAuthMagicLink: async ({
    auth_validation_token,
    ip_address,
    user_agent,
    auth_request_id,
    nonce
  }: IvalidateAuthMagicLink) => {
    try {
      const data = await FetchFunction.post(baseUrl(null).validate, {
        ...removeUndefined({
          auth_validation_token,
          auth_request_id,
          nonce,
          ip_address,
          user_agent
        })
      });

      return data;
    } catch (err) {
      throw err;
    }
  },

  startAuthMagicLink: async ({
    user_id,
    username,
    timeout_in_seconds = 29,
    origin_location_data,
    action_name,
    short_msg,
    auth_redirect_url,
    context_data,
    ip_address,
    user_agent
  }: IstartAuthMagicLink) => {
    try {
      const data = await FetchFunction.post(baseUrl(null).start, {
        ...removeUndefined({
          user_id,
          username,
          timeout_in_seconds,
          origin_location_data,
          action_name,
          short_msg,
          auth_redirect_url,
          context_data,
          ip_address,
          user_agent
        })
      });

      return data;
    } catch (error) {
      throw error.response.data || error;
    }
  }
};
