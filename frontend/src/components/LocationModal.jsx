import { useState } from "react";
import { useLocation } from "../context/LocationContext";
import "../styles/Location.css";

const LocationModal = ({ onClose }) => {
  const { location, loading, error, detectLocation, updateManualLocation } = useLocation();
  const [pincode, setPincode] = useState(location.pincode || "");
  const [city, setCity] = useState(location.city || "");

  const handleApplyManual = (e) => {
    e.preventDefault();
    if (city.trim()) {
      updateManualLocation(city, pincode);
      onClose();
    }
  };

  const handleGPTDetect = async () => {
    try {
      await detectLocation();
      onClose();
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="location-modal-header">
          <h2>Choose your location</h2>
          <button className="location-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="location-modal-body">
          <p className="location-modal-text">
            Select a delivery location to see product availability and delivery options
          </p>
          
          <button 
            className="gps-button" 
            onClick={handleGPTDetect} 
            disabled={loading}
          >
            {loading ? "Locating..." : "📍 Use my current location"}
          </button>

          <div className="location-divider">or enter a city/pincode</div>

          <form className="manual-input-group" onSubmit={handleApplyManual}>
            <input 
              type="text" 
              placeholder="Enter Pincode (e.g. 110001)" 
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Enter City Name" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <button className="manual-apply-btn" type="submit">
              Apply
            </button>
          </form>

          {error && <div className="location-error">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
