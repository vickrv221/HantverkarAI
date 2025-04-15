import React, { useState } from 'react';
import EmailForm from './EmailForm';
import { generatePDF } from '../utils/pdfGenerator';

const OfferPreview = ({ formData, onSave }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const generateOfferText = () => {
    const { pricing } = formData;
  
    return `
      OFFERT
      
      Kund: ${formData.customerName}
      Typ av arbete: ${formData.workType}
      Datum: ${new Date().toLocaleDateString()}
      Giltig till: ${formatDate(formData.validUntil)}
  
      ARBETSBESKRIVNING
      ${formData.description}
  
      MATERIAL
      ${formData.materials}

      LEVERANSVILLKOR
      ${formData.deliveryTerms}

      BETALNINGSVILLKOR
      ${formData.paymentTerms}
  
      KOSTNADSSPECIFIKATION
      Timpris: ${formData.hourlyRate} kr/timme
      Antal timmar: ${formData.hours}
      Arbetskostnad: ${formData.laborCost || 0} kr
      Materialkostnad: ${formData.materialCost || 0} kr
      
      Summa ex. moms: ${formData.totalExVat || 0} kr
      Moms (25%): ${formData.vatAmount || 0} kr
      
      TOTALT INKL. MOMS: ${formData.totalIncVat || 0} kr
      
      Moms ingår i alla priser
      Offerten är giltig till och med ${formatDate(formData.validUntil)}
    `;
  };
  
  const handleGeneratePDF = async () => {
    try {
      setIsLoading(true);
      await generatePDF(formData);
    } catch (error) {
      alert('Det uppstod ett fel när PDF skulle skapas. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="offer-preview">
      <h3>Förhandsvisning</h3>
      <pre>{generateOfferText()}</pre>
      <div className="preview-actions">
        <button onClick={onSave}>Spara Offert</button>
        <button onClick={() => setShowEmailForm(true)}>Skicka till Kund</button>
        <button 
          onClick={handleGeneratePDF} 
          disabled={isLoading}
        >
          {isLoading ? 'Skapar PDF...' : 'Exportera PDF'}
        </button>
      </div>
      
      {showEmailForm && (
        <EmailForm 
          offer={formData}
          onClose={() => setShowEmailForm(false)}
        />
      )}
    </div>
  );
};

export default OfferPreview;