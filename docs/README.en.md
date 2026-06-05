# 紫薇Claw

<p align="center">
  <img width="820" alt="紫薇Claw" src="./assets/logo.en.svg" />
</p>

<p align="center">
  <strong>A modern Zi Wei Dou Shu chart analysis tool</strong>
</p>

<p align="center">
  Precise charting · AI interpretation · yearly trends · compatibility reading · life timeline
</p>

## Overview

紫薇Claw combines traditional Zi Wei Dou Shu knowledge, modern web interaction, and multi-model AI into a self-hostable application.

It is designed to be readable, useful, and easy to share, not just a chart viewer.

## Features

- **Precise charting** - Built on `iztro` with full 12-palace configuration
- **AI interpretation** - Structured chart analysis with multi-model support
- **Yearly trends** - Monthly and annual fortune analysis
- **Compatibility reading** - Dual-chart relationship analysis
- **Life timeline** - Long-term fortune visualization
- **Share cards** - Generate shareable destiny quote cards

## Getting Started

```bash
git clone https://github.com/zreohup/ZWStarclaw.git
cd ZWStarclaw
bash scripts/setup-env.sh
cd app
npm run dev
```

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zreohup/ZWStarclaw&project-name=zwstarclaw&root-directory=app)

### Cloudflare Pages

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zreohup/ZWStarclaw)

### Docker

```bash
docker compose up --build -d
# or: docker-compose up --build -d
```

## Configuration

Open the in-app settings to configure AI access. The AI provider selector only exposes Custom (OpenAI compatible). Keep the default BaseURL `https://nodekey.xinghanyun.cn/v1`, then enter the NodeKey API key plus an available model name.
