import OpenAI from 'openai';

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'codex-5.3';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
