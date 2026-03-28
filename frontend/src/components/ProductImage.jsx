import {
  appendImageCacheBust,
  getProductPrimaryImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "../utils/productFields";

/**
 * Uses DB `image_url` (via getProductPrimaryImage) + cache-bust when URL/id changes.
 */
function ProductImage({
  product,
  src,
  alt = "",
  className,
  loading = "lazy",
  cacheBustId,
  ...rest
}) {
  const raw = src ?? (product ? getProductPrimaryImage(product) : PRODUCT_IMAGE_PLACEHOLDER);
  const bustKey = cacheBustId ?? product?.id ?? null;
  const resolved =
    raw === PRODUCT_IMAGE_PLACEHOLDER ? raw : appendImageCacheBust(raw, bustKey);

  return (
    <img
      key={resolved}
      src={resolved}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget;
        const fallback = PRODUCT_IMAGE_PLACEHOLDER;
        if (!el.getAttribute("data-fallback-tried")) {
          el.setAttribute("data-fallback-tried", "1");
          el.src = fallback;
        }
      }}
      {...rest}
    />
  );
}

export default ProductImage;
