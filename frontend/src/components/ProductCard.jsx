import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { addToWishlist } from "../api/wishlistApi";
import { useToast } from "../context/ToastContext";
import { formatInr } from "../utils/formatInr";
import ProductImage from "./ProductImage";
import {
  getProductDisplayName,
  getProductPrice,
  getProductRatingFromDb,
  getProductReviewCountFromDb,
} from "../utils/productFields";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const displayName = useMemo(() => getProductDisplayName(product), [product]);

  const ratingMeta = useMemo(() => {
    const rating = getProductRatingFromDb(product);
    const reviewCount = getProductReviewCountFromDb(product);
    if (rating == null && reviewCount == null) return null;
    const effectiveRating = rating ?? null;
    const filled =
      effectiveRating != null ? Math.min(5, Math.max(0, Math.floor(effectiveRating))) : 0;
    return {
      rating: effectiveRating,
      filledStars: filled,
      reviewCount,
    };
  }, [product]);

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      showToast("Sign in to save items to your wishlist", "error", 2800);
      return;
    }

    try {
      const res = await addToWishlist(product.id);
      showToast(res.message || "Saved to wishlist", "success", 2400);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Could not update wishlist. Try again.";
      showToast(msg, "error", 3200);
    }
  };

  const ADD_TO_CART_COOLDOWN_MS = 1000;

  const handleAddToCart = () => {
    if (isAdding) return;
    addToCart(product);
    const shortName =
      displayName.length > 48 ? `${displayName.slice(0, 48)}…` : displayName;
    showToast(`Added to cart — ${shortName}`, "success", 2600);
    setIsAdding(true);
    window.setTimeout(() => setIsAdding(false), ADD_TO_CART_COOLDOWN_MS);
  };

  const detailHref = `/products/${product.id}`;

  return (
    <article className="product-card">
      <Link
        to={detailHref}
        className="product-card-media"
        aria-label={`View ${displayName}`}
      >
        <div className="product-image-wrap">
          <ProductImage product={product} className="product-image" alt="" />
        </div>
      </Link>

      <div className="product-card-body">
        <h3 className="product-title">
          <Link to={detailHref} className="product-title-link">
            {displayName}
          </Link>
        </h3>

        {ratingMeta && (ratingMeta.rating != null || ratingMeta.reviewCount != null) ? (
          <div
            className="product-rating"
            aria-label={
              ratingMeta.rating != null && ratingMeta.reviewCount != null
                ? `Rated ${ratingMeta.rating} out of 5 stars, ${ratingMeta.reviewCount.toLocaleString("en-IN")} reviews`
                : ratingMeta.rating != null
                  ? `Rated ${ratingMeta.rating} out of 5 stars`
                  : `${ratingMeta.reviewCount?.toLocaleString("en-IN") ?? 0} reviews`
            }
          >
            {ratingMeta.rating != null ? (
              <div className="stars" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`star ${idx < ratingMeta.filledStars ? "star-full" : "star-empty"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            ) : null}
            {ratingMeta.rating != null ? (
              <span className="rating-text">{ratingMeta.rating.toFixed(1)}</span>
            ) : null}
            {ratingMeta.reviewCount != null ? (
              <span className="rating-count">
                ({ratingMeta.reviewCount.toLocaleString("en-IN")})
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="product-price-row">
          <span className="product-price">{formatInr(getProductPrice(product))}</span>
        </div>

        <button
          type="button"
          className={`product-card-add-cart btn btn-amazon ${isAdding ? "product-add-btn-active" : ""}`}
          onClick={handleAddToCart}
          disabled={isAdding}
          aria-busy={isAdding}
        >
          {isAdding ? "Added ✓" : "Add to Cart"}
        </button>

        <div className="product-card-secondary">
          <Link to={detailHref} className="product-card-detail-link">
            See details
          </Link>
          <button
            type="button"
            className="product-card-wishlist"
            onClick={handleAddToWishlist}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? "Login to use wishlist" : "Add to Wishlist"}
          >
            Wishlist
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
