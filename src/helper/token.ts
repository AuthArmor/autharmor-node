import Http from "axios";
import QueryString from "querystring";
import config from "../config";
class extendToken {
  private tokenExpiration = 0;
  private token = "";
  private clientId = "";
  private clientSecret = "";
  private static instance: extendToken;
  constructor(clientId: string, clientSecret: string) {
    if (extendToken.instance) return extendToken.instance;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.extendToken();
    extendToken.instance = this;
  }
  private async extendToken() {
    if (this.tokenExpiration <= Date.now() + 2 * 60 * 1000) {
      const { data } = await Http.post(
        `${config.loginURL}/connect/token`,
        QueryString.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "client_credentials"
        })
      );
      this.token = data.access_token;
      this.tokenExpiration = Date.now() + 8 * 60 * 1000;
    }
  }

  public async getToken() {
    await this.extendToken();
    return this.token;
  }
}

export default extendToken;
