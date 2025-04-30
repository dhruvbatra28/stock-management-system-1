import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    recentTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome to Your Stock Management System</h1>
      <p className="welcome-message">
        Hello, {user?.name}! Here's your current stock overview.
      </p>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{stats.totalProducts}</p>
          <Link to="/stock" className="stat-link">
            Manage Stock
          </Link>
        </div>

        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <p className="stat-value">{stats.lowStockItems}</p>
          <Link to="/stock" className="stat-link">
            View Low Stock
          </Link>
        </div>

        <div className="stat-card">
          <h3>Recent Transactions</h3>
          <p className="stat-value">{stats.recentTransactions}</p>
          <Link to="/billing" className="stat-link">
            View Transactions
          </Link>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/stock" className="btn-action">
            Add New Product
          </Link>
          <Link to="/billing" className="btn-action">
            Create New Bill
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
