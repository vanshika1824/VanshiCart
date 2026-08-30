# 🛒 VanshiCart

> A modern full-stack grocery shopping platform built with React and FastAPI, featuring product browsing, category filtering, authentication, cart management, wishlist, address management, checkout, and order tracking.

## 🌐 Live Demo

🚧 Deployment in progress

---

## 📌 Overview

VanshiCart is a full-stack grocery shopping web application designed to provide a simple and responsive online shopping experience.

The project combines a **React frontend**, **FastAPI backend**, and **PostgreSQL database** to demonstrate real-world full-stack application development.

Users can browse grocery products, filter products by category, search the catalog, manage their cart and wishlist, save delivery addresses, place orders, and view their previous purchases.

---

## ✨ Features

### 🏠 Home
- Clean and responsive grocery shopping interface
- Featured categories
- Quick navigation to product collections
- Modern responsive UI
<img width="960" height="504" alt="Screenshot 2026-08-30 205004" src="https://github.com/user-attachments/assets/f37625df-d027-4e73-959d-ad38c7d966a9" />
### 🛍️ Products
- Browse available grocery products
- Search products by name
- Filter products by category
- Product pricing and availability
- Product images
- Add products directly to cart
- Add products to wishlist

### 📂 Categories
- Browse products by category
- Dynamic category navigation
- Backend-powered category filtering
<img width="727" height="362" alt="Screenshot 2026-08-30 205121" src="https://github.com/user-attachments/assets/6a2eb0c2-6379-41f2-a99a-80c82d8f649b" />

### 🛒 Shopping Cart
- Add products to cart
- Increase/decrease product quantity
- Remove products from cart
- Automatic cart total calculation
- Stock validation
- Persistent cart for authenticated users
<img width="960" height="504" alt="Screenshot 2026-08-30 205304" src="https://github.com/user-attachments/assets/f925e155-3e48-483e-8a36-0e0107e77545" />

### ❤️ Wishlist
- Save products for later
- View saved products
- Remove products from wishlist
- Product information retrieved from the backend
<img width="960" height="504" alt="Screenshot 2026-08-30 205223" src="https://github.com/user-attachments/assets/9c4423d4-c8fd-4b03-9672-1f8ec5c59707" />

### 👤 Authentication
- User registration
- User login
- JWT-based authentication
- Protected user features
- User profile
- Logout functionality

### 📍 Address Management
- Add delivery addresses
- Edit existing addresses
- Delete addresses
- Set a default delivery address
- Address types such as Home, Work, and Other

### 💳 Checkout
- Select delivery address
- Review cart items
- Calculate order total
- Cash on Delivery (COD)
- Place orders securely through the backend

### 📦 Orders
- View previous orders
- Order status
- Order date and time
- Purchased products
- Quantity and price
- Payment method
- Order total
<img width="960" height="504" alt="Screenshot 2026-08-30 205337" src="https://github.com/user-attachments/assets/d2a5770e-448f-43e6-b049-a96a74de2ecd" />

### 📱 Responsive Design
- Mobile-friendly layout
- Tablet support
- Desktop-friendly interface
- Responsive product grids and navigation

---

## 🧰 Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- PostgreSQL

### Database

- PostgreSQL
- SQLAlchemy ORM

### Development Tools

- Git
- GitHub
- VS Code
- REST API
- Swagger / OpenAPI

---

## 🏗️ Project Architecture

```text
VanshiCart
│
├── backend
│   ├── app
│   │   ├── models
│   │   ├── schemas
│   │   ├── routers
│   │   ├── services
│   │   ├── db
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── ...
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── context
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
├── LICENSE
└── README.md
