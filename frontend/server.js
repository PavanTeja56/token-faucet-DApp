const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve built frontend
app.use(express.static("dist"));

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// SPA fallback (FIXED)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});