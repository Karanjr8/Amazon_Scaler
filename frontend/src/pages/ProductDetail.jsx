import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../api/productsApi";
import ProductImage from "../components/ProductImage";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLocation } from "../context/LocationContext";
import { formatInr } from "../utils/formatInr";
import {
  getProductDisplayName,
  getProductGalleryUrls,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "../utils/productFields";
import "../styles/amazon-ui.css";

const ADD_TO_CART_COOLDOWN_MS = 1000;

function calculateAverageRating(reviewList) {
  if (!Array.isArray(reviewList) || reviewList.length === 0) return 0;
  const nums = reviewList
    .map((r) => Number(r.rating ?? r.score))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

const StarRating = ({ rating, size = "md" }) => {
  const filledStars = Math.floor(rating || 0);
  return (
    <div className={`amz-stars amz-stars--${size}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filledStars ? "star-filled" : "star-empty"}>
          {i < filledStars ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { location } = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewSort, setReviewSort] = useState("top");

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

  const mainImage = galleryImages[activeImage] ?? galleryImages[0] ?? PRODUCT_IMAGE_PLACEHOLDER;

  const handleAddToCart = () => {
    if (!product || isAdding) return;
    addToCart(product, qty);
    
    const shortName = getProductDisplayName(product).slice(0, 48);
    showToast(`Added to cart — ${shortName}`, "success", 2600);
    setIsAdding(true);
    window.setTimeout(() => setIsAdding(false), ADD_TO_CART_COOLDOWN_MS);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, qty);
    navigate("/checkout");
  };

  const deliveryDates = useMemo(() => {
    const today = new Date();
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

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!product?.reviews) return dist;
    product.reviews.forEach(r => {
        const rating = Math.floor(r.rating || r.score || 0);
        if (dist[rating] !== undefined) dist[rating]++;
    });
    return dist;
  }, [product?.reviews]);

  const totalReviews = product?.reviews?.length || 0;
  const avgRating = calculateAverageRating(product?.reviews);

  const sortedReviews = useMemo(() => {
    if (!product?.reviews) return [];
    let list = [...product.reviews];
    if (reviewSort === "top") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (reviewSort === "lowest") {
      list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }
    return list;
  }, [product?.reviews, reviewSort]);

  if (loading) return <div className="amz-pdp-page"><p className="amz-pdp-loading">Loading product…</p></div>;
  if (error) return <div className="amz-pdp-page"><p className="amz-pdp-error">{error}</p></div>;
  if (!product) return null;

  const pName = getProductDisplayName(product);
  const pBrand = product.brand?.trim() || "Store";
  const pPrice = Number(product?.price || 0);
  const pStock = Number(product.stock || 0);
  const isInStock = pStock > 0;

  // Specifications Parsing
  const features = product.specifications?.features || [];
  const specs = product.specifications?.specs || [];

  return (
    <div className="amz-pdp-page">
      <div className="amz-pdp-container">
        <div className="amz-pdp-left">
          <div className="amz-pdp-main-img-wrap">
            <ProductImage product={product} src={mainImage} alt={pName} className="amz-pdp-main-img" />
          </div>
          {galleryImages.length > 1 && (
            <div className="amz-pdp-thumbs">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`amz-pdp-thumb-wrap${idx === activeImage ? " amz-pdp-thumb-wrap--active" : ""}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <ProductImage product={product} src={img} className="amz-pdp-thumb" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="amz-pdp-center">
          <h1 className="amz-pdp-title">{pName}</h1>
          <p className="amz-pdp-brand">Visit the {pBrand} Store</p>

          <div className="amz-pdp-rating-row">
            <StarRating rating={avgRating} />
            <span className="amz-pdp-ratings-count">{totalReviews} reviews</span>
          </div>

          <div className="amz-pdp-price-row">
             <div className="amz-pdp-price-inline">
               <span className="price">{formatInr(pPrice)}</span>
             </div>
          </div>
          <p className="amz-pdp-tax-note">Inclusive of all taxes</p>

          {/* NEW: Offers Section */}
          <div className="amz-offers-container">
            <div className="amz-offers-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" /></svg>
                <span>Offers</span>
            </div>
            <div className="amz-offers-scroll">
              <div className="offer-card">
                  <strong>Bank Offer</strong>
                  <p>Up to {formatInr(1026)}.50 discount on select Credit Cards</p>
                  <span className="offer-link">34 offers &gt;</span>
              </div>
              <div className="offer-card">
                  <strong>Cashback</strong>
                  <p>Up to {formatInr(1026)}.00 cashback as Amazon Pay Balance</p>
                  <span className="offer-link">4 offers &gt;</span>
              </div>
              <div className="offer-card">
                  <strong>No Cost EMI</strong>
                  <p>Up to {formatInr(535)}.22 EMI interest savings on Amazon Pay ICICI</p>
                  <span className="offer-link">1 offer &gt;</span>
              </div>
            </div>
          </div>

          {/* NEW: Service Icons Row */}
          <div className="amz-service-icons">
             <div className="service-item">
                <div className="icon-badge">🔄</div>
                <span>10 days Service Centre Replacement</span>
             </div>
             <div className="service-item">
                <div className="icon-badge">🚚</div>
                <span>Free Delivery</span>
             </div>
             <div className="service-item">
                <div className="icon-badge">🛡️</div>
                <span>1 Year Warranty</span>
             </div>
             <div className="service-item">
                <div className="icon-badge">💵</div>
                <span>Pay on Delivery</span>
             </div>
          </div>

          {/* NEW: Quick Specs Table (Brand, OS, etc.) */}
          <div className="amz-quick-specs">
             {specs.length > 0 ? (
                 specs.slice(0, 4).map((spec, idx) => {
                     const parts = spec.split(":");
                     return (
                         <div key={idx} className="quick-spec-item">
                             <span className="label">{parts[0]?.trim() || ""}</span>
                             <span className="value">{parts.slice(1).join(":").trim() || ""}</span>
                         </div>
                     );
                 })
             ) : (
                <>
                  <div className="quick-spec-item"><span className="label">Brand</span><span className="value">{pBrand}</span></div>
                  <div className="quick-spec-item"><span className="label">Category</span><span className="value">{product.category}</span></div>
                </>
             )}
          </div>
        </div>

        <div className="amz-pdp-right">
          <div className="amz-pdp-purchase-box">
            <span className="amz-pdp-purchase-price">{formatInr(pPrice)}</span>
            
            <div className="amz-pdp-delivery">
              <div className="amz-pdp-delivery-row">
                <span className="amz-pdp-delivery-lead">FREE delivery <strong>{deliveryDates.free}</strong>.</span>
              </div>
              <div className="amz-pdp-delivery-row">
                <span className="amz-pdp-delivery-fast">Or fastest delivery <strong>{deliveryDates.fast}</strong>. Order within <span className="timer">14 hrs 2 mins</span>.</span>
              </div>
            </div>

            <div className="amz-pdp-delivery-location">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span className="location-text">Deliver to {location?.city || "Karan"} - {location?.pincode || "400001"}‎</span>
            </div>

            <span className={isInStock ? "amz-pdp-stock" : "amz-pdp-stock out"}>
              {isInStock ? (pStock < 5 ? `Only ${pStock} left in stock - order soon.` : "In stock") : "Out of Stock"}
            </span>

            {isInStock && (
              <div className="amz-pdp-purchase-actions">
                <select className="amz-pdp-qty" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Quantity: {n}</option>)}
                </select>
                <button className="amz-btn-add" onClick={handleAddToCart} disabled={isAdding}>
                  {isAdding ? "Added to Cart" : "Add to Cart"}
                </button>
                <button className="amz-btn-buy" onClick={handleBuyNow}>Buy Now</button>
              </div>
            )}

            <div className="amz-pdp-secure">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
              <span>Secure transaction</span>
            </div>

            <div className="amz-pdp-meta">
              <div className="amz-pdp-meta-row">
                <span className="label">Ships from</span>
                <span className="value">Amazon</span>
              </div>
              <div className="amz-pdp-meta-row">
                <span className="label">Sold by</span>
                <span className="value">{pBrand}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Specifications & Features Section */}
      {(features.length > 0 || specs.length > 0) && (
        <section className="amz-specs-section">
          <div className="amz-specs-grid">
            {/* Left Column: About this item (Features) */}
            <div className="amz-specs-col">
              <h2 className="amz-specs-title">About this item</h2>
              <ul className="amz-features-list">
                {features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Right Column: Product details (Specs) */}
            <div className="amz-specs-col">
              <h2 className="amz-specs-title">Product details</h2>
              <div className="amz-specs-table">
                {specs.map((spec, idx) => {
                  const parts = spec.split(":");
                  const label = parts[0]?.trim() || "";
                  const value = parts.slice(1).join(":").trim() || "";
                  return (
                    <div key={idx} className="amz-specs-row">
                      <span className="spec-label">{label}</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="amz-reviews-redesign">
        <div className="amz-reviews-grid">
          {/* Left Panel: Summary */}
          <div className="amz-reviews-col-left">
            <h2 className="amz-reviews-title">Customer reviews</h2>
            <div className="amz-reviews-avg-block">
                <StarRating rating={avgRating} size="lg" />
                <span className="avg-text">{avgRating.toFixed(1)} out of 5</span>
            </div>
            <p className="global-ratings-text">{totalReviews.toLocaleString()} global ratings</p>
            
            <div className="amz-rating-breakdown">
                {[5, 4, 3, 2, 1].map(star => {
                    const count = ratingDistribution[star];
                    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    return (
                        <div key={star} className="amz-rating-bar-row">
                            <span className="star-label">{star} star</span>
                            <div className="amz-rating-bar-bg">
                                <div className="amz-rating-bar-fill" style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="percent-label">{percent}%</span>
                        </div>
                    );
                })}
            </div>
          </div>

          {/* Right Panel: Reviews List */}
          <div className="amz-reviews-col-right">
            <div className="amz-reviews-list-header">
                <h3>Top reviews</h3>
                <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)} className="amz-review-sort">
                    <option value="top">Top Reviews</option>
                    <option value="lowest">Lowest Rating</option>
                    <option value="recent">Most Recent</option>
                </select>
            </div>

            <div className="amz-reviews-list">
              {sortedReviews.length === 0 ? (
                <p className="empty-msg">No reviews yet for this product.</p>
              ) : (
                sortedReviews.map((r, i) => {
                  const title = r.comment ? r.comment.split(' ').slice(0, 5).join(' ') + '...' : 'Verified Purchase';
                  return (
                    <article key={i} className="amz-review-card-modern">
                      <div className="amz-review-user">
                        <div className="avatar">👤</div>
                        <strong>{r.user || "Verified Customer"}</strong>
                      </div>
                      <div className="amz-review-rating-row">
                        <StarRating rating={r.rating} size="sm" />
                        <span className="review-title">{title}</span>
                      </div>
                      <p className="verify-tag">Verified Purchase</p>
                      <p className="amz-review-comment">{r.comment}</p>
                      <div className="amz-review-actions">
                        <button className="amz-btn-helpful">Helpful</button>
                        <span className="report-link">Report</span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetail;
