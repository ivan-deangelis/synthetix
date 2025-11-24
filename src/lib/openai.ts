import 'server-only';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('Missing OpenAI API Key');
}

export const openai = new OpenAI({
  apiKey: apiKey,
});
