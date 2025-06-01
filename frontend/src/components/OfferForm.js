import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import OfferPreview from './OfferPreview';
import { generateDescription, suggestMaterials } from '../utils/aiHelper';
import { calculatePrice } from '../utils/priceCalculator';
import Settings from './Settings';

/**
 * Hjälpfunktion för att formatera materiallistan till textarea-format
 * @param {Object} materialsObj - Objekt med standardMaterial och förbrukning
 * @returns {string}
 */
const formatMaterialsForTextarea = (materialsObj) => {
  if (!materialsObj) return '';
  const { standardMaterial = [], forbrukning = [] } = materialsObj;
  const fmt = (mat) =>
    typeof mat === 'object'
      ? (mat.material || '') + (mat.quantity ? ` (${mat.quantity} st)` : '')
      : mat;
  return `Standardmaterial:\n${standardMaterial.map(fmt).map(m => `• ${m}`).join('\n')}\n\nFörbrukningsmaterial:\n${forbrukning.map(fmt).map(m => `• ${m}`).join('\n')}\n\nAlla material uppfyller gällande branschkrav och standarder.`;
};

/**
 * Komponent för offertformulär
 * @param {Function} onSave - Callback vid sparande
 * @param {Object} editOffer - Data för offert som redigeras (om någon)
 * @param {Function} onCancelEdit - Callback för att avbryta redigering
 * @param {string} companyName - Företagsnamn från appens state
 * @param {Function} setCompanyName - Funktion för att uppdatera företagsnamn i appen
 */
const OfferForm = ({ onSave, editOffer = null, onCancelEdit, companyName, setCompanyName }) => {
  const navigate = useNavigate();

  // State för formulärdata
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
    status: 'draft',
    materialsObj: null
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Standardvillkor för leverans och betalning
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

  // Ladda offert vid redigering, annars nollställ formuläret
  useEffect(() => {
    if (editOffer) {
      setFormData({
        ...editOffer,
        hours: editOffer.hours.toString(),
        materialsObj: editOffer.materialsObj || null,
      });
      setShowPreview(false);
    } else {
      setFormData({
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
        status: 'draft',
        materialsObj: null
      });
      setShowPreview(false);
    }
  }, [editOffer]);

  // Avbryt redigering
  const handleCancelEdit = () => {
    if (onCancelEdit) onCancelEdit();
    else navigate('/dashboard');
  };

  // Vid förhandsgranskning: räkna ut pris och visa preview
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

  // Hantera ändringar i formulärfälten
  const handleChange = (e) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value
    };

    if (
      e.target.name === 'hours' ||
      e.target.name === 'workType' ||
      e.target.name === 'hourlyRate' ||
      e.target.name === 'materialCost'
    ) {
      const laborCost = Number(newData.hours) * Number(newData.hourlyRate);
      const materialCost = Number(newData.materialCost);
      const totalExVat = laborCost + materialCost;
      const vatAmount = totalExVat * 0.25;
      const totalIncVat = totalExVat + vatAmount;

      newData.laborCost = laborCost;
      newData.vatAmount = vatAmount;
      newData.totalExVat = totalExVat;
      newData.totalIncVat = totalIncVat;
    }

    setFormData(newData);
  };

  // Spara offert
  const handleSave = async () => {
    try {
      await onSave(formData);
      if (!editOffer) {
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
          status: 'draft',
          materialsObj: null
        });
      }
      setShowPreview(false);
    } catch (error) {
      alert('Kunde inte spara offerten');
    }
  };

  // Generera arbetsbeskrivning/material med AI
  const handleAIAssist = async () => {
    if (!formData.description.trim()) {
      alert('Du måste fylla i en beskrivning av arbetet för att använda AI-förslag.');
      return;
    }
    try {
      const generatedDesc = await generateDescription(formData.description, formData.workType);
      const suggestedMaterials = await suggestMaterials(formData.description, formData.workType);

      const standard = Array.isArray(suggestedMaterials?.standardMaterial)
        ? suggestedMaterials.standardMaterial
        : Array.isArray(suggestedMaterials)
          ? suggestedMaterials
          : [];
      const forbrukning = Array.isArray(suggestedMaterials?.forbrukning)
        ? suggestedMaterials.forbrukning
        : ['Rengöringsmedel', 'Skyddsutrustning', 'Tejp och märkning', 'Städmaterial'];

      setFormData(prev => ({
        ...prev,
        description: generatedDesc,
        materials: formatMaterialsForTextarea({ standardMaterial: standard, forbrukning }),
        materialsObj: { standardMaterial: standard, forbrukning }
      }));
    } catch (error) {
      alert('Kunde inte generera AI-förslag');
    }
  };

  return (
    <div>
      {/* Inställningsknapp och företagsnamnsbyte */}
      <button 
  onClick={() => setShowSettings(s => !s)} 
  style={{ marginBottom: '12px', width: 'auto', maxWidth: '200px' }}
>
  {showSettings ? 'Stäng inställningar' : 'Företagsinställningar'}
</button>
      {showSettings && <Settings companyName={companyName} setCompanyName={setCompanyName} />}

      <div style={{ marginBottom: '12px' }}>
        <b>Aktivt företagsnamn:</b> {companyName}
      </div>

      <h2>{editOffer ? 'Redigera Offert' : 'Ny Offert'}</h2>
      {editOffer && (
        <button
          type="button"
          onClick={handleCancelEdit}
          style={{ marginBottom: '20px', backgroundColor: '#ccc' }}
        >
          Avbryt redigering
        </button>
      )}

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
            Generera AI-förslag
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
          companyName={companyName}
        />
      )}
    </div>
  );
};

export default OfferForm;
