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

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
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
      console.error("Add Product Error:", err);
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
        <input
          type="text"
          placeholder="Search products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {showAddForm && (
        <form className="add-product-form" onSubmit={handleAddProduct}>
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newProduct.quantity}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                quantity: parseInt(e.target.value),
              })
            }
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                price: parseFloat(e.target.value),
              })
            }
            required
          />
          <input
            type="number"
            placeholder="Low Stock Threshold"
            value={newProduct.lowStockThreshold}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                lowStockThreshold: parseInt(e.target.value),
              })
            }
            required
          />
          <button type="submit">Add Product</button>
        </form>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
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
                  {product.quantity <= product.lowStockThreshold
                    ? "Low Stock"
                    : "In Stock"}
                </td>
                <td>
                  {editingProduct && editingProduct.id === product._id ? (
                    <>
                      <input
                        type="number"
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
                      >
                        Apply
                      </button>
                      <button onClick={() => setEditingProduct(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setEditingProduct({
                            id: product._id,
                            action: "add",
                            quantity: 1,
                          })
                        }
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
                      >
                        Subtract
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StockManagement;
