import { z } from 'zod';

// Input configuration
export interface TestConfig {
  url: string;
  maxTurns?: number; // default: 50
}

// Bug categories for classification
export type BugCategory =
  | 'error'              // Console errors, crashes, 404s
  | 'layout_broken'      // Overlapping content, broken layouts
  | 'image_broken'       // Broken image links
  | 'form_validation'    // Form/input issues
  | 'accessibility'      // Contrast, click targets, screen readers
  | 'visual_overflow'    // Content extending beyond containers
  | 'responsive_break'   // Mobile/tablet layout issues
  | 'typography'         // Text truncation, readability
  | 'interactive_fail'   // Buttons, links not working
  | 'contrast';          // Low contrast issues

// Bug severity levels
export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';

// Bug/Finding discovered during testing
export interface Finding {
  description: string;
  category: BugCategory;
  severity: BugSeverity;
  location: string;
  detectedAtTurn: number;
}

// Action taken during testing
export interface ActionLog {
  turn: number;
  action: string; // Natural language action description
  reasoning: string;
}

// Final test result
export interface TestResult {
  url: string;
  success: boolean;
  totalTurns: number;
  findings: Finding[]; // All bugs found during testing
  actionLog: ActionLog[]; // All actions taken
  completionReason: 'ai_complete' | 'max_turns' | 'error';
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

// Zod Schemas for AI structured outputs

// Bug Detection Schema
export const BugCheckSchema = z.object({
  hasBugs: z.boolean(),
  bugs: z.array(z.object({
    description: z.string().max(500), // Clear description of the bug/issue
    category: z.enum([
      'error',
      'layout_broken',
      'image_broken',
      'form_validation',
      'accessibility',
      'visual_overflow',
      'responsive_break',
      'typography',
      'interactive_fail',
      'contrast'
    ]),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    location: z.string().max(200) // Where the bug appears (e.g., "navbar", "hero section")
  }))
});

export type BugCheck = z.infer<typeof BugCheckSchema>;

// Next Action Schema
export const NextActionSchema = z.object({
  complete: z.boolean(),
  reasoning: z.string().max(500),
  action: z.string().max(500).nullable().optional() // Natural language action description for Stagehand
});

export type NextAction = z.infer<typeof NextActionSchema>;

// QA Event Types for streaming

export type QAEventType =
  | 'test_started'
  | 'turn_started'
  | 'screenshot_taken'
  | 'bugs_detected'
  | 'action_planned'
  | 'action_executed'
  | 'turn_completed'
  | 'test_completed'
  | 'test_error';

export interface BaseQAEvent {
  type: QAEventType;
  timestamp: Date;
  turn: number;
}

export interface TestStartedEvent extends BaseQAEvent {
  type: 'test_started';
  url: string;
  maxTurns: number;
}

export interface TurnStartedEvent extends BaseQAEvent {
  type: 'turn_started';
}

export interface ScreenshotTakenEvent extends BaseQAEvent {
  type: 'screenshot_taken';
  format: 'png';
  metadata: {
    size: number;
  };
  screenshot: Buffer; // Include full buffer
}

export interface BugsDetectedEvent extends BaseQAEvent {
  type: 'bugs_detected';
  findings: Finding[]; // New findings this turn
  totalFindings: number; // Cumulative count
}

export interface ActionPlannedEvent extends BaseQAEvent {
  type: 'action_planned';
  action: string;
  reasoning: string;
  complete: boolean; // If true, testing is complete
}

export interface ActionExecutedEvent extends BaseQAEvent {
  type: 'action_executed';
  action: string;
  success: boolean;
  error?: string;
}

export interface TurnCompletedEvent extends BaseQAEvent {
  type: 'turn_completed';
}

export interface TestCompletedEvent extends BaseQAEvent {
  type: 'test_completed';
  result: TestResult;
}

export interface TestErrorEvent extends BaseQAEvent {
  type: 'test_error';
  error: string;
  partialResult?: Partial<TestResult>;
}

export type QAEvent =
  | TestStartedEvent
  | TurnStartedEvent
  | ScreenshotTakenEvent
  | BugsDetectedEvent
  | ActionPlannedEvent
  | ActionExecutedEvent
  | TurnCompletedEvent
  | TestCompletedEvent
  | TestErrorEvent;
