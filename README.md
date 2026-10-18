# TradeX — Institutional Equity Simulation & Portfolio Management Desk

[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js%204-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js%20v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20v6+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Currency](https://img.shields.io/badge/Currency-INR%20(%E2%82%B9)-blue)](https://www.rbi.org.in/)
[![Dual Mode](https://img.shields.io/badge/Architecture-Dual--Mode%20Simulation-purple)](#-dual-mode-operation)
[![Docs](https://img.shields.io/badge/Docs-Technical%20Word%20%26%20MD-orange)](#-technical-documentation-library)

TradeX is an institutional-grade stock trading simulation and virtual portfolio management platform. Engineered with a modular 3-tier architecture and strict Model-View-Controller (MVC) separation, TradeX empowers retail traders, students, and financial analysts to experience live financial markets, execute buy/sell orders with weighted-average cost basis accounting, track multi-asset portfolios, and analyze historical performance with zero financial risk.

---

## 🏛️ System Architecture

TradeX is designed around a clean 3-tier architecture separating concerns between presentation, business logic orchestration, and data persistence:

```mermaid
graph TB
    subgraph ClientTier ["Presentation Layer (Client)"]
        UI["React SPA & Vite Desk<br/>• Trading Dashboard<br/>• Real-Time Candlestick Charts<br/>• Portfolio Analytics & Ledger<br/>• Admin Surveillance Console"]
        AxiosClient["Axios HTTP / Interceptors"]
        DemoStore["In-Browser High-Fidelity Demo Store<br/>(LocalStorage Fallback)"]
        UI --> AxiosClient
        UI -.-> DemoStore
    end

    subgraph ServerTier ["Application & API Layer (Node / Express)"]
        HealthEndpoint["GET /api/health"]
        AuthMid["JWT Auth Middleware"]
        UserController["User Controller<br/>(Auth, Reset Password, Directory)"]
        StockController["Stock Controller<br/>(Weighted-Avg Buy, Sell, Holdings)"]
        OrderController["Order Controller<br/>(Execution Audit Trail)"]
        TxController["Transaction Controller<br/>(Cash Wallet Deposits & Withdrawals)"]
        
        AxiosClient --> HealthEndpoint
        AxiosClient --> AuthMid
        AuthMid --> UserController
        AuthMid --> StockController
        AuthMid --> OrderController
        AuthMid --> TxController
    end

    subgraph DataTier ["Persistence Layer (Database)"]
        MongooseODM["Mongoose ODM (Schemas & Models)"]
        MongoDB[(MongoDB Cluster<br/>users | stocks | orders | transactions)]
        
        UserController --> MongooseODM
        StockController --> MongooseODM
        OrderController --> MongooseODM
        TxController --> MongooseODM
        MongooseODM --> MongoDB
    end

    classDef fe fill:#e8f4fd,stroke:#2196f3,stroke-width:2px,color:#0d47a1;
    classDef be fill:#fde8e8,stroke:#f44336,stroke-width:2px,color:#b71c1c;
    classDef db fill:#e8f8f0,stroke:#4caf50,stroke-width:2px,color:#1b5e20;

    class ClientTier,UI,AxiosClient,DemoStore fe;
    class ServerTier,HealthEndpoint,AuthMid,UserController,StockController,OrderController,TxController be;
    class DataTier,MongooseODM,MongoDB db;
```

---

## ⚡ Dual-Mode Operation

TradeX features an industry-leading **Dual-Mode Engine** that ensures 100% operational readiness across all environments:

| Feature | Live Full-Stack MERN Mode | In-Browser High-Fidelity Demo Mode |
| :--- | :--- | :--- |
| **Primary Use Case** | Production deployment, multi-user persistence | Zero-setup demonstrations, offline testing, student labs |
| **Backend Required** | Express.js & Node.js on `localhost:5000` | None (Client runs entirely standalone) |
| **Database Required** | MongoDB server or MongoDB Atlas | None (Client uses structured reactive LocalStorage) |
| **Starting Capital** | Configurable per user (`₹500` default registered) | `₹25,000` (Customer) / `₹100,000` (Admin) |
| **Execution Speed** | Real HTTP roundtrip with database indexing | Sub-millisecond instant in-memory execution |
| **Reset Capability** | Database re-seeding script | One-click **"Reset Demo"** button in Navbar dropdown |

> [!TIP]
> If MongoDB is temporarily offline or disconnected, the TradeX frontend automatically alerts the user and smoothly routes operations through the high-fidelity demo store without crashing or freezing.

---

## 🌟 Core Platform Features

### 1. 📈 Real-Time Market Feeds Under ₹5,000
- All platform equities and cryptocurrencies are modeled in **Indian Rupees (₹ INR)** and strictly priced **under ₹5,000** for realistic retail capital allocation.
- Includes blue-chip equities (`TATASTEEL`, `INFY`, `RELIANCE`, `ITC`, `HDFCBANK`) and liquid crypto tokens (`DOGE`, `XRP`, `ADA`).
- Dynamic price oscillation simulating real market volatility with realistic bid-ask movements.

### 2. 📊 Interactive Candlestick & Area Charts
- Live interactive charts with multi-timeframe views (`1D`, `1W`, `1M`, `1Y`).
- Real-time high, low, open, close, and volume display.
- Dynamic color-coding for bullish (green) and bearish (red) trends.

### 3. 🎯 Institutional Weighted-Average Cost Basis Accounting
- When multiple lots of an equity are purchased at fluctuating prices, TradeX automatically computes the exact weighted-average unit cost:
  $$\text{New Average Price} = \frac{(\text{Current Holdings} \times \text{Average Cost}) + (\text{New Units} \times \text{Execution Price})}{\text{Total Units}}$$
- Prevents price distortion and accurately computes realized and unrealized profit and loss (P&L).

### 4. 💼 Virtual Portfolio & P&L Analytics
- Detailed breakdown of all active stock and crypto holdings.
- Real-time calculation of Current Value, Investment Cost, Total Return, and Unrealized P&L percentage.
- Single-click liquidation and rebalancing controls.

### 5. 💳 Cash Wallet & Transaction Ledger
- Instant simulated cash deposits and withdrawals via simulated UPI / Net Banking.
- Real-time balance updates across all open views without requiring page reloads.
- Double-entry transaction logging preserving full financial audit trails.

### 6. 🛡️ Admin Market Surveillance
- Platform-wide equity pool monitoring displaying total circulating shares, platform valuation, and holder distribution.
- Complete visibility into all registered user accounts and cumulative order books.
- Ability to audit transactions and investigate irregular activity.

### 7. 🔐 6-Digit OTP Password Recovery
- Integrated Two-Phase Password Reset workflow:
  - **Phase 1**: Request 6-digit verification code sent to registered email address (with 15-minute expiration).
  - **Phase 2**: Verify OTP and securely update password with bcrypt salt encryption.

---

## 📚 Technical Documentation Library

TradeX provides a complete suite of executive technical documentation available in both GitHub Markdown (`.md`) format and professionally formatted Microsoft Word (`.docx`) files:

| Specification Document | Markdown Version | Formatted Word Document (.docx) | Summary |
| :--- | :--- | :--- | :--- |
| **System Architecture Specification** | [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | [`ARCHITECTURE.docx`](docs/ARCHITECTURE.docx) | 3-tier blueprint, security models, data flows, communication protocols |
| **Entity Relationship Diagrams** | [`ER_DIAGRAMS.md`](docs/ER_DIAGRAMS.md) | [`ER_DIAGRAMS.docx`](docs/ER_DIAGRAMS.docx) | MongoDB schemas, field definitions, indexing rules, relationships |
| **Core Features Specification** | [`FEATURES.md`](docs/FEATURES.md) | [`FEATURES.docx`](docs/FEATURES.docx) | Detailed breakdown of trading, wallet, charting, and admin capabilities |
| **MVC Pattern & Data Flow** | [`MVC_PATTERN.md`](docs/MVC_PATTERN.md) | [`MVC_PATTERN.docx`](docs/MVC_PATTERN.docx) | Model-View-Controller responsibilities, request lifecycle, controller patterns |
| **End-to-End User Flow Guide** | [`USER_FLOW.md`](docs/USER_FLOW.md) | [`USER_FLOW.docx`](docs/USER_FLOW.docx) | 9-step customer and admin journey from onboarding to execution |

> [!NOTE]
> All Word documents (`.docx`) include embedded high-resolution diagrams, custom-styled executive tables, color-coded callout blocks, and syntax-highlighted code containers generated via `python-docx`.

---

## 🔌 REST API Reference

The TradeX backend exposes a structured, RESTful API organized by domain controller:

| Method | Endpoint | Access Level | Description | Key Request / Response Parameters |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server connectivity and uptime check | `{ status: "healthy", uptime: 120.5 }` |
| `POST` | `/register` | Public | Create new customer account | Body: `{ username, email, password, usertype }` |
| `POST` | `/login` | Public | Authenticate user & issue JWT | Body: `{ email, password }` $\rightarrow$ sets HTTP cookie |
| `POST` | `/reset-password` | Public | Two-phase OTP request & password reset | Phase 1: `{ email }`<br/>Phase 2: `{ email, otp, newPassword }` |
| `GET` | `/logout` | Authenticated | Terminate session & clear cookie | Clears `token` cookie |
| `GET` | `/fetch-user/:id` | Authenticated | Retrieve user profile & current balance | Returns `User` object without password |
| `GET` | `/fetch-users` | Admin | Retrieve directory of all platform users | Returns array of `User` objects |
| `POST` | `/buyStock` | Authenticated | Execute market buy order with weighted avg | Body: `{ user, symbol, name, price, count, totalPrice, stockExchange }` |
| `POST` | `/sellStock` | Authenticated | Execute market sell order (partial/full) | Body: `{ user, symbol, name, price, count, totalPrice }` |
| `GET` | `/fetch-stocks` | Authenticated | Fetch active stock holdings across platform | Returns array of `Stock` objects |
| `POST` | `/newTransaction` | Authenticated | Record cash deposit or withdrawal | Body: `{ user, type: "Deposit"\|"Withdraw", amount, paymentMode }` |
| `GET` | `/fetch-transactions` | Authenticated | Fetch historical transaction ledger | Returns array of `Transaction` records |
| `GET` | `/fetch-orders` | Authenticated | Fetch orders executed by authenticated user | Returns array of `Order` records |
| `GET` | `/all-orders` | Admin | Global audit trail of all platform orders | Returns array of all executed orders |

---

## 🔑 Pre-Configured Demo Credentials

TradeX includes pre-configured, auto-seeding credentials for instant evaluation in both Live MERN and Demo modes:

| Role | Email Address | Password | Default Capital | Desk Access |
| :--- | :--- | :--- | :--- | :--- |
| **Customer Trader** | `demo@tradex.com` | `password123` | ₹25,000.00 | Trading Desk, Live Charts, Portfolio, History, Wallet |
| **Platform Administrator** | `admin@tradex.com` | `admin123` | ₹100,000.00 | Market Surveillance, Platform Equity Pool, User Directory, Global Ledger |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python** (optional, for regenerating Word docs): Python 3.9+ with `python-docx`
- **MongoDB** (optional for Live Mode): MongoDB v6.0+ local daemon or MongoDB Atlas URI

### Quick Start (Option A: Instant Demo Mode — Zero Config)
To run TradeX immediately in standalone In-Browser Demo Mode without running MongoDB:
```bash
# 1. Clone repository
git clone https://github.com/Vomkar2024/TradeX-demo.git
cd TradeX-demo

# 2. Install client dependencies and launch Vite
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Click **"Try Demo Mode"** or **"Claim ₹25,000 Demo Account"** to immediately start trading!

---

### Quick Start (Option B: Full-Stack MERN Mode)
To run the full stack with Express API server, JWT authentication, and MongoDB persistence:

#### 1. Setup Environment Variables
Create or verify `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/Stocks
JWT_SECRET=tradex_institutional_secret_jwt_key_2026
ADMIN_JWT_SECRET=tradex_admin_secret_jwt_key_2026
```

#### 2. Start the Backend API Server
```bash
cd server
npm install
npm start
```
*The server will start on `http://localhost:5000` and automatically seed the demo accounts if connected to MongoDB.*

#### 3. Start the Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). Sign in with `demo@tradex.com` / `password123` or create a new custom account.

---

## 🛠️ Automated Word Document Conversion

To re-generate all Word documents (`.docx`) from the markdown specifications in `docs/`:
```bash
# From workspace root
python scripts/convert_docs_to_docx.py
```
This script will parse all headings, tables, code blocks, diagrams, and callouts, generating styled executive documents in `docs/`.

---

## 🧪 Verification & Health Checks

Verify your installation with the following test commands:

```bash
# 1. Server Syntax Verification
node -c server/index.js
node -c server/controllers/userController.js
node -c server/controllers/stockController.js
node -c server/controllers/transactionController.js
node -c server/middlewares/authMiddleware.js

# 2. Client Production Build Test
npm --prefix client run build

# 3. Server Health Endpoint Test (when server is running)
curl http://localhost:5000/api/health
```

---

## 📄 License
This project is licensed under the MIT License. Built for educational and institutional financial simulations.