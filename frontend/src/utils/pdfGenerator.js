import html2pdf from 'html2pdf.js';

export const generatePDF = async (offerData) => {
 try {
   const formatDate = (date) => {
     return new Date(date).toLocaleDateString();
   };
   
   const offerNumber = `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
   
   const content = `
     <div style="padding: 20px; font-family: Arial; font-size: 11px;">
       <!-- Header -->
       <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
         <div>
           <h1 style="font-size: 24px; margin: 0;">OFFERT</h1>
           <p style="margin: 2px 0; color: #666;">Nr: ${offerNumber}</p>
         </div>
         <div style="text-align: right;">
           <p style="margin: 0; font-weight: bold;">Hantverkar-AI AB</p>
           <p style="margin: 0;">org.nr: 123456-7890</p>
         </div>
       </div>

       <!-- Info -->
       <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
         <div>
           <p style="margin: 3px 0;"><strong>Kund:</strong> ${offerData.customerName}</p>
           <p style="margin: 3px 0;"><strong>Typ av arbete:</strong> ${offerData.workType}</p>
           <p style="margin: 3px 0;"><strong>Datum:</strong> ${new Date().toLocaleDateString()}</p>
         </div>
         <div style="text-align: right;">
           <p style="margin: 3px 0;"><strong>Giltig till:</strong> ${formatDate(offerData.validUntil)}</p>
           <p style="margin: 3px 0;"><strong>Referens:</strong> ${offerData.reference || '-'}</p>
         </div>
       </div>

       <!-- Arbetsbeskrivning -->
       <div style="margin-bottom: 20px;">
         <h3 style="margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd;">ARBETSBESKRIVNING</h3>
         ${offerData.description.split('\n').map(line => `<p style="margin: 3px 0 3px 10px;">${line}</p>`).join('')}
       </div>

       <!-- Material -->
       <div style="margin-bottom: 20px;">
         <h3 style="margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd;">MATERIAL</h3>
         ${offerData.materials.split('\n').map(line => `<p style="margin: 3px 0 3px 10px;">${line}</p>`).join('')}
       </div>

       <!-- Villkor -->
       <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
         <div>
           <h3 style="margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd;">LEVERANSVILLKOR</h3>
           <p style="margin: 0;">${offerData.deliveryTerms}</p>
         </div>
         <div>
           <h3 style="margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd;">BETALNINGSVILLKOR</h3>
           <p style="margin: 0;">${offerData.paymentTerms}</p>
         </div>
       </div>

       <!-- Kostnadsspecifikation -->
       <div style="margin-bottom: 20px;">
         <h3 style="margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd;">KOSTNADSSPECIFIKATION</h3>
         <table style="width: 100%; border-collapse: collapse;">
           <tr>
             <td style="padding: 8px; border-bottom: 1px solid #ddd;">Timpris:</td>
             <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${offerData.hourlyRate} kr/timme</td>
           </tr>
           <tr>
             <td style="padding: 8px; border-bottom: 1px solid #ddd;">Antal timmar:</td>
             <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${offerData.hours}</td>
           </tr>
           <tr>
             <td style="padding: 8px; border-bottom: 1px solid #ddd;">Arbetskostnad:</td>
             <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${offerData.laborCost || 0} kr</td>
           </tr>
           <tr>
             <td style="padding: 8px; border-bottom: 1px solid #ddd;">Materialkostnad:</td>
             <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${offerData.materialCost || 0} kr</td>
           </tr>
           <tr>
             <td style="padding: 8px; border-bottom: 1px solid #ddd;">Summa ex. moms:</td>
             <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${offerData.totalExVat || 0} kr</td>
           </tr>
           <tr>
             <td style="padding: 8px; border-bottom: 1px solid #ddd;">Moms (25%):</td>
             <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${offerData.vatAmount || 0} kr</td>
           </tr>
           <tr style="background: #2c3e50; color: white;">
             <td style="padding: 10px;">TOTALT INKL. MOMS:</td>
             <td style="padding: 10px; text-align: right; font-weight: bold;">${offerData.totalIncVat || 0} kr</td>
           </tr>
         </table>
       </div>

<!-- Underskrifter -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
  <div>
    <p style="margin: 0 0 5px 0;"><strong>BESTÄLLARE</strong></p>
    <p style="margin: 0 0 25px 0;">Ort och datum: <span style="display: inline-block; width: 200px; border-bottom: 1px solid black;"></span></p>
    <p style="margin: 0 0 25px 0;">Underskrift: <span style="display: inline-block; width: 200px; border-bottom: 1px solid black;"></span></p>
    <p style="margin: 0;">Namnförtydligande: <span style="display: inline-block; width: 200px; border-bottom: 1px solid black;"></span></p>
  </div>
  <div>
    <p style="margin: 0 0 5px 0;"><strong>UTFÖRARE</strong></p>
    <p style="margin: 0 0 25px 0;">Ort och datum: <span style="display: inline-block; width: 200px; border-bottom: 1px solid black;"></span></p>
    <p style="margin: 0 0 25px 0;">Underskrift: <span style="display: inline-block; width: 200px; border-bottom: 1px solid black;"></span></p>
    <p style="margin: 0;">Namnförtydligande: <span style="display: inline-block; width: 200px; border-bottom: 1px solid black;"></span></p>
  </div>
     </div>
   `;

   const opt = {
     margin: 0.5,
     filename: `offert_${offerData.customerName.replace(/\s+/g, '_')}_${offerNumber}.pdf`,
     image: { type: 'jpeg', quality: 1 },
     html2canvas: { scale: 2 },
     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
   };

   await html2pdf().from(content).set(opt).save();

 } catch (error) {
   console.error('PDF generation error:', error);
   throw new Error('Kunde inte skapa PDF. Försök igen.');
 }
};