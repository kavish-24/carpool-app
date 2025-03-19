import React, { useState } from 'react';
import axios from 'axios';

const EditRide = ({ rideId, currentData }) => {
  const [driver, setDriver] = useState(currentData.driver);
  const [pickUp, setPickUp] = useState(currentData.pickUp);
  const [dropOff, setDropOff] = useState(currentData.dropOff);

  const handleUpdate = () => {
    const updatedRide = { driver, pickUp, dropOff };
    axios.put(`${apiUrl}/api/rides/${rideId}`, updatedRide)
      .then(response => {
        console.log('Ride updated:', response.data);
        // Optionally, notify the user or refresh the list
      })
      .catch(error => {
        console.error('Error updating ride:', error);
      });
  };

  return (
    <div>
      <input
        type="text"
        value={driver}
        onChange={(e) => setDriver(e.target.value)}
      />
      <input
        type="text"
        value={pickUp}
        onChange={(e) => setPickUp(e.target.value)}
      />
      <input
        type="text"
        value={dropOff}
        onChange={(e) => setDropOff(e.target.value)}
      />
      <button onClick={handleUpdate}>Save Changes</button>
    </div>
  );
};

export default EditRide;