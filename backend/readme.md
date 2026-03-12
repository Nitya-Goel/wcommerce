# W-Commerce X — Backend

## Setup
```bash
npm install
cp .env.example .env
# .env mein MONGODB_URI aur JWT_SECRET bharo
npm run seed    # products add karo
npm start       # port 5000 pe start
```

## Deploy to Railway
1. `backend/` folder GitHub pe push karo (same repo)
2. Railway → New Service → GitHub → Root Directory = `backend`
3. Variables add karo:
   - `MONGODB_URI` = tera MongoDB Atlas connection string
   - `JWT_SECRET` = koi bhi random string
   - `PORT` = 5000
4. Deploy

## API Endpoints
| Method | Route | What |
|--------|-------|------|
| GET | `/api/products` | All products |
| GET | `/api/products/:id` | Single product |
| POST | `/api/auth/login` | Login with wallet |
| GET | `/api/auth/me` | Current user |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:wallet` | Get orders |