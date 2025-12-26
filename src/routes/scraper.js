const express = require("express");
const fs = require("fs");
const path = require("path");
const validateMiddleware = require("../middleware/validate");
const g2Scraper = require("../scrapers/g2scraper");
const capterraScraper = require("../scrapers/capterrascraper");
const trscraper = require("../scrapers/trscraper");

const router = express.Router();

router.post("/scrape-request", validateMiddleware, async (req, res) => {
  const { companyname, startDate, endDate, source } = req.body;

  try {
    let reviews = [];

    if (source === "G2") {
      reviews = await g2Scraper(companyname, startDate, endDate);
    } else if (source === "Capterra") {
      reviews = await capterraScraper(companyname, startDate, endDate);
    } else if (source === "Trustradius") {
      reviews = await trscraper(companyname, startDate, endDate);
    }

    reviews = {
      company: companyname,
      source: source,
      totalReviews: reviews.length,
      reviews: reviews,
    };

    const jsonData = JSON.stringify(reviews, null, 2);
    const outputDir = path.join(__dirname, "../..", "output");
    const filePath = path.join(outputDir, "output.json");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, jsonData);

    return res.status(200).json({
      success: true,
      source,
      companyname,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
