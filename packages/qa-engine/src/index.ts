import { Stagehand } from "@browserbasehq/stagehand";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

interface Bug {
  page: string;
  description: string;
}

function getBaseDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "";
  }
}

// Schemas for structured outputs
const BugCheckSchema = z.object({
  hasBugs: z.boolean(),
  description: z.string(),
});

const NextActionSchema = z.object({
  action: z.string(),
  shouldStop: z.boolean(),
});

async function testWebsite(url: string) {
  const bugs: Bug[] = [];
  const maxSteps = 10;
  const visitedPages: string[] = [];
  const baseDomain = getBaseDomain(url);

  console.log("=== AI Visual QA Testing ===\n");

  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Initialize conversation with system prompt
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are a QA tester exploring a website to find bugs. Your job is to:
1. Look at screenshots and identify REAL bugs (broken functionality, not design opinions)
2. Suggest ONE ATOMIC action at a time to explore the website
3. Learn from your previous actions and their results
4. If you click a link and navigation fails (URL doesn't change), that's a BUG - report it

CRITICAL: You can only do ONE action at a time. Break down complex tasks into single steps.

When typing into fields, ALWAYS include the EXACT value to type in quotes.

GOOD single actions (notice the specific values):
- "type 'test@example.com' into the email field"
- "type 'password123' into the password field"
- "type 'John Doe' into the name field"
- "click the Login button"
- "click the Sign Up link"
- "scroll down"

BAD actions:
- "type an email into the email field" ❌ (no specific value)
- "enter a password" ❌ (no specific value)
- "fill out the form with email and password then click submit" ❌ (multi-step)
- "enter credentials and log in" ❌ (multi-step)

REAL bugs include:
- Broken images (404, won't load, missing)
- Non-functional buttons/links (you click but nothing happens)
- Forms that error or don't submit
- Text completely unreadable (not just small)
- Elements completely off-screen or broken layout
- Links that should navigate but don't

NOT bugs (don't report these):
- Cookie banners or consent dialogs (normal UI)
- Design preferences or minor alignment
- Intentional modals, popups, or overlays
- Small text or minor spacing issues

When exploring:
- Test interactive features one action at a time
- To test a login form: first type email, then (next turn) type password, then (next turn) click login
- Don't just click navigation links - explore functionality step by step
- Learn from failed attempts and try different things`,
    },
  ];

  // Initialize Stagehand
  console.log("Initializing Stagehand...");
  const stagehand = new Stagehand({ env: "LOCAL", verbose: 1 });
  await stagehand.init();
  const page = stagehand.context.pages()[0];
  console.log("✅ Stagehand initialized!\n");

  // Navigate to URL
  console.log(`Visiting ${url}...`);
  console.log(`Base domain: ${baseDomain}\n`);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("✅ Page loaded!\n");

  // Start exploration loop
  console.log("Starting AI-powered bug detection...\n");

  for (let step = 0; step < maxSteps; step++) {
    console.log(`--- Step ${step + 1}/${maxSteps} ---`);

    const currentUrl = page.url();
    console.log(`Currently on: ${currentUrl}`);

    // Check if we're on an external domain
    const currentDomain = getBaseDomain(currentUrl);
    if (currentDomain !== baseDomain && currentDomain !== "") {
      console.log(
        `⚠️ Navigated to external domain (${currentDomain}), going back...\n`
      );
      await page.goBack();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      continue;
    }

    // Track visited pages
    if (!visitedPages.includes(currentUrl)) {
      visitedPages.push(currentUrl);
    }

    // Take screenshot
    console.log("Taking screenshot...");
    const screenshot = await page.screenshot({ fullPage: false });
    const base64Screenshot = screenshot.toString("base64");

    // Step A: Ask about bugs
    console.log("AI is inspecting the page for bugs...");
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: `Currently on: ${currentUrl}\n\nLook at this screenshot. Are there any bugs on this page?`,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${base64Screenshot}`,
          },
        },
      ],
    });

    const bugCheckResponse = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages,
      response_format: zodResponseFormat(BugCheckSchema, "bug_check"),
    });

    const bugCheck = bugCheckResponse.choices[0].message;
    if (!bugCheck.parsed) {
      console.log("Failed to parse bug check response\n");
      continue;
    }

    // Add assistant response to conversation
    messages.push(bugCheck);

    console.log(`Bug check: ${bugCheck.parsed.hasBugs ? "YES" : "NO"}`);
    console.log(`Description: ${bugCheck.parsed.description}\n`);

    if (bugCheck.parsed.hasBugs) {
      bugs.push({
        page: currentUrl,
        description: bugCheck.parsed.description,
      });
      console.log("🐛 Bug detected and recorded!\n");
    } else {
      console.log("✅ No bugs detected on this page\n");
    }

    // Step B: Ask what to do next
    console.log("AI is deciding next action...");
    messages.push({
      role: "user",
      content: `What should I do next to continue exploring this website? Suggest ONE specific action. Examples: "click the Login button", "fill the search box with 'test' and submit", "click the About link". Consider trying forms and interactive features, not just navigation links.`,
    });

    const nextActionResponse = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages,
      response_format: zodResponseFormat(NextActionSchema, "next_action"),
    });

    const nextActionMessage = nextActionResponse.choices[0].message;
    if (!nextActionMessage.parsed) {
      console.log("Failed to parse next action response\n");
      continue;
    }

    // Add assistant response to conversation
    messages.push(nextActionMessage);

    console.log(`Next action: ${nextActionMessage.parsed.action}`);
    console.log(`Should stop: ${nextActionMessage.parsed.shouldStop}\n`);

    if (nextActionMessage.parsed.shouldStop) {
      console.log("AI suggests exploration is complete. Ending test.\n");
      break;
    }

    // Step C: Perform the action
    try {
      console.log("Performing action...");
      const urlBefore = page.url();

      await stagehand.act(nextActionMessage.parsed.action);

      console.log("Waiting for page to settle...");
      await new Promise((resolve) => setTimeout(resolve, 6000));

      const urlAfter = page.url();

      // Report result back to AI
      if (urlBefore !== urlAfter) {
        console.log(`✅ Navigated to: ${urlAfter}\n`);
        messages.push({
          role: "user",
          content: `I performed the action "${nextActionMessage.parsed.action}". Result: Successfully navigated from ${urlBefore} to ${urlAfter}.`,
        });
      } else {
        console.log(`Still on: ${urlAfter}\n`);
        messages.push({
          role: "user",
          content: `I performed the action "${nextActionMessage.parsed.action}". Result: No navigation occurred - still on ${urlAfter}. This might indicate the action opened a modal, updated the page content, or the link/button is broken.`,
        });
      }
    } catch (error) {
      console.log("⚠️ Action failed!");
      console.log(`Error: ${error}\n`);
      messages.push({
        role: "user",
        content: `I tried to perform "${nextActionMessage.parsed.action}" but it failed with error: ${error}`,
      });
    }
  }

  // Generate final report
  console.log("\n=== QA Test Report ===");
  console.log(`Tested URL: ${url}`);
  console.log(`Base domain: ${baseDomain}`);
  console.log(`Pages explored: ${visitedPages.length}`);
  console.log(`Bugs found: ${bugs.length}\n`);

  if (visitedPages.length > 0) {
    console.log("Pages visited:");
    visitedPages.forEach((pageUrl, i) => {
      console.log(`  ${i + 1}. ${pageUrl}`);
    });
    console.log();
  }

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
