import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { BugCheckSchema, NextActionSchema, type BugCheck, type NextAction } from './types';
import { BUG_DETECTION_PROMPT, NEXT_ACTION_PROMPT } from './prompts';

type Message = OpenAI.Chat.ChatCompletionMessageParam;

export class AIClient {
  private client: OpenAI;
  private conversationHistory: Message[] = [];

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Initialize with system prompt for action planning
    this.conversationHistory.push({
      role: 'system',
      content: NEXT_ACTION_PROMPT
    });
  }

  async detectBugs(screenshot: Buffer, url: string): Promise<BugCheck> {
    // Bug detection uses separate conversation (stateless)
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: BUG_DETECTION_PROMPT
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyzing page: ${url}`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshot.toString('base64')}`
              }
            }
          ]
        }
      ],
      response_format: zodResponseFormat(BugCheckSchema, 'bug_check')
    });

    const content = response.choices[0].message.content!;
    return BugCheckSchema.parse(JSON.parse(content));
  }

  async planNextAction(screenshot: Buffer, url: string): Promise<NextAction> {
    // Add current screenshot and URL to conversation
    const userMessage: Message = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Current URL: ${url}\n\nWhat should I do next?`
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
        content: NEXT_ACTION_PROMPT
      }
    ];
  }

  // Optional: Get conversation length for debugging
  getHistoryLength(): number {
    return this.conversationHistory.length;
  }
}
