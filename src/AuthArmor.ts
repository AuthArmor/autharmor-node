import Http from "axios";
import QueryString from "querystring";
import { IAuthArmorSdk } from "./AuthArmor.interface";
import extendToken from "./helper/token";
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
    new extendToken(clientId, clientSecret);
  }

  public async registerWithEmail(
    emailProps: IregisterWithEmail
  ): Promise<IregisterWithEmailResponse> {
    try {
      const response = await userMagicLink.registerWithEmail({ ...emailProps });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async verifyMagicLinkEmail(
    verifyProps: IverifyMagicLinkEmail
  ): Promise<IverfiyMagicLinkEmailResponse> {
    try {
      const response = await userMagicLink.verifyMagicLinkEmail({
        ...verifyProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async linkEmailWithUserName(
    linkProps: IlinkEmailWithUserName
  ): Promise<IlinkEmailWithUserNameResponse> {
    try {
      const response = await userMagicLink.linkEmailWithUserName({
        ...linkProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async updateEmail(
    updateEmailProps: IupdateEmail
  ): Promise<IupdateEmailResponse> {
    try {
      const response = await userMagicLink.updateEmail({
        ...updateEmailProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }

  public async updateUser(
    updateUserProps: IupdateUser
  ): Promise<IupdateUserResponse> {
    try {
      const response = await user.update({
        ...updateUserProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async checkRegistartion(
    getUserProps: IgetUser,
    timeOutInSeconds = 30
  ): Promise<IgetUserResponse> {
    try {
      const response = await user.get({
        ...getUserProps
      });

      if (
        response &&
        response.enrolled_auth_methods &&
        response.enrolled_auth_methods.findIndex(
          (data: any) => data.auth_method_name === "AuthArmorAuthenticator"
        ) !== -1
      ) {
        return response;
      } else {
        if (timeOutInSeconds <= 0) {
          throw { errorMessage: "Timeout" };
        } else {
          await delay(1500);
          return this.checkRegistartion(getUserProps, timeOutInSeconds - 1);
        }
      }
    } catch (e) {
      if (
        (e.response?.data && e.response?.data?.errorCode === "404") ||
        e.message === "Request failed with status code 404"
      ) {
        if (timeOutInSeconds <= 0) {
          throw { errorMessage: "Timeout" };
        } else {
          await delay(1500);
          return this.checkRegistartion(getUserProps, timeOutInSeconds - 1);
        }
      } else {
        throw e.response?.data ?? e;
      }
    }
  }
  public async getUser(getUserProps: IgetUser): Promise<IgetUserResponse> {
    try {
      const response = await user.get({
        ...getUserProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async getAll(getAllProps: IgetAllUser): Promise<IgetAllUserResponse> {
    try {
      const response = await user.getAll({
        ...getAllProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async getUserAuth(
    getAuthProps: IgetUserAuth
  ): Promise<IgetUserAuthResponse> {
    try {
      const response = await user.getUserAuth({
        ...getAuthProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }

  public async signInMagicLink(
    validateAuthMagicLinkProps: IvalidateAuthMagicLink
  ): Promise<IsignInResponse> {
    try {
      const response = await authMagicLink.validateAuthMagicLink({
        ...validateAuthMagicLinkProps
      });
      if (
        response.validate_auth_response_details &&
        response.validate_auth_response_details.auth_details &&
        response.validate_auth_response_details.auth_details.request_details &&
        response.validate_auth_response_details.auth_details.request_details
          .auth_profile_details
      ) {
        return response.validate_auth_response_details.auth_details
          .request_details.auth_profile_details;
      } else {
        throw { errorMessage: "sign in not successfull" };
      }
    } catch (e) {
      throw e;
    }
  }
  public async signInWebAuth(
    validateWebAuthProps: IvalidateWebAuth
  ): Promise<IvalidateWebAuthResponse> {
    try {
      const response = await authWebAuth.validate({
        ...validateWebAuthProps
      });
      if (
        response.validate_auth_response_details &&
        response.validate_auth_response_details.auth_details &&
        response.validate_auth_response_details.auth_details.request_details &&
        response.validate_auth_response_details.auth_details.request_details
          .auth_profile_details
      ) {
        return response.validate_auth_response_details.auth_details
          .request_details.auth_profile_details;
      } else {
        throw { errorMessage: "sign in not successfull" };
      }
    } catch (e) {
      throw e;
    }
  }
  public async validateAuthMagicLink(
    validateAuthMagicLinkProps: IvalidateAuthMagicLink
  ): Promise<IvalidateAuthMagicLinkResponse> {
    try {
      const response = await authMagicLink.validateAuthMagicLink({
        ...validateAuthMagicLinkProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async startAuthMagicLink(
    startAuthMagicLinkProps: IstartAuthMagicLink
  ): Promise<IstartAuthMagicLinkResponse> {
    try {
      const response = await authMagicLink.startAuthMagicLink({
        ...startAuthMagicLinkProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }

  public async registerWithAuthenticator(
    registerWithAuthenticatorProps: IregisterWithAuthenticator
  ): Promise<IregisterAuthResponse> {
    try {
      const response = await userAuthenticator.registerWithAuthenticator({
        ...registerWithAuthenticatorProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async linkAuthWithUserName(
    linkAuthWithUserNameProps: IlinkAuth
  ): Promise<IlinkAuthWithUserNameResponse> {
    try {
      const response = await userAuthenticator.linkAuthWithUserName({
        ...linkAuthWithUserNameProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async startAuth(
    startAuthProps: IstartAuthWithAutenticator
  ): Promise<IstartAuthResponse> {
    try {
      const response = await authAuthenticator.start({
        ...startAuthProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async verifyAuthPoll(
    verifyAuthProps: IvalidateAuthWithAutenticator,
    timeOutInSeconds = 30
  ): Promise<IverifyAuthResponse> {
    try {
      const response = await authAuthenticator.validate({
        ...verifyAuthProps
      });

      if (response && response.auth_request_status_name == "pending") {
      }
      if (response && response.auth_request_status_name == "Completed") {
        if (
          response.validate_auth_response_details &&
          response.validate_auth_response_details.authorized
        ) {
          return response;
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
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async verifyAuth(
    verifyAuthProps: IvalidateAuthWithAutenticator
  ): Promise<IverifyAuthResponse> {
    try {
      const response = await authAuthenticator.validate({
        ...verifyAuthProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async getAuthInfo(
    getAuthInfoProps: IauthInfo
  ): Promise<Iauth_history_records> {
    try {
      const response = await auth.get({
        ...getAuthInfoProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async linkWebAuthWithUserName(
    linkWebAuthWithUserNameProps: IlinkWebAuth
  ): Promise<IlinkWebAuthWithUserName> {
    try {
      const response = await userWebAuth.linkWebAuthWithUserName({
        ...linkWebAuthWithUserNameProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async registerWithWebAuth(
    registerWithWebAuthProps: IregisterWithWebAuth
  ): Promise<IregisterWebAuthResponse> {
    try {
      const response = await userWebAuth.registerWithWebAuth({
        ...registerWithWebAuthProps,
        ...{ webauthn_client_id: this.webauthnClientId }
      });

      return response;
    } catch (e) {
      throw e;
    }
  }
  public async finishWebRegister(
    finishWebRegisterProps: IfinishRegisterWebAuth
  ): Promise<IfinishWebAuthResponse> {
    try {
      const response = await userWebAuth.finishWebAuth({
        ...finishWebRegisterProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async finishWebAuthExisting(
    finishWebAuthExistingProps: IfinishWebAuthExisting
  ): Promise<IfinishWebAuthExistingResponse> {
    try {
      const response = await userWebAuth.finishWebAuthExisting({
        ...finishWebAuthExistingProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async startWebAuth(
    startWebAuthProps: IauthWebAuth
  ): Promise<IstartWebAuthResponse> {
    try {
      const response = await authWebAuth.start({
        ...startWebAuthProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async finishWebAuth(
    finishWebAuthProps: IfinishWebAuth
  ): Promise<IfinishWebAuthResponse> {
    try {
      const response = await authWebAuth.finish({
        ...finishWebAuthProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async validateWebAuth(
    validateWebAuthProps: IvalidateWebAuth
  ): Promise<IvalidateWebAuthResponse> {
    try {
      const response = await authWebAuth.validate({
        ...validateWebAuthProps
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
}
export default AuthArmorSDK;
