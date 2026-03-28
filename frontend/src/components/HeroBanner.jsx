import { useEffect, useState } from "react";
import { fetchHeroImages } from "../api/productsApi";
import ProductImage from "./ProductImage";
import { PRODUCT_IMAGE_PLACEHOLDER } from "../utils/productFields";

const ROTATE_MS = 6500;

function HeroBanner() {
  const [urls, setUrls] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchHeroImages(8);
        if (!cancelled && Array.isArray(list) && list.length > 0) {
          setUrls(list);
          setIndex(0);
        }
      } catch {
        /* fall through to placeholder */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (urls.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % urls.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [urls.length]);

  const src =
    urls.length > 0 ? urls[index % urls.length] : PRODUCT_IMAGE_PLACEHOLDER;

  return (
    <section className="amz-hero-container" aria-label="Featured catalog images">
      <ProductImage
        src={src}
        alt="Highlights from our catalog"
        className="amz-hero-img"
        loading="eager"
        cacheBustId={`hero-${index}`}
      />
    </section>
  );
}

export default HeroBanner;
