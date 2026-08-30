from decimal import Decimal

from app.db.session import SessionLocal
from app.models import Brand, Category, Product, ProductCategory


def seed_data():
    db = SessionLocal()

    try:
        # ---------------------------------------------------------
        # BRANDS
        # ---------------------------------------------------------
        brands_data = [
            {
                "name": "FreshFarm",
                "logo_url": "https://placehold.co/200x200?text=FreshFarm",
                "description": "Fresh fruits and vegetables.",
            },
            {
                "name": "Amul",
                "logo_url": "https://placehold.co/200x200?text=Amul",
                "description": "Milk and dairy products.",
            },
            {
                "name": "Britannia",
                "logo_url": "https://placehold.co/200x200?text=Britannia",
                "description": "Biscuits and bakery products.",
            },
            {
                "name": "Tropicana",
                "logo_url": "https://placehold.co/200x200?text=Tropicana",
                "description": "Fruit juices and beverages.",
            },
            {
                "name": "Lays",
                "logo_url": "https://placehold.co/200x200?text=Lays",
                "description": "Chips and savory snacks.",
            },
        ]

        brands = {}

        for data in brands_data:
            brand = db.query(Brand).filter(
                Brand.name == data["name"]
            ).first()

            if not brand:
                brand = Brand(**data)
                db.add(brand)
                db.flush()

            brands[data["name"]] = brand

        # ---------------------------------------------------------
        # CATEGORIES
        # ---------------------------------------------------------
        categories_data = [
            {
                "name": "Fruits",
                "description": "Fresh and seasonal fruits.",
            },
            {
                "name": "Vegetables",
                "description": "Fresh vegetables for everyday cooking.",
            },
            {
                "name": "Dairy",
                "description": "Milk, butter, cheese and other dairy products.",
            },
            {
                "name": "Snacks",
                "description": "Biscuits, chips and tasty snacks.",
            },
            {
                "name": "Beverages",
                "description": "Juices and refreshing drinks.",
            },
        ]

        categories = {}

        for data in categories_data:
            category = db.query(Category).filter(
                Category.name == data["name"]
            ).first()

            if not category:
                category = Category(**data)
                db.add(category)
                db.flush()

            categories[data["name"]] = category

        # ---------------------------------------------------------
        # PRODUCTS
        # ---------------------------------------------------------
        products_data = [
            {
                "name": "Fresh Red Apples",
                "description": "Crisp and juicy red apples.",
                "selling_price": Decimal("120"),
                "original_price": Decimal("150"),
                "quantity": Decimal("1"),
                "unit": "kg",
                "stock_quantity": 50,
                "brand": "FreshFarm",
                "category": "Fruits",
                "image_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
            },
            {
                "name": "Fresh Bananas",
                "description": "Naturally sweet ripe bananas.",
                "selling_price": Decimal("60"),
                "original_price": Decimal("75"),
                "quantity": Decimal("1"),
                "unit": "dozen",
                "stock_quantity": 80,
                "brand": "FreshFarm",
                "category": "Fruits",
                "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e",
            },
            {
                "name": "Fresh Oranges",
                "description": "Juicy and vitamin-rich oranges.",
                "selling_price": Decimal("90"),
                "original_price": Decimal("110"),
                "quantity": Decimal("1"),
                "unit": "kg",
                "stock_quantity": 60,
                "brand": "FreshFarm",
                "category": "Fruits",
                "image_url": "https://images.unsplash.com/photo-1547514701-42782101795e",
            },
            {
                "name": "Green Grapes",
                "description": "Fresh seedless green grapes.",
                "selling_price": Decimal("140"),
                "original_price": Decimal("170"),
                "quantity": Decimal("500"),
                "unit": "g",
                "stock_quantity": 40,
                "brand": "FreshFarm",
                "category": "Fruits",
                "image_url": "https://images.unsplash.com/photo-1537640538966-79f369143f8f",
            },
            {
                "name": "Alphonso Mangoes",
                "description": "Sweet and juicy Alphonso mangoes.",
                "selling_price": Decimal("180"),
                "original_price": Decimal("220"),
                "quantity": Decimal("1"),
                "unit": "kg",
                "stock_quantity": 35,
                "brand": "FreshFarm",
                "category": "Fruits",
                "image_url": "https://images.unsplash.com/photo-1553279768-865429fa0078",
            },
            {
                "name": "Fresh Tomatoes",
                "description": "Fresh red tomatoes.",
                "selling_price": Decimal("45"),
                "original_price": Decimal("55"),
                "quantity": Decimal("1"),
                "unit": "kg",
                "stock_quantity": 70,
                "brand": "FreshFarm",
                "category": "Vegetables",
                "image_url": "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",
            },
            {
                "name": "Fresh Potatoes",
                "description": "Farm fresh potatoes.",
                "selling_price": Decimal("35"),
                "original_price": Decimal("45"),
                "quantity": Decimal("1"),
                "unit": "kg",
                "stock_quantity": 100,
                "brand": "FreshFarm",
                "category": "Vegetables",
                "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
            },
            {
                "name": "Fresh Onions",
                "description": "Quality fresh onions.",
                "selling_price": Decimal("40"),
                "original_price": Decimal("50"),
                "quantity": Decimal("1"),
                "unit": "kg",
                "stock_quantity": 90,
                "brand": "FreshFarm",
                "category": "Vegetables",
                "image_url": "https://images.unsplash.com/photo-1508747703725-719777637510",
            },
            {
                "name": "Amul Taaza Milk",
                "description": "Fresh toned milk.",
                "selling_price": Decimal("32"),
                "original_price": Decimal("35"),
                "quantity": Decimal("500"),
                "unit": "ml",
                "stock_quantity": 100,
                "brand": "Amul",
                "category": "Dairy",
                "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150",
            },
            {
                "name": "Amul Butter",
                "description": "Creamy salted butter.",
                "selling_price": Decimal("58"),
                "original_price": Decimal("62"),
                "quantity": Decimal("100"),
                "unit": "g",
                "stock_quantity": 70,
                "brand": "Amul",
                "category": "Dairy",
                "image_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d",
            },
            {
                "name": "Amul Cheese",
                "description": "Smooth and delicious cheese slices.",
                "selling_price": Decimal("125"),
                "original_price": Decimal("140"),
                "quantity": Decimal("200"),
                "unit": "g",
                "stock_quantity": 45,
                "brand": "Amul",
                "category": "Dairy",
                "image_url": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d",
            },
            {
                "name": "Britannia Good Day Biscuits",
                "description": "Crunchy and delicious biscuits.",
                "selling_price": Decimal("30"),
                "original_price": Decimal("35"),
                "quantity": Decimal("100"),
                "unit": "g",
                "stock_quantity": 100,
                "brand": "Britannia",
                "category": "Snacks",
                "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35",
            },
            {
                "name": "Britannia Bread",
                "description": "Soft and fresh bakery bread.",
                "selling_price": Decimal("45"),
                "original_price": Decimal("50"),
                "quantity": Decimal("400"),
                "unit": "g",
                "stock_quantity": 60,
                "brand": "Britannia",
                "category": "Snacks",
                "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff",
            },
            {
                "name": "Lays Classic Salted",
                "description": "Classic crispy salted potato chips.",
                "selling_price": Decimal("20"),
                "original_price": Decimal("20"),
                "quantity": Decimal("50"),
                "unit": "g",
                "stock_quantity": 120,
                "brand": "Lays",
                "category": "Snacks",
                "image_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
            },
            {
                "name": "Lays Magic Masala",
                "description": "Spicy and flavorful potato chips.",
                "selling_price": Decimal("20"),
                "original_price": Decimal("20"),
                "quantity": Decimal("50"),
                "unit": "g",
                "stock_quantity": 120,
                "brand": "Lays",
                "category": "Snacks",
                "image_url": "https://images.unsplash.com/photo-1621447504864-d8686e12698c",
            },
            {
                "name": "Tropicana Orange Juice",
                "description": "Refreshing orange fruit juice.",
                "selling_price": Decimal("110"),
                "original_price": Decimal("125"),
                "quantity": Decimal("1"),
                "unit": "L",
                "stock_quantity": 50,
                "brand": "Tropicana",
                "category": "Beverages",
                "image_url": "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
            },
            {
                "name": "Tropicana Apple Juice",
                "description": "Refreshing apple fruit juice.",
                "selling_price": Decimal("120"),
                "original_price": Decimal("135"),
                "quantity": Decimal("1"),
                "unit": "L",
                "stock_quantity": 45,
                "brand": "Tropicana",
                "category": "Beverages",
                "image_url": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b",
            },
            {
                "name": "Coconut Water",
                "description": "Natural and refreshing coconut water.",
                "selling_price": Decimal("60"),
                "original_price": Decimal("70"),
                "quantity": Decimal("500"),
                "unit": "ml",
                "stock_quantity": 60,
                "brand": "FreshFarm",
                "category": "Beverages",
                "image_url": "https://images.unsplash.com/photo-1545281572-96c1c7e6f6e6",
            },
            {
                "name": "Fresh Green Capsicum",
                "description": "Crisp and fresh green capsicum.",
                "selling_price": Decimal("80"),
                "original_price": Decimal("95"),
                "quantity": Decimal("500"),
                "unit": "g",
                "stock_quantity": 50,
                "brand": "FreshFarm",
                "category": "Vegetables",
                "image_url": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83",
            },
            {
                "name": "Fresh Broccoli",
                "description": "Fresh green broccoli florets.",
                "selling_price": Decimal("90"),
                "original_price": Decimal("110"),
                "quantity": Decimal("500"),
                "unit": "g",
                "stock_quantity": 40,
                "brand": "FreshFarm",
                "category": "Vegetables",
                "image_url": "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc",
            },
        ]

        created = 0
        skipped = 0

        for data in products_data:
            existing = db.query(Product).filter(
                Product.name == data["name"]
            ).first()

            if existing:
                # Backfill the product-category relationship for products
                # that were already inserted by an earlier seed run.
                category = categories[data["category"]]
                existing_link = db.query(ProductCategory).filter(
                    ProductCategory.product_id == existing.product_id,
                    ProductCategory.category_id == category.category_id,
                ).first()
                if not existing_link:
                    db.add(ProductCategory(
                        product_id=existing.product_id,
                        category_id=category.category_id,
                    ))
                skipped += 1
                continue

            product = Product(
                name=data["name"],
                description=data["description"],
                selling_price=data["selling_price"],
                original_price=data["original_price"],
                quantity=data["quantity"],
                unit=data["unit"],
                stock_quantity=data["stock_quantity"],
                brand_id=brands[data["brand"]].brand_id,
                image_url=data["image_url"],
                is_active=True,
            )

            db.add(product)
            db.flush()

            category = categories[data["category"]]
            db.add(ProductCategory(
                product_id=product.product_id,
                category_id=category.category_id,
            ))

            created += 1

        db.commit()

        print()
        print("========================================")
        print("VanshiCart seed completed successfully")
        print("========================================")
        print(f"Products created : {created}")
        print(f"Products skipped : {skipped}")
        print(f"Brands available : {len(brands)}")
        print(f"Categories       : {len(categories)}")
        print("========================================")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()