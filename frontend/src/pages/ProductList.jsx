import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../api/productsApi";
import HeroBanner from "../components/HeroBanner";
import ProductCard from "../components/ProductCard";
import { formatInr } from "../utils/formatInr";
import ProductImage from "../components/ProductImage";
import { getProductDisplayName, getProductPrice } from "../utils/productFields";

const MAX_PRODUCTS_PER_CATEGORY = 4;

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [searchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category")?.trim() || "";
  const paramSearch = searchParams.get("q")?.trim() || "";

  const isBrowseMode = Boolean(paramSearch) || Boolean(selectedCategory);

  useEffect(() => {
    setSearch(paramSearch);
  }, [paramSearch]);

  useEffect(() => {
    let requestId = 0;

    const loadProducts = async () => {
      const myId = ++requestId;
      try {
        setLoading(true);
        setError("");
        const params = {};

        if (isBrowseMode) {
          if (paramSearch) params.search = paramSearch;
          if (selectedCategory) params.category = selectedCategory;
          if (sort) params.sort = sort;
        }

        const data = await fetchProducts(params);
        if (myId !== requestId) return;
        const list = Array.isArray(data) ? data : [];
        console.log("Fetched Products for List Component:", list);
        setProducts(list);
      } catch (_err) {
        if (myId !== requestId) return;
        setError("Failed to load products. Is the API running at /api/products?");
        setProducts([]);
      } finally {
        if (myId === requestId) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadProducts();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      requestId += 1;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isBrowseMode, paramSearch, selectedCategory, sort]);

  const sortProducts = (list) =>
    [...list].sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      if (sort === "price_asc") return priceA - priceB;
      if (sort === "price_desc") return priceB - priceA;
      return Number(b.id) - Number(a.id);
    });

  const matchesSearch = (item, normalizedSearch) => {
    if (!normalizedSearch) return true;
    const q = normalizedSearch;
    const name = (item.name || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    return name.includes(q) || desc.includes(q);
  };

  const homeGroupedCategories = useMemo(() => {
    if (isBrowseMode) return [];
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = products.filter((item) => matchesSearch(item, normalizedSearch));

    const groups = filtered.reduce((acc, item) => {
      const categoryLabel = item?.category || "Other";
      if (!acc[categoryLabel]) acc[categoryLabel] = [];
      acc[categoryLabel].push(item);
      return acc;
    }, {});

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([categoryTitle, items]) => ({
        categoryTitle,
        items: sortProducts(items).slice(0, MAX_PRODUCTS_PER_CATEGORY),
      }))
      .filter((g) => g.items.length > 0);
  }, [products, search, sort, isBrowseMode]);

  const browseProducts = useMemo(() => {
    if (!isBrowseMode) return [];
    return products;
  }, [isBrowseMode, products]);

  return (
    <div className="home-page">
      {!isBrowseMode && <HeroBanner />}

      {isBrowseMode ? (
        <section className={`page-section home-page-section home-page-section--browse container ${paramSearch ? 'search-page' : ''} ${selectedCategory ? 'category-page' : ''}`}>
          <header className="home-browse-header">
            <h1 className="page-title home-browse-title">
              Results for &quot;{paramSearch || selectedCategory}&quot;
            </h1>
          </header>

          <div className="listing-filters-row">
            <label className="listing-filter-field">
              <span className="listing-filter-label">Sort By</span>
              <select
                className="listing-filter-select"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
          </div>

          <p className="listing-filters-summary">
            {loading ? "Loading…" : `${products.length} products found`}
          </p>

          {loading && (
            <div className="product-grid home-browse-grid" aria-busy="true">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="product-card skeleton" aria-hidden />
              ))}
            </div>
          )}

          {error && (
            <div className="home-api-error" role="alert">
              <p className="error">{error}</p>
              <p className="home-api-error-hint">
                Check that the backend is running and{" "}
                <code>VITE_API_BASE_URL</code> points to <code>http://localhost:5000/api</code>{" "}
                (or your server URL).
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {browseProducts.length === 0 ? (
                <p className="home-empty">No products match your search.</p>
              ) : (
                <div className="product-grid home-browse-grid">
                  {browseProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        <div className="amz-home-content">
          {loading && (
            <p className="home-page-loading" aria-live="polite">
              Loading products from catalog…
            </p>
          )}
          {error && !loading && (
            <div className="home-api-error home-api-error--home" role="alert">
              <p className="error">{error}</p>
              <p className="home-api-error-hint">
                Verify <strong>GET /api/products</strong> and PostgreSQL. In dev, check the browser
                Network tab and console for <code>[API] GET /products</code>.
              </p>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="home-empty">
              No products in the database yet. Add rows to <code>products</code>.
            </p>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="amz-grid-row">
                {homeGroupedCategories.map((group) => (
                  <div key={group.categoryTitle} className="amz-card">
                    <h2>Up to 60% off | {group?.categoryTitle || "Special Selection"}</h2>
                    <div className="amz-card-four-grid">
                      {group.items.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          className="amz-four-grid-item amz-plain-link"
                        >
                          <div className="amz-four-grid-img-wrap">
                            <ProductImage
                              product={product}
                              className="amz-four-grid-img"
                              alt={getProductDisplayName(product)}
                            />
                          </div>
                          <span className="amz-four-grid-label">
                            {getProductDisplayName(product) || "Product"}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      to={`/?category=${encodeURIComponent(group.categoryTitle)}`}
                      className="amz-card-link"
                    >
                      See all offers
                    </Link>
                  </div>
                ))}
              </div>

              <div className="amz-scroller-section">
                <h2>Based on your browsing history</h2>
                <div className="amz-scroller-row">
                  {products.slice(0, 15).map((product) => (
                    <Link
                      key={`scroll-${product.id}`}
                      to={`/products/${product.id}`}
                      className="amz-scroller-item amz-plain-link"
                    >
                      <ProductImage
                        product={product}
                        alt={getProductDisplayName(product)}
                      />
                      <span className="amz-scroller-item-title">
                        {getProductDisplayName(product) || "Product"}
                      </span>
                      <span className="amz-scroller-item-price">
                        {formatInr(getProductPrice(product))}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductList;
