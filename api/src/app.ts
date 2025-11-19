import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import healthRouter from "./modules/health/health.router";
import authRouter from "./modules/auth/auth.router";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";

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
