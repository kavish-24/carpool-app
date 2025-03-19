import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';

const Dashboard = ({ user, sessionId }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState({});

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    axios.get(`${apiUrl}/api/rides`, {
      headers: { Authorization: `Bearer ${sessionId}` }
    })
      .then(response => {
        setRides(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch rides');
        setLoading(false);
      });
  }, [sessionId]);

  const handleBookRide = async (rideId) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    try {
      const response = await axios.put(`${apiUrl}/api/rides/${rideId}/book`, {}, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      console.log('Ride booked:', response.data);
      setRides(prevRides => prevRides.filter(ride => ride._id !== rideId));
    } catch (err) {
      console.error('Error booking ride:', err);
      alert('Failed to book ride');
    }
  };

  const toggleMap = (rideId) => {
    setShowMap(prev => ({
      ...prev,
      [rideId]: !prev[rideId]
    }));
  };

  if (loading) return <p className="loading">Loading rides...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name || 'User'}!</p>
      <h3>Available Rides</h3>
      <div className="ride-list">
        {rides.length > 0 ? (
          rides.map(ride => (
            <div key={ride._id} className="ride-card">
              <p><strong>Driver:</strong> {ride.driver}</p>
              <p><strong>From:</strong> {ride.startQuery || 'Not specified'}</p>
              <p><strong>To:</strong> {ride.destinationQuery || 'Not specified'}</p>
              <p><strong>Fare:</strong> ${ride.fare?.toFixed(2) || 'Not calculated'}</p>
              <p><strong>Seats:</strong> {ride.seatCapacity || 'Not specified'}</p>
              <p><strong>Vehicle:</strong> {ride.vehicleNumber || 'Not specified'}</p>
              <p><strong>Departure Time:</strong> {ride.departureTime ? new Date(ride.departureTime).toLocaleString() : 'Not specified'}</p>
              <button onClick={() => toggleMap(ride._id)}>
                {showMap[ride._id] ? 'Hide Route' : 'Show Route'}
              </button>
              {showMap[ride._id] && (
                <MapComponent
                  startQuery={ride.startQuery}
                  destinationQuery={ride.destinationQuery}
                  showButtons={false}
                />
              )}
              <button onClick={() => handleBookRide(ride._id)}>Book Ride</button>
            </div>
          ))
        ) : (
          <p>No available rides found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;