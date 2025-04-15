import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert('Fyll i både e-post och lösenord!');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.token) {
        onLogin(data.token);
      } else {
        alert(data.message || 'Inloggning misslyckades. Kontrollera e-post och lösenord.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Tekniskt fel vid inloggning');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Logga in</h2>
      <div>
        <label>Email:</label>
        <input 
          type="email"
          name="email"
          value={formData.email}
          autoComplete="username"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      <div>
        <label>Lösenord:</label>
        <input 
          type="password"
          name="password"
          value={formData.password}
          autoComplete="current-password"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      <button type="submit">Logga in</button>
      <p>Inget konto? <Link to="/register">Registrera här</Link></p>
    </form>
  );
};

export default Login;
