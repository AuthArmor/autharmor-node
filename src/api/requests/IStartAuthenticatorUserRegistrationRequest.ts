export interface IStartAuthenticatorUserRegistrationRequest {
    username: string;
    resetAndReinvite?: boolean;
    revokePreviousInvites?: boolean;
}
