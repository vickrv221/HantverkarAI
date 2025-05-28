const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  // userId för att koppla till användare
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Grundläggande info
  customerName: { type: String, required: true },
  workType: { type: String, required: true },
  
  // Specifikation
  description: { type: String, required: true },
  materials: { type: String, required: true },
  
  // Priser och tider
  hours: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  materialCost: { type: Number, required: true },
  
  // Juridiska krav
  validUntil: { type: Date, required: true },
  deliveryTerms: { type: String, required: true },
  paymentTerms: { type: String, required: true },
  
  // Beräknade fält
  laborCost: Number,
  vatRate: { type: Number, default: 25 },
  vatAmount: Number,
  totalExVat: Number,
  totalIncVat: Number,
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' }
});

module.exports = mongoose.model('Offer', offerSchema);