import jwt from "jsonwebtoken";

export type AuthTokenData = {
    userId: string;
    username: string;
};

const jwtSecret = process.env.JWT_SECRET!;

export function createToken(data: AuthTokenData): string {
    return jwt.sign(data, jwtSecret);
}

export async function validateToken(token: string): Promise<AuthTokenData | null> {
    return new Promise((resolve) => {
        jwt.verify(token, jwtSecret, (err, data) => {
            if (err !== null) {
                resolve(null);
            } else {
                resolve(data as AuthTokenData);
            }
        });
    });
}
