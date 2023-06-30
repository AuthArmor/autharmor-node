import Http from "axios";
import QueryString from "querystring";
import config from "../../config";
import { removeUndefined } from "../../helper/removeUndefined";

const baseUrl = (userId: string | null) => ({
  start: `${config.apiUrlV3}/auth/authenticator/start`,
  validate: `${config.apiUrlV3}/auth/authenticator/validate`
});
export interface IstartAuthWithAutenticator {
  user_id: string;
  username: string;
  use_visual_verify?: boolean;
  send_push: boolean;
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
export interface IvalidateAuthWithAutenticator {
  auth_validation_token: string;
  auth_request_id: string;
  ip_address?: string;
  user_agent?: string;
  nonce?: string;
}
export const authAuthenticator = {
  start: async (
    {
      user_id,
      username,
      timeout_in_seconds,
      send_push,
      origin_location_data,
      action_name,
      short_msg,
      nonce,
      use_visual_verify,
      ip_address,
      user_agent
    }: IstartAuthWithAutenticator,
    token: string
  ) => {
    try {
      const { data } = await Http.post(
        baseUrl(null).start,
        {
          ...removeUndefined({
            user_id,
            username,
            timeout_in_seconds,
            origin_location_data,
            action_name,
            short_msg,
            send_push,
            token,
            nonce,
            use_visual_verify,
            ip_address,
            user_agent
          })
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  },
  validate: async (
    {
      auth_validation_token,
      auth_request_id,
      ip_address,
      user_agent,
      nonce
    }: IvalidateAuthWithAutenticator,
    token: string
  ) => {
    try {
      const { data } = await Http.post(
        baseUrl(null).validate,
        {
          ...removeUndefined({
            auth_validation_token,
            auth_request_id,
            ip_address,
            user_agent,
            nonce
          })
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  }
};
