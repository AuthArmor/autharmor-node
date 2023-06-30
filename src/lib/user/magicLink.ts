import Http from "axios";
import QueryString from "querystring";
import config from "../../config";
import { removeUndefined } from "../../helper/removeUndefined";
import { context_data_props } from "../auth/magicLink";
const baseUrl = (userId: string | null) => ({
  validate: `${config.apiUrlV3}/users/register/magiclink_email/validate`,
  start: `${config.apiUrlV3}/users/magiclink_email/register/start`,
  startExisting: `${config.apiUrlV3}/users/${userId}/magiclink_email/register/start`,
  updateExisting: `${config.apiUrlV3}/users/${userId}/magiclink_email/update/start`
});
export interface IregisterWithEmail {
  email_address: string;
  timeout_in_seconds?: number;
  registration_redirect_url: string;
  action_name?: string;
  short_msg?: string;
  ip_address?: string;
  context_data?: context_data_props;
  user_agent?: string;
}
export interface IverifyMagicLinkEmail {
  registration_validation_token: string;
  ip_address?: string;
  user_agent?: string;
}

export interface IlinkEmailWithUserName {
  username: string;
  user_id: string;
  email_address: string;
  timeout_in_seconds?: number;
  registration_redirect_url: string;
  action_name: string;
  short_msg: string;
  ip_address?: string;
  context_data?: context_data_props;
  user_agent?: string;
}
export interface IupdateEmail {
  username: string;
  user_id: string;
  new_email_address: string;
  timeout_in_seconds?: number;
  registration_redirect_url: string;
  context_data?: context_data_props;
  action_name: string;
  short_msg: string;
}

export const userMagicLink = {
  verifyMagicLinkEmail: async (
    {
      registration_validation_token,
      ip_address,
      user_agent
    }: IverifyMagicLinkEmail,
    token: string
  ) => {
    try {
      const { data } = await Http.post(
        baseUrl(null).validate,
        {
          ...removeUndefined({
            registration_validation_token,
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
  registerWithEmail: async (
    {
      email_address,
      timeout_in_seconds = 299,
      registration_redirect_url,
      action_name = "Register",
      short_msg = "Register to website with AuthArmor",
      ip_address,
      context_data,
      user_agent
    }: IregisterWithEmail,
    token: string
  ) => {
    try {
      const { data }: any = await Http.post(
        baseUrl(null).start,
        {
          ...removeUndefined({
            email_address,
            timeout_in_seconds,
            registration_redirect_url,
            action_name,
            context_data,
            short_msg,
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
  linkEmailWithUserName: async (
    {
      username,
      user_id,
      email_address,
      timeout_in_seconds = 3600,
      registration_redirect_url,
      context_data,
      action_name = "Register",
      short_msg = "Register to website with AuthArmor",
      ip_address,
      user_agent
    }: IlinkEmailWithUserName,
    token: string
  ) => {
    try {
      const { data } = await Http.post(
        baseUrl(user_id).startExisting,
        {
          ...removeUndefined({
            email_address,
            timeout_in_seconds,
            registration_redirect_url,
            action_name,
            context_data,
            short_msg,
            ip_address,
            user_agent
          })
        },
        {
          headers: {
            "X-AuthArmor-UsernameValue": username,
            Authorization: `Bearer ${token}`
          }
        }
      );

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  },
  updateEmail: async (
    {
      username,
      user_id,
      new_email_address,
      timeout_in_seconds = 290,
      registration_redirect_url,
      action_name = "Update",
      short_msg = "Update your email",
      context_data
    }: IupdateEmail,
    token: string
  ) => {
    try {
      const { data } = await Http.post(
        baseUrl(user_id).updateExisting,
        {
          ...removeUndefined({
            new_email_address,
            timeout_in_seconds,
            registration_redirect_url,
            action_name,
            short_msg,
            context_data
          })
        },
        {
          headers: {
            "X-AuthArmor-UsernameValue": username,
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
