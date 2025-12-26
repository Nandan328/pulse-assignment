const launchBrowser = require("../utils/browser");

const TR_HOME = "https://www.trustradius.com/";

const extractReview = async (card) => {
  const [title, stars, dateText, summary, pros, cons, username] =
    await Promise.all([
      card
        .locator("h2 a")
        .first()
        .innerText()
        .catch(() => ""),
      card
        .locator('[data-testid="stars-container"]')
        .first()
        .getAttribute("data-rating")
        .catch(() => ""),
      card
        .locator("time")
        .first()
        .getAttribute("datetime")
        .catch(() => ""),
      card
        .locator(
          '.ReviewAnswer_reviewAnswer__JI1ZJ:has(h3:has-text("Use Cases")) p'
        )
        .first()
        .innerText()
        .catch(() => ""),
      card
        .locator(
          '.ReviewAnswer_reviewAnswer__JI1ZJ:has(h3:has-text("Pros")) li'
        )
        .allInnerTexts()
        .catch(() => []),
      card
        .locator(
          '.ReviewAnswer_reviewAnswer__JI1ZJ:has(h3:has-text("Cons")) li'
        )
        .allInnerTexts()
        .catch(() => []),
      card
        .locator(".Byline_name__Sl7TC")
        .first()
        .innerText()
        .catch(() => ""),
    ]);

  const content = {
    summary,
    pros,
    cons,
  };

  let date = dateText.split("T")[0];

  return {
    title,
    content,
    date,
    stars: parseInt(stars) / 2 || 0,
    username,
  };
};

const trscraper = async (companyname, startDate, endDate) => {
  let browser;

  try {
    const { browser: br, page } = await launchBrowser();
    browser = br;

    await page.goto(`${TR_HOME}search?q=${encodeURIComponent(companyname)}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector("a.product-link");
    await page.locator("a.product-link").first().click();
    await page.waitForLoadState("domcontentloaded");

    const baseUrl = page.url().split("?")[0];

    const reviews = [];
    let pageNo = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      await page.goto(`${baseUrl}/all?page=${pageNo}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      const cards = page.locator("article.Review_review__iy16m");
      const count = await cards.count();

      if (count === 0) break;

      const start = startDate;
      const end = endDate;

      let lastPageDate = await cards
        .last()
        .locator("time")
        .getAttribute("datetime");

      lastPageDate = lastPageDate.split("T")[0];

      if (!lastPageDate) {
        pageNo++;
        continue;
      }

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
    console.error("TrustRadius Scraper Error:", error.message);
    if (error.message?.includes("locator('a.product-link')")) {
      throw new Error("Couldn't find Company");
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = trscraper;
