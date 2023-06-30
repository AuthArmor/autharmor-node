import Http from "axios";
import QueryString from "querystring";
import config from "../../config";

const baseUrl = (auth_request_id: string | null) => ({
  authInfo: `${config.apiUrlV3}/auth/${auth_request_id}`
});

export interface IauthInfo {
  auth_request_id: string;
}
export const auth = {
  get: async ({ auth_request_id }: IauthInfo, token: string) => {
    try {
      const { data } = await Http.get(baseUrl(auth_request_id).authInfo, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return data;
    } catch (error) {
      throw error?.response?.data ?? error;
    }
  }
};
