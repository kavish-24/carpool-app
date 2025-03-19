import React, { useState } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';

const CreateRide = ({ user, sessionId }) => {
  const [startQuery, setStartQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [seatCapacity, setSeatCapacity] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fare, setFare] = useState(null);
  const [departureTime, setDepartureTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const newRide = {
      startQuery,
      destinationQuery,
      seatCapacity: parseInt(seatCapacity),
      vehicleNumber,
      fare,
      departureTime // Include departureTime in the ride object
    };
    axios.post(`${apiUrl}/api/rides`, newRide, {
      headers: { Authorization: `Bearer ${sessionId}` }
    })
      .then(response => {
        console.log('Ride created:', response.data);
        setStartQuery('');
        setDestinationQuery('');
        setSeatCapacity('');
        setVehicleNumber('');
        setFare(null);
        setDepartureTime('');
        alert('Ride created successfully!');
      })
      .catch(error => {
        console.error('Error creating ride:', error);
        alert('Failed to create ride.');
      });
  };

  return (
    <div>
      <h2>Create a Ride</h2>
      <form onSubmit={handleSubmit}>
        <p><strong>Driver:</strong> {user.name}</p>
        <input
          type="text"
          value={startQuery}
          onChange={(e) => setStartQuery(e.target.value)}
          placeholder="Starting Location"
          required
        />
        <input
          type="text"
          value={destinationQuery}
          onChange={(e) => setDestinationQuery(e.target.value)}
          placeholder="Destination"
          required
        />
        <input
          type="number"
          value={seatCapacity}
          onChange={(e) => setSeatCapacity(e.target.value)}
          placeholder="Seat Capacity"
          required
        />
        <input
          type="text"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          placeholder="Vehicle Number"
          required
        />
        <input
          type="datetime-local"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
          placeholder="Departure Time"
          required
        />
        <button type="submit">Create Ride</button>
      </form>
      <MapComponent
        startQuery={startQuery}
        destinationQuery={destinationQuery}
        onFareCalculated={(calculatedFare) => setFare(calculatedFare)}
        showButtons={true}
      />
    </div>
  );
};

export default CreateRide;