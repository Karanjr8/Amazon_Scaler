import { useEffect, useState } from "react";
import { fetchOrderHistory } from "../api/ordersApi";
import { formatInr } from "../utils/formatInr";
import "../styles/Checkout.css";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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

    loadOrders();
  }, []);

  return (
    <div className="orders-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1>Your Orders</h1>
      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="no-orders" style={{ textAlign: 'center', padding: '100px' }}>
          <h3>You haven't placed any orders yet.</h3>
        </div>
      )}

      <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((order) => {
          const address = typeof order.delivery_address === 'string' 
            ? JSON.parse(order.delivery_address) 
            : order.delivery_address;
            
          return (
            <article key={order.id} className="order-card" style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <div className="order-header" style={{ background: '#f6f6f6', padding: '15px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div className="header-item">
                  <span style={{ fontSize: '12px', color: '#565959', textTransform: 'uppercase' }}>Order Placed</span>
                  <p style={{ margin: 0 }}>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="header-item">
                  <span style={{ fontSize: '12px', color: '#565959', textTransform: 'uppercase' }}>Total</span>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{formatInr(order.total)}</p>
                </div>
                <div className="header-item">
                  <span style={{ fontSize: '12px', color: '#565959', textTransform: 'uppercase' }}>Ship To</span>
                  <p style={{ margin: 0, color: '#007185' }}>{address?.fullName || 'User'}</p>
                </div>
                <div className="header-item" style={{ flexGrow: 1, textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#565959', textTransform: 'uppercase' }}>Order # {order.id}</span>
                  <p style={{ margin: 0 }}>Payment: {order.payment_method}</p>
                </div>
              </div>
              
              <div className="order-body" style={{ padding: '20px' }}>
                <div className="order-address-box" style={{ marginBottom: '15px', fontSize: '14px' }}>
                  <strong>Delivery Address:</strong> {address?.addressLine}, {address?.city}, {address?.pincode}
                </div>
                <ul className="order-items-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {order.items.map((item) => (
                    <li key={item.id} style={{ display: 'flex', gap: '20px', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                       <div className="item-info">
                         <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#007185' }}>{item.product_name}</p>
                         <p style={{ margin: 0, fontSize: '13px' }}>{formatInr(item.unit_price)} × {item.quantity}</p>
                       </div>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default OrderHistory;
