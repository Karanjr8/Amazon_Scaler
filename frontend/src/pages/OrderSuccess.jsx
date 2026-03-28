import { Link, useLocation } from "react-router-dom";
import "../styles/Checkout.css";

function OrderSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <div className="success-icon">✔️</div>
        <h1>Order placed successfully 🎉</h1>
        {orderId && (
          <p className="order-id">
            Order ID: <strong>#{orderId}</strong>
          </p>
        )}
        <p className="success-message">
          Thank you for shopping with us! Your items are on their way.
          You'll receive an email confirmation shortly.
        </p>
        
        <div className="success-actions">
          <Link to="/orders" className="btn btn-secondary">
            Go to My Orders
          </Link>
          <Link to="/" className="btn btn-amazon">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
