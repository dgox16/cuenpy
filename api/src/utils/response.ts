import { Response } from "express";

interface MetaInfo {
    timestamp?: string;
    requestId?: string;
    [key: string]: any;
}

export const successResponse = (
    res: Response,
    message: string,
    data?: any,
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

export const errorResponse = (
    res: Response,
    code: string,
    message: string,
    status = 400,
    details?: any,
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
