# E-commerce Backend Starter (Node.js + Express + PostgreSQL)

Minimal MVC starter template for an e-commerce backend.

## Folder Structure

```text
src/
  app.js
  server.js
  config/
    db.js
  controllers/
    productController.js
  models/
    productModel.js
  routes/
    productRoutes.js
  db/
    schema.sql
```

## Setup

1. Copy environment template:
   - `cp .env.example .env` (macOS/Linux)
   - `copy .env.example .env` (Windows)
2. Update `.env` with your PostgreSQL credentials.
3. Create database (example): `amazon_clone`.
4. Run SQL in `src/db/schema.sql`.
5. Start server:
   - Development: `npm run dev`
   - Production: `npm start`

## API Endpoints

- `GET /health`
- `GET /api/products`
- `GET /api/products/:id`

### Product Listing Query Params

- `search` (string)
- `category` (string)
- `minPrice` (number)
- `maxPrice` (number)
