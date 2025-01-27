const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');

// Autenticar al usuario con JWT y validar el ObjectId
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado. Se requiere un token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!mongoose.Types.ObjectId.isValid(decoded.user.id)) {
      return res.status(400).json({ error: 'ID de usuario no válido.' });
    }

    const user = await User.findById(decoded.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// Autorizar solo administradores (RH)
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado.' });
  }
  next();
};

// Validar ObjectId en los parámetros de la ruta
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de usuario no válido.' });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin, validateObjectId };