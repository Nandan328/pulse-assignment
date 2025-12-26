const express = require("express");
const scraperRoutes = require("./routes/scraper");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.use("/api", scraperRoutes);
app.get("/output", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "output", "output.json"));
});

app.use(express.static(path.join(__dirname, "..", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Scraper website is running on http://localhost:${PORT}`);
});
