import React, { useState } from 'react';
import EmailForm from './EmailForm';
import { generatePDF } from '../utils/pdfGenerator';

// Hjälpfunktion: Byter ut placeholders mot riktiga namn och tar bort onödiga signaturer
const processDescription = (desc, customerName, companyName) => {
  if (!desc) return '';
  return desc
    .replace(/\[Kundens namn\]|\[Kundens Namn\]|\[Kund\]/gi, customerName)
    .replace(/\[Byggföretagets Namn\]|\[Företagsnamn\]|\[Ditt Företagsnamn\]|\[Företagets Namn\]|\[Byggföretaget\]/gi, companyName)
    // Ta bort rad som bara är företagsnamnet, med eller utan whitespace
    .replace(new RegExp(`^\\s*${companyName}\\s*$\\n?`, 'm'), '')
    // Ta bort rad som bara är placeholder/variant för företagsnamn (t.ex. [Ditt Företags Namn])
    .replace(/^\s*\[[^\]]*företags[^\]]*\]\s*$/gim, '')
    // Tar bort signaturer i arbetsbeskrivningen (om det av misstag klistras in)
    .replace(/Med vänliga hälsningar[.,]*\s*\[.*?\](\s*\[.*?\])*/gi, '')
    .replace(/Med vänlig hälsning[.,]*\s*\[.*?\](\s*\[.*?\])*/gi, '')
    .replace(/\[Namn\]|\[Position\]|\[Kontaktinformation\]|\[Byggföretaget\]|\[Ert Företagsnamn\]/gi, '')
    // Rensa upp överflödiga tomrader
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const OfferPreview = ({
  formData,
  onSave,
  companyName = '',
  companyContact = ''
}) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // Formaterar datum enligt svensk standard
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('sv-SE') : '';

  // Skapar offerttext för export/kopiering
  const generateOfferText = () => `
Företag: ${companyName}
Kund: ${formData.customerName}
Typ av arbete: ${formData.workType}
Datum: ${formatDate(new Date())}
Giltig till: ${formatDate(formData.validUntil)}

Arbetsbeskrivning
${processDescription(formData.description, formData.customerName, companyName)}

Material
${formData.materials}

Leveransvillkor
${formData.deliveryTerms}

Betalningsvillkor
${formData.paymentTerms}

Kostnadsspecifikation
Timpris: ${formData.hourlyRate} kr/timme
Antal timmar: ${formData.hours}
Arbetskostnad: ${formData.laborCost || 0} kr
Materialkostnad: ${formData.materialCost || 0} kr
Summa ex. moms: ${formData.totalExVat || 0} kr
Moms (25%): ${formData.vatAmount || 0} kr
TOTALT INKL. MOMS: ${formData.totalIncVat || 0} kr

Moms ingår i alla priser.
Offerten är giltig till och med ${formatDate(formData.validUntil)}

Med vänliga hälsningar,

${companyName}
${companyContact ? companyContact : ''}
`.trim();

  // Exporterar till PDF
  const handleGeneratePDF = async () => {
    try {
      setIsLoading(true);
      await generatePDF({
        ...formData,
        description: processDescription(formData.description, formData.customerName, companyName),
        materials: formData.materials,
        companyName,
        companyContact
      });
    } catch (error) {
      alert('Det uppstod ett fel vid skapande av PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="offer-preview" style={{ marginTop: 24 }}>
      <h3>Förhandsvisning</h3>
      <div><b>Företag:</b> {companyName}</div>
      <div><b>Kund:</b> {formData.customerName}</div>
      <div><b>Typ av arbete:</b> {formData.workType}</div>
      <div><b>Datum:</b> {formatDate(new Date())}</div>
      <div><b>Giltig till:</b> {formatDate(formData.validUntil)}</div>

      <h4>Arbetsbeskrivning</h4>
      <div style={{ whiteSpace: 'pre-line' }}>
        {processDescription(formData.description, formData.customerName, companyName)}
      </div>

      <h4>Material</h4>
      <div style={{ whiteSpace: 'pre-line' }}>
        {formData.materials}
      </div>

      <h4>Leveransvillkor</h4>
      <div>{formData.deliveryTerms}</div>

      <h4>Betalningsvillkor</h4>
      <div>{formData.paymentTerms}</div>

      <h4>Kostnadsspecifikation</h4>
      <div>
        Timpris: {formData.hourlyRate} kr/timme<br />
        Antal timmar: {formData.hours}<br />
        Arbetskostnad: {formData.laborCost || 0} kr<br />
        Materialkostnad: {formData.materialCost || 0} kr<br />
        Summa ex. moms: {formData.totalExVat || 0} kr<br />
        Moms (25%): {formData.vatAmount || 0} kr<br />
        <b>TOTALT INKL. MOMS: {formData.totalIncVat || 0} kr</b>
      </div>
      <div style={{ marginTop: 8 }}>
        Moms ingår i alla priser.<br />
        Offerten är giltig till och med {formatDate(formData.validUntil)}
      </div>

      {/* Avslutande signatur */}
      <div style={{ marginTop: 24 }}>
        Med vänliga hälsningar,<br /><br />
        {companyName}
        {companyContact && (
          <>
            <br />
            {companyContact}
          </>
        )}
      </div>

      {/* Aktionsknappar */}
      <div className="preview-actions" style={{ marginTop: 24 }}>
        <button onClick={onSave}>Spara Offert</button>
        <button onClick={() => setShowEmailForm(true)}>Skicka till Kund</button>
        <button onClick={handleGeneratePDF} disabled={isLoading}>
          {isLoading ? 'Skapar PDF...' : 'Exportera PDF'}
        </button>
        <button onClick={() => setShowRaw(s => !s)}>
          {showRaw ? 'Dölj offerttext' : 'Visa offerttext för kopiering'}
        </button>
      </div>

      {showRaw && (
        <div style={{ background: '#fafafa', border: '1px solid #eee', marginTop: 16, padding: 12 }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            {generateOfferText()}
          </pre>
        </div>
      )}

      {showEmailForm && (
        <EmailForm
          offer={formData}
          companyName={companyName}
          companyContact={companyContact}
          onClose={() => setShowEmailForm(false)}
        />
      )}
    </div>
  );
};

export default OfferPreview;
