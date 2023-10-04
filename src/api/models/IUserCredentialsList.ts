import { ICredential } from "./ICredential";
import { IPageInfo } from "./IPageInfo";

export interface IUserCredentialsList {
    credential_records: ICredential[];
    page_info: IPageInfo;
}
