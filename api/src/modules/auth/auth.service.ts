import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";

export interface TokenPayload {
    id: number;
    email: string;
    username: string;
}

export const generateAccessToken = (payload: TokenPayload) => {
    const options = {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions;

    return jwt.sign(payload, env.JWT_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload) => {
    const options = {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions;

    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

export const registerUser = async (
    username: string,
    name: string,
    email: string,
    password: string,
) => {
    const existing = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
        },
    });

    if (existing) throw new Error("Username or email already in use");

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: { username, name, email, password: hashedPassword },
    });

    return user;
};

export const loginUser = async (identifier: string, password: string) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email: identifier }, { username: identifier }],
        },
    });

    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const payload: TokenPayload = { id: user.id, email: user.email, username: user.username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userFormatted = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
    };

    await prisma.refreshToken.updateMany({
        where: { userId: user.id, revoked: false },
        data: { revoked: true },
    });

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
    });

    return { user: userFormatted, accessToken, refreshToken };
};

export const refreshToken = async (incomingToken: string) => {
    const stored = await prisma.refreshToken.findFirst({
        where: { token: incomingToken, revoked: false },
        include: { user: true },
    });

    if (!stored) throw new Error("Refresh token invalid");

    let payload: TokenPayload;
    try {
        payload = jwt.verify(incomingToken, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
        throw new Error("Refresh token expired");
    }

    await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
    });

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
        data: {
            token: newRefreshToken,
            userId: stored.userId,
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
    });

    return {
        accessToken: newAccessToken,
        newRefreshToken,
        user: stored.user,
    };
};
