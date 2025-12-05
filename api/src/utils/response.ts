import type { Response } from "express";

interface MetaInfo extends Record<string, unknown> {
    timestamp?: string;
    requestId?: string;
}

export const successResponse = <T>(
    res: Response,
    message: string,
    data?: T,
    status = 200,
    meta: MetaInfo = {},
) => {
    return res.status(status).json({
        success: true,
        message,
        data,
        meta: { timestamp: new Date().toISOString(), ...meta },
    });
};

export const errorResponse = <D>(
    res: Response,
    code: string,
    message: string,
    status = 400,
    details?: D,
    meta: MetaInfo = {},
) => {
    return res.status(status).json({
        success: false,
        error: {
            code,
            message,
            details,
        },
        meta: { timestamp: new Date().toISOString(), ...meta },
    });
};
