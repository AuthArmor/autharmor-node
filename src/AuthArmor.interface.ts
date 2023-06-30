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
  ) => Promise<[IregisterWithEmailResponse | null, null | any]>;
  verifyMagicLinkEmail: (
    verifyMagicLinkEmailProps: IverifyMagicLinkEmail
  ) => Promise<[IverfiyMagicLinkEmailResponse | null, null | any]>;
  linkEmailWithUserName: (
    linkProps: IlinkEmailWithUserName
  ) => Promise<[null | IlinkEmailWithUserNameResponse, null | any]>;
  updateEmail: (
    updateEmailProps: IupdateEmail
  ) => Promise<[null | IupdateEmailResponse, null | any]>;
  updateUser: (
    updateUserProps: IupdateUser
  ) => Promise<[null | IupdateUserResponse, null | any]>;
  getUser: (
    getUserProps: IgetUser
  ) => Promise<[null | IgetUserResponse, null | any]>;
  checkRegistartion: (
    getUserProps: IgetUser,
    timeOutInSeconds: number
  ) => Promise<[null | IgetUserResponse, null | any]>;
  signInWebAuth: (
    validateWebAuthProps: IvalidateWebAuth
  ) => Promise<[null | IvalidateWebAuthResponse, null | any]>;
  getAll: (
    getAllProps: IgetAllUser
  ) => Promise<[null | IgetAllUserResponse, null | any]>;
  getUserAuth: (
    getAuthProps: IgetUserAuth
  ) => Promise<[null | IgetUserAuthResponse, null | any]>;
  validateAuthMagicLink: (
    validateAuthMagicLinkProps: IvalidateAuthMagicLink
  ) => Promise<[null | IvalidateAuthMagicLinkResponse, null | any]>;
  startAuthMagicLink: (
    startAuthMagicLinkProps: IstartAuthMagicLink
  ) => Promise<[null | IstartAuthMagicLinkResponse, null | any]>;
  registerWithAuthenticator: (
    registerWithAuthenticatorProps: IregisterWithAuthenticator
  ) => Promise<[null | IregisterAuthResponse, null | any]>;

  linkAuthWithUserName: (
    linkAuthWithUserNameProps: IlinkAuth
  ) => Promise<[null | IlinkAuthWithUserNameResponse, null | any]>;
  startAuth: (
    startAuthProps: IstartAuthWithAutenticator
  ) => Promise<[null | IstartAuthResponse, null | any]>;
  verifyAuthPoll: (
    verifyAuthProps: IvalidateAuthWithAutenticator,
    timeOutInSeconds: number
  ) => Promise<[null | IverifyAuthResponse, null | any]>;
  verifyAuth: (
    verifyAuthProps: IvalidateAuthWithAutenticator
  ) => Promise<[null | IverifyAuthResponse, null | any]>;
  getAuthInfo: (
    getAuthInfoProps: IauthInfo
  ) => Promise<[null | Iauth_history_records, null | any]>;
  linkWebAuthWithUserName: (
    linkWebAuthWithUserNameProps: IlinkWebAuth
  ) => Promise<[null | IlinkWebAuthWithUserName, null | any]>;
  registerWithWebAuth: (
    registerWithWebAuthProps: IregisterWithWebAuth
  ) => Promise<[null | IregisterWebAuthResponse, null | any]>;
  finishWebRegister: (
    finishWebRegisterProps: IfinishRegisterWebAuth
  ) => Promise<[null | IfinishWebAuthResponse, null | any]>;
  signInMagicLink: (
    validateAuthMagicLinkProps: IvalidateAuthMagicLink
  ) => Promise<[null | IsignInResponse, null | any]>;

  finishWebAuthExisting: (
    finishWebAuthExistingProps: IfinishWebAuthExisting
  ) => Promise<[null | IfinishWebAuthExistingResponse, null | any]>;
  startWebAuth: (
    startWebAuthProps: IauthWebAuth
  ) => Promise<[null | IstartWebAuthResponse, null | any]>;
  finishWebAuth: (
    finishWebAuthProps: IfinishWebAuth
  ) => Promise<[null | IfinishWebAuthResponse, null | any]>;
  validateWebAuth: (
    validateWebAuthProps: IvalidateWebAuth
  ) => Promise<[null | IvalidateWebAuthResponse, null | any]>;
}
