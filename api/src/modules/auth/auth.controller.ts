import { Request, Response } from "express";
import * as authService from "./auth.service";
import { LoginInput, RegisterInput } from "./auth.schemas";
import { errorResponse, successResponse } from "../../utils/response";
import { env } from "../../config/env";

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    try {
        const { username, name, email, password } = req.body;
        const emailNormalized = email.toLowerCase();
        const usernameNormalized = username.toLowerCase();
        const user = await authService.registerUser(
            usernameNormalized,
            name,
            emailNormalized,
            password,
        );

        successResponse(
            res,
            "User registered successfully",
            { id: user.id, username: user.username, name: user.name, email: user.email },
            201,
        );
    } catch (error: any) {
        errorResponse(res, "AUTH_REGISTER_FAIL", error.message);
    }
};

export const login = async (req: Request<{}, {}, LoginInput>, res: Response) => {
    try {
        const { identifier, password } = req.body;
        const { user, accessToken, refreshToken } = await authService.loginUser(
            identifier,
            password,
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/auth/refresh",
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        successResponse(res, "Login successful", { accessToken, user }, 201);
    } catch (error: any) {
        errorResponse(res, "AUTH_LOGIN_FAIL", error.message);
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        let token = req.cookies?.refreshToken;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return errorResponse(res, "NO_REFRESH_TOKEN", "Refresh token missing", 401);
        }

        const { accessToken, newRefreshToken, user } = await authService.refreshToken(token);

        if (req.cookies.refreshToken) {
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/auth/refresh",
                maxAge: 15 * 24 * 60 * 60 * 1000,
            });
        }

        return successResponse(res, "Token refreshed", {
            accessToken,
            refreshToken: req.cookies.refreshToken ? undefined : newRefreshToken,
            user,
        });
    } catch (err: any) {
        return errorResponse(res, "REFRESH_FAIL", err.message, 401);
    }
};
