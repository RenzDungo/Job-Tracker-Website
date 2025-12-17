
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { checkDbConnection } from "./db";
import usersRouter from "./routes/users";
import jobappsRouter from "./routes/jobapp"
import cors from "cors"
import airouter from "./routes/ai";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());

app.use("/api", usersRouter)
app.use("/api/jobapp", jobappsRouter)
app.use("/api/ai", airouter)
async function startServer() {
  try {
    await checkDbConnection();
    console.log("Connected to PostgreSQL");

    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  }
}
app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});
startServer();
