const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['document', 'video'], required: true },
  fileUrl: { type: String, required: true },
  originalFileName: { type: String, required: true },
  roles: { 
    type: [String], 
    enum: ['asesor', 'asesorJR', 'gerente_sucursal', 'gerente_zona', 'admin'], 
    required: true 
  },
  section: { type: String },
  module: { type: String },
  submodule: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Training = mongoose.model('Training', trainingSchema);

module.exports = Training;