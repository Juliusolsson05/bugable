import { Stagehand } from "@browserbasehq/stagehand";

interface Bug {
  page: string;
  description: string;
}

async function testWebsite(url: string) {
  const bugs: Bug[] = [];
  const maxSteps = 10;

  console.log("=== AI Visual QA Testing ===\n");

  // 1. Initialize Stagehand
  console.log("Initializing Stagehand...");
  const stagehand = new Stagehand({ env: "LOCAL", verbose: 1 });
  await stagehand.init();
  const page = stagehand.context.pages()[0];
  console.log("✅ Stagehand initialized!\n");

  // 2. Navigate to URL
  console.log(`Visiting ${url}...`);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  // Give it a moment for JS to execute
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("✅ Page loaded!\n");

  // 3. Start exploration loop
  console.log("Starting AI-powered bug detection...\n");

  for (let step = 0; step < maxSteps; step++) {
    console.log(`--- Step ${step + 1}/${maxSteps} ---`);

    // Get current page URL for reporting
    const currentUrl = page.url();
    console.log(`Currently on: ${currentUrl}`);

    // Step A: Ask AI to check for bugs
    console.log("AI is inspecting the page for bugs...");
    const bugCheckResult = await stagehand.extract(
      "Are there any visual bugs, broken UI elements, layout issues, missing images, broken buttons, or anything that looks wrong on this page? Answer 'YES' or 'NO' first, then explain what you see."
    );
    const bugCheck = bugCheckResult.extraction;
    console.log(`Bug check: ${bugCheck}\n`);

    // Step B: If something looks wrong, record it (check if AI explicitly says YES)
    const bugCheckLower = bugCheck.toLowerCase();
    const startsWithYes = bugCheckLower.startsWith("yes");
    const hasNoBugs = bugCheckLower.includes("no visual bugs") ||
                      bugCheckLower.includes("no visible") ||
                      bugCheckLower.includes("no bugs") ||
                      bugCheckLower.startsWith("no");

    if (startsWithYes && !hasNoBugs) {
      bugs.push({
        page: currentUrl,
        description: bugCheck,
      });
      console.log("🐛 Bug detected and recorded!\n");
    } else {
      console.log("✅ No bugs detected on this page\n");
    }

    // Step C: Ask AI what to do next
    console.log("AI is deciding next action...");
    const nextActionResult = await stagehand.extract(
      "What should I click or interact with next to continue exploring this website? Suggest a specific action like 'click the About link' or 'scroll down'. If there's nothing useful to explore, say 'nothing to do'."
    );
    const nextAction = nextActionResult.extraction;
    console.log(`Next action: ${nextAction}\n`);

    // Check if AI thinks exploration is done
    if (
      nextAction &&
      (nextAction.toLowerCase().includes("nothing") ||
        nextAction.toLowerCase().includes("no more") ||
        nextAction.toLowerCase().includes("exhausted"))
    ) {
      console.log("AI suggests exploration is complete. Ending test.\n");
      break;
    }

    // Step D: Perform the action
    try {
      console.log("Performing action...");
      const urlBeforeAction = page.url();

      await stagehand.act(nextAction);

      // Wait a moment for navigation to potentially start
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if URL changed (navigation happened)
      const urlAfterAction = page.url();
      if (urlBeforeAction !== urlAfterAction) {
        console.log(`Page navigated to ${urlAfterAction}, waiting for load...`);
        try {
          await page.waitForLoadState("domcontentloaded");
          // Extra wait for any dynamic content
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.log("Page load timeout, continuing...");
        }
      } else {
        console.log("No navigation detected, waiting briefly...");
        // If no navigation, just wait a bit for any DOM updates
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log("✅ Action completed!\n");
    } catch (error) {
      console.log("⚠️ Action failed, continuing anyway...\n");
      console.log(`Error: ${error}`);
    }
  }

  // 4. Generate final report
  console.log("\n=== QA Test Report ===");
  console.log(`Tested URL: ${url}`);
  console.log(`Steps completed: ${Math.min(maxSteps, bugs.length > 0 ? maxSteps : maxSteps)}`);
  console.log(`Bugs found: ${bugs.length}\n`);

  if (bugs.length === 0) {
    console.log("✅ No bugs detected!");
  } else {
    console.log("Bugs found:\n");
    bugs.forEach((bug, i) => {
      console.log(`${i + 1}. [${bug.page}]`);
      console.log(`   ${bug.description}\n`);
    });
  }

  await stagehand.close();
  console.log("Browser closed.");
}

// Run with URL from command line or default
const testUrl = process.argv[2] || "https://example.com";
testWebsite(testUrl).catch(console.error);
