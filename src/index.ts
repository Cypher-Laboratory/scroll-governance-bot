import { Telegraf } from 'telegraf';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import "dotenv/config";

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN!;
const SCROLL_RPC_URL = process.env.SCROLL_RPC_URL || 'https://rpc.scroll.io';
const PROPOSAL_INTERVAL_CHECK_MINUTES =  parseInt(process.env.PROPOSAL_INTERVAL_CHECK_MINUTES || '5'); // Check for new proposals every x minutes, default is 5 minutes

// Contract details
const GOVERNANCE_CONTRACT = process.env.GOVERNANCE_CONTRACT;
const PROPOSAL_CREATED_TOPIC = '0xc8df7ff219f3c0358e14500814d8b62b443a4bebf3a596baa60b9295b1cf1bde';

if (!BOT_TOKEN || !GOVERNANCE_CONTRACT) {
  console.error('Please set BOT_TOKEN and GOVERNANCE_CONTRACT in your environment variables.');
  process.exit(1);
}

// Storage files
const LAST_BLOCK_FILE = path.join(__dirname, 'last_block.txt');
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');

interface ProposalData {
  proposalId: string;
  proposer: string;
  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];
  startBlock: string;
  endBlock: string;
  description: string;
  proposalType: number;
  txHash: string; // Add txHash to track the transaction
}

interface Subscriber {
  chatId: number;
  username?: string;
  firstName?: string;
  subscribedAt: string;
}

class ScrollGovernanceBot {
  private bot: Telegraf;
  private provider: ethers.JsonRpcProvider;
  private lastProcessedBlock: number;
  private subscribers: Map<number, Subscriber>;

  constructor() {
    this.bot = new Telegraf(BOT_TOKEN);
    this.provider = new ethers.JsonRpcProvider(SCROLL_RPC_URL);
    this.lastProcessedBlock = this.loadLastProcessedBlock();
    this.subscribers = this.loadSubscribers();
    
    this.setupBot();
  }

  private setupBot() {
    this.bot.start((ctx) => {
      const welcomeMessage = `🏛️ **Welcome to Scroll Governance Bot!**

I monitor Scroll governance for new proposals and send you notifications.

**Available Commands:**
• \`/subscribe\` - Subscribe to proposal notifications
• \`/unsubscribe\` - Unsubscribe from notifications  
• \`/status\` - Check bot and subscription status
• \`/help\` - Show this help message

Use \`/subscribe\` to start receiving notifications about new Scroll governance proposals!`;
      
      ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
    });

    this.bot.command('subscribe', (ctx) => {
      const chatId = ctx.chat.id;
      const username = ctx.from?.username;
      const firstName = ctx.from?.first_name;

      if (this.subscribers.has(chatId)) {
        ctx.reply('✅ You are already subscribed to Scroll governance notifications!');
        return;
      }

      const subscriber: Subscriber = {
        chatId,
        username,
        firstName,
        subscribedAt: new Date().toISOString()
      };

      this.subscribers.set(chatId, subscriber);
      this.saveSubscribers();

      ctx.reply(`🎉 **Successfully subscribed!**

You will now receive notifications when new Scroll governance proposals are created.

• Subscriber ID: ${chatId}
• Monitoring: ${GOVERNANCE_CONTRACT}

Use \`/unsubscribe\` anytime to stop receiving notifications.`, 
        { parse_mode: 'Markdown' });

      console.log(`📥 New subscriber: ${chatId} (${username || firstName || 'Unknown'})`);
    });

    this.bot.command('unsubscribe', (ctx) => {
      const chatId = ctx.chat.id;

      if (!this.subscribers.has(chatId)) {
        ctx.reply('❌ You are not currently subscribed to notifications.');
        return;
      }

      this.subscribers.delete(chatId);
      this.saveSubscribers();

      ctx.reply(`👋 **Successfully unsubscribed!**

You will no longer receive Scroll governance proposal notifications.

Use \`/subscribe\` anytime to start receiving notifications again.`, 
        { parse_mode: 'Markdown' });

      console.log(`📤 Unsubscribed: ${chatId}`);
    });

    this.bot.command('status', (ctx) => {
      const chatId = ctx.chat.id;
      const isSubscribed = this.subscribers.has(chatId);
      const totalSubscribers = this.subscribers.size;

      let statusMessage = `📊 **Bot Status:**

• Last processed block: ${this.lastProcessedBlock}
• Total subscribers: ${totalSubscribers}
• Monitoring contract: \`${GOVERNANCE_CONTRACT}\`
• Check interval: ${PROPOSAL_INTERVAL_CHECK_MINUTES} minutes
• Your subscription: ${isSubscribed ? '✅ Active' : '❌ Not subscribed'}`;

      if (isSubscribed) {
        const subscriber = this.subscribers.get(chatId)!;
        statusMessage += `\n• Subscribed since: ${new Date(subscriber.subscribedAt).toLocaleDateString()}`;
      }

      ctx.reply(statusMessage, { parse_mode: 'Markdown' });
    });

    this.bot.command('help', (ctx) => {
      const helpMessage = `🤖 **Scroll Governance Bot Help**

**Available Commands:**
• \`/start\` - Welcome message and introduction
• \`/subscribe\` - Subscribe to proposal notifications
• \`/unsubscribe\` - Unsubscribe from notifications
• \`/status\` - Check bot and subscription status
• \`/help\` - Show this help message

**About:**
This bot monitors the Scroll governance contract for new proposals and sends real-time notifications to subscribers.

**Contract Details:**
• Address: \`${GOVERNANCE_CONTRACT}\`
• Network: Scroll Mainnet
• Event: ProposalCreated

**Need help?** Just use the commands above to manage your subscription!`;

      ctx.reply(helpMessage, { parse_mode: 'Markdown' });
    });

    // Handle unknown commands
    this.bot.on('text', (ctx) => {
      const text = ctx.message.text.toLowerCase();
      if (text.startsWith('/')) {
        ctx.reply(`❓ Unknown command. Use /help to see available commands.`);
      }
    });

    this.bot.launch();
    console.log('🤖 Telegram bot started');
  }

  private loadSubscribers(): Map<number, Subscriber> {
    try {
      if (fs.existsSync(SUBSCRIBERS_FILE)) {
        const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
        const subscribersArray = JSON.parse(data);
        const subscribersMap = new Map<number, Subscriber>();
        
        subscribersArray.forEach((subscriber: Subscriber) => {
          subscribersMap.set(subscriber.chatId, subscriber);
        });
        
        console.log(`📋 Loaded ${subscribersMap.size} subscribers`);
        return subscribersMap;
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
    }
    return new Map();
  }

  private loadLastProcessedBlock(): number {
    try {
      if (fs.existsSync(LAST_BLOCK_FILE)) {
        const blockNumber = parseInt(fs.readFileSync(LAST_BLOCK_FILE, 'utf8').trim());
        return isNaN(blockNumber) ? 0 : blockNumber;
      }
    } catch (error) {
      console.error('Error loading last processed block:', error);
    }
    return 0;
  }

  private saveLastProcessedBlock(blockNumber: number) {
    try {
      fs.writeFileSync(LAST_BLOCK_FILE, blockNumber.toString());
      this.lastProcessedBlock = blockNumber;
    } catch (error) {
      console.error('Error saving last processed block:', error);
    }
  }

  private async getCurrentBlock(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Error getting current block:', error);
      throw error;
    }
  }

  private decodeProposalData(log: ethers.Log): ProposalData | null {
    try {
      // ABI for ProposalCreated event
      const abi = [
        "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description, uint8 proposalType)"
      ];
      
      const iface = new ethers.Interface(abi);
      const decodedLog = iface.parseLog({
        topics: log.topics,
        data: log.data
      });

      if (!decodedLog) return null;

      return {
        proposalId: decodedLog.args.proposalId.toString(),
        proposer: decodedLog.args.proposer,
        targets: decodedLog.args.targets,
        values: Array.from(decodedLog.args.values()).map((v: any) => v.toString()),
        signatures: decodedLog.args.signatures,
        calldatas: decodedLog.args.calldatas,
        startBlock: decodedLog.args.startBlock.toString(),
        endBlock: decodedLog.args.endBlock.toString(),
        description: decodedLog.args.description,
        proposalType: decodedLog.args.proposalType,
        txHash: log.transactionHash
      };
    } catch (error) {
      console.error('Error decoding proposal data:', error);
      return null;
    }
  }

  private formatProposalMessage(proposal: ProposalData, blockNumber: number): string {
    const shortDescription = proposal.description.length > 500 
      ? proposal.description.substring(0, 500) + '...' 
      : proposal.description;

    return `🏛️ **NEW SCROLL GOVERNANCE PROPOSAL**

📋 **Proposal ID:** ${proposal.proposalId}
👤 **Proposer:** \`${proposal.proposer}\`
📦 **Block:** ${blockNumber}

🗳️ **Voting Period:**
- Start Block: ${proposal.startBlock} (~${blockNumberToDate(proposal.startBlock)})
- End Block: ${proposal.endBlock} (~${blockNumberToDate(proposal.endBlock)})

📝 **Description:**
\`\`\`Markdown
${shortDescription}
\`\`\`
**[full proposal](https://gov.scroll.io/proposals/${proposal.proposalId})

🔗 **Contract:** \`${GOVERNANCE_CONTRACT}\`
📊 **Proposal Type:** ${proposal.proposalType}

[View on Scroll Explorer](https://scrollscan.com/tx/${proposal.txHash})`;
  }

  private async sendNotification(message: string) {
    if (this.subscribers.size === 0) {
      console.log('📭 No subscribers to notify');
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    const failedChatIds: number[] = [];

    for (const [chatId, subscriber] of this.subscribers) {
      try {
        await this.bot.telegram.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
        });
        successCount++;
      } catch (error: any) {
        failureCount++;
        failedChatIds.push(chatId);
        
        // If user blocked the bot or chat not found, remove them from subscribers
        if (error.code === 403 || error.code === 400) {
          console.log(`🚫 Removing inactive subscriber: ${chatId} (${subscriber.username || subscriber.firstName || 'Unknown'})`);
          this.subscribers.delete(chatId);
        } else {
          console.error(`❌ Failed to send message to ${chatId}:`, error.message);
        }
      }
    }

    // Save updated subscribers list if any were removed
    if (failedChatIds.length > 0) {
      this.saveSubscribers();
    }

    console.log(`📤 Notification sent: ${successCount} successful, ${failureCount} failed`);
  }

  private async checkForNewProposals() {
    try {
      const currentBlock = await this.getCurrentBlock();

      const fromBlock = this.lastProcessedBlock === 0 ? currentBlock - 499 : this.lastProcessedBlock + 1;
      
      if (fromBlock > currentBlock) {
        return; // No new blocks to check
      }

      console.log(`🔍 Checking blocks ${fromBlock} to ${currentBlock} for new proposals...`);

      // todo: if fromBlock is too far back, provider will throw an error. Then we should truncate fromBlock to a reasonable value and do multiple queries
      const logs = await this.provider.getLogs({
        address: GOVERNANCE_CONTRACT,
        topics: [PROPOSAL_CREATED_TOPIC],
        fromBlock: fromBlock,
        toBlock: currentBlock
      });

      console.log(`📊 Found ${logs.length} proposal events`);

      for (const log of logs) {
        const proposalData = this.decodeProposalData(log);
        if (proposalData) {
          const message = this.formatProposalMessage(proposalData, log.blockNumber);
          await this.sendNotification(message);
          console.log(`✅ Processed proposal ${proposalData.proposalId}`);
        }
      }

      this.saveLastProcessedBlock(currentBlock);
    } catch (error) {
      console.error('Error checking for new proposals:', error);
    }
  }

  public async start() {
    console.log('🚀 Starting Scroll Governance Bot...');
    
    // Initial check
    await this.checkForNewProposals();
    
    // Set up interval to check for new proposals
    setInterval(async () => {
      await this.checkForNewProposals();
    }, PROPOSAL_INTERVAL_CHECK_MINUTES * 60 * 1000); // minutes to milliseconds

    console.log(`⏰ Bot is now checking for new proposals every ${PROPOSAL_INTERVAL_CHECK_MINUTES} minutes`);
  }

  public stop() {
    this.bot.stop();
    console.log('🛑 Bot stopped');
  }

  private saveSubscribers() {
    try {
      const subscribersArray = Array.from(this.subscribers.values());
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribersArray, null, 2));
      console.log(`📋 Saved ${subscribersArray.length} subscribers`);
    } catch (error) {
      console.error('Error saving subscribers:', error);
    }
  }
}

// Start the bot
const bot = new ScrollGovernanceBot();

// Handle graceful shutdown
process.once('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  bot.stop();
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  bot.stop();
  process.exit(0);
});

// Start monitoring
bot.start().catch(console.error);


function blockNumberToDate(blockNumber: string): string {
  const blockTime = 3; // Average block time in seconds on Scroll
  const genesisBlockTimestamp = 1696917600; // Timestamp of the Scroll mainnet genesis block
  const timestamp = genesisBlockTimestamp + (parseInt(blockNumber) * blockTime);

  return new Date(timestamp * 1000).toUTCString();
}