const express = require('express');
const { 
  upload, 
  uploadFile, 
  getFile, 
  getFileByClient, 
  getAllFiles, 
  updateFile, 
  deleteFile 
} = require('../controllers/file');

const router = express.Router();

// File upload
router.post('/upload', upload.single('file'), uploadFile);

// Get all files
router.get('/', getAllFiles);

// Get file by ID
router.get('/:id', getFile);

// Get files by client
router.get('/client/:client', getFileByClient);

// Update file
router.put('/:id', upload.single('file'), updateFile);

// Delete file
router.delete('/:id', deleteFile);

module.exports = router;
