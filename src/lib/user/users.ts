import Http from "axios";
import QueryString from "querystring";
import config from "../../config";
import { FetchFunction } from "../../helper/fetch";
import { removeUndefined } from "../../helper/removeUndefined";

const baseUrl = (user_id: string | null) => ({
  update: `${config.apiUrlV3}/users/${user_id}`,
  get: `${config.apiUrlV3}/users/${user_id}`,
  getAll: `${config.apiUrlV3}/users`,
  getUserAuth: `${config.apiUrlV3}/users/${user_id}/auth_history`
});
export interface IupdateUser {
  user_name: string;
  user_id: string;
  new_username: string;
}
export interface IgetUser {
  user_name: string;
  user_id: string;
  timeOutInSeconds?: number;
}
export interface IgetAllUser {
  sort_column?: number;
  sort_direction?: string;
  page_size?: number;
  page_number?: number;
  user_filter_string?: string;
}
export interface IgetUserAuth {
  user_name: string;
  user_id: string;
  sort_column?: number;
  sort_direction?: string;
  page_size?: number;
  page_number?: number;
}
export const user = {
  update: async ({ user_name, user_id, new_username }: IupdateUser) => {
    try {
      const data = await FetchFunction.put(
        baseUrl(user_id).update,
        {
          new_username
        },
        {
          "X-AuthArmor-UsernameValue": user_name
        }
      );

      return data;
    } catch (error) {
      throw error?.response?.data ?? error;
    }
  },
  get: async ({ user_name, user_id }: IgetUser) => {
    try {
      const data = await FetchFunction.get(baseUrl(user_id).get, {
        "X-AuthArmor-UsernameValue": user_name
      });

      return data;
    } catch (err) {
      throw err;
    }
  },
  getAll: async ({
    sort_column,
    sort_direction,
    page_size,
    page_number,
    user_filter_string
  }: IgetAllUser) => {
    try {
      const filteredObject = removeUndefined({
        sort_column,
        sort_direction,
        page_size,
        page_number,
        user_filter_string
      });
      const queryString =
        Object.keys(filteredObject).length > 0
          ? "?" + QueryString.stringify(filteredObject)
          : "";
      const data = await FetchFunction.get(baseUrl(null).getAll + queryString);

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  },
  getUserAuth: async ({
    user_name,
    user_id,
    sort_column,
    sort_direction,
    page_size,
    page_number
  }: IgetUserAuth) => {
    try {
      const filteredObject = removeUndefined({
        sort_column,
        sort_direction,
        page_size,
        page_number
      });
      const queryString =
        Object.keys(filteredObject).length > 0
          ? "?" + QueryString.stringify(filteredObject)
          : "";
      const data = await FetchFunction.get(
        baseUrl(user_id).getUserAuth + queryString,
        {
          "X-AuthArmor-UsernameValue": user_name
        }
      );

      return data;
    } catch (err) {
      throw err?.response?.data ?? err;
    }
  }
};
