import React, { useState } from 'react';

/**
 * Komponent för att ändra företagsnamn
 */
const Settings = ({ companyName, setCompanyName }) => {
  // Local state för textfältet, initieras med nuvarande namn
  const [input, setInput] = useState(companyName);

  // Hantera formulärsubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newName = input.trim() || 'Hantverkar-AI';
    localStorage.setItem('companyName', newName);
    setCompanyName(newName); // Sätter i state
    alert('Företagsnamn sparat!');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
      <label>
        Företagsnamn:
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ marginLeft: 10, marginRight: 10 }}
        />
      </label>
      <button type="submit">Spara</button>
    </form>
  );
};

export default Settings;
