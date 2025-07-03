# 📜 Scroll Governance Telegram Bot

A TypeScript-based Telegram bot that monitors [Scroll governance proposals](https://gov.scroll.io/proposals) and sends real-time notifications.

## 📡 Live Telegram Bot

Curently you can try the bot instantly without hosting it yourself!  
[t.me/scroll_governance_bot](https://t.me/scroll_governance_bot)  

The bot will send you real-time notifications whenever a new governance proposal is published on Scroll.  

⚠️ Note: This bot is hosted by our team and for free. Access may be suspended at any time without notice. For a long-term solution, we recommend deploying your own instance by following the instructions above.

## 🐳 Docker

You can directly pull the latest Dockerized version of the bot from our official Docker Hub repository:
```
docker pull cypherlab/scroll-governance-bot:latest
```  
📦 [Docker Hub repository](https://hub.docker.com/repository/docker/cypherlab/scroll-governance-bot/general)  
This image is automatically updated with the latest stable version of the bot, based on the most recent commit to the repository. This allows you to deploy it quickly without needing to build it yourself.

## Features

- 🏛️ Monitors Scroll governance contract for new proposals
- 📱 Sends formatted notifications to Telegram
- ⏰ Checks for new proposals every 5 minutes
- 💾 Persists last processed block to avoid duplicates
- 🔄 Graceful error handling and recovery
- 📊 Bot status and health commands

## Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- Telegram Bot Token

## Start the Bot
dev:
```bash
yarn dev
```
prod: (don't forget to set the environment variables)
```bash
yarn build
yarn start
```
from docker:
```bash
docker run -d --name scroll-governance-bot \
           -e BOT_TOKEN=your_actual_token \
           -e SCROLL_RPC_URL=your_rpc_url \
           -e GOVERNANCE_CONTRACT=0x2f3f2054776bd3c2fc30d750734a8f539bb214f0 \
           -e PROPOSAL_INTERVAL_CHECK_MINUTES=5 \
           -e MAX_BLOCKS_PER_CHECK=499 \
          cypherlab/scroll-governance-bot:latest
# or:
docker run -d --env-file .env cypherlab/scroll-governance-bot:latest
```
Build the image:
```bash
docker build -t cypherlab/scroll-governance-bot .
```

publish the image:
```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t cypherlab/scroll-governance-bot:latest \
  --push .
```

> // todo: setup vote reminders to the user who need it

