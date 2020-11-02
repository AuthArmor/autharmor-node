# AuthArmor Node.js SDK

## ℹ For Express.js Users

We recommend you to use the [AuthArmor Express SDK](https://github.com/AuthArmor/autharmor-express-sdk) in case you would like to go for a simple and easy-to-use solution for setting up AuthArmor Authentication.

If you'd like a more advanced and flexible interface for using the AuthArmor API, you can proceed with setting up the AuthArmor Node SDK.

## 🏁 Installation

You can integrate the AuthArmor SDK into your website by installing and importing our NPM package:

```bash
# Via NPM
npm i -s autharmor-node-sdk

# Via Yarn
yarn add autharmor-node-sdk
```

## 🧭 Usage

### 🚀 Initializing the SDK

In order to initialize the SDK, you'll have to create a new instance of the AuthArmor Node.js SDK with your Client ID and Client Secret specified in it.

```javascript
const AuthArmor = new AuthArmorSDK({
  clientId: "1234-1234-1234-1234",
  clientSecret: "123456789"
}); // specify your client credentials
```

### How Does it work?

For information regarding how AuthArmor works and its concepts, please visit the [Documentation site](https://docs.autharmor.com)

## 🌏 HTTP Routes and Schema

### Default Client-side SDK Routes

We recommend you specify the following HTTP routes in your backend so it works immediately with the AuthArmor Client SDK. You can always change the routes in the Client-side SDK as well if you need to.

| Name                           | Route                               |
| ------------------------------ | ----------------------------------- |
| Create Invite (Register)       | POST /auth/autharmor/invite         |
| Confirm Invite                 | POST /auth/autharmor/invite/confirm |
| Authenticate                   | POST /auth/autharmor/auth           |
| Get user authentication status | GET /auth/autharmor/me              |
| Logout                         | GET /auth/autharmor/logout          |

### Required HTTP request body schema

All of your AuthArmor HTTP routes should match the ones specified below to work with the Client SDK.

#### Create Invite

| Field Name         | Type      | Description                                                       | Required |
| ------------------ | --------- | ----------------------------------------------------------------- | -------- |
| nickname           | `string`  | The user's username, nicknames should be unique for each user     | ✔        |
| reference_id       | `string`  | An optional identifier for the new user in the DB                 | ❌       |
| reset_and_reinvite | `boolean` | Specifies whether this invite should overwrite any existing users | ❌       |

#### Confirm Invite

| Field Name | Type     | Description                                                   | Required |
| ---------- | -------- | ------------------------------------------------------------- | -------- |
| nickname   | `string` | The user's username, nicknames should be unique for each user | ✔        |

#### Authenticate

| Field Name | Type     | Description                                                   | Required |
| ---------- | -------- | ------------------------------------------------------------- | -------- |
| nickname   | `string` | The user's username, nicknames should be unique for each user | ✔        |

## 🧲 Invites

### Generating a new invite

You can easily generate invites to your app and register new users with Auth Armor by doing the following:

```javascript
// Initialize the SDK
const AuthArmor = new AuthArmorSDK({
  clientId: "1234-1234-1234-1234",
  clientSecret: "123456789"
});

// Generate a new invite
const invite = await AuthArmor.invite({
  nickname: "", // Specify the invite's nickname
  referenceId: "" // Specify a reference ID for the invite
});

console.log(invite);
/**
 * Returns:
 * {
 *   "auth_profile_id": "`string`",
 *   "invite_code": "`string`",
 *   "date_expires": "ISODate `string`",
 *   "invite_type": "`string`",
 *   "aa_sig": "`string`"
 * }
 */
```

### Handling invites

Once an invite is generated, you'll need to save its info somewhere in your database along with the user's username so once the user tries to confirm the invite, you can retrieve the invite's info from the database, create an invite confirmation request and if the invite confirmation request succeeds, you can create a new user record and save it in your database.

## 🔏 Authentication

### Initializing an authentication request

In order to initialize a login request for authenticating users to your site, you can simply call the `authenticate()` function with the auth request's config (Nickname, Action name, Short Message) and an authentication request will be sent to your user's phone. Once the user responds to the auth request, the `authenticate()` function's Promise resolves

```javascript
try {
  console.log("Authenticating user...");
  await AuthArmor.authenticate({
    nickname: "<username>",
    action_name: "Lorem ipsum",
    short_msg: "Lorem ipsum dolor sit amet."
  });
  console.log("User authenticated!");
} catch (err) {
  console.error("The request was declined or has timed out!", err);
}
```
