import { createContext, useContext, useEffect, useMemo, useState } from "react";
import client from "../api/client";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from backend session on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await client.get("/cart");
        if (res.data?.success) {
          setItems(res.data.cart || []);
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
      const res = await client.post("/cart/add", { productId: product.id, quantity });
      if (res.data?.success) {
        setItems(res.data.cart || []);
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
      const res = await client.post(`/cart/update/${productId}`, { quantity });
      if (res.data?.success) {
        setItems(res.data.cart || []);
      }
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await client.post(`/cart/remove/${productId}`);
      if (res.data?.success) {
        setItems(res.data.cart || []);
      }
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await client.post("/cart/clear");
      if (res.data?.success) {
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
