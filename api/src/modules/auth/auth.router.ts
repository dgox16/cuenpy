import { Router } from "express";
import { login, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";
import { validate } from "../../middlewares/validateRequest";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
