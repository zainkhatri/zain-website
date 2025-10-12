import React, { useState, useRef, useEffect, memo } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import './Egomaniac.css';

// Sample food recommendations data
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

// Ego mode images
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

function Egomaniac() {
  const [isFlicksVisible, setIsFlicksVisible] = useState(false);
  const [isMunchVisible, setIsMunchVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const flicksRef = useRef(null);
  const munchRef = useRef(null);
  const mapRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      // Set API key and options
      setOptions({
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
        version: 'weekly',
      });

      try {
        // Import the maps and marker libraries
        const { Map } = await importLibrary('maps');
        const { AdvancedMarkerElement } = await importLibrary('marker');

        if (mapRef.current) {
          const newMap = new Map(mapRef.current, {
            center: { lat: 37.5, lng: -122.2 }, // Bay Area center
            zoom: 9,
            mapId: 'DEMO_MAP_ID',
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry.fill',
                stylers: [{ color: '#1a1a1a' }]
              },
              {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [{ color: '#0f3460' }]
              },
              {
                featureType: 'road',
                elementType: 'geometry.fill',
                stylers: [{ color: '#2d2d2d' }]
              },
              {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#ffffff' }]
              }
            ]
          });
          setMap(newMap);

          // Create markers for all restaurants
          const { PinElement } = await importLibrary('marker');

          const newMarkers = foodRecommendations.map((restaurant) => {
            // Create a custom pin
            const pin = new PinElement({
              background: '#ff6b6b',
              borderColor: '#ffffff',
              glyphColor: '#ffffff',
              scale: 1.2,
            });

            const marker = new AdvancedMarkerElement({
              map: newMap,
              position: restaurant.coordinates,
              title: restaurant.name,
              content: pin.element,
            });

            marker.addListener('click', () => {
              setSelectedRestaurant(restaurant);
            });

            return marker;
          });

          setMarkers(newMarkers);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    if (isMunchVisible) {
      initMap();
    }

    // Cleanup function
    return () => {
      markers.forEach(marker => {
        if (marker.map) {
          marker.map = null;
        }
      });
    };
  }, [isMunchVisible]);

  // Update map when restaurant is selected
  useEffect(() => {
    const updateMarkers = async () => {
      if (map && selectedRestaurant && markers.length > 0) {
        map.setCenter(selectedRestaurant.coordinates);
        map.setZoom(13);

        // Dynamically import PinElement for updating markers
        const { PinElement } = await importLibrary('marker');

        // Update marker colors
        markers.forEach((marker, index) => {
          const isSelected = foodRecommendations[index].id === selectedRestaurant.id;

          const pin = new PinElement({
            background: isSelected ? '#00ff00' : '#ff6b6b',
            borderColor: '#ffffff',
            glyphColor: '#ffffff',
            scale: isSelected ? 1.5 : 1.2,
          });

          marker.content = pin.element;
        });
      }
    };

    updateMarkers();
  }, [map, selectedRestaurant, markers]);

  const toggleFlicks = () => {
    setIsFlicksVisible(!isFlicksVisible);
  };

  const toggleMunch = () => {
    setIsMunchVisible(!isMunchVisible);
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="egomaniac-container">
      {/* Flicks Section */}
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

      {/* Good Munch Section */}
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
                      <div className="restaurant-rating">
                        <span className="rating-number">{restaurant.rating}/10</span>
                        <div className="stars">{renderStars(restaurant.rating)}</div>
                      </div>
                    </div>
                    <p className="restaurant-description">{restaurant.description}</p>
                    <div className="restaurant-details">
                      <div className="detail-item">
                        <strong>Food:</strong> {restaurant.food}
                      </div>
                      <div className="detail-item">
                        <strong>Location:</strong> {restaurant.city}, {restaurant.region}
                      </div>
                      <div className="detail-item">
                        <strong>Address:</strong> {restaurant.address}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="map-container">
                <div ref={mapRef} className="map" />
                {selectedRestaurant && (
                  <div className="selected-restaurant-info">
                    <h4>{selectedRestaurant.name}</h4>
                    <p>{selectedRestaurant.description}</p>
                    <div className="rating-display">
                      <span className="rating-number">{selectedRestaurant.rating}/10</span>
                      <div className="stars">{renderStars(selectedRestaurant.rating)}</div>
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
