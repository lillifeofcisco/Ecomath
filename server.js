const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const AnthropicModule = require('@anthropic-ai/sdk');
const Anthropic = AnthropicModule.default || AnthropicModule.Anthropic || AnthropicModule;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const TUTOR_SYSTEM_PROMPT = `You are a patient tutor for University of Ghana students studying Elements of Mathematics in Economics.

Rules:
- Explain things simply.
- Show steps clearly.
- For economics questions, connect the math to economics meaning.
- Keep notation clean.
- Do not be condescending.
- When a student is wrong, correct them directly but briefly.
- End with one short checkpoint question when useful.`;

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Ecomath',
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY)
  });
});

app.post('/api/ask', async (req, res) => {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

    if (!question) {
      return res.status(400).json({ error: 'Please enter a question.' });
    }

    if (!client) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY is not set on the server.'
      });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: TUTOR_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: question
        }
      ]
    });

    const answer = Array.isArray(response.content)
      ? response.content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join('\n\n')
          .trim()
      : '';

    return res.json({
      success: true,
      answer: answer || 'No answer was generated.'
    });
  } catch (error) {
    console.error('API error:', error);

    if (error?.status === 401) {
      return res.status(401).json({ error: 'Authentication failed. Check your API key.' });
    }

    if (error?.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Try again in a moment.' });
    }

    return res.status(500).json({
      error: error?.message || 'Something went wrong while contacting the AI service.'
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`Ecomath running on http://localhost:${PORT}`);
});