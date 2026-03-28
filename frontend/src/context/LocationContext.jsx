import { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("amz_user_location");
    return saved ? JSON.parse(saved) : { city: "", pincode: "", lat: null, lng: null };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem("amz_user_location", JSON.stringify(location));
  }, [location]);

  const reverseGeocode = async (lat, lng) => {
    try {
      setLoading(true);
      setError(null);
      // Nominatim (OpenStreetMap)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      
      const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
      const pincode = data.address.postcode || "";

      const newLoc = { city, pincode, lat, lng };
      setLocation(newLoc);
      return newLoc;
    } catch (err) {
      setError("Unable to identify location from GPS.");
      console.error("Reverse Geocoding Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        reject("Not supported");
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const result = await reverseGeocode(latitude, longitude);
          resolve(result);
        },
        (err) => {
          setLoading(false);
          setError("Location access denied.");
          reject(err);
        }
      );
    });
  };

  const updateManualLocation = (city, pincode) => {
    setLocation({ city, pincode, lat: null, lng: null });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        loading,
        error,
        detectLocation,
        updateManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
