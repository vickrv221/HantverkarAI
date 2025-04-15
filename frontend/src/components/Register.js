import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: { name: '', orgNumber: '', phone: '', address: '', email: '' }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        navigate('/');
      } else {
        const data = await response.json();
        alert(data.message || 'Registrering misslyckades');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Ett fel uppstod vid registrering');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Registrera Konto</h2>
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Lösenord:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      </div>
      <h3>Företagsinformation</h3>
      <div>
        <label>Företagsnamn:</label>
        <input type="text" name="company.name" value={formData.company.name} onChange={handleChange} required />
      </div>
      <div>
        <label>Organisationsnummer:</label>
        <input type="text" name="company.orgNumber" value={formData.company.orgNumber} onChange={handleChange} required />
      </div>
      <div>
        <label>Telefon:</label>
        <input type="tel" name="company.phone" value={formData.company.phone} onChange={handleChange} />
      </div>
      <div>
        <label>Adress:</label>
        <input type="text" name="company.address" value={formData.company.address} onChange={handleChange} />
      </div>
      <button type="submit">Registrera</button>
      <p>Har du redan ett konto? <Link to="/">Logga in här</Link></p>
    </form>
  );
};

export default Register;