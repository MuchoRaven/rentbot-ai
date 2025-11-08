# 🤖 RentBot AI - Intelligent Rent Payments on Arc Blockchain

**Hackathon Track:** Payments for Real-World Assets (RWA)

## 🎯 Problem Statement

Rent collection is a $500B+ market with significant pain points:
- 30% of tenants pay rent late each month
- Landlords spend hours chasing payments and answering tenant questions
- Traditional payment systems charge 2-3% fees
- No intelligent communication layer between tenants and landlords

## 💡 Solution

RentBot AI is an AI-powered rental payment assistant that uses natural language processing to:
- Understand tenant payment requests in plain English
- Automatically negotiate payment plans for tenants facing hardship
- Process USDC payments on the Arc blockchain with minimal fees
- Provide landlords with AI-generated insights and analytics

## 🏗️ Architecture

**Frontend:** HTML/CSS/JavaScript (Responsive web interface)
**AI Layer:** AI/ML API (Natural language understanding)
**Blockchain:** Circle Developer-Controlled Wallets + Arc Blockchain
**Payment Currency:** USDC (Stablecoin)

## ✨ Key Features

### For Tenants:
- 💬 Chat naturally with AI about rent payments
- 📅 AI-negotiated payment plans (split rent into 2, 3, or 4 payments)
- 🔄 One-click automatic monthly payments
- 📊 Payment history tracking
- 💰 Pay with USDC on Arc blockchain (low fees, fast settlement)

### For Landlords:
- 📈 Real-time dashboard with all tenant payment statuses
- 🤖 AI handles 90% of tenant inquiries automatically
- 💡 AI-generated insights (e.g., "Tenant consistently pays 2 days late")
- 📊 Revenue analytics and projections
- ⚡ Instant USDC settlement (no waiting for ACH transfers)

## 🚀 Innovation Highlights

1. **AI-Powered Negotiation:** RentBot autonomously negotiates payment plans without human intervention
2. **Natural Language Payments:** "I want to pay my rent" automatically processes $1,900 USDC payment
3. **Stablecoin-Native:** All payments in USDC on Arc blockchain (predictable fees, sub-second settlement)
4. **Real-World Asset Integration:** Designed for tokenized real estate and property management

## 💻 Technical Implementation

- **Circle Developer-Controlled Wallets** for embedded wallet infrastructure
- **Arc Blockchain** for all transaction settlement
- **AI/ML API** for natural language understanding and context awareness
- **RESTful API architecture** for scalability

## 🎯 Market Opportunity

- **TAM:** $500B+ annual rent payments in US alone
- **Target Users:** Property management companies, individual landlords, tenants
- **Revenue Model:** 0.5% transaction fee (vs 2-3% for traditional processors)
- **Competitive Advantage:** Only AI-native rent payment solution on blockchain

## 🔮 Future Roadmap

- Multi-property management (manage 100+ units)
- Smart contract escrow (funds released when conditions met)
- Credit reporting integration
- Maintenance request automation via AI
- Cross-chain USDC transfers via CCTP

## 🏃 Running the Project
```bash
# Install dependencies
npm install

# Create .env file with your API keys
AIML_API_KEY=your_key_here
CIRCLE_API_KEY=your_key_here

# Start the server
node server.js

# Open in browser
http://localhost:3000 (Tenant View)
http://localhost:3000/dashboard.html (Landlord View)
```

## 👥 Team

Built for the AI Agents on Arc with USDC Hackathon by [Kamohelo Mototo]

## 🔗 Real Circle Integration

RentBot connects to **real Circle Developer-Controlled Wallets**:

**Tenant Wallet:**
- ID: `7206b408-7a94-526e-9775-d6824ed1ec7e`
- Address: `0xf651bd6d7346195c556e20c9b4e419d5ba06496d`
- Blockchain: Ethereum Sepolia Testnet
- Balance: 20 USDC (verifiable on-chain)

**Landlord Wallet:**
- ID: `24f1efd2-92fb-587c-8bde-5bbb11cad8cd`
- Address: `0x9636796c5a674c8307efd7a4bada03b949c23398`
- Blockchain: Ethereum Sepolia Testnet

**Verify on Etherscan:**
- Tenant: https://sepolia.etherscan.io/address/0xf651bd6d7346195c556e20c9b4e419d5ba06496d
- Landlord: https://sepolia.etherscan.io/address/0x9636796c5a674c8307efd7a4bada03b949c23398

The infrastructure is **semi-production-ready** for real USDC transfers via Circle API.

### Technical Implementation:
- Circle SDK v1.x for wallet management
- REST API integration for payment processing
- Automated wallet initialization on server startup
- Support for multiple wallet sets and blockchain networks
## 📄 License

MIT License

---

**Built with ❤️ using Circle, Arc Blockchain, and in partnership with AI**
