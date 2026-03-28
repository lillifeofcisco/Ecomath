const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Ecomath',
    provider: 'OpenAI',
    aiConfigured: Boolean(OPENAI_API_KEY),
    model: OPENAI_MODEL
  });
});

app.post('/api/ask', async (req, res) => {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

    if (!question) {
      return res.status(400).json({ error: 'Please enter a question.' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY is not set on the server.'
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: TUTOR_SYSTEM_PROMPT },
          { role: 'user', content: question }
        ],
        temperature: 0.4,
        max_tokens: 1200
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Failed to get a response from OpenAI.'
      });
    }

    const answer = data?.choices?.[0]?.message?.content?.trim() || 'No answer was generated.';

    return res.json({
      success: true,
      answer
    });
  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({
      error: error?.message || 'Something went wrong while contacting OpenAI.'
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
