const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento en disco local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

// Filtrar archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx', '.pptx', '.mp4'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedTypes.includes(ext)) {
    return cb(new Error('Tipo de archivo no permitido'), false);
  }
  cb(null, true);
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = upload;