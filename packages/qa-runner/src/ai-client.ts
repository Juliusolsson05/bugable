import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { BugCheckSchema, NextActionSchema, type BugCheck, type NextAction, type Finding } from './types';
import { SYSTEM_PROMPT } from './prompts';

type Message = OpenAI.Chat.ChatCompletionMessageParam;

export class AIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async detectBugs(screenshot: Buffer, url: string, existingFindings: Finding[], turn: number): Promise<BugCheck> {
    // Build summary of already-reported bugs
    const bugSummary = existingFindings.length > 0
      ? `\n\nBUGS ALREADY REPORTED (do not report these again):\n${existingFindings.map((f, i) =>
          `${i + 1}. [${f.category}] ${f.location}: ${f.description}`
        ).join('\n')}`
      : '';

    // Build fresh messages for this request (don't accumulate old screenshots)
    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `ANALYZE FOR BUGS:\nCurrent URL: ${url}\nTurn: ${turn}${bugSummary}\n\nAnalyze this screenshot for NEW bugs only.`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${screenshot.toString('base64')}`
            }
          }
        ]
      }
    ];

    // Get AI response (stateless per-request, context via bugSummary)
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      response_format: zodResponseFormat(BugCheckSchema, 'bug_check')
    });

    const content = response.choices[0].message.content!;
    const bugCheck = BugCheckSchema.parse(JSON.parse(content));

    return bugCheck;
  }

  async planNextAction(screenshot: Buffer, url: string, actionHistory: string[] = [], originalUrl?: string): Promise<NextAction> {
    // Build action history summary to avoid repeating actions
    const historySummary = actionHistory.length > 0
      ? `\n\nACTIONS ALREADY TAKEN:\n${actionHistory.slice(-10).map((a, i) => `${i + 1}. ${a}`).join('\n')}`
      : '';

    // Add warning if URL has changed
    const urlWarning = originalUrl && url !== originalUrl
      ? `\n\n⚠️ WARNING: You have navigated away from the original test page!\nOriginal URL: ${originalUrl}\nCurrent URL: ${url}\nYour NEXT action MUST be to navigate back to: ${originalUrl}`
      : (originalUrl ? `\n\nORIGINAL TEST PAGE: ${originalUrl}\nYou must stay on this page. Do not navigate elsewhere.` : '');

    // Build fresh messages for this request (don't accumulate old screenshots)
    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `PLAN NEXT ACTION:\nCurrent URL: ${url}${urlWarning}${historySummary}\n\nWhat should I do next?`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${screenshot.toString('base64')}`
            }
          }
        ]
      }
    ];

    // Get AI response (stateless per-request, context via historySummary)
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      response_format: zodResponseFormat(NextActionSchema, 'next_action')
    });

    const content = response.choices[0].message.content!;
    const nextAction = NextActionSchema.parse(JSON.parse(content));

    return nextAction;
  }

}
