import express from "express";
import cors from "cors";

import screenRoutes from "./routes/screen.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Digiferate CMS API is running",
  });
});

app.use("/api/screens", screenRoutes);

export default app;