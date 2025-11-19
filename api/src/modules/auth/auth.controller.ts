import { Request, Response } from "express";
import * as authService from "./auth.service";
import { LoginInput, RegisterInput } from "./auth.schemas";
import { errorResponse, successResponse } from "../../utils/response";
import { env } from "../../config/env";

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    try {
        const { username, name, email, password } = req.body;
        const user = await authService.registerUser(username, name, email, password);

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
        const { username, password } = req.body;
        const { user, accessToken, refreshToken } = await authService.loginUser(username, password);

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
