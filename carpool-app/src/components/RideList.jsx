import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RideList = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    axios.get(`${apiUrl}/api/rides`)
      .then(response => {
        setRides(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch rides');
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading">Loading rides...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>Available Rides</h2>
      <div className="ride-list">
        {rides.map(ride => (
          <div key={ride._id} className="ride-card">
            <p><strong>Driver:</strong> {ride.driver}</p>
            <p><strong>From:</strong> {ride.startQuery || 'Not specified'}</p>
            <p><strong>To:</strong> {ride.destinationQuery || 'Not specified'}</p>
            <p><strong>Fare:</strong> ${ride.fare?.toFixed(2) || 'Not calculated'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RideList;