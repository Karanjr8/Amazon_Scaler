import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWishlist, removeFromWishlist } from "../api/wishlistApi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatInr } from "../utils/formatInr";
import ProductImage from "../components/ProductImage";
import { getProductDisplayName } from "../utils/productFields";

function Wishlist() {
  const { addToCart } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) return; // Prevent 401 unauthorized errors on console
    try {
      setLoading(true);
      setError("");
      const data = await fetchWishlist();
      setItems(data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout(); // Transparently purge bad session, natively forcing unauthenticated UI rendering
        return;
      }
      const msg = err.response?.data?.message || "Failed to load wishlist.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [loadWishlist, isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => item.id !== productId));
      showToast("Removed from wishlist", "success", 2200);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not remove item.";
      showToast(msg, "error", 3000);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`${getProductDisplayName(item)} added to cart`, "success", 2400);
  };

  return (
    <section className="wishlist-page">
      <h1 className="wishlist-page-title">Your Wishlist</h1>
      <p className="wishlist-page-sub">
        Items you save appear here. Sign in on any device to see the same list.
      </p>

      {loading && <p className="wishlist-status">Loading your wishlist…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="wishlist-empty">
          {!isAuthenticated ? (
            <>
              <p>Please log in to view and save items to your wishlist.</p>
              <Link to="/login" className="btn btn-amazon wishlist-empty-cta">
                Sign in to your account
              </Link>
            </>
          ) : (
            <>
              <p>Your wishlist is empty.</p>
              <Link to="/" className="btn btn-amazon wishlist-empty-cta">
                Continue shopping
              </Link>
            </>
          )}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="wishlist-grid">
          {items.map((item) => (
            <li key={item.id} className="wishlist-card">
              <Link to={`/products/${item.id}`} className="wishlist-card-media">
                <ProductImage
                  product={item}
                  alt={getProductDisplayName(item)}
                  loading="lazy"
                />
              </Link>
              <div className="wishlist-card-body">
                <Link to={`/products/${item.id}`} className="wishlist-card-title">
                  {getProductDisplayName(item)}
                </Link>
                <p className="wishlist-card-price">{formatInr(item.price)}</p>
                {item.category && (
                  <span className="wishlist-card-category">{item.category}</span>
                )}
                <div className="wishlist-card-actions">
                  <button
                    type="button"
                    className="btn btn-amazon"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary wishlist-card-remove"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Wishlist;
