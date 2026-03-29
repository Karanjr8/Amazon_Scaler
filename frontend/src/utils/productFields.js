/**
 * Normalizes product records from the API (PostgreSQL) for display.
 * No hardcoded catalog — only field mapping + placeholder image.
 */

export const PRODUCT_IMAGE_PLACEHOLDER = "/placeholder.png";

export function parseImagesArray(images) {
  if (images == null || images === "") return [];
  if (Array.isArray(images)) {
    return images.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof images === "object" && images !== null) {
    const urls = images.urls ?? images.images;
    if (Array.isArray(urls)) {
      return urls.map((x) => String(x).trim()).filter(Boolean);
    }
  }
  if (typeof images === "string") {
    const t = images.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x).trim()).filter(Boolean);
      }
    } catch {
      return t ? [t] : [];
    }
  }
  return [];
}

/** Stable short token when URL or id changes → new request, avoids stale browser cache for same path. */
function cacheVersionToken(productId, url) {
  const idPart = productId != null && productId !== "" ? String(productId) : "";
  const u = url != null ? String(url) : "";
  let h = 0;
  const s = `${idPart}|${u}`;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return (h >>> 0).toString(16);
}

/**
 * Appends a cache-bust query param (does not alter data: or placeholder URLs).
 */
export function appendImageCacheBust(url, productId) {
  if (!url || url === PRODUCT_IMAGE_PLACEHOLDER) return url;
  if (/^data:/i.test(url.trim())) return url;

  const token = cacheVersionToken(productId, url);
  try {
    const u = new URL(url);
    u.searchParams.set("_cv", token);
    return u.href;
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}_cv=${token}`;
  }
}

export function getProductPrimaryImage(product) {
  const image = product?.image || product?.image_url || PRODUCT_IMAGE_PLACEHOLDER;
  return image;
}

export function getProductGalleryUrls(product) {
  if (!product || typeof product !== "object") {
    return [PRODUCT_IMAGE_PLACEHOLDER];
  }

  const urls = [];
  const seen = new Set();

  const add = (u) => {
    if (u == null) return;
    const s = String(u).trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    urls.push(s);
  };

  const primaryFields = [
    product.image_url,
    product.imageUrl,
    product.image,
    product.img,
    product.thumbnail_url,
  ];
  primaryFields.forEach(add);

  parseImagesArray(product.images).forEach(add);

  if (urls.length === 0) {
    add(PRODUCT_IMAGE_PLACEHOLDER);
  }

  return urls;
}

export function getProductDisplayName(product) {
  if (!product || typeof product !== "object") return "Product";
  const n = product.name ?? product.title ?? product.product_name;
  return n != null && String(n).trim() ? String(n).trim() : "Product";
}

export function getProductPrice(product) {
  if (!product || typeof product !== "object") return 0;
  const n = Number(product.price ?? product.cost ?? product.unit_price ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Rating from DB only (avg_rating / rating). Returns null if unknown. */
export function getProductRatingFromDb(product) {
  if (!product || typeof product !== "object") return null;
  
  const rate = product?.rating?.rate;
  
  const raw = product.avg_rating ?? rate ?? product.average_rating;
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.min(5, Math.max(0, n));
}

export function getProductReviewCountFromDb(product) {
  if (!product || typeof product !== "object") return null;
  
  const count = product?.rating?.count;
  
  const raw = product.review_count ?? count ?? product.reviews_count ?? product.num_reviews;
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}
