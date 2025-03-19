import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import CreateRide from './pages/CreateRide';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles.css';

function App() {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session validity on app load
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    const storedUser = localStorage.getItem('user');

    if (storedSessionId && storedUser) {
      console.log('Verifying session with sessionId:', storedSessionId);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      fetch(`${apiUrl}/api/rides`, {
        headers: {
          'Authorization': `Bearer ${storedSessionId}`
        }
      })
        .then(response => {
          console.log('Session verification response:', response.status);
          if (response.ok) {
            setSessionId(storedSessionId);
            setUser(JSON.parse(storedUser));
          } else {
            console.log('Session invalid, clearing local storage');
            localStorage.removeItem('sessionId');
            localStorage.removeItem('user');
            setSessionId(null);
            setUser(null);
          }
        })
        .catch(err => {
          console.error('Error verifying session:', err);
          localStorage.removeItem('sessionId');
          localStorage.removeItem('user');
          setSessionId(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      console.log('No session found in local storage');
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (sessionId, userData) => {
    console.log('Logging in with sessionId:', sessionId, 'and user:', userData);
    // Clear any existing session before setting a new one
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('user', JSON.stringify(userData));
    setSessionId(sessionId);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('Logging out with sessionId:', sessionId);
      await fetch(`${apiUrl}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
    } catch (err) {
      console.error('Error logging out:', err);
    }
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    setSessionId(null);
    setUser(null);
  };

  // Custom component to access location
  const AppContent = () => {
    const location = useLocation();
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

    return (
      <div className="app">
        {!isAuthRoute && <Sidebar user={user} onLogout={handleLogout} />}
        <main className={isAuthRoute ? 'auth-content' : 'main-content'}>
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/search" element={user ? <Search user={user} sessionId={sessionId} /> : <Navigate to="/login" />} />
            <Route path="/create-ride" element={user ? <CreateRide user={user} sessionId={sessionId} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile user={user} sessionId={sessionId} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;