import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Register-komponent för användarregistrering
 * Samlar in användardata och företagsinformation
 */
const Register = () => {
  const navigate = useNavigate();
  
  // Formulärdata state med nested företagsobjekt
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: { 
      name: '', 
      orgNumber: '', 
      phone: '', 
      address: '', 
      email: '' 
    }
  });

  /**
   * Hanterar formulär-submission och registrering
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Konto skapat! Du kan nu logga in.');
        navigate('/');
      } else {
        const data = await response.json();
        alert(data.message || 'Registrering misslyckades');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Ett tekniskt fel uppstod vid registrering. Försök igen senare.');
    }
  };

  /**
   * Hanterar ändringar i formulärfält, inklusive nested objekt
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Hantera nested company-fält (t.ex. "company.name")
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      // Hantera vanliga fält
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Registrera Konto</h2>
      
      {/* Användarinformation */}
      <div>
        <label>Email:</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          autoComplete="username"
        />
      </div>
      <div>
        <label>Lösenord:</label>
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          required 
          minLength="6"
          autoComplete="new-password"
        />
      </div>
      
      {/* Företagsinformation */}
      <h3>Företagsinformation</h3>
      <div>
        <label>Företagsnamn:</label>
        <input 
          type="text" 
          name="company.name" 
          value={formData.company.name} 
          onChange={handleChange} 
          required 
        />
      </div>
      <div>
        <label>Organisationsnummer:</label>
        <input 
          type="text" 
          name="company.orgNumber" 
          value={formData.company.orgNumber} 
          onChange={handleChange} 
          required 
        />
      </div>
      <div>
        <label>Telefon:</label>
        <input 
          type="tel" 
          name="company.phone" 
          value={formData.company.phone} 
          onChange={handleChange} 
        />
      </div>
      <div>
        <label>Adress:</label>
        <input 
          type="text" 
          name="company.address" 
          value={formData.company.address} 
          onChange={handleChange} 
        />
      </div>
      
      <button type="submit">Registrera</button>
      <p>Har du redan ett konto? <Link to="/">Logga in här</Link></p>
    </form>
  );
};

export default Register;