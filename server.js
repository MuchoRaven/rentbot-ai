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
      model: 'gpt-4o',  // or 'gpt-3.5-turbo' for faster/cheaper responses
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

// Simple payment intent detection
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

// Mock payment endpoint (we'll integrate Circle later)
app.post('/api/payment', async (req, res) => {
  try {
    const { amount, tenantName } = req.body;
    
    console.log(`Processing payment: $${amount} from ${tenantName}`);
    
    // TODO: Integrate Circle API here for real USDC payment
    // For now, simulate a successful payment
    
    setTimeout(() => {
      res.json({
        success: true,
        message: `Payment of $${amount} USDC processed successfully!`,
        transactionId: 'MOCK_TX_' + Date.now(),
        timestamp: new Date().toISOString()
      });
    }, 1500); // Simulate processing delay
    
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'RentBot AI is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 RentBot AI server running on http://localhost:${PORT}`);
  console.log(`📊 Open your browser and go to: http://localhost:${PORT}`);
});