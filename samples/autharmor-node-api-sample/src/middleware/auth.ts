import { Request, Response, NextFunction } from "express";
import { AuthTokenData, validateToken } from "../features/auth";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const authHeaderParts = authHeader?.split(" ") ?? [];
    const token = (authHeaderParts[0] === "Bearer" && authHeaderParts[1]) || null;

    const tokenData = token !== null && (await validateToken(token)) || null;

    if (tokenData === null) {
        res.sendStatus(token === null ? 401 : 403);
        return;
    }

    req.authTokenData = tokenData;

    next();
}

declare global {
    namespace Express {
        interface Request {
            authTokenData?: AuthTokenData;
        }
    }
}
