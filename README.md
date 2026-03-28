# Ecomath

AI study assistant for **University of Ghana - Elements of Mathematics in Economics**.

## What this app does

- teaches core topics like functions, differentiation, optimization, and elasticity
- gives step-by-step AI explanations
- includes quick revision content and short quizzes
- runs as a Node/Express app with a simple frontend

## Project structure

- `server.js` - backend server and AI endpoint
- `public/index.html` - frontend app
- `.env.example` - environment variable template
- `package.json` - scripts and dependencies

## Local setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create an env file
   ```bash
   cp .env.example .env
   ```

3. Add your Anthropic API key to `.env`
   ```env
   ANTHROPIC_API_KEY=your_real_key_here
   ```

4. Start the app
   ```bash
   npm start
   ```

5. Open the app in your browser at `http://localhost:3000`

## Development

```bash
npm run dev
```

## Health check

Open:

- `/api/health`

It should return JSON showing the server is running and whether the AI key is configured.

## Important fix made

The original setup had a broken SDK dependency/import combination. This repo now uses the correct Anthropic SDK package and a safer import pattern.

## Next sensible improvements

- add more ECON question banks
- save chat history
- add past-question mode
- add topic-by-topic practice sets
