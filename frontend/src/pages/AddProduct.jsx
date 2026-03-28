import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../api/productsApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "../styles/ProductForm.css";

const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Beauty & Personal Care", "Sports & Outdoors", "Other"];

function AddProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: CATEGORIES[0],
    description: "",
    price: "",
    original_price: "",
    stock: "10",
    isAvailable: true,
    seller_name: user?.name || "",
    location: "India",
  });

  const [images, setImages] = useState([""]); // Array of URL strings

  // Auto-calculated discount
  const discountPercent = useMemo(() => {
    const p = Number(formData.price) || 0;
    const op = Number(formData.original_price) || 0;
    if (op > 0 && p > 0 && op > p) {
      return Math.round(((op - p) / op) * 100);
    }
    return 0;
  }, [formData.price, formData.original_price]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => {
    if (images.length < 5) {
      setImages([...images, ""]);
    } else {
      showToast("Maximum 5 images allowed for preview.", "error");
    }
  };

  const removeImageField = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    if (newImages.length === 0) setImages([""]);
    else setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clean image array (remove empty)
    const validImages = images.filter((img) => img.trim() !== "");
    if (validImages.length === 0) {
      setError("Please provide at least one valid image URL.");
      setLoading(false);
      return;
    }

    // Append fallback location info to description safely
    let appendedDesc = formData.description;
    if (formData.location) {
      appendedDesc += `\n\nShips from: ${formData.location}`;
    }

    const payload = {
      name: formData.name,
      brand: formData.brand || null,
      category: formData.category,
      description: appendedDesc,
      price: formData.price,
      original_price: formData.original_price || null,
      stock: formData.isAvailable ? formData.stock : "0",
      seller_name: formData.seller_name || null,
      image_url: validImages[0], // primary image
      images: validImages,       // all gallery images array
    };

    console.log("[AddProduct] Submitting payload:", payload);

    try {
      const response = await createProduct(payload);
      console.log("[AddProduct] API Success:", response);
      showToast("Product listed successfully!", "success");
      navigate("/"); // Refetch logic triggers naturally when Home auto-remounts fetching all items
    } catch (err) {
      console.error("[AddProduct] API Error:", err);
      setError(err.response?.data?.message || "Failed to list product.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-page-wrapper">
      <div className="seller-form-header">
        <h1>Add a New Product</h1>
        <p>List your item and reach millions of customers globally.</p>
      </div>

      <div className="seller-form-container">
        {error && <div className="seller-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="seller-form">
          {/* Section 1: Basic Info */}
          <div className="seller-form-section">
            <h2 className="seller-section-title">1. Basic Information</h2>
            
            <div className="form-group">
              <label>Product Title <span className="req">*</span></label>
              <input 
                 type="text" name="name" 
                 value={formData.name} onChange={handleChange} 
                 placeholder="e.g. 2024 Wireless Noise Cancelling Headphones"
                 maxLength="150" required 
              />
              <span className="input-hint">Use a concise, descriptive title.</span>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Brand (Optional)</label>
                <input 
                  type="text" name="brand" 
                  value={formData.brand} onChange={handleChange} 
                  placeholder="e.g. Sony"
                />
              </div>
              <div className="form-group flex-1">
                <label>Category <span className="req">*</span></label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description (Markdown supported)</label>
              <textarea 
                name="description" 
                value={formData.description} onChange={handleChange} 
                rows="5"
                placeholder="Detail the key features, specifications, and what is included in the box."
              />
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div className="seller-form-section">
            <h2 className="seller-section-title">2. Pricing</h2>
            
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Selling Price (&#8377;) <span className="req">*</span></label>
                <input 
                  type="number" step="0.01" min="0" name="price" 
                  value={formData.price} onChange={handleChange} required 
                />
              </div>
              <div className="form-group flex-1">
                <label>Original MRP (&#8377;) (Optional)</label>
                <input 
                  type="number" step="0.01" min="0" name="original_price" 
                  value={formData.original_price} onChange={handleChange} 
                />
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="discount-preview">
                 <strong>Preview:</strong> Your product will display a <span className="discount-tag">-{discountPercent}%</span> discount badge.
              </div>
            )}
          </div>

          {/* Section 3: Inventory & Seller */}
          <div className="seller-form-section">
            <h2 className="seller-section-title">3. Inventory & Fulfillment</h2>
            
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Inventory Quantity <span className="req">*</span></label>
                <input 
                  type="number" min="0" name="stock" 
                  value={formData.stock} onChange={handleChange} required 
                  disabled={!formData.isAvailable}
                />
              </div>
              <div className="form-group flex-1 toggle-group">
                <label>Currently Available</label>
                <label className="switch">
                  <input 
                    type="checkbox" name="isAvailable" 
                    checked={formData.isAvailable} onChange={handleChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Seller Display Name</label>
                <input 
                  type="text" name="seller_name" 
                  value={formData.seller_name} onChange={handleChange} 
                  placeholder="Appario Retail"
                />
              </div>
              <div className="form-group flex-1">
                <label>Dispatch Location</label>
                <input 
                  type="text" name="location" 
                  value={formData.location} onChange={handleChange} 
                  placeholder="e.g. Mumbai, Maharashtra"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Media Gallery */}
          <div className="seller-form-section">
            <h2 className="seller-section-title">4. Media Gallery (URLs)</h2>
            <p className="section-desc">Provide direct public links ending in .jpg or .png.</p>
            
            <div className="image-manager">
              <div className="img-inputs">
                {images.map((img, idx) => (
                  <div key={idx} className="img-input-row">
                    <span className="img-number">{idx + 1}.</span>
                    <input 
                       type="url"
                       value={img}
                       onChange={(e) => handleImageChange(idx, e.target.value)}
                       placeholder={`https://example.com/image${idx + 1}.jpg`}
                       required={idx === 0} // Only first is strictly required
                    />
                    {images.length > 1 && (
                      <button type="button" className="btn-remove-img" onClick={() => removeImageField(idx)}>✕</button>
                    )}
                  </div>
                ))}
                {images.length < 5 && (
                  <button type="button" className="btn-add-img" onClick={addImageField}>
                    + Add Another Image
                  </button>
                )}
              </div>
              
              <div className="img-preview-grid">
                 {images.map((img, idx) => {
                    const isValid = img && (img.startsWith('http') || img.startsWith('data:'));
                    return (
                       <div key={idx} className="img-preview-box">
                          {isValid ? <img src={img} alt={`Preview ${idx+1}`} /> : <span className="no-img">Image {idx+1}</span>}
                       </div>
                    )
                 })}
              </div>
            </div>
          </div>

          <div className="seller-form-actions">
            <button 
               type="button" 
               className="btn-cancel"
               onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button 
               type="submit" 
               className="btn-submit" 
               disabled={loading}
            >
              {loading ? "Listing Product..." : "List Product Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
