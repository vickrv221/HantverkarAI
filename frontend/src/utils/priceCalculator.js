// src/utils/priceCalculator.js
export const calculatePrice = (workType, hours, materials) => {
  const hourlyRates = {
    renovation: 500,
    plumbing: 650,
    electrical: 700
  };

  const baseRate = hourlyRates[workType] || 500;
  const laborCost = hours * baseRate;
  const materialCost = hours * baseRate * 0.3; // 30% av arbetskostnaden som materialkostnad

  return {
    hourlyRate: baseRate,
    laborCost: laborCost,
    materialCost: materialCost,
    total: laborCost + materialCost
  };
};