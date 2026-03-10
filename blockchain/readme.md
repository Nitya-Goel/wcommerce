# WeilChain — Custom Blockchain for W-Commerce X

Pure JavaScript blockchain. No Solidity. No Ethereum. No external wallet needed.

## Setup (2 minutes)

```bash
cd blockchain
npm install
node test.js      # verify everything works
node server.js    # start on port 4000
```

## What it does

- **WUSD Ledger** — tracks balances for every wallet address
- **Escrow** — locks WUSD when buyer orders, releases to seller on delivery
- **Proof of Work** — SHA-256 mining, difficulty 2
- **Full chain** — blocks, transactions, mempool, validation

## API Endpoints

| Method | Route | What |
|--------|-------|------|
| GET | `/` | Chain status |
| GET | `/wallet/:address` | Get WUSD balance |
| POST | `/wallet/faucet` | Mint test WUSD |
| POST | `/transaction` | Send WUSD |
| GET | `/transaction/:id` | Get tx status |
| POST | `/escrow/create` | Lock WUSD in escrow |
| POST | `/escrow/release` | Release to seller |
| POST | `/escrow/refund` | Refund to buyer |
| GET | `/escrow` | All escrows |
| GET | `/blocks` | Full chain |
| GET | `/validate` | Verify integrity |

## Deploy to Railway

1. Push `blockchain/` folder to GitHub
2. Railway → New Project → Deploy from GitHub
3. Set root directory to `blockchain`
4. Set env variable: `BLOCKCHAIN_PORT=4000`
5. Copy the Railway URL
6. Add to Nitya's Vercel: `NEXT_PUBLIC_BLOCKCHAIN_URL=<railway_url>`

## Flow for hackathon demo

1. User clicks **Connect Wallet** → address generated + 1250 WUSD minted from faucet
2. User buys product → `POST /escrow/create` locks WUSD
3. Order confirmed → `POST /escrow/release` sends WUSD to seller
4. Live Escrow table on marketplace shows real blockchain data from `GET /escrow`