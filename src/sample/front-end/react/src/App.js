/*
this is a simple sample app that uses the autharmor webauthn sdk and nodejs backend to authenticate users

*/

import React from "react";
import "./App.css";
import AuthArmorWebAuthnSDK from "autharmor-webauthn-sdk";
import { Audio } from "react-loader-spinner";
import QRCode from "react-qr-code";

import {
  signUserIn,
  registerWithAuthenticator,
  validateUser,
  authUserWithEmail,
  signUserInAuthenticate,
  startAuth,
  validateAuthAuthneticator,
  startAuthvalidationWithServerPoll,
  validateAuthEmail,
  checkIfRegisteredWithServerPolling,
} from "./api.ts";
import {
  BrowserRouter,
  Routes,
  Route,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
let theUser = {};
const item = {
  marginTop: 20,
  background: "rgba(0,0,0,0.2)",
  padding: 10,
  width: "33%",
  borderRadius: 4,

  cursor: "pointer",
  textAlign: "center",
  fontFamily: "Poppins",
};
const button = {
  marginTop: 20,
  background: "rgba(0,0,0,0.2)",
  padding: 10,
  cursor: "pointer",
  borderRadius: 4,
  fontFamily: "Poppins",
  textAlign: "center",
};
const popUP = {
  width: "100vw",
  height: "100vh",
  zIndex: 4,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
};
const popUpContainer = {
  padding: 10,
  background: "white",
  borderRadius: 10,
  zIndex: 1,
  width: "80%",
};
const register = {
  textAlign: "center",
  fontFamily: "Poppins",
  marginTop: 10,
};
const itemContainer = {
  display: "flex",
  gap: 20,
  width: "100%",
};
const TextInput = ({ step, setText, text }) => {
  const placeHolder = step === 2 ? "Enter your email" : "Enter your username";
  return (
    <input
      style={{
        width: "90%",
        marginLeft: "5%",
        marginTop: 20,
        height: 40,
        border: "1px solid lightgray",
      }}
      placeholder={placeHolder}
      type="text"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
      }}
    />
  );
};
const sendEmail = async (email, token, isNotAuth, authOrSign = false) => {
  if (isNotAuth && token === null) {
    return await signUserIn(email);
  }
  if (isNotAuth && token !== null) {
    return await validateUser(token);
  }
  if (!isNotAuth && token === null) {
    return await authUserWithEmail(email, authOrSign);
  }
  if (!isNotAuth && token !== null) {
    return await validateAuthEmail(token, authOrSign);
  }
};
const AuthAuthenticator = async (username, send) => {
  if (send) {
    const [res, err] = await signUserInAuthenticate(username);

    if (res) {
      const [rels, errl] = await validateAuthAuthneticator({
        auth_request_id: res.auth_request_id,
        auth_validation_token: res.auth_validation_token,
      });

      if (
        rels &&
        rels.validate_auth_response_details &&
        rels.validate_auth_response_details.auth_details &&
        rels.validate_auth_response_details.auth_details.request_details &&
        rels.validate_auth_response_details.auth_details.request_details
          .auth_profile_details
      )
        theUser =
          rels.validate_auth_response_details.auth_details.request_details
            .auth_profile_details;

      return [rels, err];
    } else {
      return [res, "error retriving"];
    }
    return [res, err];
  }
};
const authWithWebAuth = async ({ username }, signIn, navigate) => {
  const SDK = new AuthArmorWebAuthnSDK({
    webauthnClientId: "your web Auth", // Obtain your Webauthn client ID through the AuthArmor dashboard
  });

  try {
    const finish = await fetch(`your_api_link/authweb`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ username: username, email_address: username }),
    });
    const responses = await finish.json();

    try {
      const payload = await SDK.get(responses);
      const finish = await fetch(`your_api_link/finishAndValidate`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ ...payload, ...{ signIn } }),
      });
      const response = await finish.json();
      if (response.user_id && response.username) {
        theUser = response;
        return "authenticated";
      }

      throw response;
    } catch (e) {
      return null;
    }
  } catch (e) {
    return null;
  }
};
const registerWithWebAuth = async (username, navigate) => {
  const SDK = new AuthArmorWebAuthnSDK({
    webauthnClientId: "your webauthnClientId here", // Obtain your Webauthn client ID through the AuthArmor dashboard
  });

  try {
    const finish = await fetch(`your_api_link/webauthinstart`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ username: username, email_address: username }),
    });
    const responses = await finish.json();
    try {
      const payload = await SDK.create(responses);

      const finish = await fetch(`your_api_link/webauthinfinish`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ ...payload, ...{} }),
      });
      const response = await finish.json();
      if (response.user_id && response.username) {
        theUser = response;
        navigate("/user", { state: { webauth: true, register: true } });
      }

      throw response;
    } catch (e) {
      return null;
    }
  } catch (e) {
    return null;
  }
};
const PopUpConver = ({ setShown, login }) => {
  const [step, setStep] = React.useState(-1);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [qr, setQr] = React.useState("");
  const [date_expires, setDateExpires] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const [text, setText] = React.useState("");
  React.useEffect(() => {}, [text]);

  const ButtonPressed = async () => {
    setLoading(true);
    if (step === 1) {
      if (!login) {
        const [resso, erroRegister] = await registerWithAuthenticator(text);
        if (resso) {
          setQr(resso.qr_code_data);
          setDateExpires(
            (new Date(resso.date_expires).getTime() - new Date().getTime()) /
              1000
          );
          setInterval(() => {
            setDateExpires((pre) => pre - 1);
          }, 1000);
        }
        if (erroRegister) {
          setError(erroRegister);
          return;
        }
        const [ress, erro] = await checkIfRegisteredWithServerPolling({
          ...resso,
          timeOutInSeconds: 200,
        });

        setLoading(false);
        if (ress) {
          theUser = ress;

          navigate("/user", { state: { auth: true, register: true } });
        } else {
          setError(erro);
        }
        return;
      }
      const [res, err] = await AuthAuthenticator(text, login);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      navigate("/user", { state: { auth: true, register: false } });
      return;
    }
    if (step === 2) {
      if (login) {
        const [res, err] = await sendEmail(text, null, false);
        setLoading(false);
        if (err) {
          setError(err);
          return;
        }
        setMessage("Email Sent");
      } else {
        const [ress, err] = await sendEmail(text, null, true);
        setLoading(false);

        if (err) {
          setError(err);
          return;
        }

        setMessage("Email Sent");
      }
    }
    if (step === 3) {
      if (login) {
        const response = await authWithWebAuth(
          { username: text },
          true,
          navigate
        );

        if (response === "authenticated") {
          navigate("/user", { state: { webauth: true } });
        } else {
          alert("error");
        }

        setLoading(false);
        return;
      }
      await registerWithWebAuth(text, navigate);
      setLoading(false);
    }
  };

  return (
    <div style={popUP}>
      <div
        style={{
          width: "100%",
          height: "100%",
          postion: "relative",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          cursor: "pointer",
        }}
      >
        <div
          onClick={() => {
            setShown(false);
          }}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            zIndex: 0,
          }}
        />
        <div style={popUpContainer}>
          <div style={register}>
            {!login ? "Register With AuthArmor" : "Login with AuthArmor"}
          </div>
          <div>
            {error} {message}
          </div>
          <div style={itemContainer}>
            {step === -1 ? (
              <>
                <div
                  onClick={() => {
                    setStep(1);
                  }}
                  style={item}
                >
                  Authenticator
                </div>
                <div
                  onClick={() => {
                    setStep(2);
                  }}
                  style={item}
                >
                  Email
                </div>
                <div
                  onClick={() => {
                    setStep(3);
                  }}
                  style={item}
                >
                  WebAuth
                </div>
              </>
            ) : null}
          </div>
          <div
            style={{
              margin: 50,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {qr ? date_expires : ""}
            {qr ? (
              <div
                onClick={() => {
                  window.open(
                    qr.replace("autharmor.dev", "autharmor.com"),
                    "_newtab"
                  );
                }}
                style={{
                  cursor: "pointer",
                }}
              >
                To authenticate through phone press here
              </div>
            ) : null}
            {qr ? (
              <QRCode
                size={200}
                style={{ height: "auto", maxWidth: 200, width: 200 }}
                value={qr}
                viewBox={`0 0 200 200`}
              />
            ) : null}
          </div>
          {step !== -1 && qr === "" ? (
            <TextInput text={text} setText={setText} />
          ) : null}
          {loading ? (
            <Audio
              height="80"
              width="80"
              radius="9"
              color="green"
              ariaLabel="loading"
              wrapperStyle
              wrapperClass
            />
          ) : null}
          <div style={button} onClick={ButtonPressed}>
            Send
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [shown, setShowns] = React.useState(false);
  const [login, setLogin] = React.useState(false);
  const setShown = (value) => {
    setShowns(value);
    if (theUser && theUser.username) {
    }
  };
  return (
    <div
      style={{
        width: "100%",
        height: 70,
        background: "#2DB3B4",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {shown ? <PopUpConver setShown={setShown} login={login} /> : null}
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          height: "100%",
          marginRight: 20,
          gap: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          onClick={() => {
            setLogin(true);
            setShown(true);
          }}
          style={{
            color: "white",
            fontSize: "1em",
            padding: 8,
            background: "#rgb(40 44 52 / 38%)",
            borderRadius: 5,
            cursor: "pointer",
            paddingLeft: 13,
            paddingRight: 13,
            fontFamily: "Poppins",
          }}
        >
          sign in
        </div>
        <div
          style={{
            background: "white",
            fontSize: "1em",
            padding: 8,
            borderRadius: 5,
            fontFamily: "Poppins",
            paddingLeft: 13,
            cursor: "pointer",
            paddingRight: 13,
          }}
          onClick={() => {
            setLogin(false);
            setShown(true);
          }}
        >
          sign up
        </div>
      </div>
    </div>
  );
};
const SignedInApp = () => {
  const [shown, setShowns] = React.useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const [info] = useSearchParams();
  const [authenticated, setAuthenticated] = React.useState(null);
  const [email, setEmail] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [login, Setlogin] = React.useState(null);
  const setShown = (value) => {
    setShowns(value);

    if (theUser && theUser.username) {
      navigate("/user");
    }
  };
  React.useEffect(() => {
    let authenticated = info.get("authenticated");
    let email = info.get("email");
    let logined = info.get("login");

    setAuthenticated(authenticated);
    setEmail(email);
    if (logined) {
      Setlogin(true);
    }
  }, []);
  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 70,
          background: "#2DB3B4",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {shown ? <PopUpConver setShown={setShown} /> : null}
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            height: "100%",
            marginRight: 20,
            gap: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={async () => {
              setLoading(true);
              if (location.state?.webauth) {
                const response = await authWithWebAuth(theUser, true, navigate);
                setMessage(response);
                setLoading(false);
                return;
              }
              if (location.state?.auth) {
                const [res, err] = await startAuth({
                  username: theUser.username,
                  user_id: theUser.user_id,
                  authRequest: true,
                });

                if (err) {
                  setMessage(err);
                  setLoading(false);
                }
                if (res) {
                  setMessage("request sent");
                  const [reso, erro] = await startAuthvalidationWithServerPoll(
                    res
                  );
                  setLoading(false);
                  if (erro) {
                    setMessage(erro);
                    return;
                  }
                  setMessage("Authenticated");
                }
                return;
              }
              setLoading(false);
              sendEmail(theUser.username, null, false, true);
              setMessage("Email Sent");
            }}
            style={{
              color: "white",
              fontSize: "1em",
              padding: 8,
              background: "#rgb(40 44 52 / 38%)",
              borderRadius: 5,
              paddingLeft: 13,
              paddingRight: 13,
              cursor: "pointer",
              fontFamily: "Poppins",
            }}
          >
            send auth request
          </div>
          <div
            style={{
              background: "white",
              fontSize: "1em",
              padding: 8,
              borderRadius: 5,
              fontFamily: "Poppins",
              paddingLeft: 13,
              cursor: "pointer",
              paddingRight: 13,
            }}
            onClick={() => {
              navigate("/");
            }}
          >
            log out
          </div>
        </div>
      </div>
      {loading ? (
        <Audio
          height="80"
          width="80"
          radius="9"
          color="green"
          ariaLabel="loading"
          wrapperStyle
          wrapperClass
        />
      ) : null}
      <h4
        style={{
          padding: "1em",
          fontFamily: "Poppins",
          letterSpacing: 0.8,
          fontWeight: 300,
        }}
      >
        Welcome, {theUser.username}{" "}
        {email && !location.state?.register && login && !authenticated
          ? "You have now registered using Auth Armor!"
          : ""}{" "}
        {email && !location.state?.register && !login && !authenticated
          ? " You are now logged in Using Auth Armor!"
          : ""}
        {!email
          ? location.state?.register
            ? "You have now registered using Auth Armor!"
            : " You are now logged in Using Auth Armor!"
          : ""}
      </h4>
      <h4
        style={{
          padding: "1em",
          paddingTop: 0,
          fontFamily: "Poppins",
          letterSpacing: 0.8,
          fontWeight: 300,
        }}
      >
        {authenticated ? "the request have been authenticated" : ""}
      </h4>
      <h4
        style={{
          padding: "1em",
          fontFamily: "Poppins",
          letterSpacing: 0.8,
          fontWeight: 300,
        }}
      >
        {message ? message : ""}
      </h4>
    </div>
  );
};
const Validate = () => {
  const [info] = useSearchParams();
  const [token, setToken] = React.useState(null);
  const navigate = useNavigate();
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const validateEmail = async (
    registration_validation_token,
    auth_request_id,
    auth_validation_token,
    page,
    login
  ) => {
    setLoading(true);
    if (auth_request_id && auth_validation_token) {
      const [res, err] = await sendEmail(
        null,
        { auth_request_id, auth_validation_token, page },
        false
      );
      if (err) {
        setLoading(false);
        setError(err);
        navigate("/error");
        return;
      }
      theUser = res;

      navigate("/user?email=true" + (page ? "&authenticated=true" : ""));
      return;
    }
    const [res, err] = await sendEmail(
      null,
      registration_validation_token,
      "validate"
    );

    if (err) {
      setLoading(false);
      setError(err);
      navigate("/error");
      return;
    }
    setLoading(false);
    theUser = res;
    navigate("/user?email=true" + (login ? "&login=true" : ""));
  };
  React.useEffect(() => {
    //During development in react useEffect will be called twice,so this function will fire twic,you can remove strict mode in index.js to avoid this but not recommended

    let registration_validation_token = info.get(
      "registration_validation_token"
    );
    let auth_request_id = info.get("auth_request_id");
    let auth_validation_token = info.get("auth_validation_token");
    let page = info.get("page");
    let login = info.get("login");

    setToken(registration_validation_token || auth_validation_token);
    validateEmail(
      registration_validation_token,
      auth_request_id,
      auth_validation_token,
      page,
      login
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (token === null) {
    return (
      <div>
        {loading ? (
          <Audio
            height="80"
            width="80"
            radius="9"
            color="green"
            ariaLabel="loading"
            wrapperStyle
            wrapperClass
          />
        ) : null}
        {error ? error : "......No registration_validation_token "}
      </div>
    );
  }
  return (
    <div>
      {loading ? (
        <Audio
          height="80"
          width="80"
          radius="9"
          color="green"
          ariaLabel="loading"
          wrapperStyle
          wrapperClass
        />
      ) : null}
      {error ? error : "...... Loading to validate the link"}
    </div>
  );
};
const Esrror = () => {
  const [shown, setShowns] = React.useState(false);
  const [login, setLogin] = React.useState(false);
  const setShown = (value) => {
    setShowns(value);
    if (theUser && theUser.username) {
    }
  };
  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 70,
          background: "#2DB3B4",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {shown ? <PopUpConver setShown={setShown} login={login} /> : null}
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            height: "100%",
            marginRight: 20,
            gap: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={() => {
              setLogin(true);
              setShown(true);
            }}
            style={{
              color: "white",
              fontSize: "1em",
              padding: 8,
              background: "#rgb(40 44 52 / 38%)",
              borderRadius: 5,
              cursor: "pointer",
              paddingLeft: 13,
              paddingRight: 13,
              fontFamily: "Poppins",
            }}
          >
            sign in
          </div>
          <div
            style={{
              background: "white",
              fontSize: "1em",
              padding: 8,
              borderRadius: 5,
              fontFamily: "Poppins",
              paddingLeft: 13,
              cursor: "pointer",
              paddingRight: 13,
            }}
            onClick={() => {
              setLogin(false);
              setShown(true);
            }}
          >
            sign up
          </div>
        </div>
      </div>
      <h4
        style={{
          padding: "1em",
          fontFamily: "Poppins",
          letterSpacing: 0.8,
          fontWeight: 300,
        }}
      >
        Error occured when confirming email
      </h4>
    </div>
  );
};
const BrowserStack = () => {
  return (
    <BrowserRouter basename={"/demoitem"}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/error" element={<Esrror />} />
        <Route path="/validate" element={<Validate />} />
        <Route path="/user" element={<SignedInApp />} />
      </Routes>
    </BrowserRouter>
  );
};
export default BrowserStack;
