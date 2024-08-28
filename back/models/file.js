const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  extension: { type: String, required: true },
  weight: { type: Number, required: true },
  client: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
