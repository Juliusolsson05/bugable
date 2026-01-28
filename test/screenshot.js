import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://localhost:5173';
const outputPath = process.argv[3] || 'screenshot.png';

async function takeFullPageScreenshot(url, outputPath) {
  console.log(`Taking full page screenshot of: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set a reasonable viewport width
  await page.setViewport({ width: 1440, height: 900 });

  // Navigate to the page
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait a bit for any animations to settle
  await new Promise(resolve => setTimeout(resolve, 500));

  // Take full page screenshot
  await page.screenshot({
    path: outputPath,
    fullPage: true
  });

  console.log(`Screenshot saved to: ${outputPath}`);

  // Also get page dimensions for reference
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight
  }));
  console.log(`Page dimensions: ${dimensions.width}x${dimensions.height}px`);

  await browser.close();
}

takeFullPageScreenshot(url, outputPath).catch(err => {
  console.error('Error taking screenshot:', err);
  process.exit(1);
});
