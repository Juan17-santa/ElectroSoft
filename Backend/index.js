import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDatabase } from "./src/config/db.js";
import apiRoutes from "./src/routes/index.js";
import { notFoundMiddleware, errorMiddleware } from "./src/middlewares/errorMiddleware.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "electrosoft-backend" });
});

app.use("/api", apiRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

async function bootstrap() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`ElectroSoft backend listening on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("No fue posible iniciar el backend:", error);
  process.exit(1);
});
