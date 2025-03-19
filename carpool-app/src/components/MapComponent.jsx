import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const calculateFare = (distance) => {
  const baseFee = 2; // $2 base fee
  const ratePerKm = 1; // $1 per kilometer
  return baseFee + (distance * ratePerKm); // Total fare in dollars
};

const MapComponent = ({ startQuery, destinationQuery, onFareCalculated, showButtons = false }) => {
  const [map, setMap] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [destinationPosition, setDestinationPosition] = useState(null);
  const [startMarker, setStartMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [fare, setFare] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [error, setError] = useState(null);
  const mapContainerRef = useRef(null);
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`); // Generate a unique ID once

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const newMap = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: 'Leaflet © <a href="http://openstreet.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(newMap);
      setMap(newMap);

      return () => {
        newMap.remove();
      };
    } catch (err) {
      setError('Failed to initialize map');
      console.error('Map initialization error:', err);
    }
  }, []);

  const searchLocation = async (query, setPosition, setMarker) => {
    if (!query || !query.trim()) return;

    const encodedQuery = encodeURIComponent(query);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        const position = [parseFloat(lat), parseFloat(lon)];
        setPosition(position);

        if (map) {
          if (setMarker === setStartMarker && startMarker) map.removeLayer(startMarker);
          if (setMarker === setDestinationMarker && destinationMarker) map.removeLayer(destinationMarker);
          const newMarker = L.marker(position).addTo(map);
          setMarker(newMarker);
          map.setView(position, 13);
        }
      } else {
        console.error('Location not found:', query);
      }
    } catch (err) {
      console.error('Error searching location:', err);
    }
  };

  const handleRoute = () => {
    if (map && startPosition && destinationPosition) {
      if (routingControl) {
        map.removeControl(routingControl);
      }

      const newRoutingControl = L.Routing.control({
        waypoints: [
          L.latLng(startPosition),
          L.latLng(destinationPosition)
        ],
        routeWhileDragging: true,
        show: true,
        addWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: '#00d4ff', weight: 4 }]
        },
        createMarker: () => null,
      }).addTo(map);

      setRoutingControl(newRoutingControl);

      const distance = calculateDistance(
        startPosition[0],
        startPosition[1],
        destinationPosition[0],
        destinationPosition[1]
      );
      const calculatedFare = calculateFare(distance);
      setFare(calculatedFare);
      if (onFareCalculated) onFareCalculated(calculatedFare);

      const bounds = L.latLngBounds([startPosition, destinationPosition]);
      map.fitBounds(bounds);
    }
  };

  const recenterMap = () => {
    if (map && startPosition) {
      map.setView(startPosition, 13);
    }
  };

  useEffect(() => {
    if (startQuery && destinationQuery) {
      searchLocation(startQuery, setStartPosition, setStartMarker);
      searchLocation(destinationQuery, setDestinationPosition, setDestinationMarker);
    }
  }, [startQuery, destinationQuery, map]);

  useEffect(() => {
    if (startPosition && destinationPosition) {
      handleRoute();
    }
  }, [startPosition, destinationPosition]);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="map-container">
      {showButtons && (
        <>
          <div className="button-group">
            <button onClick={() => searchLocation(startQuery, setStartPosition, setStartMarker)}>
              Set Start
            </button>
            <button onClick={() => searchLocation(destinationQuery, setDestinationPosition, setDestinationMarker)}>
              Set Destination
            </button>
          </div>
          <div className="button-group">
            <button onClick={handleRoute}>Show Route</button>
            <button onClick={recenterMap}>Recenter Map</button>
          </div>
        </>
      )}
      {fare !== null && <p className="fare-display">Estimated Fare: ${fare.toFixed(2)}</p>}
      <div
        id={mapId.current}
        ref={mapContainerRef}
        style={{ width: '100%', height: '300px' }}
      ></div>
    </div>
  );
};

export default MapComponent;