import { AuthArmorApiClient } from "@autharmor/node";

const clientId = process.env.AUTHARMOR_CLIENT_ID!;
const clientSecret = process.env.AUTHARMOR_CLIENT_SECRET!;

export const authArmorApiClient = new AuthArmorApiClient({
    clientId,
    clientSecret
});
