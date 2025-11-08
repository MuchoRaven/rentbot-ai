require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve HTML file

// Initialize AI/ML API client (uses OpenAI format)
const openai = new OpenAI({
  apiKey: process.env.AIML_API_KEY,
  baseURL: 'https://api.aimlapi.com/v1'
});

// Initialize Circle client (if credentials are available)
let circleClient = null;
let landlordWallet = null;
let tenantWallet = null;

if (process.env.CIRCLE_API_KEY && process.env.CIRCLE_ENTITY_SECRET) {
  try {
    const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
    
    circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });
    
    console.log('✅ Circle client initialized');
  } catch (error) {
    console.log('⚠️ Circle SDK not available - running in demo mode');
  }
}

// Initialize Circle wallets on startup
async function initializeCircleWallets() {
  if (!circleClient) {
    console.log('📝 Running in demo mode (Circle not configured)');
    return;
  }

  try {
    console.log('🔧 Fetching Circle wallets...');
    
    const walletSets = await circleClient.listWalletSets();
    
    if (walletSets.data.walletSets && walletSets.data.walletSets.length > 0) {
      const walletSetId = walletSets.data.walletSets[0].id;
      console.log('✅ Found wallet set:', walletSetId);
      
      const wallets = await circleClient.listWallets({ walletSetId });
      
      if (wallets.data.wallets && wallets.data.wallets.length > 0) {
        landlordWallet = wallets.data.wallets[0];
        tenantWallet = wallets.data.wallets[1] || wallets.data.wallets[0];
        
        console.log('✅ Landlord wallet:', landlordWallet.id);
        console.log('✅ Tenant wallet:', tenantWallet.id);
      }
    }
  } catch (error) {
    console.error('⚠️ Could not fetch Circle wallets:', error.message);
  }
}

// Store conversation history (in a real app, use a database)
let conversationHistory = [];

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log('User message:', userMessage);

    // Add user message to history
    conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Create AI prompt with RentBot personality
    const systemPrompt = `You are RentBot AI, a helpful AI assistant for rental property management. 
You help tenants communicate with their landlord about rent payments using USDC cryptocurrency.

TENANT INFORMATION:
- Tenant Name: Demo Tenant
- Unit: 203
- Monthly Rent: $1,900 USDC
- Due Date: 1st of each month
- Landlord: Property Management LLC

Your capabilities:
- Understand payment requests and issues
- Negotiate payment plans for late rent
- Schedule recurring monthly rent payments
- Send payment reminders
- Handle tenant questions about rent

IMPORTANT: When the tenant says "I want to pay my rent" or "pay rent", they mean their monthly rent of $1,900. 
Automatically detect this and confirm the amount.

Be friendly, professional, and solution-oriented. When a tenant mentions payment difficulties, 
offer to create a payment plan. 

Examples of how to respond:
- "I want to pay my rent" → "Perfect! I can help you pay your $1,900 rent for Unit 203. Would you like to proceed with the payment now?"
- "Can I pay late?" → "I understand. Your rent of $1,900 is due on the 1st. Would you like me to set up a payment plan?"
- "I need a payment plan" → "Of course! Let me help you split your $1,900 rent into manageable payments."

Current date: ${new Date().toLocaleDateString()}`;

    // Call AI/ML API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('AI response:', aiResponse);

    // Add AI response to history
    conversationHistory.push({
      role: 'assistant',
      content: aiResponse
    });

    // Check if message contains payment intent
    const paymentIntent = detectPaymentIntent(userMessage);

    res.json({
      response: aiResponse,
      paymentIntent: paymentIntent
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to process message: ' + error.message });
  }
});

// Improved payment intent detection
function detectPaymentIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for payment keywords
  const paymentKeywords = ['pay', 'payment', 'rent', 'send', 'transfer'];
  const hasPaymentKeyword = paymentKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Extract dollar amounts from message
  const amountMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  let amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : null;
  
  // If they mention "rent" or "my rent" without amount, assume default rent of $1900
  if (hasPaymentKeyword && !amount) {
    if (lowerMessage.includes('rent') || 
        lowerMessage.includes('my rent') || 
        lowerMessage.includes('the rent')) {
      amount = 1900; // Default rent amount
    }
  }
  
  if (hasPaymentKeyword && amount) {
    return {
      detected: true,
      amount: amount,
      message: `Payment of $${amount} detected`
    };
  }
  
  return { detected: false };
}
// Payment endpoint - uses real Circle wallets if available
app.post('/api/payment', async (req, res) => {
  try {
    const { amount, tenantName } = req.body;
    
    console.log(`💰 Processing payment: $${amount} from ${tenantName}`);
    
    let fromAddress, toAddress, blockchain, walletProvider;
    
    // Use real Circle wallet addresses if available
    if (tenantWallet && landlordWallet) {
      fromAddress = tenantWallet.address;
      toAddress = landlordWallet.address || '0x9636796c5a674c8307efd7a4bada03b949c23398';
      blockchain = tenantWallet.blockchain || 'ETH-SEPOLIA';
      walletProvider = 'Circle Developer-Controlled Wallets (Architecture Implemented)';
      
      console.log(`✅ Using real Circle wallets:`);
      console.log(`   From: ${fromAddress} (Tenant Wallet: ${tenantWallet.id})`);
      console.log(`   To: ${toAddress} (Landlord Wallet: ${landlordWallet.id})`);
    } else {
      // Fallback to demo addresses
      fromAddress = '0xf651bd6d7346195c556e20c9b4e419d5ba06496d';
      toAddress = '0x9636796c5a674c8307efd7a4bada03b949c23398';
      blockchain = 'ETH-SEPOLIA';
      walletProvider = 'Demo Mode - Circle Integration Ready';
      
      console.log(`📝 Demo mode - using simulated addresses`);
    }
    
    const txHash = '0x' + Math.random().toString(16).substring(2, 66).padEnd(64, '0');
    
    console.log(`   Amount: ${amount} USDC`);
    console.log(`   TX Hash: ${txHash}`);
    
    // Simulate blockchain processing
    setTimeout(() => {
      res.json({
        success: true,
        message: `Payment of $${amount} USDC processed successfully!`,
        transactionId: 'ARC_TX_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        transactionHash: txHash,
        timestamp: new Date().toISOString(),
        blockchain: blockchain,
        network: 'testnet',
        fromAddress: fromAddress,
        toAddress: toAddress,
        fromWallet: fromAddress.substring(0, 10) + '...' + fromAddress.substring(fromAddress.length - 4),
        toWallet: toAddress.substring(0, 10) + '...' + toAddress.substring(toAddress.length - 4),
        explorerUrl: `https://sepolia.etherscan.io/address/${fromAddress}`,
        note: circleClient ? 'Circle wallets connected - Transaction simulated for demo' : 'Demo mode',
        walletProvider: walletProvider,
        circleIntegrated: !!circleClient
      });
    }, 1500);
    
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Get wallet information and balances
app.get('/api/wallet-info', async (req, res) => {
  try {
    if (!circleClient || !tenantWallet || !landlordWallet) {
      return res.json({
        success: true,
        mode: 'demo',
        message: 'Running in demo mode',
        tenant: {
          address: '0xf651bd6d7346195c556e20c9b4e419d5ba06496d',
          blockchain: 'ETH-SEPOLIA',
          usdcBalance: 'Demo Mode',
          ethBalance: 'Demo Mode'
        },
        landlord: {
          address: '0x9636796c5a674c8307efd7a4bada03b949c23398',
          blockchain: 'ETH-SEPOLIA'
        }
      });
    }

    // Get real wallet balances
    const tenantBalances = await circleClient.getWalletTokenBalance({
      id: tenantWallet.id
    });

    const landlordDetails = await circleClient.getWallet({ 
      id: landlordWallet.id 
    });

    // Find USDC balance
    let usdcBalance = '0';
    if (tenantBalances.data.tokenBalances) {
      const usdc = tenantBalances.data.tokenBalances.find(
        t => t.token.symbol === 'USDC'
      );
      if (usdc) {
        usdcBalance = usdc.amount;
      }
    }

    res.json({
      success: true,
      mode: 'live',
      message: 'Connected to Circle wallets',
      tenant: {
        id: tenantWallet.id,
        address: tenantWallet.address,
        blockchain: tenantWallet.blockchain,
        usdcBalance: usdcBalance,
        state: tenantWallet.state
      },
      landlord: {
        id: landlordWallet.id,
        address: landlordDetails.data.wallet.address || landlordWallet.address,
        blockchain: landlordWallet.blockchain,
        state: landlordWallet.state
      }
    });

  } catch (error) {
    console.error('Error fetching wallet info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet info',
      details: error.message 
    });
  }
});
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'RentBot AI is running!' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🤖 RentBot AI server running on http://localhost:${PORT}`);
  console.log(`📊 Open your browser and go to: http://localhost:${PORT}`);
  
  // Initialize Circle wallets if available
  await initializeCircleWallets();
});