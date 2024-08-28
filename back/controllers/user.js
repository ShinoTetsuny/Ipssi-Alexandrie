const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.createUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      stockageLeft: req.body.stockageTotal,
      stockageTotal: req.body.stockageTotal,
    });
    const result = await user.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ error });
    }
  };

exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) throw new Error('User not found');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) throw new Error('User not found');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
    if (!user) throw new Error('User not found');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id });
    if (!user) throw new Error('User not found');
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.isStorageAvailable = async (userId, weight) => {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    console.log('User found:', user);
    console.log('Weight:', weight);
    if (user.stockageLeft < weight) {
      return false;
    }
    return true;
  }
  catch (error) {
    console.error('Error checking user storage space:', error);
  }
}

exports.updateStockageLeft = async (userId, weight) => {
  try {
    const user = await User.findOne({ _id: userId
    });
    if (!user) throw new Error('User not found');
    console.log('User found:', user);
    console.log('Weight:', weight);
    user.stockageLeft -= weight;
    await user.save();
  }
  catch (error) {
    console.error('Error updating user storage space:', error);
  }
}