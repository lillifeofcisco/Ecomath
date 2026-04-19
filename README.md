# Ecomath

AI study assistant for University of Ghana Elements of Mathematics in Economics.

This version uses OpenAI.

## Setup

1. `npm install`
2. copy `.env.example` to `.env`
3. add your `OPENAI_API_KEY` to `.env`
4. run `npm start`
5. open `http://localhost:3000`

Do not commit your `.env` file.

## Included tools

### 1. AI tutor
The main app runs at:

- `http://localhost:3000`

### 2. Economics Visual Lab
The interactive demand-supply-tax simulator runs at:

- `http://localhost:3000/econ-visual-lab/`

It includes:
- live demand and supply graph
- per-unit tax wedge visualization
- before-tax and after-tax equilibrium values
- consumer and producer tax burden display
