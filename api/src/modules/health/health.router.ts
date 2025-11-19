import { Router } from "express";
import { checkDatabase } from "./health.controller";

const router = Router();

router.get("/database", checkDatabase);

export default router;
