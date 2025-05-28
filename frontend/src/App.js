import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import OfferForm from './components/OfferForm';
import OfferList from './components/OfferList';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { getOffers, deleteOffer, updateOffer, updateOfferStatus } from './services/offerService';
import './styles.css';

/**
 * Huvudkomponent för HantverkarAI-applikationen
 * Hanterar routing, autentisering, tillståndshantering och företagsinställningar
 */
const App = () => {
  // Applikationens grundläggande state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [offers, setOffers] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const [companyName, setCompanyName] = useState(localStorage.getItem('companyName') || 'Hantverkar-AI');
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  // Kontrollera inloggning vid start
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    }
  }, [token]);

  // Ladda offerter när användaren loggar in
  useEffect(() => {
    if (isAuthenticated) {
      loadOffers();
    }
  }, [isAuthenticated]);

  // Ladda alla offerter från backend
  const loadOffers = async () => {
    try {
      const data = await getOffers();
      setOffers(data);
    } catch (error) {
      alert('Kunde inte ladda offerter. Kontrollera din internetanslutning.');
    }
  };

  // Radera offert
  const handleDeleteOffer = async (offerId) => {
    try {
      await deleteOffer(offerId);
      alert('Offert borttagen!');
      await loadOffers();
    } catch (error) {
      alert('Kunde inte ta bort offert. Försök igen senare.');
    }
  };

  // Redigera offert
  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    navigate('/new');
  };

  // Navigera till ny offert
  const handleNewOffer = () => {
    setEditingOffer(null);
    navigate('/new');
  };

  // Avbryt redigering
  const handleCancelEdit = () => {
    setEditingOffer(null);
    navigate('/dashboard');
  };

  // Uppdatera offertstatus
  const handleStatusUpdate = async (offerId, newStatus) => {
    try {
      await updateOfferStatus(offerId, newStatus);
      alert(`Status uppdaterad till: ${newStatus}`);
      await loadOffers();
    } catch (error) {
      alert('Kunde inte uppdatera status. Försök igen senare.');
    }
  };

  // Hantera inloggning
  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    setIsAuthenticated(true);
  };

  // Hantera utloggning
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setOffers([]);
    setEditingOffer(null);
  };

  // Hantera sparande/uppdatering av offert
  const handleSaveOffer = async (offerData) => {
    try {
      if (editingOffer) {
        await updateOffer(editingOffer._id, offerData);
        alert('Offert uppdaterad!');
        setEditingOffer(null);
      } else {
        const response = await fetch('http://localhost:5000/api/offers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(offerData)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Kunde inte spara offerten');
        }
        alert('Offerten har sparats!');
      }
      await loadOffers();
      navigate('/dashboard');
    } catch (error) {
      alert(`Kunde inte spara offerten: ${error.message}`);
    }
  };

  // Visa/hantera företagsinställningar
  const handleOpenSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);

  return (
    <div>
      <Header
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onNewOffer={handleNewOffer}
        companyName={companyName}
        onOpenSettings={handleOpenSettings}
      />

      <main className="container">
        {showSettings && (
          <Settings
            companyName={companyName}
            setCompanyName={setCompanyName}
            onClose={handleCloseSettings}
          />
        )}

        <Routes>
          <Route
            path="/"
            element={!isAuthenticated ?
              <Login onLogin={handleLogin} /> :
              <Navigate to="/dashboard" />
            }
          />
          <Route
            path="/register"
            element={!isAuthenticated ?
              <Register /> :
              <Navigate to="/dashboard" />
            }
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ?
              <Dashboard offers={offers} /> :
              <Navigate to="/" />
            }
          />
          <Route
            path="/offers"
            element={isAuthenticated ?
              <OfferList
                offers={offers}
                onEdit={handleEditOffer}
                onDelete={handleDeleteOffer}
                onStatusUpdate={handleStatusUpdate}
              /> :
              <Navigate to="/" />
            }
          />
<Route 
  path="/new" 
  element={isAuthenticated ? 
    <OfferForm 
      onSave={handleSaveOffer} 
      editOffer={editingOffer}
      onCancelEdit={handleCancelEdit}
      companyName={companyName}
      setCompanyName={setCompanyName}
    /> : 
    <Navigate to="/" />
  } 
/>
        </Routes>
      </main>
    </div>
  );
};

export default App;
