// TradeX In-Browser Demo Engine
// Provides high-fidelity simulated trading, balances, portfolio holdings, orders, and ledger.

const DEMO_CUSTOMER = {
  _id: "demo_cust_101",
  username: "Demo Trader",
  email: "demo@tradex.com",
  usertype: "customer",
  balance: 25000,
};

const DEMO_ADMIN = {
  _id: "demo_admin_999",
  username: "Demo Administrator",
  email: "admin@tradex.com",
  usertype: "admin",
  balance: 100000,
};

const INITIAL_STOCKS = [
  {
    _id: "demo_stock_1",
    user: "demo_cust_101",
    symbol: "TATASTEEL",
    name: "Tata Steel Limited",
    price: 158.40,
    count: 2,
    totalPrice: 316.80,
    stockExchange: "NSE",
  },
  {
    _id: "demo_stock_2",
    user: "demo_cust_101",
    symbol: "DOGE",
    name: "Dogecoin (INR)",
    price: 12.50,
    count: 10,
    totalPrice: 125.00,
    stockExchange: "Crypto",
  },
];

const INITIAL_ORDERS = [
  {
    _id: "demo_ord_1",
    user: "demo_cust_101",
    symbol: "TATASTEEL",
    name: "Tata Steel Limited",
    stockType: "Equity",
    price: 158.40,
    count: 2,
    totalPrice: 316.80,
    orderType: "Buy",
    orderStatus: "Completed",
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: "demo_ord_2",
    user: "demo_cust_101",
    symbol: "DOGE",
    name: "Dogecoin (INR)",
    stockType: "Crypto",
    price: 12.50,
    count: 10,
    totalPrice: 125.00,
    orderType: "Buy",
    orderStatus: "Completed",
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

const INITIAL_TRANSACTIONS = [
  {
    _id: "demo_tx_101",
    user: "demo_cust_101",
    type: "Deposit",
    paymentMode: "UPI",
    amount: 25000,
    time: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

const DEMO_PLATFORM_USERS = [
  DEMO_CUSTOMER,
  DEMO_ADMIN,
  {
    _id: "user_sim_01",
    username: "Alex Morgan",
    email: "alex@tradex.com",
    usertype: "customer",
    balance: 34200,
  },
  {
    _id: "user_sim_02",
    username: "Jordan Hayes",
    email: "jordan@tradex.com",
    usertype: "customer",
    balance: 89150,
  },
];

export const demoStore = {
  migrateLegacy() {
    try {
      const isDemo = localStorage.getItem("isDemoMode") === "true";
      const userType = localStorage.getItem("userType") || "customer";
      const rawBalance = localStorage.getItem("balance");
      const rawTx = localStorage.getItem("tradex_demo_transactions");

      // Auto-upgrade demo customer balance to 25,000 if currently set to legacy 500
      if (isDemo && userType === "customer" && (rawBalance === "500" || !rawBalance)) {
        localStorage.setItem("balance", "25000");
        window.dispatchEvent(new CustomEvent("balanceUpdated", { detail: 25000 }));
        if (rawTx && rawTx.includes('"amount":500')) {
          localStorage.setItem("tradex_demo_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
        }
      }
    } catch (e) {
      console.warn("Demo storage migration error:", e);
    }
  },

  isDemoActive() {
    this.migrateLegacy();
    return localStorage.getItem("isDemoMode") === "true";
  },

  initDemo(role = "customer") {
    const isCustomer = role === "customer";
    const user = isCustomer ? DEMO_CUSTOMER : DEMO_ADMIN;

    localStorage.setItem("userId", user._id);
    localStorage.setItem("userType", user.usertype);
    localStorage.setItem("username", user.username);
    localStorage.setItem("email", user.email);
    localStorage.setItem("balance", user.balance);
    localStorage.setItem("isDemoMode", "true");

    this.migrateLegacy();

    if (!localStorage.getItem("tradex_demo_stocks")) {
      localStorage.setItem("tradex_demo_stocks", JSON.stringify(INITIAL_STOCKS));
    }
    if (!localStorage.getItem("tradex_demo_orders")) {
      localStorage.setItem("tradex_demo_orders", JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem("tradex_demo_transactions")) {
      localStorage.setItem("tradex_demo_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
    }

    return user;
  },

  resetDemo() {
    const currentRole = localStorage.getItem("userType") || "customer";
    const user = currentRole === "admin" ? DEMO_ADMIN : DEMO_CUSTOMER;

    localStorage.setItem("userId", user._id);
    localStorage.setItem("userType", user.usertype);
    localStorage.setItem("username", user.username);
    localStorage.setItem("email", user.email);
    localStorage.setItem("balance", user.balance);
    localStorage.setItem("isDemoMode", "true");

    localStorage.setItem("tradex_demo_stocks", JSON.stringify(INITIAL_STOCKS));
    localStorage.setItem("tradex_demo_orders", JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem("tradex_demo_transactions", JSON.stringify(INITIAL_TRANSACTIONS));

    window.dispatchEvent(new CustomEvent("balanceUpdated", { detail: user.balance }));

    return user;
  },

  getStocks() {
    this.migrateLegacy();
    try {
      const data = localStorage.getItem("tradex_demo_stocks");
      return data ? JSON.parse(data) : INITIAL_STOCKS;
    } catch {
      return INITIAL_STOCKS;
    }
  },

  buyStock(payload) {
    const { user, symbol, name, stockExchange, price, count, totalPrice, stockType } = payload;
    const stocks = this.getStocks();
    const currentBalance = Number(localStorage.getItem("balance") || 0);

    if (currentBalance < Number(totalPrice)) {
      throw new Error("Insufficient funds in demo account");
    }

    const existingIndex = stocks.findIndex((s) => s.symbol === symbol && s.user === user);

    if (existingIndex > -1) {
      const existing = stocks[existingIndex];
      const newCount = Number(existing.count) + Number(count);
      const newTotalPrice = Number(existing.totalPrice) + Number(totalPrice);
      const avgPrice = newTotalPrice / newCount;

      stocks[existingIndex] = {
        ...existing,
        count: newCount,
        price: avgPrice,
        totalPrice: newTotalPrice,
      };
    } else {
      stocks.push({
        _id: "demo_stock_" + Date.now(),
        user,
        symbol,
        name: name || symbol,
        price: Number(price),
        count: Number(count),
        totalPrice: Number(totalPrice),
        stockExchange: stockExchange || "NASDAQ",
      });
    }

    localStorage.setItem("tradex_demo_stocks", JSON.stringify(stocks));

    const newBalance = currentBalance - Number(totalPrice);
    localStorage.setItem("balance", newBalance);
    window.dispatchEvent(new CustomEvent("balanceUpdated", { detail: newBalance }));

    const orders = this.getOrders();
    orders.unshift({
      _id: "demo_ord_" + Date.now(),
      user,
      symbol,
      name: name || symbol,
      stockType: stockType || "Equity",
      price: Number(price),
      count: Number(count),
      totalPrice: Number(totalPrice),
      orderType: "Buy",
      orderStatus: "Completed",
      date: new Date().toISOString(),
    });
    localStorage.setItem("tradex_demo_orders", JSON.stringify(orders));

    return { message: "success", balance: newBalance };
  },

  sellStock(payload) {
    const { user, symbol, count, totalPrice, stockType, name, price } = payload;
    const stocks = this.getStocks();
    const currentBalance = Number(localStorage.getItem("balance") || 0);

    const stockIndex = stocks.findIndex((s) => s.symbol === symbol && s.user === user);
    if (stockIndex === -1) {
      throw new Error("No stocks found to sell");
    }

    const targetStock = stocks[stockIndex];
    const sellCount = Number(count);

    if (targetStock.count < sellCount) {
      throw new Error("Cannot sell more shares than currently held");
    }

    if (targetStock.count === sellCount) {
      stocks.splice(stockIndex, 1);
    } else {
      const remainingCount = targetStock.count - sellCount;
      const remainingTotal = Number(targetStock.totalPrice) - Number(totalPrice);
      stocks[stockIndex] = {
        ...targetStock,
        count: remainingCount,
        totalPrice: remainingTotal,
      };
    }

    localStorage.setItem("tradex_demo_stocks", JSON.stringify(stocks));

    const newBalance = currentBalance + Number(totalPrice);
    localStorage.setItem("balance", newBalance);
    window.dispatchEvent(new CustomEvent("balanceUpdated", { detail: newBalance }));

    const orders = this.getOrders();
    orders.unshift({
      _id: "demo_ord_" + Date.now(),
      user,
      symbol,
      name: name || targetStock.name || symbol,
      stockType: stockType || "Equity",
      price: Number(price || targetStock.price),
      count: sellCount,
      totalPrice: Number(totalPrice),
      orderType: "Sell",
      orderStatus: "Completed",
      date: new Date().toISOString(),
    });
    localStorage.setItem("tradex_demo_orders", JSON.stringify(orders));

    return { message: "success", balance: newBalance };
  },

  getOrders() {
    this.migrateLegacy();
    try {
      const data = localStorage.getItem("tradex_demo_orders");
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },

  getTransactions() {
    try {
      const data = localStorage.getItem("tradex_demo_transactions");
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  newTransaction(payload) {
    const { user, type, paymentMode, amount } = payload;
    const currentBalance = Number(localStorage.getItem("balance") || 0);
    const numAmount = Number(amount);

    let newBalance = currentBalance;
    if (type.toLowerCase() === "deposit") {
      newBalance = currentBalance + numAmount;
    } else if (type.toLowerCase() === "withdraw") {
      if (currentBalance < numAmount) {
        throw new Error("Insufficient demo balance for withdrawal");
      }
      newBalance = currentBalance - numAmount;
    }

    localStorage.setItem("balance", newBalance);
    window.dispatchEvent(new CustomEvent("balanceUpdated", { detail: newBalance }));

    const txs = this.getTransactions();
    txs.unshift({
      _id: "demo_tx_" + Date.now(),
      user,
      type,
      paymentMode: paymentMode || "Net Banking",
      amount: numAmount,
      time: new Date().toISOString(),
    });
    localStorage.setItem("tradex_demo_transactions", JSON.stringify(txs));

    return { message: "success", balance: newBalance };
  },

  getUser(userId) {
    const isCustomer = localStorage.getItem("userType") !== "admin";
    const user = isCustomer ? { ...DEMO_CUSTOMER } : { ...DEMO_ADMIN };
    user.balance = Number(localStorage.getItem("balance") || user.balance);
    return user;
  },

  getAllUsers() {
    const currentCustBalance = Number(localStorage.getItem("balance") || 25000);
    return DEMO_PLATFORM_USERS.map((u) => {
      if (u._id === DEMO_CUSTOMER._id) {
        return { ...u, balance: currentCustBalance };
      }
      return u;
    });
  },
};

export default demoStore;
