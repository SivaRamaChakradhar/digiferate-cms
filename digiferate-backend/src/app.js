import express from "express";
import cors from "cors";

import screenRoutes from "./routes/screen.routes.js";
import pairingRoutes from "./routes/pairing.routes.js";
import contentRoutes from "./routes/content.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import wallpaperRoutes from "./routes/wallpaper.routes.js";
import facilityCategoryRoutes from "./routes/facility-category.routes.js";
import facilityImageRoutes from "./routes/facility-image.routes.js";
import facilityImageManagementRoutes from "./routes/facility-image-management.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Digiferate CMS API is running",
  });
});

app.use("/api/screens", screenRoutes);
app.use("/api/pairings", pairingRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/content", mediaRoutes);
app.use("/api/wallpapers", wallpaperRoutes);
app.use("/api/facility-categories", facilityCategoryRoutes);
app.use("/api/facility-categories", facilityImageRoutes);
app.use("/api/facility-images", facilityImageManagementRoutes);

export default app;