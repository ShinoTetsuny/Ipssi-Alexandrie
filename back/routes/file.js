const express = require('express');
const { 
  upload, 
  uploadFile, 
  getFile, 
  getFileByClient, 
  getAllFiles, 
  updateFile, 
  deleteFile,
  getStats
} = require('../controllers/file');

const router = express.Router();

// File upload for facturation
router.post('/facturation', upload.single('file'), uploadFile);

// File upload
router.post('/upload', upload.single('file'), uploadFile);

// Get stats
router.get('/stats', getStats)

// Get all files
router.get('/', getAllFiles);

// Get file by ID
router.get('/:id', getFile);

// Get files by client
router.get('/client/:client', getFileByClient);

// Update file
router.put('/:id', upload.single('file'), updateFile);

// Delete file
router.delete('/:id',deleteFile);

module.exports = router;
