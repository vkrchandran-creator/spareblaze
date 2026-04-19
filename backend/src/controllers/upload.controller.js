const { success } = require('../utils/apiResponse');

/**
 * Handle multipart/form-data upload.
 * Multer middleware handles saving, so here we just return the URLs.
 */
async function uploadImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      const err = new Error('No files provided.');
      err.status = 400;
      throw err;
    }

    // Construct the public URLs based on the static folder served at /uploads
    const urls = req.files.map(f => `/uploads/${f.filename}`);

    // Standardised success response
    return success(res, { urls }, 'Images uploaded successfully.', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadImages
};
