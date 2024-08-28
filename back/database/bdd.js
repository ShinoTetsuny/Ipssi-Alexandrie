const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfsBucket;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/Alexandrie');

    gfsBucket = new GridFSBucket(conn.connection.db, {
      bucketName: 'uploads',
    });
    console.log('GridFSBucket initialized and connected to MongoDB');
    console.log('Connexion à MongoDB réussie !');
  } catch (error) {
    console.log('Connexion à MongoDB échouée !');
    process.exit(1);
  }

};

const getGfsBucket = () => {
  if (!gfsBucket) {
    throw new Error('GridFSBucket is not initialized. Please wait for the database connection.');
  }
  return gfsBucket;
};

module.exports = { connectDB, getGfsBucket };