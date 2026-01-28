export interface TestSuiteConfig {
  url: string;
  /** Optional instructions for the AI agent on what to test */
  instructions?: string;
}

export interface TestStep {
  action: string;
  description: string;
  status: "pass" | "fail" | "error";
  details?: string;
}

export interface TestResult {
  url: string;
  steps: TestStep[];
  summary: string;
  startedAt: Date;
  completedAt: Date;
}
