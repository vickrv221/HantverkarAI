import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Header-komponent med navigering för HantverkarAI
 * @param {boolean} isAuthenticated - Om användaren är inloggad
 * @param {Function} onLogout - Callback för utloggning
 * @param {Function} onNewOffer - Callback för att skapa ny offert
 */
const Header = ({ isAuthenticated, onLogout, onNewOffer }) => {
  return (
    <header>
      <div className="container">
        <h1>Hantverkar-AI</h1>
        <nav>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/offers">Offerter</NavLink>
              <button onClick={onNewOffer} className="nav-button">Ny Offert</button>
              <button onClick={onLogout} className="nav-button logout">Logga ut</button>
            </>
          ) : (
            <>
              <NavLink to="/">Logga in</NavLink>
              <NavLink to="/register">Registrera</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;