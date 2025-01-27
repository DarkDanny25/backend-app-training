const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  roles: { type: [String], enum: ['asesor', 'asesorJR', 'gerente_sucursal', 'gerente_zona', 'admin'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;