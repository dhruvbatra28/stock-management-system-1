import React, { useState, useEffect, useRef } from "react";

import "../styles/Billing.css";

function Billing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const billRef = useRef();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      setError("Error loading products. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactionHistory(data);
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTransactionHistory();

    // Generate unique invoice number
    const date = new Date();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setInvoiceNumber(
      `INV-${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date
        .getDate()
        .toString()
        .padStart(2, "0")}-${randomNum}`
    );
  }, []);

  const filteredProducts = searchTerm
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item._id === product._id);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        { ...product, quantity: 1, total: product.price },
      ]);
    }
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const product = products.find((p) => p._id === productId);
    if (newQuantity > product.quantity) {
      setError(`Only ${product.quantity} units available in stock`);
      return;
    }

    setError("");
    setCartItems(
      cartItems.map((item) =>
        item._id === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item._id !== productId));
  };

  // const handlePrint = useReactToPrint({
  //content: () => billRef.current,
  // });

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // if we need to do tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const resetForm = () => {
    setCartItems([]);
    setCustomerInfo({
      name: "",
      email: "",
      phone: "",
    });
    setError("");
    setSuccess("");

    // Generate new invoice number
    const date = new Date();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setInvoiceNumber(
      `INV-${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date
        .getDate()
        .toString()
        .padStart(2, "0")}-${randomNum}`
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!customerInfo.name) {
      setError("Please provide customer name");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerInfo,
          items: cartItems,
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          total: calculateTotal(),
          invoiceNumber,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess("Transaction completed successfully!");
        fetchProducts(); // Refresh products to update stock
        fetchTransactionHistory(); // Refresh transaction history
        setTimeout(() => {
          // handlePrint();
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to complete transaction");
      }
    } catch (error) {
      setError("Error processing transaction. Please try again.");
      console.error("Error:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="billing-container">
      <h1>Billing & Checkout</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="billing-layout">
        <div className="products-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchTerm && (
            <div className="search-results">
              {loading ? (
                <p>Loading products...</p>
              ) : filteredProducts.length > 0 ? (
                <ul className="product-list">
                  {filteredProducts.map((product) => (
                    <li key={product._id} className="product-item">
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p> Price: ${product.price.toFixed(2)}</p>
                        <p>In Stock: {product.quantity}</p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.quantity < 1}
                      >
                        Add to Cart
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No products found.</p>
              )}
            </div>
          )}

          <div className="transaction-history">
            <h2 onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? "Hide" : "Show"} Transaction History
            </h2>

            {showHistory && (
              <div className="history-list">
                {transactionHistory.length > 0 ? (
                  transactionHistory.map((transaction) => (
                    <div key={transaction._id} className="history-item">
                      <h3>Invoice #{transaction.invoiceNumber}</h3>
                      <p>Customer: {transaction.customerInfo.name}</p>
                      <p>Date: {formatDate(transaction.createdAt)}</p>
                      <p>Total: ${transaction.total.toFixed(2)}</p>
                      <p>Items: {transaction.items.length}</p>
                    </div>
                  ))
                ) : (
                  <p>No transaction history available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="cart-section">
          <h2>Customer Information</h2>
          <div className="customer-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
              />
            </div>
          </div>

          <h2>Cart Items</h2>
          {cartItems.length > 0 ? (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="item-controls">
                    <button
                      onClick={() =>
                        updateCartItemQuantity(item._id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateCartItemQuantity(item._id, item.quantity + 1)
                      }
                      disabled={
                        item.quantity >=
                        products.find((p) => p._id === item._id).quantity
                      }
                    >
                      +
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="item-total">${item.total.toFixed(2)}</div>
                </div>
              ))}

              <div className="cart-summary">
                <div className="summary-item">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Tax (10%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-actions">
                <button className="checkout-btn" onClick={handleCheckout}>
                  Complete Sale
                </button>
                <button className="reset-btn" onClick={resetForm}>
                  Clear Cart
                </button>
              </div>
            </div>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
      </div>

      {/* Printable Bill */}
      <div className="print-only" ref={billRef}>
        <div className="invoice-header">
          <h1>INVOICE</h1>
          <div className="invoice-details">
            <p>
              <strong>Invoice #:</strong> {invoiceNumber}
            </p>
            <p>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="business-info">
          <h2>Your Store Name</h2>
          <p>123 Business Street, City</p>
          <p>Phone: (123) 456-7890</p>
          <p>Email: store@example.com</p>
        </div>

        <div className="customer-info">
          <h3>Customer Information</h3>
          <p>
            <strong>Name:</strong> {customerInfo.name}
          </p>
          {customerInfo.email && (
            <p>
              <strong>Email:</strong> {customerInfo.email}
            </p>
          )}
          {customerInfo.phone && (
            <p>
              <strong>Phone:</strong> {customerInfo.phone}
            </p>
          )}
        </div>

        <table className="invoice-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="text-right">
                <strong>Subtotal</strong>
              </td>
              <td>${calculateSubtotal().toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="3" className="text-right">
                <strong>Tax (10%)</strong>
              </td>
              <td>${calculateTax().toFixed(2)}</td>
            </tr>
            <tr className="total-row">
              <td colSpan="3" className="text-right">
                <strong>Total</strong>
              </td>
              <td>${calculateTotal().toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="invoice-footer">
          <p>Thank you for your business!</p>
          <p>
            <small>
              This invoice was generated on {new Date().toLocaleString()}
            </small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Billing;
