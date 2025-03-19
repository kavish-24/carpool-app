import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {user ? (
            <>
              <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link></li>
              <li><Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>Search</Link></li>
              <li><Link to="/create-ride" className={location.pathname === '/create-ride' ? 'active' : ''}>Create Ride</Link></li>
              <li><Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Profile</Link></li>
              <li><button onClick={onLogout} className="logout-btn">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link></li>
              <li><Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;