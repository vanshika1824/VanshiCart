from fastapi import FastAPI

app = FastAPI(
    title="VanshiCart API",
    version="1.0.0",
    description="AI-powered Grocery Shopping Platform"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to VanshiCart 🚀"
    }