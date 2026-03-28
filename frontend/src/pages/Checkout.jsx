import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocation as useAppLocation } from "../context/LocationContext";
import { createOrder } from "../api/ordersApi";
import { formatInr } from "../utils/formatInr";
import { useToast } from "../context/ToastContext";
import ProductImage from "../components/ProductImage";
import "../styles/Checkout.css";

const PAYMENT_METHODS = [
  { 
    id: "UPI", 
    label: "UPI / Net Banking", 
    desc: "Google Pay, PhonePe, Paytm & more",
    icons: ["https://img.icons8.com/color/48/google-pay.png", "https://img.icons8.com/color/48/paytm.png"]
  },
  { 
    id: "CARD", 
    label: "Credit or Debit Card", 
    desc: "Visa, Mastercard, RuPay & more",
    icons: ["https://img.icons8.com/color/48/visa.png", "https://img.icons8.com/color/48/mastercard.png"]
  },
  { 
    id: "COD", 
    label: "Cash on Delivery", 
    desc: "Pay at your doorstep via cash or QR",
    icons: ["https://img.icons8.com/ios-filled/50/000000/delivery-box.png"]
  },
];

const OFFERS = [
  { id: 1, label: "Bank Offer", desc: "10% Instant Discount on HDFC Bank Cards. Min trxn: ₹5,000" },
  { id: 2, label: "Cashback", desc: "Flat ₹50 back on first UPI transaction via Amazon Pay." },
];

function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { location: geoLoc } = useAppLocation();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  const [address, setAddress] = useState(() => {
    const saved = localStorage.getItem("amz_checkout_address");
    if (saved) return JSON.parse(saved);
    return {
      fullName: user?.name || "",
      phone: "",
      addressLine: "",
      city: geoLoc.city || "",
      state: "",
      pincode: geoLoc.pincode || "",
    };
  });

  const [upiId, setUpiId] = useState("");
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvv: "" });

  useEffect(() => {
    localStorage.setItem("amz_checkout_address", JSON.stringify(address));
  }, [address]);

  // Derived Values
  const subtotal = total;
  const deliveryCharges = subtotal > 500 ? 0 : 40;
  const tax = Math.round(subtotal * 0.18);
  const discount = paymentMethod === "UPI" ? 50 : 0; // Mock discount for UPI
  const finalTotal = subtotal + deliveryCharges + tax - discount;

  const estimatedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
  }, []);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!address.fullName || !address.addressLine || !address.city || !address.pincode) {
      showToast("Please complete your delivery address", "error");
      setIsEditingAddress(true);
      return;
    }
    if (paymentMethod === "UPI" && (!upiId || !upiId.includes("@"))) {
      showToast("Please enter a valid UPI ID", "error");
      return;
    }
    if (paymentMethod === "CARD" && (!cardInfo.number || cardInfo.number.length < 12)) {
      showToast("Please enter a valid card number", "error");
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        total: finalTotal,
        deliveryAddress: address,
        paymentMethod,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1
        }))
      };

      const res = await createOrder(orderData);
      showToast("Order placed successfully!", "success");
      clearCart();
      navigate("/order-success", { state: { orderId: res.id } });
    } catch (err) {
      showToast("Failed to place order. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <button type="button" onClick={() => navigate("/")} className="btn btn-amazon checkout-empty-cta">
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header-bar">
         <h1>Select a Payment Method</h1>
         <p>Deliver to {address.fullName || "Loading..."} - {address.city || "India"}, {address.pincode}</p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          
          {/* Section 1: Address Summary / Edit */}
          <div className="checkout-section-card">
            <div className="section-header">
              <span className="section-number">1</span>
              <h2>Delivery Address</h2>
              {!isEditingAddress && <span className="change-link" onClick={() => setIsEditingAddress(true)}>Change</span>}
            </div>

            {isEditingAddress ? (
              <div className="section-content address-grid">
                <div className="form-group full-width">
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={address.fullName} onChange={handleAddressChange} />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input type="text" name="phone" value={address.phone} onChange={handleAddressChange} />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange} />
                </div>
                <div className="form-group full-width">
                  <label>Address Line</label>
                  <input type="text" name="addressLine" value={address.addressLine} onChange={handleAddressChange} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={address.city} onChange={handleAddressChange} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" value={address.state} onChange={handleAddressChange} />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary address-confirm-btn"
                  onClick={() => setIsEditingAddress(false)}
                >
                  Confirm Address
                </button>
              </div>
            ) : (
              <div className="section-content">
                <p className="address-summary-line">
                  <strong>{address.fullName}</strong>, {address.addressLine}, {address.city}, {address.pincode}
                </p>
                <p className="address-delivery-note">
                  Expected delivery: {estimatedDate}
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Offers */}
          <div className="checkout-offers-wrapper">
             <div className="offers-title">🔥 Exclusive Offers for you</div>
             <div className="offers-grid">
                {OFFERS.map(offer => (
                   <div key={offer.id} className="offer-card">
                      <span className="offer-label">{offer.label}</span>
                      <span className="offer-desc">{offer.desc}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Section 3: Payment */}
          <div className="checkout-section-card">
             <div className="section-header">
                <span className="section-number">2</span>
                <h2>Payment Method</h2>
             </div>
             
             <div className="section-content payment-methods-list">
                {PAYMENT_METHODS.map((pm) => (
                   <div 
                    key={pm.id} 
                    className={`payment-method-card ${paymentMethod === pm.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(pm.id)}
                   >
                      <div className="pm-radio-wrap">
                        <input type="radio" checked={paymentMethod === pm.id} readOnly />
                      </div>
                      <div className="pm-content">
                         <div className="pm-header">
                            <span className="pm-label">{pm.label}</span>
                            <div className="pm-icons">
                               {pm.icons.map((icon, idx) => (
                                 <img key={idx} src={icon} alt="icon" className="pm-icon-img" />
                               ))}
                            </div>
                         </div>
                         <p className="pm-desc">{pm.desc}</p>
                         
                         {paymentMethod === pm.id && pm.id === "UPI" && (
                           <div className="pm-form-area">
                              <div className="form-group">
                                 <label>Enter UPI ID</label>
                                 <input 
                                   type="text" 
                                   placeholder="e.g. user@bank" 
                                   value={upiId} 
                                   onChange={(e) => setUpiId(e.target.value)}
                                   onClick={(e) => e.stopPropagation()} 
                                 />
                              </div>
                           </div>
                         )}

                         {paymentMethod === pm.id && pm.id === "CARD" && (
                            <div className="pm-form-area">
                              <div className="form-group pm-form-group-tight">
                                <label>Card number</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="cc-number"
                                  placeholder="0000 0000 0000 0000"
                                  onChange={(e) =>
                                    setCardInfo({ ...cardInfo, number: e.target.value })
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="pm-card-row">
                                <div className="form-group">
                                  <label>Expiry</label>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="MM/YY"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>CVV</label>
                                  <input
                                    type="password"
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                    placeholder="•••"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                            </div>
                         )}

                         {paymentMethod === pm.id && pm.id === "COD" && (
                            <div className="pm-form-area">
                              <p className="pm-cod-note">
                                Pay via cash, UPI, or card at the time of delivery.
                              </p>
                            </div>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="checkout-sidebar">
           <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-row">
                 <span>Items:</span>
                 <span>{formatInr(subtotal)}</span>
              </div>
              <div className="summary-row">
                 <span>Delivery:</span>
                 <span>{deliveryCharges > 0 ? formatInr(deliveryCharges) : "FREE"}</span>
              </div>
              <div className="summary-row">
                 <span>Tax:</span>
                 <span>{formatInr(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                   <span>Promotion Applied:</span>
                   <span>- {formatInr(discount)}</span>
                </div>
              )}
              <div className="summary-total">
                 <span>Order Total:</span>
                 <span>{formatInr(finalTotal)}</span>
              </div>

              <button 
                className="btn btn-amazon place-order-btn" 
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Your Order"}
              </button>
           </div>

          <div className="sidebar-items-preview">
              <h4>Items in this order</h4>
              {items.map((item) => (
                <div key={item.id} className="item-preview-row">
                  <ProductImage
                    product={item}
                    alt={item.name || "Product"}
                    className="item-preview-thumb"
                  />
                  <div className="item-preview-meta">
                    <p className="item-preview-name">{item.name}</p>
                    <p className="item-preview-price">{formatInr(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
        </aside>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="checkout-mobile-bar">
        <div className="mobile-total-info">
          <span className="mobile-total-amount">{formatInr(finalTotal)}</span>
          <span className="mobile-total-hint">Total · incl. tax</span>
        </div>
        <button
          type="button"
          className="btn btn-amazon mobile-place-btn"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? "Processing..." : "Place order"}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
