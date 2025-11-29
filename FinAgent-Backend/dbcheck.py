import os
from dotenv import load_dotenv

load_dotenv()   # ensures .env is read
print("DATABASE_URL ->", os.getenv("DATABASE_URL"))