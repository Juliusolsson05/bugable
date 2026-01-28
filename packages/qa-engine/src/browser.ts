import { Stagehand } from '@browserbasehq/stagehand';

export class Browser {
  private stagehand: Stagehand | null = null;

  async init() {
    this.stagehand = new Stagehand({
      env: 'LOCAL', // Use local Playwright
      verbose: 1
    });

    await this.stagehand.init();
  }

  async navigate(url: string) {
    if (!this.stagehand) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    const page = this.stagehand.context.activePage();
    if (!page) {
      throw new Error('No page available');
    }
    await page.goto(url, { waitUntil: 'networkidle' });
  }

  async takeScreenshot(): Promise<Buffer> {
    if (!this.stagehand) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    const page = this.stagehand.context.activePage();
    if (!page) {
      throw new Error('No page available');
    }
    return await page.screenshot({
      fullPage: true,
      type: 'png'
    }) as Buffer;
  }

  async executeAction(action: string) {
    if (!this.stagehand) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    // Pass the natural language action directly to Stagehand
    await this.stagehand.act(action);
  }

  async close() {
    if (this.stagehand) {
      await this.stagehand.close();
    }
  }
}
