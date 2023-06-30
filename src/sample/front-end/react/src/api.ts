export const signUserIn = async (email: string) => {
  try {
    const response = await fetch("your_api_link/email", {
      method: "POST",
      body: JSON.stringify({ email_address: email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
};

export const validateUser = async (registration_validation_token: string) => {
  try {
    const response = await fetch("your_api_link/emailvaldiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ registration_validation_token }),
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
};
export const validateAuthAuthneticator = async ({
  auth_validation_token,
  auth_request_id,
}) => {
  try {
    const response = await fetch("your_api_link/validateAuth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ auth_validation_token, auth_request_id }),
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
}; //
export const registerWithAuthenticator = async (username: string) => {
  try {
    const response = await fetch("your_api_link/registerWithAuthenticator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, authRequest: false }),
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
};
export const signUserInAuthenticate = async (username: string) => {
  try {
    const response = await fetch("your_api_link/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, authRequest: false }),
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
};
export const checkIfRegisteredWithServerPolling = async ({
  registration_id,
  user_id,
  username,
  timeOutInSeconds,
}: any) => {
  try {
    const response = await fetch("your_api_link/isregistered", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registration_id,
        timeOutInSeconds,
        user_id,
        username,
      }),
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
};
export const authUserWithEmail = async (username: string, page: boolean) => {
  try {
    const response = await fetch("your_api_link/emailauth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, page: page }),
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
};
export const startAuth = async (body: any) => {
  const { username, user_id, authRequest } = body;

  try {
    const response = await fetch("your_api_link/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        user_id,
        authRequest,
      }),
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
};
export const startAuthvalidationWithServerPoll = async (body: any) => {
  const { auth_validation_token, auth_request_id } = body;

  try {
    const response = await fetch("your_api_link/validateAuth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_validation_token,
        auth_request_id,
      }),
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
};
export const validateAuthEmail = async (username: any, authOrSign: boolean) => {
  const { auth_validation_token, auth_request_id } = username;

  try {
    const response = await fetch("your_api_link/emailauthvalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_validation_token,
        auth_request_id,
      }),
    });
    if (response.status == 200) {
      return [await response.json(), null];
    }

    throw await response.json();
  } catch (error) {
    return [null, error.errorMessage ?? error];
  }
};
