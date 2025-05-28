import React, { useState } from 'react';
import * as XLSX from 'xlsx';

/**
 * OfferList-komponent som visar lista över sparade offerter
 * @param {Array} offers - Array av offert-objekt
 * @param {Function} onEdit - Callback för redigering av offert
 * @param {Function} onDelete - Callback för borttagning av offert  
 * @param {Function} onStatusUpdate - Callback för statusuppdatering
 */
const OfferList = ({ offers = [], onEdit, onDelete, onStatusUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Översättning av statusvärden
  const statusLabels = {
    'draft': 'Utkast',
    'sent': 'Skickad',
    'accepted': 'Accepterad',
    'rejected': 'Avvisad'
  };

  // Färgkodning för statusar
  const statusColors = {
    'draft': '#ffc107',
    'sent': '#17a2b8',
    'accepted': '#28a745',
    'rejected': '#dc3545'
  };

  // Filtrera offerter baserat på sökterm, typ och status
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || offer.workType === filterType;
    const matchesStatus = filterStatus === 'all' || offer.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  /**
   * Hanterar statusändring för en offert
   */
  const handleStatusChange = async (offerId, newStatus) => {
    try {
      await onStatusUpdate(offerId, newStatus);
    } catch (error) {
      alert('Kunde inte uppdatera status');
    }
  };

  /**
   * Exporterar offertdata till Excel-fil
   */
  const exportToExcel = () => {
    const data = offers.map(offer => ({
      'Kundnamn': offer.customerName,
      'Typ av arbete': offer.workType,
      'Status': statusLabels[offer.status],
      'Timmar': offer.hours,
      'Timpris': offer.hourlyRate || 0,
      'Arbetskostnad': offer.laborCost || 0,
      'Materialkostnad': offer.materialCost || 0,
      'Total': offer.totalIncVat || 0,
      'Datum': new Date(offer.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Offerter");
    XLSX.writeFile(wb, "offerter.xlsx");
  };

  return (
    <div className="offer-list">
      <h2>Sparade Offerter ({offers.length})</h2>
      
      {/* Export-sektion */}
      <div className="export-section">
        <h3>Exportera</h3>
        <div className="export-buttons">
          <button onClick={exportToExcel}>Exportera till Excel</button>
        </div>
      </div>

      {/* Sök- och filteralternativ */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Sök på kundnamn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Alla typer</option>
          <option value="renovation">Renovering</option>
          <option value="plumbing">VVS</option>
          <option value="electrical">El</option>
        </select>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Alla statusar</option>
          <option value="draft">Utkast</option>
          <option value="sent">Skickad</option>
          <option value="accepted">Accepterad</option>
          <option value="rejected">Avvisad</option>
        </select>
      </div>

      {/* Grid med offert-kort */}
      <div className="offer-grid">
        {filteredOffers.map((offer) => (
          <div key={offer._id} className="offer-card">
            <h3>{offer.customerName}</h3>
            <p>Typ av arbete: {offer.workType}</p>
            <p>Timmar: {offer.hours}</p>
            <p>Total: {offer.totalIncVat || 0} kr</p>
            
            {/* Status-sektion med färgkodad badge */}
            <div className="status-section" style={{ margin: '10px 0' }}>
              <div style={{ marginBottom: '5px' }}>
                <span 
                  className="status-badge" 
                  style={{ 
                    backgroundColor: statusColors[offer.status], 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {statusLabels[offer.status]}
                </span>
              </div>
              
              {/* Dropdown för statusändring */}
              <div className="status-controls">
                <label style={{ fontSize: '12px' }}>Ändra status:</label>
                <select 
                  value={offer.status} 
                  onChange={(e) => handleStatusChange(offer._id, e.target.value)}
                  style={{ marginLeft: '5px', fontSize: '12px' }}
                >
                  <option value="draft">Utkast</option>
                  <option value="sent">Skickad</option>
                  <option value="accepted">Accepterad</option>
                  <option value="rejected">Avvisad</option>
                </select>
              </div>
            </div>
            
            {/* Åtgärdsknappar */}
            <div className="offer-actions">
              <button onClick={() => onEdit(offer)}>Redigera</button>
              <button 
                onClick={() => {
                  if (window.confirm('Är du säker på att du vill ta bort denna offert?')) {
                    onDelete(offer._id);
                  }
                }}
                className="delete-button"
              >
                Ta bort
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfferList;