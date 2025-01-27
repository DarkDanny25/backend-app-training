const express = require('express');
const path = require('path');
const fs = require('fs');
const Training = require('../models/training');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/uploads');

const router = express.Router();

// Crear material (solo admin)
router.post('/', authenticate, authorizeAdmin, upload.single('file'), async (req, res) => {
  const { title, description, type, roles, section, module, submodule } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Debe subir un archivo' });
  }

  try {
    // Verificar si ya existe un material con el mismo título, sección y módulo
    const existingTraining = await Training.findOne({ title, section, module });
    if (existingTraining) {
      return res.status(400).json({ error: 'Ya existe un material con el mismo título, sección y módulo' });
    }

    const newTraining = new Training({
      title,
      description,
      type,
      fileUrl: `/uploads/${req.file.filename}`,
      originalFileName: req.file.originalname,
      roles,
      section: section || '',
      module: module || '',
      submodule: submodule || '',
    });

    await newTraining.save();
    res.status(201).json({ message: 'Material de capacitación creado exitosamente', training: newTraining });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el material de capacitación' });
  }
});

// Obtener materiales (diferenciando por rol y organizando por sección)
router.get('/', authenticate, async (req, res) => {
  try {
    const trainings = req.user.role === 'admin' ? await Training.find() : await Training.find({ roles: req.user.role });

    const groupedData = trainings.reduce((acc, training) => {
      const { section, module, submodule } = training;

      if (!acc[section]) acc[section] = {};
      if (!acc[section][module]) acc[section][module] = [];

      acc[section][module].push({
        ...training.toObject(),
        submodule: submodule || null,
      });

      return acc;
    }, {});

    res.json(groupedData);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los materiales de capacitación' });
  }
});

// Obtener un material específico por ID
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const training = await Training.findById(id);

    if (!training) {
      return res.status(404).json({ error: 'Material de capacitación no encontrado.' });
    }

    if (req.user.role === 'admin' || training.roles.includes(req.user.role)) {
      return res.json(training);
    }

    res.status(403).json({ error: 'Acceso denegado. No tiene permisos para ver este material.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el material de capacitación.' });
  }
});

// Actualizar material (solo admin)
router.put('/:id', authenticate, authorizeAdmin, upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const { title, description, type, roles, section, module, submodule } = req.body;

  try {
    const training = await Training.findById(id);
    if (!training) {
      return res.status(404).json({ error: 'Material de capacitación no encontrado' });
    }

    if (req.file) {
      const oldFilePath = path.join(__dirname, '../', training.fileUrl);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

      training.fileUrl = `/uploads/${req.file.filename}`;
      training.originalFileName = req.file.originalname;
    }

    training.title = title || training.title;
    training.description = description || training.description;
    training.type = type || training.type;
    training.roles = roles || training.roles;
    training.section = section !== undefined ? (section === '' ? '' : section) : training.section;
    training.module = module !== undefined ? (module === '' ? '' : module) : training.module;
    training.submodule = submodule !== undefined ? (submodule === '' ? '' : submodule) : training.submodule;

    await training.save();
    res.json({ message: 'Material de capacitación actualizado', training });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el material de capacitación' });
  }
});

// Eliminar material (solo admin)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTraining = await Training.findByIdAndDelete(id);

    if (!deletedTraining) {
      return res.status(404).json({ error: 'Material de capacitación no encontrado' });
    }

    const filePath = path.join(__dirname, '../', deletedTraining.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: 'Material de capacitación eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el material de capacitación' });
  }
});

module.exports = router;