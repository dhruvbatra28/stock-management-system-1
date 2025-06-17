import React, { useState, useEffect } from "react";
import "../styles/StockManagement.css";

function StockManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    lowStockThreshold: 10,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log("Trying to add product:", newProduct); // DEBUG

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        console.error("Token missing"); // DEBUG
        return;
      }

      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();
      console.log("API Response:", data); // DEBUG

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      setSuccess("Product added successfully!");
      setNewProduct({
        name: "",
        category: "",
        quantity: 0,
        price: 0,
        lowStockThreshold: 10,
      });
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.message);
      console.error("Add Product Error:", err); // DEBUG
    }
  };

  const handleUpdateStock = async (id, action, quantity) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/products/${id}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: parseInt(quantity) }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} stock`);
      }

      setSuccess(
        `Stock ${action === "add" ? "added" : "subtracted"} successfully!`
      );
      fetchProducts();
      if (editingProduct?.id === id) {
        setEditingProduct(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="stock-management">
      <h1>Stock Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="stock-actions">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <button
          className="btn-add"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {showAddForm && (
        <div className="add-product-form">
          <h2>Add New Product</h2>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label htmlFor="name">Product Name:</label>
              <input
                type="text"
                id="name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <input
                type="text"
                id="category"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Initial Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="0"
                  value={newProduct.quantity}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price:</label>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="threshold">Low Stock Threshold:</label>
                <input
                  type="number"
                  id="threshold"
                  min="1"
                  value={newProduct.lowStockThreshold}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      lowStockThreshold: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Add Product
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="product-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>In Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-products">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className={
                      product.quantity <= product.lowStockThreshold
                        ? "low-stock"
                        : ""
                    }
                  >
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.quantity}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span
                        className={`status ${
                          product.quantity <= product.lowStockThreshold
                            ? "low"
                            : "ok"
                        }`}
                      >
                        {product.quantity <= product.lowStockThreshold
                          ? "Low Stock"
                          : "In Stock"}
                      </span>
                    </td>
                    <td>
                      {editingProduct && editingProduct.id === product._id ? (
                        <div className="stock-edit">
                          <input
                            type="number"
                            min="1"
                            value={editingProduct.quantity}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                quantity: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() =>
                              handleUpdateStock(
                                product._id,
                                editingProduct.action,
                                editingProduct.quantity
                              )
                            }
                            className="btn-apply"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => setEditingProduct(null)}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="stock-actions">
                          <button
                            onClick={() =>
                              setEditingProduct({
                                id: product._id,
                                action: "add",
                                quantity: 1,
                              })
                            }
                            className="btn-add-stock"
                          >
                            Add
                          </button>
                          <button
                            onClick={() =>
                              setEditingProduct({
                                id: product._id,
                                action: "subtract",
                                quantity: 1,
                              })
                            }
                            className="btn-subtract-stock"
                          >
                            Subtract
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StockManagement;
