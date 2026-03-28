import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import CartSidebar from "./CartSidebar";
import LocationModal from "./LocationModal";

const SUB_NAV_LINKS = [
  { label: "All", to: "/", bold: true },
  { label: "Fresh", to: { pathname: "/", search: "?q=fresh" } },
  { label: "Amazon miniTV", to: { pathname: "/", search: "?q=TV" } },
  { label: "Sell", to: "/sell" },
  { label: "Best Sellers", to: { pathname: "/", search: "?q=best" } },
  { label: "Mobiles", to: { pathname: "/", search: "?q=mobile" } },
  { label: "Today's Deals", to: { pathname: "/", search: "?q=deal" } },
  { label: "Customer Service", to: { pathname: "/", search: "?q=help" } },
  { label: "Prime ▼", to: { pathname: "/", search: "?q=prime" } },
  { label: "Electronics", to: { pathname: "/", search: "?category=Electronics" } },
];

function Navbar() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { location } = useLocation();
  
  const [cartOpen, setCartOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    setQ(initialQ);
    setCategory(initialCategory);
  }, [searchParams]);

  const categories = useMemo(() => ["All", "Electronics", "Fashion", "Home", "Sports", "Other"], []);

  const buildSearchQuery = (nextQ, nextCategory) => {
    const params = new URLSearchParams();
    const trimmed = nextQ.trim();
    if (trimmed) params.set("q", trimmed);
    if (nextCategory && nextCategory !== "All") {
      params.set("category", nextCategory);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const search = buildSearchQuery(q, category);
    navigate(`/${search}`);
  };

  return (
    <>
      <header className="amz-header-container">
        {/* Top Navbar */}
        <div className="amz-top-nav">
          <div className="amz-nav-left">
            <button 
              className="amz-hamburger-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <Link to="/" className="amz-nav-logo">
              amazon.in
            </Link>
          </div>
          
          <div 
            className="amz-nav-location desktop-only" 
            onClick={() => setLocationModalOpen(true)}
            style={{ cursor: "pointer" }}
          >
            <span className="amz-nav-loc-top">
              {location.city ? `Deliver to ${user?.name || "User"}` : "Hello"}
            </span>
            <span className="amz-nav-loc-bottom">
              {location.city ? `${location.city} ${location.pincode}` : "Update location"}
            </span>
          </div>

          <form className="amz-search-block" onSubmit={handleSearchSubmit}>
            <select
              className="amz-search-select desktop-only"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              className="amz-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Amazon.in"
            />
            <button type="submit" className="amz-search-btn">
              <span aria-hidden="true" style={{ fontSize: "16px" }}>🔍</span>
            </button>
          </form>

          <div className="amz-nav-actions">
            <div className="amz-nav-item desktop-only">
              <span className="amz-nav-loc-top">&nbsp;</span>
              <span className="amz-nav-loc-bottom">EN ▼</span>
            </div>

            {isAuthenticated ? (
              <div className="amz-nav-item desktop-only" onClick={logout} style={{ cursor: "pointer" }}>
                <span className="amz-nav-loc-top">Hello, {user?.name || "User"}</span>
                <span className="amz-nav-loc-bottom">Sign Out</span>
              </div>
            ) : (
              <Link to="/login" className="amz-nav-item desktop-only">
                <span className="amz-nav-loc-top">Hello, sign in</span>
                <span className="amz-nav-loc-bottom">Accounts & Lists ▼</span>
              </Link>
            )}

            <Link to="/orders" className="amz-nav-item desktop-only">
              <span className="amz-nav-loc-top">Returns</span>
              <span className="amz-nav-loc-bottom">& Orders</span>
            </Link>

            <div className="amz-cart-btn" onClick={() => setCartOpen(true)}>
               <span className="amz-cart-icon">🛒</span>
               <div className="amz-cart-details">
                 <span className="amz-cart-count">{itemCount}</span>
                 <span className="amz-cart-label">Cart</span>
               </div>
            </div>
          </div>
        </div>

        {/* Secondary Ribbon / Mobile Nav Drawer */}
        <div className={`amz-sub-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <div 
            className="amz-sub-item mobile-only" 
            onClick={() => setLocationModalOpen(true)}
            style={{ fontWeight: "bold" }}
          >
            📍 {location.city ? `Deliver to ${location.city}` : "Update location"}
          </div>

          {/* Mobile Only: Authentication/User links moved here */}
          {mobileMenuOpen && (
            <>
               {isAuthenticated ? (
                 <div className="amz-sub-item mobile-only user-status" onClick={logout}>
                   Hello, {user?.name || "User"} (Sign Out)
                 </div>
               ) : (
                 <Link to="/login" className="amz-sub-item mobile-only user-status">
                   Hello, sign in
                 </Link>
               )}
               <Link to="/orders" className="amz-sub-item mobile-only">Returns & Orders</Link>
               <hr className="mobile-only" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            </>
          )}

          <div className="amz-sub-item">Fresh</div>
          <div className="amz-sub-item">Amazon miniTV</div>
          <Link to="/sell" className="amz-sub-item" style={{ color: "inherit", textDecoration: "none" }}>
            Sell
          </Link>
          <div className="amz-sub-item">Best Sellers</div>
          <div className="amz-sub-item">Mobiles</div>
          <div className="amz-sub-item">Today's Deals</div>
          <div className="amz-sub-item desktop-only">Customer Service</div>
          <div className="amz-sub-item desktop-only">Prime ▼</div>
          <div className="amz-sub-item desktop-only">Electronics</div>
        </div>
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      {locationModalOpen && <LocationModal onClose={() => setLocationModalOpen(false)} />}
    </>
  );
}

export default Navbar;
