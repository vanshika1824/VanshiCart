# VanshiCart Frontend

React + Vite + Tailwind CSS frontend for the existing VanshiCart FastAPI backend.

## Run

```bash
npm install
npm run dev
```

Create a local `.env` from `.env.example`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The frontend uses JWT Bearer authentication and the existing REST API.

## Important

This frontend was created without any database credentials, JWT secrets, `.env` files, or access tokens.

Before production use, verify request/response payloads against the current backend schemas, especially cart, wishlist, checkout, address, and admin payloads.