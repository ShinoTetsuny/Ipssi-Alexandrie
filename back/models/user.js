const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: Array, required: true},
    stockageLeft: { type: Number, required: true},
    stockageTotal: { type: Number, required: true},
  }, { versionKey: false });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;