const mongoose = require('mongoose');

/**
 * User Schema för HantverkarAI
 * Lagrar användarinformation och företagsdata
 */
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email krävs'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Lösenord krävs'],
    minlength: [6, 'Lösenord måste vara minst 6 tecken']
  },
  company: {
    name: {
      type: String,
      required: [true, 'Företagsnamn krävs']
    },
    orgNumber: String,
    address: String,
    phone: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index för snabbare sökningar
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);