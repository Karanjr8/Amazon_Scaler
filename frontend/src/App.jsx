import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import AddProduct from "./pages/AddProduct";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderHistory from "./pages/OrderHistory";
import Wishlist from "./pages/Wishlist";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(true);
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {!isAuthRoute && (
        <Navbar 
          desktopSidebarCollapsed={desktopSidebarCollapsed} 
          setDesktopSidebarCollapsed={setDesktopSidebarCollapsed} 
        />
      )}
      <main className={`main-content ${isAuthRoute ? 'auth-page-wrapper' : `container ${desktopSidebarCollapsed ? 'expanded' : ''}`}`}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
