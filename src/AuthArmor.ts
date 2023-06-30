import Http from "axios";
import QueryString from "querystring";
import { IAuthArmorSdk } from "./AuthArmor.interface";
import {
  IconstructorProps,
  IregisterWithEmailResponse,
  IverfiyMagicLinkEmailResponse,
  IlinkEmailWithUserNameResponse,
  IupdateEmailResponse,
  IupdateUserResponse,
  IgetUserResponse,
  IgetAllUserResponse,
  IgetUserAuthResponse,
  IvalidateAuthMagicLinkResponse,
  IstartAuthMagicLinkResponse,
  IregisterAuthResponse,
  IlinkAuthWithUserNameResponse,
  IstartAuthResponse,
  IverifyAuthResponse,
  Iauth_history_records,
  IlinkWebAuthWithUserName,
  IregisterWebAuthResponse,
  IfinishWebAuthResponse,
  IfinishWebAuthExistingResponse,
  IstartWebAuthResponse,
  IvalidateWebAuthResponse,
  IsignInResponse
} from "./AuthArmorResponses.interface";
import config from "./config";
import { delay } from "./helper/delay";
import { auth, IauthInfo } from "./lib/auth/auth";
import {
  authAuthenticator,
  IstartAuthWithAutenticator,
  IvalidateAuthWithAutenticator
} from "./lib/auth/authenticator";
import {
  authMagicLink,
  IstartAuthMagicLink,
  IvalidateAuthMagicLink
} from "./lib/auth/magicLink";
import {
  authWebAuth,
  IauthWebAuth,
  IfinishWebAuth,
  IvalidateWebAuth
} from "./lib/auth/webAuth";
import {
  IlinkAuth,
  IregisterWithAuthenticator,
  userAuthenticator
} from "./lib/user/authenticator";
import {
  IlinkEmailWithUserName,
  IregisterWithEmail,
  IupdateEmail,
  userMagicLink,
  IverifyMagicLinkEmail
} from "./lib/user/magicLink";
import {
  IgetAllUser,
  IgetUserAuth,
  IgetUser,
  IupdateUser,
  user
} from "./lib/user/users";
import {
  IlinkWebAuth,
  IregisterWithWebAuth,
  IfinishRegisterWebAuth,
  IfinishWebAuthExisting,
  userWebAuth
} from "./lib/user/webAuth";

class AuthArmorSDK implements IAuthArmorSdk {
  private clientId: string = "";
  private clientSecret: string = "";
  private tokenExpiration: number = Date.now();
  private token: string = "";
  private webauthnClientId?: string;
  constructor({ clientId, clientSecret, webauthnClientId }: IconstructorProps) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.webauthnClientId = webauthnClientId;
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

  public async registerWithEmail(
    emailProps: IregisterWithEmail
  ): Promise<[IregisterWithEmailResponse | null, null | any]> {
    try {
      await this.extendToken();
      const response: IregisterWithEmailResponse = await userMagicLink.registerWithEmail(
        { ...emailProps },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async verifyMagicLinkEmail(
    verifyProps: IverifyMagicLinkEmail
  ): Promise<[IverfiyMagicLinkEmailResponse | null, null | any]> {
    try {
      await this.extendToken();
      const response: IverfiyMagicLinkEmailResponse = await userMagicLink.verifyMagicLinkEmail(
        { ...verifyProps },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async linkEmailWithUserName(
    linkProps: IlinkEmailWithUserName
  ): Promise<[null | IlinkEmailWithUserNameResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await userMagicLink.linkEmailWithUserName(
        {
          ...linkProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async updateEmail(
    updateEmailProps: IupdateEmail
  ): Promise<[null | IupdateEmailResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await userMagicLink.updateEmail(
        {
          ...updateEmailProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }

  public async updateUser(
    updateUserProps: IupdateUser
  ): Promise<[null | IupdateUserResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await user.update(
        {
          ...updateUserProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async checkRegistartion(
    getUserProps: IgetUser,
    timeOutInSeconds = 30
  ): Promise<[null | IgetUserResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await user.get(
        {
          ...getUserProps
        },
        this.token
      );

      if (
        response &&
        response.enrolled_auth_methods &&
        response.enrolled_auth_methods.findIndex(
          (data: any) => data.auth_method_name === "AuthArmorAuthenticator"
        ) !== -1
      ) {
        return [response, null];
      } else {
        console.log(timeOutInSeconds);
        if (timeOutInSeconds <= 0) {
          return [null, { errorMessage: "Timeout" }];
        } else {
          await delay(1500);
          return this.checkRegistartion(getUserProps, timeOutInSeconds - 1);
        }
      }
    } catch (e) {
      console.log(e.response);
      if (
        (e.response?.data && e.response?.data?.errorCode === "404") ||
        e.message === "Request failed with status code 404"
      ) {
        if (timeOutInSeconds <= 0) {
          return [null, { errorMessage: "Timeout" }];
        } else {
          await delay(1500);
          return this.checkRegistartion(getUserProps, timeOutInSeconds - 1);
        }
      } else {
        return [null, e.response?.data ?? e];
      }
    }
  }
  public async getUser(
    getUserProps: IgetUser
  ): Promise<[null | IgetUserResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await user.get(
        {
          ...getUserProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async getAll(
    getAllProps: IgetAllUser
  ): Promise<[null | IgetAllUserResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await user.getAll(
        {
          ...getAllProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async getUserAuth(
    getAuthProps: IgetUserAuth
  ): Promise<[null | IgetUserAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await user.getUserAuth(
        {
          ...getAuthProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }

  public async signInMagicLink(
    validateAuthMagicLinkProps: IvalidateAuthMagicLink
  ): Promise<[null | IsignInResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authMagicLink.validateAuthMagicLink(
        {
          ...validateAuthMagicLinkProps
        },
        this.token
      );
      if (
        response.validate_auth_response_details &&
        response.validate_auth_response_details.auth_details &&
        response.validate_auth_response_details.auth_details.request_details &&
        response.validate_auth_response_details.auth_details.request_details
          .auth_profile_details
      ) {
        return [
          response.validate_auth_response_details.auth_details.request_details
            .auth_profile_details,
          null
        ];
      } else {
        throw { errorMessage: "sign in not successfull" };
      }
    } catch (e) {
      return [null, e];
    }
  }
  public async signInWebAuth(
    validateWebAuthProps: IvalidateWebAuth
  ): Promise<[null | IvalidateWebAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authWebAuth.validate(
        {
          ...validateWebAuthProps
        },
        this.token
      );
      if (
        response.validate_auth_response_details &&
        response.validate_auth_response_details.auth_details &&
        response.validate_auth_response_details.auth_details.request_details &&
        response.validate_auth_response_details.auth_details.request_details
          .auth_profile_details
      ) {
        return [
          response.validate_auth_response_details.auth_details.request_details
            .auth_profile_details,
          null
        ];
      } else {
        throw { errorMessage: "sign in not successfull" };
      }
    } catch (e) {
      return [null, e];
    }
  }
  public async validateAuthMagicLink(
    validateAuthMagicLinkProps: IvalidateAuthMagicLink
  ): Promise<[null | IvalidateAuthMagicLinkResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authMagicLink.validateAuthMagicLink(
        {
          ...validateAuthMagicLinkProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async startAuthMagicLink(
    startAuthMagicLinkProps: IstartAuthMagicLink
  ): Promise<[null | IstartAuthMagicLinkResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authMagicLink.startAuthMagicLink(
        {
          ...startAuthMagicLinkProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }

  public async registerWithAuthenticator(
    registerWithAuthenticatorProps: IregisterWithAuthenticator
  ): Promise<[null | IregisterAuthResponse, null | any]> {
    try {
      await this.extendToken();

      const response = await userAuthenticator.registerWithAuthenticator(
        {
          ...registerWithAuthenticatorProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async linkAuthWithUserName(
    linkAuthWithUserNameProps: IlinkAuth
  ): Promise<[null | IlinkAuthWithUserNameResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await userAuthenticator.linkAuthWithUserName(
        {
          ...linkAuthWithUserNameProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async startAuth(
    startAuthProps: IstartAuthWithAutenticator
  ): Promise<[null | IstartAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authAuthenticator.start(
        {
          ...startAuthProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async verifyAuthPoll(
    verifyAuthProps: IvalidateAuthWithAutenticator,
    timeOutInSeconds = 30
  ): Promise<[null | IverifyAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authAuthenticator.validate(
        {
          ...verifyAuthProps
        },
        this.token
      );

      if (response && response.auth_request_status_name == "pending") {
      }
      if (response && response.auth_request_status_name == "Completed") {
        if (
          response.validate_auth_response_details &&
          response.validate_auth_response_details.authorized
        ) {
          return [response, null];
        } else {
          throw { errorMessage: "Rejected" };
        }
      }
      if (timeOutInSeconds <= 0) {
        throw { errorMessage: "Timeout" };
      } else {
        await delay(1500);
        return this.verifyAuthPoll(verifyAuthProps, timeOutInSeconds - 1);
      }
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async verifyAuth(
    verifyAuthProps: IvalidateAuthWithAutenticator
  ): Promise<[null | IverifyAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authAuthenticator.validate(
        {
          ...verifyAuthProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async getAuthInfo(
    getAuthInfoProps: IauthInfo
  ): Promise<[null | Iauth_history_records, null | any]> {
    try {
      await this.extendToken();
      const response = await auth.get(
        {
          ...getAuthInfoProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async linkWebAuthWithUserName(
    linkWebAuthWithUserNameProps: IlinkWebAuth
  ): Promise<[null | IlinkWebAuthWithUserName, null | any]> {
    try {
      await this.extendToken();
      const response = await userWebAuth.linkWebAuthWithUserName(
        {
          ...linkWebAuthWithUserNameProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async registerWithWebAuth(
    registerWithWebAuthProps: IregisterWithWebAuth
  ): Promise<[null | IregisterWebAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await userWebAuth.registerWithWebAuth(
        {
          ...registerWithWebAuthProps,
          ...{ webauthn_client_id: this.webauthnClientId }
        },
        this.token
      );

      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async finishWebRegister(
    finishWebRegisterProps: IfinishRegisterWebAuth
  ): Promise<[null | IfinishWebAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await userWebAuth.finishWebAuth(
        {
          ...finishWebRegisterProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async finishWebAuthExisting(
    finishWebAuthExistingProps: IfinishWebAuthExisting
  ): Promise<[null | IfinishWebAuthExistingResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await userWebAuth.finishWebAuthExisting(
        {
          ...finishWebAuthExistingProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async startWebAuth(
    startWebAuthProps: IauthWebAuth
  ): Promise<[null | IstartWebAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authWebAuth.start(
        {
          ...startWebAuthProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async finishWebAuth(
    finishWebAuthProps: IfinishWebAuth
  ): Promise<[null | IfinishWebAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authWebAuth.finish(
        {
          ...finishWebAuthProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
  public async validateWebAuth(
    validateWebAuthProps: IvalidateWebAuth
  ): Promise<[null | IvalidateWebAuthResponse, null | any]> {
    try {
      await this.extendToken();
      const response = await authWebAuth.validate(
        {
          ...validateWebAuthProps
        },
        this.token
      );
      return [response, null];
    } catch (e) {
      return [null, e];
    }
  }
}
export default AuthArmorSDK;
