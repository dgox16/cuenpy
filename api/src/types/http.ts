import type { Request } from "express";

export type TypedRequest<
    P = Record<string, never>,
    ResBody = Record<string, never>,
    ReqBody = Record<string, never>,
    Q = Record<string, never>,
> = Request<P, ResBody, ReqBody, Q>;
