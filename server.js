const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const userRoutes = require('./routes/user');
const trainingRoutes = require('./routes/training');
const faqRoutes = require('./routes/faq');

dotenv.config();
const app = express();

// Middleware para parseo de JSON y habilitación de CORS
app.use(express.json());
app.use(cors());

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch(() => console.error('Error al conectar a MongoDB'));

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/faqs', faqRoutes);

// Configuración del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));