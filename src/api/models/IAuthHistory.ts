import { IAuthInfo } from "./IAuthInfo";
import { IPageInfo } from "./IPageInfo";

export interface IAuthHistory {
    auth_history_records: IAuthInfo[];
    page_info: IPageInfo;
}
