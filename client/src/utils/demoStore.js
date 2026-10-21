// TradeX In-Browser Demo Engine
// Provides high-fidelity simulated trading, balances, portfolio holdings, orders, and ledger.

const DEMO_CUSTOMER = {
  _id: "usr_guest_demo",
  username: "Guest Trader",
  email: "guest.demo@tradex.com",
  usertype: "customer",
  balance: 25000,
};

const DEMO_ADMIN = {
  _id: "adm_99901",
  username: "Administrator",
  email: "admin@tradex.com",
  usertype: "admin",
  balance: 100000,
};

const INITIAL_STOCKS = [
  {
    _id: "stk_101",
    user: "usr_cust_101",
    symbol: "TATASTEEL",
    name: "Tata Steel Limited",
    price: 158.40,
    count: 2,
    totalPrice: 316.80,
    stockExchange: "NSE",
  },
  {
    _id: "stk_102",
    user: "usr_cust_101",
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
    _id: "ord_101",
    user: "usr_cust_101",
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
    _id: "ord_102",
    user: "usr_cust_101",
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
  {
    _id: "ord_103",
    user: "usr_sim_01",
    symbol: "INFY",
    name: "Infosys Limited",
    stockType: "Equity",
    price: 1892.40,
    count: 5,
    totalPrice: 9462.00,
    orderType: "Sell",
    orderStatus: "Completed",
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    _id: "ord_104",
    user: "usr_sim_02",
    symbol: "RELIANCE",
    name: "Reliance Industries",
    stockType: "Equity",
    price: 2940.50,
    count: 10,
    totalPrice: 29405.00,
    orderType: "Buy",
    orderStatus: "Completed",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const INITIAL_TRANSACTIONS = [
  {
    _id: "tx_101",
    user: "usr_cust_101",
    type: "Deposit",
    paymentMode: "UPI",
    amount: 25000,
    time: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    _id: "tx_102",
    user: "usr_sim_01",
    type: "Deposit",
    paymentMode: "Net Banking",
    amount: 50000,
    time: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: "tx_103",
    user: "usr_sim_02",
    type: "Withdraw",
    paymentMode: "IMPS",
    amount: 15000,
    time: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

const DEMO_PLATFORM_USERS = [
  {
    _id: "usr_cust_101",
    username: "Active Trader",
    email: "trader@tradex.com",
    usertype: "customer",
    balance: 25000,
  },
  DEMO_ADMIN,
  {
    _id: "usr_sim_01",
    username: "Alex Morgan",
    email: "alex@tradex.com",
    usertype: "customer",
    balance: 34200,
  },
  {
    _id: "usr_sim_02",
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
      const rawUsername = localStorage.getItem("username");
      const rawUserId = localStorage.getItem("userId");
      const rawBalance = localStorage.getItem("balance");

      const rawEmail = localStorage.getItem("email");
      if (rawEmail === "trader@tradex.com" || userType === "admin") {
        localStorage.removeItem("isDemoMode");
      }

      // Auto-sanitize admin session so admin panel never shows "Demo Administrator" or demo IDs
      if (userType === "admin") {
        if (rawUsername === "Demo Administrator" || !rawUsername) {
          localStorage.setItem("username", "Administrator");
        }
        if (rawUserId === "demo_admin_999" || !rawUserId || rawUserId.startsWith("demo_")) {
          localStorage.setItem("userId", "adm_99901");
        }
      }

      // Sanitize cached stocks if they contain demo_ prefixes
      const rawStocks = localStorage.getItem("tradex_demo_stocks");
      if (rawStocks && (rawStocks.includes("demo_cust_101") || rawStocks.includes("demo_stock_"))) {
        const cleanedStocks = rawStocks
          .replace(/demo_cust_101/g, "usr_cust_101")
          .replace(/demo_stock_/g, "stk_");
        localStorage.setItem("tradex_demo_stocks", cleanedStocks);
      }

      // Sanitize cached orders if they contain demo_ prefixes
      const rawOrders = localStorage.getItem("tradex_demo_orders");
      if (rawOrders && (rawOrders.includes("demo_cust_101") || rawOrders.includes("demo_ord_"))) {
        const cleanedOrders = rawOrders
          .replace(/demo_cust_101/g, "usr_cust_101")
          .replace(/demo_ord_/g, "ord_");
        localStorage.setItem("tradex_demo_orders", cleanedOrders);
      }

      // Sanitize cached transactions if they contain demo_ prefixes
      const rawTx = localStorage.getItem("tradex_demo_transactions");
      if (rawTx && (rawTx.includes("demo_cust_101") || rawTx.includes("demo_tx_") || rawTx.includes('"amount":500'))) {
        let cleanedTx = rawTx
          .replace(/demo_cust_101/g, "usr_cust_101")
          .replace(/demo_tx_/g, "tx_");
        if (cleanedTx.includes('"amount":500')) {
          cleanedTx = JSON.stringify(INITIAL_TRANSACTIONS);
        }
        localStorage.setItem("tradex_demo_transactions", cleanedTx);
      }

      // Auto-upgrade demo customer balance to 25,000 if currently set to legacy 500
      if (isDemo && userType === "customer" && (rawBalance === "500" || !rawBalance)) {
        localStorage.setItem("balance", "25000");
        window.dispatchEvent(new CustomEvent("balanceUpdated", { detail: 25000 }));
      }
    } catch (e) {
      console.warn("Demo storage migration error:", e);
    }
  },

  isDemoActive() {
    this.migrateLegacy();
    const email = localStorage.getItem("email");
    const userType = localStorage.getItem("userType");
    if (email === "trader@tradex.com" || userType === "admin") {
      return false;
    }
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
      throw new Error("Insufficient funds in trading account");
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
        _id: "stk_" + Date.now(),
        user,
        symbol,
        name: name || symbol,
        price: Number(price),
        count: Number(count),
        totalPrice: Number(totalPrice),
        stockExchange: stockExchange || "NSE",
      });
    }

    localStorage.setItem("tradex_demo_stocks", JSON.stringify(stocks));

    const newBalance = currentBalance - Number(totalPrice);
    localStorage.setItem("balance", newBalance);
    window.dispatchEvent(new CustomEvent("balanceUpdated", { detail: newBalance }));

    const orders = this.getOrders();
    orders.unshift({
      _id: "ord_" + Date.now(),
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
      _id: "ord_" + Date.now(),
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
        throw new Error("Insufficient balance for withdrawal");
      }
      newBalance = currentBalance - numAmount;
    }

    localStorage.setItem("balance", newBalance);
    window.dispatchEvent(new CustomEvent("balanceUpdated", { detail: newBalance }));

    const txs = this.getTransactions();
    txs.unshift({
      _id: "tx_" + Date.now(),
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
      if (u._id === "usr_cust_101") {
        return { ...u, balance: currentCustBalance };
      }
      return u;
    });
  },
};

export default demoStore;
