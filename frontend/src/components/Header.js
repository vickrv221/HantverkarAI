import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = ({ isAuthenticated, onLogout }) => {
  return (
    <header>
      <div className="container">
        <h1>Hantverkar-AI</h1>
        <nav>
          {isAuthenticated ? (
            <>
              <NavLink to="/new">Ny Offert</NavLink>
              <NavLink to="/">Visa Offerter</NavLink>
              <button onClick={onLogout}>Logga ut</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Logga in</NavLink>
              <NavLink to="/register">Registrera</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;