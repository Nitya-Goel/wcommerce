# ⬡ W-Commerce X
### Autonomous Agentic Stablecoin Marketplace — Web4

> Weilliptic Hackathon 2026 · Team AstroVerse · PS3

---

## 🔗 Live Links

| | URL |
|--|-----|
| 🌐 Frontend | [wcommerce.vercel.app](https://wcommerce.vercel.app) |
| ⚙️ Backend | [wcommerce-production.up.railway.app](https://wcommerce-production.up.railway.app) |
| ⬡ WeilChain | [just-rebirth-production.up.railway.app](https://just-rebirth-production.up.railway.app) |
| 📂 GitHub | [github.com/Nitya-Goel/wcommerce](https://github.com/Nitya-Goel/wcommerce) |

---

## 🧠 What is W-Commerce X?

An AI-powered e-commerce marketplace where autonomous agents negotiate prices, WUSD stablecoin handles payments, and smart escrow enforces every transaction — all on a custom-built JavaScript blockchain.

> *AI agents negotiate. Escrow enforces. WUSD settles.*

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⬡ **WUSD Wallet** | 1,250 WUSD minted on connect via on-chain faucet. Persists across sessions. |
| 🤖 **Icarus AI Agent** | Auto-negotiates ~12% savings on every checkout |
| 🔐 **Smart Escrow** | WUSD locked on WeilChain until delivery confirmed. LOCK → RELEASE / REFUND |
| 🛍️ **Marketplace** | 9 products, 8 categories, MongoDB-backed with static fallback |
| 🔍 **Smart Search** | Live suggestions + voice search (SpeechRecognition API) + sort/filter |
| 📱 **Social Commerce** | Creator reels with Shop the Look — tap product → add to cart |
| 🎮 **Gamification** | Spin wheel, XP bar, achievement badges, mystery box, daily deals |
| 🛒 **One-Page Checkout** | Address + wallet + order summary on one screen. Confetti on success. |
| 📊 **Dashboard** | WUSD balance, agent stats, open escrows, gamification hub |

---

## 🛠️ Tech Stack

**Frontend** — Next.js 16 (App Router), CSS Modules, GSAP, Canvas API, React Context

**Backend** — Node.js, Express, MongoDB Atlas, Mongoose, JWT

**WeilChain** — Pure JavaScript, SHA-256 PoW, in-memory WUSD ledger, Escrow engine, Express REST API

**Infra** — Vercel (frontend), Railway (backend + chain), MongoDB Atlas, GitHub CI/CD

---

## 🏗️ Architecture

```
Browser (Next.js 16)
    │
    ├──▶ Backend API (Express · Railway :5000)
    │         └──▶ MongoDB Atlas
    │
    └──▶ WeilChain (JS Blockchain · Railway :4000)
              └──▶ In-memory WUSD Ledger + Escrow Engine
```

**Purchase flow:** Browse → Add to Cart → Connect Wallet (faucet) → Checkout → Escrow Lock → Agent Release → WUSD to Seller

---

## 📁 Project Structure

```
wcommerce-x/
├── src/
│   ├── app/
│   │   ├── login/           # Lamp effect login
│   │   ├── marketplace/     # Products + Social + Search
│   │   ├── checkout/        # One-page checkout + confetti
│   │   └── dashboard/       # Stats + Gamification
│   ├── components/
│   │   ├── Navbar.js        # Wallet badge, cart count
│   │   ├── ProductCard.js   # GSAP add-to-cart animation
│   │   ├── CartDrawer.js
│   │   └── AgentChat.js
│   ├── context/
│   │   ├── AppContext.js    # Wallet, cart, escrow, blockchain calls
│   │   └── ThemeContext.js  # Dark/light (data-theme attr)
│   └── data/products.js     # 9 static products + ESCROW_DATA
├── backend/
│   ├── models/Product.js
│   ├── routes/              # products, auth, orders, cart
│   ├── server.js            # Express, port 5000, CORS *
│   └── seed.js              # Seeds 9 products
└── blockchain/
    ├── core.js              # Block, Chain, Ledger, Escrow
    └── server.js            # REST API, port 4000
```

---

## ⛓️ WeilChain API

Base: `https://just-rebirth-production.up.railway.app`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/wallet/:address` | WUSD balance |
| POST | `/wallet/faucet` | Mint WUSD `{address, amount}` |
| POST | `/escrow/create` | Lock funds `{buyer, seller, amount, orderId}` |
| POST | `/escrow/release` | Release to seller `{escrowId}` |
| POST | `/escrow/refund` | Refund to buyer `{escrowId}` |
| GET | `/escrow` | All escrow records |
| GET | `/blocks` | Full blockchain |
| GET | `/validate` | Chain integrity check |

---

## 🔧 Backend API

Base: `https://wcommerce-production.up.railway.app`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | All products |
| GET | `/api/products/:id` | Single product |
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/register` | Register user |
| POST | `/api/orders` | Create order |

---

## 🔐 Environment Variables

**`.env.local`** (frontend root — gitignored)
```env
NEXT_PUBLIC_BLOCKCHAIN_URL=https://just-rebirth-production.up.railway.app
NEXT_PUBLIC_API_URL=https://wcommerce-production.up.railway.app
```
> ⚠️ `https://` prefix required. Set same vars in Vercel dashboard.

**`backend/.env`**
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.1l0cnkn.mongodb.net/wcommerce
JWT_SECRET=weilchain_secret_key_2024
PORT=5000
```

---

## 🏃 Run Locally

```bash
# 1. WeilChain
cd blockchain && npm install && node server.js      # :4000

# 2. Backend
cd backend && npm install && node server.js         # :5000
node seed.js                                        # seed DB (first time)

# 3. Frontend
npm install
# set .env.local with localhost URLs
npm run dev                                         # :3000
```

---

## 🚀 Deployment

**Vercel (frontend)** — push to GitHub, Vercel auto-deploys.
```bash
git add . && git commit -m "msg" && git push
# Force: git commit --allow-empty -m "force" && git push
```

**Railway (backend + blockchain)**
- Root dir: `backend/` or `blockchain/`
- Start command: `node server.js`
- Add env vars in Railway dashboard

> ⚠️ Railway free tier resets in-memory WeilChain state on restart. Frontend re-mints WUSD automatically if blockchain returns 0.

---

## 🎯 Demo Flow

```
1. Login              → wcommerce.vercel.app → click Login
2. Search             → type "sony" → filter audio → add to cart
3. Social Commerce    → Shop the Look → tap MacBook → add to cart
4. Connect Wallet     → ⬡ Connect → 1,250 WUSD minted
5. Checkout           → fill address → AI saves 12% → Lock Escrow → 🎊
6. Dashboard          → check stats → spin wheel → view XP badges
```

---

## 🐛 Key Fixes

| Bug | Fix |
|-----|-----|
| WUSD balance increasing on refresh | Skip mint if wallet already in localStorage |
| Products opacity 0 stuck | `.reveal { opacity:1 !important }` in globals.css |
| Hydration error | `useState([])` + `useEffect` — client-side only |
| Balance 0 after Railway restart | Never overwrite localStorage balance with blockchain's 0 |
| Social products on one line | `<span>` → `<div>` + `flex-direction: column` |
| Insufficient WUSD on escrow | Re-mint before escrow if blockchain < amount |

---

## 👥 Team AstroVerse

| Name | ID | Role |
|------|----|------|
| Nitya Goel | B25092 | Frontend Lead |
| Abhishek Kumar Gupta | B25246 | Backend Lead |
| Vishandeep Kaur | B25108 | Blockchain Lead |
| Shaurya Sachan | B25235 | Full Stack |

---

*Weilliptic Hackathon 2026 · Built with ❤️ on WeilChain*