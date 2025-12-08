import type { Request, Response } from "express";
import { env } from "../../config/env";
import type { TypedRequest } from "../../types/http";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { errorResponse, successResponse } from "../../utils/response";
import type { LoginInput, RegisterInput } from "./auth.schemas";
import * as authService from "./auth.service";

export const register = async (req: TypedRequest<never, never, RegisterInput>, res: Response) => {
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
    } catch (error: unknown) {
        return errorResponse(res, "AUTH_REGISTER_FAIL", getErrorMessage(error));
    }
};

export const login = async (req: TypedRequest<never, never, LoginInput>, res: Response) => {
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
    } catch (error: unknown) {
        errorResponse(res, "AUTH_LOGIN_FAIL", getErrorMessage(error));
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

        const { newAccessToken, newRefreshToken, user } = await authService.refreshToken(token);

        if (req?.cookies?.refreshToken) {
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/auth/refresh",
                maxAge: 15 * 24 * 60 * 60 * 1000,
            });
        }

        return successResponse(res, "Token refreshed", {
            newAccessToken,
            refreshToken: req?.cookies?.refreshToken ? undefined : newRefreshToken,
            user,
        });
    } catch (error: unknown) {
        return errorResponse(res, "REFRESH_FAIL", getErrorMessage(error), 401);
    }
};
