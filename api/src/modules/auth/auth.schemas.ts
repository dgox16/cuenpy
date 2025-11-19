import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

export const registerSchema = z.object({
    body: z.object({
        username: z
            .string()
            .min(3, "Username must have at least 3 characters")
            .max(20, "Username too long")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            ),
        name: z.string().min(2, "Name must have at least 2 characters"),
        email: z.string().email("Invalid email format"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .regex(
                passwordRegex,
                "Password must include uppercase, lowercase, number, and special character",
            ),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        username: z.string().min(3, "Username or email is required"),
        password: z.string().min(8, "Password must be at least 8 characters long"),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
