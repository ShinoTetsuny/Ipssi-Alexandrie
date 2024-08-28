const multer = require('multer');
const mongoose = require('mongoose');
const File = require('../models/file');
const { getGfsBucket } = require('../database/bdd');
const { updateStockageLeft, isStorageAvailable } = require('./user');

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
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
  
      const gfsBucket = getGfsBucket();
      const downloadStream = gfsBucket.openDownloadStreamByName(file.name);
  
      // Set Content-Type and Content-Disposition headers
      res.set('Content-Type', file.extension === 'pdf' ? 'application/pdf' : file.contentType);
      res.set('Content-Disposition', `attachment; filename="${file.name}"`);
  
      // Handle stream errors
      downloadStream.on('error', (error) => {
        console.error('Error during file download:', error);
        res.status(404).json({ message: 'File not found in GridFS' });
      });
  
      // Pipe the download stream to the response
      downloadStream.pipe(res);
  
      downloadStream.on('end', () => {
        res.end();
      });
  
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
      const clientId = req.body.client; // Assume client ID is sent in the request body
  
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
        client: clientId,
      });
  
        if (!(await isStorageAvailable(clientId, size))) {
            return res.status(400).json({ message: 'Not enough storage space' });
        }else{
            await file.save();
            // Update the user's storage space
            updateStockageLeft(clientId, size);
        
            res.status(201).json({ file, message: 'File uploaded successfully!' });
                }
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
      // Find the file metadata in MongoDB
      const file = await File.findById(req.params.id);
      if (!file) {
        console.error('File not found in database');
        return res.status(404).json({ message: 'File not found' });
      }
  
      const gfsBucket = getGfsBucket(); // Get the initialized gfsBucket
  
      // Find the GridFS file metadata by file name
      const files = await gfsBucket.find({ filename: file.name }).toArray();
      if (!files.length) {
        console.error('File not found in GridFS');
        return res.status(404).json({ message: 'File not found in GridFS' });
      }
  
      // Extract the GridFS fileId
      const gridFSFileId = files[0]._id;
  
      // Delete the file from GridFS
      await File.findByIdAndDelete(req.params.id);
      gfsBucket.delete(gridFSFileId, async (err) => {
          if (err) {
              console.error('Error deleting file from GridFS:', err);
              return res.status(500).json({ message: 'Failed to delete file from GridFS' });
            }  
            
            // Update the user's storage space
            
        });
        updateStockageLeft(file.client, -file.weight); // Add space back
        console.log('File and metadata deleted successfully');
        res.status(200).json({ message: 'File deleted successfully!' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  };
  
  // Delete all files for a specific client
const deleteFilesFromClient = async (clientId) => {
    try {
      // Find all files associated with the client
      const files = await File.find({ client: clientId });
      if (!files.length) {
        console.error('No files found for the client');
        return { success: false, message: 'No files found for this client' };
      }
  
      const gfsBucket = getGfsBucket(); // Get the initialized gfsBucket
  
      // Calculate total size of all files to update storage
      const totalSize = files.reduce((acc, file) => acc + file.weight, 0);
  
      // Delete each file's data and metadata
      for (const file of files) {
        // Find the GridFS file metadata by file name
        const gridFSFiles = await gfsBucket.find({ filename: file.name }).toArray();
        if (!gridFSFiles.length) {
          console.error(`File ${file.name} not found in GridFS`);
          continue; // Skip to the next file
        }
  
        // Extract the GridFS fileId
        const gridFSFileId = gridFSFiles[0]._id;
  
        // Delete the file from GridFS
        await gfsBucket.delete(gridFSFileId);
  
        // Delete the file metadata from MongoDB
        await File.findByIdAndDelete(file._id);
      }
  
      // Update the user's storage space
      await updateStockageLeft(clientId, -totalSize);
  
      console.log(`All files for client ${clientId} deleted successfully`);
      return { success: true, message: `All files for client ${clientId} deleted successfully` };
    } catch (error) {
      console.error('Error deleting files for client:', error);
      return { success: false, message: 'Failed to delete files for client' };
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
    deleteFilesFromClient,
};
