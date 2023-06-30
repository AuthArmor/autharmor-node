import Http from "axios";
import QueryString from "querystring";
import config from "../../config";
import { removeUndefined } from "../../helper/removeUndefined";
const baseUrl = (userId: string | null) => ({
  start: `${config.apiUrlV3}/users/authenticator/register/start`,
  startExisting: `${config.apiUrlV3}/users/${userId}/authenticator/register/start`
});

export interface IlinkAuth {
  username: string;
  user_id: string;
}
export interface IregisterWithAuthenticator {
  username: string;
  reset_and_reinvite?: boolean;
  revoke_previous_invites?: boolean;
}
export const userAuthenticator = {
  registerWithAuthenticator: async (
    {
      username,
      reset_and_reinvite = false,
      revoke_previous_invites = false
    }: IregisterWithAuthenticator,
    token: string
  ) => {
    try {
      const dataProps = {
        ...removeUndefined({
          username,
          reset_and_reinvite,
          Nickname: username,
          revoke_previous_invites
        })
      };
      const { data }: any = await Http.post(baseUrl(null).start, dataProps, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  },
  linkAuthWithUserName: async (
    { username, user_id }: IlinkAuth,
    token: string
  ) => {
    try {
      const { data } = await Http.post(
        baseUrl(user_id).startExisting,
        {},
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
