import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";

export const validateRequest =
    (schema: ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (err: any) {
            const formattedErrors = err.issues.map((error: any) => ({
                path: error.path.join("."),
                message: error.message,
            }));
            return errorResponse(res, "VALIDATION_ERROR", "Invalid input", 400, formattedErrors);
        }
    };
