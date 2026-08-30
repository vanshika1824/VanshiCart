from datetime import datetime, timezone
from decimal import Decimal
from typing import Literal, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db

from app.models import (
    Address,
    Brand,
    Cart,
    CartItem,
    Category,
    Order,
    OrderItem,
    Product,
    ProductCategory,
    Review,
    User,
    Wishlist,
    WishlistItem,
)

from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
)

from app.schemas.wishlist import (
    WishlistItemCreate,
    WishlistItemResponse,
    WishlistResponse,
)

from app.schemas.order import (
    CheckoutCreate,
    OrderResponse,
)

from app.schemas.address import (
    AddressCreate,
    AddressResponse,
    AddressUpdate,
)

from app.schemas.user import (
    UserCreate,
    UserLogin,
)

from app.schemas.cart import (
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    CartResponse,
)

from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

from app.schemas.brand import (
    BrandCreate,
    BrandResponse,
    BrandUpdate,
)

from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)

from app.services.auth_service import (
    hash_password,
    verify_password,
)

from app.services.jwt_service import create_access_token

from app.services.security import (
    get_current_admin,
    get_current_user_id,
)


app = FastAPI(
    title="VanshiCart API",
    version="1.0.0",
    description="AI-powered Grocery Shopping Platform",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://vanshi-cart.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "VanshiCart API is running!"
    }


# ============================================================
# USER ENDPOINTS
# ============================================================

@app.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    result = db.execute(select(User))
    users = result.scalars().all()

    return [
        {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "is_active": user.is_active,
        }
        for user in users
    ]


@app.get("/users/me")
def get_current_user(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.user_id == current_user_id)
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return {
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "profile_image": user.profile_image,
        "is_active": user.is_active,
    }


# ============================================================
# PRODUCT ENDPOINTS
# ============================================================

@app.get(
    "/products",
    response_model=list[ProductResponse],
)
def get_products(
    search: Optional[str] = Query(
        default=None,
        min_length=1,
        max_length=255
    ),
    brand_id: Optional[int] = Query(
        default=None,
        ge=1
    ),
    category_id: Optional[int] = Query(
        default=None,
        ge=1
    ),
    min_price: Optional[Decimal] = Query(
        default=None,
        ge=0
    ),
    max_price: Optional[Decimal] = Query(
        default=None,
        ge=0
    ),
    in_stock: Optional[bool] = None,
    sort_by: Literal[
        "name",
        "selling_price",
        "created_at"
    ] = "created_at",
    sort_order: Literal[
        "asc",
        "desc"
    ] = "desc",
    skip: int = Query(
        default=0,
        ge=0
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100
    ),
    db: Session = Depends(get_db),
):
    query = select(Product).where(
        Product.is_active == True
    )

    if search:
        search_term = f"%{search}%"

        query = query.where(
            Product.name.ilike(search_term)
            | Product.description.ilike(search_term)
        )

    if brand_id is not None:
        query = query.where(
            Product.brand_id == brand_id
        )

    if category_id is not None:
        query = (
            query
            .join(
                ProductCategory,
                ProductCategory.product_id == Product.product_id
            )
            .where(
                ProductCategory.category_id == category_id
            )
            .distinct()
        )

    if min_price is not None:
        query = query.where(
            Product.selling_price >= min_price
        )

    if max_price is not None:
        query = query.where(
            Product.selling_price <= max_price
        )

    if in_stock is True:
        query = query.where(
            Product.stock_quantity > 0
        )

    elif in_stock is False:
        query = query.where(
            Product.stock_quantity == 0
        )

    sort_columns = {
        "name": Product.name,
        "selling_price": Product.selling_price,
        "created_at": Product.created_at,
    }

    sort_column = sort_columns[sort_by]

    if sort_order == "desc":
        query = query.order_by(
            sort_column.desc()
        )
    else:
        query = query.order_by(
            sort_column.asc()
        )

    result = db.execute(
        query.offset(skip).limit(limit)
    )

    return result.scalars().all()


@app.get(
    "/products/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = db.scalar(
        select(Product).where(
            Product.product_id == product_id,
            Product.is_active == True,
        )
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return product
