import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
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

const UNSPLASH_PLACEHOLDER_PATTERN = /^%.*%$/;

function sanitizeEnvValue(value) {
  if (value === undefined || value === null) {
    return '';
  }

  const trimmed = String(value).trim();

  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    UNSPLASH_PLACEHOLDER_PATTERN.test(trimmed)
  ) {
    return '';
  }

  return trimmed;
}

function resolveUnsplashAccessKey() {
  const candidates = [];

  if (typeof process !== 'undefined' && process.env) {
    candidates.push(
      process.env.REACT_APP_UNSPLASH_ACCESS_KEY,
      process.env.VITE_UNSPLASH_ACCESS_KEY,
      process.env.UNSPLASH_ACCESS_KEY
    );
  }

  if (typeof globalThis !== 'undefined') {
    const maybeWindow = globalThis;
    candidates.push(
      maybeWindow.REACT_APP_UNSPLASH_ACCESS_KEY,
      maybeWindow.VITE_UNSPLASH_ACCESS_KEY,
      maybeWindow.UNSPLASH_ACCESS_KEY
    );
  }

  let metaEnv;
  try {
    // eslint-disable-next-line no-eval
    metaEnv = eval('import.meta')?.env;
  } catch (error) {
    metaEnv = undefined;
  }

  if (metaEnv) {
    candidates.push(metaEnv.VITE_UNSPLASH_ACCESS_KEY, metaEnv.REACT_APP_UNSPLASH_ACCESS_KEY);
  }

  for (const candidate of candidates) {
    const sanitized = sanitizeEnvValue(candidate);
    if (sanitized) {
      return sanitized;
    }
  }

  return '';
}

const foodRecommendations = [
  {
    id: 2,
    name: "Zareens",
    description: "White man's Pakistani food, but its perfect. It's just perfect. The sizzler, the lamb gosht, the MANGO LASSI bruv. It's beautiful. It's one of, if not the best place to eat in the Bay Area.",
    food: "Chicken Sizzler, Chicken Tikka Masala, Lamb Gosht, Chapli Kabob, Mango Lassi",
    city: "Palo Alto, CA",
    region: "Downtown Palo Alto",
    rating: 10,
    coordinates: { lat: 37.4292, lng: -122.1381 },
    address: "365 California Ave, Palo Alto, CA 94306"
  },
  {
    id: 1,
    name: "Chutney",
    description: "Authentic Pakistani food in the absolute ghetto WORST of San Francisco. It's the best Chicken Tikka Masala in the world. I will stand on that. Khabib put everyone on too, but my hood and I been coming here since 2006. ",
    food: "Chicken Tikka Masala, Lamb Masala, Chicken Tandoori Leg",
    city: "San Francisco, CA",
    region: "Tenderloin",
    rating: 9.7,
    coordinates: { lat: 37.7825, lng: -122.4131 },
    address: "511 Jones St, San Francisco, CA 94102"
  },
  {
    id: 7,
    name: "De Afghanan",
    description: "The kabobs are so good. The meat is mad tender. It's a little tax, but still its fire.",
    food: "Chapli Kabob, Mantu, Bolani, Chicken Kabob",
    city: "Fremont, CA",
    region: "Fremont Blvd",
    rating: 9,
    coordinates: { lat: 37.5476, lng: -121.9886 },
    address: "37395 Fremont Blvd, Fremont, CA 94536"
  },
  {
    id: 3,
    name: "La Vaca's Tacos",
    description: "Underrated spot in the Mission District. Taste of Tiana put me on, and I was so ready to hate on her. But it was good. Super interesting flavors, it was just solid. Best tacos in the Bay? I thinks so.",
    food: "Blue Corn Birria Tacos",
    city: "San Francisco, CA",
    region: "Mission District",
    rating: 9,
    coordinates: { lat: 37.7524, lng: -122.4095 },
    address: "2962 24th St, San Francisco, CA 94110"
  },
  {
    id: 4,
    name: "Bibo's Pizza",
    description: "Solid SJ pizza. It was the spot in CC, and it's just reallys solid hommey pizza. It's not the BEST ever, but it's really reliable and good.",
    food: "Mediterranean Pizza, Buffalo Chicken Pizz, Hawaiian Pizza (No Bacon)",
    city: "San Jose, CA",
    region: "Willow Glen Village",
    rating: 9,
    coordinates: { lat: 37.3008, lng: -121.8947 },
    address: "1431 Bird Ave., San Jose, CA 95125"
  },
  {
    id: 6,
    name: "Burger Shop",
    description: "The OG Halal Smashburger. It's just really solid. The bacon too. Wow",
    food: "Halal Smashburger",
    city: "Union City, CA",
    region: "Smith Street",
    rating: 8.3,
    coordinates: { lat: 37.5933, lng: -122.0438 },
    address: "3851 Smith Street, Union City, CA"
  },
  {
    id: 5,
    name: "Qamaria Yemeni Coffee Co.",
    description: "It used to be shorty central, then all the aunties and uncs ruined it. It's good though, solid vibes, the food is mid, but I like the desserts and location",
    food: "Iced Pistachio Latte, Honeycomb Pastry",
    city: "Fremont, CA",
    region: "Cushing",
    rating: 8,
    coordinates: { lat: 37.5485, lng: -121.9886 },
    address: "4193 Cushing Pkwy, Fremont, CA 94538"
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

const top10NBAPlayers = [
  { rank: 1, name: "Lebron", description: "I hate it. He's so corny, and is a avengers team chasing loser, but he can do everything on the court possible, can play any position, has the most points ever, etc. He's an all rounder. He has no aura and is so corny, and it pains me to even put him 1. He is the Drake of the NBA.", image: "https://preview.redd.it/can-somebody-add-the-lebron-james-sunshine-filter-to-this-v0-rr2bj2j3y9zc1.jpg?width=1080&crop=smart&auto=webp&s=73e864d96a0e0a7ad592358e7011794c358ae068" },
  { rank: 2, name: "MJ", description: "Aura god. He had grown men in fear of him, and so in fear that 30 years later they hop on podcasts talking about how scared they were of Black Jesus. Get a grip.", image: "https://people.com/thmb/TzDJt_cDuFa_EShaPF1WzqC8cy0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(216x0:218x2)/michael-jordan-435-3-4fc019926b644905a27a3fc98180cc41.jpg" },
  { rank: 3, name: "Kobe", description: "RIP. He's my favorite player of all time, hella clutch, loyal, crazy mentality. He made some of the craziest shots I've ever seen live.", image: "https://i.ebayimg.com/images/g/H74AAOSwDzJj0gva/s-l400.jpg" },
  { rank: 4, name: "Kareem", description: "He's lwk farming b/c the era was mid. He's Muslim tho so I'll give him his flowers. Bald ass.", image: "https://hips.hearstapps.com/hmg-prod/images/kareem-abdul-jabbar-of-the-los-angeles-lakers-shoots-a-free-news-photo-1643724792.jpg" },
  { rank: 5, name: "Shaq", description: "The most dominant big boy. Lwk I would take him over Kareem, but Kareem achieved more so whatever. Lwk Shaq is better I'm waffling.", image: "https://preview.redd.it/who-would-you-rather-have-prime-shaq-or-prime-giannis-v0-d0ogt1n4r6pe1.jpg?width=640&crop=smart&auto=webp&s=d72c0c9849e683ce07b4bfbe0ed627556c0247c5" },
  { rank: 6, name: "Tim Duncan", description: "Off the glass demon. So boring though. His teams were insane, but he was the best player for like 4 of 5 rings. Fair enough.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNLBENkF0cyxBzStak2g4onlrnuV1kg7_JQg&s" },
  { rank: 7, name: "Steph", description: "2nd favorite player ever. No explanation needed, he's insane.", image: "https://i.pinimg.com/736x/b7/ba/51/b7ba516ea541e3098afa8c5a6d6a879d.jpg" },
  { rank: 8, name: "KD", description: "Very similar to Lebron, but just a way better scorer. He's not as good on D, but super fun to watch, super clean offensive demon. He is Steph's chlid, but still he's insane.", image: "https://cdn.prod.website-files.com/5ea7adb57f49ec96cb312e21/61e79cdb5a624971dd78cc1d_hpGJgLb5FAR6qSKuzVCX2BLI3BRB--2SixfFSSQDqlpXqsmTysumeq4HMTeMGBj8GpC2Cdxi_9GUH_0IohJ9D5RwoESWiJx5Heip-_kpNMr_BKBb5fsaD7DDZzq8WlMghzYjk7Hr.jpeg" },
  { rank: 9, name: "Magic", description: "Controversial at 9 I know. He achieved a lot, but honestly his game isn't that crazy when we look at todays game. He's just Ben Simmons if Ben Simmons was good. Cool passes tho.", image: "https://i.pinimg.com/736x/8e/dd/ba/8eddba2aa9ca03b46e18c062d2a042f3.jpg" },
  { rank: 10, name: "Hakeem", description: "Shoutout another Muslim brother. 2X rings, super mid team with him. Super fundamental player, footworks insane, super solid center.", image: "https://from-way-downtown.com/wp-content/uploads/2025/01/img_3451.jpeg?w=1568" }
];

const top10Rappers = [
  { rank: 1, name: "Kanye", description: "He's gone off the rails thanks to the nitrious, but he's still a generational rapper with an insane catelogue. Super influencial, crazy bars, and he used to be charming.", spotify: "https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x", embed: "https://open.spotify.com/embed/artist/5K4W6rqBFWDnAN6FQUkS6x", image: "https://media.gq-magazine.co.uk/photos/5d139cd69fa6013256838bd2/16:9/w_2560%2Cc_limit/kanye-west-01-gq-1june18_getty_b.jpg" },
  { rank: 2, name: "Kendrick", description: "Let me prefece by saying GNX is mid. HOWEVER, that does not take away from Good Kid Maad City, TPAB, Mr. Morale, and DAMN. Those 4 albums are generational. He's lwk a sell out now, free Drake?", spotify: "https://open.spotify.com/artist/2YZyLoL8N0Wb9xBt1NhZWg", embed: "https://open.spotify.com/embed/artist/2YZyLoL8N0Wb9xBt1NhZWg", image: "https://i.scdn.co/image/ab6761610000e5eb437b9e2a82505b3d93ff1022" },
  { rank: 3, name: "Travis Scott", description: "Every album he's dropped is so fun. The psychadelic trap beats, the autotune, its fire. Insane concerts live too. Energy is crazy.", spotify: "https://open.spotify.com/artist/0Y5tJX1MQlPlqiwlOH1tJY", embed: "https://open.spotify.com/embed/artist/0Y5tJX1MQlPlqiwlOH1tJY", image: "https://i.scdn.co/image/ab6761610000e5eb19c2790744c792d05570bb71" },
  { rank: 4, name: "Playboi Carti", description: "My everything. WLR is lwk overrated, but the flows, the beats, etc. He's mumble god.", spotify: "https://open.spotify.com/artist/699OTQXzgjhIYAHMy9RyPD", embed: "https://open.spotify.com/embed/artist/699OTQXzgjhIYAHMy9RyPD", image: "https://cdn-images.dzcdn.net/images/artist/b90097972a60d9d8598a79a786be1a3a/1900x1900-000000-81-0-0.jpg" },
  { rank: 5, name: "A$AP Rocky", description: "Ever since he married Rihanna he's been a bum, but I love his bars, cloud rap production, and overall vibe. Very solid geezer, just waiting for him to drop...", spotify: "https://open.spotify.com/artist/13ubrt8QOOCPljQ2FL1Kca", embed: "https://open.spotify.com/embed/artist/13ubrt8QOOCPljQ2FL1Kca", image: "https://media.cnn.com/api/v1/images/stellar/prod/190802111010-asap-rocky-file-092018.jpg?q=x_3,y_301,h_1787,w_3177,c_crop/h_833,w_1480" },
  { rank: 6, name: "Chlidish Gambino", description: "Lowkey underrated in the rap scene. He's a great rapper, funny bars, amazing production, and I miss his old stuff like Because the Internet.", spotify: "https://open.spotify.com/artist/73sIBHcqh3Z3NyqHKZ7FOL", embed: "https://open.spotify.com/embed/artist/73sIBHcqh3Z3NyqHKZ7FOL", image: "https://cdn-p.smehost.net/sites/005297e5d91d4996984e966fac4389ea/wp-content/uploads/2020/01/Childish-Gambino.png" },
  { rank: 7, name: "Mac Miller", description: "The best white rapper ever. If you disagree you are at least 45 years old.", spotify: "https://open.spotify.com/artist/4LLpKhyESsyAXpc4laK94U", embed: "https://open.spotify.com/embed/artist/4LLpKhyESsyAXpc4laK94U", image: "https://www.rollingstone.com/wp-content/uploads/2018/11/mac-miller-left-behind.jpg?w=1600&h=900&crop=1" },
  { rank: 8, name: "Don Toliver", description: "He lwk ran 2023. He has a great voice, good chorus, and is solid all around. Hard to hate.", spotify: "https://open.spotify.com/artist/4Ui2kfOqGujY81UcPrb5KE", embed: "https://open.spotify.com/embed/artist/4Ui2kfOqGujY81UcPrb5KE", image: "https://i.scdn.co/image/ab6761610000e5eb52258b97639c24efe49fbf9e" },
  { rank: 9, name: "JPEGMAFIA", description: "Super versatile. He's lwk a better producer than rapper, but he's amazing at both. Really weird stuff, but I like it a lot.", spotify: "https://open.spotify.com/artist/6yJ6QQ3Y5l0s0tn7b0arrO", embed: "https://open.spotify.com/embed/artist/6yJ6QQ3Y5l0s0tn7b0arrO", image: "https://images.discovery-prod.axs.com/2025/03/jpegmafia-tickets_06-09-25_17_67d859814fc80.jpg" },
  { rank: 10, name: "Westside Gunn", description: "AYO. He's voice is so fire, sick beats, really interesting lyrics (usually he's waffling), but its fun.", spotify: "https://open.spotify.com/artist/0ABk515kENDyATUdpCKVfW", embed: "https://open.spotify.com/embed/artist/0ABk515kENDyATUdpCKVfW", image: "https://www.billboard.com/wp-content/uploads/2023/10/WESTSIDE-GUNN-press-2023-billboard-1548.jpg?w=1024" }
];

const DEFAULT_CENTER = [37.5, -122.2];
const DEFAULT_ZOOM = 8;

const MapFocus = ({ restaurant, isVisible }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !isVisible) {
      return;
    }

    const zoom = restaurant ? 13 : DEFAULT_ZOOM;
    const baseLatLng = restaurant
      ? L.latLng(restaurant.coordinates.lat, restaurant.coordinates.lng)
      : L.latLng(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);

    const mapSize = map.getSize();
    // Smaller offset - restaurant appears lower/more centered
    const offsetFactor = restaurant ? 0.15 : 0.08;
    const verticalOffset = mapSize.y * offsetFactor;

    const projected = map.project(baseLatLng, zoom);
    const offsetPoint = projected.add([0, verticalOffset]);
    const targetLatLng = map.unproject(offsetPoint, zoom);

    map.flyTo(targetLatLng, zoom, { duration: 0.7 });
  }, [map, restaurant, isVisible]);

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
  const [isNBAVisible, setIsNBAVisible] = useState(false);
  const [isRappersVisible, setIsRappersVisible] = useState(false);
  const [expandedNBAItems, setExpandedNBAItems] = useState({});
  const [expandedRapperItems, setExpandedRapperItems] = useState({});
  const [selectedRestaurant, setSelectedRestaurant] = useState(foodRecommendations[0]);
  const [mapInstance, setMapInstance] = useState(null);
  const unsplashAccessKey = resolveUnsplashAccessKey();
  const [galleryState, setGalleryState] = useState({ status: 'idle', items: [] });
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const galleryItems = galleryState.items;
  const selectedPhoto =
    selectedPhotoIndex !== null && galleryItems[selectedPhotoIndex]
      ? galleryItems[selectedPhotoIndex]
      : null;
  const flicksContentRef = useRef(null);
  const munchContentRef = useRef(null);
  const nbaContentRef = useRef(null);
  const rappersContentRef = useRef(null);
  const [flicksHeight, setFlicksHeight] = useState(0);
  const [munchHeight, setMunchHeight] = useState(0);
  const [nbaHeight, setNBAHeight] = useState(0);
  const [rappersHeight, setRappersHeight] = useState(0);
  const [selectedFlickIndex, setSelectedFlickIndex] = useState(null);
  const selectedFlick = selectedFlickIndex !== null ? egoImages[selectedFlickIndex] : null;

  useEffect(() => {
    if (!mapInstance || !isMunchVisible) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      if (mapInstance?._size && mapInstance?._mapPane) {
        mapInstance.invalidateSize();
      }
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [mapInstance, isMunchVisible]);

  useEffect(() => {
    if (!selectedRestaurant || !unsplashAccessKey) {
      setGalleryState({ status: unsplashAccessKey ? 'idle' : 'missing-key', items: [] });
      setSelectedPhotoIndex(null);
      requestAnimationFrame(() => {
        if (munchContentRef.current) {
          setMunchHeight(munchContentRef.current.scrollHeight);
        }
      });
      return undefined;
    }

    const controller = new AbortController();
    const searchQuery = `${selectedRestaurant.name} ${selectedRestaurant.city}`;

    setGalleryState((prev) => ({ status: 'loading', items: prev.items }));

    const fetchPhotos = async () => {
      try {
        const params = new URLSearchParams({
          query: searchQuery,
          per_page: '6',
          orientation: 'landscape',
          content_filter: 'high',
        });

        const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
          headers: {
            Authorization: `Client-ID ${unsplashAccessKey}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unsplash request failed: ${response.status}`);
        }

        const data = await response.json();
        const results = Array.isArray(data?.results) ? data.results : [];

        const photos = results.slice(0, 6).map((photo) => ({
          id: photo.id,
          src: photo.urls?.small ?? photo.urls?.regular ?? photo.urls?.thumb ?? '',
          fullSrc: photo.urls?.regular ?? photo.urls?.full ?? photo.urls?.small ?? '',
          alt:
            photo.alt_description ||
            photo.description ||
            `${selectedRestaurant.name} photo`,
          photographer: photo.user?.name,
          photographerUrl: photo.user?.links?.html,
        }));
        setGalleryState({ status: 'success', items: photos });
        setSelectedPhotoIndex(null);
        requestAnimationFrame(() => {
          if (munchContentRef.current) {
            setMunchHeight(munchContentRef.current.scrollHeight);
          }
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        console.error('Error fetching Unsplash images:', error);
        setGalleryState({ status: 'error', items: [] });
        setSelectedPhotoIndex(null);
        requestAnimationFrame(() => {
          if (munchContentRef.current) {
            setMunchHeight(munchContentRef.current.scrollHeight);
          }
        });
      }
    };

    fetchPhotos();

    return () => controller.abort();
  }, [selectedRestaurant, unsplashAccessKey]);

  useEffect(() => {
    if (!flicksContentRef.current) {
      return undefined;
    }

    const element = flicksContentRef.current;
    const updateHeight = () => setFlicksHeight(element.scrollHeight);
    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!munchContentRef.current) {
      return undefined;
    }

    const element = munchContentRef.current;
    const updateHeight = () => setMunchHeight(element.scrollHeight);
    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nbaContentRef.current) {
      return undefined;
    }

    const element = nbaContentRef.current;
    const updateHeight = () => setNBAHeight(element.scrollHeight);
    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!rappersContentRef.current) {
      return undefined;
    }

    const element = rappersContentRef.current;
    const updateHeight = () => setRappersHeight(element.scrollHeight);
    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedPhotoIndex === null) {
      return;
    }

    if (!galleryItems[selectedPhotoIndex]) {
      setSelectedPhotoIndex(galleryItems.length ? 0 : null);
    }
  }, [galleryItems, selectedPhotoIndex]);

  useEffect(() => {
    if (selectedPhotoIndex === null) {
      return undefined;
    }

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedPhotoIndex(null);
      } else if (event.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) => {
          if (prev === null || galleryItems.length === 0) return prev;
          return (prev + 1) % galleryItems.length;
        });
      } else if (event.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) => {
          if (prev === null || galleryItems.length === 0) return prev;
          return (prev - 1 + galleryItems.length) % galleryItems.length;
        });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [galleryItems, selectedPhotoIndex]);

  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [selectedPhotoIndex]);

  useEffect(() => {
    if (!isFlicksVisible || !flicksContentRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      if (flicksContentRef.current) {
        setFlicksHeight(flicksContentRef.current.scrollHeight);
      }
    });
  }, [isFlicksVisible]);

  useEffect(() => {
    if (!munchContentRef.current || !isMunchVisible) {
      return;
    }

    requestAnimationFrame(() => {
      if (munchContentRef.current) {
        setMunchHeight(munchContentRef.current.scrollHeight);
      }
    });
  }, [isMunchVisible, selectedRestaurant, galleryState.status, galleryItems.length]);

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

  const toggleNBA = () => {
    setIsNBAVisible((prev) => !prev);
  };

  const toggleRappers = () => {
    setIsRappersVisible((prev) => !prev);
  };

  const toggleNBAItem = (rank) => {
    setExpandedNBAItems((prev) => ({
      ...prev,
      [rank]: !prev[rank]
    }));
  };

  const toggleRapperItem = (rank) => {
    setExpandedRapperItems((prev) => ({
      ...prev,
      [rank]: !prev[rank]
    }));
  };

  const openFlick = useCallback((index) => {
    setSelectedFlickIndex(index);
  }, []);

  const closeFlick = useCallback(() => {
    setSelectedFlickIndex(null);
  }, []);

  const goToNextFlick = useCallback(() => {
    setSelectedFlickIndex((prevIndex) => 
      prevIndex !== null ? (prevIndex + 1) % egoImages.length : 0
    );
  }, []);

  const goToPrevFlick = useCallback(() => {
    setSelectedFlickIndex((prevIndex) => 
      prevIndex !== null ? (prevIndex - 1 + egoImages.length) % egoImages.length : 0
    );
  }, []);

  const handleRestaurantClick = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedFlickIndex === null) return;
      
      switch (e.key) {
        case 'ArrowRight':
          goToNextFlick();
          break;
        case 'ArrowLeft':
          goToPrevFlick();
          break;
        case 'Escape':
          closeFlick();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFlickIndex, goToNextFlick, goToPrevFlick, closeFlick]);

  const renderStars = (rating) => {
    const totalStars = 5;
    const normalized = Math.max(0, Math.min(rating / 2, totalStars)); // 0–10 → 0–5

    return Array.from({ length: totalStars }, (_, i) => {
      const diff = normalized - i;
      if (diff >= 1) return <span key={i} className="star filled"></span>;
      if (diff >= 0.5) return <span key={i} className="star half"></span>;
      return <span key={i} className="star empty"></span>;
    });
  };

  const handleOpenPhoto = useCallback(
    (index) => {
      if (!galleryItems[index]) {
        return;
      }
      setSelectedPhotoIndex(index);
    },
    [galleryItems]
  );

  const handleClosePhoto = useCallback(() => {
    setSelectedPhotoIndex(null);
  }, []);

  const handleNextPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => {
      if (prev === null || galleryItems.length === 0) {
        return prev;
      }
      return (prev + 1) % galleryItems.length;
    });
  }, [galleryItems.length]);

  const handlePrevPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => {
      if (prev === null || galleryItems.length === 0) {
        return prev;
      }
      return (prev - 1 + galleryItems.length) % galleryItems.length;
    });
  }, [galleryItems.length]);

  return (
    <div className="egomaniac-container">
      <section
        className={`content-section egomaniac-section flicks-section ${isFlicksVisible ? 'expanded' : ''}`}
      >
        <h2 onClick={toggleFlicks} className="expandable-title egomaniac-title regular-font">
          flicks <span className="toggle-symbol">{isFlicksVisible ? '-' : '+'}</span>
        </h2>
        <div className="content-wrapper" style={{ '--content-height': `${flicksHeight}px` }}>
          <div ref={flicksContentRef} className="content egomaniac-content">
            <div className="ego-grid">
              {egoImages.map((egoImage, index) => (
                <div 
                  key={egoImage.id} 
                  className="ego-item clickable"
                  onClick={() => openFlick(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openFlick(index);
                    }
                  }}
                >
                  <img src={egoImage.image} alt={egoImage.title} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedFlick && (
          <motion.div
            className="egomaniac-lightbox flicks-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeFlick}
          >
            <button type="button" className="lightbox-close" onClick={closeFlick} aria-label="Close photo">
              ×
            </button>
            <button 
              type="button" 
              className="lightbox-nav lightbox-prev" 
              onClick={(e) => { e.stopPropagation(); goToPrevFlick(); }}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button 
              type="button" 
              className="lightbox-nav lightbox-next" 
              onClick={(e) => { e.stopPropagation(); goToNextFlick(); }}
              aria-label="Next photo"
            >
              ›
            </button>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img src={selectedFlick.image} alt={selectedFlick.title} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section
        className={`content-section egomaniac-section munch-section ${isMunchVisible ? 'expanded' : ''}`}
      >
        <h2 onClick={toggleMunch} className="expandable-title egomaniac-title regular-font">
          good munch <span className="toggle-symbol">{isMunchVisible ? '-' : '+'}</span>
        </h2>
        <div className="content-wrapper" style={{ '--content-height': `${munchHeight}px` }}>
          <div ref={munchContentRef} className="content egomaniac-content">
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
                  <MapFocus restaurant={selectedRestaurant} isVisible={isMunchVisible} />
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
        </div>
      </section>

      <section
        className={`content-section egomaniac-section nba-section ${isNBAVisible ? 'expanded' : ''}`}
      >
        <h2 onClick={toggleNBA} className="expandable-title egomaniac-title regular-font">
          Top 10 NBA Players of All Time <span className="toggle-symbol">{isNBAVisible ? '-' : '+'}</span>
        </h2>
        <div className="content-wrapper" style={{ '--content-height': `${nbaHeight}px` }}>
          <div ref={nbaContentRef} className="content egomaniac-content">
            <div className="top-10-list">
              {top10NBAPlayers.map((player) => (
                <div key={player.rank} className="top-10-item">
                  <div className="rank-badge">{player.rank}</div>
                  {player.image && (
                    <div className="rapper-avatar">
                      <img src={player.image} alt={player.name} className="rapper-avatar-image" />
                    </div>
                  )}
                  <div className="item-content">
                    <div className="item-header" onClick={() => toggleNBAItem(player.rank)}>
                      <h3 className="item-name">{player.name}</h3>
                      <span className="item-toggle">{expandedNBAItems[player.rank] ? '-' : '+'}</span>
                    </div>
                    <AnimatePresence initial={false}>
                      {expandedNBAItems[player.rank] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1]
                          }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="rapper-profile-expanded">
                            <p className="item-description">{player.description}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`content-section egomaniac-section rappers-section ${isRappersVisible ? 'expanded' : ''}`}
      >
        <h2 onClick={toggleRappers} className="expandable-title egomaniac-title regular-font">
          My Top 10 Rappers <span className="toggle-symbol">{isRappersVisible ? '-' : '+'}</span>
        </h2>
        <div className="content-wrapper" style={{ '--content-height': `${rappersHeight}px` }}>
          <div ref={rappersContentRef} className="content egomaniac-content">
            <div className="top-10-list">
              {top10Rappers.map((rapper) => (
                <div key={rapper.rank} className="top-10-item">
                  <div className="rank-badge">{rapper.rank}</div>
                  {rapper.image && (
                    <div className="rapper-avatar">
                      <img src={rapper.image} alt={rapper.name} className="rapper-avatar-image" />
                    </div>
                  )}
                  <div className="item-content">
                    <div className="item-header" onClick={() => toggleRapperItem(rapper.rank)}>
                      <h3 className="item-name">{rapper.name}</h3>
                      <span className="item-toggle">{expandedRapperItems[rapper.rank] ? '-' : '+'}</span>
                    </div>
                    <AnimatePresence initial={false}>
                      {expandedRapperItems[rapper.rank] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1]
                          }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="rapper-profile-expanded">
                            <p className="item-description">{rapper.description}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="egomaniac-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                handleClosePhoto();
              }
            }}
          >
            <button type="button" className="lightbox-close" onClick={handleClosePhoto} aria-label="Close photo">
              ×
            </button>
            {galleryItems.length > 1 && (
              <>
                <button type="button" className="lightbox-nav prev" onClick={handlePrevPhoto} aria-label="Previous photo">
                  ‹
                </button>
                <button type="button" className="lightbox-nav next" onClick={handleNextPhoto} aria-label="Next photo">
                  ›
                </button>
              </>
            )}
            <motion.figure
              key={selectedPhoto.id}
              className="lightbox-figure"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <motion.img
                src={selectedPhoto.fullSrc || selectedPhoto.src}
                alt={selectedPhoto.alt}
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              {selectedPhoto.photographer && (
                <figcaption>
                  Photo by{' '}
                  {selectedPhoto.photographerUrl ? (
                    <a href={selectedPhoto.photographerUrl} target="_blank" rel="noreferrer">
                      {selectedPhoto.photographer}
                    </a>
                  ) : (
                    selectedPhoto.photographer
                  )}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(Egomaniac);
