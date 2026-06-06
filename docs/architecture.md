# BizPulse — Technical Architecture

## Overview

BizPulse is a single-page application with zero build steps, zero dependencies to install, and zero backend required for the demo.

## Data Flow

```
User input (textarea)
        ↓
  Input validation
        ↓
  callClaude(text)
        ↓
  POST /v1/messages
  system: structured JSON prompt
  user: business situation text
        ↓
  Parse JSON response
        ↓
  renderResults(data)
  ├── Health score ring animation
  ├── KPI grid
  ├── Risk signals
  └── 7-day expandable plan
```

## System Prompt Design

The system prompt enforces a strict output contract:

- **Schema enforcement**: Claude is told to return *only* a JSON object matching the exact schema
- **Calibration**: Health score thresholds are explicitly defined (Critical < 40, etc.)
- **Anti-generic instruction**: "Be specific and reference numbers from the situation — never give generic advice"
- **Structured output**: Each field has a defined type and purpose

## Security Notes

The current demo setup passes the API call directly from the browser. For production:

1. Create a serverless function (Vercel Edge Function, Cloudflare Worker, AWS Lambda)
2. Store `ANTHROPIC_API_KEY` as an environment variable
3. Proxy the request through your function
4. Add rate limiting and input sanitization

Example Vercel Edge Function:

```js
// api/analyze.js
export default async function handler(req) {
  const { situation } = await req.json();
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: situation }],
    }),
  });

  const data = await response.json();
  return Response.json(data);
}
```
