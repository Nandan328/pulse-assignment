const launchBrowser = require("../utils/browser");

const CAPTERRA_HOME = "https://www.capterra.in/";

const extractReview = async (card) => {
  const [title, stars, dateText, summary, pros, cons, username] =
    await Promise.all([
      card
        .locator("h3")
        .first()
        .innerText()
        .catch(() => ""),
      card
        .locator(".star-rating-component .ms-1")
        .first()
        .innerText()
        .catch(() => ""),
      card
        .locator(".fs-5.text-neutral-90")
        .first()
        .innerText()
        .catch(() => ""),
      card
        .locator(".fs-4.lh-2.text-neutral-99 span")
        .first()
        .innerText()
        .catch(() => ""),
      card
        .locator('div:has-text("Pros:") + div')
        .first()
        .innerText()
        .catch(() => ""),
      card
        .locator('div:has-text("Cons:") + div')
        .first()
        .innerText()
        .catch(() => ""),
      card
        .locator(".fw-600.mb-1")
        .first()
        .innerText()
        .catch(() => ""),
    ]);

  const cleanDate = dateText.split("NEW")[0].split("\n")[0].trim();

  const content = {
    summary,
    pros,
    cons,
  };

  let date = new Date(cleanDate).toISOString();
  date = date.split("T")[0];

  return {
    title: title.replace(/"/g, ""),
    stars: parseInt(stars) || 0,
    content,
    date,
    username,
  };
};

const capterraScraper = async (companyname, startDate, endDate) => {
  let browser;

  try {
    const { browser: br, page } = await launchBrowser();
    browser = br;
    await page.goto(
      `${CAPTERRA_HOME}search/product?q=${encodeURIComponent(companyname)}`,
      { waitUntil: "domcontentloaded", timeout: 30000 }
    );

    await page.waitForSelector("a.entry.d-flex", { timeout: 5000 });
    await page.locator("a.entry.d-flex").first().click();
    await page.waitForLoadState("domcontentloaded");

    const start = startDate.split("T")[0];
    const end = endDate.split("T")[0];

    const reviews = [];
    let pageNo = 1;
    let hasMorePages = true;

    const baseUrl = page.url().split("?")[0];

    while (hasMorePages) {
      await page.goto(`${baseUrl}?page=${pageNo}&sort=most_recent`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      await page.waitForTimeout(1000);
      const cards = page.locator('[data-entity="review"]');
      const count = await cards.count();

      if (count === 0) break;

      let lastPageDateText = await cards
        .last()
        .locator(".fs-5.text-neutral-90")
        .first()
        .innerText()
        .catch(() => "");

      lastPageDateText = lastPageDateText.split("NEW")[0].split("\n")[0].trim();

      if (!lastPageDateText) {
        pageNo++;
        continue;
      }
      const lastPageDate = new Date(lastPageDateText)
        .toISOString()
        .split("T")[0];

      if (lastPageDate < start) {
        hasMorePages = false;
      }

      if (lastPageDate > end) {
        pageNo++;
        continue;
      }

      const reviewPromises = [];
      for (let i = 0; i < count; i++) {
        reviewPromises.push(extractReview(cards.nth(i)));
      }

      const pageReviews = await Promise.all(reviewPromises);

      for (const review of pageReviews) {
        if (!review?.date) continue;

        if (review.date >= start && review.date <= end) {
          reviews.push(review);
        }
      }

      pageNo++;
      await page.waitForTimeout(100 + Math.random() * 200);
    }

    return reviews;
  } catch (error) {
    console.error("Capterra Scraper Error:", error.message);
    if (error.message?.includes("locator('a.entry.d-flex')")) {
      throw new Error("Couldn't find Company");
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = capterraScraper;
