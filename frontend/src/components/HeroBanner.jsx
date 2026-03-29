import { useEffect, useState, useCallback } from "react";

const HERO_IMAGES = [
  "https://images-eu.ssl-images-amazon.com/images/G/31/img18/HomeImprovement/harsmisc/2025/October/Home_essentials_rec_7th_dec_3000X1200_1._CB776442582_.jpg",
  "https://images-eu.ssl-images-amazon.com/images/G/31/AmazonBusiness/img26/march/gw/pchero/OfficeProducts_3000_1200_2302._CB784910781_.jpg",
  "https://images-eu.ssl-images-amazon.com/images/G/31/img21/APAY/MAYART/travel/Flight_PC-Hero-Template_GW-VX_3000x1200._CB795825459_.jpg",
  "https://images-eu.ssl-images-amazon.com/images/G/31/img24/Fresh/GW/Mar26/27_29Mar/Ambient/27th_GW_PC1x_Hero_NC._CB783390273_.jpg"
];

const ROTATE_MS = 5000;

function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
      setIsTransitioning(false);
    }, 300);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
      setIsTransitioning(false);
    }, 300);
  }, []);

  useEffect(() => {
    const id = setInterval(nextSlide, ROTATE_MS);
    return () => clearInterval(id);
  }, [nextSlide]);

  return (
    <section className="amz-hero-container" aria-label="Featured high-quality banners">
      <button 
        className="amz-hero-control amz-hero-control--prev" 
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        <span className="amz-hero-control-icon">‹</span>
      </button>

      <div className={`amz-hero-slide ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
        <img
          src={HERO_IMAGES[index]}
          alt={`Featured banner ${index + 1}`}
          className="amz-hero-img"
          loading="eager"
        />
      </div>

      <button 
        className="amz-hero-control amz-hero-control--next" 
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        <span className="amz-hero-control-icon">›</span>
      </button>
    </section>
  );
}

export default HeroBanner;
