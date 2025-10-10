import React, { useState, useRef, useEffect, memo } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import './Egomaniac.css';

// Sample food recommendations data
const foodRecommendations = [
  {
    id: 1,
    name: "Phil's BBQ",
    description: "Legendary San Diego BBQ spot with massive portions and incredible brisket. The sauce is what dreams are made of.",
    food: "Brisket Sandwich, Ribs, Mac & Cheese",
    city: "San Diego, CA",
    region: "Point Loma",
    rating: 9,
    coordinates: { lat: 32.7313, lng: -117.2131 },
    address: "3750 Sports Arena Blvd, San Diego, CA 92110"
  },
  {
    id: 2,
    name: "Tacos El Gordo",
    description: "Authentic Tijuana-style tacos that will blow your mind. The adobada is absolutely insane.",
    food: "Adobada Tacos, Carne Asada, Al Pastor",
    city: "San Diego, CA",
    region: "Chula Vista",
    rating: 10,
    coordinates: { lat: 32.6401, lng: -117.0842 },
    address: "689 H St, Chula Vista, CA 91910"
  },
  {
    id: 3,
    name: "Sushi Ota",
    description: "Hidden gem with the freshest fish in San Diego. Omakase experience that rivals LA spots at half the price.",
    food: "Omakase, Uni, Toro, Yellowtail",
    city: "San Diego, CA",
    region: "Pacific Beach",
    rating: 9,
    coordinates: { lat: 32.7973, lng: -117.2553 },
    address: "4529 Mission Bay Dr, San Diego, CA 92109"
  },
  {
    id: 4,
    name: "The Crack Shack",
    description: "Gourmet fried chicken that's crispy on the outside, juicy on the inside. The deviled eggs are next level.",
    food: "Fried Chicken Sandwich, Deviled Eggs, Biscuits",
    city: "San Diego, CA",
    region: "Little Italy",
    rating: 8,
    coordinates: { lat: 32.7226, lng: -117.1686 },
    address: "2266 Kettner Blvd, San Diego, CA 92101"
  },
  {
    id: 5,
    name: "Lucha Libre Gourmet Taco Shop",
    description: "Wrestling-themed taco shop with creative combinations and massive portions. The Surfin' California burrito is legendary.",
    food: "Surfin' California Burrito, Queso Tacos, Churros",
    city: "San Diego, CA",
    region: "Mission Hills",
    rating: 8,
    coordinates: { lat: 32.7489, lng: -117.1631 },
    address: "1810 W Washington St, San Diego, CA 92103"
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
  const flicksRef = useRef(null);
  const munchRef = useRef(null);
  const mapRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
        version: 'weekly',
        libraries: ['places']
      });

      try {
        const { Map } = await loader.importLibrary('maps');
        
        if (mapRef.current) {
          const newMap = new Map(mapRef.current, {
            center: { lat: 32.7157, lng: -117.1611 }, // San Diego center
            zoom: 11,
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
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    if (isMunchVisible) {
      initMap();
    }
  }, [isMunchVisible]);

  // Update map when restaurant is selected
  useEffect(() => {
    if (map && selectedRestaurant) {
      map.setCenter(selectedRestaurant.coordinates);
      map.setZoom(15);
    }
  }, [map, selectedRestaurant]);

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
        <h2 onClick={toggleFlicks} className="egomaniac-title">
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
        <h2 onClick={toggleMunch} className="egomaniac-title">
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
