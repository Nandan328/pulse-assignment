const { chromium } = require("playwright");

async function launchBrowser() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-infobars",
      "--start-maximized",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: null,
    locale: "en-US",
    timezoneId: "Asia/Kolkata",
  });

  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "font"].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  return { browser, page };
}

module.exports = launchBrowser;
