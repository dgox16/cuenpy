import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { errorResponse, successResponse } from "../../utils/response";

export const checkDatabase = async (_req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({ take: 1 });
        successResponse(res, "Database connected successfully", users.length);
    } catch (err) {
        errorResponse(res, "HEALTH_DATABASE_FAIL", "Database connection failed", 500);
    }
};
