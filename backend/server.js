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

// Mock user data (replace with database in production)
const users = [
  {
    id: 1,
    email: "admin@example.com",
    password: "password123", // In production, use hashed passwords
    name: "Admin User",
  },
  {
    id: 2,
    email: "user@example.com",
    password: "password456",
    name: "Regular User",
  },
];

// Login endpoint
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Find user
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate mock token (use JWT in production)
  const token = `mock-token-${user.id}-${Date.now()}`;

  // Return user data (exclude password)
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    user: userWithoutPassword,
    token: token,
  });
});

// Register endpoint
app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;

  // Validate input
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, password, and name are required" });
  }

  // Check if user already exists
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    email,
    password, // In production, hash the password
    name,
  };

  users.push(newUser);

  // Generate token
  const token = `mock-token-${newUser.id}-${Date.now()}`;

  // Return user data (exclude password)
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    user: userWithoutPassword,
    token: token,
  });
});

// Stock management endpoints (basic examples)
app.get("/api/stock", (req, res) => {
  // Mock stock data
  res.json([
    { id: 1, name: "Product A", quantity: 100, price: 25.99 },
    { id: 2, name: "Product B", quantity: 50, price: 15.5 },
    { id: 3, name: "Product C", quantity: 75, price: 30.0 },
  ]);
});

app.post("/api/stock", (req, res) => {
  const { name, quantity, price } = req.body;

  const newItem = {
    id: Date.now(), // Simple ID generation
    name,
    quantity: parseInt(quantity),
    price: parseFloat(price),
  };

  res.status(201).json(newItem);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("- POST /api/auth/login");
  console.log("- POST /api/auth/register");
  console.log("- GET /api/stock");
  console.log("- POST /api/stock");
  console.log("- GET /api/health");
});
