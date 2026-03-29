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

function Navbar({ desktopSidebarCollapsed, setDesktopSidebarCollapsed }) {
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

  // Step 6: Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  // Close menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [searchParams, user]);

  return (
    <>
      <header className="amz-header-container">
        {/* Top Navbar */}
        <div className="amz-top-nav">
          <div className="amz-nav-left">
            <button 
              className="amz-hamburger-btn" 
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setMobileMenuOpen(!mobileMenuOpen);
                } else {
                  setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
                }
              }}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <Link to="/" className="amz-nav-logo">
              amazon.in
              <span className="amz-nav-logo-badge">Portfolio Demo</span>
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

        {/* Secondary Horizontal Ribbon */}
        <div className="amz-sub-nav">
          {SUB_NAV_LINKS.map((link, i) => (
            <Link 
              key={i} 
              to={link.to} 
              className={`amz-sub-item ${link.bold ? 'amz-sub-item--bold' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Backdrop Overlay (Step 2) */}
        {mobileMenuOpen && (
          <div 
            className="amz-sidebar-overlay" 
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Secondary Ribbon / Mobile Nav Drawer (Step 1/3) */}
        <div className={`sidebar ${mobileMenuOpen || !desktopSidebarCollapsed ? "open" : ""}`}>
          <div className="sidebar-header">
             <div className="sidebar-user-block">
                <span className="sidebar-user-icon">👤</span>
                <span className="sidebar-user-greet">
                  Hello, {isAuthenticated ? (user?.name || "User") : "sign in"}
                </span>
             </div>
             {/* Close Button Inside Header */}
             <button 
               className="sidebar-close" 
               onClick={() => {
                 if (window.innerWidth <= 768) {
                   setMobileMenuOpen(false);
                 } else {
                   setDesktopSidebarCollapsed(true);
                 }
               }}
               aria-label="Close menu"
             >
               ✕
             </button>
          </div>

          <div className="sidebar-body">
            {/* Trend/Auth Section */}
            <div className="sidebar-section">
               {!isAuthenticated && (
                 <Link to="/login" className="sidebar-item sidebar-item--highlight">
                   Sign In
                 </Link>
               )}
               <Link to="/orders" className="sidebar-item">Returns & Orders</Link>
               <div 
                 className="sidebar-item" 
                 onClick={() => {
                   setLocationModalOpen(true);
                   setMobileMenuOpen(false);
                 }}
               >
                 📍 {location.city ? `Deliver to ${location.city}` : "Update location"}
               </div>
            </div>

            {/* Trending Section */}
            <div className="sidebar-section">
               <h3>Trending</h3>
               <Link to="/" className="sidebar-item">Best Sellers</Link>
               <Link to={{ pathname: "/", search: "?q=deal" }} className="sidebar-item">Today's Deals</Link>
               <Link to={{ pathname: "/", search: "?q=new" }} className="sidebar-item">New Releases</Link>
            </div>

            {/* Account Settings */}
            <div className="sidebar-section">
               <h3>Your Account</h3>
               <Link to="/profile" className="sidebar-item">Your Profile</Link>
               <Link to="/addresses" className="sidebar-item">Manage Address</Link>
               <Link to="/payments" className="sidebar-item">Payment Options</Link>
               <Link to="/orders" className="sidebar-item">Your Orders</Link>
               <Link to="/messages" className="sidebar-item">Your Messages</Link>
            </div>

            {/* Settings */}
            <div className="sidebar-section">
               <h3>Help & Settings</h3>
               <Link to="/wishlist" className="sidebar-item">Your Wishlist</Link>
               <Link to="/" className="sidebar-item">Customer Service</Link>
               {isAuthenticated && (
                 <div className="sidebar-item" onClick={logout} style={{ color: '#c40000', fontWeight: 'bold' }}>
                   Sign Out
                 </div>
               )}
            </div>
          </div>
        </div>
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      {locationModalOpen && <LocationModal onClose={() => setLocationModalOpen(false)} />}
    </>
  );
}

export default Navbar;
