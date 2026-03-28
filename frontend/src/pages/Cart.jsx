import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatInr } from "../utils/formatInr";
import { getProductDisplayName } from "../utils/productFields";
import ProductImage from "../components/ProductImage";
import "../styles/Cart.css";

function Cart() {
  const navigate = useNavigate();
  const { items, total, itemCount, updateQuantity, removeFromCart } = useCart();

  const handleQtyChange = (itemId, currentQty, delta) => {
    updateQuantity(itemId, currentQty + delta);
  };

  if (!items.length) {
    return (
      <div className="cart-page-container">
        <div className="cart-items-section">
          <div className="cart-empty-container">
            <h2>Your Amazon Cart is empty.</h2>
            <p>Your shopping cart is waiting for you. Give it purpose — fill it with electronics, fashion, and more.</p>
            <Link to="/" className="btn btn-amazon continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-items-section">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="cart-header-price">Price</span>
        </div>

        {items.map((item) => {
          const pName = getProductDisplayName(item);
          const pDesc = item.description || item.body || "";
          
          return (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-image">
                <Link to={`/products/${item.id}`}>
                  <ProductImage product={item} alt={pName} />
                </Link>
              </div>
              
              <div className="cart-item-info">
                <Link to={`/products/${item.id}`} className="cart-item-title-link">
                  {pName}
                </Link>
                <div className="cart-item-desc">
                  {pDesc}
                </div>
                <div className="cart-item-stock">In stock</div>
                
                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="control-separator" aria-hidden="true">|</span>
                  <button 
                    className="remove-link" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="cart-item-price-col">
                <span className="cart-item-price">{formatInr(item.price)}</span>
              </div>
            </div>
          );
        })}

        <div className="cart-footer-subtotal">
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
          <strong>{formatInr(total)}</strong>
        </div>
      </div>

      <aside className="cart-summary-sidebar">
        <div className="cart-summary-card">
          <div className="subtotal-row">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}): <strong>{formatInr(total)}</strong>
          </div>
          <button 
            className="btn btn-amazon checkout-btn" 
            onClick={() => navigate("/checkout")}
          >
            Proceed to Buy
          </button>
        </div>
      </aside>
    </div>
  );
}

export default Cart;
