import express from "express";
import { createToken } from "../features/auth";
import { authArmorApiClient } from "../features/authArmor";

const router = express.Router();

type LoginParams = {};

type LoginRequest = {
    requestId: string;
    authenticationMethod: "authenticator" | "magicLinkEmail" | "webAuthn";
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
        webAuthn: "webauthn",
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
    userId: string;
    username: string;
};

type RegisterResponse = {
    token: string;
};

router.post<RegisterParams, RegisterResponse>("/register", (req, res) => {
    const request = req.body as RegisterRequest;

    if (typeof request.userId !== "string" || typeof request.username !== "string") {
        res.status(400);
        return;
    }

    // autharmor: validate token (once implemented in newer API version)
    const validationSucceeded = true;

    if (!validationSucceeded) {
        res.status(403);
        return;
    }

    // autharmor: fetch user data
    const authTokenData = {
        userId: request.userId,
        username: request.username
    };

    const token = createToken(authTokenData);

    res.json({ token });
});

type RegisterWithMagicLinkParams = {};

type RegisterWithMagicLinkRequest = {
    validationToken: string;
};

type RegisterWithMagicLinkResponse = {
    token: string;
};

router.post<RegisterWithMagicLinkParams, RegisterWithMagicLinkResponse>(
    "/register-magic-link",
    async (req, res) => {
        const request = req.body as RegisterWithMagicLinkRequest;

        if (typeof request.validationToken !== "string") {
            res.status(400);
            return;
        }

        const validationResult =
            await authArmorApiClient.validateMagicLinkEmailRegistrationAsync({
                validationToken: request.validationToken
            });

        const authTokenData = {
            userId: validationResult.user_id,
            username: validationResult.username
        };

        const token = createToken(authTokenData);

        res.json({ token });
    }
);

export default router;
