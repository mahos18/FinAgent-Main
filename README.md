# 🚀 FinAgent - AI-Powered Personal Finance Manager

<div align="center">


[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)


**Transform your financial life with intelligent insights powered by Agentic AI**

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## 📱 Overview

**FinAgent** is a cutting-edge personal finance management application that leverages Agentic AI to provide intelligent financial insights, automated transaction tracking, and personalized budgeting advice. Built with modern technologies and designed for scalability.

### ✨ Key Highlights

- 🤖 **AI-Powered Advisor** - Chat with your personal finance assistant powered by LangGraph
- 📊 **Smart Analytics** - Real-time spending insights and budget tracking
- 💳 **Multi-Source Sync** - Import from SMS, CSV, and manual entry
- 🔔 **Live Updates** - WebSocket-powered real-time notifications
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode support
- 🔒 **Secure & Private** - Bank-grade security with JWT authentication

---

## 🎯 Features

### 💰 Financial Management
- **Transaction Tracking** - Automatic categorization and deduplication
- **Budget Planning** - Set limits, track spending, get alerts
- **Expense Analytics** - Visual insights into spending patterns
- **CSV Import** - Bulk upload bank statements with smart parsing

### 🤖 Agentic AI Capabilities
- **Conversational Advisor** - Ask questions about your finances in natural language
- **Smart Insights** - AI-generated recommendations based on spending habits
- **Predictive Analysis** - Forecast future expenses and suggest optimizations
- **Context-Aware Responses** - ChromaDB-powered semantic search for relevant insights

### 🔄 Automation
- **SMS Parsing** - Extract transactions from banking SMS (mock implementation)
- **Background Processing** - Celery workers for heavy tasks
- **Real-time Sync** - WebSocket updates across all devices
- **Smart Notifications** - Push alerts for important financial events

---

## 🏗️ Architecture

### Frontend Stack
```
📱 Expo (React Native) + TypeScript
├─ 🎭 Redux Toolkit - State Management
├─ 🧭 React Navigation - Routing
├─ 🎨 React Native Paper - UI Components
└─ 🔌 WebSocket Client - Real-time Updates
```

### Backend Stack
```
⚡ FastAPI + Python 3.11+
├─ 🐘 PostgreSQL - Primary Database
├─ 🔴 Redis - Caching & Queue
├─ 🦙 LangGraph - AI Agent Pipeline
├─ 📚 ChromaDB - Vector Database
├─ 🔧 Celery - Background Workers
└─ 🔌 WebSocket Manager - Real-time Push
```

### Data Flow Architecture

#### 📥 CSV Upload Flow
```
Expo App → FastAPI → Redis Queue → Worker
                            ↓
                    Parse & Normalize
                            ↓
                    PostgreSQL Insert
                            ↓
                    WebSocket Push → Expo
```

#### 💬 Agentic AI Advisor Flow
```
User Query → FastAPI → Create Embedding
                            ↓
                    ChromaDB Search
                            ↓
                    LangGraph Pipeline
                    ├─ Intent Classifier
                    ├─ Tool Router
                    ├─ Reflection Agent
                    └─ Response Generator
                            ↓
                    Stream Response → Expo
```

#### 📱 SMS Mock Flow
```
SMS Parser → Batch JSON → FastAPI Validation
                                ↓
                        Transaction Insert
                                ↓
                        Budget Recalculation
                                ↓
                        WebSocket Notification
```

---

## 📂 Project Structure

### Frontend (Expo)
```
FinAgent/
├─ src/
│  ├─ app/
│  │  ├─ navigation/        # React Navigation setup
│  │  ├─ store/             # Redux store & slices
│  │  │  ├─ slices/
│  │  │  │  ├─ authSlice.ts
│  │  │  │  ├─ transactionsSlice.ts
│  │  │  │  ├─ budgetSlice.ts
│  │  │  │  ├─ advisorSlice.ts
│  │  │  │  └─ profileSlice.ts
│  │  │  └─ thunks/         # Async actions
│  │  ├─ screens/           # Feature screens
│  │  ├─ components/        # Reusable components
│  │  └─ services/          # API & WebSocket clients
│  └─ assets/
│     └─ images/
│        └─ finagent-ui.png
└─ App.tsx
```

### Backend (FastAPI)
```
FinAgent-Backend/
├─ app/
│  ├─ main.py
│  ├─ core/                 # Config & Security
│  ├─ routers/              # API Endpoints
│  │  ├─ auth.py
│  │  ├─ transactions.py
│  │  ├─ advisor.py
│  │  ├─ uploads.py
│  │  └─ notifications.py
│  ├─ services/             # Business Logic
│  │  ├─ chroma_service.py
│  │  ├─ advisor_service.py
│  │  └─ embedding_service.py
│  ├─ models/               # Database Models
│  ├─ schemas/              # Pydantic Schemas
│  ├─ workers/              # Celery Tasks
│  └─ ws/                   # WebSocket Manager
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm/yarn
- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- Expo CLI

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/finagent.git
cd finagent

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### Backend Setup
```bash
cd FinAgent-Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload

# In another terminal, start Celery worker
celery -A app.workers.celery_app worker --loglevel=info
```

### Environment Variables
```env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost/finagent
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
GOOGLE_GEMINI_KEY=your-openai-key
CHROMA_PERSIST_DIR=./chroma_db

# Frontend (app.config.js)
API_URL=http://localhost:8000
WS_URL=ws://localhost:8000/ws
```

---

## 📱 Features Walkthrough

### 1️⃣ **Onboarding & Authentication**
- Secure JWT-based authentication
- SMS consent for transaction scanning
- Personalized setup wizard

### 2️⃣ **Dashboard**
- Real-time balance overview
- Spending trends visualization
- Quick action buttons

### 3️⃣ **Transaction Management**
- View, filter, and search transactions
- Manual entry with smart categorization
- CSV bulk import with progress tracking

### 4️⃣ **Budget Planning**
- Set monthly/category budgets
- Visual progress indicators
- Overspending alerts

### 5️⃣ **AI Financial Advisor**
- Natural language queries
- Context-aware responses
- Actionable recommendations
- Streaming responses for better UX

### 6️⃣ **Profile & Settings**
- Currency preferences
- Theme customization (Light/Dark)
- Notification preferences

---

## 🧠 AI Pipeline Details

### LangGraph Agent Architecture
```
┌─────────────────────────────┐
│   User Query                │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 1. Input Parser Agent       │
│    • Extract intent         │
│    • Identify entities      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 2. Intent Classifier        │
│    • Budget query           │
│    • Transaction search     │
│    • Spending insight       │
│    • General advice         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 3. Tool Router              │
│    ├─ Fetch Transactions    │
│    ├─ Budget Analysis       │
│    ├─ Spending Insight      │
│    └─ ChromaDB Retrieval    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 4. Reflection Agent         │
│    • Validate results       │
│    • Request refinement     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 5. Response Generator (LLM) │
│    • Format output          │
│    • Add explanations       │
│    • Stream to client       │
└─────────────────────────────┘
```

---

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Transactions
- `GET /transactions/` - List transactions
- `POST /transactions/batch` - Bulk insert
- `POST /transactions/manual` - Add single transaction

### Uploads
- `POST /uploads/csv` - Upload bank statement CSV
- `GET /uploads/status/{job_id}` - Check processing status

### AI Advisor
- `POST /advisor/message` - Send query
- `WS /advisor/stream` - Stream responses

### User & Settings
- `GET /users/me` - Get profile
- `PUT /users/preferences` - Update settings
- `GET /notifications/` - List notifications

---

## 🎨 UI Screenshots

> Add screenshots of your app here:
> 
> - Dashboard view
> - <img width="386" height="854" alt="image" src="https://github.com/user-attachments/assets/8b1361b0-8a45-4be0-8e3c-0bbdfed35a3e" />

> - Transaction list
> - <img width="381" height="852" alt="image" src="https://github.com/user-attachments/assets/2d2fa9ce-a628-4962-a718-61e1dc39f19d" />

> - Budget overview
> - <img width="385" height="848" alt="image" src="https://github.com/user-attachments/assets/b7c4ef06-9581-4392-90b3-ba8469b9db57" />

> - AI Advisor chat
> - <img width="383" height="843" alt="image" src="https://github.com/user-attachments/assets/cc01decb-ac71-42d1-aac9-7d803c7426f3" />


---

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
pytest

# E2E tests
npm run test:e2e
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LangGraph** for the AI agent framework
- **Expo** for amazing mobile development experience
- **FastAPI** for the blazing-fast backend framework
- **ChromaDB** for vector storage capabilities



---

<div align="center">

**⭐ Star this repo if you find it helpful! ⭐**

Made with ❤️ by the Ekhakra Team

[⬆ Back to Top](#-finagent---ai-powered-personal-finance-manager)

</div>
