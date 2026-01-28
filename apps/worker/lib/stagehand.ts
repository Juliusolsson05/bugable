import { Stagehand } from '@browserbasehq/stagehand';
import chromium from '@sparticuz/chromium';

export async function createStagehand(): Promise<Stagehand> {
  const isServerless = !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
                       !!process.env.VERCEL;

  const stagehand = new Stagehand({
    env: 'LOCAL',
    verbose: 1,
    ...(isServerless && {
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
