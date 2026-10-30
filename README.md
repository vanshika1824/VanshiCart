# 🛒 VanshiCart – Full-Stack Grocery E-Commerce Application

VanshiCart is a full-stack online grocery shopping application designed to provide a convenient and user-friendly shopping experience. Users can browse grocery products, manage their shopping cart and wishlist, place orders, and manage their delivery addresses.

The application is built using **React.js, FastAPI, and PostgreSQL**, with a RESTful backend architecture.

## 🌐 Live Demo

- **Frontend:** https://vanshi-cart.vercel.app/
- **Backend API:** https://vanshicart-api.onrender.com/
- **API Documentation:** https://vanshicart-api.onrender.com/docs

## ✨ Features

### Customer Features
- Browse grocery products, categories, and brands.
- View individual product details.
- User registration and login.
- JWT-based authentication.
- Add, update, and remove products from the shopping cart.
- Save products to a wishlist.
- Manage multiple delivery addresses.
- Place orders and view order history.
- Submit product reviews with purchase verification.

### Administrative Functionality
- Administrative interfaces for product, category, and brand management.
- Backend role-based authorization.
- Admin-only API endpoints for supported catalog operations.

*Note: The administrative frontend authentication integration and some management workflows are still under development.*

### Performance and User Experience
- Responsive user interface for different screen sizes.
- Optimized grocery product image loading.
- Fallback handling for unavailable images.
- Toast notifications for user feedback.
- Clean, modern grocery shopping interface.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Authentication | JWT |
| API Communication | Axios, REST APIs |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## 🏗️ Application Architecture

```text
             USER
               |
               v
       React.js Frontend
       (Vite + Tailwind CSS)
               |
               v
        Axios HTTP Requests
               |
               v
          FastAPI
        (REST APIs)
               |
               v
        SQLAlchemy ORM
               |
               v
          PostgreSQL
          Database
```

## 📂 Project Structure

```text
VanshiCart/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── db/
│   │   └── main.py
│   ├── requirements.txt
│   └── alembic/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   └── index.html
│
└── README.md
```

## ⚙️ Run Locally

### Prerequisites

- Python 3.13+
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/vanshika1824/VanshiCart.git
cd VanshiCart
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your PostgreSQL database and the environment variables required by the backend configuration.

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

Make sure the frontend API configuration points to your local backend when running locally.

## 🔐 Security

- JWT-based user authentication.
- Password hashing.
- Protected API endpoints.
- Role-based backend authorization.
- Environment-based configuration for sensitive settings.

## 🚀 Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | PostgreSQL |

The frontend communicates with the deployed FastAPI backend through REST APIs.

## 📚 Key Learnings

Through this project, I gained practical experience in:

- Building RESTful APIs using FastAPI.
- Developing responsive interfaces using React.js.
- Designing relational databases with PostgreSQL.
- Integrating SQLAlchemy ORM with backend services.
- Implementing JWT authentication and authorization.
- Connecting frontend and backend applications.
- Debugging database, API, and deployment issues.
- Deploying full-stack applications.

## 👩‍💻 Developer

**Vanshika Maru**

- GitHub: https://github.com/vanshika1824

---

*VanshiCart is a personal full-stack development project built to strengthen practical software engineering skills through real-world application development.*
