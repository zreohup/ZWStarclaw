# Deployment

## Code Location

The application source lives in `app/`.

- `app/src/` - React and TypeScript application code.
- `app/src/lib/llm.ts` - multi-provider LLM adapter with NodeKey as the default custom BaseURL.
- `app/src/components/SettingsPanel.tsx` - provider settings UI.
- `Dockerfile`, `docker-compose.yml`, `nginx.conf` - Docker production runtime.
- `scripts/setup-env.sh` - system environment detection and dependency setup.

## Local Development

```bash
bash scripts/setup-env.sh
cd app
npm run dev
```

Open the Vite URL printed by the terminal. The default is
`http://127.0.0.1:5173/`.

## Docker

```bash
docker compose up --build -d
```

If the machine only has the standalone Compose command:

```bash
docker-compose up --build -d
```

Open `http://127.0.0.1:8080/`.

To use a different port:

```bash
ZWSTARCLAW_PORT=3000 docker compose up --build -d
```

## Static Hosting

For Vercel or Cloudflare Pages:

- Root directory: `app`
- Build command: `npm run build`
- Output directory: `dist`

The app is a static frontend. NodeKey can be used through the Custom
OpenAI-compatible provider. API keys are configured in the browser settings panel
and stored locally in the browser.
