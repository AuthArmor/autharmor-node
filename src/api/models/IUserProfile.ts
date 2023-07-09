export interface IUserProfile {
    user_id: string;
    username: string | null;
    email_address: string | null;
    date_created: string;
}

export interface IUser extends IUserProfile {
    enrolled_auth_methods: IEnrolledAuthMethod[];
}

export interface IEnrolledAuthMethod {
    auth_method_id: number;
    auth_method_name: string | null
    auth_method_masked_info: string | null;
}
