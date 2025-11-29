# main.py (drop into project root; rename previous app.py)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_models
from app.routers import (
    auth_router,
    users_router,
    transactions_router,
    budgets_router,
    goals_router,
    advisor_router
)
from app.routers import advisor

app = FastAPI(title="FinAgent Backend")

# DEV: permissive CORS (replace or restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_models()

@app.get("/")
def home():
    return {"message": "backend running"}

app.include_router(auth_router)
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(transactions_router)
app.include_router(budgets_router)
app.include_router(goals_router)
app.include_router(advisor_router)
