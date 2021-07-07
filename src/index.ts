import Http, { AxiosResponse } from "axios";
import QueryString from "querystring";
import WebSocket from "ws";
import { Server as HTTPServer } from "http";
import { Server as HTTPSServer } from "https";
import config from "./config";

const defaultAuthConfig: Partial<AuthSettings> = {
  timeout_in_seconds: 60,
  action_name: "Login",
  short_msg: "Someone is trying to login using your Auth Armor account"
};

interface SDKSettings {
  clientId: string;
  clientSecret: string;
  server?: HTTPServer | HTTPSServer;
  polling: boolean;
}

interface WebsocketListeners {
  [x: string]: WebSocket[];
}

interface SocketEmission {
  id: string;
  data: any;
}

interface InviteSettings {
  nickname: string;
  referenceId?: string;
}

interface LocationData {
  latitude: string;
  longitude: string;
}

interface AuthSettings {
  nickname: string;
  nonce: string;
  timeout_in_seconds: number;
  origin_location_data: LocationData;
  action_name: string;
  short_msg: string;
}

interface AuthRequest {
  auth_request_id: string;
  auth_profile_id: string;
  visual_verify_value: string;
  response_code: number;
  response_message: string;
  qr_code_data: string;
  push_message_sent: boolean;
}

class AuthArmorSDK {
  private clientId: string = "";
  private clientSecret: string = "";
  private tokenExpiration: number = Date.now();
  private token: string | null = null;
  private websockets: WebsocketListeners = {};

  constructor({
    clientId,
    clientSecret,
    server,
    polling = false
  }: SDKSettings) {
    this.init({ clientId, clientSecret, server, polling });
  }

  private init({
    clientId,
    clientSecret,
    server,
    polling = false
  }: SDKSettings) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    if (!polling && server) {
      const socketServer = new WebSocket.Server({
        server,
        path: "/auth/autharmor/socket",
        noServer: !server
      });

      socketServer.on("connection", socket => {
        socket.on("message", data => {
          try {
            if (typeof data !== "string") {
              return;
            }

            const parsedData = JSON.parse(data);

            if (parsedData.event === "subscribe:auth") {
              this.websockets = {
                ...this.websockets,
                [parsedData.data.requestId]: [
                  ...this.websockets[parsedData.data.authId],
                  socket
                ]
              };
            }
          } catch (err) {
            console.error(err);
          }
        });
      });
    }
  }

  private emitSockets({ id, data }: SocketEmission) {
    const sockets = this.websockets[id] || [];
    sockets.map(socket => socket.send(JSON.stringify(data)));
  }

  private wait(ms: number) {
    return new Promise(resolve => setTimeout(() => resolve(true), ms));
  }

  private async verifyToken() {
    if (this.tokenExpiration <= Date.now() + 2 * 60 * 1000) {
      const { data: accessToken } = await Http.post(
        `${config.loginURL}/connect/token`,
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

  private async pollRequest(request: AuthRequest): Promise<void> {
    const { data } = await Http.get(
      `${config.apiUrl}/auth/request/${request.auth_request_id}`
    );

    if (data.auth_request_status_name !== "Pending") {
      this.emitSockets({
        id: request.auth_request_id,
        data: {
          event: "auth:response",
          data
        }
      });
      return;
    }

    await this.wait(500);

    this.pollRequest(request);
  }

  public async authenticate(authConfig: Partial<AuthSettings>) {
    try {
      await this.verifyToken();
      const { data }: AxiosResponse<AuthRequest> = await Http.post(
        `${config.apiUrl}/auth/request/async`,
        {
          ...defaultAuthConfig,
          ...authConfig
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      this.pollRequest(data);

      return data;
    } catch (err) {
      throw err.response.data;
    }
  }

  public async invite({ nickname, referenceId }: InviteSettings) {
    await this.verifyToken();
    const { data } = await Http.post(
      `${config.apiUrl}/invite/request`,
      {
        nickname: nickname,
        referenceId: referenceId
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    );

    return data;
  }
}

export default AuthArmorSDK;
