import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { BugCheckSchema, NextActionSchema, type BugCheck, type NextAction } from './types';
import { SYSTEM_PROMPT } from './prompts';

type Message = OpenAI.Chat.ChatCompletionMessageParam;

export class AIClient {
  private client: OpenAI;
  private conversationHistory: Message[] = [];

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Initialize with system prompt for both bug detection and action planning
    this.conversationHistory.push({
      role: 'system',
      content: SYSTEM_PROMPT
    });
  }

  async detectBugs(screenshot: Buffer, url: string): Promise<BugCheck> {
    // Add bug detection request to conversation history
    const userMessage: Message = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `ANALYZE FOR BUGS:\nCurrent URL: ${url}\n\nAnalyze this screenshot for bugs.`
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${screenshot.toString('base64')}`
          }
        }
      ]
    };

    this.conversationHistory.push(userMessage);

    // Get AI response with full conversation history
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: this.conversationHistory,
      response_format: zodResponseFormat(BugCheckSchema, 'bug_check')
    });

    const content = response.choices[0].message.content!;
    const bugCheck = BugCheckSchema.parse(JSON.parse(content));

    // Add assistant response to conversation history
    this.conversationHistory.push({
      role: 'assistant',
      content
    });

    return bugCheck;
  }

  async planNextAction(screenshot: Buffer, url: string): Promise<NextAction> {
    // Add current screenshot and URL to conversation
    const userMessage: Message = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `PLAN NEXT ACTION:\nCurrent URL: ${url}\n\nWhat should I do next?`
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${screenshot.toString('base64')}`
          }
        }
      ]
    };

    this.conversationHistory.push(userMessage);

    // Get AI response with full conversation history
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: this.conversationHistory,
      response_format: zodResponseFormat(NextActionSchema, 'next_action')
    });

    const content = response.choices[0].message.content!;
    const nextAction = NextActionSchema.parse(JSON.parse(content));

    // Add assistant response to conversation history
    this.conversationHistory.push({
      role: 'assistant',
      content
    });

    return nextAction;
  }

  // Optional: Method to clear conversation history if needed
  clearHistory() {
    this.conversationHistory = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ];
  }

  // Optional: Get conversation length for debugging
  getHistoryLength(): number {
    return this.conversationHistory.length;
  }
}
