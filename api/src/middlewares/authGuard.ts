import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { errorResponse } from "../utils/response";

export const authGuard = (req: any, res: Response, next: NextFunction) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return errorResponse(res, "NO_TOKEN", "No access token provided", 401);
        }

        const payload = jwt.verify(token, env.JWT_SECRET);
        req.user = payload;

        next();
    } catch (err) {
        return errorResponse(res, "INVALID_TOKEN", "Invalid or expired access token", 401);
    }
};
