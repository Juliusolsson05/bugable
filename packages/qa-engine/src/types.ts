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
