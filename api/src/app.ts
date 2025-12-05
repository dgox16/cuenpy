import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import authRouter from "./modules/auth/auth.router";
import healthRouter from "./modules/health/health.router";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
