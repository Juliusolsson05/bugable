import { Browser, BrowserConfig } from "./browser";
import { AIClient } from "./ai-client";
import { TestConfig, TestResult, Finding, ActionLog, QAEvent } from "./types";

export class QARunner {
  private browser: Browser;
  private aiClient: AIClient;
  private findings: Finding[] = [];
  private actionLog: ActionLog[] = [];
  private currentTurn = 0;

  constructor(private config: TestConfig & { browserConfig?: BrowserConfig }) {
    this.browser = new Browser(config.browserConfig);
    this.aiClient = new AIClient();
  }

  async *run(): AsyncGenerator<QAEvent, void, undefined> {
    const { url, maxTurns = 50 } = this.config;
    const startedAt = new Date();
    let completionReason: "ai_complete" | "max_turns" | "error" = "max_turns";

    try {
      // Initialize browser and navigate
      await this.browser.init();
      await this.browser.navigate(url);

      // Yield test started event
      yield {
        type: "test_started",
        timestamp: new Date(),
        turn: 0,
        url,
        maxTurns,
      };

      // Main testing loop
      for (
        this.currentTurn = 1;
        this.currentTurn <= maxTurns;
        this.currentTurn++
      ) {
        // Yield turn started event
        yield {
          type: "turn_started",
          timestamp: new Date(),
          turn: this.currentTurn,
        };

        // 1. Take screenshot
        const screenshot = await this.browser.takeScreenshot();

        // Yield screenshot taken event
        yield {
          type: "screenshot_taken",
          timestamp: new Date(),
          turn: this.currentTurn,
          format: "png",
          metadata: {
            size: screenshot.length,
          },
          screenshot,
        };

        // Get current URL (may have changed from navigation)
        const currentUrl = await this.browser.getCurrentUrl();

        // 2. Check for bugs (pass current URL and actual turn number)
        const bugCheck = await this.aiClient.detectBugs(
          screenshot,
          currentUrl,
          this.findings,
          this.currentTurn,
        );

        // 3. Store new findings
        const newFindings: Finding[] = [];
        if (bugCheck.hasBugs) {
          for (const bug of bugCheck.bugs) {
            const finding: Finding = {
              description: bug.description,
              category: bug.category,
              severity: bug.severity,
              location: bug.location,
              detectedAtTurn: this.currentTurn,
            };
            this.findings.push(finding);
            newFindings.push(finding);
          }
        }

        // Yield bugs detected event
        yield {
          type: "bugs_detected",
          timestamp: new Date(),
          turn: this.currentTurn,
          findings: newFindings,
          totalFindings: this.findings.length,
        };

        // 4. Plan next action (pass action history for context)
        const actionHistory = this.actionLog.map(a => a.action);
        const nextAction = await this.aiClient.planNextAction(screenshot, currentUrl, actionHistory);

        // Yield action planned event
        yield {
          type: "action_planned",
          timestamp: new Date(),
          turn: this.currentTurn,
          action: nextAction.action || "",
          reasoning: nextAction.reasoning,
          complete: nextAction.complete,
        };

        // 5. Check if testing is complete
        if (nextAction.complete) {
          completionReason = "ai_complete";

          // Yield turn completed event before breaking
          yield {
            type: "turn_completed",
            timestamp: new Date(),
            turn: this.currentTurn,
          };

          break;
        }

        // 6. Execute action
        const action = nextAction.action!;
        let actionSuccess = true;
        let actionError: string | undefined;

        try {
          await this.browser.executeAction(action);
        } catch (error) {
          actionSuccess = false;
          actionError =
            error instanceof Error ? error.message : "Unknown error";
        }

        // Yield action executed event
        yield {
          type: "action_executed",
          timestamp: new Date(),
          turn: this.currentTurn,
          action,
          success: actionSuccess,
          error: actionError,
        };

        // 7. Log action
        this.actionLog.push({
          turn: this.currentTurn,
          action,
          reasoning: nextAction.reasoning,
        });

        // Yield turn completed event
        yield {
          type: "turn_completed",
          timestamp: new Date(),
          turn: this.currentTurn,
        };

        // Note: Removed sleep between turns for serverless performance
      }

      // Build final result
      const result: TestResult = {
        url,
        success: true,
        totalTurns: this.actionLog.length,
        findings: this.findings,
        actionLog: this.actionLog,
        completionReason,
        startedAt,
        completedAt: new Date(),
      };

      // Yield test completed event
      yield {
        type: "test_completed",
        timestamp: new Date(),
        turn: this.currentTurn,
        result,
      };
    } catch (error) {
      // Build partial result
      const partialResult: TestResult = {
        url,
        success: false,
        totalTurns: this.actionLog.length,
        findings: this.findings,
        actionLog: this.actionLog,
        completionReason: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        startedAt,
        completedAt: new Date(),
      };

      // Yield test error event
      yield {
        type: "test_error",
        timestamp: new Date(),
        turn: this.currentTurn,
        error: error instanceof Error ? error.message : "Unknown error",
        partialResult,
      };
    } finally {
      await this.browser.close();
    }
  }
}
