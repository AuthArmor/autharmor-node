export interface IAuthMethod {
    name: AuthMethod;
    usetype: AuthUseType;
}

export type AuthMethod =
    | "MobileDevice"
    | "SecurityKey"
    | "AuthArmorAuthenticator"
    | "Magiclink_Email"
    | "Maigclink_SMS"
    | "WebAuthN";

export type AuthUseType =
    | "biometric"
    | "pin"
    | "autharmor_pin"
    | "u2f_securitykey"
    | "u2f_usb"
    | "u2f_lightning"
    | "u2f_bluetooth"
    | "u2f_nfc"
    | "fido2_bluetooth"
    | "fido2_usb"
    | "fido2_lightning"
    | "fido2_nfc"
    | "fido2"
    | "fido2_mobiledevice"
    | "fido2_crossplatform"
    | "magiclink_email";
