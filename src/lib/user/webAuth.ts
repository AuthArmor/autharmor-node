import Http from "axios";
import QueryString from "querystring";
import config from "../../config";
import { FetchFunction } from "../../helper/fetch";
import { removeUndefined } from "../../helper/removeUndefined";

const baseUrl = (userId: string | null) => ({
  startExisting: `${config.apiUrlV3}/users/${userId}/webauthn/register/start`,
  start: `${config.apiUrlV3}/users/webauthn/register/start`,
  finish: `${config.apiUrlV3}/users/webauthn/register/finish`,
  finishExisting: `${config.apiUrlV3}/users/${userId}/webauthn/update/start`
});

export interface IlinkWebAuth {
  timeout_in_seconds: number;
  webauthn_client_id: string;
  attachment_type: string;
  username: string;
  user_id: string;
}
export interface IregisterWithWebAuth {
  username: string;
  email_address: string;
  timeout_in_seconds: number;
  webauthn_client_id?: string;
  attachment_type: string;
}
export interface IfinishRegisterWebAuth {
  registration_id: string;
  aa_sig: string;
  authenticator_response_data: {
    id: string;
    attestation_object: string;
    client_data: string;
  };
  webauthn_client_id: string;
  fido2_registration_data?: {
    id: string;
    attestation_object: string;
    client_data: string;
  };
}

export interface IfinishWebAuthExisting {
  registration_id: string;
  aa_sig: string;
  user_id: string;
  username: string;
  authenticator_response_data: {
    id: string;
    attestation_object: string;
    client_data: string;
  };
  webauthn_client_id: string;
  fido2_registration_data: {
    id: string;
    attestation_object: string;
    client_data: string;
  };
}
export const userWebAuth = {
  linkWebAuthWithUserName: async ({
    timeout_in_seconds,
    username,
    user_id,
    webauthn_client_id,
    attachment_type = "any"
  }: IlinkWebAuth) => {
    try {
      const data = await FetchFunction.post(baseUrl(user_id).startExisting, {
        ...removeUndefined({
          timeout_in_seconds,
          username,
          user_id,
          webauthn_client_id,
          attachment_type
        })
      });
      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  },
  registerWithWebAuth: async ({
    username,
    email_address,
    timeout_in_seconds,
    webauthn_client_id,
    attachment_type
  }: IregisterWithWebAuth) => {
    try {
      const data = FetchFunction.post(baseUrl(null).start, {
        ...removeUndefined({
          username,
          email_address,
          timeout_in_seconds,
          webauthn_client_id,
          attachment_type
        })
      });

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  },
  finishWebAuth: async ({
    registration_id,
    aa_sig,
    authenticator_response_data,
    webauthn_client_id,
    fido2_registration_data
  }: IfinishRegisterWebAuth) => {
    try {
      const data = FetchFunction.post(baseUrl(null).finish, {
        ...removeUndefined({
          registration_id,
          aa_sig,
          authenticator_response_data,
          fido2_registration_data,
          webauthn_client_id
        })
      });

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  },
  finishWebAuthExisting: async ({
    registration_id,
    aa_sig,
    user_id,
    username,
    authenticator_response_data,
    webauthn_client_id,
    fido2_registration_data
  }: IfinishWebAuthExisting) => {
    try {
      const data = FetchFunction.post(
        baseUrl(user_id).finishExisting,
        {
          ...removeUndefined({
            registration_id,
            aa_sig,
            authenticator_response_data,
            webauthn_client_id,
            fido2_registration_data
          })
        },
        {
          "X-AuthArmor-UsernameValue": username
        }
      );

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  }
};
