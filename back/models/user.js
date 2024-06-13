const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: Array, required: true},
    stockageLeft: { type: Number, required: true},
    stockageTotal: { type: Number, required: true},
  }, { versionKey: false });

const User = mongoose.model('User', userSchema);

module.exports = User;