const productModel = require("../models/productModel");

function setNoCacheHeaders(res) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
}

const getHeroImages = async (req, res, next) => {
  try {
    const raw = parseInt(String(req.query.limit || "5"), 10);
    const limit = Number.isFinite(raw) ? raw : 5;
    const urls = await productModel.getLatestHeroImageUrls(limit);
    setNoCacheHeaders(res);
    res.status(200).json({
      success: true,
      data: { urls },
    });
  } catch (error) {
    next(error);
  }
};

const listProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;

    const products = await productModel.getAllProducts({
      search,
      category,
      minPrice,
      maxPrice,
      sort,
    });

    const normalizedProducts = products.map((p) => ({
      id: p.id,
      title: p.name || "Untitled Product",
      price: p.price || 0,
      image: p.image_url || null,
      image_url: p.image_url || null,
      rating: {
        rate: p.rating || p.avg_rating || 0,
      },
      // Keep extra fields for internal use if needed, but Step 3 focuses on the above
      category: p.category,
      description: p.description,
      stock: p.stock
    }));

    if (process.env.NODE_ENV !== "production") {
      console.log("[GET /products] Normalization SUCCESS. Count:", normalizedProducts.length);
    }

    setNoCacheHeaders(res);
    res.status(200).json({
      success: true,
      data: normalizedProducts,
    });
  } catch (error) {
    console.error("[GET /api/products] CONTROLLER ERROR (500):", error.message);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

const getProductDetails = async (req, res, next) => {
  try {
    const product = await productModel.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const normalizedProduct = {
      id: product.id,
      title: product.name || "Untitled Product",
      price: product.price || 0,
      image: product.image_url || null,
      image_url: product.image_url || null,
      rating: {
        rate: product.rating || product.avg_rating || 0,
      },
      category: product.category,
      description: product.description,
      stock: product.stock,
      brand: product.brand,
      seller_name: product.seller_name,
      original_price: product.original_price,
      images: product.images,
      reviews: product.reviews || [],
      specifications: product.specifications || null
    };

    if (process.env.NODE_ENV !== "production") {
      console.log("[GET /products/:id] Normalization SUCCESS for ID:", product.id);
    }

    setNoCacheHeaders(res);
    return res.status(200).json({
      success: true,
      data: normalizedProduct,
    });
  } catch (error) {
    console.error("[GET /api/products/:id] CONTROLLER ERROR (500):", error.message);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { 
      name, description, price, stock, category, image_url, 
      brand, seller_name, original_price, images 
    } = req.body;

    // Detailed debug logging
    console.log("[POST /api/products] Payload received:", JSON.stringify({
      name, 
      price, 
      stock, 
      category, 
      image_url,
      brand,
      seller_name,
      original_price,
      imagesCount: Array.isArray(images) ? images.length : 0,
    }, null, 2));

    if (!name || price === undefined) {
      console.warn("[POST /api/products] Validation failed: missing name or price");
      return res.status(400).json({
        success: false,
        message: "Name and price are required",
      });
    }

    const nPrice = Number(price);
    const nStock = stock !== undefined ? Number(stock) : 0;
    const nOriginalPrice = original_price ? Number(original_price) : null;

    if (isNaN(nPrice)) {
      console.warn("[POST /api/products] Validation failed: price is not a number", { price });
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number",
      });
    }

    const newProduct = await productModel.createProduct({
      name,
      description,
      price: nPrice,
      stock: nStock,
      category: category || "Other",
      image_url,
      brand,
      seller_name,
      original_price: nOriginalPrice,
      images: Array.isArray(images) ? images : null,
    });

    console.log("[POST /api/products] Success. Inserted ID:", newProduct.id);

    // STEP 4 EXPLICIT REQUIREMENT: Immediately run query to verify data persistence
    console.log("[POST /api/products] Running Data Persistence Challenge...");
    const checkDb = require("../config/db"); // direct ad-hoc import for verification
    const { rows: persistedProducts } = await checkDb.query("SELECT * FROM products ORDER BY id DESC LIMIT 5");
    console.log("[POST /api/products] PERSISTENCE CONFIRMED. Last 5 Products:");
    console.table(persistedProducts.map(p => ({ id: p.id, name: p.name, created_at: p.created_at })));

    res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error("[POST /api/products] Controller Error (500):", error);
    res.status(500).json({ success: false, message: "Database Error", error: error.message });
  }
};

module.exports = {
  getHeroImages,
  listProducts,
  getProductDetails,
  createProduct,
};
