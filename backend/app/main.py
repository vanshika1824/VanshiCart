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
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate
from app.schemas.wishlist import (
    WishlistItemCreate,
    WishlistItemResponse,
    WishlistResponse,
)
from app.schemas.order import CheckoutCreate, OrderResponse
from app.schemas.address import AddressCreate, AddressResponse, AddressUpdate
from app.schemas.user import UserCreate, UserLogin
from app.schemas.cart import CartItemCreate, CartItemResponse, CartItemUpdate, CartResponse
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from app.schemas.brand import BrandCreate, BrandResponse, BrandUpdate
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.auth_service import hash_password, verify_password
from app.services.jwt_service import create_access_token
from app.services.security import get_current_admin, get_current_user_id

app = FastAPI(
    title="VanshiCart API",
    version="1.0.0",
    description="AI-powered Grocery Shopping Platform",
)

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

@app.get(
    "/products",
    response_model=list[ProductResponse],
)
def get_products(
    search: Optional[str] = Query(default=None, min_length=1, max_length=255),
    brand_id: Optional[int] = Query(default=None, ge=1),
    category_id: Optional[int] = Query(default=None, ge=1),
    min_price: Optional[Decimal] = Query(default=None, ge=0),
    max_price: Optional[Decimal] = Query(default=None, ge=0),
    in_stock: Optional[bool] = None,
    sort_by: Literal["name", "selling_price", "created_at"] = "created_at",
    sort_order: Literal["asc", "desc"] = "desc",
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = select(Product).where(Product.is_active == True)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            Product.name.ilike(search_term)
            | Product.description.ilike(search_term)
        )

    if brand_id is not None:
        query = query.where(Product.brand_id == brand_id)

    if category_id is not None:
        query = (
            query.join(ProductCategory, ProductCategory.product_id == Product.product_id)
            .where(ProductCategory.category_id == category_id)
            .distinct()
        )

    if min_price is not None:
        query = query.where(Product.selling_price >= min_price)

    if max_price is not None:
        query = query.where(Product.selling_price <= max_price)

    if in_stock is True:
        query = query.where(Product.stock_quantity > 0)
    elif in_stock is False:
        query = query.where(Product.stock_quantity == 0)

    sort_columns = {
        "name": Product.name,
        "selling_price": Product.selling_price,
        "created_at": Product.created_at,
    }
    sort_column = sort_columns[sort_by]

    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    result = db.execute(query.offset(skip).limit(limit))

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


@app.put(
    "/products/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
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

    update_data = product_data.model_dump(exclude_unset=True)

    if "brand_id" in update_data and update_data["brand_id"] is not None:
        brand = db.scalar(
            select(Brand).where(
                Brand.brand_id == update_data["brand_id"]
            )
        )

        if not brand:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand not found.",
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


@app.delete("/products/{product_id}")
def deactivate_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
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

    product.is_active = False
    db.commit()

    return {"message": "Product deactivated successfully."}


# ============================================================
# ADDRESS ENDPOINTS
# ============================================================

@app.post(
    "/addresses",
    response_model=AddressResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_address(
    address_data: AddressCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    if address_data.is_default:
        db.execute(
            update(Address)
            .where(Address.user_id == current_user_id)
            .values(is_default=False)
        )

    new_address = Address(
        user_id=current_user_id,
        **address_data.model_dump(),
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)

    return new_address


@app.get(
    "/addresses",
    response_model=list[AddressResponse],
)
def get_addresses(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    result = db.execute(
        select(Address)
        .where(Address.user_id == current_user_id)
        .order_by(Address.is_default.desc(), Address.address_id.desc())
    )

    return result.scalars().all()


@app.get(
    "/addresses/{address_id}",
    response_model=AddressResponse,
)
def get_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    address = db.scalar(
        select(Address).where(
            Address.address_id == address_id,
            Address.user_id == current_user_id,
        )
    )

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found.",
        )

    return address


@app.put(
    "/addresses/{address_id}",
    response_model=AddressResponse,
)
def update_address(
    address_id: int,
    address_data: AddressUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    address = db.scalar(
        select(Address).where(
            Address.address_id == address_id,
            Address.user_id == current_user_id,
        )
    )

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found.",
        )

    update_data = address_data.model_dump(exclude_unset=True)

    if update_data.get("is_default") is True:
        db.execute(
            update(Address)
            .where(
                Address.user_id == current_user_id,
                Address.address_id != address_id,
            )
            .values(is_default=False)
        )

    for field, value in update_data.items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)

    return address


@app.delete("/addresses/{address_id}")
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    address = db.scalar(
        select(Address).where(
            Address.address_id == address_id,
            Address.user_id == current_user_id,
        )
    )

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found.",
        )

    db.delete(address)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Address cannot be deleted because it is used by an order.",
        )

    return {"message": "Address deleted successfully."}


# ============================================================
# CART ENDPOINTS
# ============================================================

@app.post(
    "/cart",
    response_model=CartResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_cart(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    existing_cart = db.scalar(
        select(Cart).where(Cart.user_id == current_user_id)
    )

    if existing_cart:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cart already exists.",
        )

    new_cart = Cart(user_id=current_user_id)
    db.add(new_cart)
    db.commit()
    db.refresh(new_cart)

    return new_cart


@app.get(
    "/cart",
    response_model=CartResponse,
)
def get_cart(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    cart = db.scalar(
        select(Cart).where(Cart.user_id == current_user_id)
    )

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found.",
        )

    return cart


@app.post(
    "/cart/items",
    response_model=CartItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_cart_item(
    item_data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    cart = db.scalar(
        select(Cart).where(Cart.user_id == current_user_id)
    )

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found. Create a cart first.",
        )

    product = db.scalar(
        select(Product).where(
            Product.product_id == item_data.product_id,
            Product.is_active == True,
        )
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    cart_item = db.scalar(
        select(CartItem).where(
            CartItem.cart_id == cart.cart_id,
            CartItem.product_id == item_data.product_id,
        )
    )
    new_quantity = item_data.quantity

    if cart_item:
        new_quantity += cart_item.quantity

    if new_quantity > product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Requested quantity exceeds available stock.",
        )

    if cart_item:
        cart_item.quantity = new_quantity
    else:
        cart_item = CartItem(
            cart_id=cart.cart_id,
            product_id=item_data.product_id,
            quantity=new_quantity,
        )
        db.add(cart_item)

    cart.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(cart_item)

    return cart_item


@app.put(
    "/cart/items/{cart_item_id}",
    response_model=CartItemResponse,
)
def update_cart_item(
    cart_item_id: int,
    item_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    cart = db.scalar(
        select(Cart).where(Cart.user_id == current_user_id)
    )

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found.",
        )

    cart_item = db.scalar(
        select(CartItem).where(
            CartItem.cart_item_id == cart_item_id,
            CartItem.cart_id == cart.cart_id,
        )
    )

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    product = db.scalar(
        select(Product).where(
            Product.product_id == cart_item.product_id,
            Product.is_active == True,
        )
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    if item_data.quantity > product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Requested quantity exceeds available stock.",
        )

    cart_item.quantity = item_data.quantity
    cart.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(cart_item)

    return cart_item


@app.delete("/cart/items/{cart_item_id}")
def remove_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    cart = db.scalar(
        select(Cart).where(Cart.user_id == current_user_id)
    )

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found.",
        )

    cart_item = db.scalar(
        select(CartItem).where(
            CartItem.cart_item_id == cart_item_id,
            CartItem.cart_id == cart.cart_id,
        )
    )

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    cart.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.delete(cart_item)
    db.commit()

    return {"message": "Cart item removed successfully."}


# ============================================================
# REVIEW ENDPOINTS
# ============================================================

@app.post(
    "/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    product = db.scalar(
        select(Product).where(
            Product.product_id == review_data.product_id,
            Product.is_active == True,
        )
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    purchased_item = db.scalar(
        select(OrderItem)
        .join(Order, OrderItem.order_id == Order.order_id)
        .where(
            OrderItem.order_item_id == review_data.order_item_id,
            OrderItem.product_id == review_data.product_id,
            Order.user_id == current_user_id,
        )
    )

    if not purchased_item:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review products you purchased.",
        )

    existing_review = db.scalar(
        select(Review).where(
            Review.user_id == current_user_id,
            Review.product_id == review_data.product_id,
        )
    )

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this product.",
        )

    review = Review(
        user_id=current_user_id,
        **review_data.model_dump(),
    )
    db.add(review)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this product.",
        )

    db.refresh(review)

    return review


@app.get(
    "/products/{product_id}/reviews",
    response_model=list[ReviewResponse],
)
def get_product_reviews(
    product_id: int,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
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

    result = db.execute(
        select(Review)
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().all()


@app.put(
    "/reviews/{review_id}",
    response_model=ReviewResponse,
)
def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    review = db.scalar(
        select(Review).where(
            Review.review_id == review_id,
            Review.user_id == current_user_id,
        )
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found.",
        )

    for field, value in review_data.model_dump(exclude_unset=True).items():
        setattr(review, field, value)

    review.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(review)

    return review


@app.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    review = db.scalar(
        select(Review).where(
            Review.review_id == review_id,
            Review.user_id == current_user_id,
        )
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found.",
        )

    db.delete(review)
    db.commit()

    return {"message": "Review deleted successfully."}


# ============================================================
# WISHLIST ENDPOINTS
# ============================================================

@app.post(
    "/wishlist",
    response_model=WishlistResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_wishlist(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    existing_wishlist = db.scalar(
        select(Wishlist).where(Wishlist.user_id == current_user_id)
    )

    if existing_wishlist:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Wishlist already exists.",
        )

    wishlist = Wishlist(user_id=current_user_id)
    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)

    return wishlist


@app.get(
    "/wishlist",
    response_model=WishlistResponse,
)
def get_wishlist(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    wishlist = db.scalar(
        select(Wishlist).where(Wishlist.user_id == current_user_id)
    )

    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found.",
        )

    return wishlist


@app.post(
    "/wishlist/items",
    response_model=WishlistItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_wishlist_item(
    item_data: WishlistItemCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    wishlist = db.scalar(
        select(Wishlist).where(Wishlist.user_id == current_user_id)
    )

    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found. Create a wishlist first.",
        )

    product = db.scalar(
        select(Product).where(
            Product.product_id == item_data.product_id,
            Product.is_active == True,
        )
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    existing_item = db.scalar(
        select(WishlistItem).where(
            WishlistItem.wishlist_id == wishlist.wishlist_id,
            WishlistItem.product_id == item_data.product_id,
        )
    )

    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product is already in the wishlist.",
        )

    wishlist_item = WishlistItem(
        wishlist_id=wishlist.wishlist_id,
        product_id=item_data.product_id,
    )
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)

    return wishlist_item


@app.delete("/wishlist/items/{wishlist_item_id}")
def remove_wishlist_item(
    wishlist_item_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    wishlist = db.scalar(
        select(Wishlist).where(Wishlist.user_id == current_user_id)
    )

    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found.",
        )

    wishlist_item = db.scalar(
        select(WishlistItem).where(
            WishlistItem.wishlist_item_id == wishlist_item_id,
            WishlistItem.wishlist_id == wishlist.wishlist_id,
        )
    )

    if not wishlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found.",
        )

    db.delete(wishlist_item)
    db.commit()

    return {"message": "Wishlist item removed successfully."}


# ============================================================
# ORDER AND CHECKOUT ENDPOINTS
# ============================================================

@app.post(
    "/checkout",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def checkout(
    checkout_data: CheckoutCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    cart = db.scalar(
        select(Cart)
        .where(Cart.user_id == current_user_id)
        .with_for_update()
    )

    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty.",
        )

    address = db.scalar(
        select(Address).where(
            Address.address_id == checkout_data.address_id,
            Address.user_id == current_user_id,
        )
    )

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found.",
        )

    product_ids = [item.product_id for item in cart.items]
    result = db.execute(
        select(Product)
        .where(Product.product_id.in_(product_ids))
        .with_for_update()
    )
    products = {
        product.product_id: product
        for product in result.scalars().all()
    }

    subtotal_amount = Decimal("0.00")

    for cart_item in cart.items:
        product = products.get(cart_item.product_id)

        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A product in the cart is no longer available.",
            )

        if cart_item.quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A product in the cart no longer has enough stock.",
            )

        subtotal_amount += product.selling_price * cart_item.quantity

    order = Order(
        user_id=current_user_id,
        address_id=address.address_id,
        order_status="PLACED",
        payment_method=checkout_data.payment_method,
        subtotal_amount=subtotal_amount,
        discount_amount=Decimal("0.00"),
        total_amount=subtotal_amount,
    )
    db.add(order)
    db.flush()

    for cart_item in cart.items:
        product = products[cart_item.product_id]
        item_subtotal = product.selling_price * cart_item.quantity

        db.add(
            OrderItem(
                order_id=order.order_id,
                product_id=product.product_id,
                product_name=product.name,
                quantity=cart_item.quantity,
                price_at_purchase=product.selling_price,
                subtotal=item_subtotal,
            )
        )
        product.stock_quantity -= cart_item.quantity
        db.delete(cart_item)

    cart.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(order)

    return order


@app.get(
    "/orders",
    response_model=list[OrderResponse],
)
def get_orders(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    result = db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user_id)
        .order_by(Order.created_at.desc())
    )

    return result.scalars().all()


@app.get(
    "/orders/{order_id}",
    response_model=OrderResponse,
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(
            Order.order_id == order_id,
            Order.user_id == current_user_id,
        )
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    return order


# ============================================================
# CATEGORY ENDPOINTS
# ============================================================

@app.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
):
    existing_category = db.scalar(
        select(Category).where(Category.name == category_data.name)
    )

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        )

    new_category = Category(
        name=category_data.name,
        image_url=category_data.image_url,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@app.get(
    "/categories",
    response_model=list[CategoryResponse],
)
def get_categories(
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.name)
    )

    return result.scalars().all()


@app.get(
    "/categories/{category_id}",
    response_model=CategoryResponse,
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    category = db.scalar(
        select(Category).where(
            Category.category_id == category_id,
            Category.is_active == True,
        )
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    return category


@app.put(
    "/categories/{category_id}",
    response_model=CategoryResponse,
)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
):
    category = db.scalar(
        select(Category).where(
            Category.category_id == category_id,
            Category.is_active == True,
        )
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    update_data = category_data.model_dump(exclude_unset=True)

    if "name" in update_data:
        existing_category = db.scalar(
            select(Category).where(
                Category.name == update_data["name"],
                Category.category_id != category_id,
            )
        )

        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A category with this name already exists.",
            )

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


@app.delete("/categories/{category_id}")
def deactivate_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
):
    category = db.scalar(
        select(Category).where(
            Category.category_id == category_id,
            Category.is_active == True,
        )
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    category.is_active = False
    db.commit()

    return {"message": "Category deactivated successfully."}


@app.get(
    "/products/{product_id}/categories",
    response_model=list[CategoryResponse],
)
def get_product_categories(
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

    result = db.execute(
        select(Category)
        .join(ProductCategory)
        .where(
            ProductCategory.product_id == product_id,
            Category.is_active == True,
        )
        .order_by(Category.name)
    )

    return result.scalars().all()


@app.post(
    "/products/{product_id}/categories/{category_id}",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_product_category(
    product_id: int,
    category_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
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

    category = db.scalar(
        select(Category).where(
            Category.category_id == category_id,
            Category.is_active == True,
        )
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    existing_link = db.scalar(
        select(ProductCategory).where(
            ProductCategory.product_id == product_id,
            ProductCategory.category_id == category_id,
        )
    )

    if existing_link:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product is already assigned to this category.",
        )

    db.add(
        ProductCategory(
            product_id=product_id,
            category_id=category_id,
        )
    )
    db.commit()

    return category


@app.delete("/products/{product_id}/categories/{category_id}")
def remove_product_category(
    product_id: int,
    category_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
):
    product_category = db.scalar(
        select(ProductCategory).where(
            ProductCategory.product_id == product_id,
            ProductCategory.category_id == category_id,
        )
    )

    if not product_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product category assignment not found.",
        )

    db.delete(product_category)
    db.commit()

    return {"message": "Product removed from category successfully."}


# ============================================================
# BRAND ENDPOINTS
# ============================================================

@app.post(
    "/brands",
    response_model=BrandResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_brand(
    brand_data: BrandCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
):
    existing_brand = db.scalar(
        select(Brand).where(Brand.name == brand_data.name)
    )

    if existing_brand:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A brand with this name already exists.",
        )

    new_brand = Brand(
        name=brand_data.name,
        logo_url=brand_data.logo_url,
        description=brand_data.description,
    )

    db.add(new_brand)
    db.commit()
    db.refresh(new_brand)

    return new_brand


@app.get(
    "/brands",
    response_model=list[BrandResponse],
)
def get_brands(
    db: Session = Depends(get_db),
):
    result = db.execute(select(Brand).order_by(Brand.name))

    return result.scalars().all()


@app.get(
    "/brands/{brand_id}",
    response_model=BrandResponse,
)
def get_brand(
    brand_id: int,
    db: Session = Depends(get_db),
):
    brand = db.scalar(
        select(Brand).where(Brand.brand_id == brand_id)
    )

    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found.",
        )

    return brand


@app.put(
    "/brands/{brand_id}",
    response_model=BrandResponse,
)
def update_brand(
    brand_id: int,
    brand_data: BrandUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
):
    brand = db.scalar(
        select(Brand).where(Brand.brand_id == brand_id)
    )

    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found.",
        )

    update_data = brand_data.model_dump(exclude_unset=True)

    if "name" in update_data:
        existing_brand = db.scalar(
            select(Brand).where(
                Brand.name == update_data["name"],
                Brand.brand_id != brand_id,
            )
        )

        if existing_brand:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A brand with this name already exists.",
            )

    for field, value in update_data.items():
        setattr(brand, field, value)

    db.commit()
    db.refresh(brand)

    return brand

@app.post("/users/register", status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone_number=user_data.phone_number,
        profile_image=user_data.profile_image,
        is_active=True,
        role="customer",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully.",
        "user": {
            "user_id": new_user.user_id,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "email": new_user.email,
            "phone_number": new_user.phone_number,
            "profile_image": new_user.profile_image,
            "is_active": new_user.is_active,
        },
    }


@app.post("/users/login")
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    access_token = create_access_token(user.user_id)

    return {
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "profile_image": user.profile_image,
            "is_active": user.is_active,
        },
    }


# ============================================================
# PRODUCT ENDPOINTS
# ============================================================

@app.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_admin),
):
    # Check that the brand exists if brand_id was provided
    if product_data.brand_id is not None:
        brand = db.scalar(
            select(Brand).where(
                Brand.brand_id == product_data.brand_id
            )
        )

        if not brand:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand not found.",
            )

    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        selling_price=product_data.selling_price,
        original_price=product_data.original_price,
        quantity=product_data.quantity,
        unit=product_data.unit,
        stock_quantity=product_data.stock_quantity,
        brand_id=product_data.brand_id,
        image_url=product_data.image_url,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product
