import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mockRides from '../data/mockRides.json';

function ActiveRides() {
  const [rides] = useState(mockRides.filter(ride => ride.status === 'active'));
  const navigate = useNavigate();

  const handleBook = () => {
    navigate('/confirmation');
  };

  return (
    <section className="active-rides">
      <h3 style={{ borderBottom: '2px solid var(--neon-purple)' }}>Active Rides</h3>
      {rides.length > 0 ? (
        rides.map(ride => (
          <div key={ride.id} className="ride-card" style={{ background: 'var(--dark-gray)', border: '1px solid var(--neon-purple)', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
            <p>{ride.date} - {ride.time}</p>
            <p>{ride.pickUp} to {ride.dropOff}</p>
            <p>Driver: {ride.driver}</p>
            <button onClick={handleBook}>Book a Ride</button>
          </div>
        ))
      ) : (
        <p>No active rides available.</p>
      )}
    </section>
  );
}

export default ActiveRides;