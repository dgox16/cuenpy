import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export interface TokenPayload {
    id: number;
    email: string;
    username: string;
}
export const generateAccessToken = (payload: TokenPayload) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
};

export const generateRefreshToken = (payload: TokenPayload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });
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

export const loginUser = async (username: string, password: string) => {
    const user = await prisma.user.findFirst({
        where: { username },
    });

    if (!user) throw new Error("Invalid credentials");
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const payload: TokenPayload = { id: user.id, email: user.email, username: user.username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

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

    return { user, accessToken, refreshToken };
};
