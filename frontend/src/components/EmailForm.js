import React, { useState } from 'react';

const EmailForm = ({ offer, onClose }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulera sändning
    await new Promise(resolve => setTimeout(resolve, 1000));
    
      
    setSending(false);
    onClose();
    alert(`Offert skickad till ${email}`);
  };

  return (
    <div className="email-form-overlay">
      <div className="email-form">
        <h3>Skicka Offert</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Kundens E-post:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="email-actions">
            <button type="button" onClick={onClose}>Avbryt</button>
            <button type="submit" disabled={sending}>
              {sending ? 'Skickar...' : 'Skicka'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailForm;