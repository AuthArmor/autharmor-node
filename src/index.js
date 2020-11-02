const Http = require("axios");
const QueryString = require("querystring");
const config = require("./config");

const defaultAuthConfig = {
  accepted_auth_methods: [
    {
      name: "MobileDevice",
      rules: [
        {
          name: "AllowBluetooth",
          value: true
        }
      ]
    }
  ],
  timeout_in_seconds: 60,
  action_name: "Login",
  short_msg: "Someone is trying to login to your autharmor account"
};

class AuthArmorSDK {
  constructor({ clientId, clientSecret }) {
    this.init({ clientId, clientSecret });
  }

  init({ clientId, clientSecret }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.token = null;
    this.tokenExpiration = Date.now();
  }

  async _verifyToken() {
    if (this.tokenExpiration <= Date.now() + 2 * 60 * 1000) {
      const { data: accessToken } = await Http.post(
        `${config.AUTHARMOR_LOGIN_URL}/connect/token`,
        QueryString.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "client_credentials"
        })
      );
      this.token = accessToken;
      this.tokenExpiration = Date.now() + 8 * 60 * 1000;
    }
  }

  async authenticate(authConfig = {}) {
    try {
      await this._verifyToken();
      const { data } = await Http.post(
        `${config.loginURL}/auth/request`,
        {
          ...defaultAuthConfig,
          ...authConfig
        },
        {
          Authorization: `Bearer ${this.token}`
        }
      );
      return data;
    } catch (err) {
      return err.response.data;
    }
  }

  async invite(inviteConfig = {}) {
    await this._verifyToken();
    const { data } = await Http.post(
      `${config.loginURL}/invite/request`,
      {
        nickname: inviteConfig.nickname,
        referenceId: inviteConfig.referenceId
      },
      {
        Authorization: `Bearer ${this.token}`
      }
    );

    return data;
  }
}

export default AuthArmorSDK;
