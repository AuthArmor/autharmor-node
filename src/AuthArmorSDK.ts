import Http, { AxiosResponse } from "axios";
import QueryString from "querystring";
import WebSocket from "ws";
import { Server as HTTPServer } from "http";
import { Server as HTTPSServer } from "https";
import Express, { NextFunction, Request, Response } from "express";
import JWT from "jsonwebtoken";
import config from "./config";

const defaultAuthConfig: Partial<AuthSettings> = {
  timeout_in_seconds: 60,
  action_name: "Login",
  short_msg: "Someone is trying to login using your Auth Armor account",
  send_push: true,
  use_visual_verify: false
};

interface SuccessCallbackArgs {
  nickname: string;
  success: boolean;
  status: string;
  rawResponse: any;
}

interface MiddlewareArgs {
  onAuthSuccess: (args: SuccessCallbackArgs) => any;
  authConfig: Partial<AuthSettings>;
}

interface SDKSettings {
  clientId: string;
  clientSecret: string;
  authTimeout?: number;
  server?: HTTPServer | HTTPSServer;
  polling?: boolean;
  secret: string;
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
  ip?: string;
  latitude?: string;
  longitude?: string;
}

interface AuthSettings {
  nickname: string;
  nonce: string;
  timeout_in_seconds: number;
  origin_location_data: LocationData;
  action_name: string;
  short_msg: string;
  send_push: boolean;
  use_visual_verify: boolean;
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

interface AuthenticateArgs {
  config: Partial<AuthSettings>;
  onAuthSuccess: (args: SuccessCallbackArgs) => any;
}

interface RequestPollArgs {
  request: AuthRequest;
  onAuthSuccess: (args: SuccessCallbackArgs) => any;
}

export default class AuthArmorSDK {
  private clientId: string = "";
  private clientSecret: string = "";
  private tokenExpiration: number = Date.now();
  private token: string | null = null;
  private secret: string = "";
  private authTimeout: number = 60;
  private websockets: WebsocketListeners = {};
  private onAuthSuccess: (args: SuccessCallbackArgs) => any = () => {};

  constructor({
    clientId,
    clientSecret,
    server,
    authTimeout = 60,
    polling = false,
    secret
  }: SDKSettings) {
    if (!secret) {
      throw new Error(
        "Please specify a value in the secret property when initializing the AuthArmor SDK"
      );
    }

    this.authTimeout = authTimeout;

    this.onAuthSuccess = () => {};
    this.init({ clientId, clientSecret, server, polling, secret });
  }

  private init({
    clientId,
    clientSecret,
    server,
    polling,
    secret
  }: SDKSettings) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.secret = secret;

    this.initUpdateConnection({ server, polling });
  }

  private initUpdateConnection({ server, polling }: Partial<SDKSettings>) {
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
                [parsedData.data.id]: [
                  ...(this.websockets[parsedData.data.id] ?? []),
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

  private async pollRequest({
    request,
    onAuthSuccess
  }: RequestPollArgs): Promise<void> {
    try {
      await this.verifyToken();
      const { data } = await Http.get(
        `${config.apiUrl}/auth/request/${request.auth_request_id}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      if (data.auth_request_status_name !== "Pending") {
        if (data.auth_response.authorized) {
          const authorized = data.auth_response.authorized;
          const nickname =
            data.auth_response.auth_details.request_details.auth_profile_details
              .nickname;
          const responseData = await (onAuthSuccess || this.onAuthSuccess)?.({
            nickname,
            success: authorized,
            status: data.auth_request_status_name,
            rawResponse: data
          });

          const token = JWT.sign(
            {
              nickname,
              authorized,
              type: "user",
              autharmor: true
            },
            this.secret
          );

          this.emitSockets({
            id: request.auth_request_id,
            data: {
              event: "auth:response",
              data: {
                response: data,
                token,
                nickname,
                authorized,
                status: data.auth_request_status_name,
                metadata: responseData
              }
            }
          });
        }

        this.emitSockets({
          id: request.auth_request_id,
          data: {
            event: "auth:response",
            data: {
              response: data,
              status: data.auth_request_status_name,
              authorized: false
            }
          }
        });
        return;
      }

      await this.wait(500);

      this.pollRequest({ request, onAuthSuccess });
    } catch (err) {
      this.emitSockets({
        id: request.auth_request_id,
        data: {
          event: "auth:response",
          data: {
            response: err?.response?.data ?? null,
            authorized: false
          }
        }
      });
    }
  }

  public routes({ onAuthSuccess, authConfig = {} }: MiddlewareArgs) {
    const router = Express.Router();

    router.use(Express.json());

    router.get("/me", async (req, res) => {
      try {
        const token = req.headers.authorization;

        if (!token) {
          res.status(400).json({
            message: "Please specify a valid Authorization token",
            success: false
          });
          return;
        }

        const verified = JWT.verify(token, this.secret) as JWT.JwtPayload;

        if (!verified.autharmor) {
          res.status(400).json({
            message: `Non-autharmor token provided`,
            success: false
          });
          return;
        }

        if (verified.type !== "user") {
          res.status(400).json({
            message: `The provided token has an invalid type: ${verified.type}`,
            success: false
          });
          return;
        }

        res.status(400).json({
          data: {
            nickname: verified.nickname,
            authorized: verified.authorized,
            expiresIn: verified.exp
          },
          success: true
        });
      } catch (err) {
        res.status(400).json({
          code: err.errorCode,
          message: err.errorMessage,
          success: false
        });
      }
    });

    router.post(
      "/authenticate",
      async (req: Request<any, any, Partial<AuthSettings>>, res) => {
        try {
          const mergedConfig = { ...req.body, ...authConfig };
          const response = await this.authenticate({
            config: {
              ...mergedConfig,
              timeout_in_seconds: this.authTimeout,
              action_name:
                mergedConfig.action_name ?? defaultAuthConfig.action_name,
              nickname: mergedConfig.nickname,
              origin_location_data: mergedConfig.origin_location_data ?? {
                ip: (req.headers["x-forwarded-ip"] as string)
                  ?.split(", ")
                  .slice(-1)[0]
              },
              short_msg: mergedConfig.short_msg ?? defaultAuthConfig.short_msg,
              nonce: mergedConfig.nonce,
              send_push: mergedConfig.send_push,
              use_visual_verify: mergedConfig.use_visual_verify
            },
            onAuthSuccess
          });

          res.status(200).json(response);
        } catch (err) {
          res.status(400).json({
            code: err.errorCode,
            message: err.errorMessage,
            success: false
          });
        }
      }
    );

    router.post(
      "/invite",
      async (req: Request<any, any, InviteSettings>, res) => {
        try {
          const response = await this.invite(req.body);

          res.json({
            data: response,
            success: true
          });
        } catch (err) {
          res.status(400).json({
            code: err.errorCode,
            message: err.errorMessage,
            success: false
          });
        }
      }
    );

    return router;
  }

  public middleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (!token) {
      return next();
    }

    const verified = JWT.verify(token, this.secret) as JWT.JwtPayload;

    if (!verified.autharmor || verified.type !== "user") {
      return next();
    }

    res.locals.authArmorUser = {
      nickname: verified.nickname,
      authorized: verified.authorized,
      expiresIn: verified.exp
    };

    return next();
  }

  public async authenticate({
    config: authConfig,
    onAuthSuccess
  }: AuthenticateArgs) {
    try {
      const mergedAuthConfig = {
        ...defaultAuthConfig,
        ...authConfig
      };
      await this.verifyToken();
      const { data }: AxiosResponse<AuthRequest> = await Http.post(
        `${config.apiUrl}/auth/request/async`,
        mergedAuthConfig,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      const timeout =
        Date.now() + (mergedAuthConfig.timeout_in_seconds ?? 60) * 1000;

      const requestToken = JWT.sign(
        {
          requestId: data.auth_request_id,
          type: "request",
          autharmor: true
        },
        this.secret,
        {
          expiresIn:
            Date.now() + (mergedAuthConfig.timeout_in_seconds ?? 60) * 1000
        }
      );

      this.pollRequest({ request: data, onAuthSuccess });

      return { authRequest: data, requestToken, timeout };
    } catch (err) {
      throw err.response?.data ?? err;
    }
  }

  public async invite({ nickname, referenceId }: InviteSettings) {
    try {
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
    } catch (err) {
      throw err.response?.data ?? err;
    }
  }
}
