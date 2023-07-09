import { AuthMethod, IAuthMethod } from "./IAuthMethod";
import { ISecureSignedMessage } from "./ISecureSignedMessage";

export interface IAuthDetails {
    request_details: IRequestDetails;
    response_details: IResponseDetails;
}

export interface IRequestDetails {
    date: string;
    auth_profile_details: IAuthProfileDetails;
    origin_location_data: IOriginLocationData;
    auth_method: AuthMethod;
}

export interface IResponseDetails {
    date: string;
    auth_method: IAuthMethod;
    secure_signed_message: ISecureSignedMessage;
    mobile_device_details: IMobileDeviceDetails;
    auth_profile_details: IAuthProfileDetails;
}

export interface IMobileDeviceDetails {
    platform: string | null;
    model: string | null;
}

export interface IOriginLocationData {
    latitude: string | null;
    longitude: string | null;
    ip_address: string | null;
}

export interface IAuthProfileDetails {
    user_id: string;
    username: string | null;
}
