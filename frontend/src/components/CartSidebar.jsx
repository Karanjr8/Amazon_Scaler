import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatInr } from "../utils/formatInr";

function CartSidebar({ open, onClose }) {
  const { items, total, updateQuantity, removeFromCart, itemCount } = useCart();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="cart-drawer" aria-label="Cart">
        <div className="drawer-header">
          <h2>{itemCount === 0 ? "Cart" : `Cart (${itemCount})`}</h2>
          <button type="button" className="drawer-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="drawer-body">
          {itemCount === 0 ? (
            <p className="muted">Your cart is empty.</p>
          ) : (
            <div className="drawer-items">
              {items.map((item) => (
                <div key={item.id} className="drawer-item">
                  <div className="drawer-item-info">
                    <h3 className="drawer-item-title">{item.name}</h3>
                    <p className="drawer-item-price">
                      {formatInr(item.price)}
                    </p>
                  </div>
                  <div className="drawer-item-actions">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, Number(e.target.value))
                      }
                    />
                    <button
                      type="button"
                      className="drawer-remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <div className="drawer-total">
            <span>Total</span>
            <strong>{formatInr(total)}</strong>
          </div>
          <div className="drawer-cta">
            <Link to="/cart" className="btn btn-secondary" onClick={onClose}>
              View cart
            </Link>
            <Link
              to="/checkout"
              className={`btn btn-primary ${itemCount === 0 ? "disabled" : ""}`}
              onClick={onClose}
              aria-disabled={itemCount === 0}
            >
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default CartSidebar;

