import { context_data_props } from "./lib/auth/magicLink";
export interface enrolled_auth_methods {
  auth_method_name: string;
  auth_method_id: number;
  auth_method_masked_info: string;
}
export interface IuserRecord {
  user_id: string;
  email_address: string;
  username: string;
  date_created: string;
}
export interface IpageInfo {
  currnet_page_number: 0;
  currnet_page_size: 0;
  total_page_count: 0;
  total_record_count: 0;
}
export interface IverfiyMagicLinkEmailResponse {
  magiclink_email_registration_type: "new_user";
  user_id: string;
  username: string;
  email_address: string;
  context_data: context_data_props;
}
export interface IregisterWithEmailResponse {
  timeout_in_seconds: number;
  timeout_utc_datetime: string;
}

export interface IlinkEmailWithUserNameResponse {
  timeout_in_seconds: number;
  timeout_utc_datetime: string;
}
export interface IupdateEmailResponse {
  timeout_in_seconds: number;
  timeout_utc_datetime: string;
}
export interface IupdateUserResponse {
  user_id: string;
  email_address: string;
  username: string;
  date_created: string;
}
export interface IgetUserResponse {
  enrolled_auth_methods: Array<enrolled_auth_methods>;
  user_id: string;
  email_address: string;
  username: string;
  date_created: string;
}
export interface IgetAllUserResponse {
  user_records: IuserRecord;
  page_info: IpageInfo;
}
export interface Iauth_history_records {
  auth_request_status_id: number;
  auth_request_status_name: string;
  auth_response: {
    auth_history_id: string;
    result_code: number;
    result_message: string;
    authorized: boolean;
    auth_details: {
      request_details: {
        date: string;
        auth_profile_details: {
          user_id: string;
          username: string;
        };
        origin_location_data: {
          latitude: string;
          longitude: string;
          ip_address: string;
        };
        auth_method: "MobileDevice";
      };
    };
    response_details: {
      date: string;
      auth_method: {
        name: "MobileDevice";
        usetype: "biometric";
      };

      secure_signed_message: {
        signed_data: string;
        signature_data: {
          hash_value: string;
          signature_data: string;
          auth_method_usetype: string;
          signing_method: string;
          auth_method: string;
          hash_method: string;
        };
        signed_data_type: string;
        signature_validation_details: string;
      };
      mobile_device_details: {
        platform: string;
        model: string;
      };
      auth_profile_details: {
        user_id: string;
        username: string;
      };
    };
  };
}

export interface IgetUserAuthResponse {
  auth_history_records: Array<Iauth_history_records>;
  page_info: IpageInfo;
}
export interface IregisterAuthResponse {
  username: string;
  registration_id: string;
  user_id: string;
  date_expires: string;
  auth_method: string;
  qr_code_data: string;
}
export interface IlinkAuthWithUserNameResponse {
  username: string;
  registration_id: string;
  date_expires: string;
  auth_method: string;
  qr_code_data: string;
}
export interface IstartAuthResponse {
  auth_validation_token: string;
  auth_request_id: string;
  user_id: string;
  visual_verify_value: string;
  response_code: number;
  response_message: string;
  qr_code_data: string;
  push_message_sent: boolean;
  timeout_in_seconds: number;
  timeout_utc_datetime: string;
}
export interface IsignInResponse {
  user_id: string;
  username: string;
}
export interface IverifyAuthResponse {
  auth_request_status_id: number;
  auth_request_status_name: string;
  validate_auth_response_details: {
    auth_history_id: string;
    result_code: number;
    result_message: string;
    authorized: boolean;
    auth_details: {
      request_details: {
        date: string;
        auth_profile_details: {
          user_id: string;
          username: string;
        };
        origin_location_data: {
          latitude: string;
          longitude: string;
          ip_address: string;
        };
        auth_method: string;
      };
      response_details: {
        date: string;
        auth_method: {
          name: string;
          usetype: string;
        };
        secure_signed_message: {
          signed_data: string;
          signature_data: {
            hash_value: string;
            signature_data: string;
            auth_method_usetype: string;
            signing_method: string;
            auth_method: string;
            hash_method: string;
          };
          signed_data_type: string;
          signature_validation_details: string;
        };
        mobile_device_details: {
          platform: string;
          model: string;
        };
        auth_profile_details: {
          user_id: string;
          username: string;
        };
      };
    };
    context_data: context_data_props;
  };
}
export interface IconstructorProps {
  clientId: string;
  clientSecret: string;
  webauthnClientId?: string;
}
export interface IvalidateAuthMagicLinkResponse {
  auth_request_status_id: number;
  auth_request_status_name: string;
  validate_auth_response_details: {
    auth_history_id: string;
    result_code: number;
    result_message: string;
    authorized: boolean;
    auth_details: {
      request_details: {
        date: string;
        auth_profile_details: {
          user_id: string;
          username: string;
        };
        origin_location_data: {
          latitude: string;
          longitude: string;
          ip_address: string;
        };
        auth_method: string;
      };
      response_details: {
        date: string;
        auth_method: {
          name: string;
          usetype: string;
        };
        secure_signed_message: {
          signed_data: string;
          signature_data: {
            hash_value: string;
            signature_data: string;
            auth_method_usetype: string;
            signing_method: string;
            auth_method: string;
            hash_method: string;
          };
          signed_data_type: string;
          signature_validation_details: string;
        };
        mobile_device_details: {
          platform: string;
          model: string;
        };
        auth_profile_details: {
          user_id: string;
          username: string;
        };
      };
    };
    context_data: context_data_props;
  };
}
export interface IstartAuthMagicLinkResponse {
  auth_request_id: string;
  user_id: string;
  timeout_in_seconds: number;
  timeout_utc_datetime: string;
}
export interface IlinkWebAuthWithUserName {
  fido2_json_options: string;
  registration_id: string;
  aa_sig: string;
}

export interface IvalidateWebAuthResponse {
  auth_request_status_id: number;
  auth_request_status_name: string;
  validate_auth_response_details: {
    auth_history_id: string;
    result_code: number;
    result_message: string;
    authorized: boolean;
    auth_details: {
      request_details: {
        date: string;
        auth_profile_details: {
          user_id: string;
          username: string;
        };
        origin_location_data: {
          latitude: string;
          longitude: string;
          ip_address: string;
        };
        auth_method: string;
      };
      response_details: {
        date: string;
        auth_method: {
          name: string;
          usetype: string;
        };
        secure_signed_message: {
          signed_data: string;
          signature_data: {
            hash_value: string;
            signature_data: string;
            auth_method_usetype: string;
            signing_method: string;
            auth_method: string;
            hash_method: string;
          };
          signed_data_type: string;
          signature_validation_details: string;
        };
        mobile_device_details: {
          platform: string;
          model: string;
        };
        auth_profile_details: {
          user_id: string;
          username: string;
        };
      };
    };
    context_data: context_data_props;
  };
}
export interface IfinishWebAuthResponse {
  auth_validation_token: string;
  user_id: string;
  auth_request_id: string;
  username: string;
}
export interface IstartWebAuthResponse {
  fido2_json_options: string;
  auth_request_id: string;
  aa_guid: string;
}
export interface IfinishWebAuthExistingResponse {
  user_id: string;
  username: string;
}
export interface IregisterWebAuthResponse {
  fido2_json_options: string;
  registration_id: string;
  aa_sig: string;
}
