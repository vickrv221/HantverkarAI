import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import OfferForm from './components/OfferForm';
import OfferList from './components/OfferList';
import Login from './components/Login';
import Register from './components/Register';
import './styles.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
  
    useEffect(() => {
      if (token) {
        setIsAuthenticated(true);
      }
    }, [token]);
  
    const handleLogin = (token) => {
      setToken(token);
      setIsAuthenticated(true);
    };
  
    const handleLogout = () => {
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
    };
    
    
    const handleSaveOffer = async (offerData) => {
      try {
        const response = await fetch('http://localhost:5000/api/offers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(offerData)
        });
        
        if (!response.ok) {
          throw new Error('Kunde inte spara offerten');
        }
        
        alert('Offerten har sparats!');
       
        // navigate('/dashboard');
        
      } catch (error) {
        console.error('Error saving offer:', error);
        throw error;
      }
    };
  
    return (
      <div>
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="container">
          <Routes>
            <Route path="/" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={isAuthenticated ? <OfferList /> : <Navigate to="/" />} />
            {/* Skicka handleSaveOffer som onSave-prop */}
            <Route path="/new" element={isAuthenticated ? <OfferForm onSave={handleSaveOffer} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    );
  };
  
  export default App;