# AuthArmor Backend SDK

## Routes

All routes in the API start with this prefix by default: `/auth/autharmor`, you can define a custom route prefix instead of this one, but when using the Client-side SDK, you'll have to modify the prefix to match the one you've just specified in the API. So if you for example modified that prefix to be `/autharmor`, you'll have to write this in the client-side SDK initialization code:

```js
const AuthArmor = new AuthArmorSDK({
  url: "http://localhost:3000", // Your backend's URL
  pathPrefix: "/autharmor"
});

// Start using the client-side SDK...
```

## Initializing the SDK

In order to initialize a new instance of the AuthArmor SDK, you'll need to specify the following info:

`clientId`

**Type**: _String_ <br />
**Description**: This is used alongside the `clientSecret` field to automatically generate new tokens in the background for use with the AuthArmor API when the SDK is interacting with it (Generating new invites, auth requests, etc...).

`clientSecret`

**Type**: _String_ <br />
**Description**: This is used alongside the `clientId` field to automatically generate new tokens in the background for use with the AuthArmor API when the SDK is interacting with it (Generating new invites, auth requests, etc...).

`polling`

**Type**: _Boolean_ (Default: `false`) <br />
**Description**: Specifies whether the SDK uses HTTP polling or not, if not, the API will setup WebSockets under the route `/auth/autharmor/socket` for the client-side SDK to connect to and listen to all authentication status updates.

`secret`

**Type**: _String_ <br />
**Description**: Specifies a secret that is used for generating JWT tokens when communicating with the client-side SDK, the JWT tokens part is explained more in-depth in this [section](#JWT-Tokens)

## JWT Tokens

`userToken`

This token gets generated and sent in the response of the `/authenticate/status/{requestId:guid}` route once the auth request is approved from the mobile app, this token is then used by the client-side SDK to call the `/me` route to retrieve the currently logged in user's nickname which could be useful to determine in the frontend whether the current user is logged in or not and display different UI for each state. You can also use this token to let the user interact with the rest of your API.

## HTTP Routes Spec

There are multiple routes that are called by the Client-side SDK:

`POST /authenticate`<br />
The route is called by the Client-side SDK to generate a new authentication request.

**Request Type**: **JSON**<br />
**Request Body**:

```json
{
  "nickname": "<string>",
  "nonce": "<string>",
  "timeout_in_seconds": "<number>",
  "origin_location_data": {
    "latitude": "<string>",
    "longitude": "<string>"
  },
  "action_name": "<string>",
  "short_msg": "<string>",
  "send_push": "<boolean>",
  "use_visual_verify": "<boolean>"
}
```

**Response Type**: **JSON**<br />
**Response**:

<[Raw AuthArmor API Response](https://api.autharmor.com/index.html#operations-Auth-get_v2_auth_request__auth_request_id_)>
<br>
<br>
<br>

`GET /authenticate/status/{requestId:guid}`<br />
-- The route is called by the Client-side SDK when polling is enabled to get the ongoing auth request's status and retrieve the `userToken` from it if the auth request is successful.

**Response Type**: **JSON**<br />
**Response**:

```json
{
  "response": "<Raw AuthArmor API Response: (https://api.autharmor.com/index.html#operations-Auth-post_v2_auth_request_async)>",
  "metadata": "<any>" // Any extra info the dev would like to return along with the response
}
```

`POST /invite`<br />
-- Calling the `/invite` route lets the Backend SDK generate a new Invite request using the AuthArmor API and send it back to the client-side SDK.

**Request Type**: **JSON**<br />
**Request Body**:

```json
{
  "nickname": "<string>",
  "referenceId": "<string>" // Optional property
}
```

**Response**:

```json
// Identical to https://api.autharmor.com/index.html#operations-Invite-post_v2_invite_request
{
  "nickname": "<string>",
  "auth_profile_id": "<string>",
  "invite_code": "<string>",
  "date_expires": "<ISO Date>",
  "invite_type": "<string>",
  "qr_code_data": "<string>",
  "aa_sig": "<string>"
}
```

`GET /me`<br />
-- The /me route is a protected route that's accessible by specifying a `userToken` in the `Authorization` header when calling it.

The `/me` route is called by the client-side SDK to retrieve the currently logged in user's nickname which could be useful to determine in the frontend whether the current user is logged in or not and display different UI for each state.<br />
**Response Type**: **JSON**<br />
**Response**:

```json
{
  "nickname": "<string>",
  "authorized": "<boolean>",
  "expiresIn": "<unix timestamp>"
}
```

# Websocket Events Spec

All the WebSocket events that are sent from and to the client-side SDK are communicated in JSON format.

## Events

---

### `subscribe:auth`

**Event Origin:** Client-side SDK<br />
**Description:** This event is received by the backend SDK after the SDK does a POST request to `/authenticate` to subscribe to the authentication request's events, the authentication request's status updates are sent by the backend under the `auth:response` event which is explained more in-depth below
**Event Payload:**

```json
{
  "data": {
    "id": "<auth_request_id property from AuthArmor /auth/request/async API Response>"
  }
}
```

### `auth:response`

**Event Origin:** Backend SDK <br />
**Description:** This event is only emitted after the Client-side SDK successfully subscribes to a specific authentication request by ID. the Backend SDK will poll the AuthArmor API every 500ms for status updates regarding the authentication request the user subscribed to, and if the authentication request's status is not equal to "Pending", this event gets emitted to the Client-side SDK
**Event Payload:**

```json
{
  "data": {
    "response": "<Raw AuthArmor API Response: (https://api.autharmor.com/index.html#operations-Auth-post_v2_auth_request_async)>",
    "token": "<JWT Token>", // [Optional] userToken is specified here if the request succeeded
    "nickname": "string", // [Optional] only specified here if the request succeeded
    "authorized": "boolean",
    "status": "<auth_request_status_name property from AuthArmor API Response>",
    "metadata": "<any>" // [Optional] could be anything the user would like to return with the response
  }
}
```
