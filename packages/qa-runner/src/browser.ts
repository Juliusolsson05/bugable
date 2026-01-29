import { Stagehand } from '@browserbasehq/stagehand';

export interface BrowserConfig {
  env?: 'LOCAL' | 'BROWSERBASE';
  verbose?: 0 | 1 | 2;
  localBrowserLaunchOptions?: {
    executablePath?: string;
    args?: string[];
    headless?: boolean;
  };
}

/**
 * Normalize a URL for comparison purposes by removing hash fragments.
 * This allows hash-only navigation (like #section links) while still detecting
 * actual page navigations.
 *
 * @param url - The URL to normalize
 * @returns The normalized URL (origin + pathname + search, without hash)
 */
export function normalizeUrlForComparison(url: string): string {
  const urlObj = new URL(url);
  return urlObj.origin + urlObj.pathname + urlObj.search;
}

export class Browser {
  private stagehand: Stagehand | null = null;
  private originalUrl: string | null = null;

  constructor(private config: BrowserConfig = {}) {}

  async init() {
    this.stagehand = new Stagehand({
      env: this.config.env || 'LOCAL',
      verbose: this.config.verbose ?? 1,
      ...(this.config.localBrowserLaunchOptions && {
        localBrowserLaunchOptions: this.config.localBrowserLaunchOptions
      })
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

    // Store the original URL (without hash) for navigation prevention
    const urlObj = new URL(page.url());
    this.originalUrl = urlObj.origin + urlObj.pathname + urlObj.search;
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

    const page = this.stagehand.context.activePage();
    if (!page) {
      throw new Error('No page available');
    }

    // Store URL before action
    const urlBeforeAction = page.url();
    console.log(`[Navigation Prevention] URL before action: ${urlBeforeAction}`);

    // Pass the natural language action directly to Stagehand
    await this.stagehand.act(action);

    // Wait a bit to ensure navigation completes if it happened
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if navigation occurred
    const urlAfterAction = page.url();
    console.log(`[Navigation Prevention] URL after action: ${urlAfterAction}`);

    if (this.originalUrl && urlBeforeAction !== urlAfterAction) {
      const beforeObj = new URL(urlBeforeAction);
      const afterObj = new URL(urlAfterAction);
      const beforePath = beforeObj.origin + beforeObj.pathname + beforeObj.search;
      const afterPath = afterObj.origin + afterObj.pathname + afterObj.search;

      // Allow hash-only changes
      if (beforePath !== afterPath) {
        console.log(`[Navigation Prevention] ⚠️ DETECTED NAVIGATION from ${urlBeforeAction} to ${urlAfterAction}`);
        console.log(`[Navigation Prevention] 🔄 Restoring original page: ${this.originalUrl}`);

        // Navigate back to the original URL
        await page.goto(this.originalUrl, { waitUntil: 'networkidle' });

        console.log(`[Navigation Prevention] ✅ Restored to: ${page.url()}`);
      }
    }
  }

  async getCurrentUrl(): Promise<string> {
    if (!this.stagehand) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    const page = this.stagehand.context.activePage();
    if (!page) {
      throw new Error('No page available');
    }
    return page.url();
  }

  async enableNavigationPrevention() {
    if (!this.stagehand) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    if (!this.originalUrl) {
      throw new Error('No original URL set. Call navigate() first.');
    }

    const page = this.stagehand.context.activePage();
    if (!page) {
      throw new Error('No page available');
    }

    const originalUrl = this.originalUrl;
    const originalUrlObj = new URL(originalUrl);
    const allowedPath = originalUrlObj.origin + originalUrlObj.pathname + originalUrlObj.search;

    // Enable Page domain events to monitor navigation
    await page.sendCDP('Page.enable');

    // Use CDP to intercept and block navigations at the protocol level
    await page.sendCDP('Page.setLifecycleEventsEnabled', { enabled: true });

    // Define the prevention script as a string for both CDP and addInitScript
    const preventionScriptString = `
      (function() {
        console.log('[Navigation Prevention] Script injected and running');

        // Prevent all navigation attempts
        window.addEventListener('beforeunload', function(e) {
          e.preventDefault();
          e.returnValue = '';
          console.warn('[Navigation Prevention] Blocked beforeunload');
        }, true);

        // Block all link clicks
        document.addEventListener('click', function(e) {
          var target = e.target;
          var link = target.closest ? target.closest('a') : null;
          if (link) {
            var href = link.getAttribute('href');
            if (href && !href.startsWith('#')) {
              console.warn('[Navigation Prevention] Blocked link click to:', href);
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              return false;
            }
          }
        }, true);

        // Block form submissions
        document.addEventListener('submit', function(e) {
          console.warn('[Navigation Prevention] Blocked form submission');
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }, true);

        // Disable navigation methods
        window.location.assign = function() {
          console.warn('[Navigation Prevention] Blocked location.assign');
        };
        window.location.replace = function() {
          console.warn('[Navigation Prevention] Blocked location.replace');
        };
        window.location.reload = function() {
          console.warn('[Navigation Prevention] Blocked location.reload');
        };

        // Override history
        var noop = function() {
          console.warn('[Navigation Prevention] Blocked history navigation');
        };
        history.pushState = noop;
        history.replaceState = noop;
        history.go = noop;
        history.back = noop;
        history.forward = noop;

        console.log('[Navigation Prevention] All hooks installed');
      })();
    `;

    // Inject the script into the current page immediately
    try {
      await page.sendCDP('Runtime.evaluate', {
        expression: preventionScriptString,
        returnByValue: false
      });
      console.log(`[Navigation Prevention] ✅ Injected prevention script into current page`);
    } catch (error) {
      console.warn(`[Navigation Prevention] ⚠️ Could not inject into current page:`, error);
    }

    // Also add for future page loads using the function form
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__navigationPrevented = true;

      // Prevent all navigation attempts
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        (e as any).returnValue = '';
      }, true);

      // Block all link clicks
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link) {
          const href = link.getAttribute('href');
          if (href && !href.startsWith('#')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }
        }
      }, true);

      // Block form submissions
      document.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }, true);
    });

    console.log(`[Navigation Prevention] Enabled for URL: ${allowedPath}`);
  }

  async close() {
    if (this.stagehand) {
      await this.stagehand.close();
    }
  }
}
