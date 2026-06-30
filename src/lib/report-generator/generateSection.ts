import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from './section-prompts';

export async function generateSection(userPrompt: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: getSystemPrompt(),
    messages: [{ role: 'user', content: userPrompt }],
  });

  const block = message.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('Claude returned no text content');
  }
  return block.text.trim();
}
