import { Browser } from './browser';
import { AIClient } from './ai-client';
import { TestConfig, TestResult, Finding, ActionLog } from './types';
import { sleep } from './utils';

export class QARunner {
  private browser: Browser;
  private aiClient: AIClient;
  private findings: Finding[] = [];
  private actionLog: ActionLog[] = [];
  private currentTurn = 0;

  constructor(private config: TestConfig) {
    this.browser = new Browser();
    this.aiClient = new AIClient();
  }

  async run(): Promise<TestResult> {
    const { url, maxTurns = 50 } = this.config;
    const startedAt = new Date();
    let completionReason: 'ai_complete' | 'max_turns' | 'error' = 'max_turns';

    try {
      // Initialize browser and navigate
      await this.browser.init();
      await this.browser.navigate(url);

      // Main testing loop
      for (this.currentTurn = 1; this.currentTurn <= maxTurns; this.currentTurn++) {
        // 1. Take screenshot
        const screenshot = await this.browser.takeScreenshot();

        // 2. Check for bugs
        const bugCheck = await this.aiClient.detectBugs(screenshot, url);

        // 3. Store findings
        if (bugCheck.hasBugs) {
          for (const bug of bugCheck.bugs) {
            this.findings.push({
              description: bug.description,
              detectedAtTurn: this.currentTurn
            });
          }
        }

        // 4. Plan next action (AI has memory, doesn't need history passed)
        const nextAction = await this.aiClient.planNextAction(screenshot, url);

        // 5. Check if testing is complete
        if (nextAction.complete) {
          completionReason = 'ai_complete';
          break;
        }

        // 6. Execute action
        const action = nextAction.action!;
        await this.browser.executeAction(action);

        // 7. Log action
        this.actionLog.push({
          turn: this.currentTurn,
          action,
          reasoning: nextAction.reasoning
        });

        // Brief pause between actions
        await sleep(1000);
      }

      return {
        url,
        success: true,
        totalTurns: this.actionLog.length,
        findings: this.findings,
        actionLog: this.actionLog,
        completionReason,
        startedAt,
        completedAt: new Date()
      };

    } catch (error) {
      return {
        url,
        success: false,
        totalTurns: this.actionLog.length,
        findings: this.findings,
        actionLog: this.actionLog,
        completionReason: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        startedAt,
        completedAt: new Date()
      };

    } finally {
      await this.browser.close();
    }
  }

  // Public getters for current state
  getFindings(): Finding[] {
    return [...this.findings];
  }

  getActionLog(): ActionLog[] {
    return [...this.actionLog];
  }

  getCurrentTurn(): number {
    return this.currentTurn;
  }
}
