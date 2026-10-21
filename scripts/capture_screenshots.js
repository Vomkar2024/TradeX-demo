const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../assets/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CUSTOMER_DATA = {
  userId: 'demo_cust_101',
  userType: 'customer',
  username: 'Trader',
  email: 'trader@tradex.com',
  balance: '25000',
  isDemoMode: 'true',
  tradex_demo_stocks: JSON.stringify([
    {
      _id: 'demo_stock_1',
      user: 'demo_cust_101',
      symbol: 'TATASTEEL',
      name: 'Tata Steel Limited',
      price: 158.4,
      count: 2,
      totalPrice: 316.8,
      stockExchange: 'NSE',
    },
    {
      _id: 'demo_stock_2',
      user: 'demo_cust_101',
      symbol: 'DOGE',
      name: 'Dogecoin (INR)',
      price: 12.5,
      count: 10,
      totalPrice: 125.0,
      stockExchange: 'Crypto',
    },
  ]),
  tradex_demo_orders: JSON.stringify([
    {
      _id: 'demo_ord_1',
      user: 'demo_cust_101',
      symbol: 'TATASTEEL',
      name: 'Tata Steel Limited',
      stockType: 'Equity',
      price: 158.4,
      count: 2,
      totalPrice: 316.8,
      orderType: 'Buy',
      orderStatus: 'Completed',
      date: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      _id: 'demo_ord_2',
      user: 'demo_cust_101',
      symbol: 'DOGE',
      name: 'Dogecoin (INR)',
      stockType: 'Crypto',
      price: 12.5,
      count: 10,
      totalPrice: 125.0,
      orderType: 'Buy',
      orderStatus: 'Completed',
      date: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ]),
  tradex_demo_transactions: JSON.stringify([
    {
      _id: 'demo_tx_101',
      user: 'demo_cust_101',
      type: 'Deposit',
      paymentMode: 'UPI',
      amount: 25000,
      time: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ]),
};

const ADMIN_ORDERS = [
  {
    _id: 'ord_101',
    user: 'usr_cust_101',
    symbol: 'TATASTEEL',
    name: 'Tata Steel Limited',
    stockType: 'Equity',
    price: 158.4,
    count: 2,
    totalPrice: 316.8,
    orderType: 'Buy',
    orderStatus: 'Completed',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'ord_102',
    user: 'usr_cust_101',
    symbol: 'DOGE',
    name: 'Dogecoin (INR)',
    stockType: 'Crypto',
    price: 12.5,
    count: 10,
    totalPrice: 125.0,
    orderType: 'Buy',
    orderStatus: 'Completed',
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    _id: 'ord_103',
    user: 'usr_sim_01',
    symbol: 'INFY',
    name: 'Infosys Limited',
    stockType: 'Equity',
    price: 1892.4,
    count: 5,
    totalPrice: 9462.0,
    orderType: 'Sell',
    orderStatus: 'Completed',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    _id: 'ord_104',
    user: 'usr_sim_02',
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    stockType: 'Equity',
    price: 2940.5,
    count: 10,
    totalPrice: 29405.0,
    orderType: 'Buy',
    orderStatus: 'Completed',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const ADMIN_TRANSACTIONS = [
  {
    _id: 'tx_101',
    user: 'usr_cust_101',
    type: 'Deposit',
    paymentMode: 'UPI',
    amount: 25000,
    time: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    _id: 'tx_102',
    user: 'usr_sim_01',
    type: 'Deposit',
    paymentMode: 'Net Banking',
    amount: 50000,
    time: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'tx_103',
    user: 'usr_sim_02',
    type: 'Withdraw',
    paymentMode: 'IMPS',
    amount: 15000,
    time: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

const ADMIN_DATA = {
  userId: 'adm_99901',
  userType: 'admin',
  username: 'Administrator',
  email: 'admin@tradex.com',
  balance: '100000',
  isDemoMode: 'true',
  tradex_demo_orders: JSON.stringify(ADMIN_ORDERS),
  tradex_demo_transactions: JSON.stringify(ADMIN_TRANSACTIONS),
};

async function captureAdminScreenshots(page) {
  console.log('--- Capturing Refreshed Admin Screenshots (Zero Demo Mode) ---');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate((data) => {
    localStorage.clear();
    for (const [k, v] of Object.entries(data)) {
      localStorage.setItem(k, v);
    }
  }, ADMIN_DATA);

  // 9. Admin (All Users Directory) - Overwrite 09_admin_users.png
  console.log('[Admin 1/5] Capturing Platform User Directory (/users)...');
  await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle0' });
  await sleep(1800);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, '09_admin_users.png'),
  });

  // 10. Orders (Admin Surveillance Blotter) - Overwrite 10_admin_orders.png
  console.log('[Admin 2/5] Capturing Orders Surveillance Blotter (/all-orders)...');
  await page.goto(`${BASE_URL}/all-orders`, { waitUntil: 'networkidle0' });
  await sleep(1800);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, '10_admin_orders.png'),
  });

  // 11. Admin Dashboard (Market Surveillance)
  console.log('[Admin 3/5] Capturing Admin Market Surveillance Desk (/admin)...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
  await sleep(2200);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, '11_admin_dashboard.png'),
  });

  // 12. Admin Transactions (Treasury & Financial Ledger)
  console.log('[Admin 4/5] Capturing Financial Treasury Ledger (/all-transactions)...');
  await page.goto(`${BASE_URL}/all-transactions`, { waitUntil: 'networkidle0' });
  await sleep(1800);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, '12_admin_transactions.png'),
  });

  // 13. Admin Stock Simulation & Control Desk
  console.log('[Admin 5/5] Capturing Institutional Stock Simulation Desk (/admin-stock/RELIANCE)...');
  await page.goto(`${BASE_URL}/admin-stock/RELIANCE`, { waitUntil: 'networkidle0' });
  await sleep(2200);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, '13_admin_stock_desk.png'),
  });

  console.log('✅ Admin screenshots successfully captured with zero demo traces!');
}

async function captureAll() {
  const isAdminOnly = process.argv.includes('--admin') || process.argv.includes('--admin-only');

  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1.5,
    },
  });

  const page = await browser.newPage();

  try {
    if (isAdminOnly) {
      await captureAdminScreenshots(page);
      return;
    }

    // 1. Landing Page
    console.log('[1/10] Capturing Landing Page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01_landing_page.png'),
    });

    // 2. Registration Page
    console.log('[2/10] Capturing Registration Page...');
    const signInBtn = await page.$('.btn-view-charts-hero');
    if (signInBtn) {
      await signInBtn.click();
      await sleep(500);
    }
    const switchLink = await page.$('.auth-switch-link');
    if (switchLink) {
      await switchLink.click();
      await sleep(800);
    }
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02_registration_page.png'),
    });

    // 3. Login Page
    console.log('[3/10] Capturing Login Page...');
    const switchBackLink = await page.$('.auth-switch-link');
    if (switchBackLink) {
      await switchBackLink.click();
      await sleep(800);
    }
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03_login_page.png'),
    });

    // 4. Home Page (Customer Logged In)
    console.log('[4/10] Capturing Home Page...');
    await page.evaluate((data) => {
      localStorage.clear();
      for (const [k, v] of Object.entries(data)) {
        localStorage.setItem(k, v);
      }
    }, CUSTOMER_DATA);
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle0' });
    await sleep(1800);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '04_home_page.png'),
    });

    // 5. Profile Page (User)
    console.log('[5/10] Capturing Profile Page (User)...');
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle0' });
    await sleep(1200);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '05_profile_page.png'),
    });

    // 6. Stock Chart & Paper Trading Desk
    console.log('[6/10] Capturing Stock Chart...');
    await page.goto(`${BASE_URL}/stock/TATASTEEL`, { waitUntil: 'networkidle0' });
    await sleep(1800);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '06_stock_chart.png'),
    });

    // 7. Portfolio Page
    console.log('[7/10] Capturing Portfolio Page...');
    await page.goto(`${BASE_URL}/portfolio`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '07_portfolio_page.png'),
    });

    // 8. History Page
    console.log('[8/10] Capturing History Page...');
    await page.goto(`${BASE_URL}/history`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '08_history_page.png'),
    });

    // Admin Screenshots
    await captureAdminScreenshots(page);

    console.log('✅ All screenshots successfully captured and saved to:', OUTPUT_DIR);
  } catch (err) {
    console.error('Error during screenshot capture:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureAll();
