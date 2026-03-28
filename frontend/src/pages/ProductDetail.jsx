import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductById, fetchProductReviews } from "../api/productsApi";
import ProductImage from "../components/ProductImage";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLocation } from "../context/LocationContext";
import { formatInr } from "../utils/formatInr";
import {
  getProductDisplayName,
  getProductGalleryUrls,
  getProductRatingFromDb,
  getProductReviewCountFromDb,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "../utils/productFields";

const ADD_TO_CART_COOLDOWN_MS = 1000;

function averageReviewRating(reviewList) {
  if (!Array.isArray(reviewList) || reviewList.length === 0) return null;
  const nums = reviewList
    .map((r) => Number(r.rating ?? r.score))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { location } = useLocation();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage(0);
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchProductById(id);
        setProduct(data ?? null);

        const reviewsData = await fetchProductReviews(id);
        setReviews(reviewsData);
      } catch (_err) {
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return getProductGalleryUrls(product);
  }, [product]);

  useEffect(() => {
    if (activeImage >= galleryImages.length) {
      setActiveImage(0);
    }
  }, [galleryImages.length, activeImage]);

  const mainImage =
    galleryImages[activeImage] ?? galleryImages[0] ?? PRODUCT_IMAGE_PLACEHOLDER;

  const handleAddToCart = () => {
    if (!product || isAdding) return;
    for (let n = 0; n < qty; n += 1) {
      addToCart(product);
    }
    const shortName = getProductDisplayName(product).slice(0, 48);
    showToast(`Added to cart — ${shortName}`, "success", 2600);
    setIsAdding(true);
    window.setTimeout(() => setIsAdding(false), ADD_TO_CART_COOLDOWN_MS);
  };

  const handleBuyNow = () => {
    if (!product) return;
    for (let n = 0; n < qty; n += 1) {
      addToCart(product);
    }
    navigate("/checkout");
  };

  // Delivery Logic
  const deliveryDates = useMemo(() => {
    const today = new Date();
    
    // Logic: Free delivery in 3 days, Fastest in 1 day
    const freeDate = new Date();
    freeDate.setDate(today.getDate() + 3);
    
    const fastDate = new Date();
    fastDate.setDate(today.getDate() + 1);

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return {
      free: freeDate.toLocaleDateString('en-IN', options),
      fast: fastDate.toLocaleDateString('en-IN', options)
    };
  }, []);

  const isDeliverable = useMemo(() => {
    // Mock logic: If pincode starts with '9', it's not deliverable
    if (location.pincode && location.pincode.startsWith('9')) {
      return false;
    }
    return true;
  }, [location.pincode]);

  if (loading) {
    return (
      <div className="amz-pdp-page">
        <p className="amz-pdp-loading">Loading product…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="amz-pdp-page">
        <p className="amz-pdp-error">{error}</p>
      </div>
    );
  }

  if (!product) return null;

  const pName = getProductDisplayName(product);
  const pBrand = product.brand?.trim() || "Store";
  const pDesc =
    product.description?.trim() ||
    product.body?.trim() ||
    "No description available for this product.";
  const pPrice = Number(product.price ?? product.cost ?? 0);

  const ratingFromDb = getProductRatingFromDb(product);
  const reviewAvg = averageReviewRating(reviews);
  const displayRating =
    ratingFromDb != null ? ratingFromDb : reviewAvg != null ? reviewAvg : null;
  const reviewCountFromDb = getProductReviewCountFromDb(product);
  const computedReviewCount =
    reviewCountFromDb != null ? reviewCountFromDb : reviews.length > 0 ? reviews.length : null;
  const showRatingRow = displayRating != null || (computedReviewCount != null && computedReviewCount > 0);

  const pStockRaw =
    product.stock != null ? Number(product.stock) : product.quantity != null ? Number(product.quantity) : null;
  const pStock = pStockRaw != null && Number.isFinite(pStockRaw) ? pStockRaw : 0;
  const isInStock = pStock > 0;

  const listPriceRaw =
    product.original_price != null && product.original_price !== ""
      ? Number(product.original_price)
      : null;
  const listPrice =
    listPriceRaw != null && Number.isFinite(listPriceRaw) && listPriceRaw > pPrice
      ? listPriceRaw
      : null;
  const discountPercent =
    listPrice != null ? Math.round(((listPrice - pPrice) / listPrice) * 100) : 0;

  return (
    <div className="amz-pdp-page">
      <div className="amz-pdp-container">
        <div className="amz-pdp-left">
          <div className="amz-pdp-main-img-wrap">
            <ProductImage
              product={product}
              src={mainImage}
              alt={pName}
              className="amz-pdp-main-img"
              loading="eager"
            />
          </div>
          {galleryImages.length > 1 ? (
            <div className="amz-pdp-thumbs">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className={`amz-pdp-thumb-wrap${idx === activeImage ? " amz-pdp-thumb-wrap--active" : ""}`}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <ProductImage
                    product={product}
                    src={img}
                    className="amz-pdp-thumb"
                    alt=""
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="amz-pdp-center">
          <h1 className="amz-pdp-title">{pName}</h1>
          <p className="amz-pdp-brand">Visit the {pBrand} Store</p>

          {showRatingRow ? (
            <div className="amz-pdp-rating-row">
              {displayRating != null ? (
                <span className="amz-pdp-rating-stars" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < Math.floor(displayRating) ? "★" : "☆"}</span>
                  ))}
                </span>
              ) : null}
              {displayRating != null ? (
                <span className="amz-pdp-rating-value">{displayRating.toFixed(1)}</span>
              ) : null}
              {computedReviewCount != null && computedReviewCount > 0 ? (
                <span className="amz-pdp-ratings-count">
                  {computedReviewCount.toLocaleString("en-IN")}{" "}
                  {computedReviewCount === 1 ? "rating" : "ratings"}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="amz-pdp-price-row">
            <div className="amz-pdp-price-inline">
              {discountPercent > 0 ? (
                <span className="discount">-{discountPercent}%</span>
              ) : null}
              <span className="price">{formatInr(pPrice)}</span>
            </div>
            {listPrice != null && discountPercent > 0 ? (
              <span className="original">M.R.P.: {formatInr(listPrice)}</span>
            ) : null}
          </div>
          <p className="amz-pdp-tax-note">Inclusive of all taxes</p>

          <div className="amz-pdp-desc">
            <h2 className="amz-pdp-desc-heading">About this item</h2>
            <p className="amz-pdp-desc-body">{pDesc}</p>
          </div>
        </div>

        <div className="amz-pdp-right">
          <div className="amz-pdp-purchase-box">
            <span className="amz-pdp-purchase-price">{formatInr(pPrice)}</span>

            <div className="amz-pdp-delivery">
              {isDeliverable ? (
                <>
                  <span className="amz-pdp-delivery-lead">FREE delivery <strong>{deliveryDates.free}</strong></span>
                  <p className="amz-pdp-delivery-detail">
                    Or fastest delivery <strong>{deliveryDates.fast}</strong>. Order within 12 hrs 4 mins.
                  </p>
                </>
              ) : (
                <span className="amz-pdp-delivery-lead out" style={{ color: "#c40000" }}>
                  Not deliverable to your location
                </span>
              )}
              
              <div className="amz-pdp-delivery-location">
                <svg fill="currentColor" width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>
                  {location.city 
                    ? `Delivering to ${user?.name || "User"} — ${location.city} ${location.pincode}` 
                    : "Select delivery location"}
                </span>
              </div>
            </div>

            {isInStock && isDeliverable ? (
              <span className="amz-pdp-stock">In stock</span>
            ) : !isInStock ? (
              <span className="amz-pdp-stock out">Currently unavailable</span>
            ) : (
              <span className="amz-pdp-stock out">Unavailable for location</span>
            )}

            {isInStock && isDeliverable ? (
              <select
                className="amz-pdp-qty"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                aria-label="Quantity"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    Quantity: {n}
                  </option>
                ))}
              </select>
            ) : null}

            {isInStock && isDeliverable ? (
              <>
                <button
                  type="button"
                  className="amz-btn-add"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  {isAdding ? "Added to Cart" : "Add to Cart"}
                </button>
                <button type="button" className="amz-btn-buy" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </>
            ) : null}

            <div className="amz-pdp-meta-grid">
              <span>Ships from</span>
              <span>Amazon</span>
              <span>Sold by</span>
              <span>{product.seller_name?.trim() || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="amz-pdp-reviews-section" aria-labelledby="pdp-reviews-heading">
        <h2 id="pdp-reviews-heading">Customer reviews</h2>
        {reviews.length === 0 ? (
          <p className="amz-pdp-reviews-empty">No reviews yet for this product.</p>
        ) : (
          <div>
            {reviews.map((r, i) => (
              <article
                key={r.id ?? `review-${i}`}
                className="amz-pdp-review-item"
              >
                <div className="amz-pdp-review-author">
                  <span className="amz-pdp-review-avatar" aria-hidden>
                    👤
                  </span>
                  {r.reviewer_name || r.author || "Amazon Customer"}
                </div>
                <div className="amz-pdp-rating-row amz-pdp-rating-row--compact">
                  <span className="amz-pdp-rating-stars amz-pdp-rating-stars--sm" aria-hidden>
                    {Array.from({ length: 5 }).map((_, starIdx) => {
                      const rv = Number(r.rating ?? r.score);
                      const filled = Number.isFinite(rv) ? Math.min(5, Math.max(0, Math.floor(rv))) : 0;
                      return (
                        <span key={starIdx}>
                          {starIdx < filled ? "★" : "☆"}
                        </span>
                      );
                    })}
                  </span>
                  <span className="amz-pdp-review-title">
                    {r.review_title || r.title || "Review"}
                  </span>
                </div>
                <div className="amz-pdp-review-body">
                  {r.body || r.comment || r.content || ""}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProductDetail;
