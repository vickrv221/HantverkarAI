import React, { useState, useEffect } from 'react';
import OfferPreview from './OfferPreview';
import { generateDescription, suggestMaterials } from '../utils/aiHelper';
import { calculatePrice } from '../utils/priceCalculator';

const OfferForm = ({ onSave, editOffer = null }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    workType: 'renovation',
    description: '',
    materials: '',
    hours: '',
    hourlyRate: '',
    materialCost: '',
    validUntil: '',
    deliveryTerms: '',
    paymentTerms: '',
    status: 'draft'
  });

  const [showPreview, setShowPreview] = useState(false);

  // Standardvärden för villkor
  const standardTerms = {
    delivery: [
      'Arbetet påbörjas enligt överenskommelse',
      'Leverans sker löpande under arbetets gång',
      'Arbetet beräknas vara klart inom angiven tidsram'
    ],
    payment: [
      'Betalning inom 30 dagar efter fakturadatum',
      'Fakturering sker efter avslutat arbete',
      'Delbetalning kan ske enligt överenskommelse'
    ]
  };

  useEffect(() => {
    if (editOffer) {
      setFormData({
        ...editOffer,
        hours: editOffer.hours.toString()
      });
      setShowPreview(false);
    }
  }, [editOffer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const pricing = calculatePrice(
      formData.workType,
      Number(formData.hours),
      formData.materials
    );
    setFormData(prev => ({
      ...prev,
      pricing: pricing
    }));
    setShowPreview(true);
  };

  const handleChange = (e) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    
    if (e.target.name === 'hours' || e.target.name === 'workType' || 
        e.target.name === 'hourlyRate' || e.target.name === 'materialCost') {
      const laborCost = Number(newData.hours) * Number(newData.hourlyRate);
      const materialCost = Number(newData.materialCost);
      const totalExVat = laborCost + materialCost;
      const vatAmount = totalExVat * 0.25; // 25% moms
      const totalIncVat = totalExVat + vatAmount;

      newData.laborCost = laborCost;
      newData.vatAmount = vatAmount;
      newData.totalExVat = totalExVat;
      newData.totalIncVat = totalIncVat;
    }
    
    setFormData(newData);
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
      setFormData({
        customerName: '',
        description: '',
        materials: '',
        hours: '',
        workType: 'renovation',
        hourlyRate: '',
        materialCost: '',
        validUntil: '',
        deliveryTerms: '',
        paymentTerms: '',
        status: 'draft'
      });
      setShowPreview(false);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Kunde inte spara offerten');
    }
  };

  const handleAIAssist = async () => {
    try {
      const generatedDesc = await generateDescription(formData.description, formData.workType);
      const suggestedMaterials = await suggestMaterials(formData.description, formData.workType);
  
      // Säkra struktur
      const standard = Array.isArray(suggestedMaterials?.standardMaterial)
        ? suggestedMaterials.standardMaterial
        : Array.isArray(suggestedMaterials) // fallback om AI returnerar array direkt
          ? suggestedMaterials
          : [];
  
      const forbrukning = Array.isArray(suggestedMaterials?.forbrukning)
        ? suggestedMaterials.forbrukning
        : ['Rengöringsmedel', 'Skyddsutrustning', 'Tejp och märkning', 'Städmaterial'];
  
      const formattedMaterials = `Standardmaterial:
    ${standard.map(m => `• ${m}`).join('\n')}
    
  Förbrukningsmaterial:
    ${forbrukning.map(m => `• ${m}`).join('\n')}
    
  Alla material uppfyller gällande branschkrav och standarder.`;
  
      setFormData(prev => ({
        ...prev,
        description: generatedDesc,
        materials: formattedMaterials
      }));
    } catch (error) {
      console.error('AI Assist Error:', error);
      alert('Kunde inte generera AI-förslag');
    }
  };

  return (
    <div>
      <h2>{editOffer ? 'Redigera Offert' : 'Ny Offert'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Kundnamn:</label>
          <input 
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Typ av arbete:</label>
          <select 
            name="workType"
            value={formData.workType} 
            onChange={handleChange}
          >
            <option value="renovation">Renovering</option>
            <option value="plumbing">VVS</option>
            <option value="electrical">El</option>
          </select>
        </div>
        <div>
          <label>Beskrivning av arbete:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="ai-assist">
          <button 
            type="button" 
            onClick={handleAIAssist}
            className="ai-button"
          >
            🤖 Generera AI-förslag
          </button>
        </div>
        <div>
          <label>Material:</label>
          <textarea
            name="materials"
            value={formData.materials}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Uppskattade timmar:</label>
          <input
            type="number"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div>
          <label>Timpris:</label>
          <input
            type="number"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div>
          <label>Materialkostnad:</label>
          <input
            type="number"
            name="materialCost"
            value={formData.materialCost}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <div>
          <label>Giltig till:</label>
          <input
            type="date"
            name="validUntil"
            value={formData.validUntil}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Leveransvillkor:</label>
          <select
            name="deliveryTerms"
            value={formData.deliveryTerms}
            onChange={handleChange}
            required
          >
            <option value="">Välj leveransvillkor</option>
            {standardTerms.delivery.map((term, index) => (
              <option key={index} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Betalningsvillkor:</label>
          <select
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            required
          >
            <option value="">Välj betalningsvillkor</option>
            {standardTerms.payment.map((term, index) => (
              <option key={index} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Förhandsgranska Offert</button>
      </form>
      {showPreview && (
        <OfferPreview 
          formData={formData} 
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default OfferForm;