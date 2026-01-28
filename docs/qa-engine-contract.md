# QA Engine Contract

## Interface

```typescript
import { Stagehand } from '@browserbasehq/stagehand';

export async function* run(url: string, stagehand: Stagehand): AsyncGenerator<QAEvent>
```

Worker passes in initialized Stagehand. QA engine uses it, doesn't close it.

---

## Event Types

```typescript
type QAEvent =
  | { type: 'turn'; data: Turn }
  | { type: 'finding'; data: Finding }
  | { type: 'progress'; data: { progress: number; step: string } }
  | { type: 'complete'; data: { reason: 'done' | 'max_turns' | 'error'; error?: string; totalTurns: number } }
```

---

## Turn Schema

```typescript
interface Turn {
  number: number;           // 1, 2, 3...
  action?: string;          // What action was taken (null for turn 1)
  reasoning: string;        // AI's reasoning for this turn
  screenshot: Buffer;       // Screenshot at this turn (worker uploads)
}
```

---

## Finding Schema

```typescript
interface Finding {
  turnNumber: number;       // Link to turn where detected
  title: string;            // Short title for the issue
  description: string;      // Detailed description
  category: 'error' | 'layout_broken' | 'image_broken' | 'form_validation' |
            'accessibility' | 'visual_overflow' | 'responsive_break' |
            'typography' | 'interactive_fail' | 'contrast';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;         // Human-readable: "Hero section CTA"
}
```

---

## Example

```typescript
export async function* run(url: string, stagehand: Stagehand): AsyncGenerator<QAEvent> {
  yield { type: 'progress', data: { progress: 5, step: 'Starting' } };

  // Turn 1: Navigate and observe
  await stagehand.page.goto(url);
  const screenshot1 = await stagehand.page.screenshot();

  yield { type: 'turn', data: {
    number: 1,
    reasoning: 'Loaded homepage, observing initial state',
    screenshot: screenshot1
  }};

  yield { type: 'progress', data: { progress: 20, step: 'Analyzing homepage' } };

  // Finding detected on turn 1
  yield { type: 'finding', data: {
    turnNumber: 1,
    title: 'CTA button unclickable',
    description: 'The main call-to-action button in the hero section does not respond to clicks',
    category: 'interactive_fail',
    severity: 'high',
    location: 'Hero section CTA'
  }};

  // Turn 2: Scroll and observe
  await stagehand.page.evaluate(() => window.scrollBy(0, 500));
  const screenshot2 = await stagehand.page.screenshot();

  yield { type: 'turn', data: {
    number: 2,
    action: 'scroll_down',
    reasoning: 'Scrolling to check below-the-fold content',
    screenshot: screenshot2
  }};

  yield { type: 'progress', data: { progress: 50, step: 'Testing interactions' } };

  // ... more turns ...

  yield { type: 'complete', data: { reason: 'done', totalTurns: 2 } };
}
```

---

## Rules

1. **Don't init/close Stagehand** — worker handles lifecycle
2. **Yield events as they happen** — enables real-time streaming
3. **Always yield `complete`** — signals end of run
4. **Screenshots are Buffers** — worker handles upload to storage
5. **Turn 1 has no action** — it's the initial observation
6. **Findings link to turns** — via `turnNumber`
