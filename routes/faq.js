const express = require('express');
const FAQ = require('../models/faq');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');
const router = express.Router();

// Crear FAQ (solo admin)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  const { question, answer, roles } = req.body;
  
  try {
    // Verificar si ya existe un FAQ con la misma pregunta y roles
    const existingFAQ = await FAQ.findOne({ question, roles });
    if (existingFAQ) {
      return res.status(400).json({ error: 'Ya existe un FAQ con la misma pregunta y roles' });
    }

    const newFAQ = new FAQ({ question, answer, roles });
    await newFAQ.save();
    res.status(201).json({ message: 'FAQ creado exitosamente', faq: newFAQ });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el FAQ' });
  }
});

// Obtener FAQs (diferenciando por rol)
router.get('/', authenticate, async (req, res) => {
  try {
    const faqs = req.user.role === 'admin' ? await FAQ.find() : await FAQ.find({ roles: req.user.role });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los FAQs' });
  }
});

// Obtener un FAQ por su ID (diferenciando por rol)
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).json({ error: 'FAQ no encontrado' });

    if (req.user.role !== 'admin' && !faq.roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para ver este FAQ' });
    }

    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el FAQ' });
  }
});

// Actualizar FAQ (solo admin)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { question, answer, roles } = req.body;
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(id, { question, answer, roles }, { new: true, runValidators: true });
    if (!updatedFAQ) return res.status(404).json({ error: 'FAQ no encontrado' });
    res.json({ message: 'FAQ actualizado', faq: updatedFAQ });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el FAQ' });
  }
});

// Eliminar FAQ (solo admin)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedFAQ = await FAQ.findByIdAndDelete(id);
    if (!deletedFAQ) return res.status(404).json({ error: 'FAQ no encontrado' });
    res.json({ message: 'FAQ eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el FAQ' });
  }
});

module.exports = router;