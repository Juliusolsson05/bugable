import { Stagehand } from '@browserbasehq/stagehand';
import chromium from '@sparticuz/chromium';
import { env } from './env.js';

/**
 * Create and initialize a Stagehand browser instance
 * Automatically configures for serverless environments (Vercel, AWS Lambda)
 */
export async function createStagehand(): Promise<Stagehand> {
  const stagehand = new Stagehand({
    env: 'LOCAL',
    verbose: 1,
    ...(env.isServerless && {
      localBrowserLaunchOptions: {
        executablePath: await chromium.executablePath(),
        args: chromium.args,
        headless: true
      }
    })
  });

  await stagehand.init();
  return stagehand;
}
