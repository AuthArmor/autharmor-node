import { AuthMethod, AuthUseType } from "./IAuthMethod";

export interface ISecureSignedMessage {
    signed_data: string | null;
    signature_data: ISignatureData;
    signed_data_type: SignedDataType;
    signature_validation_details: string;
}

export interface ISignatureData {
    hash_value: string | null;
    signature_data: string | null;
    auth_method_usetype: AuthUseType;
    signing_method: SigningMethod;
    auth_method: AuthMethod;
    hash_method: HashMethod;
}

export type SignedDataType = "AuthResponse";

export type SigningMethod = "AuthArmor_ECDsa" | "FIDO_U2F";

export type HashMethod = "Sha256";
