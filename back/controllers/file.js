const multer = require('multer');
const mongoose = require('mongoose');
const File = require('../models/file');
const { getGfsBucket } = require('../database/bdd');

// Set up multer for file upload (using memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const getAllFiles = async (req, res) => {
    try {
      const files = await File.find();
      res.status(200).json(files);
    } catch (error) {
      console.error('Error retrieving all files:', error);
      res.status(500).json({ error: 'Failed to retrieve files' });
    }
  };
  
  // Get file by ID
  const getFile = async (req, res) => {
    try {
      const file = await File.findById(req.params.id);
      if (!file) return res.status(404).json({ message: 'File not found' });
  
      const gfsBucket = getGfsBucket(); // Get the initialized gfsBucket
      const downloadStream = gfsBucket.openDownloadStreamByName(file.name);
  
      downloadStream.on('error', (error) => {
        console.error('Error during file download:', error);
        res.status(404).json({ message: 'File not found in GridFS' });
      });
  
      downloadStream.pipe(res);
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ error: 'Failed to read file' });
    }
  };
  
  // Get files by client
  const getFileByClient = async (req, res) => {
    try {
      const files = await File.find({ client: req.params.client });
      if (!files.length) return res.status(404).json({ message: 'No files found for this client' });
  
      res.status(200).json(files);
    } catch (error) {
      console.error('Error retrieving files by client:', error);
      res.status(500).json({ error: 'Failed to retrieve files' });
    }
  };
  
  // Upload a file
  const uploadFile = async (req, res) => {
    try {
      const { originalname, mimetype, size } = req.file;
  
      const gfsBucket = getGfsBucket(); // Get the initialized gfsBucket
      const uploadStream = gfsBucket.openUploadStream(originalname, {
        contentType: mimetype,
      });
  
      uploadStream.on('error', (error) => {
        console.error('Error uploading file to GridFS:', error);
        return res.status(500).json({ error: 'Failed to store file in GridFS.' });
      });
  
      uploadStream.end(req.file.buffer); // Directly store the file in GridFS
  
      const file = new File({
        name: originalname,
        extension: mimetype.split('/')[1],
        weight: size,
        client: req.body.client,
      });
  
      await file.save();
      res.status(201).json({ file, message: 'File uploaded successfully!' });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'File upload failed.' });
    }
  };
  
  // Update a file (delete old and upload new)
  const updateFile = async (req, res) => {
    try {
      const file = await File.findById(req.params.id);
      if (!file) return res.status(404).json({ message: 'File not found' });
  
      const gfsBucket = getGfsBucket(); // Get the initialized gfsBucket
  
      // Delete the existing file from GridFS
      gfsBucket.delete(new mongoose.Types.ObjectId(file._id), async (err) => {
        if (err) {
          console.error('Error deleting old file from GridFS:', err);
          return res.status(500).json({ message: 'Failed to delete old file' });
        }
  
        // Now upload the new file
        await uploadFile(req, res);
      });
    } catch (error) {
      console.error('Error updating file:', error);
      res.status(500).json({ error: 'Failed to update file' });
    }
  };
  
  // Delete a file
  const deleteFile = async (req, res) => {
    try {
      const file = await File.findById(req.params.id);
      if (!file) return res.status(404).json({ message: 'File not found' });
  
      const gfsBucket = getGfsBucket(); // Get the initialized gfsBucket
  
      gfsBucket.delete(new mongoose.Types.ObjectId(file._id), async (err) => {
        if (err) {
          console.error('Error deleting file from GridFS:', err);
          return res.status(500).json({ message: 'Failed to delete file from GridFS' });
        }
  
        await File.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'File deleted successfully!' });
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  };

module.exports = {
  upload,
  getAllFiles,
  getFile,
  getFileByClient,
  uploadFile,
  updateFile,
  deleteFile,
};
