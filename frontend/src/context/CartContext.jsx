import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const API_BASE = "http://localhost:5000/api/cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from backend session on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(API_BASE, { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setItems(data.cart || []);
        }
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.cart);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      const res = await fetch(`${API_BASE}/update/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.cart);
      }
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/remove/${productId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.cart);
      }
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/clear`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [items]
  );

  const value = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
