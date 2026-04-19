const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controller = require('../controllers/upload.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

const UPLOAD_DIR = path.join(__dirname, '../../../frontend/public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// POST /api/v1/upload (admin only)
router.post('/', auth, admin, upload.array('images', 10), controller.uploadImages);

module.exports = router;
