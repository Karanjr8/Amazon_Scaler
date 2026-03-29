import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchOrderHistory, cancelOrder } from "../api/ordersApi";
import { formatInr } from "../utils/formatInr";
import { useToast } from "../context/ToastContext";
import "../styles/amazon-ui.css";

const TABS = [
  { id: "all", label: "Orders" },
  { id: "buy-again", label: "Buy Again" },
  { id: "not-shipped", label: "Not Yet Shipped" },
  { id: "cancelled", label: "Cancelled" }
];

function OrderHistory() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'cancel' or 'return'
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchOrderHistory();
      setOrders(data);
    } catch (_error) {
      setError("Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusInfo = (order) => {
    if (order.status === 'cancelled') return { label: 'Cancelled', color: '#b12704', showReview: false, isCancelled: true };
    if (order.status === 'returned') return { label: 'Returned', color: '#b12704', showReview: false, isReturned: true };
    
    const created = new Date(order.created_at);
    const now = new Date();
    const diffHours = (now - created) / (1000 * 60 * 60);

    // Amazon-style delivery timeline
    if (diffHours < 2) {
      const arrivingDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const formattedDate = arrivingDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      return { label: `Arriving by ${formattedDate}`, color: '#007600', showReview: false, isPending: true };
    }
    if (diffHours < 24) {
      return { label: 'Shipped - Arriving tomorrow', color: '#007600', showReview: false, isShipped: true };
    }
    const deliveredDate = new Date(created.getTime() + 24 * 60 * 60 * 1000);
    const formattedDeliveredDate = deliveredDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    return { label: `Delivered ${formattedDeliveredDate}`, color: '#0f1111', showReview: true, isDelivered: true };
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Tab Filter
    if (activeTab === "cancelled") {
      result = result.filter(o => o.status === 'cancelled');
    } else if (activeTab === "all") {
      result = result.filter(o => o.status !== 'cancelled' && o.status !== 'returned');
    } else {
        result = [];
    }

    // Search Filter
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id.toString().includes(s) || 
        o.items.some(item => (item.current_product_name || item.product_name).toLowerCase().includes(s))
      );
    }

    return result;
  }, [orders, activeTab, searchTerm]);

  const buyAgainItems = useMemo(() => {
    // Only items from delivered orders
    const items = [];
    orders.forEach(o => {
        const info = getStatusInfo(o);
        if (info.isDelivered) {
            o.items.forEach(i => {
                // Find if item already in list (unique products)
                if (!items.find(x => x.product_id === i.product_id)) {
                    items.push(i);
                }
            });
        }
    });

    // Search Filter
    if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        return items.filter(i => (i.current_product_name || i.product_name).toLowerCase().includes(s));
    }

    return items;
  }, [orders, searchTerm]);

  const openModal = (orderId, mode) => {
    setSelectedOrderId(orderId);
    setModalMode(mode);
    setReason("");
  };

  const closeModal = () => {
    if (!submitting) {
      setModalMode(null);
      setSelectedOrderId(null);
    }
  };

  const handleAction = async () => {
    if (!reason) {
      showToast("Please select a reason", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'cancel') {
        await cancelOrder(selectedOrderId, reason);
        showToast("Order cancelled successfully", "success");
        setOrders(prev => prev.map(o => o.id === selectedOrderId ? { ...o, status: 'cancelled' } : o));
      } else {
        await new Promise(res => setTimeout(res, 1000));
        showToast("Return request submitted successfully", "success");
        setOrders(prev => prev.map(o => o.id === selectedOrderId ? { ...o, status: 'returned' } : o));
      }
      setModalMode(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackPackage = () => {
    showToast("Tracking information will be available once the carrier updates their status.", "info");
  };

  const handleBuyAgain = () => {
    showToast("Product added to cart!", "success");
  };

  return (
    <div className="orders-container">
      <nav className="breadcrumb" style={{ fontSize: '12px', marginBottom: '10px' }}>
        <Link to="/" style={{ color: '#007185', textDecoration: 'none' }}>Your Account</Link> › <span style={{ color: '#c45500' }}>{activeTab === 'buy-again' ? 'Buy Again' : 'Your Orders'}</span>
      </nav>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
        <h1 className="orders-title">{activeTab === 'buy-again' ? 'Buy Again' : 'Your Orders'}</h1>
        <div className="orders-search" style={{ display: 'flex', position: 'relative', width: '300px' }}>
             <input 
                type="text" 
                placeholder="Search all items"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '6px 35px 6px 12px', borderRadius: '4px', border: '1px solid #888' }}
             />
             <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>🔍</span>
        </div>
      </div>

      <div className="orders-nav">
        {TABS.map(tab => (
          <div 
            key={tab.id} 
            className={`orders-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {activeTab === 'buy-again' ? (
        <div className="buy-again-view">
             <p style={{ fontSize: '14px', marginBottom: '15px', color: '#0f1111' }}>
                Your previously purchased items that are available to buy again.
             </p>
             {buyAgainItems.length === 0 ? (
                 <div style={{ border: '1px solid #d5d9d9', borderRadius: '8px', padding: '40px', textAlign: 'center', background: 'white' }}>
                    <p>No items found to buy again. Items will appear here once they are delivered.</p>
                 </div>
             ) : (
                 <div className="amz-grid-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {buyAgainItems.map(item => (
                        <div key={item.id} className="amz-card" style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                             <img src={item.image_url} alt={item.current_product_name} style={{ width: '100%', height: '160px', objectFit: 'contain', marginBottom: '10px' }} />
                             <Link to={`/products/${item.product_id}`} className="order-item-name" style={{ marginBottom: '8px', height: '3.6em', overflow: 'hidden' }}>
                                {item.current_product_name || item.product_name}
                             </Link>
                             <div style={{ marginTop: 'auto' }}>
                                 <p style={{ color: '#b12704', fontWeight: 'bold', fontSize: '16px', margin: '0 0 10px' }}>{formatInr(item.unit_price)}</p>
                                 <button className="amz-btn-secondary" style={{ width: '100%', background: '#ffd814', borderColor: '#fcd200' }} onClick={handleBuyAgain}>Buy it again</button>
                             </div>
                        </div>
                    ))}
                 </div>
             )}
        </div>
      ) : (
        <div className="orders-view">
          <p style={{ fontSize: '14px', marginBottom: '15px', color: '#0f1111' }}>
            <strong>{filteredOrders.length} orders</strong> placed in the last 3 months
          </p>

          {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading your orders...</div>}
          
          {!loading && filteredOrders.length === 0 && (
            <div style={{ border: '1px solid #d5d9d9', borderRadius: '8px', padding: '40px', textAlign: 'center', background: 'white' }}>
              <p>No orders found matching your criteria.</p>
              {searchTerm && <button onClick={() => setSearchTerm("")} style={{ color: '#007185', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear search</button>}
            </div>
          )}

          <div className="orders-list">
            {filteredOrders.map((order) => {
              const address = typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address;
              const statusInfo = getStatusInfo(order);
              
              return (
                <article key={order.id} className="amz-order-card">
                  <div className="amz-order-header">
                    <div className="header-group">
                      <div className="header-info-box">
                        <span className="header-label">Order Placed</span>
                        <span className="header-value">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="header-info-box">
                        <span className="header-label">Total</span>
                        <span className="header-value">{formatInr(order.total)}</span>
                      </div>
                      <div className="header-info-box">
                        <span className="header-label">Ship To</span>
                        <span className="header-value" style={{ color: '#007185', cursor: 'pointer' }}>{address?.fullName || "User"} ▼</span>
                      </div>
                    </div>
                    <div className="header-info-box" style={{ textAlign: 'right' }}>
                      <span className="header-label">Order # {order.id}</span>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '13px', marginTop: '2px' }}>
                        <span style={{ color: '#007185', cursor: 'pointer' }}>Order Details</span>
                        <span style={{ color: '#d5d9d9' }}>|</span>
                        <span style={{ color: '#007185', cursor: 'pointer' }}>Invoice ▼</span>
                      </div>
                    </div>
                  </div>

                  <div className="amz-order-content">
                    <div className="order-status-banner" style={{ color: statusInfo.color }}>
                      {statusInfo.label}
                    </div>
                    
                    <div className="amz-order-items-list">
                      {order.items.map((item) => (
                        <div key={item.id} className="amz-order-item">
                          <div className="order-item-main">
                            <img src={item.image_url} alt={item.current_product_name || item.product_name} className="order-item-img" />
                            <div className="order-item-detail">
                               <Link to={`/products/${item.product_id}`} className="order-item-name">
                                  {item.current_product_name || item.product_name}
                               </Link>
                               <span className="order-item-meta">Sold by: Amazon Retail Limited</span>
                               <div style={{ marginTop: '8px' }}>
                                  <button className="amz-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setActiveTab('buy-again')}>View product</button>
                               </div>
                            </div>
                          </div>
                          
                          <div className="order-actions">
                             <button className="amz-btn-secondary" style={{ background: '#ffd814', borderColor: '#fcd200' }} onClick={handleTrackPackage}>Track package</button>
                             {(!statusInfo.isReturned && order.status !== 'cancelled') && (
                               <>
                                 <button className="amz-btn-secondary" onClick={() => openModal(order.id, 'return')}>Return or replace items</button>
                                 {statusInfo.isPending && (
                                   <button className="amz-btn-secondary" onClick={() => openModal(order.id, 'cancel')}>Cancel Order</button>
                                 )}
                               </>
                             )}
                             {statusInfo.showReview && (
                                <button className="amz-btn-secondary">Leave product review</button>
                             )}
                             <button className="amz-btn-secondary">Write a seller feedback</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {modalMode && (
        <div className="amz-modal-overlay">
          <div className="amz-modal">
            <div className="amz-modal-header">
              <h2>{modalMode === 'cancel' ? "Cancel Order" : "Return Items"}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="amz-modal-body">
              <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                {modalMode === 'cancel' 
                  ? `Are you sure you want to cancel Order #${selectedOrderId}? This action cannot be undone.` 
                  : `Select the reason for returning the items in Order #${selectedOrderId}. You will receive a refund once the items are processed.`}
              </p>
              
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                Reason for {modalMode === 'cancel' ? 'cancellation' : 'return'}
              </label>
              <select 
                className="amz-select-box"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                {modalMode === 'cancel' ? (
                  <>
                    <option value="Mistake">Ordered by mistake</option>
                    <option value="Price">Found cheaper elsewhere</option>
                    <option value="Shipping">Delivery too late</option>
                    <option value="Other">Other reason</option>
                  </>
                ) : (
                  <>
                    <option value="Damaged">Item arrived damaged</option>
                    <option value="Wrong">Wrong item was sent</option>
                    <option value="Performance">Poor performance/quality</option>
                    <option value="NoNeeded">No longer needed</option>
                  </>
                )}
              </select>
            </div>
            <div className="amz-modal-footer">
               <button className="amz-btn-secondary" onClick={closeModal} disabled={submitting}>Close</button>
               <button 
                  className={`amz-btn-secondary ${modalMode === 'cancel' ? 'amz-btn-danger-outline' : ''}`}
                  style={modalMode === 'return' ? { background: '#ffd814', borderColor: '#fcd200' } : {}}
                  onClick={handleAction}
                  disabled={submitting}
               >
                 {submitting ? "Processing..." : modalMode === 'cancel' ? "Confirm Cancellation" : "Submit Return"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
