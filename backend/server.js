const express = require("express");
const app = express();
const PORT = 5000;

// Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", true);

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

// Mock user data
const users = [
  {
    id: 1,
    email: "admin@example.com",
    password: "password123",
    name: "Admin User",
  },
  {
    id: 2,
    email: "user@example.com",
    password: "password456",
    name: "Regular User",
  },
];

// ✅ In-memory product data
let products = [
  {
    _id: "1",
    name: "Product A",
    quantity: 100,
    price: 25.99,
    productCode: "A001",
  },
  {
    _id: "2",
    name: "Product B",
    quantity: 50,
    price: 15.5,
    productCode: "B002",
  },
  {
    _id: "3",
    name: "Product C",
    quantity: 75,
    price: 30.0,
    productCode: "C003",
  },
];

// ✅ In-memory transaction history
const transactions = [];

// Auth Endpoints
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user)
    return res.status(401).json({ message: "Invalid email or password" });

  const token = `mock-token-${user.id}-${Date.now()}`;
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ message: "All fields are required" });

  const exists = users.find((u) => u.email === email);
  if (exists) return res.status(409).json({ message: "User already exists" });

  const newUser = {
    id: users.length + 1,
    email,
    password,
    name,
  };
  users.push(newUser);
  const token = `mock-token-${newUser.id}-${Date.now()}`;
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword, token });
});

// ✅ GET products (this matches Billing.js)
app.get("/api/products", (req, res) => {
  res.json(products);
});

// ✅ POST product (add new)
app.post("/api/products", (req, res) => {
  const { name, quantity, price, productCode } = req.body;
  const newProduct = {
    _id: Date.now().toString(),
    name,
    quantity: parseInt(quantity),
    price: parseFloat(price),
    productCode: productCode || `P${Date.now()}`,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// ✅ POST transaction (checkout)
app.post("/api/transactions", (req, res) => {
  const { customerInfo, items, subtotal, tax, total, invoiceNumber } = req.body;
  if (!customerInfo || !items || !subtotal || !total || !invoiceNumber)
    return res.status(400).json({ message: "Incomplete transaction data" });

  // Reduce stock quantities
  items.forEach(({ _id, quantity }) => {
    const product = products.find((p) => p._id === _id);
    if (product) {
      product.quantity = Math.max(product.quantity - quantity, 0);
    }
  });

  const newTransaction = {
    _id: Date.now().toString(),
    customerInfo,
    items,
    subtotal,
    tax,
    total,
    invoiceNumber,
    createdAt: new Date(),
  };

  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// ✅ GET transaction history
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

// ✅ Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
