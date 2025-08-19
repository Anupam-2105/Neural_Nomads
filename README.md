# Neural Nomads Frontend

React + Vite frontend for AWS Amplify Hosting.

## Local Development
```bash
npm install
npm run dev
```
Set API URL in `.env.local`:
```bash
VITE_API_URL=https://ooji2zx09b.execute-api.us-east-1.amazonaws.com/prod/analyze
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to Amplify
- Connect this repo to AWS Amplify
- Use `amplify.yml` for build config
- Add environment variable in Amplify Console:
  - `VITE_API_URL=https://ooji2zx09b.execute-api.us-east-1.amazonaws.com/prod/analyze`
