import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { login, refresh, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", refresh);

export default router;
