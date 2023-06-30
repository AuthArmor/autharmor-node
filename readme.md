# Auth Armor Node.js SDK

## 🏁 Installation

You can integrate the AuthArmor SDK into your backend by installing and importing our NPM package:

```bash
# Via NPM
npm i -s autharmor-node-sdk

# Via Yarn
yarn add autharmor-node-sdk
```

## 🚀 Usage

Import the module:

```ts
import AuthArmorSDK from "autharmor-sdk";
```

Instantiate the module by passing in your Auth Armor API Key credentials:

```js
const sdk = new AuthArmorSDK({
  clientId: "your_client_id",
  clientSecret: "your_client_secret",
  webauthnClientId: "your_webauthn_client_id" // optional
});
```

## Methods

### User registeration

This are options to initiate the process of enrolling new users for first time.

- `Magic links`: Register/sign in users through sending an email .
- `Authenticator`: Register/sign in users through Auth Armor Authentictor App.
- `WebAuthn`: Register/sign in users through webAuth.

#### **Magic Links**

---

- Registering an user with passwordless email link (magic links) has two parts:
  - `sdk.registerWithEmail` send the magic link request
  - `sdk.verifyMagicLinkEmail` to validate the request once the user click on email and gets directed to your website

```js
const [response,error] = await sdk.registerWithEmail({
  email_address,
  timeout_in_seconds,
  registration_redirect_url,// https://your_website_domain/validation
  action_name,
  short_msg,
  ip_addressm
  context_data: {
  key:value},
  user_agent,
})
/*
if error is present then response is null otherwise error is null and reponse is as following
{
  timeout_in_seconds: number;
  timeout_utc_datetime: string;
 }
 */
```

 <table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>email_address</td>
            <td>Yes</td>
            <td><code>string</code></td>
            <td>The email which will the magic link be sent to and registered</td>
        </tr>
        <tr>
            <td>Timeout_in_seconds</td>
            <td>Mo</td>
            <td><code>Number</code></td>
            <td>Time out between 30 and 299 default is 30</td>
        </tr>
          <tr>
            <td>registration_redirect_url</td>
            <td>Yes</td>
            <td><code>Url</code></td>
            <td>The url which the user will click on to be redirected to your website it can also include query parameters </td>
        </tr>
       <tr>
            <td>action_name</td>
            <td>Yes</td>
            <td><code>String</code></td>
            <td>Title of the email </td>
        </tr>
      <tr>
            <td>short_msg</td>
            <td>Yes</td>
            <td><code>String</code></td>
            <td>The description of the email visible to user</td>
        </tr>
      <tr>
            <td>ip_address</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>to include the ip address of the incoming request</td>
        </tr>
       <tr>
            <td>user_agent</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>to include the user agent  of the incoming request</td>
        </tr>
       <tr>
            <td>context_data</td>
            <td>No</td>
            <td><code>Object </code></td>
            <td>an object that can be passed when the user clicks on the email,the context_data is availbe when validating the request with `sdk.verifyMagicLinkEmail()`</td>
        </tr>
    </tbody>
  </table>
  
 
 ---

- Validating the registration_redirect_url

```js
const [response, error] = await sdk.verifyMagicLinkEmail({
  registration_validation_token,
  ip_address,
  user_agent
});
/*
if error is present then response is null otherwise error is null and reponse is as following
{
  magiclink_email_registration_type: "new_user";
  user_id: string;
  username: string;
  email_address: string;
  context_data: context_data_props;
 }
 */
```

<table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>registration_validation_token</td>
            <td>Yes</td>
            <td><code>string</code></td>
            <td>The validation token that is optioned from pressing on the magic link where it can be found as query `https://your_validation_endopint?registration_validation_token=token`</td>
        </tr>
        <tr>
            <td>ip_address</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>to include the ip address of the incoming request</td>
        </tr>
       <tr>
            <td>user_agent</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>to include the user agent  of the incoming request</td>
        </tr>
    </tbody>
  </table>

---

#### **Authenticor App**

- Registering an user with passwordless Authenticor:
  - `sdk.startAuthMagicLink` Send the request to register a user with authenticator app
  - `sdk.checkRegistartion` Create a polling request to check until user is registered

```js
const [response, error] = await sdk.registerWithAuthenticator({
  username,
  reset_and_reinvite,
  revoke_previous_invites
});
/*
if error is present then response is null otherwise error is null and reponse is as following
{

  username: string;
  registration_id: string;
  date_expires: string;
  auth_method: string;
  qr_code_data: string; 
 }
 */
```

 <table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>username</td>
            <td>Yes</td>
            <td><code>String</code></td>
            <td>The user name which will identify the user</td>
        </tr>
        <tr>
            <td>reset_and_reinvite</td>
            <td>No</td>
            <td><code>Boolean</code></td>
            <td>Default  to false</td>
        </tr>
          <tr>
            <td>revoke_previous_invites</td>
            <td>No</td>
            <td><code>Boolean</code></td>
            <td>Default  to false</td>
        </tr>
    </tbody>
  </table>
  
 - ### check if user the registered
    - creates a polling request with time out in Seconds will give a response only if user is registered otherwise it will return an error
 ```js
const [response,error] = await sdk.checkRegistartion({
 
  user_name: string,
  user_id: string,
},  timeOutInSeconds)
/*
if error is present then response is null otherwise error is null and reponse is as following
{

{
"enrolled_auth_methods": [
{
"auth_method_name": "string",
"auth_method_id": 0,
"auth_method_masked_info": "string"
}
],
"user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"email_address": "string",
"username": "string",
"date_created": "2023-05-16T15:05:31.026Z"
}
}
\*/

````
 <table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>username</td>
            <td>Yes</td>
            <td><code>String</code></td>
            <td>The user name which will identify the user</td>
        </tr>
        <tr>
            <td>user_id</td>
            <td>Yes</td>
            <td><code>String</code></td>
          <td>Created user registration_id from <code>sdk.registerWithEmail</code> response  </td>
        </tr>
          <tr>
            <td>TimeOutInSeconds</td>
            <td>Yes</td>
            <td><code>Nubmer</code></td>
            <td>Default to 30 seconds</td>
        </tr>
    </tbody>
  </table>


 ---

- Registration with WebAuth
  - `sdk.registerWithWebAuth` Creates webAuth body data which will be used in front-end to create webauth Credintials
  - `sdk.finishWebRegister` takes webAuth credintials that are created in front-end and creates validation records
  - `sdk.validateWebAuth` validate the validation records



```js
const [response,error] = await sdk.startWebAuth({
      username,
      email_address,
      timeout_in_seconds,
      webauthn_client_id,
      attachment_type
})
/*
if error is present then response is null otherwise error is null and reponse is as following
{

  fido2_json_options: string;// will be used  to create Webauth credintials in front-end
  registration_id: string;
  aa_sig: string;
 }
 */
````

 <table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>username</td>
            <td>Yes</td>
            <td><code>String</code></td>
            <td>The user name which will identify the user</td>
        </tr>
        <tr>
            <td>email_address</td>
            <td>Yes</td>
            <td><code>String</code></td>
            <td>Default  to false</td>
        </tr>
          <tr>
            <td>timeout_in_seconds</td>
            <td>No</td>
            <td><code>number</code></td>
            <td>Default  to 30</td>
        </tr>
      <tr>
            <td>webauthn_client_id</td>
            <td>Yes</td>
            <td><code>String</code></td>
            <td>Obtained from auth armor dashboard</td>
        </tr>
      <tr>
            <td>attachment_type</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>Default  to any</td>
        </tr>
    </tbody>
  </table>

- `sdk.finishWebRegister`

```js
const [response, error] = await sdk.finishWebRegister({
  registration_id,
  aa_sig,
  authenticator_response_data,
  webauthn_client_id: string,
  fido2_registration_data
});
/*
if error is present then response is null otherwise error is null and reponse is as following
{

  fido2_json_options: string;// will be used  to create Webauth credintials in front-end
  registration_id: string;
  aa_sig: string;
 }
 */
```

 <table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>registration_id</td>
            <td>Yes</td>
            <td><code>String</code></td>
            <td>Obtained from <code>`startWebAuth</code> response</td>
        </tr>
        <tr>
            <td>aa_sig</td>
            <td>Yes</td>
            <td><code>String</code></td>
          <td>Obtained from  <code>`startWebAuth</code> response</td>
        </tr>
          <tr>
            <td>authenticator_response_data</td>
            <td>YES</td>
            <td><code>Object</code></td>
            <td>Contain the data that is created with webAuth api either from auth armor webAuth sdk or from `navigator.credentials.create` <code>{
    id: string;
    attestation_object: string;
    client_data: string;
  }</code></td>
        </tr>
      <tr>
            <td>webauthn_client_id</td>
            <td>Yes</td>
            <td><code>String</code></td>
            <td>Obtained from auth armor dashboard</td>
        </tr>
      <tr>
            <td>attachment_type</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>Default  to any</td>
        </tr>
    </tbody>
  </table>

- `sdk.validateWebAuth`

```js
const [response, error] = await sdk.validateWebAuth({
  auth_validation_token,
  auth_request_id,
  ip_address,
  user_agent,
  nonce
});
```

<table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>auth_validation_token</td>
            <td>Yes</td>
            <td><code>string</code></td>
          <td>Obtained from front-end sdk or <code>sdk.finishWebRegister</code> response</td>
        </tr>
        <tr>
            <td>auth_request_id</td>
            <td>Yes</td>
            <td><code>String</code></td>
         <td>Obtained from front-end sdk or <code>sdk.finishWebRegister</code> response</td>
        </tr><tr>
            <td>ip_address</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>to include the ip address of the incoming request</td>
        </tr>
       <tr>
            <td>user_agent</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>to include the user agent  of the incoming request</td>
        </tr><tr>
            <td>Nonce</td>
            <td>No</td>
            <td><code>String</code></td>
            <td></td>
        </tr>
    </tbody>
  </table>
  
## Authentication with Magic Link  (2fa)
  - start authentication request `sdk.startAuthMagicLink`
  - validate the request with `sdk.validateAuthMagicLink`

```js
const [response, error] = await sdk.startAuthMagicLink({
      user_id,
      username,
      timeout_in_seconds = 29,
      origin_location_data,
      action_name,
      short_msg,
      auth_redirect_url,
      context_data,
      ip_address,
      user_agent
});

/*

if error is present then response is null otherwise error is null and reponse is as following
{
  auth_request_id: string;
  user_id: string;
  timeout_in_seconds: number;
  timeout_utc_datetime: string;
  }
  */
```

<table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>user_id</td>
            <td>Yes</td>
            <td><code>string</code></td>
          <td>Obtained from front-end sdk or <code>sdk.finishWebRegister</code> response</td>
        </tr>
        <tr>
            <td>username</td>
            <td>Yes</td>
            <td><code>String</code></td>
         <td>Obtained from front-end sdk or <code>sdk.finishWebRegister</code> response</td>
        </tr><tr>
            <td>timeout_in_seconds</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>to include the ip address of the incoming request</td>
        </tr>
       <tr>
            <td>origin_location_data</td>
            <td>No</td>
            <td><code>String</code></td>
         <td><code>{
    "latitude": "string",
    "longitude": "string",
    "ip_address": "string"
  }</code></td>
        </tr>
      <tr>
            <td>auth_redirect_url</td>
            <td>No</td>
            <td><code>Url</code></td>
            <td>link to pressed on to validate the request</td>
        </tr>
      <tr>
            <td>action_name</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>Title in email</td>
        </tr>
      <tr>
            <td>short_msg</td>
            <td>yes</td>
            <td><code>String</code></td>
            <td>Short message in email</td>
        </tr>
      <tr>
            <td>context_data</td>
            <td>No</td>
            <td><code>Object</code></td>
            <td>context_data: <code>{key:value}</code></td>
        </tr>
      <tr>
            <td>ip_address</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>user ip address</td>
        </tr>
      <tr>
            <td>user_agent</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>user's agent</td>
        </tr>
    </tbody>
  </table>

## Authentication with Authenticator app (2fa)

- `sdk.startAuth` start authentication request with either push notification or qr code
- `sdk.verifyAuth` check the status of the the current auth reqeust can be Pending | Rejected | Completed,you can also poll this endpoint to check the current auth request
- `sdk.verifyAuthPoll` will create the poll request that will return user data or an error

```js
const [response, error] = await sdk.startAuth({
      user_id,
      username,
      timeout_in_seconds = 29,
      origin_location_data,
      action_name,
      short_msg,
      auth_redirect_url,
      context_data,
      ip_address,
      user_agent
});

/*

if error is present then response is null otherwise error is null and reponse is as following
{
  auth_request_id: string;
  user_id: string;
  timeout_in_seconds: number;
  timeout_utc_datetime: string;
  }
  */
```

<table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>user_id</td>
            <td>Yes</td>
            <td><code>string</code></td>
          <td>Obtained from front-end sdk or <code>sdk.finishWebRegister</code> response</td>
        </tr>
        <tr>
            <td>username</td>
            <td>Yes</td>
            <td><code>String</code></td>
         <td>Obtained from front-end sdk or <code>sdk.finishWebRegister</code> response</td>
        </tr><tr>
            <td>timeout_in_seconds</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>to include the ip address of the incoming request</td>
        </tr>
       <tr>
            <td>origin_location_data</td>
            <td>No</td>
            <td><code>String</code></td>
         <td><code>{
    "latitude": "string",
    "longitude": "string",
    "ip_address": "string"
  }</code></td>
        </tr>
      <tr>
            <td>auth_redirect_url</td>
            <td>No</td>
            <td><code>Url</code></td>
            <td>link to pressed on to validate the request</td>
        </tr>
      <tr>
            <td>action_name</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>Title in email</td>
        </tr>
      <tr>
            <td>short_msg</td>
            <td>yes</td>
            <td><code>String</code></td>
            <td>Short message in email</td>
        </tr>
      <tr>
            <td>context_data</td>
            <td>No</td>
            <td><code>Object</code></td>
            <td>context_data: <code>{key:value}</code></td>
        </tr>
      <tr>
            <td>ip_address</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>user ip address</td>
        </tr>
      <tr>
            <td>user_agent</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>user's agent</td>
        </tr>
    </tbody>
  </table>
  
  ## Authentication with Webauth  (2fa)
  - `sdk.startWebAuth`   authentication request with with webauth create creditntials 
  - `sdk.finishWebAuth`  send the creditntials create to create validation date
  - `sdk.validateWebAuth` validate the auth request

```js
const [response, error] = await sdk.startWebAuth({
  user_id,
  username,
  webauthn_client_id,
  nonce,
  timeout_in_seconds,
  origin_location_data,
  action_name,
  short_msg,
  ip_address,
  user_agent
});

/*

if error is present then response is null otherwise error is null and reponse is as following
{

  fido2_json_options: string;
  registration_id: string;
  aa_sig: string;
  }
  */
```

<table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Required</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>user_id</td>
            <td>Yes</td>
            <td><code>string</code></td>
          <td>user id</td>
        </tr><tr>
            <td>username</td>
            <td>Yes</td>
            <td><code>String</code></td>
         <td>user name</td>
        </tr><tr>
        <tr>
            <td>webauthn_client_id</td>
            <td>Yes</td>
            <td><code>String</code></td>
         <td>web auth client id create from auth armor dashboard</td>
        </tr><tr>
            <td>timeout_in_seconds</td>
            <td>yes</td>
            <td><code>number</code></td>
            <td>between 30 and 299t</td>
        </tr><tr>
            <td>none</td>
            <td>No</td>
            <td><code>string</code></td>
            <td></td>
        </tr>
       <tr>
            <td>origin_location_data</td>
            <td>No</td>
            <td><code>String</code></td>
         <td><code>{
    "latitude": "string",
    "longitude": "string",
    "ip_address": "string"
  }</code></td>
        </tr><tr>
            <td>action_name</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>Title in email</td>
        </tr>
      <tr>
            <td>short_msg</td>
            <td>yes</td>
            <td><code>String</code></td>
            <td>Short message in email</td>
        </tr>
      <tr>
            <td>context_data</td>
            <td>No</td>
            <td><code>Object</code></td>
            <td>context_data: <code>{key:value}</code></td>
        </tr>
      <tr>
            <td>ip_address</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>user ip address</td>
        </tr>
      <tr>
            <td>user_agent</td>
            <td>No</td>
            <td><code>String</code></td>
            <td>user's agent</td>
        </tr>
    </tbody>
  </table>

## Other functions

<table>
    <thead>
      <tr>
        <th>name</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
        <tr>
          <td><code>sdk.linkEmailWithUserName</code></td>
          <td>linking email with existing user name that is registered by authenticator or webauth</td>
        </tr>
      <tr>
          <td><code>sdk.updateEmail</code></td>
          <td>Update existing user email</td>
        </tr>
      <tr>
          <td><code>sdk.updateUser</code></td>
          <td>update user's username</td>
        </tr><tr>
          <td><code>sdk.getUser</code></td>
          <td>get specific user's data based on user_id</td>
        </tr><tr>
          <td><code>sdk.getAll</code></td>
          <td>get all current users with pagination</td>
        </tr><tr>
          <td><code>sdk.getUserAuth</code></td>
          <td>get specific user auth history</td>
        </tr>
      <tr>
          <td><code>sdk.getAuthInfo</code></td>
          <td>get specific auth request details</td>
        </tr><tr>
          <td><code>sdk.linkWebAuthWithUserName</code></td>
          <td>link webauth creditinal to existing user </td>
        </tr>
      <tr>
          <td><code>sdk.linkAuthWithUserName</code></td>
          <td>link authenticator creditinal to existing user </td>
        </tr>
    </tbody>
  </table>
