# Scroll Governance Telegram Bot

A TypeScript-based Telegram bot that monitors Scroll governance for new proposals and sends real-time notifications.

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
- Telegram Chat ID

## Setup

### 1. Clone and Install Dependencies

```bash
# Install dependencies
yarn install
```

### 2. Create Telegram Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Save the bot token

### 3. Get Your Chat ID

**Method 1: Using userinfobot**
1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. It will reply with your user information including your Chat ID

**Method 2: Using your bot**
1. Start your bot (temporary setup)
2. Send any message to your bot
3. Visit: `https://api.telegram.org/bot<YourBOTToken>/getUpdates`
4. Look for `"chat":{"id":` in the response

### 4. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your credentials
# BOT_TOKEN=your_telegram_bot_token_here
# CHAT_ID=your_telegram_chat_id_here
```

### 5. Build and Run

```bash
# Development mode with hot reload
yarn dev

# Build for production
yarn build

# Run production build
yarn start
```

## Project Structure

```
scroll-governance-bot/
├── src/
│   └── index.ts          # Main bot implementation
├── dist/                 # Compiled JavaScript output
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
├── .env                  # Your actual environment variables (not committed)
├── last_block.txt        # Stores last processed block number
└── README.md             # This file
```

## Bot Commands

- `/start` - Initialize the bot and confirm it's working
- `/status` - Check bot status and last processed block

## How It Works

1. **Event Monitoring**: The bot uses `ethers.js` to call `getLogs` on the Scroll network every 5 minutes
2. **Event Filtering**: It specifically looks for the `ProposalCreated` event with topic `0xc8df7ff219f3c0358e14500814d8b62b443a4bebf3a596baa60b9295b1cf1bde`
3. **Data Decoding**: Events are decoded using the ABI to extract proposal details
4. **Notification**: Formatted messages are sent to your Telegram chat
5. **State Persistence**: The last processed block is saved to avoid duplicate notifications

## Monitored Contract

- **Address**: ``
- **Network**: Scroll Mainnet
- **Event**: `ProposalCreated`
