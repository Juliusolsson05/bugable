// Main class export
export { QARunner } from './qa-runner';

// Type exports
export type {
  TestConfig,
  TestResult,
  Finding,
  ActionLog,
  BugCategory,
  BugSeverity,
  // Event types
  QAEvent,
  QAEventType,
  TestStartedEvent,
  TurnStartedEvent,
  ScreenshotTakenEvent,
  BugsDetectedEvent,
  ActionPlannedEvent,
  ActionExecutedEvent,
  TurnCompletedEvent,
  TestCompletedEvent,
  TestErrorEvent,
} from './types';
