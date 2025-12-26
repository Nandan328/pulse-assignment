const launchBrowser = require("../utils/browser");
require("dotenv").config();

const G2_HOME = "https://www.g2.com/";

const parseReviewDate = (date) => {
  const [day, month, year] = date.split("/");

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const extractReview = async (card) => {
  const [title, stars, username, dateText, content] = await Promise.all([
    card.locator('[itemprop="name"] > div').first().innerText(),
    card
      .locator('[itemprop="reviewRating"] meta[itemprop="ratingValue"]')
      .first()
      .getAttribute("content")
      .catch(() => ""),
    card
      .locator('[itemprop="author"] div.elv-font-bold')
      .first()
      .innerText()
      .catch(() => ""),
    card
      .locator('meta[itemprop="datePublished"]')
      .first()
      .getAttribute("content")
      .catch(() => ""),
    card
      .locator('[itemprop="reviewBody"] section p')
      .first()
      .allInnerTexts()
      .catch(() => ""),
  ]);

  const date = parseReviewDate(dateText);

  return {
    title: title.replace(/"/g, ""),
    content: content.replace(/\n/g, ""),
    date,
    stars: parseInt(stars) || 0,
    username,
  };
};

const g2Scraper = async (companyname, startDate, endDate) => {
  let browser;

  const email = process.env.G2_EMAIL;
  const password = process.env.G2_PASSWORD;

  try {
    const { browser: br, page } = await launchBrowser();
    browser = br;

    await page.goto(G2_HOME, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(3000);

    await page.mouse.move(400, 500);
    await page.waitForTimeout(800);

    await page.goto(`${G2_HOME}identities/start_login`, {
      waitUntil: "load",
      timeout: 20000,
    });

    if (!email && !password) {
      console.log(email, password);

      throw new Error("No login credentials");
    }

    await page.locator("#auth_key").fill(email);

    await page.locator("#password_input").fill(password);

    const loginButton = page.locator('input[type="submit"][value="Log in"]');
    await loginButton.waitFor({ state: "attached" });

    await loginButton.click();

    await page.mouse.move(400, 500);
    await page.waitForTimeout(1500);

    await page.goto(
      `${G2_HOME}search?query=${encodeURIComponent(companyname)}`,
      { waitUntil: "domcontentloaded" }
    );

    await page.waitForSelector("a.a--md.js-log-click", {
      state: "visible",
      timeout: 15000,
    });

    await page.waitForTimeout(1000);
    await page.mouse.move(500, 600);

    await page.locator("a.a--md.js-log-click").first().click();

    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    await page.waitForSelector(".choices", { timeout: 15000 });
    await page.locator(".choices").first().click();
    await page.waitForTimeout(800);

    await page.locator('.choices__item[data-value="most_recent"]').click();

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const start = startDate;
    const end = endDate;

    const reviews = [];
    let pageNo = 1;
    let hasMorePages = true;

    const baseUrl = page.url().split("?")[0];
    while (hasMorePages) {
      await page.goto(`${baseUrl}?page=${pageNo}#reviews`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      await page.waitForTimeout(1000);
      const cards = await page.locator('article[itemprop="review"]').all();
      const count = await cards.count();

      if (count === 0) break;

      let lastPageDate = await cards
        .last()
        .locator('meta[itemprop="datePublished"]')
        .getAttribute("content");

      if (!lastPageDate) {
        pageNo++;
        continue;
      }
      lastPageDate = parseReviewDate(lastPageDate);

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
      await page.waitForTimeout(1000 + Math.random() * 200);
    }

    return reviews;
  } catch (error) {
    console.error("G2 Scraper Error:", error.message);
    if (error.message?.includes("locator('a.a--md.js-log-click')")) {
      throw new Error("Couldn't find Company");
    }
    if (error.message?.includes("locator")) {
      throw new Error("Request blocked try after sometime");
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = g2Scraper;
