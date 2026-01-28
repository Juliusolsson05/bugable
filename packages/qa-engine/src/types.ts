import { z } from 'zod';

// Input configuration
export interface TestConfig {
  url: string;
  maxTurns?: number; // default: 50
}

// Bug/Finding discovered during testing
export interface Finding {
  description: string;
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
    description: z.string().max(500) // Clear description of the bug/issue
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
