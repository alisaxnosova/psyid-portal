import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from './section-prompts';

const client = new Anthropic();

export async function generateSection(userPrompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: getSystemPrompt(),
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  return text.trim();
}
