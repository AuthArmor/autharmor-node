import { IPageInfo } from "./IPageInfo";
import { IUserProfile } from "./IUserProfile";

export interface IUsersList {
    user_records: IUserProfile[];
    page_info: IPageInfo;
}
