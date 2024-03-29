import express from "express";
import { createToken } from "../features/auth";
import { authArmorApiClient } from "../features/authArmor";
import { ApiError } from "@autharmor/autharmor-node";

const router = express.Router();

type LoginParams = {};

type LoginRequest = {
    requestId: string;
    authenticationMethod: "authenticator" | "magicLinkEmail" | "passkey";
    validationToken: string;
};

type LoginResponse = {
    token: string;
};

router.post<LoginParams, LoginResponse>("/login", async (req, res) => {
    const request = req.body as LoginRequest;

    if (
        typeof request.requestId !== "string" ||
        typeof request.authenticationMethod !== "string" ||
        typeof request.validationToken !== "string"
    ) {
        res.status(400);
        return;
    }

    const authenticationMethodMapping = {
        authenticator: "authenticator",
        passkey: "webauthn",
        magicLinkEmail: "magiclink_email"
    } as const;

    const validationResult = await authArmorApiClient.validateAuthenticationAsync(
        authenticationMethodMapping[request.authenticationMethod],
        {
            requestId: request.requestId,
            validationToken: request.validationToken
        }
    );

    if (!validationResult.validate_auth_response_details.authorized) {
        res.status(403);
        return;
    }

    const authProfile =
        validationResult.validate_auth_response_details.auth_details.response_details
            .auth_profile_details;

    // autharmor: fetch user data
    const authTokenData = {
        userId: authProfile.user_id,
        username: authProfile.username!
    };

    const token = createToken(authTokenData);

    res.json({ token });
});

type RegisterParams = {};

type RegisterRequest = {
    registrationId: string;
    authenticationMethod: "authenticator" | "passkey" | "magicLinkEmail";
    validationToken: string;
};

type RegisterResponse = {
    token: string;
};

router.post<RegisterParams, RegisterResponse>("/register", async (req, res) => {
    const request = req.body as RegisterRequest;

    if (
        typeof request.registrationId !== "string" ||
        typeof request.authenticationMethod !== "string" ||
        typeof request.validationToken !== "string"
    ) {
        res.status(400);
        return;
    }

    const authenticationMethodMapping = {
        authenticator: "authenticator",
        passkey: "webauthn",
        magicLinkEmail: "magiclink_email"
    } as const;

    let registrationResult;

    try {
        registrationResult = await authArmorApiClient.validateRegistrationAsync(
            authenticationMethodMapping[request.authenticationMethod],
            request.registrationId,
            {
                validationToken: request.validationToken
            }
        );
    } catch (error: unknown) {
        if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
            res.status(error.statusCode);
            return;
        } else {
            throw error;
        }
    }

    const authTokenData = {
        userId: registrationResult.user_id,
        username: registrationResult.username
    };

    const token = createToken(authTokenData);

    res.json({ token });
});

export default router;
