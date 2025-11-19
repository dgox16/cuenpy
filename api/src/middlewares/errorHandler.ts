import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("❌ Error:", err);
    const status = err.status || 500;

    errorResponse(res, "INTERNAL_SERVER_ERROR", err.message || "Internal server error", status);
};

export const notFoundHandler = (_req: Request, res: Response, _next: NextFunction) => {
    errorResponse(res, "NOT_FOUND", "Endpoint not found", 404);
};
