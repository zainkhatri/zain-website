import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Egomaniac.css';

import ego1 from './images/ego-optimized/ego1.jpg';
import ego2 from './images/ego-optimized/ego2.jpg';
import ego3 from './images/ego-optimized/ego3.jpg';
import ego4 from './images/ego-optimized/ego4.jpg';
import ego5 from './images/ego-optimized/ego5.jpg';
import ego6 from './images/ego-optimized/ego6.jpg';
import ego7 from './images/ego-optimized/ego7.jpg';
import ego8 from './images/ego-optimized/ego8.jpg';
import ego9 from './images/ego-optimized/ego9.jpg';
import ego10 from './images/ego-optimized/ego10.jpg';
import ego11 from './images/ego-optimized/ego11.jpg';
import ego12 from './images/ego-optimized/ego12.jpg';

const foodRecommendations = [
  {
    id: 1,
    name: "Chutney",
    description: "Authentic Indian cuisine in the heart of San Francisco. Rich, flavorful dishes that hit every time.",
    food: "Chicken Tikka Masala, Lamb Masala, Chicken Tandoori Leg",
    city: "San Francisco, CA",
    region: "Tenderloin",
    rating: 9.5,
    coordinates: { lat: 37.7825, lng: -122.4131 },
    address: "511 Jones St, San Francisco, CA 94102"
  },
  {
    id: 2,
    name: "Zareens",
    description: "The pinnacle of Pakistani-Indian cuisine in the Bay Area. Every dish is an absolute masterpiece.",
    food: "Chicken Sizzler, Chicken Tikka Masala, Lamb Gosht, Chapli Kabob, Mango Lassi",
    city: "Palo Alto, CA",
    region: "Downtown Palo Alto",
    rating: 10,
    coordinates: { lat: 37.4292, lng: -122.1381 },
    address: "365 California Ave, Palo Alto, CA 94306"
  }
];

const egoImages = [
  { id: 1, title: "Ego 1", image: ego1 },
  { id: 2, title: "Ego 2", image: ego2 },
  { id: 3, title: "Ego 3", image: ego3 },
  { id: 4, title: "Ego 4", image: ego4 },
  { id: 5, title: "Ego 5", image: ego5 },
  { id: 6, title: "Ego 6", image: ego6 },
  { id: 7, title: "Ego 7", image: ego7 },
  { id: 8, title: "Ego 8", image: ego8 },
  { id: 9, title: "Ego 9", image: ego9 },
  { id: 10, title: "Ego 10", image: ego10 },
  { id: 11, title: "Ego 11", image: ego11 },
  { id: 12, title: "Ego 12", image: ego12 }
];

const DEFAULT_CENTER = [37.5, -122.2];
const DEFAULT_ZOOM = 8;

const MapFocus = ({ restaurant }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    const zoom = restaurant ? 13 : DEFAULT_ZOOM;
    const baseLatLng = restaurant
      ? L.latLng(restaurant.coordinates.lat, restaurant.coordinates.lng)
      : L.latLng(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);

    const mapSize = map.getSize();
    const offsetFactor = restaurant ? 0.24 : 0.18;
    const verticalOffset = Math.min(mapSize.y * offsetFactor, restaurant ? 160 : 120);

    const projected = map.project(baseLatLng, zoom);
    const offsetPoint = projected.add([0, verticalOffset]);
    const targetLatLng = map.unproject(offsetPoint, zoom);

    map.flyTo(targetLatLng, zoom, { duration: 0.6 });
  }, [map, restaurant]);

  return null;
};

const RestaurantMarkers = memo(function RestaurantMarkers({ restaurants, icons, onSelect }) {
  return (
    <>
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.coordinates.lat, restaurant.coordinates.lng]}
          icon={icons[restaurant.id]}
          eventHandlers={{ click: () => onSelect(restaurant) }}
        />
      ))}
    </>
  );
});

function Egomaniac() {
  const [isFlicksVisible, setIsFlicksVisible] = useState(false);
  const [isMunchVisible, setIsMunchVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(foodRecommendations[0]);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    if (mapInstance && isMunchVisible) {
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 180);
    }
  }, [mapInstance, isMunchVisible]);

  const markerIcons = useMemo(() => {
    return foodRecommendations.reduce((acc, restaurant) => {
      const isSelected = selectedRestaurant?.id === restaurant.id;

      acc[restaurant.id] = L.divIcon({
        className: 'ego-marker-wrapper',
        html: `<span class="ego-marker ${isSelected ? 'active' : ''}"></span>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      return acc;
    }, {});
  }, [selectedRestaurant]);

  const toggleFlicks = () => {
    setIsFlicksVisible((prev) => !prev);
  };

  const toggleMunch = () => {
    setIsMunchVisible((prev) => !prev);
  };

  const handleRestaurantClick = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="egomaniac-container">
      <section className="egomaniac-section flicks-section">
        <h2 onClick={toggleFlicks} className="egomaniac-title regular-font">
          flicks <span className="toggle-symbol">{isFlicksVisible ? '-' : '+'}</span>
        </h2>
        {isFlicksVisible && (
          <div className="egomaniac-content">
            <div className="ego-grid">
              {egoImages.map((egoImage) => (
                <div key={egoImage.id} className="ego-item">
                  <img src={egoImage.image} alt={egoImage.title} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="egomaniac-section munch-section">
        <h2 onClick={toggleMunch} className="egomaniac-title regular-font">
          good munch <span className="toggle-symbol">{isMunchVisible ? '-' : '+'}</span>
        </h2>
        {isMunchVisible && (
          <div className="egomaniac-content">
            <div className="munch-layout">
              <div className="restaurants-list">
                {foodRecommendations.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`restaurant-card ${selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    <div className="restaurant-header">
                      <h3 className="restaurant-name">{restaurant.name}</h3>
                    </div>
                    <div className="restaurant-score">
                      <span className="score-value">{restaurant.rating}</span>
                      <span className="score-max">/10</span>
                    </div>
                    <div className="restaurant-stars">
                      <div className="stars">{renderStars(restaurant.rating)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="map-container">
                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={DEFAULT_ZOOM}
                  minZoom={4}
                  maxZoom={16}
                  scrollWheelZoom={false}
                  className="ego-map"
                  whenReady={({ target }) => setMapInstance(target)}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <RestaurantMarkers
                    restaurants={foodRecommendations}
                    icons={markerIcons}
                    onSelect={handleRestaurantClick}
                  />
                  <MapFocus restaurant={selectedRestaurant} />
                </MapContainer>

                {selectedRestaurant && (
                  <div className="selected-restaurant-info" key={selectedRestaurant.id}>
                    <div className="info-wrap">
                      <h4>{selectedRestaurant.name}</h4>
                      <p>{selectedRestaurant.description}</p>
                      <div className="rating-display">
                        <div className="rating-badge">
                          <span className="rating-number">{selectedRestaurant.rating}</span>
                          <span className="rating-max">/10</span>
                        </div>
                        <div className="stars">{renderStars(selectedRestaurant.rating)}</div>
                      </div>
                      <div className="info-detail">
                        <span className="info-label">Location</span>
                        <span className="info-value">
                          {selectedRestaurant.city} &middot; {selectedRestaurant.region}
                        </span>
                      </div>
                      <div className="info-detail">
                        <span className="info-label">Standouts</span>
                        <span className="info-value">{selectedRestaurant.food}</span>
                      </div>
                      <div className="info-detail">
                        <span className="info-label">Address</span>
                        <span className="info-value">{selectedRestaurant.address}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default memo(Egomaniac);
