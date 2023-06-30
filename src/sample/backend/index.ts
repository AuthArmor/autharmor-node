import express, { json, Request } from "express";
import http from "http";
import bodyParser from "body-parser";
import AuthArmorSDK from "../../AuthArmor";
import cors from "cors";
const port = process.env.PORT || 8080;
/**
 * this is a sample backend server for AuthArmor implementation to show case how to use AuthArmor SDK
 * this sample is using express and nodejs
 * how you implement the logic is up to you
 * you can see all of the the functions in AuthArmor SDK in interface IAuthArmorSdk at src/AuthArmor.interface.ts
 */
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200
};
const app = express();
const server = http.createServer(app);
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
const users: any = [];
const authArmor = new AuthArmorSDK({
  clientId: "your client id",
  clientSecret: "your client secret",
  webauthnClientId: "your webauthn client id"
});

app.post("/email", async (req, res, next) => {
  const { email_address } = req.body;
  const [ress, err] = await authArmor.registerWithEmail({
    email_address: email_address, //
    registration_redirect_url: "your registration_redirect_url", //this will be the link in the user's email it will include https://your_domain_com?registration_validation_token=some_random_unique_token
    action_name: "Register ", // this will be the title of the email
    short_msg: "Please confirm your email and finish registration" // this will be the body of the email
  });
  if (ress) {
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
});

app.post("/emailvaldiate", async (req, res, next) => {
  const { registration_validation_token } = req.body;

  const [ress, err] = await authArmor.verifyMagicLinkEmail({
    registration_validation_token: registration_validation_token
  });
  if (ress && ress.user_id && ress.username) {
    users.push({ user_id: ress.user_id, username: ress.username });
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
});

app.post("/emailauth", async (req, res, next) => {
  const { username, page } = req.body;

  const userIsExist = users.findIndex(
    (data: any) => data.username === username
  );

  const { user_id } =
    userIsExist !== -1 ? users[userIsExist] : { user_id: null };

  if (!user_id) {
    res.status(500).send({ errorMessage: "no user found" });
    return;
  }
  const [ress, err] = await authArmor.startAuthMagicLink({
    user_id: user_id,
    username: username,
    auth_redirect_url: page
      ? `your-domain-here/validate?page=${page}` //simple way to is it an auth or registering action -- this up to you
      : "your-domain-here/validate?login=true",
    action_name: page ? "Magiclink MFA" : "Login", // this will be the title of the email
    short_msg: page
      ? "This is an example of using Magiclink for MFA or Elevation" // this will be the body of the email
      : "Please click the button to login" // this will be the body of the email
  });

  if (ress) {
    //email is sent
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
});

app.post("/emailauthvalidate", async (req, res, next) => {
  const { auth_validation_token, auth_request_id, authOrSign } = req.body;

  if (authOrSign) {
    const [ress, err] = await authArmor.validateAuthMagicLink({
      auth_validation_token,
      auth_request_id
    });
    if (ress) {
      res.status(200).send(ress);
      return;
    }
    res.status(500).send(err);
    return;
  }
  const [ress, err] = await authArmor.signInMagicLink({
    auth_validation_token,
    auth_request_id
  });

  if (ress) {
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
});

app.post("/isregistered", async (req, res, next) => {
  const { user_id, username, timeOutInSeconds = 60 } = req.body;

  const [resso, erro] = await authArmor.checkRegistartion({
    user_id: user_id ?? "",
    user_name: username ?? "",
    timeOutInSeconds
  });
  if (resso) {
    res.status(200).send(resso);
    return;
  }
  res.status(500).send(erro);
  return;
});

app.post("/registerWithAuthenticator", async (req, res, next) => {
  const { username } = req.body;
  const [ress, err] = await authArmor.registerWithAuthenticator({
    username
  });
  if (ress) {
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
  return;
});
app.post("/auth", async (req, res, next) => {
  const { username, user_id, authRequest } = req.body;
  const [ress, err] = await authArmor.startAuth({
    username: username,
    user_id: user_id,
    timeout_in_seconds: 50,
    use_visual_verify: false, //will add extra verfication with visual code in authenticator
    action_name: authRequest ? "Authentictor MFA" : "Login",
    short_msg: authRequest
      ? "This is an example of using Authentictor for MFA or Elevation"
      : "Accept this login request by clicking accept below",
    send_push: true
  });
  if (ress) {
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
  return;
});
app.post("/validateAuth", async (req, res, next) => {
  const [ress, err] = await authArmor.verifyAuthPoll({
    auth_validation_token: req.body.auth_validation_token,
    auth_request_id: req.body.auth_request_id
  });
  if (ress) {
    //user is validated and logged in
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
  return;
});
app.post("/authweb", async (req, res, next) => {
  const { username, user_id } = req.body;

  const [ress, err] = await authArmor.startWebAuth({
    username: username,
    user_id: user_id ?? undefined,
    timeout_in_seconds: 220,
    action_name: "auth", // this will be the title of the auth request

    short_msg: "auth it", // this will be the body of the auth request
    webauthn_client_id: "your webauthn client id here"
  });
  console.log(
    {
      username: username,
      user_id: user_id ?? undefined,
      timeout_in_seconds: 220,
      action_name: "auth",

      short_msg: "auth it",
      webauthn_client_id: "903205d0-7b9a-4354-93f1-f5a935ebd950"
    },
    ress,
    err
  );
  if (ress) {
    //user is validated and logged in
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
  return;
});
app.post("/finishAndValidate", async (req, res, next) => {
  const {
    authenticator_response_data,
    aa_sig,
    auth_request_id,
    webauthn_client_id,
    signIn
  } = req.body;

  const [ress, err] = await authArmor.finishWebAuth({
    authenticator_response_data: JSON.stringify(authenticator_response_data),
    aa_sig,
    auth_request_id,
    webauthn_client_id
  });
  if (err) {
    res.status(500).send(err);
    return;
  }
  if (ress) {
    const [resso, erro] = signIn
      ? await authArmor.signInWebAuth({
          auth_validation_token: ress.auth_validation_token,
          auth_request_id: ress.auth_request_id
        })
      : await authArmor.validateWebAuth({
          auth_validation_token: ress.auth_validation_token,
          auth_request_id: ress.auth_request_id
        });

    if (resso) {
      //user is validated and logged in
      if (signIn) {
      }
      res.status(200).send(resso);
      return;
    }
    res.status(500).send(erro);
    return;
  }
});

app.post("/webauthinstart", async (req, res, next) => {
  const { username, email_address } = req.body;
  const [ress, err] = await authArmor.registerWithWebAuth({
    username,
    email_address,
    timeout_in_seconds: 220,
    attachment_type: "any"
  });
  if (ress) {
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
  return;
});

app.post("/webauthinfinish", async (req, res, next) => {
  const [ress, err] = await authArmor.finishWebRegister({
    ...req.body
  } as any);

  if (ress) {
    res.status(200).send(ress);
    return;
  }
  res.status(500).send(err);
  return;
});
app.use((req, res, next) => {
  if (!req.route) {
    res.send("none");
  }
});

server.listen(port, () => {
  console.log("running on port", port);
});
