import {
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
import { IauthInfo } from "./lib/auth/auth";
import {
  IstartAuthWithAutenticator,
  IvalidateAuthWithAutenticator
} from "./lib/auth/authenticator";
import {
  IstartAuthMagicLink,
  IvalidateAuthMagicLink
} from "./lib/auth/magicLink";
import {
  IauthWebAuth,
  IfinishWebAuth,
  IvalidateWebAuth
} from "./lib/auth/webAuth";
import {
  IlinkAuth,
  IregisterWithAuthenticator
} from "./lib/user/authenticator";
import {
  IlinkEmailWithUserName,
  IregisterWithEmail,
  IupdateEmail,
  IverifyMagicLinkEmail
} from "./lib/user/magicLink";
import {
  IgetAllUser,
  IgetUserAuth,
  IgetUser,
  IupdateUser
} from "./lib/user/users";
import {
  IlinkWebAuth,
  IregisterWithWebAuth,
  IfinishRegisterWebAuth,
  IfinishWebAuthExisting
} from "./lib/user/webAuth";
export interface enrolled_auth_methods {
  auth_method_name: string;
  auth_method_id: number;
  auth_method_masked_info: string;
}
export interface userRecord {
  user_id: string;
  email_address: string;
  username: string;
  date_created: string;
}
export interface pageInfo {
  currnet_page_number: 0;
  currnet_page_size: 0;
  total_page_count: 0;
  total_record_count: 0;
}

export interface IAuthArmorSdk {
  registerWithEmail: (
    emailProps: IregisterWithEmail
  ) => Promise<IregisterWithEmailResponse>;
  verifyMagicLinkEmail: (
    verifyMagicLinkEmailProps: IverifyMagicLinkEmail
  ) => Promise<IverfiyMagicLinkEmailResponse>;
  linkEmailWithUserName: (
    linkProps: IlinkEmailWithUserName
  ) => Promise<IlinkEmailWithUserNameResponse>;
  updateEmail: (
    updateEmailProps: IupdateEmail
  ) => Promise<IupdateEmailResponse>;
  updateUser: (updateUserProps: IupdateUser) => Promise<IupdateUserResponse>;
  getUser: (getUserProps: IgetUser) => Promise<IgetUserResponse>;
  checkRegistartion: (
    getUserProps: IgetUser,
    timeOutInSeconds: number
  ) => Promise<IgetUserResponse>;
  signInWebAuth: (
    validateWebAuthProps: IvalidateWebAuth
  ) => Promise<IvalidateWebAuthResponse>;
  getAll: (getAllProps: IgetAllUser) => Promise<IgetAllUserResponse>;
  getUserAuth: (getAuthProps: IgetUserAuth) => Promise<IgetUserAuthResponse>;
  validateAuthMagicLink: (
    validateAuthMagicLinkProps: IvalidateAuthMagicLink
  ) => Promise<IvalidateAuthMagicLinkResponse>;
  startAuthMagicLink: (
    startAuthMagicLinkProps: IstartAuthMagicLink
  ) => Promise<IstartAuthMagicLinkResponse>;
  registerWithAuthenticator: (
    registerWithAuthenticatorProps: IregisterWithAuthenticator
  ) => Promise<IregisterAuthResponse>;

  linkAuthWithUserName: (
    linkAuthWithUserNameProps: IlinkAuth
  ) => Promise<IlinkAuthWithUserNameResponse>;
  startAuth: (
    startAuthProps: IstartAuthWithAutenticator
  ) => Promise<IstartAuthResponse>;
  verifyAuthPoll: (
    verifyAuthProps: IvalidateAuthWithAutenticator,
    timeOutInSeconds: number
  ) => Promise<IverifyAuthResponse>;
  verifyAuth: (
    verifyAuthProps: IvalidateAuthWithAutenticator
  ) => Promise<IverifyAuthResponse>;
  getAuthInfo: (getAuthInfoProps: IauthInfo) => Promise<Iauth_history_records>;
  linkWebAuthWithUserName: (
    linkWebAuthWithUserNameProps: IlinkWebAuth
  ) => Promise<IlinkWebAuthWithUserName>;
  registerWithWebAuth: (
    registerWithWebAuthProps: IregisterWithWebAuth
  ) => Promise<IregisterWebAuthResponse>;
  finishWebRegister: (
    finishWebRegisterProps: IfinishRegisterWebAuth
  ) => Promise<IfinishWebAuthResponse>;
  signInMagicLink: (
    validateAuthMagicLinkProps: IvalidateAuthMagicLink
  ) => Promise<IsignInResponse>;

  finishWebAuthExisting: (
    finishWebAuthExistingProps: IfinishWebAuthExisting
  ) => Promise<IfinishWebAuthExistingResponse>;
  startWebAuth: (
    startWebAuthProps: IauthWebAuth
  ) => Promise<IstartWebAuthResponse>;
  finishWebAuth: (
    finishWebAuthProps: IfinishWebAuth
  ) => Promise<IfinishWebAuthResponse>;
  validateWebAuth: (
    validateWebAuthProps: IvalidateWebAuth
  ) => Promise<IvalidateWebAuthResponse>;
}
