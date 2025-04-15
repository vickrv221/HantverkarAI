import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const OfferList = ({ offers = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || offer.workType === filterType;
    return matchesSearch && matchesType;
  });

  const exportToExcel = () => {
    const data = offers.map(offer => ({
      'Kundnamn': offer.customerName,
      'Typ av arbete': offer.workType,
      'Timmar': offer.hours,
      'Timpris': offer.pricing?.hourlyRate || 0,
      'Arbetskostnad': offer.pricing?.laborCost || 0,
      'Materialkostnad': offer.pricing?.materialCost || 0,
      'Total': offer.pricing?.total || 0,
      'Datum': new Date(offer.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Offerter");
    XLSX.writeFile(wb, "offerter.xlsx");
  };

  const exportToPDF = () => {
    // Använder befintlig PDF-generator för en sammanställning
    const content = {
      ...offers,
      title: "Offertsammanställning",
      totalAmount: offers.reduce((sum, offer) => sum + (offer.pricing?.total || 0), 0)
    };
    generatePDF(content);
  };

  return (
    <div className="offer-list">
      <h2>Sparade Offerter</h2>
      
      <div className="export-section">
        <h3>Exportera</h3>
        <div className="export-buttons">
          <button onClick={exportToExcel}>Exportera till Excel</button>
        </div>
      </div>

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
      </div>

      <div className="offer-grid">
        {filteredOffers.map((offer) => (
          <div key={offer._id} className="offer-card">
            <h3>{offer.customerName}</h3>
            <p>Typ av arbete: {offer.workType}</p>
            <p>Timmar: {offer.hours}</p>
            <p>Total: {offer.pricing?.total || 0} kr</p>
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