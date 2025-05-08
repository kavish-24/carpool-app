import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ user, sessionId }) => {
  const [bookedRides, setBookedRides] = useState([]);
  const [createdRides, setCreatedRides] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsError, setWsError] = useState(null);
  const [editingRide, setEditingRide] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Fetch booked rides
    axios.get(`${apiUrl}/api/rides?bookedById=${user.id}`, {
      headers: { Authorization: `Bearer ${sessionId}` }
    })
      .then(response => {
        setBookedRides(response.data);
      })
      .catch(err => {
        setError('Failed to fetch booked rides');
      });

    // Fetch created rides
    axios.get(`${apiUrl}/api/rides?createdById=${user.id}`, {
      headers: { Authorization: `Bearer ${sessionId}` }
    })
      .then(response => {
        setCreatedRides(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch created rides');
        setLoading(false);
      });

    // Set up WebSocket with reconnection logic
    let ws;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectInterval = 5000;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:8080');
        ws.onopen = () => {
          console.log('WebSocket connected for notifications');
          setWsError(null);
          reconnectAttempts = 0;
        };
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'rideBooked' && data.driverId === user.id) {
            setNotification({
              message: `Your ride has been booked by ${data.user.name}!`,
              user: data.user
            });
          }
        };
        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          setWsError('Failed to connect to notifications server. Real-time updates may not work.');
        };
        ws.onclose = () => {
          console.log('WebSocket connection closed');
          if (reconnectAttempts < maxReconnectAttempts) {
            setTimeout(() => {
              console.log(`Reconnecting WebSocket (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
              reconnectAttempts++;
              connectWebSocket();
            }, reconnectInterval);
          } else {
            setWsError('Unable to connect to notifications server after multiple attempts. Real-time updates may not work.');
          }
        };
      } catch (err) {
        console.error('WebSocket setup error:', err);
        setWsError('Failed to set up notifications. Real-time updates may not work.');
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, [user.id, sessionId]);

  const handleDeleteRide = async (rideId) => {
    if (!confirm('Are you sure you want to delete this ride?')) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    try {
      await axios.delete(`${apiUrl}/api/rides/${rideId}`, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      setCreatedRides(prevRides => prevRides.filter(ride => ride._id !== rideId));
      alert('Ride deleted successfully!');
    } catch (err) {
      console.error('Error deleting ride:', err);
      alert('Failed to delete ride');
    }
  };

  const handleEditRide = (ride) => {
    setEditingRide({ ...ride });
  };

  const handleUpdateRide = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    try {
      const updatedRide = {
        startQuery: editingRide.startQuery,
        destinationQuery: editingRide.destinationQuery,
        seatCapacity: parseInt(editingRide.seatCapacity),
        vehicleNumber: editingRide.vehicleNumber,
        fare: editingRide.fare,
        timings: editingRide.timings
      };
      await axios.put(`${apiUrl}/api/rides/${editingRide._id}`, updatedRide, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      setCreatedRides(prevRides =>
        prevRides.map(ride =>
          ride._id === editingRide._id ? { ...ride, ...updatedRide } : ride
        )
      );
      setEditingRide(null);
      alert('Ride updated successfully!');
    } catch (err) {
      console.error('Error updating ride:', err);
      alert('Failed to update ride');
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>

      {wsError && <p className="error">{wsError}</p>}

      {notification && (
        <div className="notification">
          <h3>Notification</h3>
          <p>{notification.message}</p>
          <p><strong>Booked By:</strong> {notification.user.name}</p>
          <p><strong>Email:</strong> {notification.user.email}</p>
        </div>
      )}

      <h3>Created Rides</h3>
      <div className="ride-list">
        {createdRides.length > 0 ? (
          createdRides.map(ride => (
            <div key={ride._id} className="ride-card">
              <p><strong>Driver:</strong> {ride.driver}</p>
              <p><strong>From:</strong> {ride.startQuery}</p>
              <p><strong>To:</strong> {ride.destinationQuery}</p>
              <p><strong>Fare:</strong> ${ride.fare?.toFixed(2)}</p>
              <p><strong>Seats:</strong> {ride.seatCapacity}</p>
              <p><strong>Vehicle:</strong> {ride.vehicleNumber}</p>
              <p><strong>Departure Time:</strong> {ride.timings ? new Date(ride.timings).toLocaleString() : 'Not specified'}</p>
              {ride.bookedBy && ride.bookedBy.id !== user.id && (
                <p><strong>Booked By:</strong> {ride.bookedBy.name} ({ride.bookedBy.email})</p>
              )}
              <button onClick={() => handleEditRide(ride)}>Edit</button>
              <button onClick={() => handleDeleteRide(ride._id)} style={{ marginLeft: '10px', background: '#ff4444' }}>
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No rides created.</p>
        )}
      </div>

      {editingRide && (
        <div className="edit-form">
          <h3>Edit Ride</h3>
          <form onSubmit={handleUpdateRide}>
            <input
              type="text"
              value={editingRide.startQuery}
              onChange={(e) => setEditingRide({ ...editingRide, startQuery: e.target.value })}
              placeholder="Starting Location"
              required
            />
            <input
              type="text"
              value={editingRide.destinationQuery}
              onChange={(e) => setEditingRide({ ...editingRide, destinationQuery: e.target.value })}
              placeholder="Destination"
              required
            />
            <input
              type="number"
              value={editingRide.seatCapacity}
              onChange={(e) => setEditingRide({ ...editingRide, seatCapacity: e.target.value })}
              placeholder="Seat Capacity"
              required
            />
            <input
              type="text"
              value={editingRide.vehicleNumber}
              onChange={(e) => setEditingRide({ ...editingRide, vehicleNumber: e.target.value })}
              placeholder="Vehicle Number"
              required
            />
            <input
              type="number"
              value={editingRide.fare}
              onChange={(e) => setEditingRide({ ...editingRide, fare: parseFloat(e.target.value) })}
              placeholder="Fare"
              required
            />
            <input
              type="datetime-local"
              value={editingRide.timings}
              onChange={(e) => setEditingRide({ ...editingRide, timings: e.target.value })}
              placeholder="Departure Time"
              required
            />
            <button type="submit">Update Ride</button>
            <button type="button" onClick={() => setEditingRide(null)} style={{ marginLeft: '10px', background: '#ff4444' }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <h3>Booked Rides</h3>
      <div className="ride-list">
        {bookedRides.length > 0 ? (
          bookedRides.map(ride => (
            <div key={ride._id} className="ride-card">
              <p><strong>Driver:</strong> {ride.driver}</p>
              <p><strong>From:</strong> {ride.startQuery}</p>
              <p><strong>To:</strong> {ride.destinationQuery}</p>
              <p><strong>Fare:</strong> ${ride.fare?.toFixed(2)}</p>
              <p><strong>Seats:</strong> {ride.seatCapacity}</p>
              <p><strong>Vehicle:</strong> {ride.vehicleNumber}</p>
              <p><strong>Departure Time:</strong> {ride.timings ? new Date(ride.timings).toLocaleString() : 'Not specified'}</p>
            </div>
          ))
        ) : (
          <p>No booked rides found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;