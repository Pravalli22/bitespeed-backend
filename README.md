# bitespeed-backend
# Bitespeed Identity Reconciliation

This project implements the `/identify` endpoint for reconciling customer identities across multiple contact details.

## 🛠 Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL (Render-hosted)
- Prisma ORM
- Hosted on Render

## 📦 Setup Instructions

1. Clone the repo
2. Install dependencies: npm install
3. Create `.env` file with: DATABASE_URL=<your-postgres-url>
4. Run DB migration and start the server:
   npx prisma generate
   npx ts-node src/index.ts



## 🔗 Live API Endpoint

https://bitespeed-backend-54pa.onrender.com/identify

### Sample Request (POST)

```json
{
  "email": "doc@fluxkart.com",
  "phoneNumber": "123456"
}
### Sample Response

{
    "contact": {
        "primaryContatctId": 4,
        "emails": [
            "doc@fluxkart.com"
        ],
        "phoneNumbers": [
            "123456"
        ],
        "secondaryContactIds": []
    }
}









