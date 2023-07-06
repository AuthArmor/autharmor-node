import Http from "axios";
import QueryString from "querystring";
import config from "../config";
import tokenGenerator from "./token";
interface IHeaders {
  [key: string]: any;
}
interface IBody {
  [key: string]: any;
}
const FetchFunction = {
  get: async (url: string, headers?: IHeaders) => {
    const token = await new tokenGenerator("", "").getToken();
    try {
      const { data } = await Http.get(url, {
        headers: { ...{ Authorization: `Bearer ${token}` }, ...(headers ?? {}) }
      });

      return data;
    } catch (error) {
      throw error;
    }
  },
  post: async (url: string, body: IBody, headers?: IHeaders) => {
    const token = await new tokenGenerator("", "").getToken();
    try {
      const { data } = await Http.post(url, body, {
        headers: {
          ...{
            Authorization: `Bearer ${token}`
          },
          ...(headers ?? {})
        }
      });
      return data;
    } catch (e) {
      throw e;
    }
  },
  put: async (url: string, body: IBody, headers?: IHeaders) => {
    const token = await new tokenGenerator("", "").getToken();
    try {
      const { data } = await Http.put(url, body, {
        headers: {
          ...{
            Authorization: `Bearer ${token}`
          },
          ...(headers ?? {})
        }
      });
      return data;
    } catch (e) {
      throw e;
    }
  },
  delete: async (url: string, body: IBody, headers?: IHeaders) => {}
};
export { FetchFunction };
