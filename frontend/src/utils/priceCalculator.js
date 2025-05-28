/**
 * Prisberäkningsfunktioner för offerter
 * Hanterar automatisk beräkning av arbetskostnader baserat på arbetstyp
 */

/**
 * Beräknar totalpris för offert baserat på arbetstyp och timmar
 * @param {string} workType - Typ av arbete (renovation, plumbing, electrical)
 * @param {number} hours - Antal arbetstimmar
 * @param {string} materials - Materialbeskrivning (används ej i nuvarande beräkning)
 * @returns {Object} - Objekt med priskomponenter
 */
export const calculatePrice = (workType, hours, materials) => {
  // Grundtimpriser för olika arbetstyper
  const hourlyRates = {
    renovation: 500,
    plumbing: 650,
    electrical: 700
  };

  const baseRate = hourlyRates[workType] || 500;
  const laborCost = hours * baseRate;
  // Materialkostnad uppskattas till 30% av arbetskostnaden
  const materialCost = hours * baseRate * 0.3;

  return {
    hourlyRate: baseRate,
    laborCost: laborCost,
    materialCost: materialCost,
    total: laborCost + materialCost
  };
};