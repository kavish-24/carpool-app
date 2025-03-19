import { useState } from 'react';
import mockRides from '../data/mockRides.json';

function RideHistory() {
  const [rides] = useState(mockRides.filter(ride => ride.status === 'past'));

  return (
    <section className="ride-history">
      <h3 style={{ borderBottom: '2px solid var(--neon-blue)' }}>Ride History</h3>
      {rides.length > 0 ? (
        rides.map(ride => (
          <div key={ride.id} className="ride-card" style={{ background: 'var(--dark-gray)', border: '1px solid var(--neon-blue)', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
            <p>{ride.date} - {ride.time}</p>
            <p>{ride.pickUp} to {ride.dropOff}</p>
            <p>Driver: {ride.driver}</p>
          </div>
        ))
      ) : (
        <p>No past rides available.</p>
      )}
      <button style={{ background: 'transparent', border: '1px solid var(--neon-blue)' }}>View All</button>
    </section>
  );
}

export default RideHistory;