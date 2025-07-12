const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = "/mnt/data";
fs.ensureDirSync(dataDir);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend if needed
app.use(express.static("public"));

// ✅ Standalone ad route
const postAdStandalone = require("./routes/postAdStandalone");
app.use("/api/standalone-post-ad", postAdStandalone);

// Default route
app.get("/", (req, res) => {
  res.send("ShopNest Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
