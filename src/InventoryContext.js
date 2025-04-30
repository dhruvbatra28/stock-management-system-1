import React, { createContext, useState } from "react";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);

  const addStock = (newItem) => {
    setInventory((prev) => {
      const existingItem = prev.find((item) => item.name === newItem.name);
      if (existingItem) {
        return prev.map((item) =>
          item.name === newItem.name
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const subtractStock = (itemName, quantity) => {
    setInventory((prev) =>
      prev
        .map((item) =>
          item.name === itemName
            ? { ...item, quantity: item.quantity - quantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <InventoryContext.Provider value={{ inventory, addStock, subtractStock }}>
      {children}
    </InventoryContext.Provider>
  );
};
