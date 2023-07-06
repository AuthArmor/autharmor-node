import Http from "axios";
import QueryString from "querystring";
import config from "../../config";
import { FetchFunction } from "../../helper/fetch";

const baseUrl = (auth_request_id: string | null) => ({
  authInfo: `${config.apiUrlV3}/auth/${auth_request_id}`
});

export interface IauthInfo {
  auth_request_id: string;
}
export const auth = {
  get: async ({ auth_request_id }: IauthInfo) => {
    try {
      const data = await FetchFunction.get(
        baseUrl(auth_request_id).authInfo,
        {}
      );
      return data;
    } catch (error) {
      throw error?.response?.data ?? error;
    }
  }
};
